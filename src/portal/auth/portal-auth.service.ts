import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { ActivityService } from '../../activity/activity.service';
import { PortalLoginDto, PortalLoginResponseDto, PortalUserResponseDto } from '../dto/auth.dto';
import { User, PortalSession } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Authenticate user for portal access
   */
  async login(
    loginDto: PortalLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PortalLoginResponseDto> {
    const correlationId = `portal-login-${Date.now()}`;

    this.logger.log('Portal login attempt', {
      correlationId,
      email: loginDto.email,
      ipAddress,
    });

    try {
      // 1. Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        include: { tenant: true },
      });

      if (!user) {
        this.logger.warn('Portal login failed - user not found', {
          correlationId,
          email: loginDto.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2. Check if user is active
      if (!user.isActive) {
        this.logger.warn('Portal login failed - user inactive', {
          correlationId,
          userId: user.id,
          email: user.email,
        });
        throw new UnauthorizedException('Account is disabled');
      }

      // 3. Check if user has portal access
      if (!user.portalAccess) {
        this.logger.warn('Portal login failed - no portal access', {
          correlationId,
          userId: user.id,
          email: user.email,
        });
        throw new ForbiddenException('Portal access not enabled for this account');
      }

      // 4. Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn('Portal login failed - invalid password', {
          correlationId,
          userId: user.id,
          email: user.email,
        });

        // Log failed login activity
        await this.activityService.logActivity({
          userId: user.id,
          tenantId: user.tenantId || undefined,
          action: 'portal_login_failed',
          details: 'Invalid password',
          ipAddress,
          userAgent,
        });

        throw new UnauthorizedException('Invalid credentials');
      }

      // 5. Create portal session
      const sessionToken = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const portalSession = await this.prisma.portalSession.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
          ipAddress,
          userAgent,
        },
      });

      // 6. Generate JWT token for API authentication
      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        sessionId: portalSession.id,
        portalAccess: true,
      };

      const accessToken = this.jwtService.sign(jwtPayload);

      // 7. Log successful login
      await this.activityService.logActivity({
        userId: user.id,
        tenantId: user.tenantId || undefined,
        action: 'portal_login',
        details: 'Successful portal login',
        ipAddress,
        userAgent,
      });

      this.logger.log('Portal login successful', {
        correlationId,
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      return {
        token: accessToken,
        expiresAt: portalSession.expiresAt,
        user: this.transformUserToDto(user),
      };
    } catch (error) {
      this.logger.error('Portal login error', {
        correlationId,
        email: loginDto.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(userId: number, sessionId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const correlationId = `portal-logout-${Date.now()}`;

    this.logger.log('Portal logout attempt', {
      correlationId,
      userId,
      sessionId,
    });

    try {
      // Delete specific session if provided, otherwise delete all sessions for user
      if (sessionId) {
        await this.prisma.portalSession.deleteMany({
          where: {
            id: sessionId,
            userId,
          },
        });
      } else {
        await this.prisma.portalSession.deleteMany({
          where: { userId },
        });
      }

      // Log logout activity
      await this.activityService.logActivity({
        userId,
        action: 'portal_logout',
        details: 'Portal logout',
        ipAddress,
        userAgent,
      });

      this.logger.log('Portal logout successful', {
        correlationId,
        userId,
        sessionId,
      });
    } catch (error) {
      this.logger.error('Portal logout error', {
        correlationId,
        userId,
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getMe(userId: number): Promise<PortalUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.portalAccess) {
      throw new ForbiddenException('Portal access not enabled');
    }

    return this.transformUserToDto(user);
  }

  /**
   * Validate portal session
   */
  async validateSession(token: string): Promise<User | null> {
    try {
      const session = await this.prisma.portalSession.findUnique({
        where: { token },
        include: { user: { include: { tenant: true } } },
      });

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        // Delete expired session
        await this.prisma.portalSession.delete({
          where: { id: session.id },
        });
        return null;
      }

      // Check if user is still active and has portal access
      if (!session.user.isActive || !session.user.portalAccess) {
        return null;
      }

      return session.user;
    } catch (error) {
      this.logger.error('Session validation error', {
        token: token.substring(0, 8) + '...',
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Clean up expired sessions (can be called by cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.portalSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired portal sessions`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions', {
        error: error.message,
      });
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number): Promise<PortalSession[]> {
    return this.prisma.portalSession.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate a cryptographically secure token
   */
  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Transform User entity to DTO
   */
  private transformUserToDto(user: User): PortalUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      portalAccess: user.portalAccess,
      isActive: user.isActive,
      tenantId: user.tenantId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}