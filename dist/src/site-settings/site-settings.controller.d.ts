import { SiteSettingsService } from './site-settings.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto, SiteSettingTranslationDto } from './dto/site-setting.dto';
export declare class SiteSettingsController {
    private readonly siteSettingsService;
    constructor(siteSettingsService: SiteSettingsService);
    create(createSiteSettingDto: CreateSiteSettingDto, tenantId: number): Promise<import("./site-settings.service").SiteSettingWithTranslations>;
    findAll(tenantId: number): Promise<import("./site-settings.service").SiteSettingWithTranslations>;
    getAvailableLanguages(tenantId: number): Promise<string[]>;
    findByLanguage(language: string, tenantId: number): Promise<{
        id: number;
        tenantId: number;
        translation: {
            id: number;
            language: string;
            siteName: string;
            siteDescription: string | null;
            seoMetaTitle: string | null;
            seoMetaDescription: string | null;
        } | null;
    }>;
    update(updateSiteSettingDto: UpdateSiteSettingDto, tenantId: number): Promise<import("./site-settings.service").SiteSettingWithTranslations>;
    upsertTranslation(language: string, translationDto: Omit<SiteSettingTranslationDto, 'language'>, tenantId: number): Promise<import("./site-settings.service").SiteSettingWithTranslations>;
    deleteTranslation(language: string, tenantId: number): Promise<void>;
    remove(tenantId: number): Promise<void>;
    getPublicSettings(tenantId: number, language?: string): Promise<{
        siteName: string;
        siteDescription: string;
        seoMetaTitle: string;
        seoMetaDescription: string;
    }>;
    getPublicAllLanguages(tenantId: number): Promise<Record<string, any>>;
}
