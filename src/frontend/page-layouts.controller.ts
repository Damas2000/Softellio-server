import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import { PageLayoutsService } from './page-layouts.service';
import {
  CreatePageSectionDto,
  UpdatePageSectionDto,
  UpsertPageLayoutDto,
  ReorderSectionsDto,
  ToggleSectionDto,
  PageLayoutResponseDto,
  PageSectionResponseDto,
} from './dto/page-section.dto';
import {
  CreatePageLayoutDto,
  PageLayoutListDto,
  LayoutKeyInfoDto,
} from './dto/page-specific.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Page Layouts & Sections')
@Controller('layouts')
export class PageLayoutsController {
  constructor(private readonly pageLayoutsService: PageLayoutsService) {}

  // ==================== LAYOUT ADMIN ROUTES ====================

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all layouts for tenant (Admin)' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'All layouts retrieved successfully',
    type: [LayoutKeyInfoDto],
  })
  async getAllLayouts(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.pageLayoutsService.getAllLayouts(tenantId, language);
  }

  @Post('admin/page')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create page-specific layout (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Page layout created successfully',
    type: PageLayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid page slug or layout already exists' })
  @ApiResponse({ status: 409, description: 'Layout already exists' })
  async createPageLayout(
    @Body() createDto: CreatePageLayoutDto,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.createPageLayout(tenantId, createDto);
  }

  @Delete('admin/:key')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete layout (Admin)' })
  @ApiParam({ name: 'key', description: 'Layout key (e.g., PAGE:about-us)', example: 'PAGE:about-us' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({ status: 200, description: 'Layout deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete HOME layout' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async deleteLayout(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.pageLayoutsService.deleteLayout(tenantId, key, language);
  }

  // ==================== LAYOUT ADMIN ROUTES (EXISTING) ====================

  @Get('admin/:key')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get page layout by key (Admin)' })
  @ApiParam({ name: 'key', description: 'Layout key (e.g., HOME)', example: 'HOME' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Page layout retrieved successfully',
    type: PageLayoutResponseDto,
  })
  async getLayout(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.pageLayoutsService.getOrCreateLayout(tenantId, key, language);
  }

  @Put('admin/:key')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Upsert page layout (Admin)' })
  @ApiParam({ name: 'key', description: 'Layout key (e.g., HOME)', example: 'HOME' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Page layout updated successfully',
    type: PageLayoutResponseDto,
  })
  async upsertLayout(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language: string = 'tr',
    @Body() updateDto: UpsertPageLayoutDto,
  ) {
    console.log(`[PageLayoutsController] 🎯 upsertLayout CALLED: key=${key}, language=${language}, tenantId=${tenantId}`);
    console.log(`[PageLayoutsController] ⚠️  NO SANITIZATION - using regular @Body() decorator`);
    console.log(`[PageLayoutsController] UpdateDto:`, {
      keys: Object.keys(updateDto || {}),
      status: updateDto?.status,
      language: updateDto?.language
    });
    console.log(`[PageLayoutsController] ℹ️  Note: This endpoint only handles layout metadata, not sections`);
    console.log(`[PageLayoutsController] ℹ️  For section updates, Portal should use /cms/layouts/${key} instead`);

    try {
      return await this.pageLayoutsService.upsertLayout(tenantId, key, language, updateDto);
    } catch (error) {
      console.error(`[PageLayoutsController] ❌ Upsert failed:`, error.message);
      if (error.message.includes('property id should not exist')) {
        console.error(`[PageLayoutsController] 🚨 VALIDATION ERROR: This endpoint doesn't handle sections!`);
        console.error(`[PageLayoutsController] Portal should use /cms/layouts/${key} (with sanitization) for section updates`);
      }
      throw error;
    }
  }

  // ==================== SECTIONS ADMIN ROUTES ====================

  @Post('admin/sections')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create new section (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Section created successfully',
    type: PageSectionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid section data or order conflict' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async createSection(
    @Body() createDto: CreatePageSectionDto,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.createSection(tenantId, createDto);
  }

  @Get('admin/sections/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get section by ID (Admin)' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section retrieved successfully',
    type: PageSectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.getSection(tenantId, sectionId);
  }

  @Patch('admin/sections/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update section (Admin)' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section updated successfully',
    type: PageSectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async updateSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() updateDto: UpdatePageSectionDto,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.updateSection(tenantId, sectionId, updateDto);
  }

  @Delete('admin/sections/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete section (Admin)' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async deleteSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.deleteSection(tenantId, sectionId);
  }

  @Patch('admin/sections/:id/toggle')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Toggle section enable/disable (Admin)' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section toggled successfully',
    type: PageSectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async toggleSection(
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() toggleDto: ToggleSectionDto,
    @CurrentTenant() tenantId: number,
  ) {
    return await this.pageLayoutsService.toggleSection(tenantId, sectionId, toggleDto.isEnabled);
  }

  @Post('admin/sections/reorder')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder sections within layout (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Sections reordered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reordered 3 sections' },
        sections: { type: 'array', items: { $ref: '#/components/schemas/PageSectionResponseDto' } },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid reorder data or validation error' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async reorderSections(
    @Body() reorderDto: ReorderSectionsDto,
    @CurrentTenant() tenantId: number,
    @Query('layoutId', ParseIntPipe) layoutId: number,
  ) {
    return await this.pageLayoutsService.reorderSections(tenantId, layoutId, reorderDto.items);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:key')
  @Public()
  @ApiOperation({ summary: 'Get public layout with sections' })
  @ApiParam({ name: 'key', description: 'Layout key (e.g., HOME)', example: 'HOME' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Public layout retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'HOME' },
        language: { type: 'string', example: 'tr' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              type: { type: 'string', example: 'hero' },
              variant: { type: 'string', example: 'v1' },
              order: { type: 'number', example: 1 },
              propsJson: {
                type: 'object',
                example: { title: 'Welcome', subtitle: 'To our site' },
              },
            },
          },
        },
      },
    },
  })
  async getPublicLayout(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    return await this.pageLayoutsService.getPublicLayout(tenantId, key, language);
  }
}