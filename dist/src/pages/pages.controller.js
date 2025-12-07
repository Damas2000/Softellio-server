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
exports.PagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pages_service_1 = require("./pages.service");
const create_page_dto_1 = require("./dto/create-page.dto");
const update_page_dto_1 = require("./dto/update-page.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let PagesController = class PagesController {
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    create(createPageDto, tenantId) {
        return this.pagesService.create(createPageDto, tenantId);
    }
    findAllAdmin(tenantId, status, language, page, limit) {
        return this.pagesService.findAll(tenantId, {
            status,
            language,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    findOneAdmin(id, tenantId) {
        return this.pagesService.findOne(id, tenantId);
    }
    update(id, updatePageDto, tenantId) {
        return this.pagesService.update(id, updatePageDto, tenantId);
    }
    remove(id, tenantId) {
        return this.pagesService.remove(id, tenantId);
    }
    duplicate(id, tenantId) {
        return this.pagesService.duplicate(id, tenantId);
    }
    bulkDelete(body, tenantId) {
        return this.pagesService.bulkDelete(body.ids, tenantId);
    }
    findPublicPages(language, tenantId, page, limit) {
        return this.pagesService.findAll(tenantId, {
            status: create_page_dto_1.PageStatus.PUBLISHED,
            language,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    findBySlug(language, slug, tenantId) {
        return this.pagesService.findBySlug(slug, language, tenantId, false);
    }
    getPagesByLanguage(language, tenantId) {
        return this.pagesService.getPagesByLanguage(language, tenantId, true);
    }
    previewBySlug(language, slug, tenantId) {
        return this.pagesService.findBySlug(slug, language, tenantId, true);
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Page created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slug conflict in specified language' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pages for admin (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: create_page_dto_1.PageStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'language', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pages with pagination' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get page by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page details with all translations' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findOneAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_page_dto_1.UpdatePageDto, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('admin/:id/duplicate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Page duplicated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete pages (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pages deleted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Get)('public/:language'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published pages by language (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of published pages in specified language' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findPublicPages", null);
__decorate([
    (0, common_1.Get)('public/:language/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published page by slug and language (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page content in specified language' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('public/:language/list'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all published pages in a language (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of published pages for navigation/sitemap' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getPagesByLanguage", null);
__decorate([
    (0, common_1.Get)('preview/:language/:slug'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Preview page by slug (including unpublished) (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page content preview' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "previewBySlug", null);
exports.PagesController = PagesController = __decorate([
    (0, swagger_1.ApiTags)('Pages'),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PagesController);
//# sourceMappingURL=pages.controller.js.map