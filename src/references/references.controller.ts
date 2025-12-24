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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReferencesService } from './references.service';
import { CreateReferenceDto, UpdateReferenceDto, ReferenceQueryDto, BulkReferenceDeleteDto, ReferenceReorderDto } from './dto/reference.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('References & Portfolio')
@Controller('references')
export class ReferencesController {
  constructor(private readonly referencesService: ReferencesService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create new reference project (Admin)' })
  @ApiResponse({ status: 201, description: 'Reference created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() createReferenceDto: CreateReferenceDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.create(createReferenceDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all references with filtering (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' })
  @ApiQuery({ name: 'client', type: String, required: false, description: 'Filter by client name' })
  @ApiQuery({ name: 'year', type: Number, required: false, description: 'Filter by project year' })
  @ApiQuery({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'projectDate', 'title'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'References retrieved successfully' })
  findAll(
    @CurrentTenant() tenantId: number,
    @Query() query: ReferenceQueryDto,
  ) {
    return this.referencesService.findAll(tenantId, query);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get references statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'References statistics retrieved successfully' })
  getStats(@CurrentTenant() tenantId: number) {
    return this.referencesService.getStats(tenantId);
  }

  @Get('admin/categories')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get available categories (Admin)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories(@CurrentTenant() tenantId: number) {
    return this.referencesService.getCategories(tenantId);
  }

  @Get('admin/years')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get available project years (Admin)' })
  @ApiResponse({ status: 200, description: 'Years retrieved successfully' })
  getYears(@CurrentTenant() tenantId: number) {
    return this.referencesService.getYears(tenantId);
  }

