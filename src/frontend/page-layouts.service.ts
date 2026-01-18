import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreatePageSectionDto, UpdatePageSectionDto, UpsertPageLayoutDto, ReorderSectionItemDto, UpdatePageLayoutDto, CmsSectionDto } from './dto/page-section.dto';
import { CreatePageLayoutDto } from './dto/page-specific.dto';
import { SectionTypesService } from './section-types.service';
import { SectionConfigUtil } from '../templates/utils/section-config.util';

@Injectable()
export class PageLayoutsService {
  constructor(
    private prisma: PrismaService,
    private sectionTypesService: SectionTypesService
  ) {}

  /**
   * Get or create page layout by key and language
   */
  async getOrCreateLayout(tenantId: number, key: string, language?: string) {
    // Get tenant's default language if not specified
    if (!language) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { defaultLanguage: true }
      });
      language = tenant?.defaultLanguage || 'tr';
    }

    let layout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key,
          language
        }
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          where: { status: 'published' }
        }
      }
    });

    if (!layout) {
      // Create new layout if missing
      layout = await this.prisma.pageLayout.create({
        data: {
          tenantId,
          key,
          language,
          status: 'published'
        },
        include: {
          sections: { orderBy: { order: 'asc' } }
        }
      });
    }

    return layout;
  }

  /**
   * Upsert page layout
   */
  async upsertLayout(tenantId: number, key: string, language: string, updateDto: UpsertPageLayoutDto) {
    const layout = await this.prisma.pageLayout.upsert({
      where: {
        tenantId_key_language: {
          tenantId,
          key,
          language
        }
      },
      update: updateDto,
      create: {
        tenantId,
        key,
        language,
        status: updateDto.status || 'published'
      },
      include: {
        sections: { orderBy: { order: 'asc' } }
      }
    });

    return layout;
  }

  /**
   * Update page layout with sections (replaces all sections)
   */
  async updateLayoutWithSections(tenantId: number, key: string, language: string, updateDto: UpdatePageLayoutDto) {
    console.log(`[PageLayoutsService] updateLayoutWithSections START: tenantId=${tenantId}, key=${key}, language=${language}, sectionsCount=${updateDto.sections?.length || 0}`);

    // First, ensure layout exists
    const layout = await this.getOrCreateLayout(tenantId, key, language);

    // Update layout metadata if provided
    if (updateDto.status) {
      await this.prisma.pageLayout.update({
        where: { id: layout.id },
        data: { status: updateDto.status }
      });
    }

    // If sections are provided, replace all sections atomically
    if (updateDto.sections && updateDto.sections.length > 0) {
      console.log(`[PageLayoutsService] Replacing sections for layoutId=${layout.id}`);

      // CRITICAL: Use transaction to prevent race conditions
      await this.prisma.$transaction(async (tx) => {
        // Delete existing sections
        const deleteResult = await tx.pageSection.deleteMany({
          where: {
            layoutId: layout.id
          }
        });
        console.log(`[PageLayoutsService] Deleted ${deleteResult.count} existing sections`);

        // Create new sections
        const sectionsToCreate = updateDto.sections.map((section, index) => ({
          tenantId: tenantId,
          layoutId: layout.id,
          type: section.type,
          variant: section.variant || 'default',
          order: section.order || index + 1,
          isEnabled: section.enabled !== false,
          status: 'published',
          propsJson: section.propsJson || {}
        }));

        const createResult = await tx.pageSection.createMany({
          data: sectionsToCreate
        });
        console.log(`[PageLayoutsService] Created ${createResult.count} new sections`);
      });
    }

    // Return updated layout with sections
    const updatedLayout = await this.getOrCreateLayout(tenantId, key, language);
    console.log(`[PageLayoutsService] updateLayoutWithSections COMPLETE: sectionsCount=${updatedLayout.sections.length}`);

    return updatedLayout;
  }

  /**
   * Create a new section
   */
  async createSection(tenantId: number, createDto: CreatePageSectionDto) {
    // Validate section type and variant
    const validatedTypeVariant = this.sectionTypesService.validateTypeAndVariant(
      createDto.type,
      createDto.variant
    );

    // Validate props against schema
    this.sectionTypesService.validatePropsStrict(
      validatedTypeVariant.type,
      validatedTypeVariant.variant,
      createDto.propsJson
    );

    // Merge props with defaults
    const mergedProps = this.sectionTypesService.mergeWithDefaults(
      validatedTypeVariant.type,
      validatedTypeVariant.variant,
      createDto.propsJson
    );

    // Validate layout exists and belongs to tenant
    const layout = await this.prisma.pageLayout.findUnique({
      where: { id: createDto.layoutId },
      include: { sections: { select: { order: true } } }
    });

    if (!layout || layout.tenantId !== tenantId) {
      throw new NotFoundException('Layout not found or access denied');
    }

    // Determine order if not provided
    let order = createDto.order;
    if (!order) {
      const maxOrder = Math.max(...layout.sections.map(s => s.order), 0);
      order = maxOrder + 1;
    } else {
      // Check if order is already taken
      const existingSection = layout.sections.find(s => s.order === order);
      if (existingSection) {
        throw new ConflictException(`Order ${order} is already taken`);
      }
    }

    const section = await this.prisma.pageSection.create({
      data: {
        tenantId,
        layoutId: createDto.layoutId,
        type: validatedTypeVariant.type,
        variant: validatedTypeVariant.variant,
        order,
        isEnabled: createDto.isEnabled ?? true,
        status: createDto.status || 'published',
        propsJson: mergedProps
      }
    });

    return section;
  }

  /**
   * Update existing section
   */
  async updateSection(tenantId: number, sectionId: number, updateDto: UpdatePageSectionDto) {
    // Verify section exists and belongs to tenant
    const existing = await this.prisma.pageSection.findUnique({
      where: { id: sectionId }
    });

    if (!existing || existing.tenantId !== tenantId) {
      throw new NotFoundException('Section not found or access denied');
    }

    // Determine type and variant for validation
    const type = updateDto.type || existing.type;
    const variant = updateDto.variant || existing.variant;

    // If type or variant changed, validate them
    if (updateDto.type || updateDto.variant) {
      this.sectionTypesService.validateTypeAndVariant(type, variant);
    }

    // If props are being updated, validate them
    let mergedProps = existing.propsJson as any || {};
    if (updateDto.propsJson) {
      this.sectionTypesService.validatePropsStrict(type, variant, updateDto.propsJson);

      // Merge with existing props (not defaults, to preserve existing data)
      const existingProps = (existing.propsJson as any) || {};
      mergedProps = { ...existingProps, ...updateDto.propsJson };
    }

    const updated = await this.prisma.pageSection.update({
      where: { id: sectionId },
      data: {
        ...updateDto,
        propsJson: mergedProps
      }
    });

    return updated;
  }

  /**
   * Delete section
   */
  async deleteSection(tenantId: number, sectionId: number) {
    // Verify section exists and belongs to tenant
    const existing = await this.prisma.pageSection.findUnique({
      where: { id: sectionId }
    });

    if (!existing || existing.tenantId !== tenantId) {
      throw new NotFoundException('Section not found or access denied');
    }

    await this.prisma.pageSection.delete({
      where: { id: sectionId }
    });

    return { success: true, message: 'Section deleted successfully' };
  }

  /**
   * Toggle section enable/disable
   */
  async toggleSection(tenantId: number, sectionId: number, isEnabled: boolean) {
    // Verify section exists and belongs to tenant
    const existing = await this.prisma.pageSection.findUnique({
      where: { id: sectionId }
    });

    if (!existing || existing.tenantId !== tenantId) {
      throw new NotFoundException('Section not found or access denied');
    }

    const updated = await this.prisma.pageSection.update({
      where: { id: sectionId },
      data: { isEnabled }
    });

    return updated;
  }

  /**
   * Reorder sections within a layout
   */
  async reorderSections(tenantId: number, layoutId: number, items: ReorderSectionItemDto[]) {
    // Validate layout belongs to tenant
    const layout = await this.prisma.pageLayout.findUnique({
      where: { id: layoutId },
      include: { sections: true }
    });

    if (!layout || layout.tenantId !== tenantId) {
      throw new NotFoundException('Layout not found or access denied');
    }

    // Validate all section IDs belong to this layout
    const sectionIds = items.map(item => item.id);
    const sectionsInLayout = layout.sections.filter(section =>
      sectionIds.includes(section.id)
    );

    if (sectionsInLayout.length !== items.length) {
      throw new BadRequestException('Some sections do not belong to this layout');
    }

    // Validate orders are sequential and start from 1
    const orders = items.map(item => item.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new BadRequestException('Orders must be sequential starting from 1');
      }
    }

    // Update orders in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const updates = [];

      for (const item of items) {
        const updated = await tx.pageSection.update({
          where: { id: item.id },
          data: { order: item.order }
        });
        updates.push(updated);
      }

      return updates;
    });

    return {
      success: true,
      message: `Reordered ${items.length} sections`,
      sections: result
    };
  }

  /**
   * Get public layout with sections (no auth required)
   */
  async getPublicLayout(tenantId: number, key: string, language?: string) {
    console.log(`[PageLayoutsService] getPublicLayout called: tenantId=${tenantId}, key=${key}, language=${language}`);

    if (!language) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { defaultLanguage: true }
      });
      language = tenant?.defaultLanguage || 'tr';
    }

    console.log(`[PageLayoutsService] Querying PageLayout: tenantId=${tenantId}, key=${key}, language=${language}`);

    const layout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key,
          language
        }
      },
      include: {
        sections: {
          where: {
            isEnabled: true,
            status: 'published'
          },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            variant: true,
            order: true,
            propsJson: true
          }
        }
      }
    });

    console.log(`[PageLayoutsService] Query result: found=${!!layout}, sectionsCount=${layout?.sections?.length || 0}`);

    if (!layout) {
      console.log(`[PageLayoutsService] No layout found, returning empty structure`);
      // Return empty layout structure if not found
      return {
        key,
        language,
        sections: []
      };
    }

    // Ensure sections have explicit variants for public consumption
    const sectionsWithExplicitVariants = await this.ensureExplicitVariants(tenantId, layout.sections);

    return {
      key: layout.key,
      language: layout.language,
      sections: sectionsWithExplicitVariants
    };
  }

  /**
   * Get section by ID with tenant validation
   */
  async getSection(tenantId: number, sectionId: number) {
    const section = await this.prisma.pageSection.findUnique({
      where: { id: sectionId },
      include: {
        layout: { select: { key: true, language: true } }
      }
    });

    if (!section || section.tenantId !== tenantId) {
      throw new NotFoundException('Section not found or access denied');
    }

    return section;
  }

  /**
   * Create page-specific layout (PAGE:slug)
   */
  async createPageLayout(tenantId: number, createDto: CreatePageLayoutDto) {
    // Get tenant's default language if not specified
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { defaultLanguage: true }
    });

    const language = createDto.language || tenant?.defaultLanguage || 'tr';
    const layoutKey = `PAGE:${createDto.pageSlug}`;

    // Check if layout already exists
    const existing = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: layoutKey,
          language
        }
      }
    });

    if (existing) {
      throw new ConflictException(`Layout ${layoutKey} already exists for language ${language}`);
    }

    // Validate that the page slug exists (optional strict mode)
    const pageExists = await this.prisma.page.findFirst({
      where: {
        tenantId,
        translations: {
          some: {
            language,
            slug: createDto.pageSlug
          }
        }
      }
    });

    // Create the layout
    const layout = await this.prisma.pageLayout.create({
      data: {
        tenantId,
        key: layoutKey,
        language,
        status: createDto.status || 'published'
      },
      include: {
        sections: { orderBy: { order: 'asc' } }
      }
    });

    // Copy sections from HOME layout if requested
    if (createDto.copyFromHome) {
      await this.copySectionsFromHome(tenantId, layout.id, language);
    }

    return layout;
  }

  /**
   * Copy sections from HOME layout to new layout
   */
  private async copySectionsFromHome(tenantId: number, targetLayoutId: number, language: string) {
    const homeLayout = await this.prisma.pageLayout.findFirst({
      where: {
        tenantId,
        key: 'HOME',
        language
      },
      include: {
        sections: {
          where: { status: 'published' },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!homeLayout || homeLayout.sections.length === 0) {
      return; // No HOME layout or sections to copy
    }

    // Copy sections with adjusted order
    const sectionsToCreate = homeLayout.sections.map((section, index) => ({
      tenantId,
      layoutId: targetLayoutId,
      type: section.type,
      variant: section.variant,
      order: index + 1,
      isEnabled: section.isEnabled,
      status: section.status,
      propsJson: section.propsJson
    }));

    await this.prisma.pageSection.createMany({
      data: sectionsToCreate
    });
  }

  /**
   * Get all layouts for tenant
   */
  async getAllLayouts(tenantId: number, language?: string) {
    if (!language) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { defaultLanguage: true }
      });
      language = tenant?.defaultLanguage || 'tr';
    }

    const layouts = await this.prisma.pageLayout.findMany({
      where: {
        tenantId,
        language
      },
      include: {
        _count: {
          select: { sections: true }
        }
      },
      orderBy: [
        { key: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    return layouts.map(layout => ({
      key: layout.key,
      type: layout.key.startsWith('PAGE:') ? 'page' as const : 'global' as const,
      slug: layout.key.startsWith('PAGE:') ? layout.key.replace('PAGE:', '') : undefined,
      displayName: this.getLayoutDisplayName(layout.key),
      sectionsCount: layout._count.sections,
      language: layout.language,
      status: layout.status,
      updatedAt: layout.updatedAt
    }));
  }

  /**
   * Get display name for layout key
   */
  private getLayoutDisplayName(key: string): string {
    if (key === 'HOME') return 'Ana Sayfa / Home';
    if (key.startsWith('PAGE:')) {
      const slug = key.replace('PAGE:', '');
      return `Sayfa: ${slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
    return key;
  }

  /**
   * Delete entire layout and its sections
   */
  async deleteLayout(tenantId: number, key: string, language?: string) {
    if (!language) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { defaultLanguage: true }
      });
      language = tenant?.defaultLanguage || 'tr';
    }

    // Prevent deletion of HOME layout
    if (key === 'HOME') {
      throw new BadRequestException('Cannot delete HOME layout');
    }

    const layout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key,
          language
        }
      }
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    if (layout.tenantId !== tenantId) {
      throw new NotFoundException('Layout not found or access denied');
    }

    // Delete layout and cascade delete sections
    await this.prisma.pageLayout.delete({
      where: {
        tenantId_key_language: {
          tenantId,
          key,
          language
        }
      }
    });

    return {
      success: true,
      message: `Layout ${key} deleted successfully`
    };
  }

  /**
   * Validate layout key format
   */
  validateLayoutKey(key: string): { isValid: boolean; type: 'global' | 'page'; slug?: string } {
    if (key === 'HOME') {
      return { isValid: true, type: 'global' };
    }

    if (key.startsWith('PAGE:')) {
      const slug = key.replace('PAGE:', '');

      // Validate slug format (letters, numbers, hyphens only)
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return { isValid: false, type: 'page' };
      }

      return { isValid: true, type: 'page', slug };
    }

    // Global layouts (future: FOOTER, HEADER, etc.)
    if (/^[A-Z_]+$/.test(key)) {
      return { isValid: true, type: 'global' };
    }

    return { isValid: false, type: 'global' };
  }

  /**
   * Get public layout with enhanced page detection
   */
  async getPublicLayoutEnhanced(tenantId: number, key: string, language?: string) {
    const baseLayout = await this.getPublicLayout(tenantId, key, language);

    // Add metadata about the layout type
    const keyInfo = this.validateLayoutKey(key);

    // Add fallback content for HOME layout if no sections exist
    let sections = baseLayout.sections;
    console.log(`DEBUG: key=${key}, sections.length=${sections.length}, tenantId=${tenantId}`);
    if (key === 'HOME' && sections.length === 0) {
      console.log('DEBUG: Applying fallback content for HOME layout');
      sections = this.getPrintingCompanyFallbackSections();
    }

    return {
      ...baseLayout,
      sections,
      meta: {
        type: keyInfo.type,
        slug: keyInfo.slug,
        displayName: this.getLayoutDisplayName(key),
        isPageSpecific: keyInfo.type === 'page'
      }
    };
  }

  /**
   * Get fallback sections for printing company template
   */
  private getPrintingCompanyFallbackSections() {
    return [
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
          items: [
            {
              title: 'Branda Baskı',
              description: 'Dış mekan dayanımlı branda, mesh, vinil.'
            },
            {
              title: 'Afiş & Poster',
              description: 'Yüksek çözünürlük, canlı renkler.'
            },
            {
              title: 'Tabela',
              description: 'Işıklı/ışıksız tabela, kutu harf, yönlendirme.'
            },
            {
              title: 'Araç Giydirme',
              description: 'Kurumsal araç kaplama ve folyo uygulama.'
            }
          ]
        }
      }
    ];
  }

  /**
   * Ensure sections have explicit variants for public consumption
   * Normalizes sections that might have been saved without explicit variants
   */
  private async ensureExplicitVariants(tenantId: number, sections: any[]): Promise<any[]> {
    if (!sections || sections.length === 0) {
      return sections;
    }

    try {
      // Get template configuration for normalization
      const templateConfig = await this.getTemplateConfigForTenant(tenantId);
      if (!templateConfig) {
        // No template config, return as-is
        return sections;
      }

      // Apply normalization to ensure explicit variants
      const result = SectionConfigUtil.normalizeSections(sections, templateConfig);

      if (result.isValid && result.normalizedSections) {
        return result.normalizedSections;
      }

      // If normalization fails, log warning but return original sections
      // This prevents breaking public APIs due to validation issues
      console.warn(`[PageLayoutsService] Section normalization failed for tenant ${tenantId}:`, result.errors);
      return sections;

    } catch (error) {
      console.warn(`[PageLayoutsService] Error normalizing sections for tenant ${tenantId}:`, error.message);
      return sections;
    }
  }

  /**
   * Get template configuration for tenant (helper method)
   */
  private async getTemplateConfigForTenant(tenantId: number) {
    try {
      // Get tenant's site config to find template key
      const siteConfig = await this.prisma.tenantSiteConfig.findUnique({
        where: { tenantId },
        select: { templateKey: true }
      });

      if (!siteConfig || !siteConfig.templateKey) {
        return null;
      }

      // Get template supported sections
      const template = await this.prisma.template.findUnique({
        where: { key: siteConfig.templateKey },
        select: { supportedSections: true, key: true }
      });

      if (!template) {
        return null;
      }

      return SectionConfigUtil.getTemplateConfig(template.supportedSections, template.key);
    } catch (error) {
      console.warn(`[PageLayoutsService] Error getting template config for tenant ${tenantId}:`, error.message);
      return null;
    }
  }
}