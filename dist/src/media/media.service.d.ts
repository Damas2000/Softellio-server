import { PrismaService } from '../config/prisma.service';
import { UploadMediaDto, MediaType } from './dto/upload-media.dto';
import { Media } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
export declare class MediaService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: typeof cloudinary);
    uploadMedia(file: Express.Multer.File, uploadMediaDto: UploadMediaDto, tenantId: number, userId?: number): Promise<Media>;
    uploadMultipleMedia(files: Express.Multer.File[], uploadMediaDto: UploadMediaDto, tenantId: number, userId?: number): Promise<Media[]>;
    findAllMedia(tenantId: number, options?: {
        type?: MediaType;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: 'uploadedAt' | 'fileName' | 'size';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        media: ({
            uploadedBy: {
                email: string;
                id: number;
                name: string;
            };
        } & {
            format: string | null;
            id: number;
            tenantId: number;
            fileName: string | null;
            publicId: string;
            url: string;
            size: number | null;
            uploadedAt: Date;
            uploadedById: number | null;
        })[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOneMedia(id: number, tenantId: number): Promise<Media>;
    updateMedia(id: number, updateData: {
        fileName?: string;
    }, tenantId: number): Promise<Media>;
    deleteMedia(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    bulkDeleteMedia(ids: number[], tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    getMediaStats(tenantId: number): Promise<{
        totalCount: number;
        totalSize: number;
        typeBreakdown: Record<string, number>;
    }>;
    private uploadToCloudinary;
    private getMediaTypeFromMime;
    private getMediaTypeFromFormat;
    private getFormatsByType;
    private buildFolderPath;
    private sanitizeFileName;
    getOptimizedImageUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
        crop?: 'fill' | 'fit' | 'scale' | 'crop';
    }): Promise<string>;
}
