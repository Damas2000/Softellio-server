import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SiteConfigService } from './site-config.service';
import { DynamicPagesService } from './dynamic-pages.service';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TenantsService } from '../tenants/tenants.service';
import { PageListItemDto } from './dto/dynamic-page.dto';

@ApiTags('Public Site API')
@Controller('public/site')
@Public()
export class TemplatesPublicController {
  constructor(
    private readonly siteConfigService: SiteConfigService,
    private readonly dynamicPagesService: DynamicPagesService,
    private readonly pageLayoutsService: PageLayoutsService,
    private readonly tenantsService: TenantsService
  ) {}

  /**
   * Get public site configuration (branding, navigation, footer)
   */
  @Get('config')
  @ApiOperation({ summary: 'Get public site configuration' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Site configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        branding: {
          type: 'object',
          properties: {
            logoUrl: { type: 'string' },
            faviconUrl: { type: 'string' },
            primaryColor: { type: 'string' },
            secondaryColor: { type: 'string' },
            fontFamily: { type: 'string' }
          }
        },
        navigation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              href: { type: 'string' },
              order: { type: 'number' },
              isCTA: { type: 'boolean' },
              isExternal: { type: 'boolean' },
              children: { type: 'array' }
            }
          }
        },
        footer: {
          type: 'object',
          properties: {
            columns: { type: 'array' },
            socialLinks: { type: 'array' },
            copyrightText: { type: 'string' }
          }
        },
        seoDefaults: {
          type: 'object',
          properties: {
            metaTitle: { type: 'string' },
            metaDescription: { type: 'string' },
            ogImage: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getSiteConfig(@Headers('X-Tenant-Host') tenantHost: string) {
    console.log(`[TemplatesPublicController] Getting site config for host: ${tenantHost}`);

    if (!tenantHost) {
      throw new NotFoundException('X-Tenant-Host header is required');
    }

    const tenant = await this.tenantsService.findByDomain(tenantHost);
    if (!tenant) {
      throw new NotFoundException(`Tenant not found for domain: ${tenantHost}`);
    }

    const config = await this.siteConfigService.getPublicConfig(tenant.id);

    return {
      ...config,
      // Add tenant context for debugging (can be removed in production)
      _debug: {
        tenantId: tenant.id,
        domain: tenantHost
      }
    };
  }

  /**
   * Get all published pages for site
   */
  @Get('pages')
  @ApiOperation({ summary: 'Get all published pages for site' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Published pages retrieved successfully',
    type: [PageListItemDto],
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getPublishedPages(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Query('lang') language: string = 'tr'
  ) {
    console.log(`[TemplatesPublicController] Getting published pages for host: ${tenantHost} (${language})`);

    if (!tenantHost) {
      throw new NotFoundException('X-Tenant-Host header is required');
    }

    const tenant = await this.tenantsService.findByDomain(tenantHost);
    if (!tenant) {
      throw new NotFoundException(`Tenant not found for domain: ${tenantHost}`);
    }

    const pages = await this.dynamicPagesService.findPublishedForTenant(tenant.id, language);

    // Sort pages for better navigation (home first, then alphabetically)
    return pages.sort((a, b) => {
      if (a.slug === '/') return -1;
      if (b.slug === '/') return 1;
      return a.slug.localeCompare(b.slug);
    });
  }

  /**
   * Get page content and layout by slug
   */
  @Get('pages/by-slug/:slug')
  @ApiOperation({ summary: 'Get page content and layout by slug' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiParam({ name: 'slug', description: 'Page slug', example: '/about' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false, example: 'tr' })
  @ApiResponse({
    status: 200,
    description: 'Page content retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        page: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            title: { type: 'string' },
            seo: { type: 'object' },
            pageType: { type: 'string' },
            publishedAt: { type: 'string' }
          }
        },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            language: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  type: { type: 'string' },
                  variant: { type: 'string' },
                  order: { type: 'number' },
                  propsJson: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant or page not found' })
  async getPageBySlug(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Param('slug') slug: string,
    @Query('lang') language: string = 'tr'
  ) {
    console.log(`[TemplatesPublicController] Getting page by slug: ${slug} for host: ${tenantHost} (${language})`);

    if (!tenantHost) {
      throw new NotFoundException('X-Tenant-Host header is required');
    }

    const tenant = await this.tenantsService.findByDomain(tenantHost);
    if (!tenant) {
      throw new NotFoundException(`Tenant not found for domain: ${tenantHost}`);
    }

    // Normalize slug (ensure it starts with /)
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;

    // Get page information
    const page = await this.dynamicPagesService.findBySlug(tenant.id, normalizedSlug, language);

    // Only return published pages for public access
    if (!page.published) {
      throw new NotFoundException('Page not found or not published');
    }

    // Get page layout and sections
    const layout = await this.pageLayoutsService.getPublicLayout(tenant.id, page.layoutKey, language);

    return {
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        seo: page.seo,
        pageType: page.pageType,
        publishedAt: page.publishedAt,
        language: page.language
      },
      layout: {
        key: layout.key,
        language: layout.language,
        sections: layout.sections
      }
    };
  }

  /**
   * Get site navigation structure
   */
  @Get('navigation')
  @ApiOperation({ summary: 'Get site navigation structure' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Navigation structure retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        navigation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              href: { type: 'string' },
              order: { type: 'number' },
              isCTA: { type: 'boolean' },
              children: { type: 'array' }
            }
          }
        },
        pages: {
          type: 'array',
          description: 'Available pages for dynamic navigation',
          items: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' },
              pageType: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getNavigation(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Query('lang') language: string = 'tr'
  ) {
    console.log(`[TemplatesPublicController] Getting navigation for host: ${tenantHost}`);

    if (!tenantHost) {
      throw new NotFoundException('X-Tenant-Host header is required');
    }

    const tenant = await this.tenantsService.findByDomain(tenantHost);
    if (!tenant) {
      throw new NotFoundException(`Tenant not found for domain: ${tenantHost}`);
    }

    // Get site configuration for navigation
    const config = await this.siteConfigService.getPublicConfig(tenant.id);

    // Get published pages for dynamic navigation
    const pages = await this.dynamicPagesService.findPublishedForTenant(tenant.id, language);

    return {
      navigation: config.navigation || [],
      pages: pages.map(page => ({
        slug: page.slug,
        title: page.title,
        pageType: page.pageType
      }))
    };
  }

  /**
   * Health check endpoint for public site
   */
  @Get('health')
  @ApiOperation({ summary: 'Site health check' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Site is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string' },
        tenant: { type: 'object' }
      }
    }
  })
  async healthCheck(@Headers('X-Tenant-Host') tenantHost?: string) {
    const result: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'templates-public-api'
    };

    if (tenantHost) {
      try {
        const tenant = await this.tenantsService.findByDomain(tenantHost);
        result.tenant = tenant ? {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          status: tenant.status
        } : null;
      } catch (error) {
        result.tenant = null;
        result.tenantError = error.message;
      }
    }

    return result;
  }
}