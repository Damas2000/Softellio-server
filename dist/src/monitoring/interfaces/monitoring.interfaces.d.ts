export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export declare enum MetricType {
    COUNTER = "counter",
    GAUGE = "gauge",
    HISTOGRAM = "histogram",
    TIMER = "timer"
}
export declare enum AlertSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}
export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    UNKNOWN = "unknown"
}
export declare enum AlertStatus {
    ACTIVE = "active",
    ACKNOWLEDGED = "acknowledged",
    RESOLVED = "resolved",
    SILENCED = "silenced"
}
export declare enum NotificationChannel {
    EMAIL = "email",
    WEBHOOK = "webhook",
    SMS = "sms",
    SLACK = "slack",
    TEAMS = "teams",
    TELEGRAM = "telegram"
}
export interface LogEntry {
    id?: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
    tenantId?: number;
    userId?: number;
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
export interface SystemMetric {
    id?: string;
    timestamp: Date;
    name: string;
    type: MetricType;
    value: number;
    unit?: string;
    labels?: Record<string, string>;
    tenantId?: number;
    source?: string;
    description?: string;
}
export interface PerformanceMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
        cores: number;
    };
    memory: {
        used: number;
        total: number;
        free: number;
        percentage: number;
        heapUsed: number;
        heapTotal: number;
    };
    disk: {
        used: number;
        total: number;
        free: number;
        percentage: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
    };
    application: {
        uptime: number;
        version: string;
        environment: string;
        activeConnections: number;
        totalRequests: number;
        requestsPerSecond: number;
        errorRate: number;
        averageResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
    };
    database: {
        connections: {
            active: number;
            idle: number;
            total: number;
        };
        queries: {
            total: number;
            slow: number;
            failed: number;
            averageTime: number;
        };
        size: number;
    };
}
export interface HealthCheck {
    name: string;
    status: HealthStatus;
    message?: string;
    timestamp: Date;
    duration?: number;
    metadata?: Record<string, any>;
}
export interface ServiceHealth {
    service: string;
    status: HealthStatus;
    checks: HealthCheck[];
    lastChecked: Date;
    uptime: number;
    version?: string;
}
export interface AlertRule {
    id?: string;
    name: string;
    description?: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    severity: AlertSeverity;
    enabled: boolean;
    tenantId?: number;
    duration?: number;
    cooldown?: number;
    notificationChannels: NotificationChannel[];
    recipients: string[];
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    runbook?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Alert {
    id?: string;
    ruleId: string;
    rule?: AlertRule;
    status: AlertStatus;
    severity: AlertSeverity;
    message: string;
    description?: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    tenantId?: number;
    metric: string;
    actualValue: number;
    threshold: number;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    lastNotifiedAt?: Date;
    notificationCount: number;
    fingerprint?: string;
    generatorURL?: string;
}
export interface MonitoringConfiguration {
    enabled: boolean;
    logging: {
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
    };
    metrics: {
        enabled: boolean;
        collectionInterval: number;
        retentionDays: number;
        enableSystemMetrics: boolean;
        enableApplicationMetrics: boolean;
        enableDatabaseMetrics: boolean;
        customMetrics: boolean;
    };
    healthChecks: {
        enabled: boolean;
        interval: number;
        timeout: number;
        retries: number;
        services: string[];
    };
    alerting: {
        enabled: boolean;
        checkInterval: number;
        defaultCooldown: number;
        maxAlertsPerHour: number;
        enableEmailNotifications: boolean;
        enableWebhookNotifications: boolean;
    };
    realtime: {
        enabled: boolean;
        websocketPort?: number;
        updateInterval: number;
        enableBroadcast: boolean;
    };
}
export interface LogQuery {
    level?: LogLevel[];
    startTime?: Date;
    endTime?: Date;
    tenantId?: number;
    userId?: number;
    search?: string;
    context?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'level' | 'message';
    sortOrder?: 'asc' | 'desc';
}
export interface MetricQuery {
    names?: string[];
    startTime?: Date;
    endTime?: Date;
    tenantId?: number;
    labels?: Record<string, string>;
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
    interval?: number;
    limit?: number;
}
export interface MonitoringStats {
    overview: {
        totalLogs: number;
        totalMetrics: number;
        activeAlerts: number;
        healthyServices: number;
        totalServices: number;
        uptime: number;
    };
    logStats: {
        byLevel: Record<LogLevel, number>;
        last24Hours: number;
        lastHour: number;
        avgLogsPerMinute: number;
        topContexts: Array<{
            context: string;
            count: number;
        }>;
    };
    metricStats: {
        byType: Record<MetricType, number>;
        last24Hours: number;
        lastHour: number;
        avgMetricsPerMinute: number;
        topMetrics: Array<{
            name: string;
            count: number;
        }>;
    };
    alertStats: {
        byStatus: Record<AlertStatus, number>;
        bySeverity: Record<AlertSeverity, number>;
        last24Hours: number;
        avgResponseTime: number;
        topAlerts: Array<{
            rule: string;
            count: number;
        }>;
    };
}
export interface DashboardData {
    timestamp: Date;
    systemMetrics: PerformanceMetrics;
    alerts: Alert[];
    healthChecks: ServiceHealth[];
    recentLogs: LogEntry[];
    stats: MonitoringStats;
}
export interface NotificationTemplate {
    id?: string;
    name: string;
    channel: NotificationChannel;
    subject: string;
    body: string;
    variables: string[];
    isDefault: boolean;
    tenantId?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MaintenanceWindow {
    id?: string;
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    services?: string[];
    silenceAlerts: boolean;
    disableNotifications: boolean;
    tenantId?: number;
    createdBy?: number;
    createdAt?: Date;
}
export interface MonitoringEvent {
    id?: string;
    type: 'log' | 'metric' | 'alert' | 'health' | 'system';
    timestamp: Date;
    source: string;
    data: any;
    tenantId?: number;
    processed: boolean;
    createdAt?: Date;
}
