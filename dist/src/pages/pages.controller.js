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
var PagesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pages_service_1 = require("./pages.service");
const create_page_dto_1 = require("./dto/create-page.dto");
const update_page_dto_1 = require("./dto/update-page.dto");
const page_query_dto_1 = require("./dto/page-query.dto");
const page_response_dto_1 = require("./dto/page-response.dto");
const bulk_page_operation_dto_1 = require("./dto/bulk-page-operation.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let PagesController = PagesController_1 = class PagesController {
    constructor(pagesService) {
        this.pagesService = pagesService;
        this.logger = new common_1.Logger(PagesController_1.name);
    }
    async create(createPageDto, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-create-${Date.now()}`;
        this.logger.log(`Creating page for tenant ${tenantId}`, {
            correlationId,
            tenantId,
            translationsCount: createPageDto.translations.length,
            languages: createPageDto.translations.map(t => t.language),
            status: createPageDto.status || 'draft',
        });
        try {
            const result = await this.pagesService.create(createPageDto, tenantId);
            this.logger.log(`Page created successfully with ID ${result.id}`, {
                correlationId,
                pageId: result.id,
                tenantId,
                status: result.status,
                translationsCount: result.translations.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to create page for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                tenantId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async findAllAdmin(tenantId, query, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-list-${Date.now()}`;
        this.logger.log(`Fetching pages for tenant ${tenantId}`, {
            correlationId,
            tenantId,
            filters: {
                status: query.status,
                language: query.language,
                search: query.search,
                createdAfter: query.createdAfter,
                createdBefore: query.createdBefore,
            },
            pagination: { page: query.page, limit: query.limit },
            sorting: { sortBy: query.sortBy, sortOrder: query.sortOrder },
        });
        try {
            const result = await this.pagesService.findAll(tenantId, query);
            this.logger.log(`Retrieved ${result.pages.length} pages for tenant ${tenantId}`, {
                correlationId,
                tenantId,
                count: result.pages.length,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch pages for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                tenantId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async findOneAdmin(id, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-get-${Date.now()}`;
        this.logger.log(`Fetching page ${id} for tenant ${tenantId}`, {
            correlationId,
            pageId: id,
            tenantId,
        });
        try {
            const result = await this.pagesService.findOne(id, tenantId);
            this.logger.log(`Retrieved page ${id} for tenant ${tenantId}`, {
                correlationId,
                pageId: id,
                tenantId,
                status: result.status,
                translationsCount: result.translations.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch page ${id} for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                pageId: id,
                tenantId,
                error: error.message,
            });
            throw error;
        }
    }
    async update(id, updatePageDto, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-update-${Date.now()}`;
        this.logger.log(`Updating page ${id} for tenant ${tenantId}`, {
            correlationId,
            pageId: id,
            tenantId,
            updates: {
                status: updatePageDto.status,
                translationsProvided: !!updatePageDto.translations,
                translationsCount: updatePageDto.translations?.length || 0,
            },
        });
        try {
            const result = await this.pagesService.update(id, updatePageDto, tenantId);
            this.logger.log(`Page ${id} updated successfully for tenant ${tenantId}`, {
                correlationId,
                pageId: id,
                tenantId,
                status: result.status,
                translationsCount: result.translations.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update page ${id} for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                pageId: id,
                tenantId,
                error: error.message,
            });
            throw error;
        }
    }
    async remove(id, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-delete-${Date.now()}`;
        this.logger.log(`Deleting page ${id} for tenant ${tenantId}`, {
            correlationId,
            pageId: id,
            tenantId,
        });
        try {
            const result = await this.pagesService.remove(id, tenantId);
            this.logger.log(`Page ${id} deleted successfully for tenant ${tenantId}`, {
                correlationId,
                pageId: id,
                tenantId,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to delete page ${id} for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                pageId: id,
                tenantId,
                error: error.message,
            });
            throw error;
        }
    }
    async duplicate(id, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-duplicate-${Date.now()}`;
        this.logger.log(`Duplicating page ${id} for tenant ${tenantId}`, {
            correlationId,
            pageId: id,
            tenantId,
        });
        try {
            const result = await this.pagesService.duplicate(id, tenantId);
            this.logger.log(`Page ${id} duplicated successfully for tenant ${tenantId}, new ID: ${result.id}`, {
                correlationId,
                originalPageId: id,
                newPageId: result.id,
                tenantId,
                translationsCount: result.translations.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to duplicate page ${id} for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                pageId: id,
                tenantId,
                error: error.message,
            });
            throw error;
        }
    }
    async bulkDelete(bulkDeleteDto, tenantId, req) {
        const correlationId = req.headers['x-correlation-id'] || `page-bulk-delete-${Date.now()}`;
        this.logger.log(`Bulk deleting ${bulkDeleteDto.ids.length} pages for tenant ${tenantId}`, {
            correlationId,
            pageIds: bulkDeleteDto.ids,
            tenantId,
            count: bulkDeleteDto.ids.length,
        });
        try {
            const result = await this.pagesService.bulkDelete(bulkDeleteDto.ids, tenantId);
            this.logger.log(`Bulk deleted ${result.deleted} pages for tenant ${tenantId}`, {
                correlationId,
                tenantId,
                requested: bulkDeleteDto.ids.length,
                deleted: result.deleted,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to bulk delete pages for tenant ${tenantId}: ${error.message}`, {
                correlationId,
                tenantId,
                pageIds: bulkDeleteDto.ids,
                error: error.message,
            });
            throw error;
        }
    }
    async findBySlug(language, slug, tenantId) {
        return this.pagesService.findBySlug(slug, language, tenantId, false);
    }
    async findPublicPages(language, tenantId, query) {
        const publicQuery = {
            ...query,
            status: create_page_dto_1.PageStatus.PUBLISHED,
            language,
        };
        return this.pagesService.findAll(tenantId, publicQuery);
    }
    async previewBySlug(language, slug, tenantId) {
        return this.pagesService.findBySlug(slug, language, tenantId, true);
    }
    async debugBulkDelete(body, tenantId) {
        return {
            message: 'Debug endpoint reached',
            tenantId,
            bodyReceived: body,
            idsType: typeof body.ids,
            idsLength: Array.isArray(body.ids) ? body.ids.length : 'not an array',
            idsFirstElement: Array.isArray(body.ids) && body.ids.length > 0 ? typeof body.ids[0] : 'no first element'
        };
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: page_response_dto_1.PageResponseDto, description: 'Page created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or slug format' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slug already exists in specified language' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pages with advanced filtering (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PaginatedPageResponseDto, description: 'Paginated list of pages' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, page_query_dto_1.PageQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get page by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PageResponseDto, description: 'Page details with all translations' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findOneAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PageResponseDto, description: 'Page updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or slug format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slug already exists in specified language' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_page_dto_1.UpdatePageDto, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PageDeleteResponseDto, description: 'Page deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('admin/:id/duplicate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate page (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: page_response_dto_1.PageResponseDto, description: 'Page duplicated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)('admin/bulk-delete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete pages (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.BulkDeleteResponseDto, description: 'Pages deleted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_page_operation_dto_1.BulkPageDeleteDto, Number, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Get)('public/:language/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published page by slug and language (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PageResponseDto, description: 'Page content in specified language' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('public/:language'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published pages by language (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PaginatedPageResponseDto, description: 'List of published pages in specified language' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, page_query_dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findPublicPages", null);
__decorate([
    (0, common_1.Get)('preview/:language/:slug'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Preview page by slug (including unpublished) (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: page_response_dto_1.PageResponseDto, description: 'Page content preview' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "previewBySlug", null);
__decorate([
    (0, common_1.Post)('admin/debug-bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Debug endpoint to test bulk delete payload (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "debugBulkDelete", null);
exports.PagesController = PagesController = PagesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Pages'),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PagesController);
//# sourceMappingURL=pages.controller.js.map