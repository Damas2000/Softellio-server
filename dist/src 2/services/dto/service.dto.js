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
exports.ServiceQueryDto = exports.UpdateServiceDto = exports.CreateServiceDto = exports.ServiceTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ServiceTranslationDto {
}
exports.ServiceTranslationDto = ServiceTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code for this translation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İnşaat Hizmetleri',
        description: 'Service title in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'insaat-hizmetleri',
        description: 'URL-friendly slug for this service'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kaliteli inşaat hizmetleri sunuyoruz.',
        description: 'Short description of the service',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            blocks: [
                { type: 'header', data: { text: 'İnşaat Hizmetleri', level: 2 } },
                { type: 'paragraph', data: { text: 'Detaylı hizmet açıklaması...' } }
            ]
        },
        description: 'Full service content in JSON format',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ServiceTranslationDto.prototype, "contentJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İnşaat Hizmetleri - Firma Adı',
        description: 'SEO meta title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kaliteli inşaat hizmetleri hakkında detaylı bilgi',
        description: 'SEO meta description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceTranslationDto.prototype, "metaDescription", void 0);
class CreateServiceDto {
    constructor() {
        this.isActive = true;
        this.isFeatured = false;
    }
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/icon.png',
        description: 'Icon or image URL for the service',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order (lower numbers appear first)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the service is active',
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
], CreateServiceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the service is featured',
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
], CreateServiceDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ServiceTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceTranslationDto),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "translations", void 0);
class UpdateServiceDto {
}
exports.UpdateServiceDto = UpdateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/icon.png',
        description: 'Icon or image URL for the service',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "iconUrl", void 0);
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
], UpdateServiceDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the service is active',
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
], UpdateServiceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the service is featured',
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
], UpdateServiceDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ServiceTranslationDto],
        description: 'Updated translations for different languages',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceTranslationDto),
    __metadata("design:type", Array)
], UpdateServiceDto.prototype, "translations", void 0);
class ServiceQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'order';
        this.sortOrder = 'asc';
    }
}
exports.ServiceQueryDto = ServiceQueryDto;
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
], ServiceQueryDto.prototype, "page", void 0);
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
], ServiceQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'insaat',
        description: 'Search term for service title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Filter by featured services only',
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
], ServiceQueryDto.prototype, "featured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'order',
        description: 'Field to sort by',
        enum: ['order', 'createdAt', 'updatedAt', 'title'],
        required: false,
        default: 'order'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'asc',
        description: 'Sort order',
        enum: ['asc', 'desc'],
        required: false,
        default: 'asc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=service.dto.js.map