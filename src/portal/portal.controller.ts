import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
  TenantQueryDto,
  PaginatedTenantResponseDto,
} from './dto/tenant.dto';
import {
  CreatePageDto,
  UpdatePageDto,
  PageResponseDto,
  PageQueryDto,
  PaginatedPageResponseDto,
  PublishPageDto,
} from './dto/page.dto';
import {
  CreateLayoutDto,
  UpdateLayoutDto,
  LayoutResponseDto,
  LayoutQueryDto,
  PaginatedLayoutResponseDto,
  CreateSectionDto,
  UpdateSectionDto,
  SectionResponseDto,
  ReorderSectionsDto,
} from './dto/layout.dto';

@ApiTags('Portal Management')
@Controller('portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PortalController {
  private readonly logger = new Logger(PortalController.name);

  constructor(private readonly portalService: PortalService) {}

  // ================== TENANT MANAGEMENT ==================

  @Get('tenants')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all tenants',
    description: 'Retrieve all tenants with filtering and pagination. Super admin only.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or domain' })
  @ApiQuery({ name: 'subscriptionStatus', required: false, enum: ['trial', 'active', 'expired', 'canceled', 'past_due'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrieved successfully',
    type: PaginatedTenantResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super admin access required',
  })
  async getAllTenants(
    @Query() query: TenantQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedTenantResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-tenants-${Date.now()}`;

    this.logger.log('Getting all tenants', { correlationId, query });

    const result = await this.portalService.getAllTenants(query);

    this.logger.log('Tenants retrieved successfully', {
      correlationId,
      total: result.total,
      page: result.currentPage,
    });

    return result;
  }

  @Post('tenants')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create new tenant',
    description: 'Create a new tenant. Super admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Domain already exists',
  })
  async createTenant(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<TenantResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `create-tenant-${Date.now()}`;

    this.logger.log('Creating new tenant', {
      correlationId,
      domain: createTenantDto.domain,
      createdBy: user.id,
    });

    const result = await this.portalService.createTenant(createTenantDto, user.id);

    this.logger.log('Tenant created successfully', {
      correlationId,
      tenantId: result.id,
      domain: result.domain,
    });

    return result;
  }

  @Get('tenants/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({
    summary: 'Get tenant by ID',
    description: 'Retrieve a specific tenant by ID',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant retrieved successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  async getTenantById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<TenantResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-tenant-${Date.now()}`;

    this.logger.log('Getting tenant by ID', { correlationId, tenantId: id });

    const result = await this.portalService.getTenantById(id);

    this.logger.log('Tenant retrieved successfully', {
      correlationId,
      tenantId: id,
      domain: result.domain,
    });

    return result;
  }

  @Patch('tenants/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({
    summary: 'Update tenant',
    description: 'Update tenant information',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Domain already exists',
  })
  async updateTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
    @Req() req: Request,
  ): Promise<TenantResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `update-tenant-${Date.now()}`;

    this.logger.log('Updating tenant', { correlationId, tenantId: id });

    const result = await this.portalService.updateTenant(id, updateTenantDto);

    this.logger.log('Tenant updated successfully', {
      correlationId,
      tenantId: id,
    });

    return result;
  }

  @Delete('tenants/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete tenant',
    description: 'Delete a tenant and all associated data. Super admin only.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  async deleteTenant(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const correlationId = req.headers['x-correlation-id'] as string || `delete-tenant-${Date.now()}`;

    this.logger.log('Deleting tenant', { correlationId, tenantId: id });

    const result = await this.portalService.deleteTenant(id);

    this.logger.log('Tenant deleted successfully', {
      correlationId,
      tenantId: id,
    });

    return result;
  }

  // ================== PAGE MANAGEMENT ==================

  @Get('tenants/:tenantId/pages')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get tenant pages',
    description: 'Retrieve all pages for a specific tenant',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or slug' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiQuery({ name: 'pageType', required: false, enum: ['HOME', 'SERVICES', 'CONTACT', 'ABOUT', 'CUSTOM'] })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({
    status: 200,
    description: 'Pages retrieved successfully',
    type: PaginatedPageResponseDto,
  })
  async getTenantPages(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Query() query: PageQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedPageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-pages-${Date.now()}`;

    this.logger.log('Getting tenant pages', { correlationId, tenantId, query });

    const result = await this.portalService.getTenantPages(tenantId, query);

    this.logger.log('Pages retrieved successfully', {
      correlationId,
      tenantId,
      total: result.total,
      page: result.currentPage,
    });

    return result;
  }

  @Post('tenants/:tenantId/pages')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Create new page',
    description: 'Create a new page for a tenant',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 201,
    description: 'Page created successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Page slug already exists',
  })
  async createTenantPage(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Body() createPageDto: CreatePageDto,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `create-page-${Date.now()}`;

    this.logger.log('Creating new page', {
      correlationId,
      tenantId,
      slug: createPageDto.slug,
    });

    const result = await this.portalService.createTenantPage(tenantId, createPageDto);

    this.logger.log('Page created successfully', {
      correlationId,
      tenantId,
      pageId: result.id,
    });

    return result;
  }

  @Get('tenants/:tenantId/pages/:pageId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get page by ID',
    description: 'Retrieve a specific page by ID',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page retrieved successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async getTenantPageById(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('pageId') pageId: string,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-page-${Date.now()}`;

    this.logger.log('Getting page by ID', { correlationId, tenantId, pageId });

    const result = await this.portalService.getTenantPageById(tenantId, pageId);

    this.logger.log('Page retrieved successfully', {
      correlationId,
      tenantId,
      pageId,
    });

    return result;
  }

  @Patch('tenants/:tenantId/pages/:pageId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Update page',
    description: 'Update page information',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page updated successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Page slug already exists',
  })
  async updateTenantPage(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `update-page-${Date.now()}`;

    this.logger.log('Updating page', { correlationId, tenantId, pageId });

    const result = await this.portalService.updateTenantPage(tenantId, pageId, updatePageDto);

    this.logger.log('Page updated successfully', {
      correlationId,
      tenantId,
      pageId,
    });

    return result;
  }

  @Delete('tenants/:tenantId/pages/:pageId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Delete page',
    description: 'Delete a page',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async deleteTenantPage(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('pageId') pageId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const correlationId = req.headers['x-correlation-id'] as string || `delete-page-${Date.now()}`;

    this.logger.log('Deleting page', { correlationId, tenantId, pageId });

    const result = await this.portalService.deleteTenantPage(tenantId, pageId);

    this.logger.log('Page deleted successfully', {
      correlationId,
      tenantId,
      pageId,
    });

    return result;
  }

  @Post('tenants/:tenantId/pages/:pageId/publish')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Publish page',
    description: 'Publish a page to make it publicly visible',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page published successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async publishTenantPage(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('pageId') pageId: string,
    @Body() publishDto: PublishPageDto,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `publish-page-${Date.now()}`;

    this.logger.log('Publishing page', { correlationId, tenantId, pageId });

    const result = await this.portalService.publishTenantPage(tenantId, pageId, publishDto);

    this.logger.log('Page published successfully', {
      correlationId,
      tenantId,
      pageId,
    });

    return result;
  }

  @Post('tenants/:tenantId/pages/:pageId/unpublish')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Unpublish page',
    description: 'Unpublish a page to make it no longer publicly visible',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({
    status: 200,
    description: 'Page unpublished successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async unpublishTenantPage(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('pageId') pageId: string,
    @Req() req: Request,
  ): Promise<PageResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `unpublish-page-${Date.now()}`;

    this.logger.log('Unpublishing page', { correlationId, tenantId, pageId });

    const result = await this.portalService.unpublishTenantPage(tenantId, pageId);

    this.logger.log('Page unpublished successfully', {
      correlationId,
      tenantId,
      pageId,
    });

    return result;
  }

  // ================== LAYOUT MANAGEMENT ==================

  @Get('tenants/:tenantId/layouts')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get tenant layouts',
    description: 'Retrieve all layouts for a specific tenant',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by layout key' })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({
    status: 200,
    description: 'Layouts retrieved successfully',
    type: PaginatedLayoutResponseDto,
  })
  async getTenantLayouts(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Query() query: LayoutQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedLayoutResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-layouts-${Date.now()}`;

    this.logger.log('Getting tenant layouts', { correlationId, tenantId, query });

    const result = await this.portalService.getTenantLayouts(tenantId, query);

    this.logger.log('Layouts retrieved successfully', {
      correlationId,
      tenantId,
      total: result.total,
      page: result.currentPage,
    });

    return result;
  }

  @Post('tenants/:tenantId/layouts')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Create new layout',
    description: 'Create a new layout for a tenant',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 201,
    description: 'Layout created successfully',
    type: LayoutResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Layout key already exists',
  })
  async createTenantLayout(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Body() createLayoutDto: CreateLayoutDto,
    @Req() req: Request,
  ): Promise<LayoutResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `create-layout-${Date.now()}`;

    this.logger.log('Creating new layout', {
      correlationId,
      tenantId,
      key: createLayoutDto.key,
    });

    const result = await this.portalService.createTenantLayout(tenantId, createLayoutDto);

    this.logger.log('Layout created successfully', {
      correlationId,
      tenantId,
      layoutId: result.id,
    });

    return result;
  }

  @Get('tenants/:tenantId/layouts/:layoutId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get layout by ID',
    description: 'Retrieve a specific layout by ID with its sections',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 200,
    description: 'Layout retrieved successfully',
    type: LayoutResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  async getTenantLayoutById(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Req() req: Request,
  ): Promise<LayoutResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-layout-${Date.now()}`;

    this.logger.log('Getting layout by ID', { correlationId, tenantId, layoutId });

    const result = await this.portalService.getTenantLayoutById(tenantId, layoutId);

    this.logger.log('Layout retrieved successfully', {
      correlationId,
      tenantId,
      layoutId,
    });

    return result;
  }

  @Patch('tenants/:tenantId/layouts/:layoutId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Update layout',
    description: 'Update layout information',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 200,
    description: 'Layout updated successfully',
    type: LayoutResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Layout key already exists',
  })
  async updateTenantLayout(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Body() updateLayoutDto: UpdateLayoutDto,
    @Req() req: Request,
  ): Promise<LayoutResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `update-layout-${Date.now()}`;

    this.logger.log('Updating layout', { correlationId, tenantId, layoutId });

    const result = await this.portalService.updateTenantLayout(tenantId, layoutId, updateLayoutDto);

    this.logger.log('Layout updated successfully', {
      correlationId,
      tenantId,
      layoutId,
    });

    return result;
  }

  @Delete('tenants/:tenantId/layouts/:layoutId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Delete layout',
    description: 'Delete a layout and all its sections',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 200,
    description: 'Layout deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  async deleteTenantLayout(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const correlationId = req.headers['x-correlation-id'] as string || `delete-layout-${Date.now()}`;

    this.logger.log('Deleting layout', { correlationId, tenantId, layoutId });

    const result = await this.portalService.deleteTenantLayout(tenantId, layoutId);

    this.logger.log('Layout deleted successfully', {
      correlationId,
      tenantId,
      layoutId,
    });

    return result;
  }

  // ================== SECTION MANAGEMENT ==================

  @Get('layouts/:layoutId/sections')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get layout sections',
    description: 'Retrieve all sections for a specific layout',
  })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 200,
    description: 'Sections retrieved successfully',
    type: [SectionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  async getLayoutSections(
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<SectionResponseDto[]> {
    const correlationId = req.headers['x-correlation-id'] as string || `get-sections-${Date.now()}`;

    // For non-super admins, use their tenant ID for security
    const tenantId = user.role === Role.SUPER_ADMIN ? undefined : user.tenantId;

    this.logger.log('Getting layout sections', { correlationId, layoutId, tenantId });

    const result = await this.portalService.getLayoutSections(tenantId || 0, layoutId);

    this.logger.log('Sections retrieved successfully', {
      correlationId,
      layoutId,
      count: result.length,
    });

    return result;
  }

  @Post('layouts/:layoutId/sections')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Create new section',
    description: 'Create a new section for a layout',
  })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 201,
    description: 'Section created successfully',
    type: SectionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  async createLayoutSection(
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<SectionResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `create-section-${Date.now()}`;

    // For non-super admins, use their tenant ID for security
    const tenantId = user.role === Role.SUPER_ADMIN ? undefined : user.tenantId;

    this.logger.log('Creating new section', {
      correlationId,
      layoutId,
      tenantId,
      type: createSectionDto.type,
    });

    const result = await this.portalService.createLayoutSection(tenantId || 0, layoutId, createSectionDto);

    this.logger.log('Section created successfully', {
      correlationId,
      layoutId,
      sectionId: result.id,
    });

    return result;
  }

  @Patch('layouts/:layoutId/sections/:sectionId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Update section',
    description: 'Update section information',
  })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section updated successfully',
    type: SectionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Section not found',
  })
  async updateLayoutSection(
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<SectionResponseDto> {
    const correlationId = req.headers['x-correlation-id'] as string || `update-section-${Date.now()}`;

    // For non-super admins, use their tenant ID for security
    const tenantId = user.role === Role.SUPER_ADMIN ? undefined : user.tenantId;

    this.logger.log('Updating section', { correlationId, layoutId, sectionId, tenantId });

    const result = await this.portalService.updateLayoutSection(tenantId || 0, layoutId, sectionId, updateSectionDto);

    this.logger.log('Section updated successfully', {
      correlationId,
      layoutId,
      sectionId,
    });

    return result;
  }

  @Delete('layouts/:layoutId/sections/:sectionId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Delete section',
    description: 'Delete a section',
  })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Section not found',
  })
  async deleteLayoutSection(
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const correlationId = req.headers['x-correlation-id'] as string || `delete-section-${Date.now()}`;

    // For non-super admins, use their tenant ID for security
    const tenantId = user.role === Role.SUPER_ADMIN ? undefined : user.tenantId;

    this.logger.log('Deleting section', { correlationId, layoutId, sectionId, tenantId });

    const result = await this.portalService.deleteLayoutSection(tenantId || 0, layoutId, sectionId);

    this.logger.log('Section deleted successfully', {
      correlationId,
      layoutId,
      sectionId,
    });

    return result;
  }

  @Patch('layouts/:layoutId/sections/reorder')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Reorder sections',
    description: 'Reorder sections in a layout',
  })
  @ApiParam({ name: 'layoutId', description: 'Layout ID' })
  @ApiResponse({
    status: 200,
    description: 'Sections reordered successfully',
    type: [SectionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Layout not found',
  })
  async reorderLayoutSections(
    @Param('layoutId', ParseIntPipe) layoutId: number,
    @Body() reorderDto: ReorderSectionsDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<SectionResponseDto[]> {
    const correlationId = req.headers['x-correlation-id'] as string || `reorder-sections-${Date.now()}`;

    // For non-super admins, use their tenant ID for security
    const tenantId = user.role === Role.SUPER_ADMIN ? undefined : user.tenantId;

    this.logger.log('Reordering sections', { correlationId, layoutId, tenantId });

    const result = await this.portalService.reorderLayoutSections(tenantId || 0, layoutId, reorderDto);

    this.logger.log('Sections reordered successfully', {
      correlationId,
      layoutId,
      count: result.length,
    });

    return result;
  }
}