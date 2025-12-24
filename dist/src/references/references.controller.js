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
exports.ReferencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const references_service_1 = require("./references.service");
const reference_dto_1 = require("./dto/reference.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let ReferencesController = class ReferencesController {
    constructor(referencesService) {
        this.referencesService = referencesService;
    }
    create(createReferenceDto, tenantId) {
        return this.referencesService.create(createReferenceDto, tenantId);
    }
    findAll(tenantId, query) {
        return this.referencesService.findAll(tenantId, query);
    }
    getStats(tenantId) {
        return this.referencesService.getStats(tenantId);
    }
    getCategories(tenantId) {
        return this.referencesService.getCategories(tenantId);
    }
    getYears(tenantId) {
        return this.referencesService.getYears(tenantId);
    }
    getFeatured(tenantId) {
        return this.referencesService.findFeatured(tenantId);
    }
    findOne(id, tenantId) {
        return this.referencesService.findOne(id, tenantId);
    }
    update(id, updateReferenceDto, tenantId) {
        return this.referencesService.update(id, updateReferenceDto, tenantId);
    }
    remove(id, tenantId) {
        return this.referencesService.remove(id, tenantId);
    }
    bulkDelete(bulkDeleteDto, tenantId) {
        return this.referencesService.bulkDelete(bulkDeleteDto.ids, tenantId);
    }
    reorder(reorderDto, tenantId) {
        return this.referencesService.reorder(reorderDto.references, tenantId);
    }
    findPublic(language, tenantId, query) {
        return this.referencesService.findPublicReferences(tenantId, language, query);
    }
    async getFeaturedPublic(language, tenantId) {
        const featuredReferences = await this.referencesService.findFeatured(tenantId);
        const formattedReferences = featuredReferences.map(reference => ({
            id: reference.id,
            imageUrl: reference.imageUrl,
            projectUrl: reference.projectUrl,
            clientName: reference.clientName,
            projectDate: reference.projectDate,
            category: reference.category,
            order: reference.order,
            translation: reference.translations.find(t => t.language === language) || null,
            gallery: reference.gallery,
        })).filter(reference => reference.translation);
        return { references: formattedReferences };
    }
    async getByCategory(language, category, tenantId, query) {
        query.category = category;
        return this.referencesService.findPublicReferences(tenantId, language, query);
    }
    findBySlug(language, slug, tenantId) {
        return this.referencesService.findBySlug(slug, language, tenantId);
    }
    async getLatestShowcase(language, tenantId) {
        const result = await this.referencesService.findPublicReferences(tenantId, language, { limit: 6, sortBy: 'projectDate', sortOrder: 'desc' });
        return {
            showcase: result.references,
            title: 'Latest Projects',
            subtitle: 'Our most recent completed projects'
        };
    }
    async getFeaturedShowcase(language, tenantId) {
        const result = await this.referencesService.findPublicReferences(tenantId, language, { featured: true, limit: 8 });
        return {
            showcase: result.references,
            title: 'Featured Projects',
            subtitle: 'Our most notable and successful projects'
        };
    }
    async getPortfolioGrid(language, tenantId, query) {
        const result = await this.referencesService.findPublicReferences(tenantId, language, { ...query, limit: 50 });
        const portfolioGrid = result.references.map(reference => ({
            id: reference.id,
            title: reference.translation?.title || 'Untitled Project',
            slug: reference.translation?.slug || `project-${reference.id}`,
            imageUrl: reference.imageUrl,
            category: reference.category,
            clientName: reference.clientName,
            projectDate: reference.projectDate,
            isFeatured: reference.isFeatured,
        }));
        return {
            portfolio: portfolioGrid,
            total: result.total,
            categories: await this.referencesService.getCategories(tenantId),
            years: await this.referencesService.getYears(tenantId),
        };
    }
    async getSitemap(language, tenantId) {
        const references = await this.referencesService.findPublicReferences(tenantId, language, {
            limit: 1000,
        });
        const sitemapData = references.references
            .filter(reference => reference.translation)
            .map(reference => ({
            slug: reference.translation.slug,
            lastModified: reference.projectDate || new Date(),
            changeFreq: 'monthly',
            priority: reference.isFeatured ? 0.8 : 0.6,
            category: reference.category,
        }));
        return { references: sitemapData };
    }
    async getPublicStats(tenantId) {
        const stats = await this.referencesService.getStats(tenantId);
        return {
            totalProjects: stats.active,
            featuredProjects: stats.featured,
            categories: Object.keys(stats.byCategory),
            projectYears: Object.keys(stats.byYear).map(Number).sort((a, b) => b - a),
        };
    }
};
exports.ReferencesController = ReferencesController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create new reference project (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reference created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reference_dto_1.CreateReferenceDto, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all references with filtering (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'category', type: String, required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' }),
    (0, swagger_1.ApiQuery)({ name: 'client', type: String, required: false, description: 'Filter by client name' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, required: false, description: 'Filter by project year' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'projectDate', 'title'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'References retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reference_dto_1.ReferenceQueryDto]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get references statistics (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'References statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('admin/categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get available categories (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('admin/years'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get available project years (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Years retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "getYears", null);
__decorate([
    (0, common_1.Get)('admin/featured'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured references (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured references retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get reference by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reference retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reference not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update reference (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reference updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reference not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reference_dto_1.UpdateReferenceDto, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete reference (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reference deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reference not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete references (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk delete completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reference_dto_1.BulkReferenceDeleteDto, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Patch)('admin/reorder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder references (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'References reordered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reference_dto_1.ReferenceReorderDto, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)('public/:language'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public references for specific language' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'category', type: String, required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' }),
    (0, swagger_1.ApiQuery)({ name: 'client', type: String, required: false, description: 'Filter by client name' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, required: false, description: 'Filter by project year' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public references retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, reference_dto_1.ReferenceQueryDto]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Get)('public/:language/featured'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured references for public display' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured references retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getFeaturedPublic", null);
__decorate([
    (0, common_1.Get)('public/:language/categories/:category'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get references by category for public display' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'References by category retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('category')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, reference_dto_1.ReferenceQueryDto]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)('public/:language/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get reference by slug for public display' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reference retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reference not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], ReferencesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('public/:language/showcase/latest'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest 6 projects for homepage showcase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Latest projects retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getLatestShowcase", null);
__decorate([
    (0, common_1.Get)('public/:language/showcase/featured'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured projects showcase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured projects showcase retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getFeaturedShowcase", null);
__decorate([
    (0, common_1.Get)('public/:language/portfolio/grid'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio in grid format for gallery display' }),
    (0, swagger_1.ApiQuery)({ name: 'category', type: String, required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, required: false, description: 'Filter by year' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio grid retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, reference_dto_1.ReferenceQueryDto]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getPortfolioGrid", null);
__decorate([
    (0, common_1.Get)('public/:language/sitemap'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get references sitemap data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap data retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getSitemap", null);
__decorate([
    (0, common_1.Get)('public/:language/stats'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public portfolio statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReferencesController.prototype, "getPublicStats", null);
exports.ReferencesController = ReferencesController = __decorate([
    (0, swagger_1.ApiTags)('References & Portfolio'),
    (0, common_1.Controller)('references'),
    __metadata("design:paramtypes", [references_service_1.ReferencesService])
], ReferencesController);
//# sourceMappingURL=references.controller.js.map