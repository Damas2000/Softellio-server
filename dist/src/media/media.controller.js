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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const media_service_1 = require("./media.service");
const upload_media_dto_1 = require("./dto/upload-media.dto");
const update_media_dto_1 = require("./dto/update-media.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    uploadMedia(file, uploadMediaDto, tenantId, user) {
        return this.mediaService.uploadMedia(file, uploadMediaDto, tenantId, user.id);
    }
    uploadMultipleMedia(files, uploadMediaDto, tenantId, user) {
        return this.mediaService.uploadMultipleMedia(files, uploadMediaDto, tenantId, user.id);
    }
    findAllMedia(tenantId, type, search, page, limit, sortBy, sortOrder) {
        return this.mediaService.findAllMedia(tenantId, {
            type,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            sortBy,
            sortOrder,
        });
    }
    getMediaStats(tenantId) {
        return this.mediaService.getMediaStats(tenantId);
    }
    bulkDeleteMedia(body, tenantId) {
        return this.mediaService.bulkDeleteMedia(body.ids, tenantId);
    }
    async getOptimizedImage(id, tenantId, width, height, quality, format, crop) {
        const media = await this.mediaService.findOneMedia(id, tenantId);
        const optimizedUrl = await this.mediaService.getOptimizedImageUrl(media.publicId, {
            width: width ? Number(width) : undefined,
            height: height ? Number(height) : undefined,
            quality: quality === 'auto' ? 'auto' : quality ? Number(quality) : 'auto',
            format: format,
            crop: crop,
        });
        return { url: optimizedUrl, publicId: media.publicId };
    }
    findOneMedia(id, tenantId) {
        return this.mediaService.findOneMedia(id, tenantId);
    }
    updateMedia(id, updateMediaDto, tenantId) {
        return this.mediaService.updateMedia(id, updateMediaDto, tenantId);
    }
    deleteMedia(id, tenantId) {
        return this.mediaService.deleteMedia(id, tenantId);
    }
    async getPublicOptimizedImage(publicId, width, height, quality, format, crop) {
        const optimizedUrl = await this.mediaService.getOptimizedImageUrl(publicId, {
            width: width ? Number(width) : undefined,
            height: height ? Number(height) : undefined,
            quality: quality === 'auto' ? 'auto' : quality ? Number(quality) : 'auto',
            format: format,
            crop: crop,
        });
        return { url: optimizedUrl };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('admin/upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload single media file (Admin)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload',
                },
                fileName: {
                    type: 'string',
                    description: 'Custom filename',
                },
                type: {
                    type: 'string',
                    enum: Object.values(upload_media_dto_1.MediaType),
                    description: 'Media type',
                },
                folder: {
                    type: 'string',
                    description: 'Folder/category',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or upload error' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_media_dto_1.UploadMediaDto, Number, Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Post)('admin/upload/multiple'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple media files (Admin)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Files to upload (max 10)',
                },
                fileName: {
                    type: 'string',
                    description: 'Custom filename prefix',
                },
                type: {
                    type: 'string',
                    enum: Object.values(upload_media_dto_1.MediaType),
                    description: 'Media type',
                },
                folder: {
                    type: 'string',
                    description: 'Folder/category',
                },
            },
            required: ['files'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Files uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid files or upload error' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_media_dto_1.UploadMediaDto, Number, Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "uploadMultipleMedia", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all media files (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: upload_media_dto_1.MediaType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['uploadedAt', 'fileName', 'size'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of media files with pagination' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findAllMedia", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get media statistics (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media statistics' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMediaStats", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete media files (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk delete completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "bulkDeleteMedia", null);
__decorate([
    (0, common_1.Get)('admin/:id/optimized'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get optimized image URL (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'width', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'height', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'quality', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'crop', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Optimized image URL' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Media not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('width')),
    __param(3, (0, common_1.Query)('height')),
    __param(4, (0, common_1.Query)('quality')),
    __param(5, (0, common_1.Query)('format')),
    __param(6, (0, common_1.Query)('crop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getOptimizedImage", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get media by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Media not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findOneMedia", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update media metadata (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body - only fileName is allowed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Media not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_media_dto_1.UpdateMediaDto, Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "updateMedia", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media file (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Media not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Get)('public/image/:publicId/optimized'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get optimized public image URL (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'w', type: Number, required: false, description: 'Width' }),
    (0, swagger_1.ApiQuery)({ name: 'h', type: Number, required: false, description: 'Height' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: 'Quality' }),
    (0, swagger_1.ApiQuery)({ name: 'f', required: false, description: 'Format' }),
    (0, swagger_1.ApiQuery)({ name: 'c', required: false, description: 'Crop mode' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Optimized image URL for public use' }),
    __param(0, (0, common_1.Param)('publicId')),
    __param(1, (0, common_1.Query)('w')),
    __param(2, (0, common_1.Query)('h')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('f')),
    __param(5, (0, common_1.Query)('c')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getPublicOptimizedImage", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media Management'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map