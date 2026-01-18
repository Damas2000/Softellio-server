import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TemplatesService } from './templates.service';
import { SiteConfigService } from './site-config.service';
import { DynamicPagesService } from './dynamic-pages.service';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TenantsService } from '../tenants/tenants.service';
import {
  SiteBootstrapResponseDto,
  TenantInfoDto,
  BrandingDto,
  NavItemBootstrapDto,
  FooterBootstrapDto,
  PageInfoDto,
  HomeLayoutDto,
  SectionBootstrapDto
} from './dto/site-bootstrap.dto';

@Injectable()
export class SiteBootstrapService {
  private readonly logger = new Logger(SiteBootstrapService.name);

  constructor(
    private prisma: PrismaService,
    private templatesService: TemplatesService,
    private siteConfigService: SiteConfigService,
    private dynamicPagesService: DynamicPagesService,
    private pageLayoutsService: PageLayoutsService,
    private tenantsService: TenantsService
  ) {}

  /**
   * 🎯 SINGLE SOURCE OF TRUTH for frontend
   * Bootstrap entire site with one request
   */
  async bootstrap(tenantHost: string, language: string = 'tr'): Promise<SiteBootstrapResponseDto> {
    const startTime = Date.now();

    this.logger.log(`[SITE_BOOTSTRAP] 🚀 START: host=${tenantHost}, lang=${language}`);

    // 1. Resolve tenant from host
    const tenant = await this.resolveTenant(tenantHost);

    // 2. Get site configuration (branding, nav, footer)
    const siteConfig = await this.siteConfigService.getForTenant(tenant.id);

    // 3. Get template information
    const template = siteConfig ?
      await this.templatesService.findByKey(siteConfig.templateKey) :
      await this.getDefaultTemplate();

    // 4. Get all published pages
    const pages = await this.dynamicPagesService.findPublishedForTenant(tenant.id, language);

    // 5. Get home page layout with sections
    const homeLayout = await this.pageLayoutsService.getPublicLayout(tenant.id, 'HOME', language);

    // 6. Build complete bootstrap response
    const response: SiteBootstrapResponseDto = {
      tenant: this.buildTenantInfo(tenant, siteConfig?.templateKey || template.key),
      branding: this.buildBranding(siteConfig),
      navigation: this.buildNavigation(siteConfig),
      footer: this.buildFooter(siteConfig),
      pages: this.buildPages(pages),
      home: this.buildHomeLayout(homeLayout),
      seoDefaults: siteConfig?.seoDefaults || {},
      customCSS: siteConfig?.customCSS,
      meta: {
        templateKey: siteConfig?.templateKey || template.key,
        supportedSections: template.supportedSections,
        cacheTimestamp: new Date().toISOString(),
        version: template.version
      }
    };

    const duration = Date.now() - startTime;

    this.logger.log(`[SITE_BOOTSTRAP] ✅ COMPLETE: ` +
      `host=${tenantHost} ` +
      `tenant=${tenant.id} ` +
      `template=${response.meta.templateKey} ` +
      `pages=${pages.length} ` +
      `sections(home)=${homeLayout.sections.length} ` +
      `duration=${duration}ms`);

    return response;
  }

  /**
   * Get bootstrap data for specific page
   */
  async getPageBootstrap(tenantHost: string, pageSlug: string, language: string = 'tr'): Promise<any> {
    this.logger.log(`[PAGE_BOOTSTRAP] 🎯 START: host=${tenantHost}, page=${pageSlug}, lang=${language}`);

    const tenant = await this.resolveTenant(tenantHost);
    const page = await this.dynamicPagesService.findBySlug(tenant.id, pageSlug, language);

    if (!page.published) {
      throw new NotFoundException('Page not found or not published');
    }

    // Get page layout and sections
    const layout = await this.pageLayoutsService.getPublicLayout(tenant.id, page.layoutKey, language);

    this.logger.log(`[PAGE_BOOTSTRAP] ✅ COMPLETE: ` +
      `page=${pageSlug} ` +
      `layoutKey=${page.layoutKey} ` +
      `sections=${layout.sections.length}`);

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
        sections: layout.sections.map(section => ({
          id: section.id,
          type: section.type,
          variant: section.variant,
          order: section.order,
          enabled: true, // Public layouts only include enabled sections
          propsJson: section.propsJson
        }))
      }
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Resolve tenant from host with enhanced error handling
   */
  private async resolveTenant(tenantHost: string): Promise<any> {
    if (!tenantHost) {
      throw new NotFoundException('X-Tenant-Host header is required');
    }

    const tenant = await this.tenantsService.findByDomain(tenantHost);
    if (!tenant) {
      this.logger.error(`[SITE_BOOTSTRAP] ❌ Tenant not found: ${tenantHost}`);
      throw new NotFoundException(`Tenant not found for domain: ${tenantHost}`);
    }

    if (!tenant.isActive) {
      this.logger.error(`[SITE_BOOTSTRAP] ❌ Tenant inactive: ${tenantHost}`);
      throw new NotFoundException(`Tenant is inactive: ${tenantHost}`);
    }

    return tenant;
  }

