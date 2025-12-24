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
exports.SEOQueryDto = exports.UpdateOGTemplateDto = exports.CreateOGTemplateDto = exports.OGTemplateTranslationDto = exports.UpdateSEOIntegrationDto = exports.UpdateSitemapConfigDto = exports.UpdateRedirectDto = exports.CreateRedirectDto = exports.UpdatePageSEODto = exports.CreatePageSEODto = exports.PageSEOTranslationDto = exports.UpdateStructuredDataDto = exports.CreateStructuredDataDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStructuredDataDto {
    constructor() {
        this.isActive = true;
    }
}
exports.CreateStructuredDataDto = CreateStructuredDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'organization',
        description: 'Type of entity (organization, website, article, service, person)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStructuredDataDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'main',
        description: 'ID of the specific entity'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStructuredDataDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Organization',
        description: 'Schema.org @type value'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStructuredDataDto.prototype, "schemaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ABC İnşaat",
            "url": "https://abcinsaat.com",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+90-212-555-0123",
                "contactType": "customer service"
            }
        },
        description: 'Complete JSON-LD structured data'
    }),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", Object)
], CreateStructuredDataDto.prototype, "jsonLd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the structured data is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateStructuredDataDto.prototype, "isActive", void 0);
class UpdateStructuredDataDto {
}
exports.UpdateStructuredDataDto = UpdateStructuredDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'organization',
        description: 'Type of entity',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStructuredDataDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'main',
        description: 'ID of the specific entity',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStructuredDataDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Organization',
        description: 'Schema.org @type value',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStructuredDataDto.prototype, "schemaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Complete JSON-LD structured data',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", Object)
], UpdateStructuredDataDto.prototype, "jsonLd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the structured data is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateStructuredDataDto.prototype, "isActive", void 0);
class PageSEOTranslationDto {
    constructor() {
        this.ogType = 'website';
        this.twitterCard = 'summary_large_image';
    }
}
exports.PageSEOTranslationDto = PageSEOTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul İnşaat Şirketi - ABC İnşaat',
        description: 'Page meta title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul\'da profesyonel inşaat hizmetleri. 20 yıllık deneyim.',
        description: 'Page meta description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'istanbul inşaat, inşaat şirketi, konut inşaatı',
        description: 'Meta keywords',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "metaKeywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul İnşaat Şirketi - ABC İnşaat',
        description: 'Open Graph title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "ogTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul\'da profesyonel inşaat hizmetleri.',
        description: 'Open Graph description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "ogDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/og-image.jpg',
        description: 'Open Graph image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "ogImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'website',
        description: 'Open Graph type',
        enum: ['website', 'article', 'product', 'video', 'book'],
        required: false,
        default: 'website'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['website', 'article', 'product', 'video', 'book']),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "ogType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'summary_large_image',
        description: 'Twitter Card type',
        enum: ['summary', 'summary_large_image', 'app', 'player'],
        required: false,
        default: 'summary_large_image'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['summary', 'summary_large_image', 'app', 'player']),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "twitterCard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul İnşaat Şirketi',
        description: 'Twitter title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "twitterTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Profesyonel inşaat hizmetleri',
        description: 'Twitter description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "twitterDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/twitter-image.jpg',
        description: 'Twitter image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], PageSEOTranslationDto.prototype, "twitterImage", void 0);
class CreatePageSEODto {
    constructor() {
        this.noIndex = false;
        this.noFollow = false;
    }
}
exports.CreatePageSEODto = CreatePageSEODto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'page',
        description: 'Type of entity (page, blog_post, service, team_member, reference)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePageSEODto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'ID of the specific entity'
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePageSEODto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/canonical-page',
        description: 'Custom canonical URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreatePageSEODto.prototype, "canonicalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Prevent search engines from indexing',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreatePageSEODto.prototype, "noIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Prevent search engines from following links',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreatePageSEODto.prototype, "noFollow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0.8,
        description: 'Sitemap priority (0.0 to 1.0)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0),
    (0, class_validator_1.Max)(1.0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePageSEODto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'monthly',
        description: 'Sitemap change frequency',
        enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']),
    __metadata("design:type", String)
], CreatePageSEODto.prototype, "changeFreq", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'noindex, nofollow',
        description: 'Custom robots meta tag',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePageSEODto.prototype, "customRobots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PageSEOTranslationDto],
        description: 'SEO translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PageSEOTranslationDto),
    __metadata("design:type", Array)
], CreatePageSEODto.prototype, "translations", void 0);
class UpdatePageSEODto {
}
exports.UpdatePageSEODto = UpdatePageSEODto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'page',
        description: 'Type of entity',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePageSEODto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'ID of the specific entity',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdatePageSEODto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/canonical-page',
        description: 'Custom canonical URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdatePageSEODto.prototype, "canonicalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Prevent search engines from indexing',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdatePageSEODto.prototype, "noIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Prevent search engines from following links',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdatePageSEODto.prototype, "noFollow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0.8,
        description: 'Sitemap priority (0.0 to 1.0)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0),
    (0, class_validator_1.Max)(1.0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdatePageSEODto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'monthly',
        description: 'Sitemap change frequency',
        enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']),
    __metadata("design:type", String)
], UpdatePageSEODto.prototype, "changeFreq", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'noindex, nofollow',
        description: 'Custom robots meta tag',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePageSEODto.prototype, "customRobots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PageSEOTranslationDto],
        description: 'Updated SEO translations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PageSEOTranslationDto),
    __metadata("design:type", Array)
], UpdatePageSEODto.prototype, "translations", void 0);
class CreateRedirectDto {
    constructor() {
        this.statusCode = 301;
        this.isActive = true;
    }
}
exports.CreateRedirectDto = CreateRedirectDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/old-page',
        description: 'Old URL (relative path from domain root)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRedirectDto.prototype, "fromUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/new-page',
        description: 'New URL (can be relative or absolute)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRedirectDto.prototype, "toUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 301,
        description: 'HTTP status code for redirect',
        enum: [301, 302, 307, 308],
        required: false,
        default: 301
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([301, 302, 307, 308]),
    __metadata("design:type", Number)
], CreateRedirectDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the redirect is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateRedirectDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Old product page moved to new location',
        description: 'Admin note about this redirect',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRedirectDto.prototype, "description", void 0);
