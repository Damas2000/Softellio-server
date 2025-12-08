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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const upload_media_dto_1 = require("./dto/upload-media.dto");
const cloudinary_provider_1 = require("../config/cloudinary.provider");
let MediaService = class MediaService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async uploadMedia(file, uploadMediaDto, tenantId, userId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size too large (max 50MB)');
        }
        const detectedType = this.getMediaTypeFromMime(file.mimetype);
        const mediaType = uploadMediaDto.type || detectedType;
        const folderPath = this.buildFolderPath(tenantId, uploadMediaDto.folder, mediaType);
        try {
            const result = await this.uploadToCloudinary(file, folderPath, uploadMediaDto.fileName);
            const media = await this.prisma.media.create({
                data: {
                    tenantId,
                    publicId: result.public_id,
                    url: result.secure_url,
                    fileName: uploadMediaDto.fileName || file.originalname,
                    format: result.format,
                    size: result.bytes,
                    uploadedById: userId || null,
                },
            });
            return media;
        }
        catch (error) {
            console.error('Media upload error:', error);
            throw new common_1.BadRequestException('Failed to upload media: ' + error.message);
        }
    }
    async uploadMultipleMedia(files, uploadMediaDto, tenantId, userId) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadPromises = files.map(file => this.uploadMedia(file, uploadMediaDto, tenantId, userId));
        try {
            return Promise.all(uploadPromises);
        }
        catch (error) {
            console.error('Bulk upload error:', error);
            throw new common_1.BadRequestException('Failed to upload some files: ' + error.message);
        }
    }
    async findAllMedia(tenantId, options = {}) {
        const { type, search, page = 1, limit = 20, sortBy = 'uploadedAt', sortOrder = 'desc', } = options;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (type) {
            whereClause.format = this.getFormatsByType(type);
        }
        if (search) {
            whereClause.fileName = {
                contains: search,
                mode: 'insensitive',
            };
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [media, total] = await Promise.all([
            this.prisma.media.findMany({
                where: whereClause,
                include: {
                    uploadedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.media.count({ where: whereClause }),
        ]);
        return {
            media,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOneMedia(id, tenantId) {
        const media = await this.prisma.media.findFirst({
            where: { id, tenantId },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        return media;
    }
    async updateMedia(id, updateData, tenantId) {
        await this.findOneMedia(id, tenantId);
        return this.prisma.media.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteMedia(id, tenantId) {
        const media = await this.findOneMedia(id, tenantId);
        try {
            await this.cloudinaryService.uploader.destroy(media.publicId);
            await this.prisma.media.delete({
                where: { id },
            });
            return { message: 'Media deleted successfully' };
        }
        catch (error) {
            console.error('Media deletion error:', error);
            throw new common_1.BadRequestException('Failed to delete media: ' + error.message);
        }
    }
    async bulkDeleteMedia(ids, tenantId) {
        let deleted = 0;
        let failed = 0;
        for (const id of ids) {
            try {
                await this.deleteMedia(id, tenantId);
                deleted++;
            }
            catch (error) {
                console.error(`Failed to delete media ${id}:`, error);
                failed++;
            }
        }
        return { deleted, failed };
    }
    async getMediaStats(tenantId) {
        const [totalCount, totalSize, mediaByType] = await Promise.all([
            this.prisma.media.count({ where: { tenantId } }),
            this.prisma.media.aggregate({
                where: { tenantId },
                _sum: { size: true },
            }),
            this.prisma.media.groupBy({
                by: ['format'],
                where: { tenantId },
                _count: true,
            }),
        ]);
        const typeStats = mediaByType.reduce((acc, item) => {
            const type = this.getMediaTypeFromFormat(item.format);
            if (!acc[type]) {
                acc[type] = 0;
            }
            acc[type] += item._count;
            return acc;
        }, {});
        return {
            totalCount,
            totalSize: totalSize._sum.size || 0,
            typeBreakdown: typeStats,
        };
    }
    async uploadToCloudinary(file, folder, customFileName) {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder,
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto',
            };
            if (customFileName) {
                uploadOptions.public_id = this.sanitizeFileName(customFileName);
            }
            this.cloudinaryService.uploader
                .upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            })
                .end(file.buffer);
        });
    }
    getMediaTypeFromMime(mimetype) {
        if (mimetype.startsWith('image/'))
            return upload_media_dto_1.MediaType.IMAGE;
        if (mimetype.startsWith('video/'))
            return upload_media_dto_1.MediaType.VIDEO;
        if (mimetype.startsWith('audio/'))
            return upload_media_dto_1.MediaType.AUDIO;
        return upload_media_dto_1.MediaType.DOCUMENT;
    }
    getMediaTypeFromFormat(format) {
        const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'];
        const audioFormats = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
        const lowerFormat = format.toLowerCase();
        if (imageFormats.includes(lowerFormat))
            return upload_media_dto_1.MediaType.IMAGE;
        if (videoFormats.includes(lowerFormat))
            return upload_media_dto_1.MediaType.VIDEO;
        if (audioFormats.includes(lowerFormat))
            return upload_media_dto_1.MediaType.AUDIO;
        return upload_media_dto_1.MediaType.DOCUMENT;
    }
    getFormatsByType(type) {
        const formats = {
            [upload_media_dto_1.MediaType.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
            [upload_media_dto_1.MediaType.VIDEO]: ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'],
            [upload_media_dto_1.MediaType.AUDIO]: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
            [upload_media_dto_1.MediaType.DOCUMENT]: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'],
        };
        return { in: formats[type] };
    }
    buildFolderPath(tenantId, customFolder, mediaType) {
        const basePath = `tenant-${tenantId}`;
        const typePath = mediaType || 'general';
        const customPath = customFolder ? `/${customFolder}` : '';
        return `${basePath}/${typePath}${customPath}`;
    }
    sanitizeFileName(fileName) {
        return fileName
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
    }
    async getOptimizedImageUrl(publicId, options = {}) {
        const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
        return this.cloudinaryService.url(publicId, {
            width,
            height,
            crop,
            quality,
            fetch_format: format,
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cloudinary_provider_1.CLOUDINARY)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MediaService);
//# sourceMappingURL=media.service.js.map