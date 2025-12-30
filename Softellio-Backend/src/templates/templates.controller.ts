import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { SiteConfigService } from './site-config.service';
import { DynamicPagesService } from './dynamic-pages.service';
import {
  CreateTemplateDto,
  TemplateResponseDto
} from './dto/template.dto';
import {
  UpsertSiteConfigDto,
  SiteConfigResponseDto
} from './dto/site-config.dto';
import {
  CreateDynamicPageDto,
  UpdateDynamicPageDto,
  DynamicPageResponseDto,
  PageListItemDto
} from './dto/dynamic-page.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';

@ApiTags('Templates & Site Management')
@Controller('templates')
@ApiBearerAuth()
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly siteConfigService: SiteConfigService,
    private readonly dynamicPagesService: DynamicPagesService
  ) {}

  // ==================== TEMPLATE ROUTES (READ-ONLY) ====================

  @Get()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all available templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: [TemplateResponseDto],
  })
  async getTemplates() {
    return await this.templatesService.findAllActive();
  }

  @Get(':key')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get template by key' })
  @ApiParam({ name: 'key', description: 'Template key', example: 'printing-premium-v1' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(@Param('key') key: string) {
    return await this.templatesService.findByKey(key);
  }

  @Get(':key/supported-sections')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get supported sections for template' })
  @ApiParam({ name: 'key', description: 'Template key', example: 'printing-premium-v1' })
  @ApiResponse({
    status: 200,
    description: 'Supported sections retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        templateKey: { type: 'string', example: 'printing-premium-v1' },
        supportedSections: {
          type: 'array',
          items: { type: 'string' },
          example: ['hero', 'services', 'testimonials', 'contact']
        }
      }
    },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getSupportedSections(@Param('key') key: string) {
    const sections = await this.templatesService.getSupportedSections(key);
    return {
      templateKey: key,
      supportedSections: sections
    };
  }

  // ==================== SITE CONFIG ROUTES ====================

  @Get('site/config')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get tenant site configuration' })
  @ApiResponse({
    status: 200,
    description: 'Site configuration retrieved successfully',
    type: SiteConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Site configuration not found' })
  async getSiteConfig(@CurrentTenant() tenantId: number) {
    const config = await this.siteConfigService.getForTenant(tenantId);
    if (!config) {
      return {
        message: 'No site configuration found. Please set up your site configuration first.',
        suggestedAction: 'POST /templates/site/config'
      };
    }
    return config;
  }

  @Post('site/config')
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create or update site configuration' })
  @ApiResponse({
    status: 200,
    description: 'Site configuration created/updated successfully',
    type: SiteConfigResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  async upsertSiteConfig(
    @CurrentTenant() tenantId: number,
    @Body() upsertDto: UpsertSiteConfigDto
  ) {
    return await this.siteConfigService.upsert(tenantId, upsertDto);
  }

  @Post('site/initialize/:templateKey')
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Initialize site configuration from template' })
  @ApiParam({ name: 'templateKey', description: 'Template key', example: 'printing-premium-v1' })
  @ApiResponse({
    status: 200,
    description: 'Site configuration initialized successfully',
    type: SiteConfigResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid template or configuration already exists' })
  async initializeSiteConfig(
    @CurrentTenant() tenantId: number,
    @Param('templateKey') templateKey: string
  ) {
    return await this.siteConfigService.initializeFromTemplate(tenantId, templateKey);
  }

  @Delete('site/config')
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete site configuration' })
  @ApiResponse({ status: 200, description: 'Site configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Site configuration not found' })
  async deleteSiteConfig(@CurrentTenant() tenantId: number) {
    await this.siteConfigService.delete(tenantId);
    return { message: 'Site configuration deleted successfully' };
  }

  // ==================== PAGE MANAGEMENT ROUTES ====================

  @Get('pages')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all pages for tenant' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Pages retrieved successfully',
    type: [PageListItemDto],
  })
  async getPages(
    @CurrentTenant() tenantId: number,
    @Query('lang') language: string = 'tr'
  ) {
    return await this.dynamicPagesService.findAllForTenant(tenantId, language);
  }

  @Get('pages/:id')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page retrieved successfully',
    type: DynamicPageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getPage(
    @CurrentTenant() tenantId: number,
    @Param('id') pageId: string
  ) {
    return await this.dynamicPagesService.findById(tenantId, pageId);
  }

  @Post('pages')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create new page' })
  @ApiResponse({
    status: 201,
    description: 'Page created successfully',
    type: DynamicPageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid page data' })
  @ApiResponse({ status: 409, description: 'Page with this slug already exists' })
  async createPage(
    @CurrentTenant() tenantId: number,
    @Body() createDto: CreateDynamicPageDto
  ) {
    return await this.dynamicPagesService.create(tenantId, createDto);
  }

  @Put('pages/:id')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update page' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page updated successfully',
    type: DynamicPageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async updatePage(
    @CurrentTenant() tenantId: number,
    @Param('id') pageId: string,
    @Body() updateDto: UpdateDynamicPageDto
  ) {
    return await this.dynamicPagesService.update(tenantId, pageId, updateDto);
  }

  @Put('pages/:id/publish')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Publish page' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page published successfully',
    type: DynamicPageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async publishPage(
    @CurrentTenant() tenantId: number,
    @Param('id') pageId: string
  ) {
    return await this.dynamicPagesService.setPublishStatus(tenantId, pageId, true);
  }

  @Put('pages/:id/unpublish')
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Unpublish page' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page unpublished successfully',
    type: DynamicPageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async unpublishPage(
    @CurrentTenant() tenantId: number,
    @Param('id') pageId: string
  ) {
    return await this.dynamicPagesService.setPublishStatus(tenantId, pageId, false);
  }

  @Delete('pages/:id')
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete page' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete homepage' })
  async deletePage(
    @CurrentTenant() tenantId: number,
    @Param('id') pageId: string
  ) {
    await this.dynamicPagesService.delete(tenantId, pageId);
    return { message: 'Page deleted successfully' };
  }

  // ==================== ADMIN ONLY ROUTES ====================

  @Post('admin/templates')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new template (Super Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiResponse({ status: 409, description: 'Template with this key already exists' })
  async createTemplate(@Body() createDto: CreateTemplateDto) {
    return await this.templatesService.create(createDto);
  }

  @Get('admin/templates')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all templates including inactive (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All templates retrieved successfully',
    type: [TemplateResponseDto],
  })
  async getAllTemplatesForAdmin() {
    return await this.templatesService.findAllForAdmin();
  }

  @Delete('admin/templates/:key')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate template (Super Admin only)' })
  @ApiParam({ name: 'key', description: 'Template key', example: 'printing-premium-v1' })
  @ApiResponse({ status: 200, description: 'Template deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deactivateTemplate(@Param('key') key: string) {
    await this.templatesService.deactivate(key);
    return { message: `Template "${key}" deactivated successfully` };
  }
}