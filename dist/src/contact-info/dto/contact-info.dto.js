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
exports.ContactSubmissionQueryDto = exports.ContactSubmissionDto = exports.UpdateContactInfoDto = exports.CreateContactInfoDto = exports.SocialMediaLinkDto = exports.OfficeDto = exports.ContactInfoTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ContactInfoTranslationDto {
}
exports.ContactInfoTranslationDto = ContactInfoTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code for this translation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ABC İnşaat Ltd. Şti.',
        description: 'Company name in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoTranslationDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Güvenilir İnşaat Çözümleri',
        description: 'Company tagline/slogan',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoTranslationDto.prototype, "tagline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kaliteli inşaat projeleri ile 20 yıllık deneyim...',
        description: 'Company description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoTranslationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Pazartesi-Cuma 09:00-18:00',
        description: 'Working hours',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoTranslationDto.prototype, "workingHours", void 0);
class OfficeDto {
    constructor() {
        this.isPrimary = false;
        this.isActive = true;
    }
}
exports.OfficeDto = OfficeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul Merkez Ofisi',
        description: 'Office name'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'info@company.com',
        description: 'Office email',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+90 212 123 45 67',
        description: 'Office phone number',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+90 212 123 45 68',
        description: 'Office fax number',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "fax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Levent, Büyükdere Cd. No:123, 34394 Şişli/İstanbul',
        description: 'Office address',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>',
        description: 'Google Maps embed URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfficeDto.prototype, "mapUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 41.0122,
        description: 'GPS latitude',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], OfficeDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 28.9769,
        description: 'GPS longitude',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], OfficeDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is this the primary office',
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
], OfficeDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is this office active',
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
], OfficeDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], OfficeDto.prototype, "order", void 0);
class SocialMediaLinkDto {
    constructor() {
        this.isActive = true;
    }
}
exports.SocialMediaLinkDto = SocialMediaLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'facebook',
        description: 'Social media platform (facebook, twitter, instagram, linkedin, youtube, etc.)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialMediaLinkDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://facebook.com/company',
        description: 'Social media profile URL'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SocialMediaLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'fab fa-facebook',
        description: 'Icon class or URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialMediaLinkDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is this link active',
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
], SocialMediaLinkDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SocialMediaLinkDto.prototype, "order", void 0);
class CreateContactInfoDto {
}
exports.CreateContactInfoDto = CreateContactInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/logo.png',
        description: 'Company logo URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateContactInfoDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/favicon.ico',
        description: 'Favicon URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateContactInfoDto.prototype, "favicon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ContactInfoTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ContactInfoTranslationDto),
    __metadata("design:type", Array)
], CreateContactInfoDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [OfficeDto],
        description: 'Office locations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfficeDto),
    __metadata("design:type", Array)
], CreateContactInfoDto.prototype, "offices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SocialMediaLinkDto],
        description: 'Social media links',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialMediaLinkDto),
    __metadata("design:type", Array)
], CreateContactInfoDto.prototype, "socialLinks", void 0);
class UpdateContactInfoDto {
}
exports.UpdateContactInfoDto = UpdateContactInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/logo.png',
        description: 'Company logo URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateContactInfoDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/favicon.ico',
        description: 'Favicon URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateContactInfoDto.prototype, "favicon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ContactInfoTranslationDto],
        description: 'Updated translations for different languages',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ContactInfoTranslationDto),
    __metadata("design:type", Array)
], UpdateContactInfoDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [OfficeDto],
        description: 'Updated office locations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfficeDto),
    __metadata("design:type", Array)
], UpdateContactInfoDto.prototype, "offices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SocialMediaLinkDto],
        description: 'Updated social media links',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialMediaLinkDto),
    __metadata("design:type", Array)
], UpdateContactInfoDto.prototype, "socialLinks", void 0);
class ContactSubmissionDto {
}
exports.ContactSubmissionDto = ContactSubmissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ahmet Yılmaz',
        description: 'Contact person name'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ahmet@example.com',
        description: 'Contact email'
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ContactSubmissionDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+90 533 123 45 67',
        description: 'Contact phone number',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Proje Hakkında Bilgi',
        description: 'Message subject',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Merhaba, yeni bir proje için bilgi almak istiyorum...',
        description: 'Message content'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionDto.prototype, "message", void 0);
class ContactSubmissionQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.ContactSubmissionQueryDto = ContactSubmissionQueryDto;
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
], ContactSubmissionQueryDto.prototype, "page", void 0);
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
], ContactSubmissionQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ahmet',
        description: 'Search term for name or email',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Filter by unread messages only',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ContactSubmissionQueryDto.prototype, "unreadOnly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'createdAt',
        description: 'Field to sort by',
        enum: ['createdAt', 'name', 'email'],
        required: false,
        default: 'createdAt'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'desc',
        description: 'Sort order',
        enum: ['asc', 'desc'],
        required: false,
        default: 'desc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactSubmissionQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=contact-info.dto.js.map