  /**
   * Get default template if tenant has no site config
   */
  private async getDefaultTemplate() {
    const templates = await this.templatesService.findAllActive();
    if (templates.length === 0) {
      throw new NotFoundException('No active templates found');
    }
    return templates[0]; // Return first active template
  }

  /**
   * Build tenant information
   */
  private buildTenantInfo(tenant: any, templateKey: string): TenantInfoDto {
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      domain: tenant.domain,
      locale: tenant.defaultLanguage || 'tr',
      templateKey
    };
  }

  /**
   * Build branding configuration
   */
  private buildBranding(siteConfig: any): BrandingDto {
    const branding = siteConfig?.branding || {};

    return {
      logoUrl: branding.logoUrl,
      faviconUrl: branding.faviconUrl,
      primaryColor: branding.primaryColor || '#3B82F6',
      secondaryColor: branding.secondaryColor || '#1E40AF',
      fontFamily: branding.fontFamily || 'Inter, sans-serif'
    };
  }

  /**
   * Build navigation structure
   */
  private buildNavigation(siteConfig: any): NavItemBootstrapDto[] {
    const navigation = siteConfig?.navigation;

    if (!navigation || !Array.isArray(navigation)) {
      // Return default navigation if none configured
      return [
        { label: 'Ana Sayfa', href: '/', order: 1, isCTA: false, isExternal: false },
        { label: 'Hizmetler', href: '/services', order: 2, isCTA: false, isExternal: false },
        { label: 'İletişim', href: '/contact', order: 3, isCTA: true, isExternal: false }
      ];
    }

    return navigation.map(item => ({
      label: item.label,
      href: item.href,
      order: item.order,
      isCTA: item.isCTA || false,
      isExternal: item.isExternal || false,
      children: item.children ? item.children.map(child => ({
        label: child.label,
        href: child.href,
        order: child.order || 0,
        isCTA: false,
        isExternal: child.isExternal || false
      })) : undefined
    }));
  }

  /**
   * Build footer configuration
   */
  private buildFooter(siteConfig: any): FooterBootstrapDto {
    const footer = siteConfig?.footer;

    if (!footer) {
      // Return default footer if none configured
      return {
        columns: [
          {
            title: 'Hızlı Linkler',
            links: [
              { label: 'Ana Sayfa', url: '/' },
              { label: 'Hizmetler', url: '/services' },
              { label: 'İletişim', url: '/contact' }
            ]
          }
        ],
        copyrightText: '© 2024 Şirket Adı. Tüm hakları saklıdır.'
      };
    }

    return {
      columns: footer.columns || [],
      socialLinks: footer.socialLinks || [],
      copyrightText: footer.copyrightText || '© 2024 Şirket Adı. Tüm hakları saklıdır.'
    };
  }

  /**
   * Build pages list
   */
  private buildPages(pages: any[]): PageInfoDto[] {
    return pages
      .sort((a, b) => {
        // Sort: home first, then alphabetically
        if (a.slug === '/') return -1;
        if (b.slug === '/') return 1;
        return a.slug.localeCompare(b.slug);
      })
      .map(page => ({
        slug: page.slug,
        layoutKey: page.layoutKey,
        title: page.title,
        pageType: page.pageType,
        seo: page.seo
      }));
  }

  /**
   * Build home layout with sections
   */
  private buildHomeLayout(homeLayout: any): HomeLayoutDto {
    const sections: SectionBootstrapDto[] = homeLayout.sections.map(section => ({
      id: section.id,
      type: section.type,
      variant: section.variant || 'default',
      order: section.order,
      enabled: true, // Public only shows enabled sections
      propsJson: section.propsJson || {}
    }));

    return {
      layoutKey: 'HOME',
      sections
    };
  }

  /**
   * Validate template section constraints
   */
  async validateSectionAgainstTemplate(tenantId: number, sectionType: string): Promise<boolean> {
    try {
      const siteConfig = await this.siteConfigService.getForTenant(tenantId);
      if (!siteConfig) {
        return true; // No template constraints if no config
      }

      const template = await this.templatesService.findByKey(siteConfig.templateKey);
      return template.supportedSections.includes(sectionType);
    } catch (error) {
      this.logger.error(`[SITE_BOOTSTRAP] Template validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  async getBootstrapMetrics(tenantHost: string): Promise<any> {
    const tenant = await this.resolveTenant(tenantHost);

    const [siteConfig, pages, homeLayout] = await Promise.all([
      this.siteConfigService.getForTenant(tenant.id),
      this.dynamicPagesService.findPublishedForTenant(tenant.id),
      this.pageLayoutsService.getPublicLayout(tenant.id, 'HOME')
    ]);

    return {
      tenant: {
        id: tenant.id,
        domain: tenant.domain,
        templateKey: siteConfig?.templateKey || 'none'
      },
      counts: {
        pages: pages.length,
        homeSections: homeLayout.sections.length,
        navigationItems: siteConfig?.navigation?.length || 0,
        footerColumns: siteConfig?.footer?.columns?.length || 0
      },
      cache: {
        timestamp: new Date().toISOString(),
        ttl: 300 // 5 minutes suggested cache TTL
      }
    };
  }
}