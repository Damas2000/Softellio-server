import { PrismaService } from '../config/prisma.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto } from './dto/site-setting.dto';
import { SiteSetting } from '@prisma/client';
export interface SiteSettingWithTranslations extends SiteSetting {
    translations: {
        id: number;
        language: string;
        siteName: string;
        siteDescription: string | null;
        seoMetaTitle: string | null;
        seoMetaDescription: string | null;
    }[];
}
export declare class SiteSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSiteSettingDto: CreateSiteSettingDto, tenantId: number): Promise<SiteSettingWithTranslations>;
    findByTenant(tenantId: number): Promise<SiteSettingWithTranslations | null>;
    findByTenantAndLanguage(tenantId: number, language: string): Promise<{
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
    } | null>;
    update(tenantId: number, updateSiteSettingDto: UpdateSiteSettingDto): Promise<SiteSettingWithTranslations>;
    upsertTranslation(tenantId: number, language: string, translationData: {
        siteName: string;
        siteDescription?: string;
        seoMetaTitle?: string;
        seoMetaDescription?: string;
    }): Promise<SiteSettingWithTranslations>;
    deleteTranslation(tenantId: number, language: string): Promise<void>;
    delete(tenantId: number): Promise<void>;
    getAvailableLanguages(tenantId: number): Promise<string[]>;
}
