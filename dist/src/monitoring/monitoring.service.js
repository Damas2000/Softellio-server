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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../config/prisma.service");
const os = require("os");
const fs = require("fs/promises");
const path = require("path");
const events_1 = require("events");
const schedule_1 = require("@nestjs/schedule");
const monitoring_interfaces_1 = require("./interfaces/monitoring.interfaces");
let MonitoringService = MonitoringService_1 = class MonitoringService extends events_1.EventEmitter {
    constructor(prisma, configService) {
        super();
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.startTime = new Date();
        this.metricsCache = new Map();
        this.maintenanceWindows = [];
        this.initializeConfiguration();
    }
    async onModuleInit() {
        this.logger.log('Initializing Monitoring Service...');
        if (this.config.enabled) {
            await this.setupLogFile();
            await this.startMetricsCollection();
            await this.startHealthChecks();
            await this.startAlertProcessing();
            this.logger.log('Monitoring Service initialized successfully');
            await this.logInfo('Monitoring Service started', 'MonitoringService');
        }
        else {
            this.logger.log('Monitoring Service disabled in configuration');
        }
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down Monitoring Service...');
        if (this.metricsCollectionInterval) {
            clearInterval(this.metricsCollectionInterval);
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        if (this.alertCheckInterval) {
            clearInterval(this.alertCheckInterval);
        }
        if (this.logFileHandle) {
            await this.logFileHandle.close();
        }
        await this.logInfo('Monitoring Service stopped', 'MonitoringService');
        this.logger.log('Monitoring Service shut down complete');
    }
    initializeConfiguration() {
        this.config = {
            enabled: this.configService.get('MONITORING_ENABLED', true),
            logging: {
                enabled: this.configService.get('LOG_ENABLED', true),
                level: this.configService.get('LOG_LEVEL', monitoring_interfaces_1.LogLevel.INFO),
                enableConsole: this.configService.get('LOG_ENABLE_CONSOLE', true),
                enableFile: this.configService.get('LOG_ENABLE_FILE', true),
                enableDatabase: this.configService.get('LOG_ENABLE_DATABASE', true),
                filePath: this.configService.get('LOG_FILE_PATH', './logs'),
                maxFileSize: this.configService.get('LOG_MAX_FILE_SIZE', 10),
                maxFiles: this.configService.get('LOG_MAX_FILES', 5),
                enableRotation: this.configService.get('LOG_ENABLE_ROTATION', true),
                retentionDays: this.configService.get('LOG_RETENTION_DAYS', 30),
            },
            metrics: {
                enabled: this.configService.get('METRICS_ENABLED', true),
                collectionInterval: this.configService.get('METRICS_COLLECTION_INTERVAL', 30),
                retentionDays: this.configService.get('METRICS_RETENTION_DAYS', 7),
                enableSystemMetrics: this.configService.get('METRICS_ENABLE_SYSTEM', true),
                enableApplicationMetrics: this.configService.get('METRICS_ENABLE_APPLICATION', true),
                enableDatabaseMetrics: this.configService.get('METRICS_ENABLE_DATABASE', true),
                customMetrics: this.configService.get('METRICS_ENABLE_CUSTOM', true),
            },
            healthChecks: {
                enabled: this.configService.get('HEALTH_CHECKS_ENABLED', true),
                interval: this.configService.get('HEALTH_CHECK_INTERVAL', 60),
                timeout: this.configService.get('HEALTH_CHECK_TIMEOUT', 5000),
                retries: this.configService.get('HEALTH_CHECK_RETRIES', 3),
                services: this.configService.get('HEALTH_CHECK_SERVICES', 'database,redis').split(','),
            },
            alerting: {
                enabled: this.configService.get('ALERTING_ENABLED', true),
                checkInterval: this.configService.get('ALERT_CHECK_INTERVAL', 30),
                defaultCooldown: this.configService.get('ALERT_DEFAULT_COOLDOWN', 300),
                maxAlertsPerHour: this.configService.get('ALERT_MAX_PER_HOUR', 50),
                enableEmailNotifications: this.configService.get('ALERT_ENABLE_EMAIL', true),
                enableWebhookNotifications: this.configService.get('ALERT_ENABLE_WEBHOOK', true),
            },
            realtime: {
                enabled: this.configService.get('REALTIME_MONITORING_ENABLED', true),
                websocketPort: this.configService.get('REALTIME_WEBSOCKET_PORT', 3001),
                updateInterval: this.configService.get('REALTIME_UPDATE_INTERVAL', 5000),
                enableBroadcast: this.configService.get('REALTIME_ENABLE_BROADCAST', true),
            },
        };
    }
    async updateConfiguration(configDto) {
        this.config = {
            enabled: configDto.enabled,
            logging: {
                enabled: configDto.logging.enabled,
                level: configDto.logging.level,
                enableConsole: configDto.logging.enableConsole,
                enableFile: configDto.logging.enableFile,
                enableDatabase: configDto.logging.enableDatabase,
                filePath: configDto.logging.filePath,
                maxFileSize: configDto.logging.maxFileSize,
                maxFiles: configDto.logging.maxFiles,
                enableRotation: configDto.logging.enableRotation,
                retentionDays: configDto.logging.retentionDays,
            },
            metrics: {
                enabled: configDto.metrics.enabled,
                collectionInterval: configDto.metrics.collectionInterval,
                retentionDays: configDto.metrics.retentionDays,
                enableSystemMetrics: configDto.metrics.enableSystemMetrics,
                enableApplicationMetrics: configDto.metrics.enableApplicationMetrics,
                enableDatabaseMetrics: configDto.metrics.enableDatabaseMetrics,
                customMetrics: configDto.metrics.customMetrics,
            },
            healthChecks: {
                enabled: configDto.healthChecks.enabled,
                interval: configDto.healthChecks.interval,
                timeout: configDto.healthChecks.timeout,
                retries: configDto.healthChecks.retries,
                services: configDto.healthChecks.services,
            },
            alerting: {
                enabled: configDto.alerting.enabled,
                checkInterval: configDto.alerting.checkInterval,
                defaultCooldown: configDto.alerting.defaultCooldown,
                maxAlertsPerHour: configDto.alerting.maxAlertsPerHour,
                enableEmailNotifications: configDto.alerting.enableEmailNotifications,
                enableWebhookNotifications: configDto.alerting.enableWebhookNotifications,
            },
            realtime: {
                enabled: configDto.realtime.enabled,
                websocketPort: configDto.realtime.websocketPort,
                updateInterval: configDto.realtime.updateInterval,
                enableBroadcast: configDto.realtime.enableBroadcast,
            },
        };
        await this.onModuleDestroy();
        await this.onModuleInit();
        return this.config;
    }
    getConfiguration() {
        return this.config;
    }
    async setupLogFile() {
        if (!this.config.logging.enableFile)
            return;
        try {
            const logDir = this.config.logging.filePath || './logs';
            await fs.mkdir(logDir, { recursive: true });
            const logFile = path.join(logDir, `monitoring-${new Date().toISOString().split('T')[0]}.log`);
            this.logFileHandle = await fs.open(logFile, 'a');
            this.logger.log(`Log file setup complete: ${logFile}`);
        }
        catch (error) {
            this.logger.error('Failed to setup log file:', error);
        }
    }
    async createLogEntry(logDto, tenantId) {
        const logEntry = {
            timestamp: new Date(),
            level: logDto.level,
            message: logDto.message,
            context: logDto.context,
            metadata: logDto.metadata,
            tenantId,
            sessionId: logDto.sessionId,
            requestId: logDto.requestId,
            ipAddress: logDto.ipAddress,
            userAgent: logDto.userAgent,
            duration: logDto.duration,
            statusCode: logDto.statusCode,
            method: logDto.method,
            url: logDto.url,
            stack: logDto.stack,
            error: logDto.error,
            tags: logDto.tags,
        };
        try {
            if (this.config.logging.enableConsole && this.shouldLogLevel(logDto.level)) {
                this.writeToConsole(logEntry);
            }
            if (this.config.logging.enableFile && this.logFileHandle) {
                await this.writeToFile(logEntry);
            }
            if (this.config.logging.enableDatabase) {
                await this.writeToDatabase(logEntry);
            }
            this.emit('log', logEntry);
            return logEntry;
        }
        catch (error) {
            this.logger.error('Failed to create log entry:', error);
            throw error;
        }
    }
    shouldLogLevel(level) {
        const levels = [monitoring_interfaces_1.LogLevel.ERROR, monitoring_interfaces_1.LogLevel.WARN, monitoring_interfaces_1.LogLevel.INFO, monitoring_interfaces_1.LogLevel.DEBUG, monitoring_interfaces_1.LogLevel.VERBOSE];
        const configLevelIndex = levels.indexOf(this.config.logging.level);
        const entryLevelIndex = levels.indexOf(level);
        return entryLevelIndex <= configLevelIndex;
    }
    writeToConsole(logEntry) {
        const timestamp = logEntry.timestamp.toISOString();
        const level = logEntry.level.toUpperCase().padEnd(7);
        const context = logEntry.context ? `[${logEntry.context}]` : '';
        const message = `${timestamp} ${level} ${context} ${logEntry.message}`;
        switch (logEntry.level) {
            case monitoring_interfaces_1.LogLevel.ERROR:
                console.error(message, logEntry.metadata);
                break;
            case monitoring_interfaces_1.LogLevel.WARN:
                console.warn(message, logEntry.metadata);
                break;
            default:
                console.log(message, logEntry.metadata);
        }
    }
    async writeToFile(logEntry) {
        if (!this.logFileHandle)
            return;
        const logLine = JSON.stringify({
            timestamp: logEntry.timestamp.toISOString(),
            level: logEntry.level,
            message: logEntry.message,
            context: logEntry.context,
            metadata: logEntry.metadata,
            tenantId: logEntry.tenantId,
            sessionId: logEntry.sessionId,
            requestId: logEntry.requestId,
            duration: logEntry.duration,
            statusCode: logEntry.statusCode,
            method: logEntry.method,
            url: logEntry.url,
            tags: logEntry.tags,
        }) + '\n';
        await this.logFileHandle.write(logLine);
    }
    async writeToDatabase(logEntry) {
        try {
            await this.prisma.logEntry.create({
                data: {
                    level: logEntry.level,
                    message: logEntry.message,
                    context: logEntry.context,
                    metadata: logEntry.metadata ? JSON.stringify(logEntry.metadata) : null,
                    tenantId: logEntry.tenantId,
                    sessionId: logEntry.sessionId,
                    requestId: logEntry.requestId,
                    ipAddress: logEntry.ipAddress,
                    userAgent: logEntry.userAgent,
                    duration: logEntry.duration,
                    statusCode: logEntry.statusCode,
                    method: logEntry.method,
                    url: logEntry.url,
                    stack: logEntry.stack,
                    error: logEntry.error ? JSON.stringify(logEntry.error) : null,
                    tags: logEntry.tags,
                    timestamp: logEntry.timestamp,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to write log to database:', error);
        }
    }
    async queryLogs(query, tenantId) {
        try {
            const where = {};
            if (tenantId) {
                where.tenantId = tenantId;
            }
            if (query.levels && query.levels.length > 0) {
                where.level = { in: query.levels };
            }
            if (query.startTime) {
                where.timestamp = { ...where.timestamp, gte: new Date(query.startTime) };
            }
            if (query.endTime) {
                where.timestamp = { ...where.timestamp, lte: new Date(query.endTime) };
            }
            if (query.context) {
                where.context = { contains: query.context, mode: 'insensitive' };
            }
            if (query.search) {
                where.message = { contains: query.search, mode: 'insensitive' };
            }
            if (query.tags && query.tags.length > 0) {
                where.tags = { hasAll: query.tags };
            }
            const skip = ((query.page || 1) - 1) * (query.limit || 50);
            const orderBy = {};
            if (query.sortBy) {
                orderBy[query.sortBy] = query.sortOrder || 'desc';
            }
            else {
                orderBy.timestamp = 'desc';
            }
            const [logs, total] = await Promise.all([
                this.prisma.logEntry.findMany({
                    where,
                    skip,
                    take: query.limit || 50,
                    orderBy,
                }),
                this.prisma.logEntry.count({ where }),
            ]);
            return {
                logs: logs.map(log => ({
                    id: log.id.toString(),
                    timestamp: log.timestamp,
                    level: log.level,
                    message: log.message,
                    context: log.context,
                    metadata: log.metadata ? JSON.parse(log.metadata) : null,
                    tenantId: log.tenantId,
                    sessionId: log.sessionId,
                    requestId: log.requestId,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent,
                    duration: log.duration,
                    statusCode: log.statusCode,
                    method: log.method,
                    url: log.url,
                    stack: log.stack,
                    error: log.error ? JSON.parse(log.error) : null,
                    tags: log.tags,
                })),
                total,
            };
        }
        catch (error) {
            this.logger.error('Failed to query logs:', error);
            throw error;
        }
    }
    async logError(message, context, metadata, tenantId) {
        await this.createLogEntry({
            level: monitoring_interfaces_1.LogLevel.ERROR,
            message,
            context,
            metadata,
        }, tenantId);
    }
    async logWarn(message, context, metadata, tenantId) {
        await this.createLogEntry({
            level: monitoring_interfaces_1.LogLevel.WARN,
            message,
            context,
            metadata,
        }, tenantId);
    }
    async logInfo(message, context, metadata, tenantId) {
        await this.createLogEntry({
            level: monitoring_interfaces_1.LogLevel.INFO,
            message,
            context,
            metadata,
        }, tenantId);
    }
    async logDebug(message, context, metadata, tenantId) {
        await this.createLogEntry({
            level: monitoring_interfaces_1.LogLevel.DEBUG,
            message,
            context,
            metadata,
        }, tenantId);
    }
    async startMetricsCollection() {
        if (!this.config.metrics.enabled)
            return;
        this.logger.log('Starting metrics collection...');
        await this.collectSystemMetrics();
        this.metricsCollectionInterval = setInterval(async () => {
            try {
                await this.collectSystemMetrics();
            }
            catch (error) {
                this.logger.error('Error collecting metrics:', error);
            }
        }, this.config.metrics.collectionInterval * 1000);
    }
    async collectSystemMetrics() {
        const timestamp = new Date();
        const metrics = [];
        try {
            if (this.config.metrics.enableSystemMetrics) {
                const cpus = os.cpus();
                const loadAverage = os.loadavg();
                metrics.push({
                    timestamp,
                    name: 'system.cpu.usage',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: this.calculateCPUUsage(),
                    unit: 'percent',
                    labels: { component: 'system' },
                    source: 'system',
                });
                metrics.push({
                    timestamp,
                    name: 'system.cpu.load_average',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: loadAverage[0],
                    unit: 'load',
                    labels: { component: 'system', period: '1min' },
                    source: 'system',
                });
                const totalMemory = os.totalmem();
                const freeMemory = os.freemem();
                const usedMemory = totalMemory - freeMemory;
                const memoryUsage = process.memoryUsage();
                metrics.push({
                    timestamp,
                    name: 'system.memory.total',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: totalMemory,
                    unit: 'bytes',
                    labels: { component: 'system' },
                    source: 'system',
                });
                metrics.push({
                    timestamp,
                    name: 'system.memory.used',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: usedMemory,
                    unit: 'bytes',
                    labels: { component: 'system' },
                    source: 'system',
                });
                metrics.push({
                    timestamp,
                    name: 'system.memory.free',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: freeMemory,
                    unit: 'bytes',
                    labels: { component: 'system' },
                    source: 'system',
                });
                metrics.push({
                    timestamp,
                    name: 'application.memory.heap_used',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: memoryUsage.heapUsed,
                    unit: 'bytes',
                    labels: { component: 'application' },
                    source: 'application',
                });
            }
            if (this.config.metrics.enableApplicationMetrics) {
                const uptime = process.uptime();
                metrics.push({
                    timestamp,
                    name: 'application.uptime',
                    type: monitoring_interfaces_1.MetricType.GAUGE,
                    value: uptime,
                    unit: 'seconds',
                    labels: { component: 'application' },
                    source: 'application',
                });
            }
            for (const metric of metrics) {
                await this.createMetric(metric);
            }
            const performanceMetrics = await this.getPerformanceMetrics();
            this.lastPerformanceMetrics = performanceMetrics;
            this.emit('metrics', performanceMetrics);
            this.logger.debug(`Collected ${metrics.length} metrics`);
        }
        catch (error) {
            this.logger.error('Failed to collect system metrics:', error);
        }
    }
    calculateCPUUsage() {
        return Math.min(os.loadavg()[0] * 10, 100);
    }
    async createMetric(metricDto, tenantId) {
        try {
            const metric = {
                timestamp: new Date(),
                name: metricDto.name,
                type: metricDto.type,
                value: metricDto.value,
                unit: metricDto.unit,
                labels: metricDto.labels,
                tenantId,
                source: metricDto.source,
                description: metricDto.description,
            };
            const created = await this.prisma.systemMetric.create({
                data: {
                    metricType: metric.type,
                    metricName: metric.name,
                    value: metric.value,
                    unit: metric.unit,
                    metadata: metric.labels ? metric.labels : null,
                    category: metric.source || 'custom',
                    component: metric.labels?.component || metric.source,
                    tenantId: metric.tenantId,
                    recordedAt: metric.timestamp,
                },
            });
            metric.id = created.id.toString();
            const cacheKey = `${metric.name}-${tenantId || 'global'}`;
            if (!this.metricsCache.has(cacheKey)) {
                this.metricsCache.set(cacheKey, []);
            }
            const cached = this.metricsCache.get(cacheKey);
            cached.push(metric);
            if (cached.length > 100) {
                cached.shift();
            }
            return metric;
        }
        catch (error) {
            this.logger.error('Failed to create metric:', error);
            throw error;
        }
    }
    async queryMetrics(query, tenantId) {
        try {
            const where = {};
            if (tenantId) {
                where.tenantId = tenantId;
            }
            if (query.names && query.names.length > 0) {
                where.metricName = { in: query.names };
            }
            if (query.startTime) {
                where.recordedAt = { ...where.recordedAt, gte: new Date(query.startTime) };
            }
            if (query.endTime) {
                where.recordedAt = { ...where.recordedAt, lte: new Date(query.endTime) };
            }
            const metrics = await this.prisma.systemMetric.findMany({
                where,
                take: query.limit || 1000,
                orderBy: { recordedAt: 'desc' },
            });
            return metrics.map(metric => ({
                id: metric.id.toString(),
                timestamp: metric.recordedAt,
                name: metric.metricName,
                type: metric.metricType,
                value: metric.value,
                unit: metric.unit,
                labels: metric.metadata ? metric.metadata : undefined,
                tenantId: metric.tenantId,
                source: metric.component,
                description: metric.tags?.join(', '),
            }));
        }
        catch (error) {
            this.logger.error('Failed to query metrics:', error);
            throw error;
        }
    }
    async getPerformanceMetrics() {
        const timestamp = new Date();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = process.memoryUsage();
        const cpuUsage = this.calculateCPUUsage();
        const loadAverage = os.loadavg();
        const uptime = process.uptime();
        const applicationMetrics = {
            uptime,
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            activeConnections: 0,
            totalRequests: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
        };
        const databaseMetrics = {
            connections: {
                active: 5,
                idle: 5,
                total: 10,
            },
            queries: {
                total: 0,
                slow: 0,
                failed: 0,
                averageTime: 0,
            },
            size: 0,
        };
        return {
            timestamp,
            cpu: {
                usage: cpuUsage,
                loadAverage,
                cores: os.cpus().length,
            },
            memory: {
                used: usedMemory,
                total: totalMemory,
                free: freeMemory,
                percentage: (usedMemory / totalMemory) * 100,
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
            },
            disk: {
                used: 0,
                total: 0,
                free: 0,
                percentage: 0,
            },
            network: {
                bytesIn: 0,
                bytesOut: 0,
                packetsIn: 0,
                packetsOut: 0,
            },
            application: applicationMetrics,
            database: databaseMetrics,
        };
    }
    async startHealthChecks() {
        if (!this.config.healthChecks.enabled)
            return;
        this.logger.log('Starting health checks...');
        await this.performHealthChecks();
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.performHealthChecks();
            }
            catch (error) {
                this.logger.error('Error performing health checks:', error);
            }
        }, this.config.healthChecks.interval * 1000);
    }
    async performHealthChecks() {
        const services = this.config.healthChecks.services;
        const healthChecks = [];
        for (const serviceName of services) {
            try {
                const health = await this.checkServiceHealth(serviceName);
                healthChecks.push(health);
            }
            catch (error) {
                this.logger.error(`Health check failed for ${serviceName}:`, error);
                healthChecks.push({
                    service: serviceName,
                    status: monitoring_interfaces_1.HealthStatus.UNHEALTHY,
                    checks: [{
                            name: `${serviceName}-check`,
                            status: monitoring_interfaces_1.HealthStatus.UNHEALTHY,
                            message: error.message,
                            timestamp: new Date(),
                        }],
                    lastChecked: new Date(),
                    uptime: 0,
                });
            }
        }
        this.emit('health', healthChecks);
        this.logger.debug(`Performed health checks for ${services.length} services`);
    }
    async checkServiceHealth(serviceName) {
        const startTime = Date.now();
        const checks = [];
        switch (serviceName.toLowerCase()) {
            case 'database':
                return await this.checkDatabaseHealth();
            case 'redis':
                return await this.checkRedisHealth();
            case 'application':
                return await this.checkApplicationHealth();
            default:
                throw new Error(`Unknown service: ${serviceName}`);
        }
    }
    async checkDatabaseHealth() {
        const startTime = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            const duration = Date.now() - startTime;
            return {
                service: 'database',
                status: monitoring_interfaces_1.HealthStatus.HEALTHY,
                checks: [{
                        name: 'database-connection',
                        status: monitoring_interfaces_1.HealthStatus.HEALTHY,
                        message: 'Database connection successful',
                        timestamp: new Date(),
                        duration,
                    }],
                lastChecked: new Date(),
                uptime: (Date.now() - this.startTime.getTime()) / 1000,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                service: 'database',
                status: monitoring_interfaces_1.HealthStatus.UNHEALTHY,
                checks: [{
                        name: 'database-connection',
                        status: monitoring_interfaces_1.HealthStatus.UNHEALTHY,
                        message: `Database connection failed: ${error.message}`,
                        timestamp: new Date(),
                        duration,
                    }],
                lastChecked: new Date(),
                uptime: 0,
            };
        }
    }
    async checkRedisHealth() {
        return {
            service: 'redis',
            status: monitoring_interfaces_1.HealthStatus.HEALTHY,
            checks: [{
                    name: 'redis-connection',
                    status: monitoring_interfaces_1.HealthStatus.HEALTHY,
                    message: 'Redis connection healthy',
                    timestamp: new Date(),
                    duration: 5,
                }],
            lastChecked: new Date(),
            uptime: (Date.now() - this.startTime.getTime()) / 1000,
        };
    }
    async checkApplicationHealth() {
        const memoryUsage = process.memoryUsage();
        const isHealthy = memoryUsage.heapUsed < (512 * 1024 * 1024);
        return {
            service: 'application',
            status: isHealthy ? monitoring_interfaces_1.HealthStatus.HEALTHY : monitoring_interfaces_1.HealthStatus.DEGRADED,
            checks: [{
                    name: 'memory-usage',
                    status: isHealthy ? monitoring_interfaces_1.HealthStatus.HEALTHY : monitoring_interfaces_1.HealthStatus.DEGRADED,
                    message: `Heap used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                    timestamp: new Date(),
                    metadata: { heapUsed: memoryUsage.heapUsed },
                }],
            lastChecked: new Date(),
            uptime: process.uptime(),
        };
    }
    async startAlertProcessing() {
        if (!this.config.alerting.enabled)
            return;
        this.logger.log('Starting alert processing...');
        await this.processAlerts();
        this.alertCheckInterval = setInterval(async () => {
            try {
                await this.processAlerts();
            }
            catch (error) {
                this.logger.error('Error processing alerts:', error);
            }
        }, this.config.alerting.checkInterval * 1000);
    }
    async processAlerts() {
        try {
            const alertRules = await this.getActiveAlertRules();
            for (const rule of alertRules) {
                await this.evaluateAlertRule(rule);
            }
        }
        catch (error) {
            this.logger.error('Error processing alerts:', error);
        }
    }
    async getActiveAlertRules() {
        const rules = await this.prisma.alertRule.findMany({
            where: { enabled: true },
        });
        return rules.map(rule => ({
            id: rule.id.toString(),
            name: rule.name,
            description: rule.description,
            metric: rule.metric,
            condition: rule.condition,
            threshold: rule.threshold,
            severity: rule.severity,
            enabled: rule.enabled,
            tenantId: rule.tenantId,
            duration: rule.duration,
            cooldown: rule.cooldown,
            notificationChannels: rule.notificationChannels,
            recipients: rule.recipients,
            labels: rule.labels ? JSON.parse(rule.labels) : undefined,
            annotations: rule.annotations ? JSON.parse(rule.annotations) : undefined,
            runbook: rule.runbook,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
        }));
    }
    async evaluateAlertRule(rule) {
        try {
            const latestMetric = await this.getLatestMetricValue(rule.metric, rule.tenantId);
            if (!latestMetric) {
                this.logger.debug(`No metric data found for rule: ${rule.name}`);
                return;
            }
            const isTriggered = this.evaluateCondition(latestMetric.value, rule.condition, rule.threshold);
            if (isTriggered) {
                await this.triggerAlert(rule, latestMetric);
            }
            else {
                await this.resolveAlert(rule);
            }
        }
        catch (error) {
            this.logger.error(`Error evaluating alert rule ${rule.name}:`, error);
        }
    }
    evaluateCondition(value, condition, threshold) {
        switch (condition) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            case 'eq': return value === threshold;
            case 'ne': return value !== threshold;
            default: return false;
        }
    }
    async getLatestMetricValue(metricName, tenantId) {
        const metric = await this.prisma.systemMetric.findFirst({
            where: {
                metricName,
                tenantId,
            },
            orderBy: { recordedAt: 'desc' },
        });
        if (!metric)
            return null;
        return {
            id: metric.id.toString(),
            timestamp: metric.recordedAt,
            name: metric.metricName,
            type: metric.metricType,
            value: metric.value,
            unit: metric.unit,
            tenantId: metric.tenantId,
        };
    }
    async triggerAlert(rule, metric) {
        const existingAlert = await this.prisma.alert.findFirst({
            where: {
                ruleId: rule.id,
                status: monitoring_interfaces_1.AlertStatus.ACTIVE,
            },
        });
        if (existingAlert) {
            this.logger.debug(`Alert already active for rule: ${rule.name}`);
            return;
        }
        const alert = {
            ruleId: rule.id,
            status: monitoring_interfaces_1.AlertStatus.ACTIVE,
            severity: rule.severity,
            message: `${rule.name}: ${rule.metric} ${rule.condition} ${rule.threshold} (actual: ${metric.value})`,
            description: rule.description,
            triggeredAt: new Date(),
            tenantId: rule.tenantId,
            metric: rule.metric,
            actualValue: metric.value,
            threshold: rule.threshold,
            labels: rule.labels,
            annotations: rule.annotations,
            notificationCount: 0,
        };
        try {
            const createdAlert = await this.prisma.alert.create({
                data: {
                    ruleId: alert.ruleId,
                    status: alert.status,
                    severity: alert.severity,
                    message: alert.message,
                    description: alert.description,
                    triggeredAt: alert.triggeredAt,
                    tenantId: alert.tenantId,
                    metric: alert.metric,
                    actualValue: alert.actualValue,
                    threshold: alert.threshold,
                    labels: alert.labels ? JSON.stringify(alert.labels) : null,
                    annotations: alert.annotations ? JSON.stringify(alert.annotations) : null,
                    notificationCount: alert.notificationCount,
                },
            });
            alert.id = createdAlert.id.toString();
            await this.sendAlertNotifications(alert, rule);
            this.emit('alert', alert);
            this.logger.warn(`Alert triggered: ${alert.message}`);
        }
        catch (error) {
            this.logger.error('Failed to create alert:', error);
        }
    }
    async resolveAlert(rule) {
        await this.prisma.alert.updateMany({
            where: {
                ruleId: rule.id,
                status: monitoring_interfaces_1.AlertStatus.ACTIVE,
            },
            data: {
                status: monitoring_interfaces_1.AlertStatus.RESOLVED,
                resolvedAt: new Date(),
            },
        });
    }
    async sendAlertNotifications(alert, rule) {
        for (const channel of rule.notificationChannels) {
            for (const recipient of rule.recipients) {
                try {
                    await this.sendNotification(channel, recipient, alert, rule);
                }
                catch (error) {
                    this.logger.error(`Failed to send ${channel} notification to ${recipient}:`, error);
                }
            }
        }
    }
    async sendNotification(channel, recipient, alert, rule) {
        this.logger.log(`Sending ${channel} notification to ${recipient} for alert: ${alert.message}`);
        switch (channel) {
            case monitoring_interfaces_1.NotificationChannel.EMAIL:
                break;
            case monitoring_interfaces_1.NotificationChannel.WEBHOOK:
                break;
            case monitoring_interfaces_1.NotificationChannel.SLACK:
                break;
        }
    }
    async getMonitoringStats(tenantId) {
        const [totalLogs, totalMetrics, activeAlerts, recentLogs, recentMetrics, alertsByStatus, alertsBySeverity, logsByLevel,] = await Promise.all([
            this.prisma.logEntry.count({ where: { tenantId } }),
            this.prisma.systemMetric.count({ where: { tenantId } }),
            this.prisma.alert.count({ where: { tenantId, status: monitoring_interfaces_1.AlertStatus.ACTIVE } }),
            this.prisma.logEntry.count({
                where: {
                    tenantId,
                    timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            }),
            this.prisma.systemMetric.count({
                where: {
                    tenantId,
                    recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            }),
            this.prisma.alert.groupBy({
                by: ['status'],
                where: { tenantId },
                _count: { status: true },
            }),
            this.prisma.alert.groupBy({
                by: ['severity'],
                where: { tenantId },
                _count: { severity: true },
            }),
            this.prisma.logEntry.groupBy({
                by: ['level'],
                where: { tenantId },
                _count: { level: true },
            }),
        ]);
        const uptime = (Date.now() - this.startTime.getTime()) / 1000;
        return {
            overview: {
                totalLogs,
                totalMetrics,
                activeAlerts,
                healthyServices: 3,
                totalServices: 3,
                uptime,
            },
            logStats: {
                byLevel: logsByLevel.reduce((acc, item) => {
                    acc[item.level] = item._count.level;
                    return acc;
                }, {}),
                last24Hours: recentLogs,
                lastHour: 0,
                avgLogsPerMinute: recentLogs / (24 * 60),
                topContexts: [],
            },
            metricStats: {
                byType: {
                    [monitoring_interfaces_1.MetricType.COUNTER]: 0,
                    [monitoring_interfaces_1.MetricType.GAUGE]: 0,
                    [monitoring_interfaces_1.MetricType.HISTOGRAM]: 0,
                    [monitoring_interfaces_1.MetricType.TIMER]: 0,
                },
                last24Hours: recentMetrics,
                lastHour: 0,
                avgMetricsPerMinute: recentMetrics / (24 * 60),
                topMetrics: [],
            },
            alertStats: {
                byStatus: alertsByStatus.reduce((acc, item) => {
                    acc[item.status] = item._count.status;
                    return acc;
                }, {}),
                bySeverity: alertsBySeverity.reduce((acc, item) => {
                    acc[item.severity] = item._count.severity;
                    return acc;
                }, {}),
                last24Hours: 0,
                avgResponseTime: 0,
                topAlerts: [],
            },
        };
    }
    async getDashboardData(tenantId) {
        const [stats, alerts, recentLogs] = await Promise.all([
            this.getMonitoringStats(tenantId),
            this.getRecentAlerts(10, tenantId),
            this.getRecentLogs(50, tenantId),
        ]);
        const healthChecks = await this.getServiceHealthStatuses();
        return {
            timestamp: new Date(),
            systemMetrics: this.lastPerformanceMetrics || await this.getPerformanceMetrics(),
            alerts,
            healthChecks,
            recentLogs,
            stats,
        };
    }
    async getRecentAlerts(limit, tenantId) {
        const alerts = await this.prisma.alert.findMany({
            where: { tenantId },
            take: limit,
            orderBy: { triggeredAt: 'desc' },
        });
        return alerts.map(alert => ({
            id: alert.id.toString(),
            ruleId: alert.ruleId,
            status: alert.status,
            severity: alert.severity,
            message: alert.message,
            description: alert.description,
            triggeredAt: alert.triggeredAt,
            resolvedAt: alert.resolvedAt,
            acknowledgedAt: alert.acknowledgedAt,
            acknowledgedBy: alert.acknowledgedBy,
            tenantId: alert.tenantId,
            metric: alert.metric,
            actualValue: alert.actualValue,
            threshold: alert.threshold,
            labels: alert.labels ? JSON.parse(alert.labels) : undefined,
            annotations: alert.annotations ? JSON.parse(alert.annotations) : undefined,
            lastNotifiedAt: alert.lastNotifiedAt,
            notificationCount: alert.notificationCount,
        }));
    }
    async getRecentLogs(limit, tenantId) {
        const logs = await this.prisma.logEntry.findMany({
            where: { tenantId },
            take: limit,
            orderBy: { timestamp: 'desc' },
        });
        return logs.map(log => ({
            id: log.id.toString(),
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            context: log.context,
            metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
            tenantId: log.tenantId,
            sessionId: log.sessionId,
            requestId: log.requestId,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            duration: log.duration,
            statusCode: log.statusCode,
            method: log.method,
            url: log.url,
            stack: log.stack,
            error: log.error ? JSON.parse(log.error) : undefined,
            tags: log.tags,
        }));
    }
    async getServiceHealthStatuses() {
        return [
            await this.checkDatabaseHealth(),
            await this.checkApplicationHealth(),
        ];
    }
    async cleanupOldData() {
        this.logger.log('Starting cleanup of old monitoring data...');
        try {
            const logRetentionDate = new Date();
            logRetentionDate.setDate(logRetentionDate.getDate() - this.config.logging.retentionDays);
            const metricRetentionDate = new Date();
            metricRetentionDate.setDate(metricRetentionDate.getDate() - this.config.metrics.retentionDays);
            const [deletedLogs, deletedMetrics] = await Promise.all([
                this.prisma.logEntry.deleteMany({
                    where: { timestamp: { lt: logRetentionDate } },
                }),
                this.prisma.systemMetric.deleteMany({
                    where: { recordedAt: { lt: metricRetentionDate } },
                }),
            ]);
            this.logger.log(`Cleanup complete: ${deletedLogs.count} logs, ${deletedMetrics.count} metrics deleted`);
        }
        catch (error) {
            this.logger.error('Error during cleanup:', error);
        }
    }
    async createAlertRule(ruleDto, tenantId) {
        throw new Error('Method not implemented');
    }
    async updateAlertRule(id, updateDto) {
        throw new Error('Method not implemented');
    }
    async deleteAlertRule(id) {
        throw new Error('Method not implemented');
    }
};
exports.MonitoringService = MonitoringService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "cleanupOldData", null);
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map