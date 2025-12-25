"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
const activity_service_1 = require("../activity/activity.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, activityService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.activityService = activityService;
    }
    async validateUser(email, password, tenant) {
        const whereConditions = {
            email,
            isActive: true
        };
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
    async login(loginDto, tenant, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.email, loginDto.password, tenant);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user);
        try {
            await this.activityService.logActivity({
                userId: user.id,
                tenantId: user.tenantId,
                action: 'login',
                details: `Successful login for user ${user.email}`,
                ipAddress,
                userAgent,
            });
        }
        catch (error) {
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
    async refresh(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const accessToken = await this.generateAccessToken(user);
        return { accessToken };
    }
    async generateTokens(user) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const expiresIn = this.configService.get('JWT_EXPIRES_IN') || '15m';
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: expiresIn,
        });
    }
    async generateRefreshToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
        };
        const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: expiresIn,
        });
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }
    async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    async logout(userId, tenantId, ipAddress, userAgent) {
        try {
            await this.activityService.logActivity({
                userId,
                tenantId,
                action: 'logout',
                details: 'User logged out',
                ipAddress,
                userAgent,
            });
        }
        catch (error) {
            console.error('Failed to log logout activity:', error);
        }
        return { message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        activity_service_1.ActivityService])
], AuthService);
//# sourceMappingURL=auth.service.js.map