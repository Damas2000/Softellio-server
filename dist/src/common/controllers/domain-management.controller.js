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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const domain_resolver_service_1 = require("../services/domain-resolver.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const current_tenant_decorator_1 = require("../decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
const create_domain_dto_1 = require("../dto/create-domain.dto");
const update_domain_dto_1 = require("../dto/update-domain.dto");
let DomainManagementController = class DomainManagementController {
    constructor(domainResolver) {
        this.domainResolver = domainResolver;
    }
    async getTenantDomains(tenantId) {
        return this.domainResolver.getTenantDomains(tenantId);
    }
    async addCustomDomain(tenantId, createDomainDto) {
        return this.domainResolver.addCustomDomain(tenantId, createDomainDto.domain, createDomainDto.isPrimary || false);
    }
    async updateDomain(tenantId, domainId, updateDomainDto) {
        return this.domainResolver.updateDomain(tenantId, domainId, updateDomainDto);
    }
    async removeDomain(tenantId, domainId) {
        await this.domainResolver.removeDomain(tenantId, domainId);
    }
    async checkDomainHealth(domainParam) {
        const domain = isNaN(Number(domainParam)) ? domainParam : domainParam;
        const healthCheck = await this.domainResolver.checkDomainHealth(domain);
        return {
            ...healthCheck,
            checkedAt: new Date(),
        };
    }
    async testDomainResolution(domain) {
        if (!domain) {
            throw new Error('Domain parameter is required');
        }
        try {
            const resolution = await this.domainResolver.resolveTenantFromDomain(domain);
            return {
                success: true,
                domain,
                tenant: {
                    id: resolution.tenant.id,
                    slug: resolution.tenant.slug,
                    name: resolution.tenant.name,
                    status: resolution.tenant.status,
                },
                resolvedBy: resolution.resolvedBy,
                tenantDomain: resolution.domain ? {
                    id: resolution.domain.id,
                    domain: resolution.domain.domain,
                    type: resolution.domain.type,
                    isPrimary: resolution.domain.isPrimary,
                    isVerified: resolution.domain.isVerified,
                } : null,
            };
        }
        catch (error) {
            return {
                success: false,
                domain,
                error: error.message,
            };
        }
    }
    async verifyDomain(tenantId, domainId) {
        return {
            status: 'pending',
            message: 'Domain verification process initiated',
            verificationToken: `softellio-verify-${Date.now()}`,
        };
    }
    async getNetlifyConfigDeprecated() {
        return {
            statusCode: 410,
            error: 'Gone',
            message: 'This endpoint has been permanently removed. Softellio now uses Vercel for deployments.',
            details: {
                deprecated: 'GET /domains/netlify-config',
                reason: 'Netlify is no longer supported. All deployments now use Vercel.',
                migration: 'Configure domains directly in Vercel dashboard: https://vercel.com/docs/concepts/projects/custom-domains',
                documentation: 'https://docs.softellio.com/domains/vercel-setup'
            },
            timestamp: new Date().toISOString()
        };
    }
};
exports.DomainManagementController = DomainManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all domains for current tenant' }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Tenant-Host',
        description: 'Tenant domain for multi-tenant operations',
        required: true,
        example: 'demo.softellio.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of tenant domains retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    tenantId: { type: 'number' },
                    domain: { type: 'string' },
                    isPrimary: { type: 'boolean' },
                    isActive: { type: 'boolean' },
                    type: { type: 'string' },
                    isVerified: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "getTenantDomains", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add custom domain to tenant' }),
    (0, swagger_1.ApiBody)({
        type: create_domain_dto_1.CreateDomainDto,
        description: 'Domain details to add to the tenant',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Tenant-Host',
        description: 'Tenant domain for multi-tenant operations',
        required: true,
        example: 'demo.softellio.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Custom domain added successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                tenantId: { type: 'number' },
                domain: { type: 'string' },
                isPrimary: { type: 'boolean' },
                isActive: { type: 'boolean' },
                type: { type: 'string' },
                isVerified: { type: 'boolean' },
                verificationToken: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid domain format or reserved domain',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Domain already exists for another tenant',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions or tenant inactive',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_domain_dto_1.CreateDomainDto]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "addCustomDomain", null);
__decorate([
    (0, common_1.Patch)(':domainId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update domain settings' }),
    (0, swagger_1.ApiParam)({ name: 'domainId', description: 'Domain ID', type: 'number' }),
    (0, swagger_1.ApiBody)({
        type: update_domain_dto_1.UpdateDomainDto,
        description: 'Domain settings to update',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Tenant-Host',
        description: 'Tenant domain for multi-tenant operations',
        required: true,
        example: 'demo.softellio.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Domain updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                tenantId: { type: 'number' },
                domain: { type: 'string' },
                isPrimary: { type: 'boolean' },
                isActive: { type: 'boolean' },
                type: { type: 'string' },
                isVerified: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Domain not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('domainId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_domain_dto_1.UpdateDomainDto]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "updateDomain", null);
__decorate([
    (0, common_1.Delete)(':domainId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove domain from tenant' }),
    (0, swagger_1.ApiParam)({ name: 'domainId', description: 'Domain ID', type: 'number' }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Tenant-Host',
        description: 'Tenant domain for multi-tenant operations',
        required: true,
        example: 'demo.softellio.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Domain removed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Domain not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('domainId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "removeDomain", null);
__decorate([
    (0, common_1.Get)(':domainId/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check domain health and accessibility' }),
    (0, swagger_1.ApiParam)({ name: 'domainId', description: 'Domain ID or domain name' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Domain health check completed',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('domainId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "checkDomainHealth", null);
__decorate([
    (0, common_1.Get)('resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Test domain resolution for debugging' }),
    (0, swagger_1.ApiQuery)({ name: 'domain', description: 'Domain to resolve' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Domain resolution test completed',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, common_1.Query)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "testDomainResolution", null);
__decorate([
    (0, common_1.Post)('verify/:domainId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify domain ownership' }),
    (0, swagger_1.ApiParam)({ name: 'domainId', description: 'Domain ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Domain verification initiated',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('domainId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "verifyDomain", null);
__decorate([
    (0, common_1.Get)('netlify-config'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DomainManagementController.prototype, "getNetlifyConfigDeprecated", null);
exports.DomainManagementController = DomainManagementController = __decorate([
    (0, swagger_1.ApiTags)('Domain Management'),
    (0, common_1.Controller)('domains'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [domain_resolver_service_1.DomainResolverService])
], DomainManagementController);
//# sourceMappingURL=domain-management.controller.js.map