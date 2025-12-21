export declare class CreateStructuredDataDto {
    entityType: string;
    entityId: string;
    schemaType: string;
    jsonLd: any;
    isActive?: boolean;
}
export declare class UpdateStructuredDataDto {
    entityType?: string;
    entityId?: string;
    schemaType?: string;
    jsonLd?: any;
    isActive?: boolean;
}
export declare class PageSEOTranslationDto {
    language: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
}
export declare class CreatePageSEODto {
    entityType: string;
    entityId: number;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    priority?: number;
    changeFreq?: string;
    customRobots?: string;
    translations: PageSEOTranslationDto[];
}
export declare class UpdatePageSEODto {
    entityType?: string;
    entityId?: number;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    priority?: number;
    changeFreq?: string;
    customRobots?: string;
    translations?: PageSEOTranslationDto[];
}
export declare class CreateRedirectDto {
    fromUrl: string;
    toUrl: string;
    statusCode?: number;
    isActive?: boolean;
    description?: string;
}
export declare class UpdateRedirectDto {
    fromUrl?: string;
    toUrl?: string;
    statusCode?: number;
    isActive?: boolean;
    description?: string;
}
export declare class UpdateSitemapConfigDto {
    includePages?: boolean;
    includeBlog?: boolean;
    includeServices?: boolean;
    includeTeam?: boolean;
    includeReferences?: boolean;
    includeGalleries?: boolean;
    maxUrls?: number;
    autoSubmit?: boolean;
}
export declare class UpdateSEOIntegrationDto {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    googleSearchConsole?: string;
    bingWebmasterTools?: string;
    facebookDomainVerif?: string;
    pinterestVerif?: string;
    yandexVerif?: string;
    customHeadScripts?: string;
    customBodyScripts?: string;
    isActive?: boolean;
}
export declare class OGTemplateTranslationDto {
    language: string;
    titleTemplate?: string;
    descTemplate?: string;
}
export declare class CreateOGTemplateDto {
    name: string;
    entityType: string;
    isDefault?: boolean;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    translations: OGTemplateTranslationDto[];
}
export declare class UpdateOGTemplateDto {
    name?: string;
    entityType?: string;
    isDefault?: boolean;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    translations?: OGTemplateTranslationDto[];
}
export declare class SEOQueryDto {
    page?: number;
    limit?: number;
    entityType?: string;
    schemaType?: string;
}
