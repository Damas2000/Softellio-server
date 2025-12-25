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
exports.UserActivityQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UserActivityQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 50;
    }
}
exports.UserActivityQueryDto = UserActivityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter activities after this date',
        example: '2023-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserActivityQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter activities before this date',
        example: '2023-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserActivityQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserActivityQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Number of items per page',
        example: 50,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserActivityQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter activities by action type',
        example: 'login',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserActivityQueryDto.prototype, "action", void 0);
//# sourceMappingURL=user-activity.dto.js.map