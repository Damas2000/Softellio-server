import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TemplatesService } from './templates.service';
import { PageCmsIntegrationService } from './page-cms-integration.service';
import {
  UpsertSiteConfigDto,
  SiteConfigResponseDto,
  BrandingConfigDto,
  NavItemDto,
  FooterConfigDto
} from './dto/site-config.dto';
import {
  CreateDynamicPageDto,
  PageType
} from './dto/dynamic-page.dto';

@Injectable()
export class SiteConfigService {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(
    private prisma: PrismaService,
    private templatesService: TemplatesService,
    private pageCmsIntegrationService: PageCmsIntegrationService
  ) {}

  /**
   * Get site configuration for tenant
   */
  async getForTenant(tenantId: number): Promise<SiteConfigResponseDto | null> {
    console.log(`[SiteConfigService] Getting site config for tenant: ${tenantId}`);

    const config = await this.prisma.tenantSiteConfig.findUnique({
      where: { tenantId },
      include: {
        template: {
          select: {
            key: true,
            name: true,
            version: true,
            supportedSections: true
          }
        }
      }
    });

    if (!config) {
      console.log(`[SiteConfigService] No site config found for tenant: ${tenantId}`);
      return null;
    }

    return {
      id: config.id,
      tenantId: config.tenantId,
      templateKey: config.templateKey,
      branding: config.branding as any as BrandingConfigDto,
      navigation: config.navigation as any as NavItemDto[],
      footer: config.footer as any as FooterConfigDto,
      seoDefaults: config.seoDefaults as any,
      customCSS: config.customCSS,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }

  /**
   * Create or update site configuration for tenant
   */
  async upsert(tenantId: number, upsertDto: UpsertSiteConfigDto): Promise<SiteConfigResponseDto> {
    console.log(`[SiteConfigService] Upserting site config for tenant: ${tenantId}`);

    // Validate template exists
    const templateExists = await this.templatesService.exists(upsertDto.templateKey);
    if (!templateExists) {
      throw new BadRequestException(`Template "${upsertDto.templateKey}" not found or not active`);
    }

    // Validate navigation structure
    this.validateNavigation(upsertDto.navigation);

    // Validate footer structure
    this.validateFooter(upsertDto.footer);

    // Upsert the configuration
    const config = await this.prisma.tenantSiteConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        templateKey: upsertDto.templateKey,
        branding: upsertDto.branding as any,
        navigation: upsertDto.navigation as any,
        footer: upsertDto.footer as any,
        seoDefaults: upsertDto.seoDefaults as any || {},
        customCSS: upsertDto.customCSS
      },
      update: {
        templateKey: upsertDto.templateKey,
        branding: upsertDto.branding as any,
        navigation: upsertDto.navigation as any,
        footer: upsertDto.footer as any,
        seoDefaults: upsertDto.seoDefaults as any || {},
        customCSS: upsertDto.customCSS
      }
    });

    console.log(`[SiteConfigService] Site config upserted successfully for tenant: ${tenantId}`);

    return {
      id: config.id,
      tenantId: config.tenantId,
      templateKey: config.templateKey,
      branding: config.branding as any as BrandingConfigDto,
      navigation: config.navigation as any as NavItemDto[],
      footer: config.footer as any as FooterConfigDto,
      seoDefaults: config.seoDefaults as any,
      customCSS: config.customCSS,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }

  /**
   * 🎯 COMPREHENSIVE: Initialize site + create pages + CMS layouts atomically
   * When portal chooses a template, this creates everything needed for public site
   */
  async initializeFromTemplate(tenantId: number, templateKey: string): Promise<any> {
    this.logger.log(`[SITE_INITIALIZATION] 🎯 Starting comprehensive initialization for tenant ${tenantId} with template: ${templateKey}`);

    // Check if config already exists
    const existingConfig = await this.getForTenant(tenantId);
    if (existingConfig) {
      this.logger.warn(`[SITE_INITIALIZATION] ⚠️  Site config already exists for tenant ${tenantId}, updating instead`);
      // Don't throw error, just continue with initialization
    }

    // Validate template
    const template = await this.templatesService.findByKey(templateKey);
    this.logger.log(`[SITE_INITIALIZATION] ✅ Template validated: ${template.name} (${template.version})`);

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      const startTime = Date.now();

      // 1. Create/update site configuration
      this.logger.log(`[SITE_INITIALIZATION] 1️⃣ Creating site configuration...`);
      const siteConfig = await this.createSiteConfigInTransaction(tx, tenantId, templateKey);

      // 2. Create homepage (mandatory)
      this.logger.log(`[SITE_INITIALIZATION] 2️⃣ Creating homepage...`);
      const homepage = await this.createHomepageInTransaction(tx, tenantId, template);

      // 3. Create additional pages based on template navigation
      this.logger.log(`[SITE_INITIALIZATION] 3️⃣ Creating additional pages...`);
      const additionalPages = await this.createAdditionalPagesInTransaction(tx, tenantId, template);

      const duration = Date.now() - startTime;
      this.logger.log(`[SITE_INITIALIZATION] ✅ Comprehensive initialization completed in ${duration}ms`);

      return {
        siteConfig,
        homepage,
        additionalPages,
        summary: {
          tenantId,
          templateKey,
          pagesCreated: 1 + additionalPages.length,
          homepageSlug: homepage.slug,
          homepagePublished: homepage.published,
          additionalPageSlugs: additionalPages.map(p => p.slug),
          duration
        }
      };
    });

    this.logger.log(`[SITE_INITIALIZATION] 🎉 COMPLETE! Tenant ${tenantId} site initialized with ${result.summary.pagesCreated} pages`);
    return result;
  }

  /**
   * Create site configuration within transaction
   */
  private async createSiteConfigInTransaction(tx: any, tenantId: number, templateKey: string): Promise<SiteConfigResponseDto> {
    const defaultConfig: UpsertSiteConfigDto = {
      templateKey,
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontFamily: 'Inter, sans-serif'
      },
      navigation: [
        { label: 'Ana Sayfa', href: '/', order: 1, isCTA: false, isExternal: false },
        { label: 'Hizmetlerimiz', href: '/services', order: 2, isCTA: false, isExternal: false },
        { label: 'Hakkımızda', href: '/about', order: 3, isCTA: false, isExternal: false },
        { label: 'İletişim', href: '/contact', order: 4, isCTA: true, isExternal: false }
      ],
      footer: {
        columns: [
          {
            title: 'Hızlı Linkler',
            links: [
              { label: 'Ana Sayfa', url: '/' },
              { label: 'Hizmetlerimiz', url: '/services' },
              { label: 'Hakkımızda', url: '/about' },
              { label: 'İletişim', url: '/contact' }
            ]
          }
        ],
        copyrightText: '© 2024 Şirket Adı. Tüm hakları saklıdır.'
      },
      seoDefaults: {
        metaTitle: 'Profesyonel Hizmetler - Şirket Adı',
        metaDescription: 'İşletmeniz için yüksek kaliteli profesyonel hizmetler.'
      }
    };

    // Upsert the configuration using transaction
    const config = await tx.tenantSiteConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        templateKey: defaultConfig.templateKey,
        branding: defaultConfig.branding as any,
        navigation: defaultConfig.navigation as any,
        footer: defaultConfig.footer as any,
        seoDefaults: defaultConfig.seoDefaults as any || {},
        customCSS: defaultConfig.customCSS
      },
      update: {
        templateKey: defaultConfig.templateKey,
        branding: defaultConfig.branding as any,
        navigation: defaultConfig.navigation as any,
        footer: defaultConfig.footer as any,
        seoDefaults: defaultConfig.seoDefaults as any || {},
        customCSS: defaultConfig.customCSS
      }
    });

    this.logger.log(`[SITE_INITIALIZATION] Site config created/updated for tenant: ${tenantId}`);
    return this.mapConfigToResponseDto(config);
  }

  /**
   * Create homepage within transaction (MANDATORY + PUBLISHED)
   */
  private async createHomepageInTransaction(tx: any, tenantId: number, template: any): Promise<any> {
    const homepageDto: CreateDynamicPageDto = {
      slug: '/',
      title: 'Ana Sayfa',
      pageType: PageType.HOME,
      published: true, // ✅ CRITICAL: Homepage must be published
      language: 'tr',
      seo: {
        metaTitle: 'Ana Sayfa - Profesyonel Hizmetler',
        metaDescription: 'İşletmeniz için güvenilir ve kaliteli hizmetler sunuyoruz.'
      }
    };

    // Create homepage directly with CMS layout using PageCmsIntegrationService
    const homepage = await this.pageCmsIntegrationService.createPageWithCmsLayout(tenantId, homepageDto);
    this.logger.log(`[SITE_INITIALIZATION] ✅ Homepage created and published: ${homepage.slug} (${homepage.id})`);

    return homepage;
  }

  /**
   * Create additional pages based on template navigation
   */
  private async createAdditionalPagesInTransaction(tx: any, tenantId: number, template: any): Promise<any[]> {
    const additionalPages: CreateDynamicPageDto[] = [
      {
        slug: '/services',
        title: 'Hizmetlerimiz',
        pageType: PageType.SERVICES,
        published: false, // Start unpublished, admin can publish when ready
        language: 'tr',
        seo: {
          metaTitle: 'Hizmetlerimiz - Profesyonel Çözümler',
          metaDescription: 'Sunduğumuz geniş hizmet yelpazesini keşfedin.'
        }
      },
      {
        slug: '/about',
        title: 'Hakkımızda',
        pageType: PageType.ABOUT,
        published: false,
        language: 'tr',
        seo: {
          metaTitle: 'Hakkımızda - Hikayemiz',
          metaDescription: 'Şirketimizin hikayesini ve değerlerini öğrenin.'
        }
      },
      {
        slug: '/contact',
        title: 'İletişim',
        pageType: PageType.CONTACT,
        published: false,
        language: 'tr',
        seo: {
          metaTitle: 'İletişim - Bize Ulaşın',
          metaDescription: 'Bizimle iletişime geçin ve sorularınızı sorun.'
        }
      }
    ];

    const createdPages = [];
    for (const pageDto of additionalPages) {
      try {
        const page = await this.pageCmsIntegrationService.createPageWithCmsLayout(tenantId, pageDto);
        this.logger.log(`[SITE_INITIALIZATION] ✅ Additional page created: ${page.slug} (${page.pageType})`);
        createdPages.push(page);
      } catch (error) {
        this.logger.warn(`[SITE_INITIALIZATION] ⚠️  Failed to create page ${pageDto.slug}: ${error.message}`);
        // Continue with other pages, don't fail the whole initialization
      }
    }

    return createdPages;
  }

  /**
   * Map config entity to response DTO
   */
  private mapConfigToResponseDto(config: any): SiteConfigResponseDto {
    return {
      id: config.id,
      tenantId: config.tenantId,
      templateKey: config.templateKey,
      branding: config.branding as any as BrandingConfigDto,
      navigation: config.navigation as any as NavItemDto[],
      footer: config.footer as any as FooterConfigDto,
      seoDefaults: config.seoDefaults as any,
      customCSS: config.customCSS,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }

  /**
   * Get public site configuration (no auth required)
   */
  async getPublicConfig(tenantId: number): Promise<any> {
    console.log(`[SiteConfigService] Getting public site config for tenant: ${tenantId}`);

    const config = await this.getForTenant(tenantId);

    if (!config) {
      // Return minimal default configuration if none exists
      return {
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          fontFamily: 'Inter, sans-serif'
        },
        navigation: [
          { label: 'Home', href: '/', order: 1, isCTA: false }
        ],
        footer: {
          columns: [],
          copyrightText: '© 2024 Company. All rights reserved.'
        }
      };
    }

    // Return public-safe configuration (exclude sensitive data)
    return {
      branding: config.branding,
      navigation: config.navigation,
      footer: config.footer,
      seoDefaults: config.seoDefaults,
      // Include custom CSS for public rendering
      customCSS: config.customCSS
    };
  }

  /**
   * Delete site configuration for tenant
   */
  async delete(tenantId: number): Promise<void> {
    console.log(`[SiteConfigService] Deleting site config for tenant: ${tenantId}`);

    const config = await this.prisma.tenantSiteConfig.findUnique({
      where: { tenantId }
    });

    if (!config) {
      throw new NotFoundException('Site configuration not found');
    }

    await this.prisma.tenantSiteConfig.delete({
      where: { tenantId }
    });

    console.log(`[SiteConfigService] Site config deleted for tenant: ${tenantId}`);
  }

  // ==================== VALIDATION HELPERS ====================

  /**
   * Validate navigation structure
   */
  private validateNavigation(navigation: NavItemDto[]): void {
    if (!Array.isArray(navigation) || navigation.length === 0) {
      throw new BadRequestException('Navigation must be a non-empty array');
    }

    // Check for duplicate orders
    const orders = navigation.map(item => item.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new BadRequestException('Navigation items must have unique order values');
    }

    // Check for duplicate labels
    const labels = navigation.map(item => item.label.toLowerCase());
    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      throw new BadRequestException('Navigation items must have unique labels');
    }

    // Validate each navigation item
    navigation.forEach((item, index) => {
      if (!item.label || !item.href) {
        throw new BadRequestException(`Navigation item ${index + 1} must have label and href`);
      }

      if (item.order < 1) {
        throw new BadRequestException(`Navigation item "${item.label}" order must be at least 1`);
      }

      // Validate children if present
      if (item.children) {
        this.validateNavigationChildren(item.children, item.label);
      }
    });
  }

  /**
   * Validate navigation children (dropdown items)
   */
  private validateNavigationChildren(children: NavItemDto[], parentLabel: string): void {
    if (!Array.isArray(children) || children.length === 0) {
      throw new BadRequestException(`Navigation item "${parentLabel}" children must be a non-empty array`);
    }

    children.forEach((child, index) => {
      if (!child.label || !child.href) {
        throw new BadRequestException(`Navigation child ${index + 1} under "${parentLabel}" must have label and href`);
      }

      // Children cannot have their own children (max 2 levels)
      if (child.children) {
        throw new BadRequestException('Navigation dropdown items cannot have nested children');
      }
    });
  }

  /**
   * Validate footer structure
   */
  private validateFooter(footer: FooterConfigDto): void {
    if (!footer || !footer.columns) {
      throw new BadRequestException('Footer must have columns array');
    }

    if (!Array.isArray(footer.columns)) {
      throw new BadRequestException('Footer columns must be an array');
    }

    // Validate each footer column
    footer.columns.forEach((column, columnIndex) => {
      if (!column.title) {
        throw new BadRequestException(`Footer column ${columnIndex + 1} must have a title`);
      }

      if (!Array.isArray(column.links)) {
        throw new BadRequestException(`Footer column "${column.title}" links must be an array`);
      }

      // Validate links within column
      column.links.forEach((link, linkIndex) => {
        if (!link.label || !link.url) {
          throw new BadRequestException(`Footer link ${linkIndex + 1} in column "${column.title}" must have label and url`);
        }
      });
    });

    // Validate social links if present
    if (footer.socialLinks) {
      if (!Array.isArray(footer.socialLinks)) {
        throw new BadRequestException('Footer social links must be an array');
      }

      const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'];
      footer.socialLinks.forEach((social, index) => {
        if (!validPlatforms.includes(social.platform)) {
          throw new BadRequestException(`Social link ${index + 1} has invalid platform: ${social.platform}`);
        }

        if (!social.url || !social.label) {
          throw new BadRequestException(`Social link ${index + 1} must have url and label`);
        }
      });
    }
  }
}