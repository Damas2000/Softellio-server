"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEOService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let SEOService = class SEOService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createStructuredData(createStructuredDataDto, tenantId) {
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
            throw new common_1.BadRequestException(`Structured data already exists for ${createStructuredDataDto.entityType}:${createStructuredDataDto.entityId}`);
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
        return structuredData;
    }
    async findAllStructuredData(tenantId, query = {}) {
        const { page = 1, limit = 20, entityType, schemaType } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
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
            structuredData: structuredData,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findStructuredDataById(id, tenantId) {
        const structuredData = await this.prisma.structuredData.findFirst({
            where: { id, tenantId },
        });
        if (!structuredData) {
            throw new common_1.NotFoundException('Structured data not found');
        }
        return structuredData;
    }
    async updateStructuredData(id, updateStructuredDataDto, tenantId) {
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
        return structuredData;
    }
    async removeStructuredData(id, tenantId) {
        await this.findStructuredDataById(id, tenantId);
        await this.prisma.structuredData.delete({ where: { id } });
    }
    async createPageSEO(createPageSEODto, tenantId) {
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
            throw new common_1.BadRequestException(`Page SEO already exists for ${createPageSEODto.entityType}:${createPageSEODto.entityId}`);
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
        return pageSEO;
    }
    async findAllPageSEO(tenantId, query = {}) {
        const { page = 1, limit = 20, entityType } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
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
            pageSEO: pageSEO,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findPageSEOById(id, tenantId) {
        const pageSEO = await this.prisma.pageSEO.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
            },
        });
        if (!pageSEO) {
            throw new common_1.NotFoundException('Page SEO not found');
        }
        return pageSEO;
    }
    async findPageSEOByEntity(entityType, entityId, tenantId) {
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
        return pageSEO;
    }
    async updatePageSEO(id, updatePageSEODto, tenantId) {
        await this.findPageSEOById(id, tenantId);
        const updateData = {};
        if (updatePageSEODto.entityType !== undefined)
            updateData.entityType = updatePageSEODto.entityType;
        if (updatePageSEODto.entityId !== undefined)
            updateData.entityId = updatePageSEODto.entityId;
        if (updatePageSEODto.canonicalUrl !== undefined)
            updateData.canonicalUrl = updatePageSEODto.canonicalUrl;
        if (updatePageSEODto.noIndex !== undefined)
            updateData.noIndex = updatePageSEODto.noIndex;
        if (updatePageSEODto.noFollow !== undefined)
            updateData.noFollow = updatePageSEODto.noFollow;
        if (updatePageSEODto.priority !== undefined)
            updateData.priority = updatePageSEODto.priority;
        if (updatePageSEODto.changeFreq !== undefined)
            updateData.changeFreq = updatePageSEODto.changeFreq;
        if (updatePageSEODto.customRobots !== undefined)
            updateData.customRobots = updatePageSEODto.customRobots;
        await this.prisma.pageSEO.update({
            where: { id },
            data: updateData,
        });
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
    async removePageSEO(id, tenantId) {
        await this.findPageSEOById(id, tenantId);
        await this.prisma.pageSEO.delete({ where: { id } });
    }
    async createRedirect(createRedirectDto, tenantId) {
        const existing = await this.prisma.redirect.findUnique({
            where: {
                tenantId_fromUrl: {
                    tenantId,
                    fromUrl: createRedirectDto.fromUrl,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Redirect already exists for ${createRedirectDto.fromUrl}`);
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
        return redirect;
    }
    async findAllRedirects(tenantId, query = {}) {
        const { page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
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
            redirects: redirects,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findRedirectById(id, tenantId) {
        const redirect = await this.prisma.redirect.findFirst({
            where: { id, tenantId },
        });
        if (!redirect) {
            throw new common_1.NotFoundException('Redirect not found');
        }
        return redirect;
    }
    async findRedirectByFromUrl(fromUrl, tenantId) {
        const redirect = await this.prisma.redirect.findUnique({
            where: {
                tenantId_fromUrl: {
                    tenantId,
                    fromUrl,
                },
            },
        });
        return redirect;
    }
    async updateRedirect(id, updateRedirectDto, tenantId) {
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
        return redirect;
    }
    async removeRedirect(id, tenantId) {
        await this.findRedirectById(id, tenantId);
        await this.prisma.redirect.delete({ where: { id } });
    }
    async trackRedirectHit(id, tenantId) {
        await this.prisma.redirect.update({
            where: { id },
            data: {
                hitCount: { increment: 1 },
                lastHit: new Date(),
            },
        });
    }
    async getSitemapConfig(tenantId) {
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
    async updateSitemapConfig(updateSitemapConfigDto, tenantId) {
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
        }
        else {
            config = await this.prisma.sitemapConfig.update({
                where: { tenantId },
                data: updateSitemapConfigDto,
            });
        }
        return config;
    }
    async generateSitemap(tenantId) {
        const config = await this.getSitemapConfig(tenantId);
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { domain: true, availableLanguages: true },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const baseUrl = `https://${tenant.domain}`;
        let urls = [];
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
        if (urls.length > config.maxUrls) {
            urls = urls.slice(0, config.maxUrls);
        }
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
        await this.prisma.sitemapConfig.update({
            where: { tenantId },
            data: { lastGenerated: new Date() },
        });
        return sitemapXml;
    }
    async getSEOIntegration(tenantId) {
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
    async updateSEOIntegration(updateSEOIntegrationDto, tenantId) {
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
        }
        else {
            integration = await this.prisma.sEOIntegration.update({
                where: { tenantId },
                data: updateSEOIntegrationDto,
            });
        }
        return integration;
    }
    async createOGTemplate(createOGTemplateDto, tenantId) {
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
        return template;
    }
    async findAllOGTemplates(tenantId, query = {}) {
        const { page = 1, limit = 20, entityType } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
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
            templates: templates,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOGTemplateById(id, tenantId) {
        const template = await this.prisma.oGTemplate.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('OG Template not found');
        }
        return template;
    }
    async updateOGTemplate(id, updateOGTemplateDto, tenantId) {
        await this.findOGTemplateById(id, tenantId);
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
        const updateData = {};
        if (updateOGTemplateDto.name !== undefined)
            updateData.name = updateOGTemplateDto.name;
        if (updateOGTemplateDto.entityType !== undefined)
            updateData.entityType = updateOGTemplateDto.entityType;
        if (updateOGTemplateDto.isDefault !== undefined)
            updateData.isDefault = updateOGTemplateDto.isDefault;
        if (updateOGTemplateDto.imageUrl !== undefined)
            updateData.imageUrl = updateOGTemplateDto.imageUrl;
        if (updateOGTemplateDto.imageWidth !== undefined)
            updateData.imageWidth = updateOGTemplateDto.imageWidth;
        if (updateOGTemplateDto.imageHeight !== undefined)
            updateData.imageHeight = updateOGTemplateDto.imageHeight;
        await this.prisma.oGTemplate.update({
            where: { id },
            data: updateData,
        });
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
    async removeOGTemplate(id, tenantId) {
        await this.findOGTemplateById(id, tenantId);
        await this.prisma.oGTemplate.delete({ where: { id } });
    }
    async getSEOAnalysis(tenantId) {
        const [structuredDataCount, pageSEOCount, redirectCount, activeRedirectCount, sitemapConfig, seoIntegration, ogTemplateCount, recentRedirects,] = await Promise.all([
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
    calculateSEOScore(factors) {
        let score = 0;
        if (factors.structuredDataCount > 0)
            score += 20;
        if (factors.pageSEOCount > 0)
            score += 15;
        if (factors.pageSEOCount > 5)
            score += 10;
        if (factors.hasAnalytics)
            score += 10;
        if (factors.hasSearchConsole)
            score += 10;
        if (factors.ogTemplateCount > 0)
            score += 8;
        if (factors.ogTemplateCount > 2)
            score += 7;
        if (factors.hasSitemap)
            score += 20;
        return Math.min(score, 100);
    }
    async generateRobotsTxt(tenantId) {
        const seoSetting = await this.prisma.sEOSetting.findUnique({
            where: { tenantId },
        });
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { domain: true },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        let robotsTxt = seoSetting?.robotsTxt;
        if (!robotsTxt) {
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
};
exports.SEOService = SEOService;
exports.SEOService = SEOService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SEOService);
//# sourceMappingURL=seo.service.js.map