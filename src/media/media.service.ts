import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UploadMediaDto, MediaType } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { CLOUDINARY } from '../config/cloudinary.provider';
import { Media } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    @Inject(CLOUDINARY) private cloudinaryService: typeof cloudinary,
  ) {}

  async uploadMedia(
    file: Express.Multer.File,
    uploadMediaDto: UploadMediaDto,
    tenantId: number,
    userId?: number,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large (max 50MB)');
    }

    // Determine media type from file
    const detectedType = this.getMediaTypeFromMime(file.mimetype);
    const mediaType = uploadMediaDto.type || detectedType;

    // Create folder structure for organization
    const folderPath = this.buildFolderPath(tenantId, uploadMediaDto.folder, mediaType);

    try {
      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(file, folderPath, uploadMediaDto.fileName);

      // Save to database
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
    } catch (error) {
      console.error('Media upload error:', error);
      throw new BadRequestException('Failed to upload media: ' + error.message);
    }
  }

  async uploadMultipleMedia(
    files: Express.Multer.File[],
    uploadMediaDto: UploadMediaDto,
    tenantId: number,
    userId?: number,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map(file =>
      this.uploadMedia(file, uploadMediaDto, tenantId, userId)
    );

    try {
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw new BadRequestException('Failed to upload some files: ' + error.message);
    }
  }

  async findAllMedia(
    tenantId: number,
    options: {
      type?: MediaType;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: 'uploadedAt' | 'fileName' | 'size';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    // Filter by media type if specified
    if (type) {
      whereClause.format = this.getFormatsByType(type);
    }

    // Search in filename if specified
    if (search) {
      whereClause.fileName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const orderBy: any = {};
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

  async findOneMedia(id: number, tenantId: number): Promise<Media> {
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
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async updateMedia(
    id: number,
    updateMediaDto: UpdateMediaDto,
    tenantId: number,
  ): Promise<Media> {
    // Check if media exists
    await this.findOneMedia(id, tenantId);

    return this.prisma.media.update({
      where: { id },
      data: updateMediaDto,
    });
  }

  async deleteMedia(id: number, tenantId: number): Promise<{ message: string }> {
    // Check if media exists
    const media = await this.findOneMedia(id, tenantId);

    try {
      // Delete from Cloudinary
      await this.cloudinaryService.uploader.destroy(media.publicId);

      // Delete from database
      await this.prisma.media.delete({
        where: { id },
      });

      return { message: 'Media deleted successfully' };
    } catch (error) {
      console.error('Media deletion error:', error);
      throw new BadRequestException('Failed to delete media: ' + error.message);
    }
  }

  async bulkDeleteMedia(ids: number[], tenantId: number): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.deleteMedia(id, tenantId);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete media ${id}:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }

  async getMediaStats(tenantId: number) {
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

    // Group by media type
    const typeStats = mediaByType.reduce((acc, item) => {
      const type = this.getMediaTypeFromFormat(item.format);
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCount,
      totalSize: totalSize._sum.size || 0,
      typeBreakdown: typeStats,
    };
  }

  // ==================== HELPER METHODS ====================

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    customFileName?: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: 'auto', // Automatically detect file type
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
          } else {
            resolve(result);
          }
        })
        .end(file.buffer);
    });
  }

  private getMediaTypeFromMime(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    if (mimetype.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  private getMediaTypeFromFormat(format: string): MediaType {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'flac', 'aac'];

    const lowerFormat = format.toLowerCase();

    if (imageFormats.includes(lowerFormat)) return MediaType.IMAGE;
    if (videoFormats.includes(lowerFormat)) return MediaType.VIDEO;
    if (audioFormats.includes(lowerFormat)) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  private getFormatsByType(type: MediaType): { in: string[] } {
    const formats: Record<MediaType, string[]> = {
      [MediaType.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
      [MediaType.VIDEO]: ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv'],
      [MediaType.AUDIO]: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
      [MediaType.DOCUMENT]: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'],
    };

    return { in: formats[type] };
  }

  private buildFolderPath(tenantId: number, customFolder?: string, mediaType?: MediaType): string {
    const basePath = `tenant-${tenantId}`;
    const typePath = mediaType || 'general';
    const customPath = customFolder ? `/${customFolder}` : '';

    return `${basePath}/${typePath}${customPath}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  // ==================== PUBLIC IMAGE TRANSFORMATION ====================

  async getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
    } = {},
  ): Promise<string> {
    const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

    return this.cloudinaryService.url(publicId, {
      width,
      height,
      crop,
      quality,
      fetch_format: format,
    });
  }
}