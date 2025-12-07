import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  IsEmail,
  IsUrl,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsInt,
  IsDate,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LogLevel,
  MetricType,
  AlertSeverity,
  HealthStatus,
  AlertStatus,
  NotificationChannel,
} from '../interfaces/monitoring.interfaces';

// ===== LOG MANAGEMENT DTOs =====

export class CreateLogEntryDto {
  @ApiProperty({ enum: LogLevel, description: 'Log level' })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({ description: 'Log message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Context or module name' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Request ID for tracing' })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Duration in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'HTTP status code' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  statusCode?: number;

  @ApiPropertyOptional({ description: 'HTTP method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'Request URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Error stack trace' })
  @IsOptional()
  @IsString()
  stack?: string;

  @ApiPropertyOptional({ description: 'Error object' })
  @IsOptional()
  error?: any;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class LogQueryDto {
  @ApiPropertyOptional({
    enum: LogLevel,
    isArray: true,
    description: 'Filter by log levels'
  })
  @IsOptional()
  @IsArray()
  @IsEnum(LogLevel, { each: true })
  levels?: LogLevel[];

  @ApiPropertyOptional({ description: 'Start time for filtering' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time for filtering' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Filter by context' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ description: 'Search in message content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['timestamp', 'level', 'message']
  })
  @IsOptional()
  @IsString()
  sortBy?: 'timestamp' | 'level' | 'message';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// ===== METRICS DTOs =====

export class CreateMetricDto {
  @ApiProperty({ description: 'Metric name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MetricType, description: 'Metric type' })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Labels for categorization' })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Source of the metric' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Metric description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class MetricQueryDto {
  @ApiPropertyOptional({ description: 'Metric names to query', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  names?: string[];

  @ApiPropertyOptional({ description: 'Start time for filtering' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time for filtering' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Labels for filtering' })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Aggregation function',
    enum: ['avg', 'sum', 'min', 'max', 'count']
  })
  @IsOptional()
  @IsEnum(['avg', 'sum', 'min', 'max', 'count'])
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';

  @ApiPropertyOptional({ description: 'Aggregation interval in seconds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  interval?: number;

  @ApiPropertyOptional({ description: 'Maximum number of data points' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  limit?: number;
}

// ===== ALERT MANAGEMENT DTOs =====

export class CreateAlertRuleDto {
  @ApiProperty({ description: 'Alert rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Alert rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Metric to monitor' })
  @IsString()
  metric: string;

  @ApiProperty({
    description: 'Condition operator',
    enum: ['gt', 'lt', 'eq', 'ne', 'gte', 'lte']
  })
  @IsEnum(['gt', 'lt', 'eq', 'ne', 'gte', 'lte'])
  condition: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';

  @ApiProperty({ description: 'Threshold value' })
  @IsNumber()
  threshold: number;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity' })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiPropertyOptional({ description: 'Duration in seconds condition must persist' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Cooldown period in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown?: number;

  @ApiProperty({
    enum: NotificationChannel,
    isArray: true,
    description: 'Notification channels'
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @ArrayMinSize(1)
  notificationChannels: NotificationChannel[];

  @ApiProperty({ description: 'Notification recipients', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  recipients: string[];

  @ApiPropertyOptional({ description: 'Labels for categorization' })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Annotations for additional context' })
  @IsOptional()
  @IsObject()
  annotations?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Runbook URL for troubleshooting' })
  @IsOptional()
  @IsUrl()
  runbook?: string;

  @ApiPropertyOptional({ description: 'Enable/disable rule', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}

export class UpdateAlertRuleDto {
  @ApiPropertyOptional({ description: 'Alert rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Alert rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Metric to monitor' })
  @IsOptional()
  @IsString()
  metric?: string;

  @ApiPropertyOptional({
    description: 'Condition operator',
    enum: ['gt', 'lt', 'eq', 'ne', 'gte', 'lte']
  })
  @IsOptional()
  @IsEnum(['gt', 'lt', 'eq', 'ne', 'gte', 'lte'])
  condition?: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';

  @ApiPropertyOptional({ description: 'Threshold value' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Alert severity' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({ description: 'Duration in seconds condition must persist' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Cooldown period in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown?: number;

  @ApiPropertyOptional({
    enum: NotificationChannel,
    isArray: true,
    description: 'Notification channels'
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Notification recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Labels for categorization' })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Annotations for additional context' })
  @IsOptional()
  @IsObject()
  annotations?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Runbook URL for troubleshooting' })
  @IsOptional()
  @IsUrl()
  runbook?: string;

  @ApiPropertyOptional({ description: 'Enable/disable rule' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class AlertQueryDto {
  @ApiPropertyOptional({
    enum: AlertStatus,
    isArray: true,
    description: 'Filter by alert status'
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AlertStatus, { each: true })
  status?: AlertStatus[];

  @ApiPropertyOptional({
    enum: AlertSeverity,
    isArray: true,
    description: 'Filter by alert severity'
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AlertSeverity, { each: true })
  severity?: AlertSeverity[];

  @ApiPropertyOptional({ description: 'Start time for filtering' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time for filtering' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Filter by metric name' })
  @IsOptional()
  @IsString()
  metric?: string;

  @ApiPropertyOptional({ description: 'Search in alert message' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}

export class AcknowledgeAlertDto {
  @ApiPropertyOptional({ description: 'Acknowledgment note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ResolveAlertDto {
  @ApiPropertyOptional({ description: 'Resolution note' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ===== HEALTH CHECK DTOs =====

export class CreateHealthCheckDto {
  @ApiProperty({ description: 'Health check name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Service URL to check' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Expected HTTP status code' })
  @IsOptional()
  @IsInt()
  @Min(200)
  @Max(599)
  expectedStatus?: number;

  @ApiPropertyOptional({ description: 'Timeout in milliseconds' })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(30000)
  timeout?: number;

  @ApiPropertyOptional({ description: 'Check interval in seconds' })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(3600)
  interval?: number;

  @ApiPropertyOptional({ description: 'Number of retries on failure' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  retries?: number;

  @ApiPropertyOptional({ description: 'Custom headers for HTTP check' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Enable/disable health check', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}

// ===== NOTIFICATION DTOs =====

export class CreateNotificationTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: NotificationChannel, description: 'Notification channel' })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Message subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message body template' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Available template variables', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ description: 'Set as default template', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

export class SendTestNotificationDto {
  @ApiProperty({ enum: NotificationChannel, description: 'Notification channel' })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Recipient' })
  @IsString()
  recipient: string;

  @ApiProperty({ description: 'Test message subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Test message body' })
  @IsString()
  message: string;
}

// ===== MAINTENANCE WINDOW DTOs =====

export class CreateMaintenanceWindowDto {
  @ApiProperty({ description: 'Maintenance window name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Maintenance window description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Affected services', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Silence alerts during maintenance', default: true })
  @IsOptional()
  @IsBoolean()
  silenceAlerts?: boolean = true;

  @ApiPropertyOptional({ description: 'Disable notifications during maintenance', default: true })
  @IsOptional()
  @IsBoolean()
  disableNotifications?: boolean = true;
}

// ===== CONFIGURATION DTOs =====

export class MonitoringConfigurationDto {
  @ApiProperty({ description: 'Enable monitoring system' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Logging configuration' })
  @ValidateNested()
  @Type(() => LoggingConfigDto)
  logging: LoggingConfigDto;

  @ApiProperty({ description: 'Metrics configuration' })
  @ValidateNested()
  @Type(() => MetricsConfigDto)
  metrics: MetricsConfigDto;

  @ApiProperty({ description: 'Health checks configuration' })
  @ValidateNested()
  @Type(() => HealthChecksConfigDto)
  healthChecks: HealthChecksConfigDto;

  @ApiProperty({ description: 'Alerting configuration' })
  @ValidateNested()
  @Type(() => AlertingConfigDto)
  alerting: AlertingConfigDto;

  @ApiProperty({ description: 'Real-time monitoring configuration' })
  @ValidateNested()
  @Type(() => RealtimeConfigDto)
  realtime: RealtimeConfigDto;
}

export class LoggingConfigDto {
  @ApiProperty({ description: 'Enable logging' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ enum: LogLevel, description: 'Minimum log level' })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({ description: 'Enable console logging' })
  @IsBoolean()
  enableConsole: boolean;

  @ApiProperty({ description: 'Enable file logging' })
  @IsBoolean()
  enableFile: boolean;

  @ApiProperty({ description: 'Enable database logging' })
  @IsBoolean()
  enableDatabase: boolean;

  @ApiPropertyOptional({ description: 'Log file path' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiProperty({ description: 'Maximum file size in MB' })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxFileSize: number;

  @ApiProperty({ description: 'Maximum number of log files' })
  @IsInt()
  @Min(1)
  @Max(100)
  maxFiles: number;

  @ApiProperty({ description: 'Enable log rotation' })
  @IsBoolean()
  enableRotation: boolean;

  @ApiProperty({ description: 'Log retention in days' })
  @IsInt()
  @Min(1)
  @Max(365)
  retentionDays: number;
}

export class MetricsConfigDto {
  @ApiProperty({ description: 'Enable metrics collection' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Collection interval in seconds' })
  @IsInt()
  @Min(1)
  @Max(3600)
  collectionInterval: number;

  @ApiProperty({ description: 'Metrics retention in days' })
  @IsInt()
  @Min(1)
  @Max(365)
  retentionDays: number;

  @ApiProperty({ description: 'Enable system metrics' })
  @IsBoolean()
  enableSystemMetrics: boolean;

  @ApiProperty({ description: 'Enable application metrics' })
  @IsBoolean()
  enableApplicationMetrics: boolean;

  @ApiProperty({ description: 'Enable database metrics' })
  @IsBoolean()
  enableDatabaseMetrics: boolean;

  @ApiProperty({ description: 'Enable custom metrics' })
  @IsBoolean()
  customMetrics: boolean;
}

export class HealthChecksConfigDto {
  @ApiProperty({ description: 'Enable health checks' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Check interval in seconds' })
  @IsInt()
  @Min(10)
  @Max(3600)
  interval: number;

  @ApiProperty({ description: 'Check timeout in seconds' })
  @IsInt()
  @Min(1)
  @Max(300)
  timeout: number;

  @ApiProperty({ description: 'Number of retries on failure' })
  @IsInt()
  @Min(0)
  @Max(10)
  retries: number;

  @ApiProperty({ description: 'Services to check', type: [String] })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}

export class AlertingConfigDto {
  @ApiProperty({ description: 'Enable alerting' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Alert check interval in seconds' })
  @IsInt()
  @Min(10)
  @Max(3600)
  checkInterval: number;

  @ApiProperty({ description: 'Default cooldown in seconds' })
  @IsInt()
  @Min(60)
  @Max(86400)
  defaultCooldown: number;

  @ApiProperty({ description: 'Maximum alerts per hour' })
  @IsInt()
  @Min(1)
  @Max(1000)
  maxAlertsPerHour: number;

  @ApiProperty({ description: 'Enable email notifications' })
  @IsBoolean()
  enableEmailNotifications: boolean;

  @ApiProperty({ description: 'Enable webhook notifications' })
  @IsBoolean()
  enableWebhookNotifications: boolean;
}

export class RealtimeConfigDto {
  @ApiProperty({ description: 'Enable real-time monitoring' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'WebSocket port' })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(65535)
  websocketPort?: number;

  @ApiProperty({ description: 'Update interval in milliseconds' })
  @IsInt()
  @Min(100)
  @Max(60000)
  updateInterval: number;

  @ApiProperty({ description: 'Enable broadcast to all clients' })
  @IsBoolean()
  enableBroadcast: boolean;
}