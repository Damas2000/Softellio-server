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
exports.BulkDeleteResponseDto = exports.PageDeleteResponseDto = exports.PaginatedPageResponseDto = exports.PageResponseDto = exports.PageTranslationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_page_dto_1 = require("./create-page.dto");
class PageTranslationResponseDto {
}
exports.PageTranslationResponseDto = PageTranslationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Translation ID',
        example: 1,
    }),
    __metadata("design:type", Number)
], PageTranslationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Language code',
        example: 'tr',
    }),
    __metadata("design:type", String)
], PageTranslationResponseDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page title in this language',
        example: 'Hakkımızda',
    }),
    __metadata("design:type", String)
], PageTranslationResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL slug in this language',
        example: 'hakkimizda',
    }),
    __metadata("design:type", String)
], PageTranslationResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rich content as JSON',
        required: false,
        example: {
            blocks: [
                {
                    type: 'paragraph',
                    data: { text: 'Bu bizim hikayemiz...' }
                }
            ]
        },
    }),
    __metadata("design:type", Object)
], PageTranslationResponseDto.prototype, "contentJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SEO meta title',
        required: false,
        example: 'Şirketimiz Hakkında - Demo',
    }),
    __metadata("design:type", String)
], PageTranslationResponseDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SEO meta description',
        required: false,
        example: 'Hakkımızda bilgi edinin ve hikayemizi öğrenin.',
    }),
    __metadata("design:type", String)
], PageTranslationResponseDto.prototype, "metaDescription", void 0);
class PageResponseDto {
}
exports.PageResponseDto = PageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique page identifier',
        example: 1,
    }),
    __metadata("design:type", Number)
], PageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tenant ID this page belongs to',
        example: 5,
    }),
    __metadata("design:type", Number)
], PageResponseDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page status',
        enum: create_page_dto_1.PageStatus,
        example: create_page_dto_1.PageStatus.PUBLISHED,
    }),
    __metadata("design:type", String)
], PageResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page creation timestamp',
        example: '2025-12-21T10:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page last update timestamp',
        example: '2025-12-21T12:30:00.000Z',
    }),
    __metadata("design:type", Date)
], PageResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'All translations for this page',
        type: [PageTranslationResponseDto],
    }),
    __metadata("design:type", Array)
], PageResponseDto.prototype, "translations", void 0);
class PaginatedPageResponseDto {
}
exports.PaginatedPageResponseDto = PaginatedPageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of pages in current page',
        type: [PageResponseDto],
    }),
    __metadata("design:type", Array)
], PaginatedPageResponseDto.prototype, "pages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages matching the query',
        example: 42,
    }),
    __metadata("design:type", Number)
], PaginatedPageResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages in pagination',
        example: 5,
    }),
    __metadata("design:type", Number)
], PaginatedPageResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1,
    }),
    __metadata("design:type", Number)
], PaginatedPageResponseDto.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
    }),
    __metadata("design:type", Number)
], PaginatedPageResponseDto.prototype, "limit", void 0);
class PageDeleteResponseDto {
}
exports.PageDeleteResponseDto = PageDeleteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Page deleted successfully',
    }),
    __metadata("design:type", String)
], PageDeleteResponseDto.prototype, "message", void 0);
class BulkDeleteResponseDto {
}
exports.BulkDeleteResponseDto = BulkDeleteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pages deleted',
        example: 3,
    }),
    __metadata("design:type", Number)
], BulkDeleteResponseDto.prototype, "deleted", void 0);
//# sourceMappingURL=page-response.dto.js.map