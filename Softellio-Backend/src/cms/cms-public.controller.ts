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
import { PrismaService } from '../config/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Public CMS')
@Controller('public/cms')
export class CmsPublicController {
  constructor(
    private readonly pageLayoutsService: PageLayoutsService,
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
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
   * Resolve tenant ID for public endpoints using X-Tenant-Host, Host header or X-Tenant-Id
   */
  private async resolvePublicTenantId(request: Request, tenantIdHeader?: string): Promise<number> {
    // Priority 1: X-Tenant-Id header (for local development)
    if (tenantIdHeader) {
      const tenantId = parseInt(tenantIdHeader, 10);
      if (!isNaN(tenantId)) {
        console.log(`[CMS-PUBLIC] Resolved tenant via X-Tenant-Id: ${tenantId}`);
        return tenantId;
      }
    }

    // Priority 2: X-Tenant-Host header (CRITICAL FIX - Site sends this!)
    const tenantHost = request?.headers['x-tenant-host'] as string;
    if (tenantHost) {
      try {
        const tenant = await this.tenantsService.findByDomain(tenantHost);
        if (tenant) {
          console.log(`[CMS-PUBLIC] Resolved tenant via X-Tenant-Host: ${tenantHost} -> ${tenant.slug} (${tenant.id})`);
          return tenant.id;
        }
      } catch (error) {
        console.error(`[CMS-PUBLIC] Failed to resolve via X-Tenant-Host: ${tenantHost}`, error);
      }
    }

    // Priority 3: Host header (fallback for production domains)
    const host = request?.headers?.host;
    if (host) {
      try {
        const tenant = await this.tenantsService.findByDomain(host);
        if (tenant) {
          console.log(`[CMS-PUBLIC] Resolved tenant via Host: ${host} -> ${tenant.slug} (${tenant.id})`);
          return tenant.id;
        }
      } catch (error) {
        console.error(`[CMS-PUBLIC] Failed to resolve via Host: ${host}`, error);
      }
    }

    // No fallback - throw error with debugging info
    console.error('[CMS-PUBLIC] Tenant resolution failed - no valid headers found', {
      'x-tenant-id': tenantIdHeader,
      'x-tenant-host': tenantHost,
      'host': host
    });

    throw new NotFoundException('Tenant not found. Please provide X-Tenant-Host, Host header, or X-Tenant-Id.');
  }

  @Get('debug/tenant-resolution')
  @Public()
  @ApiOperation({
    summary: 'Debug tenant resolution for public CMS endpoints',
    description: 'Shows how tenant would be resolved from headers (for debugging only)'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Direct tenant ID (for local development)',
    required: false,
    example: '2'
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant host for domain resolution',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant resolution debug information',
    schema: {
      type: 'object',
      properties: {
        headers: {
          type: 'object',
          properties: {
            'X-Tenant-Id': { type: 'string', nullable: true },
            'X-Tenant-Host': { type: 'string', nullable: true },
            'Host': { type: 'string', nullable: true }
          }
        },
        resolution: {
          type: 'object',
          properties: {
            resolvedTenantId: { type: 'number', nullable: true },
            resolvedBy: { type: 'string' },
            tenantSlug: { type: 'string', nullable: true },
            tenantDomain: { type: 'string', nullable: true }
          }
        },
        timestamp: { type: 'string' }
      }
    }
  })
  async debugTenantResolution(
    @Req() request?: Request,
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Headers('X-Tenant-Host') tenantHostHeader?: string,
  ) {
    const host = request?.headers?.host;

    let resolvedTenantId: number | null = null;
    let resolvedBy: string = 'none';
    let tenant: any = null;

    // Try X-Tenant-Id
    if (tenantIdHeader) {
      const parsed = parseInt(tenantIdHeader, 10);
      if (!isNaN(parsed)) {
        resolvedTenantId = parsed;
        resolvedBy = 'X-Tenant-Id';
        tenant = await this.prisma.tenant.findUnique({ where: { id: parsed } });
      }
    }

    // Try X-Tenant-Host
    if (!resolvedTenantId && tenantHostHeader) {
      try {
        const t = await this.tenantsService.findByDomain(tenantHostHeader);
        if (t) {
          resolvedTenantId = t.id;
          resolvedBy = 'X-Tenant-Host';
          tenant = t;
        }
      } catch (error) {
        // Continue to next method
      }
    }

    // Try Host
    if (!resolvedTenantId && host) {
      try {
        const t = await this.tenantsService.findByDomain(host);
        if (t) {
          resolvedTenantId = t.id;
          resolvedBy = 'Host';
          tenant = t;
        }
      } catch (error) {
        // No resolution possible
      }
    }

    return {
      headers: {
        'X-Tenant-Id': tenantIdHeader || null,
        'X-Tenant-Host': tenantHostHeader || null,
        'Host': host || null,
      },
      resolution: {
        resolvedTenantId,
        resolvedBy,
        tenantSlug: tenant?.slug || null,
        tenantDomain: tenant?.domain || null,
      },
      timestamp: new Date().toISOString()
    };
  }
}