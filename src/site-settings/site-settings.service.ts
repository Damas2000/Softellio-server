import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSiteSettingDto: CreateSiteSettingDto,
    tenantId: number,
  ): Promise<SiteSettingWithTranslations> {
    // Check if site settings already exist for this tenant
    const existingSettings = await this.prisma.siteSetting.findUnique({
      where: { tenantId },
    });

    if (existingSettings) {
      throw new ConflictException('Site settings already exist for this tenant');
    }

    // Create site settings with translations
    const siteSetting = await this.prisma.siteSetting.create({
      data: {
        tenantId,
        translations: {
          create: createSiteSettingDto.translations,
        },
      },
      include: {
        translations: true,
      },
    }) as SiteSettingWithTranslations;

    return siteSetting;
  }

  async findByTenant(tenantId: number): Promise<SiteSettingWithTranslations | null> {
    const siteSetting = await this.prisma.siteSetting.findUnique({
      where: { tenantId },
      include: {
        translations: true,
      },
    }) as SiteSettingWithTranslations | null;

    return siteSetting;
  }

  async findByTenantAndLanguage(
    tenantId: number,
    language: string,
  ): Promise<{
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
  } | null> {
    const siteSetting = await this.prisma.siteSetting.findUnique({
      where: { tenantId },
      include: {
        translations: {
          where: { language },
          take: 1,
        },
      },
    });

    if (!siteSetting) {
      return null;
    }

    return {
      id: siteSetting.id,
      tenantId: siteSetting.tenantId,
      translation: siteSetting.translations[0] || null,
    };
  }

  async update(
    tenantId: number,
    updateSiteSettingDto: UpdateSiteSettingDto,
  ): Promise<SiteSettingWithTranslations> {
    // Check if site settings exist
    const existingSettings = await this.findByTenant(tenantId);
    if (!existingSettings) {
      throw new NotFoundException('Site settings not found for this tenant');
    }

    // If translations are provided, update them
    if (updateSiteSettingDto.translations) {
      // Delete existing translations and create new ones
      await this.prisma.siteSettingTranslation.deleteMany({
        where: { siteSettingId: existingSettings.id },
      });

      await this.prisma.siteSettingTranslation.createMany({
        data: updateSiteSettingDto.translations.map(translation => ({
          siteSettingId: existingSettings.id,
          ...translation,
        })),
      });
    }

    // Return updated site settings
    return this.findByTenant(tenantId) as Promise<SiteSettingWithTranslations>;
  }

  async upsertTranslation(
    tenantId: number,
    language: string,
    translationData: {
      siteName: string;
      siteDescription?: string;
      seoMetaTitle?: string;
      seoMetaDescription?: string;
    },
  ): Promise<SiteSettingWithTranslations> {
    // Get or create site settings for tenant
    let siteSetting = await this.findByTenant(tenantId);

    if (!siteSetting) {
      // Create new site settings if they don't exist
      siteSetting = await this.prisma.siteSetting.create({
        data: { tenantId },
        include: {
          translations: true,
        },
      }) as SiteSettingWithTranslations;
    }

    // Upsert the translation
    await this.prisma.siteSettingTranslation.upsert({
      where: {
        siteSettingId_language: {
          siteSettingId: siteSetting.id,
          language,
        },
      },
      update: translationData,
      create: {
        siteSettingId: siteSetting.id,
        language,
        ...translationData,
      },
    });

    // Return updated site settings
    return this.findByTenant(tenantId) as Promise<SiteSettingWithTranslations>;
  }

  async deleteTranslation(tenantId: number, language: string): Promise<void> {
    const siteSetting = await this.findByTenant(tenantId);
    if (!siteSetting) {
      throw new NotFoundException('Site settings not found for this tenant');
    }

    const deleted = await this.prisma.siteSettingTranslation.deleteMany({
      where: {
        siteSettingId: siteSetting.id,
        language,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException(`Translation not found for language: ${language}`);
    }
  }

  async delete(tenantId: number): Promise<void> {
    const siteSetting = await this.findByTenant(tenantId);
    if (!siteSetting) {
      throw new NotFoundException('Site settings not found for this tenant');
    }

    await this.prisma.siteSetting.delete({
      where: { tenantId },
    });
  }

  async getAvailableLanguages(tenantId: number): Promise<string[]> {
    const siteSetting = await this.findByTenant(tenantId);
    if (!siteSetting) {
      return [];
    }

    return siteSetting.translations.map(t => t.language);
  }
}