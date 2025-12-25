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
exports.DomainsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const domains_service_1 = require("./domains.service");
const dto_1 = require("./dto");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DomainsController = class DomainsController {
    constructor(domainsService) {
        this.domainsService = domainsService;
    }
    create(tenantId, createDomainDto) {
        return this.domainsService.create(tenantId, createDomainDto);
    }
    findAll(tenantId) {
        return this.domainsService.findAllByTenant(tenantId);
    }
    findOne(tenantId, id) {
        return this.domainsService.findOne(tenantId, id);
    }
    update(tenantId, id, updateDomainDto) {
        return this.domainsService.update(tenantId, id, updateDomainDto);
    }
    verify(tenantId, id) {
        return this.domainsService.verify(tenantId, id);
    }
    remove(tenantId, id) {
        return this.domainsService.remove(tenantId, id);
    }
};
exports.DomainsController = DomainsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a custom domain',
        description: 'Add a new custom domain to the tenant. Returns domain details with DNS verification instructions.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Domain created successfully',
        type: dto_1.DomainWithInstructionsDto,
        example: {
            id: 1,
            domain: 'hamza.com',
            type: 'CUSTOM',
            isPrimary: false,
            isActive: true,
            isVerified: false,
            sslStatus: 'PENDING',
            verifiedAt: null,
            dnsInstructions: {
                type: 'TXT',
                host: '@',
                value: 'softellio-verify=abc123def456',
                instructions: 'Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap)'
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid domain format or reserved domain',
        schema: {
            example: {
                statusCode: 400,
                message: 'Invalid domain format or reserved domain. Custom domains cannot use *.softellio.com or reserved domains.',
                error: 'Bad Request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Domain already exists',
        schema: {
            example: {
                statusCode: 409,
                message: 'This domain is already registered to another tenant',
                error: 'Conflict'
            }
        }
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.CreateDomainDto]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all domains',
        description: 'Get all domains for the current tenant, ordered by primary status and creation date.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of domains',
        type: [dto_1.DomainWithInstructionsDto]
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get domain by ID',
        description: 'Get domain details including DNS verification instructions.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Domain ID',
        example: 1
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Domain details',
        type: dto_1.DomainWithInstructionsDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Domain not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Domain not found',
                error: 'Not Found'
            }
        }
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update domain settings',
        description: 'Update domain settings such as primary status and active status. Only verified custom domains can be set as primary.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Domain ID',
        example: 1
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Domain updated successfully',
        type: dto_1.DomainWithInstructionsDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot set unverified custom domain as primary',
        schema: {
            example: {
                statusCode: 400,
                message: 'Cannot set unverified custom domain as primary',
                error: 'Bad Request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Domain not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Domain not found',
                error: 'Not Found'
            }
        }
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, dto_1.UpdateDomainDto]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('verify/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify domain ownership',
        description: 'Verify domain ownership by checking DNS TXT record. Once verified, the domain can be set as primary and used for SSL.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Domain ID',
        example: 1
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Domain verification result',
        type: dto_1.VerifyDomainResponseDto,
        examples: {
            verified: {
                summary: 'Domain verified successfully',
                value: {
                    status: 'verified',
                    message: 'Domain successfully verified!',
                    checkedRecords: ['TXT @ softellio-verify=abc123def456'],
                    verifiedAt: '2024-01-15T10:35:00Z'
                }
            },
            pending: {
                summary: 'Domain verification pending',
                value: {
                    status: 'pending',
                    message: 'Verification record not found. Please ensure the TXT record is added to your DNS settings.',
                    checkedRecords: ['TXT @ example-existing-record']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Domain not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Domain not found',
                error: 'Not Found'
            }
        }
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "verify", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete domain',
        description: 'Soft delete a domain by setting it as inactive. Cannot delete the last active domain.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Domain ID',
        example: 1
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Domain deleted successfully',
        schema: {
            example: {
                message: 'Domain deleted successfully'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete the last active domain',
        schema: {
            example: {
                statusCode: 400,
                message: 'Cannot delete the last active domain. Please add another domain first.',
                error: 'Bad Request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Domain not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Domain not found',
                error: 'Not Found'
            }
        }
    }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "remove", null);
exports.DomainsController = DomainsController = __decorate([
    (0, swagger_1.ApiTags)('Domains (Tenant Admin)'),
    (0, common_1.Controller)('domains'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    __metadata("design:paramtypes", [domains_service_1.DomainsService])
], DomainsController);
//# sourceMappingURL=domains.controller.js.map