import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-tenant.decorator';
import { TenantsService } from '../tenants/tenants.service';
import { Logger, BadRequestException } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private tenantsService: TenantsService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    // Enhanced host extraction with priority order and reserved domain checking
    const host = this.extractHost(request);
    let tenant = null;

    if (host) {
      // Check for reserved domains that should never be used for tenant resolution
      if (this.isReservedDomain(host)) {
        this.logger.debug(`Reserved domain detected: ${host}`);
        // For reserved domains, only allow SUPER_ADMIN login
        if (!this.isSuperAdminEmail(loginDto.email)) {
          throw new BadRequestException(`Domain ${host} is reserved for SUPER_ADMIN access only`);
        }
      } else {
        // Use TenantsService for tenant resolution
        tenant = await this.tenantsService.findByDomain(host);
        if (tenant) {
          this.logger.debug(`Tenant resolved for login: ${tenant.slug} (${tenant.id})`);
        } else {
          this.logger.error(`Tenant resolution failed for host ${host}: No tenant found`);
          throw new BadRequestException(`Unable to resolve tenant for domain: ${host}`);
        }
      }
    }

    // For SUPER_ADMIN role, tenant is optional. For others, tenant is required.
    if (!tenant && loginDto.email && !this.isSuperAdminEmail(loginDto.email)) {
      throw new BadRequestException('Tenant information is required for this login');
    }

    const result = await this.authService.login(loginDto, tenant);

    // Generate refresh token and set as HTTP-only cookie
    const tokens = await this.authService.generateTokens({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      tenantId: result.user.tenantId,
      password: '', // Not needed for token generation
      isActive: result.user.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Set refresh token as HTTP-only cookie
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('refresh')
  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() user: any): Promise<RefreshResponseDto> {
    return this.authService.refresh(user.id);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    // Clear refresh token cookie
    response.clearCookie('refreshToken');

    return this.authService.logout();
  }

  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  async me(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
  }

  /**
   * Extract host from request headers with priority order
   */
  private extractHost(request: Request): string | null {
    // Priority: X-Tenant-Host, X-Forwarded-Host, Host
    const rawHost = (
      request.headers['x-tenant-host'] ||
      request.headers['x-forwarded-host'] ||
      request.headers.host
    ) as string;

    if (!rawHost) return null;

    // Strip port number and normalize: demo.softellio.com:443 -> demo.softellio.com
    return rawHost.toLowerCase().split(':')[0];
  }

  /**
   * Check if domain is reserved and should never be used for tenant resolution
   */
  private isReservedDomain(domain: string): boolean {
    const reservedDomains = [
      'platform.softellio.com',
      'portal.softellio.com',
      'localhost',
      'api.softellio.com',
      'admin.softellio.com',
      'connect.softellio.com',
      'app.softellio.com',
      'dashboard.softellio.com',
      'mail.softellio.com'
    ];

    return reservedDomains.includes(domain);
  }

  /**
   * Check if email is for SUPER_ADMIN (can login without tenant)
   */
  private isSuperAdminEmail(email: string): boolean {
    // Check if email is for SUPER_ADMIN (can login without tenant)
    return email && email.endsWith('@softellio.com');
  }
}