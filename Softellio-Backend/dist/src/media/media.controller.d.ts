import { MediaService } from './media.service';
import { UploadMediaDto, MediaType } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { BulkDeleteDto } from '../common/dto/bulk-delete.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadMedia(file: Express.Multer.File, uploadMediaDto: UploadMediaDto, tenantId: number, user: any): Promise<{
        format: string | null;
        id: number;
        tenantId: number;
        fileName: string | null;
        publicId: string;
        url: string;
        size: number | null;
        uploadedAt: Date;
        uploadedById: number | null;
    }>;
    uploadMultipleMedia(files: Express.Multer.File[], uploadMediaDto: UploadMediaDto, tenantId: number, user: any): Promise<{
        format: string | null;
        id: number;
        tenantId: number;
        fileName: string | null;
        publicId: string;
        url: string;
        size: number | null;
        uploadedAt: Date;
        uploadedById: number | null;
    }[]>;
    findAllMedia(tenantId: number, type?: MediaType, search?: string, page?: number, limit?: number, sortBy?: 'uploadedAt' | 'fileName' | 'size', sortOrder?: 'asc' | 'desc'): Promise<{
        media: ({
            uploadedBy: {
                name: string;
                id: number;
                email: string;
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
    getMediaStats(tenantId: number): Promise<{
        totalCount: number;
        totalSize: number;
        typeBreakdown: Record<string, number>;
    }>;
    bulkDeleteMedia(bulkDeleteDto: BulkDeleteDto, tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    bulkDeleteDeprecated(body: any): never;
    getOptimizedImage(id: number, tenantId: number, width?: number, height?: number, quality?: string, format?: string, crop?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    findOneMedia(id: number, tenantId: number): Promise<{
        format: string | null;
        id: number;
        tenantId: number;
        fileName: string | null;
        publicId: string;
        url: string;
        size: number | null;
        uploadedAt: Date;
        uploadedById: number | null;
    }>;
    updateMedia(id: number, updateMediaDto: UpdateMediaDto, tenantId: number): Promise<{
        format: string | null;
        id: number;
        tenantId: number;
        fileName: string | null;
        publicId: string;
        url: string;
        size: number | null;
        uploadedAt: Date;
        uploadedById: number | null;
    }>;
    deleteMedia(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    getPublicOptimizedImage(publicId: string, width?: number, height?: number, quality?: string, format?: string, crop?: string): Promise<{
        url: string;
    }>;
}
