import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TemplatesService } from './templates.service';

@Injectable()
export class PageCmsIntegrationService {
  private readonly logger = new Logger(PageCmsIntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private pageLayoutsService: PageLayoutsService,
    private templatesService: TemplatesService
  ) {}

  /**
   * 🎯 INTEGRATED: Create page + initialize CMS layout
   * When a page is created, immediately create corresponding CMS layout
   */
  async createPageWithCmsLayout(tenantId: number, createDto: any): Promise<any> {
    this.logger.log(`[PAGE_CMS_INTEGRATION] 🎯 Creating page with CMS layout: ${createDto.slug}`);

    // 1. Generate layout key for this page
    const layoutKey = this.generateLayoutKey(createDto.pageType, createDto.slug);

    // 2. Create dynamic page directly with Prisma
    const page = await this.prisma.dynamicPage.create({
      data: {
        tenantId,
        slug: createDto.slug,
        title: createDto.title,
        layoutKey,
        pageType: createDto.pageType,
        seo: createDto.seo as any || {},
        published: createDto.published ?? false,
        publishedAt: createDto.published ? new Date() : null,
        language: createDto.language || 'tr'
      }
    });

    this.logger.log(`[PAGE_CMS_INTEGRATION] Page created with layoutKey: ${page.layoutKey}`);

    try {
      // 3. Initialize CMS layout with template-based sections
      await this.initializeCmsLayoutForPage(tenantId, page.layoutKey, createDto.pageType, createDto.language || 'tr');

      this.logger.log(`[PAGE_CMS_INTEGRATION] ✅ CMS layout initialized for page: ${page.layoutKey}`);
    } catch (error) {
      this.logger.error(`[PAGE_CMS_INTEGRATION] Failed to initialize CMS layout: ${error.message}`);
      // Don't fail page creation if CMS layout init fails
    }

    return page;
  }

  /**
   * Initialize CMS layout for a page based on template and page type
   */
  private async initializeCmsLayoutForPage(
    tenantId: number,
    layoutKey: string,
    pageType: string,
    language: string
  ): Promise<void> {
    this.logger.log(`[PAGE_CMS_INTEGRATION] Initializing CMS layout: ${layoutKey} (type: ${pageType})`);

    // Get tenant's template configuration directly from database
    const siteConfig = await this.prisma.tenantSiteConfig.findUnique({
      where: { tenantId },
      select: { templateKey: true }
    });

    if (!siteConfig || !siteConfig.templateKey) {
      this.logger.warn(`[PAGE_CMS_INTEGRATION] No site config or template found for tenant ${tenantId}, using basic layout`);
      await this.initializeBasicLayout(tenantId, layoutKey, language);
      return;
    }

    // Get template default layout
    const template = await this.templatesService.findByKey(siteConfig.templateKey);
    const defaultLayout = template.defaultLayout;

    if (!defaultLayout || !defaultLayout.sections) {
      this.logger.warn(`[PAGE_CMS_INTEGRATION] No default layout in template ${template.key}, using basic layout`);
      await this.initializeBasicLayout(tenantId, layoutKey, language);
      return;
    }

    // Filter sections by page type
    const sectionsForPageType = this.getSectionsForPageType(pageType, defaultLayout.sections);

    if (sectionsForPageType.length === 0) {
      this.logger.warn(`[PAGE_CMS_INTEGRATION] No sections for page type ${pageType}, using hero only`);
      await this.initializeBasicLayout(tenantId, layoutKey, language);
      return;
    }

    // Create layout with filtered sections (validation removed to avoid circular dependency)
    await this.pageLayoutsService.updateLayoutWithSections(
      tenantId,
      layoutKey,
      language,
      { sections: sectionsForPageType }
    );

    this.logger.log(`[PAGE_CMS_INTEGRATION] ✅ Initialized ${sectionsForPageType.length} sections for ${layoutKey}`);
  }

  /**
   * Get appropriate sections for page type
   */
  private getSectionsForPageType(pageType: string, templateSections: any[]): any[] {
    this.logger.log(`[PAGE_CMS_INTEGRATION] Filtering sections for page type: ${pageType}`);

    switch (pageType.toUpperCase()) {
      case 'HOME':
        // Home gets all template sections
        return templateSections.map((section, index) => ({
          ...section,
          order: index + 1
        }));

      case 'SERVICES':
        // Services page: hero + services + contact
        return templateSections
          .filter(section => ['hero', 'services', 'contact'].includes(section.type))
          .map((section, index) => ({
            ...section,
            order: index + 1,
            propsJson: this.adaptSectionForPageType(section, 'SERVICES')
          }));

      case 'CONTACT':
        // Contact page: hero + contact
        return templateSections
          .filter(section => ['hero', 'contact'].includes(section.type))
          .map((section, index) => ({
            ...section,
            order: index + 1,
            propsJson: this.adaptSectionForPageType(section, 'CONTACT')
          }));

      case 'ABOUT':
        // About page: hero + testimonials
        return templateSections
          .filter(section => ['hero', 'testimonials'].includes(section.type))
          .map((section, index) => ({
            ...section,
            order: index + 1,
            propsJson: this.adaptSectionForPageType(section, 'ABOUT')
          }));

      case 'CUSTOM':
      default:
        // Custom pages start with hero only
        const heroSection = templateSections.find(section => section.type === 'hero');
        if (!heroSection) {
          return [];
        }
        return [{
          ...heroSection,
          order: 1,
          propsJson: this.adaptSectionForPageType(heroSection, 'CUSTOM')
        }];
    }
  }

