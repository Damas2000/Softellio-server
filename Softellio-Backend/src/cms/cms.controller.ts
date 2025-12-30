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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TemplateValidationService } from '../templates/template-validation.service';
import { UpdatePageLayoutDto } from '../frontend/dto/page-section.dto';
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
      // 🛡️  TEMPLATE VALIDATION: Enforce template constraints
      if (updateData.sections && updateData.sections.length > 0) {
        console.log(`[CmsController] 🛡️  Validating ${updateData.sections.length} sections against template constraints`);

        await this.templateValidationService.validateLayoutInheritance(tenantId, updateData.sections);

        console.log(`[CmsController] ✅ Template validation passed`);
      }

      // Use the new service method that handles sections properly
      const updatedLayout = await this.pageLayoutsService.updateLayoutWithSections(
        tenantId,
        pageKey,
        language,
        updateData
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