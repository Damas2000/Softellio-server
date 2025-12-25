import { LogLevel, MetricType, AlertSeverity, AlertStatus, NotificationChannel } from '../interfaces/monitoring.interfaces';
export declare class CreateLogEntryDto {
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
    sessionId?: string;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    statusCode?: number;
    method?: string;
    url?: string;
    stack?: string;
    error?: any;
    tags?: string[];
}
export declare class LogQueryDto {
    levels?: LogLevel[];
    startTime?: string;
    endTime?: string;
    context?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'timestamp' | 'level' | 'message';
    sortOrder?: 'asc' | 'desc';
}
export declare class CreateMetricDto {
    name: string;
    type: MetricType;
    value: number;
    unit?: string;
    labels?: Record<string, string>;
    source?: string;
    description?: string;
}
export declare class MetricQueryDto {
    names?: string[];
    startTime?: string;
    endTime?: string;
    labels?: Record<string, string>;
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
    interval?: number;
    limit?: number;
}
export declare class CreateAlertRuleDto {
    name: string;
    description?: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    severity: AlertSeverity;
    duration?: number;
    cooldown?: number;
    notificationChannels: NotificationChannel[];
    recipients: string[];
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    runbook?: string;
    enabled?: boolean;
}
export declare class UpdateAlertRuleDto {
    name?: string;
    description?: string;
    metric?: string;
    condition?: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold?: number;
    severity?: AlertSeverity;
    duration?: number;
    cooldown?: number;
    notificationChannels?: NotificationChannel[];
    recipients?: string[];
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    runbook?: string;
    enabled?: boolean;
}
export declare class AlertQueryDto {
    status?: AlertStatus[];
    severity?: AlertSeverity[];
    startTime?: string;
    endTime?: string;
    metric?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class AcknowledgeAlertDto {
    note?: string;
}
export declare class ResolveAlertDto {
    note?: string;
}
export declare class CreateHealthCheckDto {
    name: string;
    url?: string;
    expectedStatus?: number;
    timeout?: number;
    interval?: number;
    retries?: number;
    headers?: Record<string, string>;
    enabled?: boolean;
}
export declare class CreateNotificationTemplateDto {
    name: string;
    channel: NotificationChannel;
    subject: string;
    body: string;
    variables?: string[];
    isDefault?: boolean;
}
export declare class SendTestNotificationDto {
    channel: NotificationChannel;
    recipient: string;
    subject: string;
    message: string;
}
export declare class CreateMaintenanceWindowDto {
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    services?: string[];
    silenceAlerts?: boolean;
    disableNotifications?: boolean;
}
export declare class LoggingConfigDto {
    enabled: boolean;
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableDatabase: boolean;
    filePath?: string;
    maxFileSize: number;
    maxFiles: number;
    enableRotation: boolean;
    retentionDays: number;
}
export declare class MetricsConfigDto {
    enabled: boolean;
    collectionInterval: number;
    retentionDays: number;
    enableSystemMetrics: boolean;
    enableApplicationMetrics: boolean;
    enableDatabaseMetrics: boolean;
    customMetrics: boolean;
}
export declare class HealthChecksConfigDto {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    services: string[];
}
export declare class AlertingConfigDto {
    enabled: boolean;
    checkInterval: number;
    defaultCooldown: number;
    maxAlertsPerHour: number;
    enableEmailNotifications: boolean;
    enableWebhookNotifications: boolean;
}
export declare class RealtimeConfigDto {
    enabled: boolean;
    websocketPort?: number;
    updateInterval: number;
    enableBroadcast: boolean;
}
export declare class MonitoringConfigurationDto {
    enabled: boolean;
    logging: LoggingConfigDto;
    metrics: MetricsConfigDto;
    healthChecks: HealthChecksConfigDto;
    alerting: AlertingConfigDto;
    realtime: RealtimeConfigDto;
}
