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
exports.RealtimeConfigDto = exports.AlertingConfigDto = exports.HealthChecksConfigDto = exports.MetricsConfigDto = exports.LoggingConfigDto = exports.MonitoringConfigurationDto = exports.CreateMaintenanceWindowDto = exports.SendTestNotificationDto = exports.CreateNotificationTemplateDto = exports.CreateHealthCheckDto = exports.ResolveAlertDto = exports.AcknowledgeAlertDto = exports.AlertQueryDto = exports.UpdateAlertRuleDto = exports.CreateAlertRuleDto = exports.MetricQueryDto = exports.CreateMetricDto = exports.LogQueryDto = exports.CreateLogEntryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const monitoring_interfaces_1 = require("../interfaces/monitoring.interfaces");
class CreateLogEntryDto {
}
exports.CreateLogEntryDto = CreateLogEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.LogLevel, description: 'Log level' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.LogLevel),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Log message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Context or module name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateLogEntryDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Request ID for tracing' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IP address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User agent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration in milliseconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLogEntryDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'HTTP status code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(599),
    __metadata("design:type", Number)
], CreateLogEntryDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'HTTP method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Request URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error stack trace' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogEntryDto.prototype, "stack", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error object' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLogEntryDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for categorization', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateLogEntryDto.prototype, "tags", void 0);
class LogQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 50;
    }
}
exports.LogQueryDto = LogQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: monitoring_interfaces_1.LogLevel,
        isArray: true,
        description: 'Filter by log levels'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.LogLevel, { each: true }),
    __metadata("design:type", Array)
], LogQueryDto.prototype, "levels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LogQueryDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LogQueryDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by context' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LogQueryDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search in message content' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LogQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by tags', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], LogQueryDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LogQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], LogQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort by field',
        enum: ['timestamp', 'level', 'message']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LogQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort direction',
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], LogQueryDto.prototype, "sortOrder", void 0);
class CreateMetricDto {
}
exports.CreateMetricDto = CreateMetricDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metric name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMetricDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.MetricType, description: 'Metric type' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.MetricType),
    __metadata("design:type", String)
], CreateMetricDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metric value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMetricDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit of measurement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMetricDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labels for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMetricDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source of the metric' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMetricDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metric description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMetricDto.prototype, "description", void 0);
class MetricQueryDto {
}
exports.MetricQueryDto = MetricQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metric names to query', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MetricQueryDto.prototype, "names", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MetricQueryDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MetricQueryDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labels for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], MetricQueryDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Aggregation function',
        enum: ['avg', 'sum', 'min', 'max', 'count']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['avg', 'sum', 'min', 'max', 'count']),
    __metadata("design:type", String)
], MetricQueryDto.prototype, "aggregation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Aggregation interval in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MetricQueryDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of data points' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], MetricQueryDto.prototype, "limit", void 0);
class CreateAlertRuleDto {
    constructor() {
        this.enabled = true;
    }
}
exports.CreateAlertRuleDto = CreateAlertRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert rule name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert rule description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metric to monitor' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "metric", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Condition operator',
        enum: ['gt', 'lt', 'eq', 'ne', 'gte', 'lte']
    }),
    (0, class_validator_1.IsEnum)(['gt', 'lt', 'eq', 'ne', 'gte', 'lte']),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAlertRuleDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.AlertSeverity, description: 'Alert severity' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.AlertSeverity),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration in seconds condition must persist' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAlertRuleDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cooldown period in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAlertRuleDto.prototype, "cooldown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: monitoring_interfaces_1.NotificationChannel,
        isArray: true,
        description: 'Notification channels'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.NotificationChannel, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateAlertRuleDto.prototype, "notificationChannels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification recipients', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateAlertRuleDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labels for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAlertRuleDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Annotations for additional context' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAlertRuleDto.prototype, "annotations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Runbook URL for troubleshooting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateAlertRuleDto.prototype, "runbook", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable/disable rule', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAlertRuleDto.prototype, "enabled", void 0);
