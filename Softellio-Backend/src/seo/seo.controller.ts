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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SEOService } from './seo.service';
import {
  CreateStructuredDataDto,
  UpdateStructuredDataDto,
  CreatePageSEODto,
  UpdatePageSEODto,
  CreateRedirectDto,
  UpdateRedirectDto,
  UpdateSitemapConfigDto,
  UpdateSEOIntegrationDto,
  CreateOGTemplateDto,
  UpdateOGTemplateDto,
  SEOQueryDto
} from './dto/seo.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('SEO & Meta Tag Management')
@Controller('seo')
export class SEOController {
  constructor(private readonly seoService: SEOService) {}

  // ==================== STRUCTURED DATA ROUTES ====================

  @Post('admin/structured-data')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create structured data schema (Admin)' })
  @ApiResponse({ status: 201, description: 'Structured data created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate entity' })
  createStructuredData(
    @Body() createStructuredDataDto: CreateStructuredDataDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.createStructuredData(createStructuredDataDto, tenantId);
  }

  @Get('admin/structured-data')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all structured data schemas (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'schemaType', type: String, required: false, description: 'Filter by schema type' })
  @ApiResponse({ status: 200, description: 'Structured data retrieved successfully' })
  findAllStructuredData(
    @CurrentTenant() tenantId: number,
    @Query() query: SEOQueryDto,
  ) {
    return this.seoService.findAllStructuredData(tenantId, query);
  }

  @Get('admin/structured-data/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get structured data by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Structured data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Structured data not found' })
  findStructuredDataById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.findStructuredDataById(id, tenantId);
  }

  @Patch('admin/structured-data/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update structured data (Admin)' })
  @ApiResponse({ status: 200, description: 'Structured data updated successfully' })
  @ApiResponse({ status: 404, description: 'Structured data not found' })
  updateStructuredData(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStructuredDataDto: UpdateStructuredDataDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updateStructuredData(id, updateStructuredDataDto, tenantId);
  }

  @Delete('admin/structured-data/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete structured data (Admin)' })
  @ApiResponse({ status: 200, description: 'Structured data deleted successfully' })
  @ApiResponse({ status: 404, description: 'Structured data not found' })
  removeStructuredData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.removeStructuredData(id, tenantId);
  }

  // ==================== PAGE SEO ROUTES ====================

  @Post('admin/page-seo')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create page-specific SEO settings (Admin)' })
  @ApiResponse({ status: 201, description: 'Page SEO created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate entity' })
  createPageSEO(
    @Body() createPageSEODto: CreatePageSEODto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.createPageSEO(createPageSEODto, tenantId);
  }

  @Get('admin/page-seo')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all page SEO settings (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' })
  @ApiResponse({ status: 200, description: 'Page SEO settings retrieved successfully' })
  findAllPageSEO(
    @CurrentTenant() tenantId: number,
    @Query() query: SEOQueryDto,
  ) {
    return this.seoService.findAllPageSEO(tenantId, query);
  }

  @Get('admin/page-seo/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page SEO by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Page SEO retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Page SEO not found' })
  findPageSEOById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.findPageSEOById(id, tenantId);
  }

  @Get('admin/page-seo/entity/:entityType/:entityId')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page SEO by entity (Admin)' })
  @ApiResponse({ status: 200, description: 'Page SEO retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Page SEO not found' })
  findPageSEOByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.findPageSEOByEntity(entityType, entityId, tenantId);
  }

  @Patch('admin/page-seo/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update page SEO (Admin)' })
  @ApiResponse({ status: 200, description: 'Page SEO updated successfully' })
  @ApiResponse({ status: 404, description: 'Page SEO not found' })
  updatePageSEO(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageSEODto: UpdatePageSEODto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updatePageSEO(id, updatePageSEODto, tenantId);
  }

  @Delete('admin/page-seo/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete page SEO (Admin)' })
  @ApiResponse({ status: 200, description: 'Page SEO deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page SEO not found' })
  removePageSEO(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.removePageSEO(id, tenantId);
  }

  // ==================== REDIRECT ROUTES ====================

  @Post('admin/redirects')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create URL redirect (Admin)' })
  @ApiResponse({ status: 201, description: 'Redirect created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate URL' })
  createRedirect(
    @Body() createRedirectDto: CreateRedirectDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.createRedirect(createRedirectDto, tenantId);
  }

  @Get('admin/redirects')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all URL redirects (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Redirects retrieved successfully' })
  findAllRedirects(
    @CurrentTenant() tenantId: number,
    @Query() query: SEOQueryDto,
  ) {
    return this.seoService.findAllRedirects(tenantId, query);
  }

  @Get('admin/redirects/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get redirect by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Redirect retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Redirect not found' })
  findRedirectById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.findRedirectById(id, tenantId);
  }

  @Patch('admin/redirects/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update redirect (Admin)' })
  @ApiResponse({ status: 200, description: 'Redirect updated successfully' })
  @ApiResponse({ status: 404, description: 'Redirect not found' })
  updateRedirect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRedirectDto: UpdateRedirectDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updateRedirect(id, updateRedirectDto, tenantId);
  }

  @Delete('admin/redirects/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete redirect (Admin)' })
  @ApiResponse({ status: 200, description: 'Redirect deleted successfully' })
  @ApiResponse({ status: 404, description: 'Redirect not found' })
  removeRedirect(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.removeRedirect(id, tenantId);
  }

  // ==================== SITEMAP ROUTES ====================

  @Get('admin/sitemap/config')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get sitemap configuration (Admin)' })
  @ApiResponse({ status: 200, description: 'Sitemap config retrieved successfully' })
  getSitemapConfig(@CurrentTenant() tenantId: number) {
    return this.seoService.getSitemapConfig(tenantId);
  }

  @Patch('admin/sitemap/config')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update sitemap configuration (Admin)' })
  @ApiResponse({ status: 200, description: 'Sitemap config updated successfully' })
  updateSitemapConfig(
    @Body() updateSitemapConfigDto: UpdateSitemapConfigDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updateSitemapConfig(updateSitemapConfigDto, tenantId);
  }

  @Post('admin/sitemap/generate')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Generate sitemap XML (Admin)' })
  @ApiResponse({ status: 200, description: 'Sitemap generated successfully' })
  async generateSitemap(
    @CurrentTenant() tenantId: number,
    @Res() res: Response,
  ) {
    const sitemapXml = await this.seoService.generateSitemap(tenantId);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="sitemap.xml"');

    return res.send(sitemapXml);
  }

  // ==================== SEO INTEGRATION ROUTES ====================

  @Get('admin/integrations')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get SEO integrations (Admin)' })
  @ApiResponse({ status: 200, description: 'SEO integrations retrieved successfully' })
  getSEOIntegration(@CurrentTenant() tenantId: number) {
    return this.seoService.getSEOIntegration(tenantId);
  }

  @Patch('admin/integrations')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update SEO integrations (Admin)' })
  @ApiResponse({ status: 200, description: 'SEO integrations updated successfully' })
  updateSEOIntegration(
    @Body() updateSEOIntegrationDto: UpdateSEOIntegrationDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updateSEOIntegration(updateSEOIntegrationDto, tenantId);
  }

  // ==================== OPEN GRAPH TEMPLATE ROUTES ====================

  @Post('admin/og-templates')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create Open Graph template (Admin)' })
  @ApiResponse({ status: 201, description: 'OG template created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createOGTemplate(
    @Body() createOGTemplateDto: CreateOGTemplateDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.createOGTemplate(createOGTemplateDto, tenantId);
  }

  @Get('admin/og-templates')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all Open Graph templates (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' })
  @ApiResponse({ status: 200, description: 'OG templates retrieved successfully' })
  findAllOGTemplates(
    @CurrentTenant() tenantId: number,
    @Query() query: SEOQueryDto,
  ) {
    return this.seoService.findAllOGTemplates(tenantId, query);
  }

  @Get('admin/og-templates/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get Open Graph template by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'OG template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'OG template not found' })
  findOGTemplateById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.findOGTemplateById(id, tenantId);
  }

  @Patch('admin/og-templates/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update Open Graph template (Admin)' })
  @ApiResponse({ status: 200, description: 'OG template updated successfully' })
  @ApiResponse({ status: 404, description: 'OG template not found' })
  updateOGTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOGTemplateDto: UpdateOGTemplateDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.updateOGTemplate(id, updateOGTemplateDto, tenantId);
  }

  @Delete('admin/og-templates/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete Open Graph template (Admin)' })
  @ApiResponse({ status: 200, description: 'OG template deleted successfully' })
  @ApiResponse({ status: 404, description: 'OG template not found' })
  removeOGTemplate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.seoService.removeOGTemplate(id, tenantId);
  }

  // ==================== SEO ANALYSIS ROUTES ====================

  @Get('admin/analysis')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get SEO analysis and recommendations (Admin)' })
  @ApiResponse({ status: 200, description: 'SEO analysis retrieved successfully' })
  getSEOAnalysis(@CurrentTenant() tenantId: number) {
    return this.seoService.getSEOAnalysis(tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/sitemap.xml')
  @Public()
  @ApiOperation({ summary: 'Get sitemap XML for public access' })
  @ApiResponse({ status: 200, description: 'Sitemap XML retrieved successfully', type: String })
  async getPublicSitemap(
    @CurrentTenant() tenantId: number,
    @Res() res: Response,
  ) {
    const sitemapXml = await this.seoService.generateSitemap(tenantId);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    return res.send(sitemapXml);
  }

  @Get('public/robots.txt')
  @Public()
  @ApiOperation({ summary: 'Get robots.txt for public access' })
  @ApiResponse({ status: 200, description: 'Robots.txt retrieved successfully', type: String })
  async getPublicRobotsTxt(
    @CurrentTenant() tenantId: number,
    @Res() res: Response,
  ) {
    const robotsTxt = await this.seoService.generateRobotsTxt(tenantId);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    return res.send(robotsTxt);
  }

  @Get('public/redirect/*')
  @Public()
  @ApiOperation({ summary: 'Handle URL redirects' })
  @ApiResponse({ status: 301, description: 'Permanent redirect' })
  @ApiResponse({ status: 302, description: 'Temporary redirect' })
  @ApiResponse({ status: 404, description: 'No redirect found' })
  async handleRedirect(
    @Param('*') fromPath: string,
    @CurrentTenant() tenantId: number,
    @Res() res: Response,
  ) {
    const normalizedPath = '/' + fromPath;
    const redirect = await this.seoService.findRedirectByFromUrl(normalizedPath, tenantId);

    if (!redirect || !redirect.isActive) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Track the redirect hit
    await this.seoService.trackRedirectHit(redirect.id, tenantId);

    return res.redirect(redirect.statusCode, redirect.toUrl);
  }

  // ==================== UTILITY ROUTES ====================

  @Get('admin/meta-preview/:entityType/:entityId')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Preview meta tags for an entity (Admin)' })
  @ApiResponse({ status: 200, description: 'Meta tag preview generated successfully' })
  async getMetaPreview(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query('language') language: string = 'tr',
    @CurrentTenant() tenantId: number,
  ) {
    const pageSEO = await this.seoService.findPageSEOByEntity(entityType, entityId, tenantId);

    if (!pageSEO) {
      return {
        has_custom_seo: false,
        preview: {
          title: 'No custom SEO configured',
          description: 'Using default site meta tags',
          og_title: null,
          og_description: null,
          og_image: null,
          robots: 'index, follow',
        },
      };
    }

    const translation = pageSEO.translations.find(t => t.language === language);

    return {
      has_custom_seo: true,
      preview: {
        title: translation?.metaTitle || 'No title configured',
        description: translation?.metaDescription || 'No description configured',
        keywords: translation?.metaKeywords || null,
        og_title: translation?.ogTitle || translation?.metaTitle || null,
        og_description: translation?.ogDescription || translation?.metaDescription || null,
        og_image: translation?.ogImage || null,
        og_type: translation?.ogType || 'website',
        twitter_card: translation?.twitterCard || 'summary_large_image',
        canonical_url: pageSEO.canonicalUrl || null,
        robots: pageSEO.customRobots || (pageSEO.noIndex ? 'noindex' : 'index') + ', ' + (pageSEO.noFollow ? 'nofollow' : 'follow'),
        sitemap_priority: pageSEO.priority || 0.5,
        sitemap_changefreq: pageSEO.changeFreq || 'monthly',
      },
    };
  }

  @Get('admin/seo-health-check')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Comprehensive SEO health check (Admin)' })
  @ApiResponse({ status: 200, description: 'SEO health check completed successfully' })
  async getSEOHealthCheck(@CurrentTenant() tenantId: number) {
    const analysis = await this.seoService.getSEOAnalysis(tenantId);

    const recommendations = [];

    // Generate specific recommendations based on analysis
    if (analysis.structured_data.active === 0) {
      recommendations.push({
        priority: 'high',
        category: 'structured_data',
        message: 'Add structured data for your organization to improve search visibility',
        action: 'Create Organization schema markup',
      });
    }

    if (analysis.page_seo.configured_pages < 5) {
      recommendations.push({
        priority: 'medium',
        category: 'page_seo',
        message: 'Configure custom meta tags for important pages',
        action: 'Add SEO settings to key pages, services, and blog posts',
      });
    }

    if (!analysis.integrations.google_analytics) {
      recommendations.push({
        priority: 'medium',
        category: 'tracking',
        message: 'Set up Google Analytics to track website performance',
        action: 'Add Google Analytics tracking code',
      });
    }

    if (!analysis.integrations.search_console) {
      recommendations.push({
        priority: 'medium',
        category: 'verification',
        message: 'Verify your site with Google Search Console',
        action: 'Add Google Search Console verification meta tag',
      });
    }

    if (analysis.og_templates.total === 0) {
      recommendations.push({
        priority: 'low',
        category: 'social',
        message: 'Create Open Graph templates for better social sharing',
        action: 'Set up OG templates for different content types',
      });
    }

    return {
      ...analysis,
      recommendations,
      last_checked: new Date().toISOString(),
    };
  }
}