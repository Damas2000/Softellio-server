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
exports.BulkOperationResultDto = exports.BulkPageOperationDto = exports.BulkPageStatusUpdateDto = exports.BulkPageDeleteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_page_dto_1 = require("./create-page.dto");
class BulkPageDeleteDto {
}
exports.BulkPageDeleteDto = BulkPageDeleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of page IDs to delete',
        example: [1, 2, 3],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)({ message: 'IDs must be an array' }),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'At least one page ID is required' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(v => typeof v === 'string' ? parseInt(v, 10) : v);
        }
        return value;
    }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each ID must be a valid integer' }),
    __metadata("design:type", Array)
], BulkPageDeleteDto.prototype, "ids", void 0);
class BulkPageStatusUpdateDto {
}
exports.BulkPageStatusUpdateDto = BulkPageStatusUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of page IDs to update',
        example: [1, 2, 3],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)({ message: 'IDs must be an array' }),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'At least one page ID is required' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(v => typeof v === 'string' ? parseInt(v, 10) : v);
        }
        return value;
    }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each ID must be a valid integer' }),
    __metadata("design:type", Array)
], BulkPageStatusUpdateDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status to apply to all specified pages',
        enum: create_page_dto_1.PageStatus,
        example: create_page_dto_1.PageStatus.PUBLISHED,
    }),
    (0, class_validator_1.IsEnum)(create_page_dto_1.PageStatus, { message: 'Status must be a valid page status' }),
    __metadata("design:type", String)
], BulkPageStatusUpdateDto.prototype, "status", void 0);
class BulkPageOperationDto {
}
exports.BulkPageOperationDto = BulkPageOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of page IDs to operate on',
        example: [1, 2, 3],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)({ message: 'IDs must be an array' }),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'At least one page ID is required' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(v => typeof v === 'string' ? parseInt(v, 10) : v);
        }
        return value;
    }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each ID must be a valid integer' }),
    __metadata("design:type", Array)
], BulkPageOperationDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operation to perform',
        enum: ['delete', 'publish', 'draft', 'archive'],
        example: 'publish',
    }),
    (0, class_validator_1.IsEnum)(['delete', 'publish', 'draft', 'archive'], {
        message: 'Operation must be one of: delete, publish, draft, archive',
    }),
    __metadata("design:type", String)
], BulkPageOperationDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status (for status change operations)',
        enum: create_page_dto_1.PageStatus,
        required: false,
        example: create_page_dto_1.PageStatus.PUBLISHED,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(create_page_dto_1.PageStatus),
    __metadata("design:type", String)
], BulkPageOperationDto.prototype, "newStatus", void 0);
class BulkOperationResultDto {
}
exports.BulkOperationResultDto = BulkOperationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pages successfully processed',
        example: 3,
    }),
    __metadata("design:type", Number)
], BulkOperationResultDto.prototype, "processed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pages that failed to process',
        example: 0,
    }),
    __metadata("design:type", Number)
], BulkOperationResultDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of page IDs that were successfully processed',
        type: [Number],
        example: [1, 2, 3],
    }),
    __metadata("design:type", Array)
], BulkOperationResultDto.prototype, "successIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of page IDs that failed to process with error messages',
        type: [Object],
        example: [{ id: 4, error: 'Page not found' }],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BulkOperationResultDto.prototype, "failedIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operation that was performed',
        example: 'publish',
    }),
    __metadata("design:type", String)
], BulkOperationResultDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Bulk operation completed successfully',
    }),
    __metadata("design:type", String)
], BulkOperationResultDto.prototype, "message", void 0);
//# sourceMappingURL=bulk-page-operation.dto.js.map