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
exports.PostTranslationDto = exports.CreatePostDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class PostTranslationDto {
}
exports.PostTranslationDto = PostTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code (tr, en, ar, etc.)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Yapay Zeka ve Gelecek',
        description: 'Post title in this language',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'yapay-zeka-ve-gelecek',
        description: 'URL slug in this language',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Yapay zeka teknolojilerinin gelecekteki rolü hakkında detaylı bir analiz...',
        description: 'Post summary/excerpt',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            blocks: [
                { type: 'header', data: { text: 'Yapay Zeka ve Gelecek', level: 1 } },
                { type: 'paragraph', data: { text: 'Yapay zeka teknolojilerinin günümüzdeki gelişimi...' } }
            ]
        },
        description: 'Post content as JSON (supports rich content, blocks, etc.)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PostTranslationDto.prototype, "contentJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Yapay Zeka ve Gelecek | Blog',
        description: 'SEO meta title',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Yapay zeka teknolojilerinin gelecekteki rolü ve etkisi hakkında detaylı analiz.',
        description: 'SEO meta description',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostTranslationDto.prototype, "metaDescription", void 0);
class CreatePostDto {
    constructor() {
        this.isPublished = false;
    }
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Category ID for this post',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePostDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Author user ID',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePostDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the post is published',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePostDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:00:00Z',
        description: 'When to publish the post (for scheduled publishing)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePostDto.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PostTranslationDto],
        description: 'Post translations for different languages',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PostTranslationDto),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "translations", void 0);
//# sourceMappingURL=create-post.dto.js.map