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
exports.MenuItemTranslationDto = exports.MenuItemOrderDto = exports.MenuReorderDto = exports.CreateMenuItemDto = exports.MenuItemLinkValidation = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
let MenuItemLinkValidation = class MenuItemLinkValidation {
    validate(pageId, args) {
        const object = args.object;
        const externalUrl = object.externalUrl;
        if (!pageId && !externalUrl) {
            return true;
        }
        return Boolean(pageId) !== Boolean(externalUrl);
    }
    defaultMessage(args) {
        const object = args.object;
        const externalUrl = object.externalUrl;
        if (args.value && externalUrl) {
            return 'Menu item cannot have both pageId and externalUrl';
        }
        return 'Menu item validation passed';
    }
};
exports.MenuItemLinkValidation = MenuItemLinkValidation;
exports.MenuItemLinkValidation = MenuItemLinkValidation = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'MenuItemLinkValidation', async: false })
], MenuItemLinkValidation);
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
        description: 'Page ID to link to (for internal links). Cannot be used together with externalUrl. If both pageId and externalUrl are null, this creates a group/parent menu item.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Validate)(MenuItemLinkValidation),
    __metadata("design:type", Number)
], CreateMenuItemDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://external-website.com',
        description: 'External URL (for external links). Cannot be used together with pageId. If both pageId and externalUrl are null, this creates a group/parent menu item.',
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
class MenuReorderDto {
}
exports.MenuReorderDto = MenuReorderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of menu items with their new order and optional parent assignment',
        example: [
            { id: 1, order: 1, parentId: null },
            { id: 2, order: 2, parentId: 1 },
            { id: 3, order: 1, parentId: 1 }
        ],
        type: [Object],
    }),
    (0, class_validator_1.IsArray)({ message: 'Items must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one menu item is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MenuItemOrderDto),
    __metadata("design:type", Array)
], MenuReorderDto.prototype, "items", void 0);
class MenuItemOrderDto {
}
exports.MenuItemOrderDto = MenuItemOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'ID must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MenuItemOrderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New order position',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Order must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MenuItemOrderDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent menu item ID (null for root items)',
        example: null,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MenuItemOrderDto.prototype, "parentId", void 0);
//# sourceMappingURL=create-menu-item.dto.js.map