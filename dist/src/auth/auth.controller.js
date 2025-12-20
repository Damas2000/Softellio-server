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
const passport_1 = require("@nestjs/passport");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
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
                if (!this.isSuperAdminEmail(loginDto.email)) {
                    throw new common_2.BadRequestException(`Domain ${host} is reserved for SUPER_ADMIN access only`);
                }
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
        if (!tenant && loginDto.email && !this.isSuperAdminEmail(loginDto.email)) {
            throw new common_2.BadRequestException('Tenant information is required for this login');
        }
        const result = await this.authService.login(loginDto, tenant);
        const tokens = await this.authService.generateTokens({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            tenantId: result.user.tenantId,
            password: '',
            isActive: result.user.isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
    async refresh(user) {
        return this.authService.refresh(user.id);
    }
    async logout(response) {
        response.clearCookie('refreshToken');
        return this.authService.logout();
    }
    async me(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            isActive: user.isActive,
        };
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User login' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-refresh')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        type: auth_response_dto_1.RefreshResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User logout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current user information' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        tenants_service_1.TenantsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map