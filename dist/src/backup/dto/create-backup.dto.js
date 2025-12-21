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
exports.CreateSystemBackupDto = exports.CreateDatabaseBackupDto = exports.CompressionType = exports.SystemBackupType = exports.BackupType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var BackupType;
(function (BackupType) {
    BackupType["FULL"] = "full";
    BackupType["INCREMENTAL"] = "incremental";
    BackupType["DIFFERENTIAL"] = "differential";
    BackupType["SCHEMA_ONLY"] = "schema_only";
    BackupType["DATA_ONLY"] = "data_only";
})(BackupType || (exports.BackupType = BackupType = {}));
var SystemBackupType;
(function (SystemBackupType) {
    SystemBackupType["FULL"] = "full";
    SystemBackupType["INCREMENTAL"] = "incremental";
    SystemBackupType["FILES_ONLY"] = "files_only";
    SystemBackupType["CONFIG_ONLY"] = "config_only";
    SystemBackupType["MEDIA_ONLY"] = "media_only";
})(SystemBackupType || (exports.SystemBackupType = SystemBackupType = {}));
var CompressionType;
(function (CompressionType) {
    CompressionType["GZIP"] = "gzip";
    CompressionType["LZ4"] = "lz4";
    CompressionType["ZSTD"] = "zstd";
    CompressionType["NONE"] = "none";
})(CompressionType || (exports.CompressionType = CompressionType = {}));
class CreateDatabaseBackupDto {
}
exports.CreateDatabaseBackupDto = CreateDatabaseBackupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable backup name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDatabaseBackupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Backup description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDatabaseBackupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BackupType, description: 'Type of database backup' }),
    (0, class_validator_1.IsEnum)(BackupType),
    __metadata("design:type", String)
], CreateDatabaseBackupDto.prototype, "backupType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CompressionType, description: 'Compression type', default: CompressionType.GZIP }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CompressionType),
    __metadata("design:type", String)
], CreateDatabaseBackupDto.prototype, "compressionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Days to keep backup', minimum: 1, maximum: 365 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], CreateDatabaseBackupDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDatabaseBackupDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether backup is automatically generated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDatabaseBackupDto.prototype, "isAutomatic", void 0);
class CreateSystemBackupDto {
}
exports.CreateSystemBackupDto = CreateSystemBackupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable backup name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemBackupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Backup description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemBackupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SystemBackupType, description: 'Type of system backup' }),
    (0, class_validator_1.IsEnum)(SystemBackupType),
    __metadata("design:type", String)
], CreateSystemBackupDto.prototype, "backupType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include database in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "includeDatabase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include files in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "includeFiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include configuration in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "includeConfig", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include media files in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "includeMedia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include logs in backup', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "includeLogs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Days to keep backup', minimum: 1, maximum: 90 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateSystemBackupDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSystemBackupDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether backup is automatically generated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemBackupDto.prototype, "isAutomatic", void 0);
//# sourceMappingURL=create-backup.dto.js.map