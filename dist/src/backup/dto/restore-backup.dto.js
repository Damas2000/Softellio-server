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
exports.RestoreOperationResponse = exports.CreateRestoreOperationDto = exports.RestoreBackupType = exports.RestoreType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RestoreType;
(function (RestoreType) {
    RestoreType["FULL"] = "full";
    RestoreType["PARTIAL"] = "partial";
    RestoreType["SELECTIVE"] = "selective";
})(RestoreType || (exports.RestoreType = RestoreType = {}));
var RestoreBackupType;
(function (RestoreBackupType) {
    RestoreBackupType["DATABASE"] = "database";
    RestoreBackupType["SYSTEM"] = "system";
    RestoreBackupType["FILES"] = "files";
    RestoreBackupType["CONFIG"] = "config";
})(RestoreBackupType || (exports.RestoreBackupType = RestoreBackupType = {}));
class CreateRestoreOperationDto {
}
exports.CreateRestoreOperationDto = CreateRestoreOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the backup to restore' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRestoreOperationDto.prototype, "backupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RestoreBackupType, description: 'Type of backup to restore' }),
    (0, class_validator_1.IsEnum)(RestoreBackupType),
    __metadata("design:type", String)
], CreateRestoreOperationDto.prototype, "backupType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RestoreType, description: 'Type of restore operation' }),
    (0, class_validator_1.IsEnum)(RestoreType),
    __metadata("design:type", String)
], CreateRestoreOperationDto.prototype, "restoreType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target restore location (if different from original)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRestoreOperationDto.prototype, "targetLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Restore database components', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRestoreOperationDto.prototype, "restoreDatabase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Restore files', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRestoreOperationDto.prototype, "restoreFiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Restore configuration', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRestoreOperationDto.prototype, "restoreConfig", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Restore media files', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRestoreOperationDto.prototype, "restoreMedia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for restore operation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRestoreOperationDto.prototype, "reason", void 0);
class RestoreOperationResponse {
}
exports.RestoreOperationResponse = RestoreOperationResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restore operation ID' }),
    __metadata("design:type", String)
], RestoreOperationResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status of the restore' }),
    __metadata("design:type", String)
], RestoreOperationResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current progress percentage (0-100)' }),
    __metadata("design:type", Number)
], RestoreOperationResponse.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current phase of restore operation' }),
    __metadata("design:type", String)
], RestoreOperationResponse.prototype, "currentPhase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if restore failed' }),
    __metadata("design:type", String)
], RestoreOperationResponse.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When restore was started' }),
    __metadata("design:type", Date)
], RestoreOperationResponse.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When restore was completed' }),
    __metadata("design:type", Date)
], RestoreOperationResponse.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration of restore in seconds' }),
    __metadata("design:type", Number)
], RestoreOperationResponse.prototype, "duration", void 0);
//# sourceMappingURL=restore-backup.dto.js.map