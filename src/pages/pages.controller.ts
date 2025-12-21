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
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { PagesService } from './pages.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import {
  PageResponseDto,
  PaginatedPageResponseDto,
  PageDeleteResponseDto,
  BulkDeleteResponseDto
} from './dto/page-response.dto';
import { BulkPageDeleteDto } from './dto/bulk-page-operation.dto';
import { PageWithTranslations } from '../common/types';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  private readonly logger = new Logger(PagesController.name);

  constructor(private readonly pagesService: PagesService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new page (Admin)' })
  @ApiResponse({ status: 201, type: PageResponseDto, description: 'Page created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body or slug format' })
  @ApiResponse({ status: 409, description: 'Slug already exists in specified language' })
  async create(
    @Body() createPageDto: CreatePageDto,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-create-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to create page for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        tenantId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all pages with advanced filtering (Admin)' })
  @ApiResponse({ status: 200, type: PaginatedPageResponseDto, description: 'Paginated list of pages' })
  async findAllAdmin(
    @CurrentTenant() tenantId: number,
    @Query() query: PageQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedPageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-list-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to fetch pages for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        tenantId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page by ID (Admin)' })
  @ApiResponse({ status: 200, type: PageResponseDto, description: 'Page details with all translations' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-get-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to fetch page ${id} for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        pageId: id,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update page (Admin)' })
  @ApiResponse({ status: 200, type: PageResponseDto, description: 'Page updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body or slug format' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists in specified language' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-update-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to update page ${id} for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        pageId: id,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete page (Admin)' })
  @ApiResponse({ status: 200, type: PageDeleteResponseDto, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<PageDeleteResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-delete-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to delete page ${id} for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        pageId: id,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  @Post('admin/:id/duplicate')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Duplicate page (Admin)' })
  @ApiResponse({ status: 201, type: PageResponseDto, description: 'Page duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-duplicate-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to duplicate page ${id} for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        pageId: id,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  @Delete('admin/bulk')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete pages (Admin)' })
  @ApiResponse({ status: 200, type: BulkDeleteResponseDto, description: 'Pages deleted successfully' })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkPageDeleteDto,
    @CurrentTenant() tenantId: number,
    @Req() req: Request,
  ): Promise<BulkDeleteResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `page-bulk-delete-${Date.now()}`;

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
    } catch (error) {
      this.logger.error(`Failed to bulk delete pages for tenant ${tenantId}: ${error.message}`, {
        correlationId,
        tenantId,
        pageIds: bulkDeleteDto.ids,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:language')
  @Public()
  @ApiOperation({ summary: 'Get published pages by language (Public)' })
  @ApiResponse({ status: 200, type: PaginatedPageResponseDto, description: 'List of published pages in specified language' })
  async findPublicPages(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query() query: PageQueryDto,
  ): Promise<PaginatedPageResponseDto> {
    // Force published status and language for public route
    const publicQuery = {
      ...query,
      status: PageStatus.PUBLISHED,
      language,
    };

    return this.pagesService.findAll(tenantId, publicQuery);
  }

  @Get('public/:language/:slug')
  @Public()
  @ApiOperation({ summary: 'Get published page by slug and language (Public)' })
  @ApiResponse({ status: 200, type: PageResponseDto, description: 'Page content in specified language' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async findBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ): Promise<PageResponseDto> {
    return this.pagesService.findBySlug(slug, language, tenantId, false);
  }

  @Get('public/:language/list')
  @Public()
  @ApiOperation({ summary: 'Get all published pages in a language (Public)' })
  @ApiResponse({ status: 200, type: [PageResponseDto], description: 'List of published pages for navigation/sitemap' })
  async getPagesByLanguage(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number
  ): Promise<PageResponseDto[]> {
    return this.pagesService.getPagesByLanguage(language, tenantId, true);
  }

  // ==================== PREVIEW ROUTES (Admin with unpublished) ====================

  @Get('preview/:language/:slug')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Preview page by slug (including unpublished) (Admin)' })
  @ApiResponse({ status: 200, type: PageResponseDto, description: 'Page content preview' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async previewBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ): Promise<PageResponseDto> {
    return this.pagesService.findBySlug(slug, language, tenantId, true);
  }
}