import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PortalAuthService } from './portal-auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-tenant.decorator';
import {
  PortalLoginDto,
  PortalLoginResponseDto,
  PortalUserResponseDto,
} from '../dto/auth.dto';

@ApiTags('Portal Authentication')
@Controller('portal/auth')
export class PortalAuthController {
  private readonly logger = new Logger(PortalAuthController.name);

  constructor(private readonly portalAuthService: PortalAuthService) {}

  /**
   * Portal login endpoint
   */
  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Portal login',
    description: 'Authenticate user for portal access. User must have portalAccess = true.',
  })
  @ApiBody({ type: PortalLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: PortalLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account disabled',
  })
  @ApiResponse({
    status: 403,
    description: 'Portal access not enabled for this account',
  })
  async login(
    @Body() loginDto: PortalLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PortalLoginResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `portal-login-${Date.now()}`;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    this.logger.log('Portal login request', {
      correlationId,
      email: loginDto.email,
      ipAddress,
    });

    try {
      const result = await this.portalAuthService.login(
        loginDto,
        ipAddress,
        userAgent,
      );

      // Set secure HTTP-only cookie for session management (optional)
      res.cookie('portal_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? '.softellio.com' : undefined,
      });

      this.logger.log('Portal login successful', {
        correlationId,
        userId: result.user.id,
        email: result.user.email,
      });

      return result;
    } catch (error) {
      this.logger.error('Portal login failed', {
        correlationId,
        email: loginDto.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Portal logout endpoint
   */
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Portal logout',
    description: 'Logout user and invalidate portal session',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const correlationId = req.headers['x-correlation-id'] as string || `portal-logout-${Date.now()}`;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const sessionId = user.sessionId; // From JWT payload

    this.logger.log('Portal logout request', {
      correlationId,
      userId: user.id,
    });

    try {
      await this.portalAuthService.logout(
        user.id,
        sessionId,
        ipAddress,
        userAgent,
      );

      // Clear the portal token cookie
      res.clearCookie('portal_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.softellio.com' : undefined,
      });

      this.logger.log('Portal logout successful', {
        correlationId,
        userId: user.id,
      });

      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error('Portal logout failed', {
        correlationId,
        userId: user.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get current user information
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get authenticated portal user information',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: PortalUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Portal access not enabled',
  })
  async getMe(
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<PortalUserResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `portal-me-${Date.now()}`;

    this.logger.log('Portal me request', {
      correlationId,
      userId: user.id,
    });

    try {
      const userInfo = await this.portalAuthService.getMe(user.id);

      this.logger.log('Portal me successful', {
        correlationId,
        userId: user.id,
        email: userInfo.email,
      });

      return userInfo;
    } catch (error) {
      this.logger.error('Portal me failed', {
        correlationId,
        userId: user.id,
        error: error.message,
      });
      throw error;
    }
  }
}