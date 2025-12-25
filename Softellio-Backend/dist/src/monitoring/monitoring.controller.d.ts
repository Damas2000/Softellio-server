import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MonitoringService } from './monitoring.service';
import { CreateLogEntryDto, LogQueryDto, CreateMetricDto, MetricQueryDto, CreateAlertRuleDto, UpdateAlertRuleDto, AlertQueryDto, AcknowledgeAlertDto, ResolveAlertDto, CreateHealthCheckDto, CreateNotificationTemplateDto, SendTestNotificationDto, CreateMaintenanceWindowDto, MonitoringConfigurationDto } from './dto/monitoring.dto';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    getConfiguration(): import("./interfaces/monitoring.interfaces").MonitoringConfiguration;
    updateConfiguration(configDto: MonitoringConfigurationDto): Promise<import("./interfaces/monitoring.interfaces").MonitoringConfiguration>;
    createLogEntry(logDto: CreateLogEntryDto, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").LogEntry>;
    queryLogs(query: LogQueryDto, user: any, tenantId: number): Promise<{
        logs: import("./interfaces/monitoring.interfaces").LogEntry[];
        total: number;
    }>;
    getLogContexts(user: any, tenantId: number): {
        contexts: string[];
    };
    exportLogs(query: LogQueryDto, user: any, tenantId: number): {
        message: string;
    };
    createMetric(metricDto: CreateMetricDto, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").SystemMetric>;
    queryMetrics(query: MetricQueryDto, user: any, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").SystemMetric[]>;
    getPerformanceMetrics(): Promise<import("./interfaces/monitoring.interfaces").PerformanceMetrics>;
    getMetricNames(user: any, tenantId: number): {
        names: string[];
    };
    createAlertRule(ruleDto: CreateAlertRuleDto, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").AlertRule>;
    getAlertRules(user: any, tenantId: number): {
        rules: any[];
        total: number;
    };
    getAlertRule(id: string): {
        message: string;
    };
    updateAlertRule(id: string, updateDto: UpdateAlertRuleDto): Promise<import("./interfaces/monitoring.interfaces").AlertRule>;
    deleteAlertRule(id: string): Promise<void>;
    queryAlerts(query: AlertQueryDto, user: any, tenantId: number): {
        alerts: any[];
        total: number;
    };
    acknowledgeAlert(id: string, acknowledgeDto: AcknowledgeAlertDto, user: any): {
        message: string;
        acknowledgedBy: any;
    };
    resolveAlert(id: string, resolveDto: ResolveAlertDto, user: any): {
        message: string;
        resolvedBy: any;
    };
    getAlertStatistics(user: any, tenantId: number): {
        totalAlerts: number;
        activeAlerts: number;
        resolvedAlerts: number;
        acknowledgedAlerts: number;
        alertsBySeverity: {};
        alertsByRule: any[];
    };
    getSystemHealth(): {
        status: string;
        timestamp: string;
        services: any[];
        uptime: number;
    };
    getServiceHealth(): {
        services: any[];
    };
    createHealthCheck(healthCheckDto: CreateHealthCheckDto): {
        message: string;
    };
    runHealthCheck(id: string): {
        message: string;
        status: string;
    };
    getNotificationTemplates(user: any, tenantId: number): {
        templates: any[];
    };
    createNotificationTemplate(templateDto: CreateNotificationTemplateDto, tenantId: number): {
        message: string;
    };
    sendTestNotification(testDto: SendTestNotificationDto): {
        message: string;
    };
    getMaintenanceWindows(user: any, tenantId: number): {
        windows: any[];
    };
    createMaintenanceWindow(maintenanceDto: CreateMaintenanceWindowDto, user: any, tenantId: number): {
        message: string;
    };
    deleteMaintenanceWindow(id: string): void;
    getDashboardData(user: any, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").DashboardData>;
    getStatistics(user: any, tenantId: number): Promise<import("./interfaces/monitoring.interfaces").MonitoringStats>;
    getOverviewStatistics(user: any, tenantId: number): {
        systemStatus: string;
        uptime: number;
        totalLogs: number;
        totalMetrics: number;
        activeAlerts: number;
        servicesHealthy: number;
        servicesTotal: number;
    };
    streamEvents(user: any, tenantId: number): Observable<MessageEvent>;
    streamAlerts(): Observable<MessageEvent>;
    streamLogs(): Observable<MessageEvent>;
    streamMetrics(): Observable<MessageEvent>;
    getSystemInfo(): {
        application: {
            name: string;
            version: string;
            environment: string;
            uptime: number;
            pid: number;
            startedAt: string;
        };
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            nodeVersion: string;
            cpuCount: any;
            totalMemory: any;
            freeMemory: any;
            loadAverage: any;
            hostname: any;
        };
        monitoring: {
            enabled: boolean;
            loggingEnabled: boolean;
            metricsEnabled: boolean;
            alertingEnabled: boolean;
            healthChecksEnabled: boolean;
        };
    };
    getSystemStatus(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
    };
    getMonitoringHealth(): {
        status: string;
        timestamp: string;
        services: {
            logging: string;
            metrics: string;
            alerting: string;
            healthChecks: string;
            realtime: string;
        };
        uptime: number;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        error: any;
        services?: undefined;
        uptime?: undefined;
    };
}
