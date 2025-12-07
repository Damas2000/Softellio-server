export declare class SiteSettingTranslationDto {
    language: string;
    siteName: string;
    siteDescription?: string;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
}
export declare class CreateSiteSettingDto {
    translations: SiteSettingTranslationDto[];
}
export declare class UpdateSiteSettingDto {
    translations?: SiteSettingTranslationDto[];
}