class UpdateAlertRuleDto {
}
exports.UpdateAlertRuleDto = UpdateAlertRuleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert rule name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert rule description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metric to monitor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "metric", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Condition operator',
        enum: ['gt', 'lt', 'eq', 'ne', 'gte', 'lte']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['gt', 'lt', 'eq', 'ne', 'gte', 'lte']),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Threshold value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAlertRuleDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: monitoring_interfaces_1.AlertSeverity, description: 'Alert severity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.AlertSeverity),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duration in seconds condition must persist' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAlertRuleDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cooldown period in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAlertRuleDto.prototype, "cooldown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: monitoring_interfaces_1.NotificationChannel,
        isArray: true,
        description: 'Notification channels'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.NotificationChannel, { each: true }),
    __metadata("design:type", Array)
], UpdateAlertRuleDto.prototype, "notificationChannels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notification recipients', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateAlertRuleDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labels for categorization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAlertRuleDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Annotations for additional context' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAlertRuleDto.prototype, "annotations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Runbook URL for troubleshooting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateAlertRuleDto.prototype, "runbook", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable/disable rule' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAlertRuleDto.prototype, "enabled", void 0);
class AlertQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 50;
    }
}
exports.AlertQueryDto = AlertQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: monitoring_interfaces_1.AlertStatus,
        isArray: true,
        description: 'Filter by alert status'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.AlertStatus, { each: true }),
    __metadata("design:type", Array)
], AlertQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: monitoring_interfaces_1.AlertSeverity,
        isArray: true,
        description: 'Filter by alert severity'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.AlertSeverity, { each: true }),
    __metadata("design:type", Array)
], AlertQueryDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End time for filtering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by metric name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "metric", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search in alert message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AlertQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], AlertQueryDto.prototype, "limit", void 0);
class AcknowledgeAlertDto {
}
exports.AcknowledgeAlertDto = AcknowledgeAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Acknowledgment note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcknowledgeAlertDto.prototype, "note", void 0);
class ResolveAlertDto {
}
exports.ResolveAlertDto = ResolveAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Resolution note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveAlertDto.prototype, "note", void 0);
class CreateHealthCheckDto {
    constructor() {
        this.enabled = true;
    }
}
exports.CreateHealthCheckDto = CreateHealthCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Health check name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHealthCheckDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service URL to check' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateHealthCheckDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expected HTTP status code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(599),
    __metadata("design:type", Number)
], CreateHealthCheckDto.prototype, "expectedStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout in milliseconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(30000),
    __metadata("design:type", Number)
], CreateHealthCheckDto.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check interval in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(3600),
    __metadata("design:type", Number)
], CreateHealthCheckDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of retries on failure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateHealthCheckDto.prototype, "retries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom headers for HTTP check' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateHealthCheckDto.prototype, "headers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable/disable health check', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHealthCheckDto.prototype, "enabled", void 0);
class CreateNotificationTemplateDto {
    constructor() {
        this.isDefault = false;
    }
}
exports.CreateNotificationTemplateDto = CreateNotificationTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.NotificationChannel, description: 'Notification channel' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.NotificationChannel),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message subject' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message body template' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Available template variables', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNotificationTemplateDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default template', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNotificationTemplateDto.prototype, "isDefault", void 0);
class SendTestNotificationDto {
}
exports.SendTestNotificationDto = SendTestNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.NotificationChannel, description: 'Notification channel' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.NotificationChannel),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "recipient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test message subject' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test message body' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "message", void 0);
class CreateMaintenanceWindowDto {
    constructor() {
        this.silenceAlerts = true;
        this.disableNotifications = true;
    }
}
exports.CreateMaintenanceWindowDto = CreateMaintenanceWindowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maintenance window name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceWindowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maintenance window description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceWindowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceWindowDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceWindowDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Affected services', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMaintenanceWindowDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Silence alerts during maintenance', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMaintenanceWindowDto.prototype, "silenceAlerts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Disable notifications during maintenance', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMaintenanceWindowDto.prototype, "disableNotifications", void 0);
class MonitoringConfigurationDto {
}
exports.MonitoringConfigurationDto = MonitoringConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable monitoring system' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MonitoringConfigurationDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Logging configuration' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoggingConfigDto),
    __metadata("design:type", LoggingConfigDto)
], MonitoringConfigurationDto.prototype, "logging", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metrics configuration' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetricsConfigDto),
    __metadata("design:type", MetricsConfigDto)
], MonitoringConfigurationDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Health checks configuration' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => HealthChecksConfigDto),
    __metadata("design:type", HealthChecksConfigDto)
], MonitoringConfigurationDto.prototype, "healthChecks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alerting configuration' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AlertingConfigDto),
    __metadata("design:type", AlertingConfigDto)
], MonitoringConfigurationDto.prototype, "alerting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Real-time monitoring configuration' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RealtimeConfigDto),
    __metadata("design:type", RealtimeConfigDto)
], MonitoringConfigurationDto.prototype, "realtime", void 0);
class LoggingConfigDto {
}
exports.LoggingConfigDto = LoggingConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable logging' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: monitoring_interfaces_1.LogLevel, description: 'Minimum log level' }),
    (0, class_validator_1.IsEnum)(monitoring_interfaces_1.LogLevel),
    __metadata("design:type", String)
], LoggingConfigDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable console logging' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingConfigDto.prototype, "enableConsole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable file logging' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingConfigDto.prototype, "enableFile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable database logging' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingConfigDto.prototype, "enableDatabase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Log file path' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoggingConfigDto.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum file size in MB' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], LoggingConfigDto.prototype, "maxFileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum number of log files' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoggingConfigDto.prototype, "maxFiles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable log rotation' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingConfigDto.prototype, "enableRotation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Log retention in days' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], LoggingConfigDto.prototype, "retentionDays", void 0);
class MetricsConfigDto {
}
exports.MetricsConfigDto = MetricsConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable metrics collection' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricsConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collection interval in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3600),
    __metadata("design:type", Number)
], MetricsConfigDto.prototype, "collectionInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metrics retention in days' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], MetricsConfigDto.prototype, "retentionDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable system metrics' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricsConfigDto.prototype, "enableSystemMetrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable application metrics' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricsConfigDto.prototype, "enableApplicationMetrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable database metrics' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricsConfigDto.prototype, "enableDatabaseMetrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable custom metrics' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricsConfigDto.prototype, "customMetrics", void 0);
class HealthChecksConfigDto {
}
exports.HealthChecksConfigDto = HealthChecksConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable health checks' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HealthChecksConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check interval in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(3600),
    __metadata("design:type", Number)
], HealthChecksConfigDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check timeout in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], HealthChecksConfigDto.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of retries on failure' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], HealthChecksConfigDto.prototype, "retries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Services to check', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], HealthChecksConfigDto.prototype, "services", void 0);
class AlertingConfigDto {
}
exports.AlertingConfigDto = AlertingConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable alerting' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertingConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert check interval in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(3600),
    __metadata("design:type", Number)
], AlertingConfigDto.prototype, "checkInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default cooldown in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(60),
    (0, class_validator_1.Max)(86400),
    __metadata("design:type", Number)
], AlertingConfigDto.prototype, "defaultCooldown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum alerts per hour' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], AlertingConfigDto.prototype, "maxAlertsPerHour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable email notifications' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertingConfigDto.prototype, "enableEmailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable webhook notifications' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertingConfigDto.prototype, "enableWebhookNotifications", void 0);
class RealtimeConfigDto {
}
exports.RealtimeConfigDto = RealtimeConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable real-time monitoring' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RealtimeConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'WebSocket port' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], RealtimeConfigDto.prototype, "websocketPort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update interval in milliseconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], RealtimeConfigDto.prototype, "updateInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable broadcast to all clients' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RealtimeConfigDto.prototype, "enableBroadcast", void 0);
//# sourceMappingURL=monitoring.dto.js.map