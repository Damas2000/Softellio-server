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
exports.ReferenceOrderDto = exports.ReferenceReorderDto = exports.BulkReferenceDeleteDto = exports.ReferenceQueryDto = exports.UpdateReferenceDto = exports.CreateReferenceDto = exports.ReferenceGalleryDto = exports.ReferenceTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ReferenceTranslationDto {
}
exports.ReferenceTranslationDto = ReferenceTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code for this translation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul Plaza İnşaatı',
        description: 'Project title in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'istanbul-plaza-insaati',
        description: 'URL-friendly slug for this project'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Modern plaza inşaat projesi',
        description: 'Short project description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            blocks: [
                { type: 'header', data: { text: 'İstanbul Plaza İnşaatı', level: 2 } },
                { type: 'paragraph', data: { text: 'Detaylı proje açıklaması...' } }
            ]
        },
        description: 'Full project content in JSON format',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReferenceTranslationDto.prototype, "contentJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul Plaza İnşaatı - ABC İnşaat',
        description: 'SEO meta title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İstanbul Plaza inşaat projesi hakkında detaylı bilgi',
        description: 'SEO meta description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceTranslationDto.prototype, "metaDescription", void 0);
class ReferenceGalleryDto {
}
exports.ReferenceGalleryDto = ReferenceGalleryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/images/project1.jpg',
        description: 'Image URL for gallery'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ReferenceGalleryDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Binanın dış cephe görünümü',
        description: 'Image caption',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceGalleryDto.prototype, "caption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order in gallery',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReferenceGalleryDto.prototype, "order", void 0);
class CreateReferenceDto {
    constructor() {
        this.isActive = true;
        this.isFeatured = false;
    }
}
exports.CreateReferenceDto = CreateReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/images/main-project.jpg',
        description: 'Main project image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateReferenceDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://istanbul-plaza.com',
        description: 'Link to live project or website',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateReferenceDto.prototype, "projectUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ABC Şirketi',
        description: 'Client company name',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReferenceDto.prototype, "clientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-06-15T00:00:00.000Z',
        description: 'Project completion date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReferenceDto.prototype, "projectDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'construction',
        description: 'Project category (construction, legal, design, etc.)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReferenceDto.prototype, "category", void 0);
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
], CreateReferenceDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the reference is active',
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
], CreateReferenceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the reference is featured',
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
], CreateReferenceDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReferenceTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenceTranslationDto),
    __metadata("design:type", Array)
], CreateReferenceDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReferenceGalleryDto],
        description: 'Project gallery images',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenceGalleryDto),
    __metadata("design:type", Array)
], CreateReferenceDto.prototype, "gallery", void 0);
class UpdateReferenceDto {
}
exports.UpdateReferenceDto = UpdateReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/images/main-project.jpg',
        description: 'Main project image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateReferenceDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://istanbul-plaza.com',
        description: 'Link to live project or website',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateReferenceDto.prototype, "projectUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ABC Şirketi',
        description: 'Client company name',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReferenceDto.prototype, "clientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-06-15T00:00:00.000Z',
        description: 'Project completion date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateReferenceDto.prototype, "projectDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'construction',
        description: 'Project category',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReferenceDto.prototype, "category", void 0);
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
], UpdateReferenceDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the reference is active',
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
], UpdateReferenceDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether the reference is featured',
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
], UpdateReferenceDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReferenceTranslationDto],
        description: 'Updated translations for different languages',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenceTranslationDto),
    __metadata("design:type", Array)
], UpdateReferenceDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReferenceGalleryDto],
        description: 'Updated project gallery images',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenceGalleryDto),
    __metadata("design:type", Array)
], UpdateReferenceDto.prototype, "gallery", void 0);
class ReferenceQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'order';
        this.sortOrder = 'asc';
    }
}
exports.ReferenceQueryDto = ReferenceQueryDto;
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
], ReferenceQueryDto.prototype, "page", void 0);
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
], ReferenceQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'plaza',
        description: 'Search term for project title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'construction',
        description: 'Filter by project category',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Filter by featured projects only',
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
], ReferenceQueryDto.prototype, "featured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ABC Şirketi',
        description: 'Filter by client name',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceQueryDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2023,
        description: 'Filter by project year',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReferenceQueryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'order',
        description: 'Field to sort by',
        enum: ['order', 'createdAt', 'updatedAt', 'projectDate', 'title'],
        required: false,
        default: 'order'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReferenceQueryDto.prototype, "sortBy", void 0);
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
], ReferenceQueryDto.prototype, "sortOrder", void 0);
class BulkReferenceDeleteDto {
}
exports.BulkReferenceDeleteDto = BulkReferenceDeleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of reference IDs to delete',
        example: [1, 2, 3],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)({ message: 'IDs must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one reference ID is required' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each ID must be a valid integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], BulkReferenceDeleteDto.prototype, "ids", void 0);
class ReferenceReorderDto {
}
exports.ReferenceReorderDto = ReferenceReorderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of references with their new order',
        example: [{ id: 1, order: 1 }, { id: 2, order: 2 }],
        type: [Object],
    }),
    (0, class_validator_1.IsArray)({ message: 'References must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one reference is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReferenceOrderDto),
    __metadata("design:type", Array)
], ReferenceReorderDto.prototype, "references", void 0);
class ReferenceOrderDto {
}
exports.ReferenceOrderDto = ReferenceOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reference ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'ID must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReferenceOrderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New order position',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Order must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReferenceOrderDto.prototype, "order", void 0);
//# sourceMappingURL=reference.dto.js.map