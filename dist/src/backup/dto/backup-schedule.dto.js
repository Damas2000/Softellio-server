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
exports.UpdateBackupScheduleDto = exports.CreateBackupScheduleDto = exports.ScheduleBackupType = exports.ScheduleType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ScheduleType;
(function (ScheduleType) {
    ScheduleType["DATABASE"] = "database";
    ScheduleType["SYSTEM"] = "system";
    ScheduleType["FILES"] = "files";
    ScheduleType["CONFIG"] = "config";
})(ScheduleType || (exports.ScheduleType = ScheduleType = {}));
var ScheduleBackupType;
(function (ScheduleBackupType) {
    ScheduleBackupType["FULL"] = "full";
    ScheduleBackupType["INCREMENTAL"] = "incremental";
    ScheduleBackupType["DIFFERENTIAL"] = "differential";
})(ScheduleBackupType || (exports.ScheduleBackupType = ScheduleBackupType = {}));
class CreateBackupScheduleDto {
}
exports.CreateBackupScheduleDto = CreateBackupScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ScheduleType, description: 'Type of backup to schedule' }),
    (0, class_validator_1.IsEnum)(ScheduleType),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "scheduleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ScheduleBackupType, description: 'Backup type for scheduled backups' }),
    (0, class_validator_1.IsEnum)(ScheduleBackupType),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "backupType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cron expression for scheduling (e.g., "0 2 * * *" for daily at 2 AM)',
        example: '0 2 * * *'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([12]?\d|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/, {
        message: 'Invalid cron expression format',
    }),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "cronExpression", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone for scheduling', default: 'UTC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable or disable schedule', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupScheduleDto.prototype, "isEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Days to keep backups', minimum: 1, maximum: 365 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], CreateBackupScheduleDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compression type for backups' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupScheduleDto.prototype, "compressionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of backups to keep', minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateBackupScheduleDto.prototype, "maxBackups", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify on successful backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupScheduleDto.prototype, "notifyOnSuccess", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify on backup failure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupScheduleDto.prototype, "notifyOnFailure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email addresses for notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBackupScheduleDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed duration in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBackupScheduleDto.prototype, "maxDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed backup size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBackupScheduleDto.prototype, "maxSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBackupScheduleDto.prototype, "tags", void 0);
class UpdateBackupScheduleDto {
}
exports.UpdateBackupScheduleDto = UpdateBackupScheduleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBackupScheduleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBackupScheduleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cron expression for scheduling',
        example: '0 2 * * *'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([12]?\d|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/, {
        message: 'Invalid cron expression format',
    }),
    __metadata("design:type", String)
], UpdateBackupScheduleDto.prototype, "cronExpression", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone for scheduling' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBackupScheduleDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable or disable schedule' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBackupScheduleDto.prototype, "isEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Days to keep backups', minimum: 1, maximum: 365 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], UpdateBackupScheduleDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of backups to keep', minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateBackupScheduleDto.prototype, "maxBackups", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify on successful backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBackupScheduleDto.prototype, "notifyOnSuccess", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notify on backup failure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBackupScheduleDto.prototype, "notifyOnFailure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email addresses for notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateBackupScheduleDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed duration in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBackupScheduleDto.prototype, "maxDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed backup size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBackupScheduleDto.prototype, "maxSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateBackupScheduleDto.prototype, "tags", void 0);
//# sourceMappingURL=backup-schedule.dto.js.map