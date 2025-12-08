import { PrismaService } from '../config/prisma.service';
import { CreateStructuredDataDto, UpdateStructuredDataDto, CreatePageSEODto, UpdatePageSEODto, CreateRedirectDto, UpdateRedirectDto, UpdateSitemapConfigDto, UpdateSEOIntegrationDto, CreateOGTemplateDto, UpdateOGTemplateDto, SEOQueryDto } from './dto/seo.dto';
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
export declare class SEOService {
    private prisma;
    constructor(prisma: PrismaService);
    createStructuredData(createStructuredDataDto: CreateStructuredDataDto, tenantId: number): Promise<StructuredDataWithRelations>;
    findAllStructuredData(tenantId: number, query?: SEOQueryDto): Promise<{
        structuredData: StructuredDataWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findStructuredDataById(id: number, tenantId: number): Promise<StructuredDataWithRelations>;
    updateStructuredData(id: number, updateStructuredDataDto: UpdateStructuredDataDto, tenantId: number): Promise<StructuredDataWithRelations>;
    removeStructuredData(id: number, tenantId: number): Promise<void>;
    createPageSEO(createPageSEODto: CreatePageSEODto, tenantId: number): Promise<PageSEOWithRelations>;
    findAllPageSEO(tenantId: number, query?: SEOQueryDto): Promise<{
        pageSEO: PageSEOWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findPageSEOById(id: number, tenantId: number): Promise<PageSEOWithRelations>;
    findPageSEOByEntity(entityType: string, entityId: number, tenantId: number): Promise<PageSEOWithRelations | null>;
    updatePageSEO(id: number, updatePageSEODto: UpdatePageSEODto, tenantId: number): Promise<PageSEOWithRelations>;
    removePageSEO(id: number, tenantId: number): Promise<void>;
    createRedirect(createRedirectDto: CreateRedirectDto, tenantId: number): Promise<RedirectWithRelations>;
    findAllRedirects(tenantId: number, query?: SEOQueryDto): Promise<{
        redirects: RedirectWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findRedirectById(id: number, tenantId: number): Promise<RedirectWithRelations>;
    findRedirectByFromUrl(fromUrl: string, tenantId: number): Promise<RedirectWithRelations | null>;
    updateRedirect(id: number, updateRedirectDto: UpdateRedirectDto, tenantId: number): Promise<RedirectWithRelations>;
    removeRedirect(id: number, tenantId: number): Promise<void>;
    trackRedirectHit(id: number, tenantId: number): Promise<void>;
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
    generateSitemap(tenantId: number): Promise<string>;
    getSEOIntegration(tenantId: number): Promise<{
        id: number;
        tenantId: number;
        isActive: boolean;
        createdAt: Date;
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
        isActive: boolean;
        createdAt: Date;
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
    createOGTemplate(createOGTemplateDto: CreateOGTemplateDto, tenantId: number): Promise<OGTemplateWithRelations>;
    findAllOGTemplates(tenantId: number, query?: SEOQueryDto): Promise<{
        templates: OGTemplateWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOGTemplateById(id: number, tenantId: number): Promise<OGTemplateWithRelations>;
    updateOGTemplate(id: number, updateOGTemplateDto: UpdateOGTemplateDto, tenantId: number): Promise<OGTemplateWithRelations>;
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
    private calculateSEOScore;
    generateRobotsTxt(tenantId: number): Promise<string>;
}
