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
exports.TenantsPublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const tenants_service_1 = require("./tenants.service");
let TenantsPublicController = class TenantsPublicController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getByDomain(host) {
        if (!host) {
            throw new common_1.NotFoundException('Host parameter is required');
        }
        const tenant = await this.tenantsService.findByDomain(host);
        if (!tenant) {
            throw new common_1.NotFoundException(`No tenant found for domain: ${host}`);
        }
        return {
            tenantId: tenant.id,
            companyName: tenant.name,
            slug: tenant.slug,
            plan: 'basic',
            siteDomain: `${tenant.slug}.softellio.com`,
            panelDomain: `${tenant.slug}-panel.softellio.com`,
            templateKey: tenant.theme || 'default',
            status: tenant.status
        };
    }
};
exports.TenantsPublicController = TenantsPublicController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('by-domain'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant information by domain',
        description: 'Resolves tenant information from domain/subdomain for frontend usage'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'host',
        description: 'Domain to resolve (e.g., tekbaski.softellio.com)',
        example: 'tekbaski.softellio.com'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant information found',
        schema: {
            type: 'object',
            properties: {
                tenantId: { type: 'number', example: 1 },
                companyName: { type: 'string', example: 'Tek Baskı Reklam' },
                slug: { type: 'string', example: 'tekbaski' },
                plan: { type: 'string', example: 'basic' },
                siteDomain: { type: 'string', example: 'tekbaski.softellio.com' },
                panelDomain: { type: 'string', example: 'tekbaski-panel.softellio.com' },
                templateKey: { type: 'string', example: 'default' },
                status: { type: 'string', example: 'active' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No tenant found for this domain'
    }),
    __param(0, (0, common_1.Query)('host')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsPublicController.prototype, "getByDomain", null);
exports.TenantsPublicController = TenantsPublicController = __decorate([
    (0, swagger_1.ApiTags)('Tenants (Public)'),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsPublicController);
//# sourceMappingURL=tenants-public.controller.js.map