import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateStructuredDataDto,
  UpdateStructuredDataDto,
  CreatePageSEODto,
  UpdatePageSEODto,
  CreateRedirectDto,
  UpdateRedirectDto,
  UpdateSitemapConfigDto,
  UpdateSEOIntegrationDto,
  CreateOGTemplateDto,
  UpdateOGTemplateDto,
  SEOQueryDto
} from './dto/seo.dto';

export interface StructuredDataWithRelations {
  id: number;
  tenantId: number;
  entityType: string;
  entityId: string;
  schemaType: string;
  jsonLd: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSEOWithRelations {
  id: number;
  tenantId: number;
  entityType: string;
  entityId: number;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  priority: number | null;
  changeFreq: string | null;
  customRobots: string | null;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    id: number;
    language: string;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    ogType: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: string | null;
  }[];
}

export interface RedirectWithRelations {
  id: number;
  tenantId: number;
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  isActive: boolean;
  hitCount: number;
  lastHit: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OGTemplateWithRelations {
  id: number;
  tenantId: number;
  name: string;
  entityType: string;
  isDefault: boolean;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    id: number;
    language: string;
    titleTemplate: string | null;
    descTemplate: string | null;
  }[];
}

@Injectable()
export class SEOService {
  constructor(private prisma: PrismaService) {}

  // ==================== STRUCTURED DATA MANAGEMENT ====================

