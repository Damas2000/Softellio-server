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
exports.SystemUpdateResponse = exports.UpdateSystemUpdateDto = exports.CreateSystemUpdateDto = exports.UpdateType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var UpdateType;
(function (UpdateType) {
    UpdateType["PATCH"] = "patch";
    UpdateType["MINOR"] = "minor";
    UpdateType["MAJOR"] = "major";
    UpdateType["SECURITY"] = "security";
    UpdateType["HOTFIX"] = "hotfix";
})(UpdateType || (exports.UpdateType = UpdateType = {}));
class CreateSystemUpdateDto {
}
exports.CreateSystemUpdateDto = CreateSystemUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update name/title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Update description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: UpdateType, description: 'Type of update' }),
    (0, class_validator_1.IsEnum)(UpdateType),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "updateType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target version to update to' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current system version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "currentVersion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL to download update package' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "packageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Package size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSystemUpdateDto.prototype, "packageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Package integrity checksum' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "packageChecksum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Release notes or changelog' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "releaseNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'System requirements for update' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSystemUpdateDto.prototype, "requirements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dependencies that need to be updated' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSystemUpdateDto.prototype, "dependencies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Known conflicts or issues' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSystemUpdateDto.prototype, "conflicts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Automatically create backup before update', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemUpdateDto.prototype, "autoBackup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When update is scheduled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSystemUpdateDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether rollback is possible', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemUpdateDto.prototype, "canRollback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify when update completes', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemUpdateDto.prototype, "notifyOnComplete", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify if update fails', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemUpdateDto.prototype, "notifyOnFailure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email addresses for notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSystemUpdateDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSystemUpdateDto.prototype, "tags", void 0);
class UpdateSystemUpdateDto {
}
exports.UpdateSystemUpdateDto = UpdateSystemUpdateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Update name/title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemUpdateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Update description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemUpdateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When update is scheduled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSystemUpdateDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether rollback is possible' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSystemUpdateDto.prototype, "canRollback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify when update completes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSystemUpdateDto.prototype, "notifyOnComplete", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify if update fails' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSystemUpdateDto.prototype, "notifyOnFailure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email addresses for notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateSystemUpdateDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateSystemUpdateDto.prototype, "tags", void 0);
class SystemUpdateResponse {
}
exports.SystemUpdateResponse = SystemUpdateResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update operation ID' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update name' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target version' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update type' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "updateType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status of the update' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current progress percentage (0-100)' }),
    __metadata("design:type", Number)
], SystemUpdateResponse.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current phase of update operation' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "currentPhase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if update failed' }),
    __metadata("design:type", String)
], SystemUpdateResponse.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When update was created' }),
    __metadata("design:type", Date)
], SystemUpdateResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When update was started' }),
    __metadata("design:type", Date)
], SystemUpdateResponse.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When update was completed' }),
    __metadata("design:type", Date)
], SystemUpdateResponse.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When update was scheduled' }),
    __metadata("design:type", Date)
], SystemUpdateResponse.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether rollback is possible' }),
    __metadata("design:type", Boolean)
], SystemUpdateResponse.prototype, "canRollback", void 0);
//# sourceMappingURL=system-update.dto.js.map