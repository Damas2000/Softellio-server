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
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hakkımızda',
        description: 'Page title in this language',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'hakkimizda',
        description: 'URL slug in this language',
    }),
    (0, class_validator_1.IsString)(),
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
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Şirketimizin geçmişi, vizyonu ve ekibi hakkında bilgi edinin.',
        description: 'SEO meta description',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
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
        description: 'Page translations for different languages',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PageTranslationDto),
    __metadata("design:type", Array)
], CreatePageDto.prototype, "translations", void 0);
//# sourceMappingURL=create-page.dto.js.map