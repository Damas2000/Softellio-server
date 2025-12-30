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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const tenants_service_1 = require("../tenants/tenants.service");
const common_2 = require("@nestjs/common");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, tenantsService) {
        this.authService = authService;
        this.tenantsService = tenantsService;
        this.logger = new common_2.Logger(AuthController_1.name);
    }
    async login(loginDto, request, response) {
        const host = this.extractHost(request);
        let tenant = null;
        if (host) {
            if (this.isReservedDomain(host)) {
                this.logger.debug(`Reserved domain detected: ${host}`);
            }
            else {
                tenant = await this.tenantsService.findByDomain(host);
                if (tenant) {
                    this.logger.debug(`Tenant resolved for login: ${tenant.slug} (${tenant.id})`);
                }
                else {
                    this.logger.error(`Tenant resolution failed for host ${host}: No tenant found`);
                    throw new common_2.BadRequestException(`Unable to resolve tenant for domain: ${host}`);
                }
            }
        }
        if (!tenant && loginDto.email && !this.isSuperAdminEmail(loginDto.email) && !this.isReservedDomain(host)) {
            throw new common_2.BadRequestException('Tenant information is required for this login');
        }
        const ipAddress = this.getClientIp(request);
        const userAgent = request.headers['user-agent'];
        const result = await this.authService.login(loginDto, tenant, ipAddress, userAgent);
        response.cookie('auth_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { user: result.user };
    }
    async me(request) {
        const token = this.extractTokenFromCookie(request);
        if (!token) {
            throw new common_2.UnauthorizedException('No auth token found');
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
    async logout(request, response) {
        response.clearCookie('auth_token', {
            path: '/',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        try {
            const token = this.extractTokenFromCookie(request);
            if (token) {
                const user = await this.authService.validateJwtToken(token);
                const ipAddress = this.getClientIp(request);
                const userAgent = request.headers['user-agent'];
                await this.authService.logout(user.id, user.tenantId, ipAddress, userAgent);
            }
        }
        catch (error) {
        }
        return { ok: true };
    }
    extractHost(request) {
        const rawHost = (request.headers['x-tenant-host'] ||
            request.headers['x-forwarded-host'] ||
            request.headers.host);
        if (!rawHost)
            return null;
        return rawHost.toLowerCase().split(':')[0];
    }
    isReservedDomain(domain) {
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
    isSuperAdminEmail(email) {
        return email && email.endsWith('@softellio.com');
    }
    getClientIp(request) {
        const xForwardedFor = request.headers['x-forwarded-for'];
        if (xForwardedFor) {
            return Array.isArray(xForwardedFor)
                ? xForwardedFor[0]
                : xForwardedFor.split(',')[0].trim();
        }
        const xRealIp = request.headers['x-real-ip'];
        if (xRealIp) {
            return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
        }
        return request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            'unknown';
    }
    extractTokenFromCookie(request) {
        const cookies = request.cookies;
        return cookies?.auth_token || null;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User login' }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Tenant-Host',
        description: 'Tenant domain for multi-tenant login (e.g., demo.softellio.com)',
        required: false,
        example: 'demo.softellio.com'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid tenant information or authentication failed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_2.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user information' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User logout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        tenants_service_1.TenantsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map