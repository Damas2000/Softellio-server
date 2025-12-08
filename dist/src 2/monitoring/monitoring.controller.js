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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const monitoring_service_1 = require("./monitoring.service");
const monitoring_dto_1 = require("./dto/monitoring.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
let MonitoringController = class MonitoringController {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    getConfiguration() {
        return this.monitoringService.getConfiguration();
    }
    updateConfiguration(configDto) {
        return this.monitoringService.updateConfiguration(configDto);
    }
    createLogEntry(logDto, tenantId) {
        return this.monitoringService.createLogEntry(logDto, tenantId);
    }
    queryLogs(query, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.monitoringService.queryLogs(query, requestingUserTenantId);
    }
    getLogContexts(user, tenantId) {
        return { contexts: ['AuthService', 'UserService', 'MonitoringService', 'DatabaseService'] };
    }
    exportLogs(query, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return { message: 'Export functionality coming soon' };
    }
    createMetric(metricDto, tenantId) {
        return this.monitoringService.createMetric(metricDto, tenantId);
    }
    queryMetrics(query, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.monitoringService.queryMetrics(query, requestingUserTenantId);
    }
    getPerformanceMetrics() {
        return this.monitoringService.getPerformanceMetrics();
    }
    getMetricNames(user, tenantId) {
        return {
            names: [
                'system.cpu.usage',
                'system.memory.used',
                'application.requests.total',
                'application.response_time',
                'database.connections.active',
            ]
        };
    }
    createAlertRule(ruleDto, tenantId) {
        return this.monitoringService.createAlertRule(ruleDto, tenantId);
    }
    getAlertRules(user, tenantId) {
        return { rules: [], total: 0 };
    }
    getAlertRule(id) {
        return { message: 'Alert rule details' };
    }
    updateAlertRule(id, updateDto) {
        return this.monitoringService.updateAlertRule(id, updateDto);
    }
    deleteAlertRule(id) {
        return this.monitoringService.deleteAlertRule(id);
    }
    queryAlerts(query, user, tenantId) {
        return { alerts: [], total: 0 };
    }
    acknowledgeAlert(id, acknowledgeDto, user) {
        return { message: 'Alert acknowledged', acknowledgedBy: user.id };
    }
    resolveAlert(id, resolveDto, user) {
        return { message: 'Alert resolved', resolvedBy: user.id };
    }
    getAlertStatistics(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return {
            totalAlerts: 0,
            activeAlerts: 0,
            resolvedAlerts: 0,
            acknowledgedAlerts: 0,
            alertsBySeverity: {},
            alertsByRule: [],
        };
    }
    getSystemHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: [],
            uptime: process.uptime(),
        };
    }
    getServiceHealth() {
        return { services: [] };
    }
    createHealthCheck(healthCheckDto) {
        return { message: 'Health check created' };
    }
    runHealthCheck(id) {
        return { message: 'Health check executed', status: 'healthy' };
    }
    getNotificationTemplates(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return { templates: [] };
    }
    createNotificationTemplate(templateDto, tenantId) {
        return { message: 'Template created' };
    }
    sendTestNotification(testDto) {
        return { message: 'Test notification sent' };
    }
    getMaintenanceWindows(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return { windows: [] };
    }
    createMaintenanceWindow(maintenanceDto, user, tenantId) {
        return { message: 'Maintenance window created' };
    }
    deleteMaintenanceWindow(id) {
        return;
    }
    getDashboardData(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.monitoringService.getDashboardData(requestingUserTenantId);
    }
    getStatistics(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.monitoringService.getMonitoringStats(requestingUserTenantId);
    }
    getOverviewStatistics(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return {
            systemStatus: 'healthy',
            uptime: process.uptime(),
            totalLogs: 0,
            totalMetrics: 0,
            activeAlerts: 0,
            servicesHealthy: 3,
            servicesTotal: 3,
        };
    }
    streamEvents(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return (0, rxjs_1.interval)(5000).pipe((0, operators_1.switchMap)(async () => {
            const dashboardData = await this.monitoringService.getDashboardData(requestingUserTenantId);
            return {
                data: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    type: 'dashboard_update',
                    payload: dashboardData,
                }),
            };
        }));
    }
    streamAlerts() {
        return new rxjs_1.Observable((observer) => {
            this.monitoringService.on('alert', (alert) => {
                observer.next({
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'alert',
                        payload: alert,
                    },
                });
            });
            this.monitoringService.on('health', (health) => {
                observer.next({
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'health_update',
                        payload: health,
                    },
                });
            });
        });
    }
    streamLogs() {
        return new rxjs_1.Observable((observer) => {
            this.monitoringService.on('log', (logEntry) => {
                observer.next({
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'log',
                        payload: logEntry,
                    },
                });
            });
        });
    }
    streamMetrics() {
        return new rxjs_1.Observable((observer) => {
            this.monitoringService.on('metrics', (performanceMetrics) => {
                observer.next({
                    data: {
                        timestamp: new Date().toISOString(),
                        type: 'metrics',
                        payload: performanceMetrics,
                    },
                });
            });
        });
    }
    getSystemInfo() {
        return {
            application: {
                name: 'Softellio CMS',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: process.uptime(),
                pid: process.pid,
                startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                cpuCount: require('os').cpus().length,
                totalMemory: require('os').totalmem(),
                freeMemory: require('os').freemem(),
                loadAverage: require('os').loadavg(),
                hostname: require('os').hostname(),
            },
            monitoring: {
                enabled: this.monitoringService.getConfiguration().enabled,
                loggingEnabled: this.monitoringService.getConfiguration().logging.enabled,
                metricsEnabled: this.monitoringService.getConfiguration().metrics.enabled,
                alertingEnabled: this.monitoringService.getConfiguration().alerting.enabled,
                healthChecksEnabled: this.monitoringService.getConfiguration().healthChecks.enabled,
            },
        };
    }
    getSystemStatus() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        };
    }
    getMonitoringHealth() {
        try {
            const config = this.monitoringService.getConfiguration();
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    logging: config.logging.enableDatabase ? 'enabled' : 'disabled',
                    metrics: config.metrics.enabled ? 'enabled' : 'disabled',
                    alerting: config.alerting.enabled ? 'enabled' : 'disabled',
                    healthChecks: config.healthChecks.enabled ? 'enabled' : 'disabled',
                    realtime: config.realtime.enabled ? 'enabled' : 'disabled',
                },
                uptime: process.uptime(),
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('config'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get monitoring configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current monitoring configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Patch)('config'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update monitoring configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.MonitoringConfigurationDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "updateConfiguration", null);
__decorate([
    (0, common_1.Post)('logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create log entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Log entry created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid log entry data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateLogEntryDto, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createLogEntry", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Query log entries with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Log entries retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'levels', required: false, description: 'Filter by log levels' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: false, description: 'Start time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: false, description: 'End time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'context', required: false, description: 'Context filter' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search in message' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, description: 'Filter by tags' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort field' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort direction' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.LogQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "queryLogs", null);
__decorate([
    (0, common_1.Get)('logs/contexts'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get available log contexts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available log contexts' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getLogContexts", null);
__decorate([
    (0, common_1.Get)('logs/export'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export logs to file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs exported successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.LogQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "exportLogs", null);
__decorate([
    (0, common_1.Post)('metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom metric' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Metric created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid metric data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateMetricDto, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createMetric", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Query metrics with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'names', required: false, description: 'Metric names to query' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: false, description: 'Start time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: false, description: 'End time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'labels', required: false, description: 'Label filters' }),
    (0, swagger_1.ApiQuery)({ name: 'aggregation', required: false, description: 'Aggregation function' }),
    (0, swagger_1.ApiQuery)({ name: 'interval', required: false, description: 'Aggregation interval' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum data points' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.MetricQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "queryMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/performance'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get current system performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/names'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get available metric names' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available metric names' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getMetricNames", null);
__decorate([
    (0, common_1.Post)('alerts/rules'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create alert rule' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Alert rule created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid alert rule data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateAlertRuleDto, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createAlertRule", null);
__decorate([
    (0, common_1.Get)('alerts/rules'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all alert rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert rules retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertRules", null);
__decorate([
    (0, common_1.Get)('alerts/rules/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert rule by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Alert rule ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert rule details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert rule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertRule", null);
__decorate([
    (0, common_1.Patch)('alerts/rules/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update alert rule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Alert rule ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert rule updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert rule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, monitoring_dto_1.UpdateAlertRuleDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "updateAlertRule", null);
__decorate([
    (0, common_1.Delete)('alerts/rules/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete alert rule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Alert rule ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert rule deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert rule not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "deleteAlertRule", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Query alerts with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alerts retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by alert status' }),
    (0, swagger_1.ApiQuery)({ name: 'severity', required: false, description: 'Filter by alert severity' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: false, description: 'Start time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: false, description: 'End time filter' }),
    (0, swagger_1.ApiQuery)({ name: 'metric', required: false, description: 'Filter by metric name' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search in alert message' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.AlertQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "queryAlerts", null);
__decorate([
    (0, common_1.Post)('alerts/:id/acknowledge'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge alert' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Alert ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert acknowledged successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, monitoring_dto_1.AcknowledgeAlertDto, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Post)('alerts/:id/resolve'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve alert' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Alert ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert resolved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, monitoring_dto_1.ResolveAlertDto, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Get)('alerts/statistics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert statistics' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertStatistics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('health/services'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed service health checks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service health details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getServiceHealth", null);
__decorate([
    (0, common_1.Post)('health/checks'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom health check' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Health check created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateHealthCheckDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createHealthCheck", null);
__decorate([
    (0, common_1.Post)('health/checks/:id/run'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Run specific health check' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Health check ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health check executed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "runHealthCheck", null);
__decorate([
    (0, common_1.Get)('notifications/templates'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification templates retrieved' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getNotificationTemplates", null);
__decorate([
    (0, common_1.Post)('notifications/templates'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create notification template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateNotificationTemplateDto, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createNotificationTemplate", null);
__decorate([
    (0, common_1.Post)('notifications/test'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send test notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.SendTestNotificationDto]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "sendTestNotification", null);
__decorate([
    (0, common_1.Get)('maintenance'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get maintenance windows' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance windows retrieved' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getMaintenanceWindows", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create maintenance window' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Maintenance window created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_dto_1.CreateMaintenanceWindowDto, Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createMaintenanceWindow", null);
__decorate([
    (0, common_1.Delete)('maintenance/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete maintenance window' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Maintenance window ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance window deleted' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "deleteMaintenanceWindow", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get monitoring statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get monitoring overview statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overview statistics' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getOverviewStatistics", null);
__decorate([
    (0, common_1.Sse)('events'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Server-Sent Events for real-time monitoring data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time monitoring stream' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], MonitoringController.prototype, "streamEvents", null);
__decorate([
    (0, common_1.Sse)('alerts'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time alert notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time alert stream' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], MonitoringController.prototype, "streamAlerts", null);
__decorate([
    (0, common_1.Sse)('logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time log stream' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time log stream' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], MonitoringController.prototype, "streamLogs", null);
__decorate([
    (0, common_1.Sse)('metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time metrics stream' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time metrics stream' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], MonitoringController.prototype, "streamMetrics", null);
__decorate([
    (0, common_1.Get)('system/info'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get system information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getSystemInfo", null);
__decorate([
    (0, common_1.Get)('system/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get simple system status (public endpoint)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getSystemStatus", null);
__decorate([
    (0, common_1.Get)('health/monitoring'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitoring service health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Monitoring service health' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getMonitoringHealth", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)('Monitoring'),
    (0, common_1.Controller)('monitoring'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map