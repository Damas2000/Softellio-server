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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEOController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seo_service_1 = require("./seo.service");
const seo_dto_1 = require("./dto/seo.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let SEOController = class SEOController {
    constructor(seoService) {
        this.seoService = seoService;
    }
    createStructuredData(createStructuredDataDto, tenantId) {
        return this.seoService.createStructuredData(createStructuredDataDto, tenantId);
    }
    findAllStructuredData(tenantId, query) {
        return this.seoService.findAllStructuredData(tenantId, query);
    }
    findStructuredDataById(id, tenantId) {
        return this.seoService.findStructuredDataById(id, tenantId);
    }
    updateStructuredData(id, updateStructuredDataDto, tenantId) {
        return this.seoService.updateStructuredData(id, updateStructuredDataDto, tenantId);
    }
    removeStructuredData(id, tenantId) {
        return this.seoService.removeStructuredData(id, tenantId);
    }
    createPageSEO(createPageSEODto, tenantId) {
        return this.seoService.createPageSEO(createPageSEODto, tenantId);
    }
    findAllPageSEO(tenantId, query) {
        return this.seoService.findAllPageSEO(tenantId, query);
    }
    findPageSEOById(id, tenantId) {
        return this.seoService.findPageSEOById(id, tenantId);
    }
    findPageSEOByEntity(entityType, entityId, tenantId) {
        return this.seoService.findPageSEOByEntity(entityType, entityId, tenantId);
    }
    updatePageSEO(id, updatePageSEODto, tenantId) {
        return this.seoService.updatePageSEO(id, updatePageSEODto, tenantId);
    }
    removePageSEO(id, tenantId) {
        return this.seoService.removePageSEO(id, tenantId);
    }
    createRedirect(createRedirectDto, tenantId) {
        return this.seoService.createRedirect(createRedirectDto, tenantId);
    }
    findAllRedirects(tenantId, query) {
        return this.seoService.findAllRedirects(tenantId, query);
    }
    findRedirectById(id, tenantId) {
        return this.seoService.findRedirectById(id, tenantId);
    }
    updateRedirect(id, updateRedirectDto, tenantId) {
        return this.seoService.updateRedirect(id, updateRedirectDto, tenantId);
    }
    removeRedirect(id, tenantId) {
        return this.seoService.removeRedirect(id, tenantId);
    }
    getSitemapConfig(tenantId) {
        return this.seoService.getSitemapConfig(tenantId);
    }
    updateSitemapConfig(updateSitemapConfigDto, tenantId) {
        return this.seoService.updateSitemapConfig(updateSitemapConfigDto, tenantId);
    }
    async generateSitemap(tenantId, res) {
        const sitemapXml = await this.seoService.generateSitemap(tenantId);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'attachment; filename="sitemap.xml"');
        return res.send(sitemapXml);
    }
    getSEOIntegration(tenantId) {
        return this.seoService.getSEOIntegration(tenantId);
    }
    updateSEOIntegration(updateSEOIntegrationDto, tenantId) {
        return this.seoService.updateSEOIntegration(updateSEOIntegrationDto, tenantId);
    }
    createOGTemplate(createOGTemplateDto, tenantId) {
        return this.seoService.createOGTemplate(createOGTemplateDto, tenantId);
    }
    findAllOGTemplates(tenantId, query) {
        return this.seoService.findAllOGTemplates(tenantId, query);
    }
    findOGTemplateById(id, tenantId) {
        return this.seoService.findOGTemplateById(id, tenantId);
    }
    updateOGTemplate(id, updateOGTemplateDto, tenantId) {
        return this.seoService.updateOGTemplate(id, updateOGTemplateDto, tenantId);
    }
    removeOGTemplate(id, tenantId) {
        return this.seoService.removeOGTemplate(id, tenantId);
    }
    getSEOAnalysis(tenantId) {
        return this.seoService.getSEOAnalysis(tenantId);
    }
    async getPublicSitemap(tenantId, res) {
        const sitemapXml = await this.seoService.generateSitemap(tenantId);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(sitemapXml);
    }
    async getPublicRobotsTxt(tenantId, res) {
        const robotsTxt = await this.seoService.generateRobotsTxt(tenantId);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(robotsTxt);
    }
    async handleRedirect(fromPath, tenantId, res) {
        const normalizedPath = '/' + fromPath;
        const redirect = await this.seoService.findRedirectByFromUrl(normalizedPath, tenantId);
        if (!redirect || !redirect.isActive) {
            return res.status(404).json({ message: 'Page not found' });
        }
        await this.seoService.trackRedirectHit(redirect.id, tenantId);
        return res.redirect(redirect.statusCode, redirect.toUrl);
    }
    async getMetaPreview(entityType, entityId, language = 'tr', tenantId) {
        const pageSEO = await this.seoService.findPageSEOByEntity(entityType, entityId, tenantId);
        if (!pageSEO) {
            return {
                has_custom_seo: false,
                preview: {
                    title: 'No custom SEO configured',
                    description: 'Using default site meta tags',
                    og_title: null,
                    og_description: null,
                    og_image: null,
                    robots: 'index, follow',
                },
            };
        }
        const translation = pageSEO.translations.find(t => t.language === language);
        return {
            has_custom_seo: true,
            preview: {
                title: translation?.metaTitle || 'No title configured',
                description: translation?.metaDescription || 'No description configured',
                keywords: translation?.metaKeywords || null,
                og_title: translation?.ogTitle || translation?.metaTitle || null,
                og_description: translation?.ogDescription || translation?.metaDescription || null,
                og_image: translation?.ogImage || null,
                og_type: translation?.ogType || 'website',
                twitter_card: translation?.twitterCard || 'summary_large_image',
                canonical_url: pageSEO.canonicalUrl || null,
                robots: pageSEO.customRobots || (pageSEO.noIndex ? 'noindex' : 'index') + ', ' + (pageSEO.noFollow ? 'nofollow' : 'follow'),
                sitemap_priority: pageSEO.priority || 0.5,
                sitemap_changefreq: pageSEO.changeFreq || 'monthly',
            },
        };
    }
    async getSEOHealthCheck(tenantId) {
        const analysis = await this.seoService.getSEOAnalysis(tenantId);
        const recommendations = [];
        if (analysis.structured_data.active === 0) {
            recommendations.push({
                priority: 'high',
                category: 'structured_data',
                message: 'Add structured data for your organization to improve search visibility',
                action: 'Create Organization schema markup',
            });
        }
        if (analysis.page_seo.configured_pages < 5) {
            recommendations.push({
                priority: 'medium',
                category: 'page_seo',
                message: 'Configure custom meta tags for important pages',
                action: 'Add SEO settings to key pages, services, and blog posts',
            });
        }
        if (!analysis.integrations.google_analytics) {
            recommendations.push({
                priority: 'medium',
                category: 'tracking',
                message: 'Set up Google Analytics to track website performance',
                action: 'Add Google Analytics tracking code',
            });
        }
        if (!analysis.integrations.search_console) {
            recommendations.push({
                priority: 'medium',
                category: 'verification',
                message: 'Verify your site with Google Search Console',
                action: 'Add Google Search Console verification meta tag',
            });
        }
        if (analysis.og_templates.total === 0) {
            recommendations.push({
                priority: 'low',
                category: 'social',
                message: 'Create Open Graph templates for better social sharing',
                action: 'Set up OG templates for different content types',
            });
        }
        return {
            ...analysis,
            recommendations,
            last_checked: new Date().toISOString(),
        };
    }
};
exports.SEOController = SEOController;
__decorate([
    (0, common_1.Post)('admin/structured-data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create structured data schema (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Structured data created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or duplicate entity' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.CreateStructuredDataDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "createStructuredData", null);
__decorate([
    (0, common_1.Get)('admin/structured-data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all structured data schemas (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' }),
    (0, swagger_1.ApiQuery)({ name: 'schemaType', type: String, required: false, description: 'Filter by schema type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured data retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.SEOQueryDto]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findAllStructuredData", null);
__decorate([
    (0, common_1.Get)('admin/structured-data/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get structured data by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Structured data not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findStructuredDataById", null);
__decorate([
    (0, common_1.Patch)('admin/structured-data/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update structured data (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured data updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Structured data not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.UpdateStructuredDataDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updateStructuredData", null);
__decorate([
    (0, common_1.Delete)('admin/structured-data/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete structured data (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Structured data deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Structured data not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "removeStructuredData", null);
__decorate([
    (0, common_1.Post)('admin/page-seo'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create page-specific SEO settings (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Page SEO created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or duplicate entity' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.CreatePageSEODto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "createPageSEO", null);
__decorate([
    (0, common_1.Get)('admin/page-seo'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all page SEO settings (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page SEO settings retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.SEOQueryDto]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findAllPageSEO", null);
__decorate([
    (0, common_1.Get)('admin/page-seo/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get page SEO by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page SEO retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page SEO not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findPageSEOById", null);
__decorate([
    (0, common_1.Get)('admin/page-seo/entity/:entityType/:entityId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get page SEO by entity (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page SEO retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page SEO not found' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId', common_1.ParseIntPipe)),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findPageSEOByEntity", null);
__decorate([
    (0, common_1.Patch)('admin/page-seo/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update page SEO (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page SEO updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page SEO not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.UpdatePageSEODto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updatePageSEO", null);
__decorate([
    (0, common_1.Delete)('admin/page-seo/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete page SEO (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page SEO deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page SEO not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "removePageSEO", null);
__decorate([
    (0, common_1.Post)('admin/redirects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create URL redirect (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Redirect created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error or duplicate URL' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.CreateRedirectDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "createRedirect", null);
__decorate([
    (0, common_1.Get)('admin/redirects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all URL redirects (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Redirects retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.SEOQueryDto]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findAllRedirects", null);
__decorate([
    (0, common_1.Get)('admin/redirects/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get redirect by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Redirect retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Redirect not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findRedirectById", null);
__decorate([
    (0, common_1.Patch)('admin/redirects/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update redirect (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Redirect updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Redirect not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.UpdateRedirectDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updateRedirect", null);
__decorate([
    (0, common_1.Delete)('admin/redirects/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete redirect (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Redirect deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Redirect not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "removeRedirect", null);
__decorate([
    (0, common_1.Get)('admin/sitemap/config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get sitemap configuration (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap config retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "getSitemapConfig", null);
__decorate([
    (0, common_1.Patch)('admin/sitemap/config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update sitemap configuration (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap config updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.UpdateSitemapConfigDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updateSitemapConfig", null);
__decorate([
    (0, common_1.Post)('admin/sitemap/generate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Generate sitemap XML (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap generated successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "generateSitemap", null);
__decorate([
    (0, common_1.Get)('admin/integrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get SEO integrations (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SEO integrations retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "getSEOIntegration", null);
__decorate([
    (0, common_1.Patch)('admin/integrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update SEO integrations (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SEO integrations updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.UpdateSEOIntegrationDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updateSEOIntegration", null);
__decorate([
    (0, common_1.Post)('admin/og-templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create Open Graph template (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'OG template created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.CreateOGTemplateDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "createOGTemplate", null);
__decorate([
    (0, common_1.Get)('admin/og-templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Open Graph templates (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', type: String, required: false, description: 'Filter by entity type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OG templates retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.SEOQueryDto]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findAllOGTemplates", null);
__decorate([
    (0, common_1.Get)('admin/og-templates/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get Open Graph template by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OG template retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OG template not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "findOGTemplateById", null);
__decorate([
    (0, common_1.Patch)('admin/og-templates/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update Open Graph template (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OG template updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OG template not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, seo_dto_1.UpdateOGTemplateDto, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "updateOGTemplate", null);
__decorate([
    (0, common_1.Delete)('admin/og-templates/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Open Graph template (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OG template deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OG template not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "removeOGTemplate", null);
__decorate([
    (0, common_1.Get)('admin/analysis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get SEO analysis and recommendations (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SEO analysis retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SEOController.prototype, "getSEOAnalysis", null);
__decorate([
    (0, common_1.Get)('public/sitemap.xml'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get sitemap XML for public access' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sitemap XML retrieved successfully', type: String }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "getPublicSitemap", null);
__decorate([
    (0, common_1.Get)('public/robots.txt'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get robots.txt for public access' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Robots.txt retrieved successfully', type: String }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "getPublicRobotsTxt", null);
__decorate([
    (0, common_1.Get)('public/redirect/*'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Handle URL redirects' }),
    (0, swagger_1.ApiResponse)({ status: 301, description: 'Permanent redirect' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Temporary redirect' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No redirect found' }),
    __param(0, (0, common_1.Param)('*')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "handleRedirect", null);
__decorate([
    (0, common_1.Get)('admin/meta-preview/:entityType/:entityId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Preview meta tags for an entity (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meta tag preview generated successfully' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "getMetaPreview", null);
__decorate([
    (0, common_1.Get)('admin/seo-health-check'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Comprehensive SEO health check (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SEO health check completed successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SEOController.prototype, "getSEOHealthCheck", null);
exports.SEOController = SEOController = __decorate([
    (0, swagger_1.ApiTags)('SEO & Meta Tag Management'),
    (0, common_1.Controller)('seo'),
    __metadata("design:paramtypes", [seo_service_1.SEOService])
], SEOController);
//# sourceMappingURL=seo.controller.js.map