import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TenantsService } from '../tenants/tenants.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Public CMS')
@Controller('public/cms')
export class CmsPublicController {
  constructor(
    private readonly pageLayoutsService: PageLayoutsService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Get('layouts/:pageKey')
  @Public()
  @ApiOperation({
    summary: 'Get page layout for public website (no auth required)',
    description: 'Public read-only endpoint for getting published page layouts. Resolves tenant by Host header or X-Tenant-Id.'
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
    name: 'Host',
    description: 'Domain to resolve tenant (e.g., demo.softellio.com)',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Direct tenant ID (for local development)',
    required: false,
    example: '2'
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
  @ApiResponse({
    status: 404,
    description: 'Layout not found - returns empty sections',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'HOME' },
        language: { type: 'string', example: 'tr' },
        sections: { type: 'array', example: [] }
      }
    }
  })
  async getPublicLayout(
    @Param('pageKey') pageKey: string,
    @Query('lang') language?: string,
    @Req() request?: Request,
    @Headers('X-Tenant-Id') tenantIdHeader?: string
  ) {
    try {
      const tenantId = await this.resolvePublicTenantId(request, tenantIdHeader);
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
    } catch (error) {
      // If tenant not found or layout creation fails, return empty sections
      // This ensures public sites can handle missing layouts gracefully
      const defaultLanguage = language || 'tr';

      return {
        key: pageKey,
        language: defaultLanguage,
        sections: []
      };
    }
  }

  /**
   * Resolve tenant ID for public endpoints using Host header or X-Tenant-Id
   */
  private async resolvePublicTenantId(request: Request, tenantIdHeader?: string): Promise<number> {
    // Priority 1: X-Tenant-Id header (for local development)
    if (tenantIdHeader) {
      const tenantId = parseInt(tenantIdHeader, 10);
      if (!isNaN(tenantId)) {
        return tenantId;
      }
    }

    // Priority 2: Host header (for production domains)
    const host = request?.headers?.host;
    if (host) {
      try {
        const tenant = await this.tenantsService.findByDomain(host);
        if (tenant) {
          return tenant.id;
        }
      } catch (error) {
        // Continue to fallback
      }
    }

    // Fallback: Use demo tenant (ID 2) for localhost without X-Tenant-Id
    if (host?.includes('localhost')) {
      return 2; // Demo tenant ID from seeding
    }

    throw new NotFoundException('Tenant not found. Please provide Host header or X-Tenant-Id.');
  }
}