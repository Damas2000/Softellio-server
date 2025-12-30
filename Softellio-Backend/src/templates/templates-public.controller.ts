import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SiteBootstrapService } from './site-bootstrap.service';
import { SiteConfigService } from './site-config.service';
import { DynamicPagesService } from './dynamic-pages.service';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TenantsService } from '../tenants/tenants.service';
import { PublicRequestLoggerService, PublicRequestLogContext } from './public-request-logger.service';
import { TenantResolutionService } from './tenant-resolution.service';
import { SiteBootstrapResponseDto } from './dto/site-bootstrap.dto';
import { PageListItemDto } from './dto/dynamic-page.dto';

@ApiTags('Public Site API')
@Controller('public/site')
@Public()
export class TemplatesPublicController {
  constructor(
    private readonly siteBootstrapService: SiteBootstrapService,
    private readonly siteConfigService: SiteConfigService,
    private readonly dynamicPagesService: DynamicPagesService,
    private readonly pageLayoutsService: PageLayoutsService,
    private readonly tenantsService: TenantsService,
    private readonly publicLogger: PublicRequestLoggerService,
    private readonly tenantResolver: TenantResolutionService
  ) {}

  /**
   * 🎯 BOOTSTRAP ENDPOINT - SINGLE SOURCE OF TRUTH
   * Get complete site data in one request
   */
  @Get('bootstrap')
  @ApiOperation({
    summary: '🚀 Bootstrap complete site (MAIN ENDPOINT)',
    description: 'Single request that returns ALL site data needed for frontend. This is the primary endpoint for public sites.'
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiResponse({
    status: 200,
    description: 'Complete site bootstrap data',
    type: SiteBootstrapResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async bootstrap(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Query('lang') language: string = 'tr',
    @Req() request?: Request
  ): Promise<SiteBootstrapResponseDto> {
    // 🚀 START: Comprehensive logging
    const context: PublicRequestLogContext = {
      endpoint: '/public/site/bootstrap',
      method: 'GET',
      host: request?.headers?.host as string,
      tenantHost: tenantHost,
      language: language,
      userAgent: request?.headers?.['user-agent'] as string,
      ip: request?.ip || request?.headers?.['x-forwarded-for'] as string,
      startTime: Date.now()
    };

    const requestId = await this.publicLogger.logRequestStart(context);

    try {
      const result = await this.siteBootstrapService.bootstrap(tenantHost, language);

      // ✅ SUCCESS: Log completion
      await this.publicLogger.logRequestComplete(requestId, context, true);

      return result;
    } catch (error) {
      // ❌ ERROR: Log failure
      await this.publicLogger.logRequestComplete(requestId, context, false, error.message);
      throw error;
    }
  }

  /**
   * Get specific page with layout (for individual page loads)
   */
  @Get('bootstrap/page/:slug')
  @ApiOperation({
    summary: 'Get specific page bootstrap data',
    description: 'Get individual page data with layout and sections'
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiParam({
    name: 'slug',
    description: 'Page slug (without leading slash)',
    example: 'services'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiResponse({
    status: 200,
    description: 'Page bootstrap data with layout',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'object' },
        layout: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            sections: { type: 'array' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant or page not found' })
  async getPageBootstrap(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Param('slug') slug: string,
    @Query('lang') language: string = 'tr',
    @Req() request?: Request
  ) {
    // 🚀 START: Comprehensive logging
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    const context: PublicRequestLogContext = {
      endpoint: '/public/site/bootstrap/page/:slug',
      method: 'GET',
      host: request?.headers?.host as string,
      tenantHost: tenantHost,
      language: language,
      slug: normalizedSlug,
      userAgent: request?.headers?.['user-agent'] as string,
      ip: request?.ip || request?.headers?.['x-forwarded-for'] as string,
      startTime: Date.now()
    };

    const requestId = await this.publicLogger.logRequestStart(context);

    try {
      const result = await this.siteBootstrapService.getPageBootstrap(tenantHost, normalizedSlug, language);

      // ✅ SUCCESS: Log completion
      await this.publicLogger.logRequestComplete(requestId, context, true);

      return result;
    } catch (error) {
      // ❌ ERROR: Log failure
      await this.publicLogger.logRequestComplete(requestId, context, false, error.message);
      throw error;
    }
  }

  /**
   * Get bootstrap performance metrics (for monitoring)
   */
  @Get('bootstrap/metrics')
  @ApiOperation({
    summary: 'Get bootstrap performance metrics',
    description: 'Performance and cache metrics for monitoring'
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: true,
    example: 'demo.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Bootstrap metrics',
    schema: {
      type: 'object',
      properties: {
        tenant: { type: 'object' },
        counts: { type: 'object' },
        cache: { type: 'object' }
      }
    }
  })
  async getBootstrapMetrics(
    @Headers('X-Tenant-Host') tenantHost: string
  ) {
    return await this.siteBootstrapService.getBootstrapMetrics(tenantHost);
  }

  // ==================== LEGACY ENDPOINTS (for compatibility) ====================

  /**
   * Get public site configuration (branding, navigation, footer)
   * @deprecated Use /bootstrap endpoint instead
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
  async getSiteConfig(
    @Headers('X-Tenant-Host') tenantHost: string,
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Req() request?: Request
  ) {
    // 🎯 RESOLVE TENANT with comprehensive logging
    const { tenantId, tenant, resolvedBy, requestId } = await this.tenantResolver.resolveTenantForPublicRequest(
      request,
      '/public/site/config',
      tenantIdHeader
    );

    try {
      // 🎯 GET SITE CONFIG - DO NOT silently fallback
      const config = await this.siteConfigService.getPublicConfig(tenantId);

      if (!config) {
        console.error(`[PUBLIC_SITE_CONFIG] ❌ NO CONFIG FOUND for tenant ${tenantId} (${tenant.slug})`, {
          tenantId,
          tenantSlug: tenant.slug,
          requestId
        });

        throw new NotFoundException({
          message: `Site configuration not found for tenant "${tenant.name}" (${tenant.slug})`,
          code: 'SITE_CONFIG_NOT_FOUND',
          context: {
            tenantId,
            tenantSlug: tenant.slug,
            tenantName: tenant.name,
            requestId,
            suggestion: 'Initialize template configuration from Portal'
          }
        });
      }

      console.log(`[PUBLIC_SITE_CONFIG] ✅ CONFIG FOUND for tenant ${tenantId} (${tenant.slug})`, {
        tenantId,
        tenantSlug: tenant.slug,
        hasLogo: !!config.branding?.logoUrl,
        navItems: config.navigation?.length || 0,
        footerColumns: config.footer?.columns?.length || 0,
        requestId
      });

      return {
        ...config,
        // Add debug context
        _debug: {
          tenantId,
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
          resolvedBy,
          requestId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`[PUBLIC_SITE_CONFIG] ❌ ERROR for tenant ${tenantId}: ${error.message}`, {
        tenantId,
        tenantSlug: tenant.slug,
        error: error.message,
        requestId
      });
      throw error;
    }
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
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Query('lang') language: string = 'tr',
    @Req() request?: Request
  ) {
    // 🎯 RESOLVE TENANT with comprehensive logging
    const { tenantId, tenant, resolvedBy, requestId } = await this.tenantResolver.resolveTenantForPublicRequest(
      request,
      '/public/site/pages',
      tenantIdHeader
    );

    try {
      const pages = await this.dynamicPagesService.findPublishedForTenant(tenantId, language);

      console.log(`[PUBLIC_PAGES] ✅ PAGES FOUND for tenant ${tenantId} (${tenant.slug}): ${pages.length} published pages`, {
        tenantId,
        tenantSlug: tenant.slug,
        language,
        pagesCount: pages.length,
        hasHomepage: pages.some(p => p.slug === '/'),
        requestId
      });

      // MUST include homepage slug "/"
      const hasHomepage = pages.some(p => p.slug === '/');
      if (!hasHomepage) {
        console.warn(`[PUBLIC_PAGES] ⚠️  NO HOMEPAGE FOUND for tenant ${tenantId} (${tenant.slug})`, {
          tenantId,
          tenantSlug: tenant.slug,
          language,
          availableSlugs: pages.map(p => p.slug),
          requestId,
          suggestion: 'Create homepage with slug "/" via template initialization'
        });
      }

      // Sort pages for better navigation (home first, then alphabetically)
      const sortedPages = pages.sort((a, b) => {
        if (a.slug === '/') return -1;
        if (b.slug === '/') return 1;
        return a.slug.localeCompare(b.slug);
      });

      // Add debug info to response
      return {
        pages: sortedPages,
        _debug: {
          tenantId,
          tenantSlug: tenant.slug,
          resolvedBy,
          language,
          pagesCount: pages.length,
          hasHomepage,
          requestId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`[PUBLIC_PAGES] ❌ ERROR for tenant ${tenantId}: ${error.message}`, {
        tenantId,
        tenantSlug: tenant.slug,
        language,
        error: error.message,
        requestId
      });
      throw error;
    }
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
    @Param('slug') slug: string,
    @Headers('X-Tenant-Host') tenantHost?: string,
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Query('lang') language: string = 'tr',
    @Req() request?: Request
  ) {
    // 🎯 RESOLVE TENANT with comprehensive logging
    const { tenantId, tenant, resolvedBy, requestId } = await this.tenantResolver.resolveTenantForPublicRequest(
      request,
      `/public/site/pages/by-slug/${slug}`,
      tenantIdHeader
    );

    // Normalize slug (ensure it starts with /)
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;

    try {
      // 🎯 GET PAGE with fallback strategy for language
      let page: any = null;
      let langUsed = language;

      try {
        page = await this.dynamicPagesService.findBySlug(tenantId, normalizedSlug, language);
      } catch (error) {
        // Language fallback strategy
        console.warn(`[PUBLIC_PAGE_BY_SLUG] ⚠️  Page not found in ${language}, trying fallbacks`, {
          tenantId,
          tenantSlug: tenant.slug,
          slug: normalizedSlug,
          requestedLang: language,
          requestId
        });

        // Try tenant default language (tr)
        if (language !== 'tr') {
          try {
            page = await this.dynamicPagesService.findBySlug(tenantId, normalizedSlug, 'tr');
            langUsed = 'tr';
          } catch (fallbackError) {
            // Try English
            if (language !== 'en') {
              try {
                page = await this.dynamicPagesService.findBySlug(tenantId, normalizedSlug, 'en');
                langUsed = 'en';
              } catch (enError) {
                // No page found in any language
                throw new NotFoundException({
                  message: `Page "${normalizedSlug}" not found in any language`,
                  code: 'PAGE_NOT_FOUND',
                  context: {
                    tenantId,
                    tenantSlug: tenant.slug,
                    slug: normalizedSlug,
                    triedLanguages: [language, 'tr', 'en'],
                    requestId
                  }
                });
              }
            } else {
              throw new NotFoundException({
                message: `Page "${normalizedSlug}" not found`,
                code: 'PAGE_NOT_FOUND',
                context: {
                  tenantId,
                  tenantSlug: tenant.slug,
                  slug: normalizedSlug,
                  triedLanguages: [language, 'tr'],
                  requestId
                }
              });
            }
          }
        } else {
          throw error;
        }
      }

      // Only return published pages for public access
      if (!page.published) {
        console.warn(`[PUBLIC_PAGE_BY_SLUG] ❌ PAGE NOT PUBLISHED: ${normalizedSlug} for tenant ${tenantId}`, {
          tenantId,
          tenantSlug: tenant.slug,
          slug: normalizedSlug,
          pageId: page.id,
          published: page.published,
          requestId
        });

        throw new NotFoundException({
          message: 'Page not found or not published',
          code: 'PAGE_NOT_PUBLISHED',
          context: {
            tenantId,
            tenantSlug: tenant.slug,
            slug: normalizedSlug,
            pageId: page.id,
            requestId
          }
        });
      }

      // 🎯 GET PAGE LAYOUT AND SECTIONS
      const layout = await this.pageLayoutsService.getPublicLayout(tenantId, page.layoutKey, langUsed);

      // 🎯 MANDATORY LOGGING: tenantId, slug, layoutKey, lang, sectionCount
      console.log(`[PUBLIC_PAGE_BY_SLUG] ✅ PAGE + LAYOUT FOUND`, {
        tenantId,
        tenantSlug: tenant.slug,
        slug: normalizedSlug,
        layoutKey: page.layoutKey,
        lang: langUsed,
        sectionCount: layout.sections.length,
        sectionTypes: layout.sections.map(s => s.type),
        pageId: page.id,
        pageType: page.pageType,
        requestId,
        resolvedBy
      });

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
        },
        _debug: {
          tenantId,
          tenantSlug: tenant.slug,
          resolvedBy,
          requestedLang: language,
          langUsed,
          layoutKey: page.layoutKey,
          sectionCount: layout.sections.length,
          sectionTypes: layout.sections.map(s => s.type),
          requestId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`[PUBLIC_PAGE_BY_SLUG] ❌ ERROR for slug ${normalizedSlug} tenant ${tenantId}: ${error.message}`, {
        tenantId,
        tenantSlug: tenant.slug,
        slug: normalizedSlug,
        language,
        error: error.message,
        requestId
      });
      throw error;
    }
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

  // ==================== MANDATORY DEBUG ENDPOINTS ====================

  /**
   * 🔍 DEBUG SUMMARY - Complete tenant status overview
   */
  @Get('debug/summary')
  @ApiOperation({ summary: 'Debug tenant summary (safe, read-only)' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Direct tenant ID (for testing)',
    required: false,
    example: '2'
  })
  @ApiResponse({
    status: 200,
    description: 'Debug summary',
    schema: {
      type: 'object',
      properties: {
        resolvedTenantId: { type: 'number' },
        templateKey: { type: 'string', nullable: true },
        hasSiteConfig: { type: 'boolean' },
        pagesCount: { type: 'number' },
        publishedPagesCount: { type: 'number' },
        hasHomePage: { type: 'boolean' },
        homeLayoutKey: { type: 'string', nullable: true },
        availableCmsLayoutsKeys: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  async debugSummary(
    @Headers('X-Tenant-Host') tenantHost?: string,
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Req() request?: Request
  ) {
    try {
      // 🎯 RESOLVE TENANT
      const { tenantId, tenant, resolvedBy, requestId } = await this.tenantResolver.resolveTenantForPublicRequest(
        request,
        '/public/site/debug/summary',
        tenantIdHeader
      );

      // 🎯 GATHER COMPREHENSIVE DEBUG INFO
      const [siteConfig, allPages, publishedPages] = await Promise.all([
        this.siteConfigService.getForTenant(tenantId).catch(() => null),
        this.dynamicPagesService.findAllForTenant(tenantId, 'tr').catch(() => []),
        this.dynamicPagesService.findPublishedForTenant(tenantId, 'tr').catch(() => [])
      ]);

      // Find homepage
      const homePage = publishedPages.find(p => p.slug === '/');

      const summary = {
        resolvedTenantId: tenantId,
        resolvedBy,
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          domain: tenant.domain,
          status: tenant.status
        },
        templateKey: siteConfig?.templateKey || null,
        hasSiteConfig: !!siteConfig,
        pagesCount: allPages.length,
        publishedPagesCount: publishedPages.length,
        hasHomePage: !!homePage,
        homeLayoutKey: homePage?.layoutKey || null,
        availableCmsLayoutsKeys: [], // Layout enumeration removed for performance
        debugging: {
          requestId,
          timestamp: new Date().toISOString(),
          allPageSlugs: allPages.map(p => p.slug),
          publishedPageSlugs: publishedPages.map(p => p.slug),
          siteConfigExists: !!siteConfig,
          templateConfigured: !!siteConfig?.templateKey
        }
      };

      console.log(`[DEBUG_SUMMARY] ✅ SUMMARY GENERATED for tenant ${tenantId} (${tenant.slug})`, {
        tenantId,
        tenantSlug: tenant.slug,
        templateKey: siteConfig?.templateKey,
        hasSiteConfig: !!siteConfig,
        pagesCount: allPages.length,
        publishedPagesCount: publishedPages.length,
        hasHomePage: !!homePage,
        requestId
      });

      return summary;
    } catch (error) {
      console.error(`[DEBUG_SUMMARY] ❌ ERROR: ${error.message}`, {
        error: error.message,
        tenantHost,
        tenantIdHeader
      });

      return {
        error: error.message,
        code: error.code || 'DEBUG_SUMMARY_FAILED',
        context: error.context || { tenantHost, tenantIdHeader },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🔍 DEBUG PAGE - Specific page debug info
   */
  @Get('debug/page')
  @ApiOperation({ summary: 'Debug specific page (safe, read-only)' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain (e.g., demo.softellio.com)',
    required: false,
    example: 'demo.softellio.com'
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Direct tenant ID (for testing)',
    required: false,
    example: '2'
  })
  @ApiQuery({
    name: 'slug',
    description: 'Page slug to debug',
    required: true,
    example: '/'
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code',
    required: false,
    example: 'tr'
  })
  @ApiResponse({
    status: 200,
    description: 'Page debug info',
    schema: {
      type: 'object',
      properties: {
        resolvedTenantId: { type: 'number' },
        slug: { type: 'string' },
        layoutKey: { type: 'string', nullable: true },
        langUsed: { type: 'string' },
        sectionCount: { type: 'number' },
        sectionTypes: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  async debugPage(
    @Query('slug') slug: string,
    @Query('lang') language: string = 'tr',
    @Headers('X-Tenant-Host') tenantHost?: string,
    @Headers('X-Tenant-Id') tenantIdHeader?: string,
    @Req() request?: Request
  ) {
    try {
      // 🎯 RESOLVE TENANT
      const { tenantId, tenant, resolvedBy, requestId } = await this.tenantResolver.resolveTenantForPublicRequest(
        request,
        '/public/site/debug/page',
        tenantIdHeader
      );

      if (!slug) {
        return {
          error: 'Slug parameter is required',
          usage: '/public/site/debug/page?slug=/&lang=tr',
          timestamp: new Date().toISOString()
        };
      }

      // Normalize slug
      const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;

      // 🎯 TRY TO FIND PAGE with language fallback
      let page: any = null;
      let langUsed = language;
      let pageError: string | null = null;

      try {
        page = await this.dynamicPagesService.findBySlug(tenantId, normalizedSlug, language);
      } catch (error) {
        pageError = error.message;

        // Try fallback languages
        if (language !== 'tr') {
          try {
            page = await this.dynamicPagesService.findBySlug(tenantId, normalizedSlug, 'tr');
            langUsed = 'tr';
            pageError = null;
          } catch (trError) {
            pageError = `Not found in ${language} or tr: ${trError.message}`;
          }
        }
      }

      let layout: any = null;
      let layoutError: string | null = null;
      let sectionCount = 0;
      let sectionTypes: string[] = [];

      if (page) {
        try {
          layout = await this.pageLayoutsService.getPublicLayout(tenantId, page.layoutKey, langUsed);
          sectionCount = layout.sections?.length || 0;
          sectionTypes = layout.sections?.map((s: any) => s.type).filter(Boolean) || [];
        } catch (error) {
          layoutError = error.message;
        }
      }

      const debugInfo = {
        resolvedTenantId: tenantId,
        resolvedBy,
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name
        },
        input: {
          slug: normalizedSlug,
          requestedLang: language
        },
        page: page ? {
          id: page.id,
          slug: page.slug,
          title: page.title,
          layoutKey: page.layoutKey,
          pageType: page.pageType,
          published: page.published,
          language: page.language
        } : null,
        layout: layout ? {
          key: layout.key,
          language: layout.language,
          sectionsCount: sectionCount
        } : null,
        result: {
          slug: normalizedSlug,
          layoutKey: page?.layoutKey || null,
          langUsed,
          sectionCount,
          sectionTypes
        },
        errors: {
          pageError,
          layoutError
        },
        debugging: {
          requestId,
          timestamp: new Date().toISOString(),
          pageFound: !!page,
          layoutFound: !!layout,
          isPublished: page?.published || false
        }
      };

      console.log(`[DEBUG_PAGE] ✅ PAGE DEBUG for tenant ${tenantId} slug ${normalizedSlug}`, {
        tenantId,
        tenantSlug: tenant.slug,
        slug: normalizedSlug,
        layoutKey: page?.layoutKey,
        langUsed,
        sectionCount,
        sectionTypes,
        pageFound: !!page,
        layoutFound: !!layout,
        requestId
      });

      return debugInfo;
    } catch (error) {
      console.error(`[DEBUG_PAGE] ❌ ERROR: ${error.message}`, {
        error: error.message,
        slug,
        language,
        tenantHost,
        tenantIdHeader
      });

      return {
        error: error.message,
        code: error.code || 'DEBUG_PAGE_FAILED',
        context: error.context || { slug, language, tenantHost, tenantIdHeader },
        timestamp: new Date().toISOString()
      };
    }
  }
}