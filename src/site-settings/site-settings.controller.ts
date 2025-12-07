import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto, SiteSettingTranslationDto } from './dto/site-setting.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Site Settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create site settings (Admin)' })
  @ApiResponse({ status: 201, description: 'Site settings created successfully' })
  @ApiResponse({ status: 409, description: 'Site settings already exist' })
  create(
    @Body() createSiteSettingDto: CreateSiteSettingDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.siteSettingsService.create(createSiteSettingDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get site settings with all translations (Admin)' })
  @ApiResponse({ status: 200, description: 'Site settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Site settings not found' })
  findAll(@CurrentTenant() tenantId: number) {
    return this.siteSettingsService.findByTenant(tenantId);
  }

  @Get('admin/languages')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get available languages for site settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Available languages retrieved successfully' })
  getAvailableLanguages(@CurrentTenant() tenantId: number) {
    return this.siteSettingsService.getAvailableLanguages(tenantId);
  }

  @Get('admin/:language')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get site settings for specific language (Admin)' })
  @ApiResponse({ status: 200, description: 'Site settings for language retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Site settings not found' })
  findByLanguage(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.siteSettingsService.findByTenantAndLanguage(tenantId, language);
  }

  @Patch('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update site settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Site settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Site settings not found' })
  update(
    @Body() updateSiteSettingDto: UpdateSiteSettingDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.siteSettingsService.update(tenantId, updateSiteSettingDto);
  }

  @Patch('admin/translation/:language')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Upsert translation for specific language (Admin)' })
  @ApiResponse({ status: 200, description: 'Translation updated successfully' })
  upsertTranslation(
    @Param('language') language: string,
    @Body() translationDto: Omit<SiteSettingTranslationDto, 'language'>,
    @CurrentTenant() tenantId: number,
  ) {
    return this.siteSettingsService.upsertTranslation(tenantId, language, translationDto);
  }

  @Delete('admin/translation/:language')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete translation for specific language (Admin)' })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  deleteTranslation(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.siteSettingsService.deleteTranslation(tenantId, language);
  }

  @Delete('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete all site settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Site settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Site settings not found' })
  remove(@CurrentTenant() tenantId: number) {
    return this.siteSettingsService.delete(tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public site settings for default language' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (defaults to tenant default language)'
  })
  @ApiResponse({ status: 200, description: 'Public site settings retrieved successfully' })
  async getPublicSettings(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    // If no language specified, we'll need to get tenant's default language
    // For now, default to 'tr' if not specified
    const lang = language || 'tr';

    const settings = await this.siteSettingsService.findByTenantAndLanguage(tenantId, lang);

    if (!settings || !settings.translation) {
      return {
        siteName: 'Website',
        siteDescription: null,
        seoMetaTitle: null,
        seoMetaDescription: null,
      };
    }

    return {
      siteName: settings.translation.siteName,
      siteDescription: settings.translation.siteDescription,
      seoMetaTitle: settings.translation.seoMetaTitle,
      seoMetaDescription: settings.translation.seoMetaDescription,
    };
  }

  @Get('public/all')
  @Public()
  @ApiOperation({ summary: 'Get public site settings for all available languages' })
  @ApiResponse({ status: 200, description: 'Public site settings for all languages retrieved successfully' })
  async getPublicAllLanguages(@CurrentTenant() tenantId: number) {
    const settings = await this.siteSettingsService.findByTenant(tenantId);

    if (!settings) {
      return {};
    }

    const result: Record<string, any> = {};

    settings.translations.forEach(translation => {
      result[translation.language] = {
        siteName: translation.siteName,
        siteDescription: translation.siteDescription,
        seoMetaTitle: translation.seoMetaTitle,
        seoMetaDescription: translation.seoMetaDescription,
      };
    });

    return result;
  }
}