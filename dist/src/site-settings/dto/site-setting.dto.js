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
exports.UpdateSiteSettingTranslationDto = exports.UpsertSiteSettingTranslationDto = exports.UpdateSiteSettingDto = exports.CreateSiteSettingDto = exports.SiteSettingTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SiteSettingTranslationDto {
}
exports.SiteSettingTranslationDto = SiteSettingTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code for this translation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SiteSettingTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website',
        description: 'Site name in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SiteSettingTranslationDto.prototype, "siteName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Welcome to our amazing website',
        description: 'Site description in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SiteSettingTranslationDto.prototype, "siteDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website - Welcome',
        description: 'SEO meta title for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SiteSettingTranslationDto.prototype, "seoMetaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Discover amazing content on our website',
        description: 'SEO meta description for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SiteSettingTranslationDto.prototype, "seoMetaDescription", void 0);
class CreateSiteSettingDto {
}
exports.CreateSiteSettingDto = CreateSiteSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SiteSettingTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SiteSettingTranslationDto),
    __metadata("design:type", Array)
], CreateSiteSettingDto.prototype, "translations", void 0);
class UpdateSiteSettingDto {
}
exports.UpdateSiteSettingDto = UpdateSiteSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SiteSettingTranslationDto],
        description: 'Updated translations for different languages',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SiteSettingTranslationDto),
    __metadata("design:type", Array)
], UpdateSiteSettingDto.prototype, "translations", void 0);
class UpsertSiteSettingTranslationDto {
}
exports.UpsertSiteSettingTranslationDto = UpsertSiteSettingTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website',
        description: 'Site name in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertSiteSettingTranslationDto.prototype, "siteName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Welcome to our amazing website',
        description: 'Site description in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertSiteSettingTranslationDto.prototype, "siteDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website - Welcome',
        description: 'SEO meta title for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertSiteSettingTranslationDto.prototype, "seoMetaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Discover amazing content on our website',
        description: 'SEO meta description for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertSiteSettingTranslationDto.prototype, "seoMetaDescription", void 0);
class UpdateSiteSettingTranslationDto {
}
exports.UpdateSiteSettingTranslationDto = UpdateSiteSettingTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website',
        description: 'Site name in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSiteSettingTranslationDto.prototype, "siteName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Welcome to our amazing website',
        description: 'Site description in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSiteSettingTranslationDto.prototype, "siteDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'My Amazing Website - Welcome',
        description: 'SEO meta title for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSiteSettingTranslationDto.prototype, "seoMetaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Discover amazing content on our website',
        description: 'SEO meta description for this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSiteSettingTranslationDto.prototype, "seoMetaDescription", void 0);
//# sourceMappingURL=site-setting.dto.js.map