  @Get('admin/featured')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get featured references (Admin)' })
  @ApiResponse({ status: 200, description: 'Featured references retrieved successfully' })
  getFeatured(@CurrentTenant() tenantId: number) {
    return this.referencesService.findFeatured(tenantId);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get reference by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Reference retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.findOne(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update reference (Admin)' })
  @ApiResponse({ status: 200, description: 'Reference updated successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReferenceDto: UpdateReferenceDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.update(id, updateReferenceDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete reference (Admin)' })
  @ApiResponse({ status: 200, description: 'Reference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.remove(id, tenantId);
  }

  @Delete('admin/bulk')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete references (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk delete completed' })
  @ApiResponse({ status: 400, description: 'Invalid request body or validation error' })
  bulkDelete(
    @Body() bulkDeleteDto: BulkReferenceDeleteDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.bulkDelete(bulkDeleteDto.ids, tenantId);
  }

  @Patch('admin/reorder')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder references (Admin)' })
  @ApiResponse({ status: 200, description: 'References reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body or validation error' })
  reorder(
    @Body() reorderDto: ReferenceReorderDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.reorder(reorderDto.references, tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:language')
  @Public()
  @ApiOperation({ summary: 'Get public references for specific language' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' })
  @ApiQuery({ name: 'client', type: String, required: false, description: 'Filter by client name' })
  @ApiQuery({ name: 'year', type: Number, required: false, description: 'Filter by project year' })
  @ApiResponse({ status: 200, description: 'Public references retrieved successfully' })
  findPublic(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query() query: ReferenceQueryDto,
  ) {
    return this.referencesService.findPublicReferences(tenantId, language, query);
  }

  @Get('public/:language/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured references for public display' })
  @ApiResponse({ status: 200, description: 'Featured references retrieved successfully' })
  async getFeaturedPublic(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const featuredReferences = await this.referencesService.findFeatured(tenantId);

    // Format for public display with specific language
    const formattedReferences = featuredReferences.map(reference => ({
      id: reference.id,
      imageUrl: reference.imageUrl,
      projectUrl: reference.projectUrl,
      clientName: reference.clientName,
      projectDate: reference.projectDate,
      category: reference.category,
      order: reference.order,
      translation: reference.translations.find(t => t.language === language) || null,
      gallery: reference.gallery,
    })).filter(reference => reference.translation); // Only include references with translation in the requested language

    return { references: formattedReferences };
  }

  @Get('public/:language/categories/:category')
  @Public()
  @ApiOperation({ summary: 'Get references by category for public display' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'References by category retrieved successfully' })
  async getByCategory(
    @Param('language') language: string,
    @Param('category') category: string,
    @CurrentTenant() tenantId: number,
    @Query() query: ReferenceQueryDto,
  ) {
    query.category = category; // Set category filter
    return this.referencesService.findPublicReferences(tenantId, language, query);
  }

  @Get('public/:language/:slug')
  @Public()
  @ApiOperation({ summary: 'Get reference by slug for public display' })
  @ApiResponse({ status: 200, description: 'Reference retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  findBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.referencesService.findBySlug(slug, language, tenantId);
  }

  // ==================== PORTFOLIO SHOWCASE ROUTES ====================

  @Get('public/:language/showcase/latest')
  @Public()
  @ApiOperation({ summary: 'Get latest 6 projects for homepage showcase' })
  @ApiResponse({ status: 200, description: 'Latest projects retrieved successfully' })
  async getLatestShowcase(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const result = await this.referencesService.findPublicReferences(
      tenantId,
      language,
      { limit: 6, sortBy: 'projectDate', sortOrder: 'desc' }
    );

    return {
      showcase: result.references,
      title: 'Latest Projects',
      subtitle: 'Our most recent completed projects'
    };
  }

  @Get('public/:language/showcase/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured projects showcase' })
  @ApiResponse({ status: 200, description: 'Featured projects showcase retrieved successfully' })
  async getFeaturedShowcase(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const result = await this.referencesService.findPublicReferences(
      tenantId,
      language,
      { featured: true, limit: 8 }
    );

    return {
      showcase: result.references,
      title: 'Featured Projects',
      subtitle: 'Our most notable and successful projects'
    };
  }

  @Get('public/:language/portfolio/grid')
  @Public()
  @ApiOperation({ summary: 'Get portfolio in grid format for gallery display' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'year', type: Number, required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'Portfolio grid retrieved successfully' })
  async getPortfolioGrid(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query() query: ReferenceQueryDto,
  ) {
    const result = await this.referencesService.findPublicReferences(
      tenantId,
      language,
      { ...query, limit: 50 } // Higher limit for grid display
    );

    // Format for grid display (simplified data)
    const portfolioGrid = result.references.map(reference => ({
      id: reference.id,
      title: reference.translation?.title || 'Untitled Project',
      slug: reference.translation?.slug || `project-${reference.id}`,
      imageUrl: reference.imageUrl,
      category: reference.category,
      clientName: reference.clientName,
      projectDate: reference.projectDate,
      isFeatured: reference.isFeatured,
    }));

    return {
      portfolio: portfolioGrid,
      total: result.total,
      categories: await this.referencesService.getCategories(tenantId),
      years: await this.referencesService.getYears(tenantId),
    };
  }

  // ==================== SEO & SITEMAP ROUTES ====================

  @Get('public/:language/sitemap')
  @Public()
  @ApiOperation({ summary: 'Get references sitemap data' })
  @ApiResponse({ status: 200, description: 'Sitemap data retrieved successfully' })
  async getSitemap(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const references = await this.referencesService.findPublicReferences(tenantId, language, {
      limit: 1000, // High limit for sitemap
    });

    const sitemapData = references.references
      .filter(reference => reference.translation)
      .map(reference => ({
        slug: reference.translation!.slug,
        lastModified: reference.projectDate || new Date(),
        changeFreq: 'monthly',
        priority: reference.isFeatured ? 0.8 : 0.6,
        category: reference.category,
      }));

    return { references: sitemapData };
  }

  // ==================== STATISTICS ROUTES ====================

  @Get('public/:language/stats')
  @Public()
  @ApiOperation({ summary: 'Get public portfolio statistics' })
  @ApiResponse({ status: 200, description: 'Portfolio statistics retrieved successfully' })
  async getPublicStats(
    @CurrentTenant() tenantId: number,
  ) {
    const stats = await this.referencesService.getStats(tenantId);

    // Return only public-safe statistics
    return {
      totalProjects: stats.active,
      featuredProjects: stats.featured,
      categories: Object.keys(stats.byCategory),
      projectYears: Object.keys(stats.byYear).map(Number).sort((a, b) => b - a),
    };
  }
}