  /**
   * Adapt section content for specific page type
   */
  private adaptSectionForPageType(section: any, pageType: string): any {
    const originalProps = section.propsJson || {};

    switch (pageType) {
      case 'SERVICES':
        if (section.type === 'hero') {
          return {
            ...originalProps,
            title: 'Hizmetlerimiz',
            subtitle: 'Profesyonel çözümlerimizi keşfedin'
          };
        }
        break;

      case 'CONTACT':
        if (section.type === 'hero') {
          return {
            ...originalProps,
            title: 'İletişim',
            subtitle: 'Bizimle iletişime geçin'
          };
        }
        break;

      case 'ABOUT':
        if (section.type === 'hero') {
          return {
            ...originalProps,
            title: 'Hakkımızda',
            subtitle: 'Hikayemizi öğrenin'
          };
        }
        break;

      case 'CUSTOM':
        if (section.type === 'hero') {
          return {
            ...originalProps,
            title: 'Yeni Sayfa',
            subtitle: 'İçerik ekleyin'
          };
        }
        break;
    }

    return originalProps;
  }

  /**
   * Initialize basic layout (fallback)
   */
  private async initializeBasicLayout(tenantId: number, layoutKey: string, language: string): Promise<void> {
    const basicHero = {
      type: 'hero',
      variant: 'default',
      order: 1,
      enabled: true,
      propsJson: {
        title: 'Yeni Sayfa',
        subtitle: 'Bu sayfaya içerik ekleyin'
      }
    };

    await this.pageLayoutsService.updateLayoutWithSections(
      tenantId,
      layoutKey,
      language,
      { sections: [basicHero] }
    );

    this.logger.log(`[PAGE_CMS_INTEGRATION] ✅ Initialized basic hero layout for ${layoutKey}`);
  }

  /**
   * Generate layout key for page
   */
  private generateLayoutKey(pageType: string, slug: string): string {
    switch (pageType.toUpperCase()) {
      case 'HOME':
        return 'HOME';
      case 'SERVICES':
        return 'SERVICES';
      case 'CONTACT':
        return 'CONTACT';
      case 'ABOUT':
        return 'ABOUT';
      case 'CUSTOM':
        // Generate unique key for custom pages
        return `CUSTOM_${slug.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
      default:
        return `PAGE_${slug.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
    }
  }

  /**
   * 🔄 SYNC: Ensure page-layout consistency
   * Called when checking if page and its CMS layout are in sync
   */
  async ensurePageLayoutSync(tenantId: number, pageId: string): Promise<any> {
    this.logger.log(`[PAGE_CMS_INTEGRATION] 🔄 Checking page-layout sync: ${pageId}`);

    // Get page details using Prisma
    const page = await this.prisma.dynamicPage.findUnique({
      where: { id: pageId }
    });

    if (!page || page.tenantId !== tenantId) {
      throw new NotFoundException('Page not found or access denied');
    }

    try {
      // Try to get existing layout
      const layout = await this.pageLayoutsService.getOrCreateLayout(tenantId, page.layoutKey, page.language);

      const syncStatus = {
        pageId: page.id,
        slug: page.slug,
        layoutKey: page.layoutKey,
        hasLayout: true,
        sectionsCount: layout.sections.length,
        isPublished: page.published,
        lastSync: new Date().toISOString()
      };

      this.logger.log(`[PAGE_CMS_INTEGRATION] ✅ Page-layout sync OK: ${page.layoutKey} (${layout.sections.length} sections)`);
      return syncStatus;

    } catch (error) {
      this.logger.error(`[PAGE_CMS_INTEGRATION] ❌ Page-layout sync FAILED: ${error.message}`);

      // Try to auto-fix by recreating layout
      try {
        await this.initializeCmsLayoutForPage(tenantId, page.layoutKey, page.pageType, page.language);

        return {
          pageId: page.id,
          slug: page.slug,
          layoutKey: page.layoutKey,
          hasLayout: true,
          sectionsCount: 1, // Basic layout
          isPublished: page.published,
          wasAutoFixed: true,
          lastSync: new Date().toISOString()
        };
      } catch (fixError) {
        this.logger.error(`[PAGE_CMS_INTEGRATION] ❌ Auto-fix failed: ${fixError.message}`);

        return {
          pageId: page.id,
          slug: page.slug,
          layoutKey: page.layoutKey,
          hasLayout: false,
          error: error.message,
          autoFixFailed: fixError.message,
          needsManualFix: true
        };
      }
    }
  }

  /**
   * Get integration status for all pages
   */
  async getIntegrationStatus(tenantId: number, language: string = 'tr'): Promise<any> {
    this.logger.log(`[PAGE_CMS_INTEGRATION] Getting integration status for tenant ${tenantId}`);

    const pages = await this.prisma.dynamicPage.findMany({
      where: {
        tenantId,
        language
      },
      orderBy: [
        { pageType: 'asc' },
        { slug: 'asc' }
      ]
    });

    const statusPromises = pages.map(page =>
      this.ensurePageLayoutSync(tenantId, page.id).catch(error => ({
        pageId: page.id,
        slug: page.slug,
        error: error.message
      }))
    );

    const statuses = await Promise.all(statusPromises);

    const summary = {
      tenantId,
      language,
      totalPages: pages.length,
      pagesWithLayouts: statuses.filter(s => s.hasLayout).length,
      pagesWithErrors: statuses.filter(s => s.error).length,
      pagesAutoFixed: statuses.filter(s => s.wasAutoFixed).length,
      pagesNeedingFix: statuses.filter(s => s.needsManualFix).length,
      pages: statuses,
      lastCheck: new Date().toISOString()
    };

    this.logger.log(`[PAGE_CMS_INTEGRATION] ✅ Status: ${summary.totalPages} pages, ` +
      `${summary.pagesWithLayouts} with layouts, ${summary.pagesWithErrors} errors`);

    return summary;
  }
}