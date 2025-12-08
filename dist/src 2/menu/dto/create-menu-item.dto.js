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
exports.MenuItemTranslationDto = exports.CreateMenuItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class MenuItemTranslationDto {
}
exports.MenuItemTranslationDto = MenuItemTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code (tr, en, ar, etc.)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MenuItemTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ana Sayfa',
        description: 'Menu item label in this language',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MenuItemTranslationDto.prototype, "label", void 0);
class CreateMenuItemDto {
}
exports.CreateMenuItemDto = CreateMenuItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Menu ID this item belongs to',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMenuItemDto.prototype, "menuId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Parent menu item ID for nested menus',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMenuItemDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order of the menu item',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMenuItemDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Page ID to link to (for internal links)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMenuItemDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://external-website.com',
        description: 'External URL (for external links)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateMenuItemDto.prototype, "externalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [MenuItemTranslationDto],
        description: 'Menu item translations for different languages',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MenuItemTranslationDto),
    __metadata("design:type", Array)
], CreateMenuItemDto.prototype, "translations", void 0);
//# sourceMappingURL=create-menu-item.dto.js.map