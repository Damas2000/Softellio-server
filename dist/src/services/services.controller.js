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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const services_service_1 = require("./services.service");
const service_dto_1 = require("./dto/service.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let ServicesController = class ServicesController {
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    create(createServiceDto, tenantId) {
        return this.servicesService.create(createServiceDto, tenantId);
    }
    findAll(tenantId, query) {
        return this.servicesService.findAll(tenantId, query);
    }
    getStats(tenantId) {
        return this.servicesService.getStats(tenantId);
    }
    getFeatured(tenantId) {
        return this.servicesService.findFeatured(tenantId);
    }
    findOne(id, tenantId) {
        return this.servicesService.findOne(id, tenantId);
    }
    update(id, updateServiceDto, tenantId) {
        return this.servicesService.update(id, updateServiceDto, tenantId);
    }
    remove(id, tenantId) {
        return this.servicesService.remove(id, tenantId);
    }
    bulkDelete(bulkDeleteDto, tenantId) {
        return this.servicesService.bulkDelete(bulkDeleteDto.ids, tenantId);
    }
    reorder(reorderDto, tenantId) {
        return this.servicesService.reorder(reorderDto.services, tenantId);
    }
    findPublic(language, tenantId, query) {
        return this.servicesService.findPublicServices(tenantId, language, query);
    }
    async getFeaturedPublic(language, tenantId) {
        const featuredServices = await this.servicesService.findFeatured(tenantId);
        const formattedServices = featuredServices.map(service => ({
            id: service.id,
            iconUrl: service.iconUrl,
            order: service.order,
            translation: service.translations.find(t => t.language === language) || null,
        })).filter(service => service.translation);
        return { services: formattedServices };
    }
    findBySlug(language, slug, tenantId) {
        return this.servicesService.findBySlug(slug, language, tenantId);
    }
    async getSitemap(language, tenantId) {
        const services = await this.servicesService.findPublicServices(tenantId, language, {
            limit: 1000,
        });
        const sitemapData = services.services
            .filter(service => service.translation)
            .map(service => ({
            slug: service.translation.slug,
            lastModified: new Date(),
            changeFreq: 'monthly',
            priority: service.isFeatured ? 0.8 : 0.6,
        }));
        return { services: sitemapData };
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create new service (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Service created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.CreateServiceDto, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services with filtering (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'title'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Services retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.ServiceQueryDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get services statistics (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Services statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('admin/featured'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured services (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured services retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update service (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.UpdateServiceDto, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete services (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk delete completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.BulkServiceDeleteDto, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Patch)('admin/reorder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder services (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Services reordered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.ServiceReorderDto, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)('public/:language'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public services for specific language' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public services retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, service_dto_1.ServiceQueryDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Get)('public/:language/featured'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured services for public display' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured services retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getFeaturedPublic", null);
__decorate([
    (0, common_1.Get)('public/:language/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by slug for public display' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('public/:language/sitemap'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get services sitemap data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap data retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getSitemap", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map