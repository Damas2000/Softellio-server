import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class FrontendBootstrapService {
  private readonly logger = new Logger(FrontendBootstrapService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Idempotent bootstrap function - safe to run multiple times
   * Creates default theme settings, layout, and sections for a tenant if missing
   */
  async bootstrapTenantDefaults(tenantId: number): Promise<void> {
    try {
      this.logger.log(`🎯 Bootstrapping defaults for tenant ${tenantId}`);

      // Get tenant info for language detection
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, slug: true, defaultLanguage: true }
      });

      if (!tenant) {
        this.logger.warn(`⚠️ Tenant ${tenantId} not found, skipping bootstrap`);
        return;
      }

      const defaultLanguage = tenant.defaultLanguage || 'tr';

      // 1. Create ThemeSetting if missing
      await this.ensureThemeSetting(tenantId);

      // 2. Create HOME PageLayout if missing
      await this.ensureHomeLayout(tenantId, defaultLanguage);

      // 3. Create FOOTER PageLayout if missing
      await this.ensureFooterLayout(tenantId, defaultLanguage);

      // 4. Create default sections if missing
      await this.ensureDefaultSections(tenantId, defaultLanguage);

      // 5. Create default footer sections if missing
      await this.ensureDefaultFooterSections(tenantId, defaultLanguage);

      this.logger.log(`✅ Bootstrap completed for tenant ${tenant.slug} (${tenantId})`);

    } catch (error) {
      this.logger.error(`❌ Bootstrap failed for tenant ${tenantId}:`, error.message);
      // Don't throw - we want app to continue even if bootstrap fails
    }
  }

  private async ensureThemeSetting(tenantId: number): Promise<void> {
    const existing = await this.prisma.themeSetting.findUnique({
      where: { tenantId }
    });

    if (!existing) {
      await this.prisma.themeSetting.create({
        data: { tenantId }
      });
      this.logger.log(`✨ Created ThemeSetting for tenant ${tenantId}`);
    }
  }

  private async ensureHomeLayout(tenantId: number, language: string): Promise<void> {
    const existing = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'HOME',
          language
        }
      }
    });

    if (!existing) {
      await this.prisma.pageLayout.create({
        data: {
          tenantId,
          key: 'HOME',
          language,
          status: 'published'
        }
      });
      this.logger.log(`✨ Created HOME layout for tenant ${tenantId} language ${language}`);
    }
  }

  private async ensureFooterLayout(tenantId: number, language: string): Promise<void> {
    const existing = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'FOOTER',
          language
        }
      }
    });

    if (!existing) {
      await this.prisma.pageLayout.create({
        data: {
          tenantId,
          key: 'FOOTER',
          language,
          status: 'published'
        }
      });
      this.logger.log(`🦶 Created FOOTER layout for tenant ${tenantId} language ${language}`);
    }
  }

  private async ensureDefaultSections(tenantId: number, language: string): Promise<void> {
    // Get the HOME layout
    const layout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'HOME',
          language
        }
      },
      include: {
        sections: { orderBy: { order: 'asc' } }
      }
    });

    if (!layout) {
      this.logger.warn(`⚠️ HOME layout not found for tenant ${tenantId}, skipping sections`);
      return;
    }

    // Only create sections if none exist
    if (layout.sections.length > 0) {
      this.logger.log(`📋 Sections already exist for tenant ${tenantId}, skipping creation`);
      return;
    }

    const defaultSections = this.getDefaultSectionsData(language);

    // Create sections in transaction
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < defaultSections.length; i++) {
        await tx.pageSection.create({
          data: {
            tenantId,
            layoutId: layout.id,
            type: defaultSections[i].type,
            variant: defaultSections[i].variant,
            order: i + 1,
            isEnabled: true,
            status: 'published',
            propsJson: defaultSections[i].propsJson
          }
        });
      }
    });

    this.logger.log(`✨ Created ${defaultSections.length} default sections for tenant ${tenantId}`);
  }

  private getDefaultSectionsData(language: string) {
    const isEnglish = language === 'en';
    const isArabic = language === 'ar';

    return [
      {
        type: 'hero',
        variant: 'v1',
        propsJson: {
          title: isEnglish
            ? 'Modern Web Solutions for Your Business'
            : isArabic
              ? 'حلول ويب حديثة لأعمالك'
              : 'İşletmeniz İçin Modern Web Çözümleri',
          subtitle: isEnglish
            ? 'We create stunning websites that drive results'
            : isArabic
              ? 'نحن ننشئ مواقع ويب مذهلة تحقق النتائج'
              : 'Sonuç odaklı etkileyici web siteleri oluşturuyoruz',
          buttonText: isEnglish ? 'Get Started' : isArabic ? 'ابدأ الآن' : 'Hemen Başlayın',
          buttonUrl: '/contact',
          backgroundImage: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          textAlign: 'center',
          overlayColor: 'rgba(0,0,0,0.4)'
        }
      },
      {
        type: 'features',
        variant: 'v1',
        propsJson: {
          title: isEnglish
            ? 'Why Choose Us?'
            : isArabic
              ? 'لماذا تختارنا؟'
              : 'Neden Bizi Seçmelisiniz?',
          subtitle: isEnglish
            ? 'We deliver excellence in every project'
            : isArabic
              ? 'نقدم التميز في كل مشروع'
              : 'Her projede mükemmelliği sunuyoruz',
          features: [
            {
              icon: 'zap',
              title: isEnglish ? 'Fast Performance' : isArabic ? 'أداء سريع' : 'Hızlı Performans',
              description: isEnglish
                ? 'Lightning fast websites optimized for speed'
                : isArabic
                  ? 'مواقع ويب سريعة البرق محسنة للسرعة'
                  : 'Hız için optimize edilmiş çok hızlı web siteleri'
            },
            {
              icon: 'shield',
              title: isEnglish ? 'Secure & Reliable' : isArabic ? 'آمن وموثوق' : 'Güvenli ve Güvenilir',
              description: isEnglish
                ? 'Enterprise-grade security and reliability'
                : isArabic
                  ? 'أمان وموثوقية على مستوى المؤسسة'
                  : 'Kurumsal düzeyde güvenlik ve güvenilirlik'
            },
            {
              icon: 'smartphone',
              title: isEnglish ? 'Mobile Ready' : isArabic ? 'جاهز للجوال' : 'Mobil Uyumlu',
              description: isEnglish
                ? 'Perfect experience on all devices'
                : isArabic
                  ? 'تجربة مثالية على جميع الأجهزة'
                  : 'Tüm cihazlarda mükemmel deneyim'
            }
          ]
        }
      },
      {
        type: 'servicesGrid',
        variant: 'v1',
        propsJson: {
          title: isEnglish ? 'Our Services' : isArabic ? 'خدماتنا' : 'Hizmetlerimiz',
          subtitle: isEnglish
            ? 'Comprehensive solutions for your digital needs'
            : isArabic
              ? 'حلول شاملة لاحتياجاتك الرقمية'
              : 'Dijital ihtiyaçlarınız için kapsamlı çözümler',
          displayMode: 'dynamic',
          serviceIds: [], // Will be populated dynamically from existing services
          columns: 3,
          showIcons: true,
          showDescriptions: true
        }
      },
      {
        type: 'contactCta',
        variant: 'v1',
        propsJson: {
          title: isEnglish ? 'Ready to Get Started?' : isArabic ? 'هل أنت مستعد للبدء؟' : 'Başlamaya Hazır mısınız?',
          subtitle: isEnglish
            ? 'Contact us today and lets discuss your project'
            : isArabic
              ? 'اتصل بنا اليوم ولنناقش مشروعك'
              : 'Bugün bizimle iletişime geçin ve projenizi konuşalım',
          primaryButtonText: isEnglish ? 'Contact Us' : isArabic ? 'اتصل بنا' : 'İletişim',
          primaryButtonUrl: '/contact',
          secondaryButtonText: isEnglish ? 'View Portfolio' : isArabic ? 'عرض الأعمال' : 'Portfolio Görüntüle',
          secondaryButtonUrl: '/portfolio',
          backgroundType: 'gradient',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }
    ];
  }

  private async ensureDefaultFooterSections(tenantId: number, language: string): Promise<void> {
    // Get the FOOTER layout
    const layout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'FOOTER',
          language
        }
      },
      include: {
        sections: { orderBy: { order: 'asc' } }
      }
    });

    if (!layout) {
      this.logger.warn(`⚠️ FOOTER layout not found for tenant ${tenantId}, skipping footer sections`);
      return;
    }

    // Only create sections if none exist
    if (layout.sections.length > 0) {
      this.logger.log(`🦶 Footer sections already exist for tenant ${tenantId}, skipping creation`);
      return;
    }

    const defaultFooterSections = this.getDefaultFooterSectionsData(language);

    // Create sections with proper order
    for (let i = 0; i < defaultFooterSections.length; i++) {
      await this.prisma.pageSection.create({
        data: {
          tenantId,
          layoutId: layout.id,
          order: i + 1,
          ...defaultFooterSections[i]
        }
      });
    }

    this.logger.log(`🦶 Created ${defaultFooterSections.length} default footer sections for tenant ${tenantId}`);
  }

  private getDefaultFooterSectionsData(language: string): any[] {
    const isEnglish = language === 'en';
    const isArabic = language === 'ar';

    return [
      {
        type: 'footerContact',
        variant: 'v1',
        propsJson: {
          showCompanyName: true,
          showTagline: true,
          showDescription: false,
          showWorkingHours: false,
          showPrimaryOffice: true,
          showAllOffices: false,
          backgroundColor: '#1F2937',
          textColor: '#FFFFFF'
        }
      },
      {
        type: 'footerNavigation',
        variant: 'v1',
        propsJson: {
          menuKey: 'footer',
          columns: 3,
          showHeadings: true,
          linkColor: '#6B7280',
          headingColor: '#FFFFFF',
          hoverColor: '#3B82F6'
        }
      },
      {
        type: 'footerSocial',
        variant: 'v1',
        propsJson: {
          showIcons: true,
          showLabels: false,
          iconSize: 24,
          iconColor: '#6B7280',
          hoverColor: '#3B82F6',
          alignment: 'center'
        }
      },
      {
        type: 'footerCopyright',
        variant: 'v1',
        propsJson: {
          copyrightText: isEnglish
            ? '© {year} {companyName}. All rights reserved.'
            : isArabic
              ? '© {year} {companyName}. جميع الحقوق محفوظة.'
              : '© {year} {companyName}. Tüm hakları saklıdır.',
          showYear: true,
          showCompanyName: true,
          textAlign: 'center',
          textColor: '#6B7280',
          fontSize: 'sm'
        }
      }
    ];
  }

  /**
   * Bootstrap all active tenants (use with caution)
   * Only runs if BOOTSTRAP_ALL_TENANTS=true
   */
  async bootstrapAllTenants(): Promise<void> {
    if (process.env.BOOTSTRAP_ALL_TENANTS !== 'true') {
      this.logger.log('🔒 BOOTSTRAP_ALL_TENANTS not enabled, skipping mass bootstrap');
      return;
    }

    this.logger.log('🚀 Starting bootstrap for all active tenants...');

    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      select: { id: true, slug: true }
    });

    for (const tenant of tenants) {
      await this.bootstrapTenantDefaults(tenant.id);
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`✅ Bootstrap completed for ${tenants.length} tenants`);
  }
}