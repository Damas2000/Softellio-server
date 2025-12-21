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
exports.PageQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_page_dto_1 = require("./create-page.dto");
class PageQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'updatedAt';
        this.sortOrder = 'desc';
    }
}
exports.PageQueryDto = PageQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter pages by status',
        enum: create_page_dto_1.PageStatus,
        required: false,
        example: create_page_dto_1.PageStatus.PUBLISHED,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(create_page_dto_1.PageStatus),
    __metadata("design:type", String)
], PageQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter pages by language (returns pages with translations in this language)',
        required: false,
        example: 'tr',
        minLength: 2,
        maxLength: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10, { message: 'Language code must be between 2 and 10 characters' }),
    __metadata("design:type", String)
], PageQueryDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search in page title and slug (case-insensitive)',
        required: false,
        example: 'hakkımızda',
        minLength: 1,
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, { message: 'Search term must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], PageQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        required: false,
        minimum: 1,
        default: 1,
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'Page number must be at least 1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PageQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        required: false,
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit cannot exceed 100' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PageQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort pages by field',
        required: false,
        enum: ['createdAt', 'updatedAt', 'title', 'status'],
        default: 'updatedAt',
        example: 'updatedAt',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        required: false,
        enum: ['asc', 'desc'],
        default: 'desc',
        example: 'desc',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PageQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter pages created after this date (ISO 8601)',
        required: false,
        example: '2025-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Created after date must be a valid ISO 8601 date string' }),
    __metadata("design:type", String)
], PageQueryDto.prototype, "createdAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter pages created before this date (ISO 8601)',
        required: false,
        example: '2025-12-31T23:59:59.999Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Created before date must be a valid ISO 8601 date string' }),
    __metadata("design:type", String)
], PageQueryDto.prototype, "createdBefore", void 0);
//# sourceMappingURL=page-query.dto.js.map