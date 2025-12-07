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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageWithTranslations } from '../common/types';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new page (Admin)' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  @ApiResponse({ status: 409, description: 'Slug conflict in specified language' })
  create(
    @Body() createPageDto: CreatePageDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.create(createPageDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all pages for admin (Admin)' })
  @ApiQuery({ name: 'status', enum: PageStatus, required: false })
  @ApiQuery({ name: 'language', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'List of pages with pagination' })
  findAllAdmin(
    @CurrentTenant() tenantId: number,
    @Query('status') status?: PageStatus,
    @Query('language') language?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pagesService.findAll(tenantId, {
      status,
      language,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Page details with all translations' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.findOne(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update page (Admin)' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.update(id, updatePageDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete page (Admin)' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.remove(id, tenantId);
  }

  @Post('admin/:id/duplicate')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Duplicate page (Admin)' })
  @ApiResponse({ status: 201, description: 'Page duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  duplicate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.duplicate(id, tenantId);
  }

  @Delete('admin/bulk')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete pages (Admin)' })
  @ApiResponse({ status: 200, description: 'Pages deleted successfully' })
  bulkDelete(
    @Body() body: { ids: number[] },
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.bulkDelete(body.ids, tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:language')
  @Public()
  @ApiOperation({ summary: 'Get published pages by language (Public)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'List of published pages in specified language' })
  findPublicPages(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pagesService.findAll(tenantId, {
      status: PageStatus.PUBLISHED,
      language,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('public/:language/:slug')
  @Public()
  @ApiOperation({ summary: 'Get published page by slug and language (Public)' })
  @ApiResponse({ status: 200, description: 'Page content in specified language' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.findBySlug(slug, language, tenantId, false);
  }

  @Get('public/:language/list')
  @Public()
  @ApiOperation({ summary: 'Get all published pages in a language (Public)' })
  @ApiResponse({ status: 200, description: 'List of published pages for navigation/sitemap' })
  getPagesByLanguage(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.getPagesByLanguage(language, tenantId, true);
  }

  // ==================== PREVIEW ROUTES (Admin with unpublished) ====================

  @Get('preview/:language/:slug')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Preview page by slug (including unpublished) (Admin)' })
  @ApiResponse({ status: 200, description: 'Page content preview' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  previewBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.pagesService.findBySlug(slug, language, tenantId, true);
  }
}