  async createStructuredData(
    createStructuredDataDto: CreateStructuredDataDto,
    tenantId: number,
  ): Promise<StructuredDataWithRelations> {
    // Check if structured data already exists for this entity
    const existing = await this.prisma.structuredData.findUnique({
      where: {
        tenantId_entityType_entityId: {
          tenantId,
          entityType: createStructuredDataDto.entityType,
          entityId: createStructuredDataDto.entityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Structured data already exists for ${createStructuredDataDto.entityType}:${createStructuredDataDto.entityId}`,
      );
    }

    const structuredData = await this.prisma.structuredData.create({
      data: {
        tenantId,
        entityType: createStructuredDataDto.entityType,
        entityId: createStructuredDataDto.entityId,
        schemaType: createStructuredDataDto.schemaType,
        jsonLd: createStructuredDataDto.jsonLd,
        isActive: createStructuredDataDto.isActive,
      },
    });

    return structuredData as StructuredDataWithRelations;
  }

  async findAllStructuredData(
    tenantId: number,
    query: SEOQueryDto = {},
  ): Promise<{
    structuredData: StructuredDataWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20, entityType, schemaType } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    if (schemaType) {
      whereClause.schemaType = schemaType;
    }

    const [structuredData, total] = await Promise.all([
      this.prisma.structuredData.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.structuredData.count({ where: whereClause }),
    ]);

    return {
      structuredData: structuredData as StructuredDataWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findStructuredDataById(
    id: number,
    tenantId: number,
  ): Promise<StructuredDataWithRelations> {
    const structuredData = await this.prisma.structuredData.findFirst({
      where: { id, tenantId },
    });

    if (!structuredData) {
      throw new NotFoundException('Structured data not found');
    }

    return structuredData as StructuredDataWithRelations;
  }

  async updateStructuredData(
    id: number,
    updateStructuredDataDto: UpdateStructuredDataDto,
    tenantId: number,
  ): Promise<StructuredDataWithRelations> {
    await this.findStructuredDataById(id, tenantId);

    const structuredData = await this.prisma.structuredData.update({
      where: { id },
      data: {
        entityType: updateStructuredDataDto.entityType,
        entityId: updateStructuredDataDto.entityId,
        schemaType: updateStructuredDataDto.schemaType,
        jsonLd: updateStructuredDataDto.jsonLd,
        isActive: updateStructuredDataDto.isActive,
      },
    });

    return structuredData as StructuredDataWithRelations;
  }

  async removeStructuredData(id: number, tenantId: number): Promise<void> {
    await this.findStructuredDataById(id, tenantId);
    await this.prisma.structuredData.delete({ where: { id } });
  }

  // ==================== PAGE SEO MANAGEMENT ====================

  async createPageSEO(
    createPageSEODto: CreatePageSEODto,
    tenantId: number,
  ): Promise<PageSEOWithRelations> {
    // Check if page SEO already exists for this entity
    const existing = await this.prisma.pageSEO.findUnique({
      where: {
        tenantId_entityType_entityId: {
          tenantId,
          entityType: createPageSEODto.entityType,
          entityId: createPageSEODto.entityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Page SEO already exists for ${createPageSEODto.entityType}:${createPageSEODto.entityId}`,
      );
    }

    const pageSEO = await this.prisma.pageSEO.create({
      data: {
        tenantId,
        entityType: createPageSEODto.entityType,
        entityId: createPageSEODto.entityId,
        canonicalUrl: createPageSEODto.canonicalUrl,
        noIndex: createPageSEODto.noIndex,
        noFollow: createPageSEODto.noFollow,
        priority: createPageSEODto.priority,
        changeFreq: createPageSEODto.changeFreq,
        customRobots: createPageSEODto.customRobots,
        translations: {
          create: createPageSEODto.translations,
        },
      },
      include: {
        translations: true,
      },
    });

    return pageSEO as PageSEOWithRelations;
  }

  async findAllPageSEO(
    tenantId: number,
    query: SEOQueryDto = {},
  ): Promise<{
    pageSEO: PageSEOWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20, entityType } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    const [pageSEO, total] = await Promise.all([
      this.prisma.pageSEO.findMany({
        where: whereClause,
        include: {
          translations: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.pageSEO.count({ where: whereClause }),
    ]);

    return {
      pageSEO: pageSEO as PageSEOWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findPageSEOById(
    id: number,
    tenantId: number,
  ): Promise<PageSEOWithRelations> {
    const pageSEO = await this.prisma.pageSEO.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
      },
    });

    if (!pageSEO) {
      throw new NotFoundException('Page SEO not found');
    }

    return pageSEO as PageSEOWithRelations;
  }

  async findPageSEOByEntity(
    entityType: string,
    entityId: number,
    tenantId: number,
  ): Promise<PageSEOWithRelations | null> {
    const pageSEO = await this.prisma.pageSEO.findUnique({
      where: {
        tenantId_entityType_entityId: {
          tenantId,
          entityType,
          entityId,
        },
      },
      include: {
        translations: true,
      },
    });

    return pageSEO as PageSEOWithRelations | null;
  }

  async updatePageSEO(
    id: number,
    updatePageSEODto: UpdatePageSEODto,
    tenantId: number,
  ): Promise<PageSEOWithRelations> {
    await this.findPageSEOById(id, tenantId);

    // Update basic page SEO data
    const updateData: any = {};
    if (updatePageSEODto.entityType !== undefined) updateData.entityType = updatePageSEODto.entityType;
    if (updatePageSEODto.entityId !== undefined) updateData.entityId = updatePageSEODto.entityId;
    if (updatePageSEODto.canonicalUrl !== undefined) updateData.canonicalUrl = updatePageSEODto.canonicalUrl;
    if (updatePageSEODto.noIndex !== undefined) updateData.noIndex = updatePageSEODto.noIndex;
    if (updatePageSEODto.noFollow !== undefined) updateData.noFollow = updatePageSEODto.noFollow;
    if (updatePageSEODto.priority !== undefined) updateData.priority = updatePageSEODto.priority;
    if (updatePageSEODto.changeFreq !== undefined) updateData.changeFreq = updatePageSEODto.changeFreq;
    if (updatePageSEODto.customRobots !== undefined) updateData.customRobots = updatePageSEODto.customRobots;

    await this.prisma.pageSEO.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
    if (updatePageSEODto.translations) {
      await this.prisma.pageSEOTranslation.deleteMany({
        where: { pageSeoId: id },
      });

      await this.prisma.pageSEOTranslation.createMany({
        data: updatePageSEODto.translations.map(translation => ({
          pageSeoId: id,
          ...translation,
        })),
      });
    }

    return this.findPageSEOById(id, tenantId);
  }

  async removePageSEO(id: number, tenantId: number): Promise<void> {
    await this.findPageSEOById(id, tenantId);
    await this.prisma.pageSEO.delete({ where: { id } });
  }

  // ==================== REDIRECT MANAGEMENT ====================

  async createRedirect(
    createRedirectDto: CreateRedirectDto,
    tenantId: number,
  ): Promise<RedirectWithRelations> {
    // Check if redirect already exists for this fromUrl
    const existing = await this.prisma.redirect.findUnique({
      where: {
        tenantId_fromUrl: {
          tenantId,
          fromUrl: createRedirectDto.fromUrl,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Redirect already exists for ${createRedirectDto.fromUrl}`,
      );
    }

    const redirect = await this.prisma.redirect.create({
      data: {
        tenantId,
        fromUrl: createRedirectDto.fromUrl,
        toUrl: createRedirectDto.toUrl,
        statusCode: createRedirectDto.statusCode,
        isActive: createRedirectDto.isActive,
        description: createRedirectDto.description,
      },
    });

    return redirect as RedirectWithRelations;
  }

  async findAllRedirects(
    tenantId: number,
    query: SEOQueryDto = {},
  ): Promise<{
    redirects: RedirectWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    const [redirects, total] = await Promise.all([
      this.prisma.redirect.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.redirect.count({ where: whereClause }),
    ]);

    return {
      redirects: redirects as RedirectWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findRedirectById(
    id: number,
    tenantId: number,
  ): Promise<RedirectWithRelations> {
    const redirect = await this.prisma.redirect.findFirst({
      where: { id, tenantId },
    });

    if (!redirect) {
      throw new NotFoundException('Redirect not found');
    }

    return redirect as RedirectWithRelations;
  }

  async findRedirectByFromUrl(
    fromUrl: string,
    tenantId: number,
  ): Promise<RedirectWithRelations | null> {
    const redirect = await this.prisma.redirect.findUnique({
      where: {
        tenantId_fromUrl: {
          tenantId,
          fromUrl,
        },
      },
    });

    return redirect as RedirectWithRelations | null;
  }

  async updateRedirect(
    id: number,
    updateRedirectDto: UpdateRedirectDto,
    tenantId: number,
  ): Promise<RedirectWithRelations> {
    await this.findRedirectById(id, tenantId);

    const redirect = await this.prisma.redirect.update({
      where: { id },
      data: {
        fromUrl: updateRedirectDto.fromUrl,
        toUrl: updateRedirectDto.toUrl,
        statusCode: updateRedirectDto.statusCode,
        isActive: updateRedirectDto.isActive,
        description: updateRedirectDto.description,
      },
    });

    return redirect as RedirectWithRelations;
  }

  async removeRedirect(id: number, tenantId: number): Promise<void> {
    await this.findRedirectById(id, tenantId);
    await this.prisma.redirect.delete({ where: { id } });
  }

  async trackRedirectHit(id: number, tenantId: number): Promise<void> {
    await this.prisma.redirect.update({
      where: { id },
      data: {
        hitCount: { increment: 1 },
        lastHit: new Date(),
      },
    });
  }

  // ==================== SITEMAP CONFIG MANAGEMENT ====================

  async getSitemapConfig(tenantId: number) {
    let config = await this.prisma.sitemapConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.prisma.sitemapConfig.create({
        data: { tenantId },
      });
    }

    return config;
  }

  async updateSitemapConfig(
    updateSitemapConfigDto: UpdateSitemapConfigDto,
    tenantId: number,
  ) {
    let config = await this.prisma.sitemapConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.prisma.sitemapConfig.create({
        data: {
          tenantId,
          ...updateSitemapConfigDto,
        },
      });
    } else {
      config = await this.prisma.sitemapConfig.update({
        where: { tenantId },
        data: updateSitemapConfigDto,
      });
    }

    return config;
  }

  async generateSitemap(tenantId: number): Promise<string> {
    const config = await this.getSitemapConfig(tenantId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { domain: true, availableLanguages: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const baseUrl = `https://${tenant.domain}`;
    let urls: string[] = [];

    // Add pages
    if (config.includePages) {
      for (const language of tenant.availableLanguages) {
        const pages = await this.prisma.page.findMany({
          where: { tenantId },
          include: {
            translations: {
              where: { language },
            },
          },
        });

        for (const page of pages) {
          if (page.translations.length > 0) {
            const translation = page.translations[0];
            urls.push(`${baseUrl}/${language}/${translation.slug}`);
          }
        }
      }
    }

    // Add blog posts
    if (config.includeBlog) {
      for (const language of tenant.availableLanguages) {
        const posts = await this.prisma.blogPost.findMany({
          where: { tenantId, isPublished: true },
          include: {
            translations: {
              where: { language },
            },
          },
        });

        for (const post of posts) {
          if (post.translations.length > 0) {
            const translation = post.translations[0];
            urls.push(`${baseUrl}/${language}/blog/${translation.slug}`);
          }
        }
      }
    }

    // Add services
    if (config.includeServices) {
      for (const language of tenant.availableLanguages) {
        const services = await this.prisma.service.findMany({
          where: { tenantId, isActive: true },
          include: {
            translations: {
              where: { language },
            },
          },
        });

        for (const service of services) {
          if (service.translations.length > 0) {
            const translation = service.translations[0];
            urls.push(`${baseUrl}/${language}/services/${translation.slug}`);
          }
        }
      }
    }

    // Add references
    if (config.includeReferences) {
      for (const language of tenant.availableLanguages) {
        const references = await this.prisma.reference.findMany({
          where: { tenantId, isActive: true },
          include: {
            translations: {
              where: { language },
            },
          },
        });

        for (const reference of references) {
          if (reference.translations.length > 0) {
            const translation = reference.translations[0];
            urls.push(`${baseUrl}/${language}/references/${translation.slug}`);
          }
        }
      }
    }

    // Limit URLs if needed
    if (urls.length > config.maxUrls) {
      urls = urls.slice(0, config.maxUrls);
    }

    // Generate XML sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Update last generated timestamp
    await this.prisma.sitemapConfig.update({
      where: { tenantId },
      data: { lastGenerated: new Date() },
    });

    return sitemapXml;
  }

  // ==================== SEO INTEGRATION MANAGEMENT ====================

  async getSEOIntegration(tenantId: number) {
    let integration = await this.prisma.sEOIntegration.findUnique({
      where: { tenantId },
    });

    if (!integration) {
      integration = await this.prisma.sEOIntegration.create({
        data: { tenantId },
      });
    }

    return integration;
  }

  async updateSEOIntegration(
    updateSEOIntegrationDto: UpdateSEOIntegrationDto,
    tenantId: number,
  ) {
    let integration = await this.prisma.sEOIntegration.findUnique({
      where: { tenantId },
    });

    if (!integration) {
      integration = await this.prisma.sEOIntegration.create({
        data: {
          tenantId,
          ...updateSEOIntegrationDto,
        },
      });
    } else {
      integration = await this.prisma.sEOIntegration.update({
        where: { tenantId },
        data: updateSEOIntegrationDto,
      });
    }

    return integration;
  }

  // ==================== OPEN GRAPH TEMPLATE MANAGEMENT ====================

  async createOGTemplate(
    createOGTemplateDto: CreateOGTemplateDto,
    tenantId: number,
  ): Promise<OGTemplateWithRelations> {
    // If this is set as default, unset other defaults for the same entityType
    if (createOGTemplateDto.isDefault) {
      await this.prisma.oGTemplate.updateMany({
        where: {
          tenantId,
          entityType: createOGTemplateDto.entityType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const template = await this.prisma.oGTemplate.create({
      data: {
        tenantId,
        name: createOGTemplateDto.name,
        entityType: createOGTemplateDto.entityType,
        isDefault: createOGTemplateDto.isDefault,
        imageUrl: createOGTemplateDto.imageUrl,
        imageWidth: createOGTemplateDto.imageWidth,
        imageHeight: createOGTemplateDto.imageHeight,
        translations: {
          create: createOGTemplateDto.translations,
        },
      },
      include: {
        translations: true,
      },
    });

    return template as OGTemplateWithRelations;
  }

  async findAllOGTemplates(
    tenantId: number,
    query: SEOQueryDto = {},
  ): Promise<{
    templates: OGTemplateWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20, entityType } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    const [templates, total] = await Promise.all([
      this.prisma.oGTemplate.findMany({
        where: whereClause,
        include: {
          translations: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.oGTemplate.count({ where: whereClause }),
    ]);

    return {
      templates: templates as OGTemplateWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOGTemplateById(
    id: number,
    tenantId: number,
  ): Promise<OGTemplateWithRelations> {
    const template = await this.prisma.oGTemplate.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
      },
    });

    if (!template) {
      throw new NotFoundException('OG Template not found');
    }

    return template as OGTemplateWithRelations;
  }

  async updateOGTemplate(
    id: number,
    updateOGTemplateDto: UpdateOGTemplateDto,
    tenantId: number,
  ): Promise<OGTemplateWithRelations> {
    await this.findOGTemplateById(id, tenantId);

    // If this is set as default, unset other defaults for the same entityType
    if (updateOGTemplateDto.isDefault) {
      await this.prisma.oGTemplate.updateMany({
        where: {
          tenantId,
          entityType: updateOGTemplateDto.entityType,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Update basic template data
    const updateData: any = {};
    if (updateOGTemplateDto.name !== undefined) updateData.name = updateOGTemplateDto.name;
    if (updateOGTemplateDto.entityType !== undefined) updateData.entityType = updateOGTemplateDto.entityType;
    if (updateOGTemplateDto.isDefault !== undefined) updateData.isDefault = updateOGTemplateDto.isDefault;
    if (updateOGTemplateDto.imageUrl !== undefined) updateData.imageUrl = updateOGTemplateDto.imageUrl;
    if (updateOGTemplateDto.imageWidth !== undefined) updateData.imageWidth = updateOGTemplateDto.imageWidth;
    if (updateOGTemplateDto.imageHeight !== undefined) updateData.imageHeight = updateOGTemplateDto.imageHeight;

    await this.prisma.oGTemplate.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
    if (updateOGTemplateDto.translations) {
      await this.prisma.oGTemplateTranslation.deleteMany({
        where: { templateId: id },
      });

      await this.prisma.oGTemplateTranslation.createMany({
        data: updateOGTemplateDto.translations.map(translation => ({
          templateId: id,
          ...translation,
        })),
      });
    }

    return this.findOGTemplateById(id, tenantId);
  }

  async removeOGTemplate(id: number, tenantId: number): Promise<void> {
    await this.findOGTemplateById(id, tenantId);
    await this.prisma.oGTemplate.delete({ where: { id } });
  }

  // ==================== SEO ANALYSIS & UTILITIES ====================

  async getSEOAnalysis(tenantId: number) {
    const [
      structuredDataCount,
      pageSEOCount,
      redirectCount,
      activeRedirectCount,
      sitemapConfig,
      seoIntegration,
      ogTemplateCount,
      recentRedirects,
    ] = await Promise.all([
      this.prisma.structuredData.count({ where: { tenantId, isActive: true } }),
      this.prisma.pageSEO.count({ where: { tenantId } }),
      this.prisma.redirect.count({ where: { tenantId } }),
      this.prisma.redirect.count({ where: { tenantId, isActive: true } }),
      this.getSitemapConfig(tenantId),
      this.getSEOIntegration(tenantId),
      this.prisma.oGTemplate.count({ where: { tenantId } }),
      this.prisma.redirect.findMany({
        where: { tenantId, hitCount: { gt: 0 } },
        orderBy: { lastHit: 'desc' },
        take: 10,
      }),
    ]);

    return {
      structured_data: {
        active: structuredDataCount,
        coverage: structuredDataCount > 0 ? 'good' : 'needs_improvement',
      },
      page_seo: {
        configured_pages: pageSEOCount,
        coverage: pageSEOCount > 5 ? 'good' : 'needs_improvement',
      },
      redirects: {
        total: redirectCount,
        active: activeRedirectCount,
        recent_hits: recentRedirects.length,
      },
      sitemap: {
        configured: !!sitemapConfig,
        last_generated: sitemapConfig?.lastGenerated || null,
        auto_submit: sitemapConfig?.autoSubmit || false,
      },
      integrations: {
        google_analytics: !!seoIntegration?.googleAnalyticsId,
        google_tag_manager: !!seoIntegration?.googleTagManagerId,
        search_console: !!seoIntegration?.googleSearchConsole,
        facebook_pixel: !!seoIntegration?.customHeadScripts?.includes('facebook') || false,
      },
      og_templates: {
        total: ogTemplateCount,
        coverage: ogTemplateCount > 2 ? 'good' : 'basic',
      },
      overall_score: this.calculateSEOScore({
        structuredDataCount,
        pageSEOCount,
        hasAnalytics: !!seoIntegration?.googleAnalyticsId,
        hasSearchConsole: !!seoIntegration?.googleSearchConsole,
        ogTemplateCount,
        hasSitemap: !!sitemapConfig,
      }),
    };
  }

  private calculateSEOScore(factors: {
    structuredDataCount: number;
    pageSEOCount: number;
    hasAnalytics: boolean;
    hasSearchConsole: boolean;
    ogTemplateCount: number;
    hasSitemap: boolean;
  }): number {
    let score = 0;

    // Structured data (20 points)
    if (factors.structuredDataCount > 0) score += 20;

    // Page SEO configuration (25 points)
    if (factors.pageSEOCount > 0) score += 15;
    if (factors.pageSEOCount > 5) score += 10;

    // Analytics & tracking (20 points)
    if (factors.hasAnalytics) score += 10;
    if (factors.hasSearchConsole) score += 10;

    // Open Graph templates (15 points)
    if (factors.ogTemplateCount > 0) score += 8;
    if (factors.ogTemplateCount > 2) score += 7;

    // Sitemap (20 points)
    if (factors.hasSitemap) score += 20;

    return Math.min(score, 100);
  }

  async generateRobotsTxt(tenantId: number): Promise<string> {
    const seoSetting = await this.prisma.sEOSetting.findUnique({
      where: { tenantId },
    });

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { domain: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    let robotsTxt = seoSetting?.robotsTxt;

    if (!robotsTxt) {
      // Generate default robots.txt
      robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://${tenant.domain}/sitemap.xml

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow common files
Allow: /favicon.ico
Allow: /robots.txt
Allow: /sitemap.xml`;
    }

    return robotsTxt;
  }
}