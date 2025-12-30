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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-tenant.decorator';
import { TenantsService } from '../tenants/tenants.service';
import { Logger, BadRequestException, UnauthorizedException, Get } from '@nestjs/common';

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
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain for multi-tenant login (e.g., demo.softellio.com)',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid tenant information or authentication failed' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: any }> {
    // Enhanced host extraction with priority order and reserved domain checking
    const host = this.extractHost(request);
    let tenant = null;

    if (host) {
      // Check for reserved domains that should never be used for tenant resolution
      if (this.isReservedDomain(host)) {
        this.logger.debug(`Reserved domain detected: ${host}`);
        // For reserved domains, allow both SUPER_ADMIN and TENANT_ADMIN login
        // since admin portals (portal/platform) need TENANT_ADMIN access
        // TenantGuard will handle proper access control after authentication
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

    // For reserved domains or SUPER_ADMIN role, tenant is optional
    // For regular domains, tenant is required for non-SUPER_ADMIN users
    if (!tenant && loginDto.email && !this.isSuperAdminEmail(loginDto.email) && !this.isReservedDomain(host)) {
      throw new BadRequestException('Tenant information is required for this login');
    }

    // Extract IP address and user agent for activity logging
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    const result = await this.authService.login(loginDto, tenant, ipAddress, userAgent);

    // Set JWT access token as HTTP-only cookie
    response.cookie('auth_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: result.user };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'admin@softellio.com' },
            name: { type: 'string', example: 'Admin User' },
            role: { type: 'string', example: 'SUPER_ADMIN' },
            tenantId: { type: 'number', example: null }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Req() request: Request) {
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('No auth token found');
    }

    const user = await this.authService.validateJwtToken(token);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId
      }
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ ok: boolean }> {
    // Clear auth_token cookie
    response.clearCookie('auth_token', {
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    // Optional: Log logout activity if we can extract user from token
    try {
      const token = this.extractTokenFromCookie(request);
      if (token) {
        const user = await this.authService.validateJwtToken(token);
        const ipAddress = this.getClientIp(request);
        const userAgent = request.headers['user-agent'];
        await this.authService.logout(user.id, user.tenantId, ipAddress, userAgent);
      }
    } catch (error) {
      // Ignore errors in logout activity logging
    }

    return { ok: true };
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

  /**
   * Extract client IP address from request headers
   */
  private getClientIp(request: Request): string {
    // Priority: X-Forwarded-For, X-Real-IP, connection.remoteAddress
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0].trim();
    }

    const xRealIp = request.headers['x-real-ip'];
    if (xRealIp) {
      return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    }

    // Fallback to connection remote address
    return request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           'unknown';
  }

  /**
   * Extract JWT token from auth_token cookie
   */
  private extractTokenFromCookie(request: Request): string | null {
    const cookies = request.cookies;
    return cookies?.auth_token || null;
  }
}