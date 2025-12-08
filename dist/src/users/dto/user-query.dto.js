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
exports.ResetPasswordDto = exports.ChangePasswordDto = exports.UserInviteDto = exports.BulkUserOperationDto = exports.UserQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_2 = require("class-transformer");
const client_1 = require("@prisma/client");
class UserQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Search users by name or email',
        example: 'john@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: client_1.Role,
        description: 'Filter by user role',
        example: client_1.Role.TENANT_ADMIN,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter by active status',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], UserQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter by tenant ID',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_2.Type)(() => Number),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter users created after this date',
        example: '2023-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "createdAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Filter users created before this date',
        example: '2023-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "createdBefore", void 0);
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
    (0, class_transformer_2.Type)(() => Number),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Number of items per page',
        example: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_2.Type)(() => Number),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Sort field',
        example: 'createdAt',
        enum: ['createdAt', 'email', 'name', 'role'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Sort direction',
        example: 'desc',
        enum: ['asc', 'desc'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortOrder", void 0);
class BulkUserOperationDto {
}
exports.BulkUserOperationDto = BulkUserOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of user IDs to operate on',
        example: [1, 2, 3],
    }),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkUserOperationDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operation to perform',
        enum: ['activate', 'deactivate', 'delete', 'change_role'],
        example: 'activate',
    }),
    (0, class_validator_1.IsEnum)(['activate', 'deactivate', 'delete', 'change_role']),
    __metadata("design:type", String)
], BulkUserOperationDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New role for change_role operation',
        enum: client_1.Role,
        required: false,
        example: client_1.Role.EDITOR,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], BulkUserOperationDto.prototype, "newRole", void 0);
class UserInviteDto {
}
exports.UserInviteDto = UserInviteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address to invite',
        example: 'newuser@example.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_2.Type)(() => String),
    __metadata("design:type", String)
], UserInviteDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User role for the invite',
        enum: client_1.Role,
        example: client_1.Role.EDITOR,
    }),
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], UserInviteDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User name',
        example: 'John Doe',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInviteDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom invitation message',
        required: false,
        example: 'Welcome to our CMS!',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInviteDto.prototype, "customMessage", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current password',
        example: 'oldPassword123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password',
        example: 'newPassword123!',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value.toString().length >= 6 ? value : undefined),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reset token from email',
        example: 'reset_token_123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password',
        example: 'newPassword123!',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value.toString().length >= 6 ? value : undefined),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=user-query.dto.js.map