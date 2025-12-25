import { Response } from 'express';
import { SEOService } from './seo.service';
import { CreateStructuredDataDto, UpdateStructuredDataDto, CreatePageSEODto, UpdatePageSEODto, CreateRedirectDto, UpdateRedirectDto, UpdateSitemapConfigDto, UpdateSEOIntegrationDto, CreateOGTemplateDto, UpdateOGTemplateDto, SEOQueryDto } from './dto/seo.dto';
export declare class SEOController {
    private readonly seoService;
    constructor(seoService: SEOService);
    createStructuredData(createStructuredDataDto: CreateStructuredDataDto, tenantId: number): Promise<import("./seo.service").StructuredDataWithRelations>;
    findAllStructuredData(tenantId: number, query: SEOQueryDto): Promise<{
        structuredData: import("./seo.service").StructuredDataWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findStructuredDataById(id: number, tenantId: number): Promise<import("./seo.service").StructuredDataWithRelations>;
    updateStructuredData(id: number, updateStructuredDataDto: UpdateStructuredDataDto, tenantId: number): Promise<import("./seo.service").StructuredDataWithRelations>;
    removeStructuredData(id: number, tenantId: number): Promise<void>;
    createPageSEO(createPageSEODto: CreatePageSEODto, tenantId: number): Promise<import("./seo.service").PageSEOWithRelations>;
    findAllPageSEO(tenantId: number, query: SEOQueryDto): Promise<{
        pageSEO: import("./seo.service").PageSEOWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findPageSEOById(id: number, tenantId: number): Promise<import("./seo.service").PageSEOWithRelations>;
    findPageSEOByEntity(entityType: string, entityId: number, tenantId: number): Promise<import("./seo.service").PageSEOWithRelations>;
    updatePageSEO(id: number, updatePageSEODto: UpdatePageSEODto, tenantId: number): Promise<import("./seo.service").PageSEOWithRelations>;
    removePageSEO(id: number, tenantId: number): Promise<void>;
    createRedirect(createRedirectDto: CreateRedirectDto, tenantId: number): Promise<import("./seo.service").RedirectWithRelations>;
    findAllRedirects(tenantId: number, query: SEOQueryDto): Promise<{
        redirects: import("./seo.service").RedirectWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findRedirectById(id: number, tenantId: number): Promise<import("./seo.service").RedirectWithRelations>;
    updateRedirect(id: number, updateRedirectDto: UpdateRedirectDto, tenantId: number): Promise<import("./seo.service").RedirectWithRelations>;
    removeRedirect(id: number, tenantId: number): Promise<void>;
    getSitemapConfig(tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        updatedAt: Date;
        includePages: boolean;
        includeBlog: boolean;
        includeServices: boolean;
        includeTeam: boolean;
        includeReferences: boolean;
        includeGalleries: boolean;
        maxUrls: number;
        autoSubmit: boolean;
        lastGenerated: Date | null;
    }>;
    updateSitemapConfig(updateSitemapConfigDto: UpdateSitemapConfigDto, tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        updatedAt: Date;
        includePages: boolean;
        includeBlog: boolean;
        includeServices: boolean;
        includeTeam: boolean;
        includeReferences: boolean;
        includeGalleries: boolean;
        maxUrls: number;
        autoSubmit: boolean;
        lastGenerated: Date | null;
    }>;
    generateSitemap(tenantId: number, res: Response): Promise<Response<any, Record<string, any>>>;
    getSEOIntegration(tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        googleAnalyticsId: string | null;
        googleTagManagerId: string | null;
        googleSearchConsole: string | null;
        bingWebmasterTools: string | null;
        facebookDomainVerif: string | null;
        pinterestVerif: string | null;
        yandexVerif: string | null;
        customHeadScripts: string | null;
        customBodyScripts: string | null;
    }>;
    updateSEOIntegration(updateSEOIntegrationDto: UpdateSEOIntegrationDto, tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        googleAnalyticsId: string | null;
        googleTagManagerId: string | null;
        googleSearchConsole: string | null;
        bingWebmasterTools: string | null;
        facebookDomainVerif: string | null;
        pinterestVerif: string | null;
        yandexVerif: string | null;
        customHeadScripts: string | null;
        customBodyScripts: string | null;
    }>;
    createOGTemplate(createOGTemplateDto: CreateOGTemplateDto, tenantId: number): Promise<import("./seo.service").OGTemplateWithRelations>;
    findAllOGTemplates(tenantId: number, query: SEOQueryDto): Promise<{
        templates: import("./seo.service").OGTemplateWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOGTemplateById(id: number, tenantId: number): Promise<import("./seo.service").OGTemplateWithRelations>;
    updateOGTemplate(id: number, updateOGTemplateDto: UpdateOGTemplateDto, tenantId: number): Promise<import("./seo.service").OGTemplateWithRelations>;
    removeOGTemplate(id: number, tenantId: number): Promise<void>;
    getSEOAnalysis(tenantId: number): Promise<{
        structured_data: {
            active: number;
            coverage: string;
        };
        page_seo: {
            configured_pages: number;
            coverage: string;
        };
        redirects: {
            total: number;
            active: number;
            recent_hits: number;
        };
        sitemap: {
            configured: boolean;
            last_generated: Date;
            auto_submit: boolean;
        };
        integrations: {
            google_analytics: boolean;
            google_tag_manager: boolean;
            search_console: boolean;
            facebook_pixel: boolean;
        };
        og_templates: {
            total: number;
            coverage: string;
        };
        overall_score: number;
    }>;
    getPublicSitemap(tenantId: number, res: Response): Promise<Response<any, Record<string, any>>>;
    getPublicRobotsTxt(tenantId: number, res: Response): Promise<Response<any, Record<string, any>>>;
    handleRedirect(fromPath: string, tenantId: number, res: Response): Promise<void | Response<any, Record<string, any>>>;
    getMetaPreview(entityType: string, entityId: number, language: string, tenantId: number): Promise<{
        has_custom_seo: boolean;
        preview: {
            title: string;
            description: string;
            og_title: any;
            og_description: any;
            og_image: any;
            robots: string;
            keywords?: undefined;
            og_type?: undefined;
            twitter_card?: undefined;
            canonical_url?: undefined;
            sitemap_priority?: undefined;
            sitemap_changefreq?: undefined;
        };
    } | {
        has_custom_seo: boolean;
        preview: {
            title: string;
            description: string;
            keywords: string;
            og_title: string;
            og_description: string;
            og_image: string;
            og_type: string;
            twitter_card: string;
            canonical_url: string;
            robots: string;
            sitemap_priority: number;
            sitemap_changefreq: string;
        };
    }>;
    getSEOHealthCheck(tenantId: number): Promise<{
        recommendations: any[];
        last_checked: string;
        structured_data: {
            active: number;
            coverage: string;
        };
        page_seo: {
            configured_pages: number;
            coverage: string;
        };
        redirects: {
            total: number;
            active: number;
            recent_hits: number;
        };
        sitemap: {
            configured: boolean;
            last_generated: Date;
            auto_submit: boolean;
        };
        integrations: {
            google_analytics: boolean;
            google_tag_manager: boolean;
            search_console: boolean;
            facebook_pixel: boolean;
        };
        og_templates: {
            total: number;
            coverage: string;
        };
        overall_score: number;
    }>;
}
