import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Headers,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TemplateValidationService } from '../templates/template-validation.service';
import { UpdatePageLayoutDto } from '../frontend/dto/page-section.dto';
import { PrismaService } from '../config/prisma.service';
import { DynamicPagesService } from '../templates/dynamic-pages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-tenant.decorator';
import { SanitizedBody } from './decorators/sanitized-body.decorator';
import { Role } from '@prisma/client';

@ApiTags('CMS')
@Controller('cms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CmsController {
  constructor(
    private readonly pageLayoutsService: PageLayoutsService,
    private readonly templateValidationService: TemplateValidationService,
    private readonly prisma: PrismaService,
    private readonly dynamicPagesService: DynamicPagesService,
  ) {}

  @Get('layouts/:pageKey')
  @ApiOperation({
    summary: 'Get page layout for CMS editing',
    description: 'Tenant-aware endpoint for getting page layouts. Requires authentication.'
  })
  @ApiParam({
    name: 'pageKey',
    description: 'Page key (e.g., HOME, ABOUT, PAGE:slug)',
    example: 'HOME'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Tenant ID for SUPER_ADMIN, optional for TENANT_ADMIN (uses their own tenant)',
    required: false,
    example: '1'
  })
  @ApiResponse({
    status: 200,
    description: 'Page layout data',
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
              variant: { type: 'string', example: 'default' },
              order: { type: 'number', example: 1 },
              enabled: { type: 'boolean', example: true },
              propsJson: {
                type: 'object',
                example: {
                  title: 'Welcome to our site',
                  subtitle: 'We provide great services'
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getLayout(
    @Param('pageKey') pageKey: string,
    @Query('lang') language?: string,
    @CurrentUser() user?: any,
    @Headers('X-Tenant-Id') tenantIdHeader?: string
  ) {
    const tenantId = this.resolveTenantId(user, tenantIdHeader);

    const layout = await this.pageLayoutsService.getOrCreateLayout(tenantId, pageKey, language);

    return {
      key: layout.key,
      language: layout.language,
      sections: layout.sections.map(section => ({
        id: section.id,
        type: section.type,
        variant: section.variant,
        order: section.order,
        enabled: section.isEnabled,
        propsJson: section.propsJson
      }))
    };
  }

  @Put('layouts/:pageKey')
  @ApiOperation({
    summary: 'Update page layout in CMS',
    description: 'Tenant-aware endpoint for updating page layouts. Requires authentication.'
  })
  @ApiParam({
    name: 'pageKey',
    description: 'Page key (e.g., HOME, ABOUT, PAGE:slug)',
    example: 'HOME'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Tenant ID for SUPER_ADMIN, optional for TENANT_ADMIN (uses their own tenant)',
    required: false,
    example: '1'
  })
  @ApiResponse({
    status: 200,
    description: 'Layout updated successfully',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'HOME' },
        language: { type: 'string', example: 'tr' },
        sections: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateLayout(
    @Param('pageKey') pageKey: string,
    @Query('lang') language: string = 'tr',
    @SanitizedBody() updateData: UpdatePageLayoutDto,
    @CurrentUser() user?: any,
    @Headers('X-Tenant-Id') tenantIdHeader?: string
  ) {
    console.log(`[CmsController] 🎯 updateLayout CALLED: pageKey=${pageKey}, language=${language}`);
    console.log(`[CmsController] User:`, { role: user?.role, tenantId: user?.tenantId });
    console.log(`[CmsController] Headers: X-Tenant-Id=${tenantIdHeader}`);
    console.log(`[CmsController] UpdateData:`, {
      keys: Object.keys(updateData || {}),
      sectionsCount: updateData?.sections?.length || 0,
      status: updateData?.status
    });

    const tenantId = this.resolveTenantId(user, tenantIdHeader);
    console.log(`[CmsController] Resolved tenantId: ${tenantId}`);

    try {
      let sectionsToSave = updateData.sections || [];

      // 🛡️  TEMPLATE VALIDATION + NORMALIZATION: Enforce template constraints and normalize variants
      if (sectionsToSave.length > 0) {
        console.log(`[CmsController] 🛡️  Validating ${sectionsToSave.length} sections against template constraints`);

        // This now returns normalized sections with proper variants
        sectionsToSave = await this.templateValidationService.validateLayoutInheritance(tenantId, sectionsToSave);

        console.log(`[CmsController] ✅ Template validation passed, using normalized sections`);
      }

      // Use the new service method that handles sections properly
      const updatedLayout = await this.pageLayoutsService.updateLayoutWithSections(
        tenantId,
        pageKey,
        language,
        { ...updateData, sections: sectionsToSave }
      );

      console.log(`[CmsController] ✅ Layout updated successfully, sections: ${updatedLayout.sections.length}`);

      return {
        key: updatedLayout.key,
        language: updatedLayout.language,
        sections: updatedLayout.sections.map(section => ({
          id: section.id,
          type: section.type,
          variant: section.variant,
          order: section.order,
          enabled: section.isEnabled,
          propsJson: section.propsJson
        }))
      };
    } catch (error) {
      console.error(`[CmsController] ❌ Layout update failed:`, error.message);
      if (error.message.includes('property id should not exist')) {
        console.error(`[CmsController] 🚨 DETECTED: "property id should not exist" validation error!`);
        console.error(`[CmsController] This suggests sanitization failed or wrong endpoint was hit`);
      }
      throw error;
    }
  }

  @Put('layouts/:pageKey/publish')
  @ApiOperation({
    summary: 'Publish page by layout key',
    description: 'Convenient endpoint to publish a page by its layout key (e.g., HOME). Sets published=true on the corresponding DynamicPage record.'
  })
  @ApiParam({
    name: 'pageKey',
    description: 'Page key (e.g., HOME, ABOUT, PAGE:slug)',
    example: 'HOME'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Tenant ID for SUPER_ADMIN, optional for TENANT_ADMIN (uses their own tenant)',
    required: false,
    example: '1'
  })
  @ApiResponse({
    status: 200,
    description: 'Page published successfully',
    schema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        slug: { type: 'string' },
        layoutKey: { type: 'string' },
        published: { type: 'boolean', example: true },
        publishedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Page not found for the specified layout key' })
  async publishPageByLayoutKey(
    @Param('pageKey') pageKey: string,
    @Query('lang') language: string = 'tr',
    @CurrentUser() user?: any,
    @Headers('X-Tenant-Id') tenantIdHeader?: string
  ) {
    const tenantId = this.resolveTenantId(user, tenantIdHeader);

    console.log(`[CmsController] 🚀 publishPageByLayoutKey CALLED: pageKey=${pageKey}, language=${language}, tenantId=${tenantId}`);

    try {
      // Find the page by layoutKey (similar to how the public endpoint works)
      const page = await this.prisma.dynamicPage.findFirst({
        where: {
          tenantId,
          layoutKey: pageKey,
          language
        }
      });

      if (!page) {
        console.error(`[CmsController] ❌ No page found for layoutKey=${pageKey}, language=${language}, tenantId=${tenantId}`);
        throw new NotFoundException({
          message: `No page found with layout key "${pageKey}" for language "${language}"`,
          code: 'PAGE_NOT_FOUND_FOR_LAYOUT_KEY',
          context: {
            tenantId,
            pageKey,
            language,
            suggestion: 'Ensure the page exists and the layout key is correct'
          }
        });
      }

      // Publish the page using the existing service method
      const publishedPage = await this.dynamicPagesService.setPublishStatus(tenantId, page.id, true);

      console.log(`[CmsController] ✅ Page published successfully: ${page.id} (${page.slug})`);

      return {
        pageId: publishedPage.id,
        slug: publishedPage.slug,
        layoutKey: publishedPage.layoutKey,
        published: publishedPage.published,
        publishedAt: publishedPage.publishedAt,
        _debug: {
          tenantId,
          pageKey,
          language,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`[CmsController] ❌ Publish failed for pageKey=${pageKey}:`, error.message);
      throw error;
    }
  }

  @Put('layouts/:pageKey/unpublish')
  @ApiOperation({
    summary: 'Unpublish page by layout key',
    description: 'Convenient endpoint to unpublish a page by its layout key. Sets published=false on the corresponding DynamicPage record.'
  })
  @ApiParam({
    name: 'pageKey',
    description: 'Page key (e.g., HOME, ABOUT, PAGE:slug)',
    example: 'HOME'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Tenant ID for SUPER_ADMIN, optional for TENANT_ADMIN (uses their own tenant)',
    required: false,
    example: '1'
  })
  @ApiResponse({
    status: 200,
    description: 'Page unpublished successfully',
    schema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        slug: { type: 'string' },
        layoutKey: { type: 'string' },
        published: { type: 'boolean', example: false },
        publishedAt: { type: 'string', nullable: true }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Page not found for the specified layout key' })
  async unpublishPageByLayoutKey(
    @Param('pageKey') pageKey: string,
    @Query('lang') language: string = 'tr',
    @CurrentUser() user?: any,
    @Headers('X-Tenant-Id') tenantIdHeader?: string
  ) {
    const tenantId = this.resolveTenantId(user, tenantIdHeader);

    console.log(`[CmsController] 📴 unpublishPageByLayoutKey CALLED: pageKey=${pageKey}, language=${language}, tenantId=${tenantId}`);

    try {
      // Find the page by layoutKey
      const page = await this.prisma.dynamicPage.findFirst({
        where: {
          tenantId,
          layoutKey: pageKey,
          language
        }
      });

      if (!page) {
        throw new NotFoundException({
          message: `No page found with layout key "${pageKey}" for language "${language}"`,
          code: 'PAGE_NOT_FOUND_FOR_LAYOUT_KEY',
          context: {
            tenantId,
            pageKey,
            language
          }
        });
      }

      // Unpublish the page using the existing service method
      const unpublishedPage = await this.dynamicPagesService.setPublishStatus(tenantId, page.id, false);

      console.log(`[CmsController] ✅ Page unpublished successfully: ${page.id} (${page.slug})`);

      return {
        pageId: unpublishedPage.id,
        slug: unpublishedPage.slug,
        layoutKey: unpublishedPage.layoutKey,
        published: unpublishedPage.published,
        publishedAt: unpublishedPage.publishedAt,
        _debug: {
          tenantId,
          pageKey,
          language,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`[CmsController] ❌ Unpublish failed for pageKey=${pageKey}:`, error.message);
      throw error;
    }
  }


  /**
   * Resolve tenant ID based on user role and header
   */
  private resolveTenantId(user: any, tenantIdHeader?: string): number {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // SUPER_ADMIN can access any tenant with X-Tenant-Id header
    if (user.role === Role.SUPER_ADMIN) {
      if (!tenantIdHeader) {
        throw new ForbiddenException('SUPER_ADMIN must provide X-Tenant-Id header');
      }
      const tenantId = parseInt(tenantIdHeader, 10);
      if (isNaN(tenantId)) {
        throw new ForbiddenException('Invalid X-Tenant-Id header');
      }
      return tenantId;
    }

    // TENANT_ADMIN and EDITOR use their own tenantId
    if (user.role === Role.TENANT_ADMIN || user.role === Role.EDITOR) {
      // Allow header override only if it matches their tenantId
      if (tenantIdHeader) {
        const headerTenantId = parseInt(tenantIdHeader, 10);
        if (!isNaN(headerTenantId) && headerTenantId !== user.tenantId) {
          throw new ForbiddenException('Cannot access different tenant data');
        }
      }
      return user.tenantId;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}