class UpdateRedirectDto {
}
exports.UpdateRedirectDto = UpdateRedirectDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/old-page',
        description: 'Old URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRedirectDto.prototype, "fromUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/new-page',
        description: 'New URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRedirectDto.prototype, "toUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 301,
        description: 'HTTP status code',
        enum: [301, 302, 307, 308],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([301, 302, 307, 308]),
    __metadata("design:type", Number)
], UpdateRedirectDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the redirect is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateRedirectDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Updated redirect description',
        description: 'Admin note',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRedirectDto.prototype, "description", void 0);
class UpdateSitemapConfigDto {
}
exports.UpdateSitemapConfigDto = UpdateSitemapConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Include pages in sitemap',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includePages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Include blog posts in sitemap',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includeBlog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Include services in sitemap',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includeServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Include team members in sitemap',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Include references/portfolio in sitemap',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includeReferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Include galleries in sitemap',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "includeGalleries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50000,
        description: 'Maximum number of URLs in sitemap',
        required: false,
        default: 50000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSitemapConfigDto.prototype, "maxUrls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Auto-submit sitemap to search engines',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSitemapConfigDto.prototype, "autoSubmit", void 0);
class UpdateSEOIntegrationDto {
}
exports.UpdateSEOIntegrationDto = UpdateSEOIntegrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'G-XXXXXXXXXX',
        description: 'Google Analytics 4 Measurement ID',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "googleAnalyticsId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'GTM-XXXXXXX',
        description: 'Google Tag Manager Container ID',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "googleTagManagerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'google-site-verification=xxxxxxxxxxxxxxxxxxxxx',
        description: 'Google Search Console verification meta tag content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "googleSearchConsole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'msvalidate.01=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'Bing Webmaster Tools verification meta tag content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "bingWebmasterTools", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'facebook-domain-verification=xxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'Facebook domain verification meta tag content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "facebookDomainVerif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'p:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'Pinterest verification meta tag content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "pinterestVerif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'yandex-verification=xxxxxxxxxxxxxxxx',
        description: 'Yandex verification meta tag content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "yandexVerif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '<script>console.log("Custom head script");</script>',
        description: 'Custom scripts to inject in <head>',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "customHeadScripts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '<script>console.log("Custom body script");</script>',
        description: 'Custom scripts to inject before </body>',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSEOIntegrationDto.prototype, "customBodyScripts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether integrations are active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSEOIntegrationDto.prototype, "isActive", void 0);
class OGTemplateTranslationDto {
}
exports.OGTemplateTranslationDto = OGTemplateTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OGTemplateTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '{title} | {siteName}',
        description: 'Title template with variables',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OGTemplateTranslationDto.prototype, "titleTemplate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '{excerpt} | {siteName}',
        description: 'Description template with variables',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OGTemplateTranslationDto.prototype, "descTemplate", void 0);
class CreateOGTemplateDto {
    constructor() {
        this.isDefault = false;
        this.imageWidth = 1200;
        this.imageHeight = 630;
    }
}
exports.CreateOGTemplateDto = CreateOGTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Blog Post Template',
        description: 'Template name for admin reference'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOGTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'blog',
        description: 'What entity type this template is for (blog, service, page, etc.)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOGTemplateDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether this is the default template for this entity type',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateOGTemplateDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/default-og-image.jpg',
        description: 'Default Open Graph image URL for this template',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateOGTemplateDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1200,
        description: 'Open Graph image width in pixels',
        required: false,
        default: 1200
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(2000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOGTemplateDto.prototype, "imageWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 630,
        description: 'Open Graph image height in pixels',
        required: false,
        default: 630
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(2000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOGTemplateDto.prototype, "imageHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [OGTemplateTranslationDto],
        description: 'Template translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OGTemplateTranslationDto),
    __metadata("design:type", Array)
], CreateOGTemplateDto.prototype, "translations", void 0);
class UpdateOGTemplateDto {
}
exports.UpdateOGTemplateDto = UpdateOGTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Updated Blog Post Template',
        description: 'Template name',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOGTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'blog',
        description: 'Entity type',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOGTemplateDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether this is the default template',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateOGTemplateDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-og-image.jpg',
        description: 'Default Open Graph image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOGTemplateDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1200,
        description: 'Image width in pixels',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(2000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateOGTemplateDto.prototype, "imageWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 630,
        description: 'Image height in pixels',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(2000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateOGTemplateDto.prototype, "imageHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [OGTemplateTranslationDto],
        description: 'Updated template translations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OGTemplateTranslationDto),
    __metadata("design:type", Array)
], UpdateOGTemplateDto.prototype, "translations", void 0);
class SEOQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.SEOQueryDto = SEOQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Page number for pagination',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SEOQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Number of items per page',
        required: false,
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SEOQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'organization',
        description: 'Filter by entity type',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SEOQueryDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Article',
        description: 'Filter by schema type',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SEOQueryDto.prototype, "schemaType", void 0);
//# sourceMappingURL=seo.dto.js.map