import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadMediaDto, MediaType } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Media Management')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ==================== UPLOAD ROUTES ====================

  @Post('admin/upload')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single media file (Admin)' })
  @ApiBody({
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
          enum: Object.values(MediaType),
          description: 'Media type',
        },
        folder: {
          type: 'string',
          description: 'Folder/category',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload error' })
  uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @CurrentTenant() tenantId: number,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadMedia(file, uploadMediaDto, tenantId, user.id);
  }

  @Post('admin/upload/multiple')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple media files (Admin)' })
  @ApiBody({
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
          enum: Object.values(MediaType),
          description: 'Media type',
        },
        folder: {
          type: 'string',
          description: 'Folder/category',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or upload error' })
  uploadMultipleMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadMediaDto: UploadMediaDto,
    @CurrentTenant() tenantId: number,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadMultipleMedia(files, uploadMediaDto, tenantId, user.id);
  }

  // ==================== MEDIA MANAGEMENT ROUTES ====================

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all media files (Admin)' })
  @ApiQuery({ name: 'type', enum: MediaType, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'sortBy', enum: ['uploadedAt', 'fileName', 'size'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'List of media files with pagination' })
  findAllMedia(
    @CurrentTenant() tenantId: number,
    @Query('type') type?: MediaType,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'uploadedAt' | 'fileName' | 'size',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.mediaService.findAllMedia(tenantId, {
      type,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get media statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Media statistics' })
  getMediaStats(@CurrentTenant() tenantId: number) {
    return this.mediaService.getMediaStats(tenantId);
  }

  @Delete('admin/bulk')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete media files (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk delete completed' })
  bulkDeleteMedia(
    @Body() body: { ids: number[] },
    @CurrentTenant() tenantId: number,
  ) {
    return this.mediaService.bulkDeleteMedia(body.ids, tenantId);
  }

  @Get('admin/:id/optimized')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get optimized image URL (Admin)' })
  @ApiQuery({ name: 'width', type: Number, required: false })
  @ApiQuery({ name: 'height', type: Number, required: false })
  @ApiQuery({ name: 'quality', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'crop', required: false })
  @ApiResponse({ status: 200, description: 'Optimized image URL' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async getOptimizedImage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Query('width') width?: number,
    @Query('height') height?: number,
    @Query('quality') quality?: string,
    @Query('format') format?: string,
    @Query('crop') crop?: string,
  ) {
    // First, get the media to verify it exists and get publicId
    const media = await this.mediaService.findOneMedia(id, tenantId);

    const optimizedUrl = await this.mediaService.getOptimizedImageUrl(media.publicId, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      quality: quality === 'auto' ? 'auto' : quality ? Number(quality) : 'auto',
      format: format as any,
      crop: crop as any,
    });

    return { url: optimizedUrl, publicId: media.publicId };
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get media by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Media details' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  findOneMedia(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.mediaService.findOneMedia(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update media metadata (Admin)' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body - only fileName is allowed' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  updateMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.mediaService.updateMedia(id, updateMediaDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete media file (Admin)' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  deleteMedia(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.mediaService.deleteMedia(id, tenantId);
  }

  // ==================== IMAGE OPTIMIZATION ROUTES ====================

  // ==================== PUBLIC ROUTES (for content delivery) ====================

  @Get('public/image/:publicId/optimized')
  @Public()
  @ApiOperation({ summary: 'Get optimized public image URL (Public)' })
  @ApiQuery({ name: 'w', type: Number, required: false, description: 'Width' })
  @ApiQuery({ name: 'h', type: Number, required: false, description: 'Height' })
  @ApiQuery({ name: 'q', required: false, description: 'Quality' })
  @ApiQuery({ name: 'f', required: false, description: 'Format' })
  @ApiQuery({ name: 'c', required: false, description: 'Crop mode' })
  @ApiResponse({ status: 200, description: 'Optimized image URL for public use' })
  async getPublicOptimizedImage(
    @Param('publicId') publicId: string,
    @Query('w') width?: number,
    @Query('h') height?: number,
    @Query('q') quality?: string,
    @Query('f') format?: string,
    @Query('c') crop?: string,
  ) {
    const optimizedUrl = await this.mediaService.getOptimizedImageUrl(publicId, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      quality: quality === 'auto' ? 'auto' : quality ? Number(quality) : 'auto',
      format: format as any,
      crop: crop as any,
    });

    return { url: optimizedUrl };
  }
}