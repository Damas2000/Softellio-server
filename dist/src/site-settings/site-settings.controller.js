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
exports.SiteSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const site_settings_service_1 = require("./site-settings.service");
const site_setting_dto_1 = require("./dto/site-setting.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let SiteSettingsController = class SiteSettingsController {
    constructor(siteSettingsService) {
        this.siteSettingsService = siteSettingsService;
    }
    create(createSiteSettingDto, tenantId) {
        return this.siteSettingsService.create(createSiteSettingDto, tenantId);
    }
    findAll(tenantId) {
        return this.siteSettingsService.findByTenant(tenantId);
    }
    getAvailableLanguages(tenantId) {
        return this.siteSettingsService.getAvailableLanguages(tenantId);
    }
    findByLanguage(language, tenantId) {
        return this.siteSettingsService.findByTenantAndLanguage(tenantId, language);
    }
    update(updateSiteSettingDto, tenantId) {
        return this.siteSettingsService.update(tenantId, updateSiteSettingDto);
    }
    upsertTranslation(language, translationDto, tenantId) {
        return this.siteSettingsService.upsertTranslation(tenantId, language, translationDto);
    }
    deleteTranslation(language, tenantId) {
        return this.siteSettingsService.deleteTranslation(tenantId, language);
    }
    remove(tenantId) {
        return this.siteSettingsService.delete(tenantId);
    }
    async getPublicSettings(tenantId, language) {
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
    async getPublicAllLanguages(tenantId) {
        const settings = await this.siteSettingsService.findByTenant(tenantId);
        if (!settings) {
            return {};
        }
        const result = {};
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
};
exports.SiteSettingsController = SiteSettingsController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create site settings (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Site settings created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Site settings already exist' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [site_setting_dto_1.CreateSiteSettingDto, Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get site settings with all translations (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site settings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site settings not found' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/languages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get available languages for site settings (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available languages retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "getAvailableLanguages", null);
__decorate([
    (0, common_1.Get)('admin/:language'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get site settings for specific language (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site settings for language retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site settings not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "findByLanguage", null);
__decorate([
    (0, common_1.Patch)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update site settings (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site settings updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site settings not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [site_setting_dto_1.UpdateSiteSettingDto, Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('admin/translation/:language'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert translation for specific language (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translation updated successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "upsertTranslation", null);
__decorate([
    (0, common_1.Delete)('admin/translation/:language'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete translation for specific language (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Translation deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Translation not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "deleteTranslation", null);
__decorate([
    (0, common_1.Delete)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all site settings (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site settings deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site settings not found' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SiteSettingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public site settings for default language' }),
    (0, swagger_1.ApiQuery)({
        name: 'lang',
        required: false,
        description: 'Language code (defaults to tenant default language)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public site settings retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SiteSettingsController.prototype, "getPublicSettings", null);
__decorate([
    (0, common_1.Get)('public/all'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public site settings for all available languages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public site settings for all languages retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SiteSettingsController.prototype, "getPublicAllLanguages", null);
exports.SiteSettingsController = SiteSettingsController = __decorate([
    (0, swagger_1.ApiTags)('Site Settings'),
    (0, common_1.Controller)('site-settings'),
    __metadata("design:paramtypes", [site_settings_service_1.SiteSettingsService])
], SiteSettingsController);
//# sourceMappingURL=site-settings.controller.js.map