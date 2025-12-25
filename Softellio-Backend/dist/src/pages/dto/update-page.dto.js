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
exports.UpdatePageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_page_dto_1 = require("./create-page.dto");
class UpdatePageDto extends (0, swagger_1.PartialType)(create_page_dto_1.CreatePageDto) {
}
exports.UpdatePageDto = UpdatePageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page status to update to',
        enum: create_page_dto_1.PageStatus,
        required: false,
        example: create_page_dto_1.PageStatus.PUBLISHED,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [create_page_dto_1.PageTranslationDto],
        description: 'Page translations to update or add (if provided, must have at least one translation)',
        required: false,
        minItems: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, {
        message: 'If translations are provided, at least one translation is required'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_page_dto_1.PageTranslationDto),
    __metadata("design:type", Array)
], UpdatePageDto.prototype, "translations", void 0);
//# sourceMappingURL=update-page.dto.js.map