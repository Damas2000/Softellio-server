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
exports.PageTranslationDto = exports.PageStatus = exports.CreatePageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var PageStatus;
(function (PageStatus) {
    PageStatus["DRAFT"] = "draft";
    PageStatus["PUBLISHED"] = "published";
    PageStatus["ARCHIVED"] = "archived";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
class PageTranslationDto {
}
exports.PageTranslationDto = PageTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code (tr, en, ar, etc.)',
        minLength: 2,
        maxLength: 10,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10, {
        message: 'Language code must be between 2 and 10 characters'
    }),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hakkımızda',
        description: 'Page title in this language',
        minLength: 1,
        maxLength: 200,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200, {
        message: 'Title must be between 1 and 200 characters'
    }),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'hakkimizda',
        description: 'URL slug in this language (lowercase letters, numbers, and hyphens only)',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-z0-9-]+$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, {
        message: 'Slug must be between 1 and 100 characters'
    }),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { blocks: [{ type: 'paragraph', data: { text: 'Bu bizim hikayemiz...' } }] },
        description: 'Page content as JSON (supports rich content, blocks, etc.)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PageTranslationDto.prototype, "contentJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Şirketimiz Hakkında | Ana Sayfa',
        description: 'SEO meta title',
        required: false,
        minLength: 1,
        maxLength: 300,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 300, {
        message: 'Meta title must be between 1 and 300 characters'
    }),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Şirketimizin geçmişi, vizyonu ve ekibi hakkında bilgi edinin.',
        description: 'SEO meta description',
        required: false,
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500, {
        message: 'Meta description must be between 1 and 500 characters'
    }),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "metaDescription", void 0);
class CreatePageDto {
    constructor() {
        this.status = PageStatus.DRAFT;
    }
}
exports.CreatePageDto = CreatePageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: PageStatus,
        example: PageStatus.DRAFT,
        description: 'Page publication status',
        default: PageStatus.DRAFT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PageStatus),
    __metadata("design:type", String)
], CreatePageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PageTranslationDto],
        description: 'Page translations for different languages (at least one required)',
        minItems: 1,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, {
        message: 'At least one translation is required'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PageTranslationDto),
    __metadata("design:type", Array)
], CreatePageDto.prototype, "translations", void 0);
//# sourceMappingURL=create-page.dto.js.map