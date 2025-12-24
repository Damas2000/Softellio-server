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
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto, BulkServiceDeleteDto, ServiceReorderDto } from './dto/service.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create new service (Admin)' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.create(createServiceDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all services with filtering (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' })
  @ApiQuery({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'title'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  findAll(
    @CurrentTenant() tenantId: number,
    @Query() query: ServiceQueryDto,
  ) {
    return this.servicesService.findAll(tenantId, query);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get services statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Services statistics retrieved successfully' })
  getStats(@CurrentTenant() tenantId: number) {
    return this.servicesService.getStats(tenantId);
  }

  @Get('admin/featured')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get featured services (Admin)' })
  @ApiResponse({ status: 200, description: 'Featured services retrieved successfully' })
  getFeatured(@CurrentTenant() tenantId: number) {
    return this.servicesService.findFeatured(tenantId);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get service by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.findOne(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update service (Admin)' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.update(id, updateServiceDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete service (Admin)' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.remove(id, tenantId);
  }

  @Delete('admin/bulk')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete services (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk delete completed' })
  @ApiResponse({ status: 400, description: 'Invalid request body or validation error' })
  bulkDelete(
    @Body() bulkDeleteDto: BulkServiceDeleteDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.bulkDelete(bulkDeleteDto.ids, tenantId);
  }

  @Patch('admin/reorder')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder services (Admin)' })
  @ApiResponse({ status: 200, description: 'Services reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body or validation error' })
  reorder(
    @Body() reorderDto: ServiceReorderDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.reorder(reorderDto.services, tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:language')
  @Public()
  @ApiOperation({ summary: 'Get public services for specific language' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'featured', type: Boolean, required: false, description: 'Filter by featured' })
  @ApiResponse({ status: 200, description: 'Public services retrieved successfully' })
  findPublic(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query() query: ServiceQueryDto,
  ) {
    return this.servicesService.findPublicServices(tenantId, language, query);
  }

  @Get('public/:language/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured services for public display' })
  @ApiResponse({ status: 200, description: 'Featured services retrieved successfully' })
  async getFeaturedPublic(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const featuredServices = await this.servicesService.findFeatured(tenantId);

    // Format for public display with specific language
    const formattedServices = featuredServices.map(service => ({
      id: service.id,
      iconUrl: service.iconUrl,
      order: service.order,
      translation: service.translations.find(t => t.language === language) || null,
    })).filter(service => service.translation); // Only include services with translation in the requested language

    return { services: formattedServices };
  }

  @Get('public/:language/:slug')
  @Public()
  @ApiOperation({ summary: 'Get service by slug for public display' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.servicesService.findBySlug(slug, language, tenantId);
  }

  // ==================== SEO ROUTES ====================

  @Get('public/:language/sitemap')
  @Public()
  @ApiOperation({ summary: 'Get services sitemap data' })
  @ApiResponse({ status: 200, description: 'Sitemap data retrieved successfully' })
  async getSitemap(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const services = await this.servicesService.findPublicServices(tenantId, language, {
      limit: 1000, // High limit for sitemap
    });

    const sitemapData = services.services
      .filter(service => service.translation)
      .map(service => ({
        slug: service.translation!.slug,
        lastModified: new Date(), // You could use actual updateAt from service
        changeFreq: 'monthly',
        priority: service.isFeatured ? 0.8 : 0.6,
      }));

    return { services: sitemapData };
  }
}