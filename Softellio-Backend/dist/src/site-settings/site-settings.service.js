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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let SiteSettingsService = class SiteSettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSiteSettingDto, tenantId) {
        const existingSettings = await this.prisma.siteSetting.findUnique({
            where: { tenantId },
        });
        if (existingSettings) {
            throw new common_1.ConflictException('Site settings already exist for this tenant');
        }
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
        });
        return siteSetting;
    }
    async findByTenant(tenantId) {
        const siteSetting = await this.prisma.siteSetting.findUnique({
            where: { tenantId },
            include: {
                translations: true,
            },
        });
        return siteSetting;
    }
    async findByTenantAndLanguage(tenantId, language) {
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
    async update(tenantId, updateSiteSettingDto) {
        const existingSettings = await this.findByTenant(tenantId);
        if (!existingSettings) {
            throw new common_1.NotFoundException('Site settings not found for this tenant');
        }
        if (updateSiteSettingDto.translations) {
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
        return this.findByTenant(tenantId);
    }
    async upsertTranslation(tenantId, language, translationData) {
        let siteSetting = await this.findByTenant(tenantId);
        if (!siteSetting) {
            siteSetting = await this.prisma.siteSetting.create({
                data: { tenantId },
                include: {
                    translations: true,
                },
            });
        }
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
        return this.findByTenant(tenantId);
    }
    async deleteTranslation(tenantId, language) {
        const siteSetting = await this.findByTenant(tenantId);
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found for this tenant');
        }
        const deleted = await this.prisma.siteSettingTranslation.deleteMany({
            where: {
                siteSettingId: siteSetting.id,
                language,
            },
        });
        if (deleted.count === 0) {
            throw new common_1.NotFoundException(`Translation not found for language: ${language}`);
        }
    }
    async delete(tenantId) {
        const siteSetting = await this.findByTenant(tenantId);
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found for this tenant');
        }
        await this.prisma.siteSetting.delete({
            where: { tenantId },
        });
    }
    async getAvailableLanguages(tenantId) {
        const siteSetting = await this.findByTenant(tenantId);
        if (!siteSetting) {
            return [];
        }
        return siteSetting.translations.map(t => t.language);
    }
};
exports.SiteSettingsService = SiteSettingsService;
exports.SiteSettingsService = SiteSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteSettingsService);
//# sourceMappingURL=site-settings.service.js.map