import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { User } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private activityService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, activityService: ActivityService);
    validateUser(email: string, password: string, tenant?: any): Promise<User | null>;
    login(loginDto: LoginDto, tenant?: any, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
    refresh(userId: number): Promise<RefreshResponseDto>;
    generateTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    logout(userId: number, tenantId?: number, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    validateJwtToken(token: string): Promise<any>;
}
