import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private activityService: ActivityService,
  ) {}

  async validateUser(email: string, password: string, tenant?: any): Promise<User | null> {
    // Build query conditions
    const whereConditions: any = {
      email,
      isActive: true
    };

    // If tenant is provided, add tenant filter
    if (tenant) {
      whereConditions.tenantId = tenant.id;
    }

    const user = await this.prisma.user.findFirst({
      where: whereConditions,
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(
    loginDto: LoginDto,
    tenant?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password, tenant);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    // Log successful login activity
    try {
      await this.activityService.logActivity({
        userId: user.id,
        tenantId: user.tenantId,
        action: 'login',
        details: `Successful login for user ${user.email}`,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      // Log error but don't block the login process
      console.error('Failed to log login activity:', error);
    }

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
      },
    };
  }

  async refresh(userId: number): Promise<RefreshResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn as any,
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: expiresIn as any,
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async logout(userId: number, tenantId?: number, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    // Log logout activity
    try {
      await this.activityService.logActivity({
        userId,
        tenantId,
        action: 'logout',
        details: 'User logged out',
        ipAddress,
        userAgent,
      });
    } catch (error) {
      // Log error but don't block the logout process
      console.error('Failed to log logout activity:', error);
    }

    return { message: 'Logged out successfully' };
  }

  async validateJwtToken(token: string): Promise<any> {
    try {
      this.logger.debug('Validating JWT token:', {
        tokenLength: token?.length || 0,
        tokenPreview: token?.substring(0, 50) + '...'
      });

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.debug('JWT payload decoded successfully:', {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        exp: payload.exp,
        iat: payload.iat
      });

      // Get user from database to ensure they're still active
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          isActive: true
        }
      });

      if (!user) {
        this.logger.warn('User not found or inactive during token validation:', {
          userId: payload.sub,
          email: payload.email
        });
        throw new UnauthorizedException('User not found or inactive');
      }

      this.logger.debug('JWT validation successful for user:', {
        userId: user.id,
        email: user.email
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId
      };
    } catch (error) {
      this.logger.error('JWT validation failed:', {
        error: error.message,
        errorName: error.name,
        tokenLength: token?.length || 0,
        tokenPreview: token?.substring(0, 50) + '...'
      });

      // Check for specific JWT error types
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not yet valid');
      } else if (error instanceof UnauthorizedException) {
        // Re-throw our own UnauthorizedException (like user not found)
        throw error;
      } else {
        // Generic error
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}