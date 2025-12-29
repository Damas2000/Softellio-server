import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { ThemeSettingsService } from './theme-settings.service';
import { PageLayoutsService } from './page-layouts.service';

@Injectable()
export class FrontendAggregatorService {
  private readonly logger = new Logger(FrontendAggregatorService.name);

  constructor(
    private prisma: PrismaService,
    private themeSettingsService: ThemeSettingsService,
    private pageLayoutsService: PageLayoutsService,
  ) {}

  /**
   * Aggregate all data needed for frontend home page in single request
   */
  async getHomePageData(tenantId: number | null, language?: string) {
    this.logger.log(`🏠 Aggregating home page data for tenant ${tenantId}, language: ${language}`);

    try {
      // Handle SUPER_ADMIN context (null tenantId) with fallback data
      if (tenantId === null) {
        this.logger.debug('🔑 SUPER_ADMIN context detected - using fallback data');
        return this.getSuperAdminFallbackData(language);
      }

      // Get tenant info to determine default language
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      // Fetch all data in parallel for performance
      const [siteSettings, theme, menu, layout] = await Promise.all([
        this.getSiteSettings(tenantId, lang),
        this.themeSettingsService.getPublicThemeSetting(tenantId),
        this.getMenu(tenantId, lang),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, 'HOME', lang),
      ]);

      return {
        tenant,
        siteSettings,
        theme,
        menu,
        layout,
      };
    } catch (error) {
      this.logger.error(`❌ Error aggregating home page data for tenant ${tenantId}:`, error.message);

      // Return minimal safe response on error
      return {
        tenant: {
          tenantId,
          companyName: 'Website',
          slug: 'unknown',
          domain: 'unknown',
          templateKey: 'default',
          defaultLanguage: 'tr',
          availableLanguages: ['tr'],
          status: 'active',
        },
        siteSettings: { siteName: 'Website' },
        theme: await this.themeSettingsService.getPublicThemeSetting(tenantId),
        menu: { key: 'main', items: [] },
        layout: {
          key: 'HOME',
          language: language || 'tr',
          sections: [],
          meta: {
            type: 'global',
            displayName: 'Ana Sayfa / Home',
            isPageSpecific: false
          }
        },
      };
    }
  }

  /**
   * Get basic tenant information
   */
  private async getTenantBasics(tenantId: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        theme: true,
        defaultLanguage: true,
        availableLanguages: true,
        status: true,
      },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    return {
      tenantId: tenant.id,
      companyName: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      templateKey: tenant.theme || 'default',
      defaultLanguage: tenant.defaultLanguage,
      availableLanguages: tenant.availableLanguages,
      status: tenant.status,
    };
  }

  /**
   * Get site settings for language
   */
  private async getSiteSettings(tenantId: number, language: string) {
    try {
      const siteSettings = await this.prisma.siteSetting.findUnique({
        where: { tenantId },
        include: {
          translations: {
            where: { language },
          },
        },
      });

      if (!siteSettings || !siteSettings.translations[0]) {
        // Return defaults if not found
        return {
          siteName: 'Website',
          siteDescription: null,
          seoMetaTitle: null,
          seoMetaDescription: null,
        };
      }

      const translation = siteSettings.translations[0];
      return {
        siteName: translation.siteName,
        siteDescription: translation.siteDescription,
        seoMetaTitle: translation.seoMetaTitle,
        seoMetaDescription: translation.seoMetaDescription,
      };
    } catch (error) {
      this.logger.warn(`⚠️ Failed to get site settings for tenant ${tenantId}, language ${language}:`, error.message);
      return {
        siteName: 'Website',
        siteDescription: null,
        seoMetaTitle: null,
        seoMetaDescription: null,
      };
    }
  }

  /**
   * Get menu for language
   */
  private async getMenu(tenantId: number, language: string, menuKey: string = 'main') {
    try {
      const menu = await this.prisma.menu.findFirst({
        where: {
          tenantId,
          key: menuKey,
        },
        include: {
          items: {
            where: {
              parentId: null, // Top-level items only
            },
            include: {
              translations: {
                where: { language },
              },
              children: {
                include: {
                  translations: {
                    where: { language },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!menu) {
        return {
          key: menuKey,
          items: [],
        };
      }

      // Transform menu items with translations
      const items = menu.items.map((item) => {
        const translation = item.translations[0];
        const menuItem: any = {
          id: item.id,
          label: translation?.label || 'Menu Item',
          url: item.externalUrl || (item.pageId ? `/page/${item.pageId}` : '#'),
          order: item.order || 0,
          children: [],
        };

        // Add children if any
        if (item.children && item.children.length > 0) {
          menuItem.children = item.children.map((child) => {
            const childTranslation = child.translations[0];
            return {
              id: child.id,
              label: childTranslation?.label || 'Submenu Item',
              url: child.externalUrl || (child.pageId ? `/page/${child.pageId}` : '#'),
              order: child.order || 0,
            };
          });
        }

        return menuItem;
      });

      return {
        key: menu.key,
        items,
      };
    } catch (error) {
      this.logger.warn(`⚠️ Failed to get menu for tenant ${tenantId}, language ${language}:`, error.message);
      return {
        key: menuKey,
        items: [],
      };
    }
  }

  /**
   * Get contact info for tenant
   */
  async getContactInfo(tenantId: number, language: string) {
    try {
      const contactInfo = await this.prisma.contactInfo.findUnique({
        where: { tenantId },
        include: {
          translations: {
            where: { language },
          },
          offices: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          socialLinks: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!contactInfo || !contactInfo.translations[0]) {
        return null;
      }

      const translation = contactInfo.translations[0];
      return {
        companyName: translation.companyName,
        tagline: translation.tagline,
        description: translation.description,
        workingHours: translation.workingHours,
        logo: contactInfo.logo,
        favicon: contactInfo.favicon,
        offices: contactInfo.offices.map((office) => ({
          id: office.id,
          name: office.name,
          email: office.email,
          phone: office.phone,
          fax: office.fax,
          address: office.address,
          mapUrl: office.mapUrl,
          latitude: office.latitude,
          longitude: office.longitude,
          isPrimary: office.isPrimary,
        })),
        socialLinks: contactInfo.socialLinks.map((link) => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          icon: link.icon,
        })),
      };
    } catch (error) {
      this.logger.warn(`⚠️ Failed to get contact info for tenant ${tenantId}, language ${language}:`, error.message);
      return null;
    }
  }

  /**
   * Get extended home page data with contact info
   */
  async getExtendedHomePageData(tenantId: number, language?: string) {
    const basicData = await this.getHomePageData(tenantId, language);
    const lang = language || basicData.tenant.defaultLanguage || 'tr';

    const contactInfo = await this.getContactInfo(tenantId, lang);

    return {
      ...basicData,
      contactInfo,
    };
  }

  /**
   * Get layout page data with minimal tenant and theme info
   */
  async getLayoutPageData(tenantId: number, key: string, language?: string) {
    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      const [theme, layout] = await Promise.all([
        this.themeSettingsService.getPublicThemeSetting(tenantId),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, key, lang),
      ]);

      return {
        tenant,
        theme,
        layout,
      };
    } catch (error) {
      this.logger.error(`❌ Error getting layout page data for tenant ${tenantId}, key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get page data by slug (PAGE:slug pattern) with complete data
   */
  async getPageData(tenantId: number, slug: string, language?: string) {
    this.logger.log(`📄 Aggregating page data for tenant ${tenantId}, slug: ${slug}, language: ${language}`);

    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';
      const layoutKey = `PAGE:${slug}`;

      // Validate layout key format
      const validation = this.pageLayoutsService.validateLayoutKey(layoutKey);
      if (!validation.isValid) {
        throw new Error(`Invalid page slug: ${slug}`);
      }

      // Fetch all data in parallel for performance
      const [siteSettings, theme, menu, layout] = await Promise.all([
        this.getSiteSettings(tenantId, lang),
        this.themeSettingsService.getPublicThemeSetting(tenantId),
        this.getMenu(tenantId, lang),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, layoutKey, lang),
      ]);

      return {
        tenant,
        siteSettings,
        theme,
        menu,
        layout,
        page: {
          slug,
          layoutKey,
          isPageSpecific: true,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error aggregating page data for tenant ${tenantId}, slug ${slug}:`, error.message);
      throw error;
    }
  }

  /**
   * Get enhanced page data with contact info
   */
  async getPageDataExtended(tenantId: number, slug: string, language?: string) {
    const basicData = await this.getPageData(tenantId, slug, language);
    const lang = language || basicData.tenant.defaultLanguage || 'tr';

    const contactInfo = await this.getContactInfo(tenantId, lang);

    return {
      ...basicData,
      contactInfo,
    };
  }

  /**
   * Get all available layouts for tenant (for navigation or sitemap)
   */
  async getAvailableLayouts(tenantId: number, language?: string) {
    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      const layouts = await this.pageLayoutsService.getAllLayouts(tenantId, lang);

      return {
        tenant: {
          tenantId: tenant.tenantId,
          defaultLanguage: tenant.defaultLanguage,
          availableLanguages: tenant.availableLanguages,
        },
        language: lang,
        layouts: layouts.map(layout => ({
          key: layout.key,
          type: layout.type,
          slug: layout.slug,
          displayName: layout.displayName,
          sectionsCount: layout.sectionsCount,
          status: layout.status,
          updatedAt: layout.updatedAt,
          url: layout.type === 'page' && layout.slug ? `/page/${layout.slug}` :
               layout.key === 'HOME' ? '/' : `/${layout.key.toLowerCase()}`,
        })),
      };
    } catch (error) {
      this.logger.error(`❌ Error getting available layouts for tenant ${tenantId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get SEO and metadata for any layout or page
   */
  async getPageMeta(tenantId: number, key: string, language?: string) {
    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      const [siteSettings, layout] = await Promise.all([
        this.getSiteSettings(tenantId, lang),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, key, lang),
      ]);

      // Generate SEO metadata based on layout and site settings
      const isHome = key === 'HOME';
      const isPageSpecific = layout.meta?.isPageSpecific || false;
      const displayName = layout.meta?.displayName || key;

      return {
        meta: {
          title: isHome ? siteSettings.siteName :
                 siteSettings.seoMetaTitle || `${displayName} - ${siteSettings.siteName}`,
          description: siteSettings.seoMetaDescription || siteSettings.siteDescription,
          siteName: siteSettings.siteName,
          language: lang,
          url: isHome ? '/' :
               isPageSpecific && layout.meta?.slug ? `/page/${layout.meta.slug}` :
               `/${key.toLowerCase()}`,
        },
        layout: {
          key: layout.key,
          type: layout.meta?.type || 'global',
          isPageSpecific,
          displayName,
          sectionsCount: layout.sections?.length || 0,
        },
        tenant: {
          companyName: tenant.companyName,
          domain: tenant.domain,
          templateKey: tenant.templateKey,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error getting page meta for tenant ${tenantId}, key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get complete footer data with layout and collections
   */
  async getFooterData(tenantId: number, language?: string) {
    this.logger.log(`🦶 Aggregating footer data for tenant ${tenantId}, language: ${language}`);

    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      // Fetch all data in parallel for performance
      const [theme, layout, contactInfo] = await Promise.all([
        this.themeSettingsService.getPublicThemeSetting(tenantId),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, 'FOOTER', lang),
        this.getContactInfo(tenantId, lang),
      ]);

      return {
        tenant: {
          tenantId: tenant.tenantId,
          companyName: tenant.companyName,
          templateKey: tenant.templateKey,
        },
        theme,
        layout,
        contactInfo,
        collections: {
          contactInfo: contactInfo || this.getDefaultContactInfo(tenant.companyName),
          offices: contactInfo?.offices || [],
          socialLinks: contactInfo?.socialLinks || [],
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error aggregating footer data for tenant ${tenantId}:`, error.message);

      // Return minimal safe response on error
      const tenant = await this.getTenantBasics(tenantId);
      return {
        tenant: {
          tenantId: tenant.tenantId,
          companyName: tenant.companyName,
          templateKey: tenant.templateKey,
        },
        theme: await this.themeSettingsService.getPublicThemeSetting(tenantId),
        layout: {
          key: 'FOOTER',
          language: language || 'tr',
          sections: [],
          meta: {
            type: 'global',
            displayName: 'Footer',
            isPageSpecific: false
          }
        },
        contactInfo: this.getDefaultContactInfo(tenant.companyName),
        collections: {
          contactInfo: this.getDefaultContactInfo(tenant.companyName),
          offices: [],
          socialLinks: [],
        },
      };
    }
  }

  /**
   * Get footer layout with theme and minimal data
   */
  async getFooterLayoutData(tenantId: number, language?: string) {
    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      const [theme, layout] = await Promise.all([
        this.themeSettingsService.getPublicThemeSetting(tenantId),
        this.pageLayoutsService.getPublicLayoutEnhanced(tenantId, 'FOOTER', lang),
      ]);

      return {
        tenant: {
          tenantId: tenant.tenantId,
          companyName: tenant.companyName,
        },
        theme,
        layout,
      };
    } catch (error) {
      this.logger.error(`❌ Error getting footer layout data for tenant ${tenantId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get collections data for footer (contact info, offices, social links)
   */
  async getFooterCollections(tenantId: number, language?: string) {
    try {
      const tenant = await this.getTenantBasics(tenantId);
      const lang = language || tenant.defaultLanguage || 'tr';

      const contactInfo = await this.getContactInfo(tenantId, lang);

      return {
        tenant: {
          tenantId: tenant.tenantId,
          companyName: tenant.companyName,
          defaultLanguage: tenant.defaultLanguage,
        },
        language: lang,
        collections: {
          contactInfo: contactInfo || this.getDefaultContactInfo(tenant.companyName),
          offices: contactInfo?.offices || [],
          socialLinks: contactInfo?.socialLinks || [],
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error getting footer collections for tenant ${tenantId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get default contact info fallback
   */
  private getDefaultContactInfo(companyName: string) {
    return {
      companyName,
      tagline: null,
      description: null,
      workingHours: null,
      logo: null,
      favicon: null,
    };
  }

  /**
   * Get fallback data for SUPER_ADMIN context (localhost access)
   */
  private getSuperAdminFallbackData(language?: string) {
    const lang = language || 'tr';

    return {
      tenant: {
        tenantId: null,
        companyName: 'Demo Printing Company',
        slug: 'demo-printing',
        domain: 'localhost',
        templateKey: 'printing',
        defaultLanguage: lang,
        availableLanguages: [lang],
        status: 'active',
      },
      siteSettings: {
        siteName: 'Demo Printing Company',
        siteDescription: 'Kaliteli baskı hizmetleri',
        seoMetaTitle: 'Demo Printing Company - Ana Sayfa',
        seoMetaDescription: 'Branda, afiş, tabela üretimi',
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter, sans-serif',
        radius: 8,
        shadowLevel: 1,
        containerMaxWidth: 1200,
        gridGap: 24,
        buttonStyle: 'solid',
        headerVariant: 'default',
        footerVariant: 'default',
      },
      menu: {
        key: 'main',
        items: [
          { id: 1, label: 'Ana Sayfa', url: '/', order: 1, children: [] },
          { id: 2, label: 'Hizmetler', url: '/services', order: 2, children: [] },
          { id: 3, label: 'İletişim', url: '/contact', order: 3, children: [] },
        ],
      },
      layout: {
        key: 'HOME',
        language: lang,
        sections: [
          {
            id: -1,
            type: 'hero',
            variant: 'default',
            order: 1,
            propsJson: {
              title: 'Branda • Afiş • Tabela',
              subtitle: 'Hızlı üretim, kaliteli baskı, profesyonel montaj.',
              ctaText: 'Teklif Al',
              ctaHref: '/contact'
            }
          },
          {
            id: -2,
            type: 'services',
            variant: 'grid',
            order: 2,
            propsJson: {
              title: 'Hizmetlerimiz',
              subtitle: 'Geniş hizmet yelpazemizle işletmenizin tüm baskı ihtiyaçlarını karşılıyoruz',
              services: [
                {
                  title: 'Branda Üretimi',
                  description: 'Dış mekan ve iç mekan brandaları',
                  icon: 'banner'
                },
                {
                  title: 'Afiş Baskısı',
                  description: 'Reklam ve tanıtım afişleri',
                  icon: 'poster'
                },
                {
                  title: 'Tabela Üretimi',
                  description: 'İşletme tabelaları ve yönlendirme levhaları',
                  icon: 'sign'
                }
              ]
            }
          }
        ],
        meta: {
          type: 'global',
          displayName: 'Ana Sayfa / Home',
          isPageSpecific: false
        }
      },
    };
  }
}