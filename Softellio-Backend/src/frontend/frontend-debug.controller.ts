import { Controller, Get, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { FrontendBootstrapService } from './frontend-bootstrap.service';

@ApiTags('Frontend Debug (Temporary)')
@Controller('debug/frontend')
export class FrontendDebugController {
  constructor(
    private prisma: PrismaService,
    private bootstrapService: FrontendBootstrapService
  ) {}

  @Get('admin/theme-layout-status')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Check if theme settings and layout exist for tenant' })
  @ApiResponse({
    status: 200,
    description: 'Status of theme and layout setup',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'number' },
        themeSettingExists: { type: 'boolean' },
        homeLayoutExists: { type: 'boolean' },
        sectionsCount: { type: 'number' },
        details: { type: 'object' }
      }
    }
  })
  async getThemeLayoutStatus(@CurrentTenant() tenantId: number) {
    // Check theme setting
    const themeSetting = await this.prisma.themeSetting.findUnique({
      where: { tenantId }
    });

    // Check HOME layout
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { defaultLanguage: true }
    });

    const language = tenant?.defaultLanguage || 'tr';

    const homeLayout = await this.prisma.pageLayout.findFirst({
      where: { tenantId, key: 'HOME' },
      include: {
        sections: {
          select: { id: true, type: true, variant: true, order: true, isEnabled: true, status: true }
        }
      }
    });

    return {
      tenantId,
      themeSettingExists: !!themeSetting,
      homeLayoutExists: !!homeLayout,
      sectionsCount: homeLayout?.sections?.length || 0,
      details: {
        themeSetting: themeSetting ? {
          id: themeSetting.id,
          primaryColor: themeSetting.primaryColor,
          fontFamily: themeSetting.fontFamily,
          createdAt: themeSetting.createdAt
        } : null,
        homeLayout: homeLayout ? {
          id: homeLayout.id,
          key: homeLayout.key,
          language: homeLayout.language,
          status: homeLayout.status,
          sectionsCount: homeLayout.sections.length,
          sections: homeLayout.sections
        } : null
      }
    };
  }

  @Post('admin/bootstrap/:tenantId')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Manually bootstrap specific tenant (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bootstrap completed' })
  async bootstrapTenant(@Param('tenantId', ParseIntPipe) tenantId: number) {
    await this.bootstrapService.bootstrapTenantDefaults(tenantId);
    return {
      success: true,
      message: `Bootstrap completed for tenant ${tenantId}`,
      timestamp: new Date().toISOString()
    };
  }

  @Get('admin/all-tenants-status')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get bootstrap status for all tenants (Admin only)' })
  @ApiResponse({ status: 200, description: 'All tenants status' })
  async getAllTenantsStatus() {
    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        defaultLanguage: true,
        themeSetting: { select: { id: true } },
        pageLayouts: {
          where: { key: 'HOME' },
          select: { id: true, language: true, status: true },
          take: 1
        },
        pageSections: {
          select: { id: true },
          take: 1
        }
      },
      take: 10 // Limit for safety
    });

    return {
      tenantsChecked: tenants.length,
      tenants: tenants.map(tenant => ({
        id: tenant.id,
        slug: tenant.slug,
        defaultLanguage: tenant.defaultLanguage,
        hasThemeSetting: !!tenant.themeSetting,
        hasHomeLayout: tenant.pageLayouts.length > 0,
        hasSections: tenant.pageSections.length > 0,
        homeLayout: tenant.pageLayouts[0] || null
      }))
    };
  }
}