import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../config/prisma.service';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  LogEntry,
  SystemMetric,
  PerformanceMetrics,
  HealthCheck,
  ServiceHealth,
  Alert,
  AlertRule,
  MonitoringConfiguration,
  LogQuery,
  MetricQuery,
  MonitoringStats,
  DashboardData,
  NotificationTemplate,
  MaintenanceWindow,
  LogLevel,
  MetricType,
  AlertSeverity,
  HealthStatus,
  AlertStatus,
  NotificationChannel,
} from './interfaces/monitoring.interfaces';

import {
  CreateLogEntryDto,
  LogQueryDto,
  CreateMetricDto,
  MetricQueryDto,
  CreateAlertRuleDto,
  UpdateAlertRuleDto,
  AlertQueryDto,
  CreateHealthCheckDto,
  CreateNotificationTemplateDto,
  CreateMaintenanceWindowDto,
  MonitoringConfigurationDto,
} from './dto/monitoring.dto';

@Injectable()
export class MonitoringService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitoringService.name);
  private config: MonitoringConfiguration;
  private metricsCollectionInterval: NodeJS.Timeout;
  private healthCheckInterval: NodeJS.Timeout;
  private alertCheckInterval: NodeJS.Timeout;
  private logFileHandle: any;
  private startTime: Date = new Date();
  private metricsCache: Map<string, SystemMetric[]> = new Map();
  private lastPerformanceMetrics: PerformanceMetrics;
  private maintenanceWindows: MaintenanceWindow[] = [];

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
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
    } else {
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

  // ===== CONFIGURATION =====

  private initializeConfiguration() {
    this.config = {
      enabled: this.configService.get('MONITORING_ENABLED', true),
      logging: {
        enabled: this.configService.get('LOG_ENABLED', true),
        level: this.configService.get('LOG_LEVEL', LogLevel.INFO),
        enableConsole: this.configService.get('LOG_ENABLE_CONSOLE', true),
        enableFile: this.configService.get('LOG_ENABLE_FILE', true),
        enableDatabase: this.configService.get('LOG_ENABLE_DATABASE', true),
        filePath: this.configService.get('LOG_FILE_PATH', './logs'),
        maxFileSize: this.configService.get('LOG_MAX_FILE_SIZE', 10), // MB
        maxFiles: this.configService.get('LOG_MAX_FILES', 5),
        enableRotation: this.configService.get('LOG_ENABLE_ROTATION', true),
        retentionDays: this.configService.get('LOG_RETENTION_DAYS', 30),
      },
      metrics: {
        enabled: this.configService.get('METRICS_ENABLED', true),
        collectionInterval: this.configService.get('METRICS_COLLECTION_INTERVAL', 30), // seconds
        retentionDays: this.configService.get('METRICS_RETENTION_DAYS', 7),
        enableSystemMetrics: this.configService.get('METRICS_ENABLE_SYSTEM', true),
        enableApplicationMetrics: this.configService.get('METRICS_ENABLE_APPLICATION', true),
        enableDatabaseMetrics: this.configService.get('METRICS_ENABLE_DATABASE', true),
        customMetrics: this.configService.get('METRICS_ENABLE_CUSTOM', true),
      },
      healthChecks: {
        enabled: this.configService.get('HEALTH_CHECKS_ENABLED', true),
        interval: this.configService.get('HEALTH_CHECK_INTERVAL', 60), // seconds
        timeout: this.configService.get('HEALTH_CHECK_TIMEOUT', 5000), // ms
        retries: this.configService.get('HEALTH_CHECK_RETRIES', 3),
        services: this.configService.get('HEALTH_CHECK_SERVICES', 'database,redis').split(','),
      },
      alerting: {
        enabled: this.configService.get('ALERTING_ENABLED', true),
        checkInterval: this.configService.get('ALERT_CHECK_INTERVAL', 30), // seconds
        defaultCooldown: this.configService.get('ALERT_DEFAULT_COOLDOWN', 300), // seconds
        maxAlertsPerHour: this.configService.get('ALERT_MAX_PER_HOUR', 50),
        enableEmailNotifications: this.configService.get('ALERT_ENABLE_EMAIL', true),
        enableWebhookNotifications: this.configService.get('ALERT_ENABLE_WEBHOOK', true),
      },
      realtime: {
        enabled: this.configService.get('REALTIME_MONITORING_ENABLED', true),
        websocketPort: this.configService.get('REALTIME_WEBSOCKET_PORT', 3001),
        updateInterval: this.configService.get('REALTIME_UPDATE_INTERVAL', 5000), // ms
        enableBroadcast: this.configService.get('REALTIME_ENABLE_BROADCAST', true),
      },
    };
  }

  async updateConfiguration(configDto: MonitoringConfigurationDto): Promise<MonitoringConfiguration> {
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

    // Restart services with new configuration
    await this.onModuleDestroy();
    await this.onModuleInit();

    return this.config;
  }

  getConfiguration(): MonitoringConfiguration {
    return this.config;
  }

  // ===== LOGGING =====

  private async setupLogFile() {
    if (!this.config.logging.enableFile) return;

    try {
      const logDir = this.config.logging.filePath || './logs';
      await fs.mkdir(logDir, { recursive: true });

      const logFile = path.join(logDir, `monitoring-${new Date().toISOString().split('T')[0]}.log`);
      this.logFileHandle = await fs.open(logFile, 'a');

      this.logger.log(`Log file setup complete: ${logFile}`);
    } catch (error) {
      this.logger.error('Failed to setup log file:', error);
    }
  }

  async createLogEntry(logDto: CreateLogEntryDto, tenantId?: number): Promise<LogEntry> {
    const logEntry: LogEntry = {
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
      // Write to console
      if (this.config.logging.enableConsole && this.shouldLogLevel(logDto.level)) {
        this.writeToConsole(logEntry);
      }

      // Write to file
      if (this.config.logging.enableFile && this.logFileHandle) {
        await this.writeToFile(logEntry);
      }

      // Write to database
      if (this.config.logging.enableDatabase) {
        await this.writeToDatabase(logEntry);
      }

      // Emit real-time event
      this.emit('log', logEntry);

      return logEntry;
    } catch (error) {
      this.logger.error('Failed to create log entry:', error);
      throw error;
    }
  }

  private shouldLogLevel(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.VERBOSE];
    const configLevelIndex = levels.indexOf(this.config.logging.level);
    const entryLevelIndex = levels.indexOf(level);
    return entryLevelIndex <= configLevelIndex;
  }

  private writeToConsole(logEntry: LogEntry) {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase().padEnd(7);
    const context = logEntry.context ? `[${logEntry.context}]` : '';
    const message = `${timestamp} ${level} ${context} ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(message, logEntry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, logEntry.metadata);
        break;
      default:
        console.log(message, logEntry.metadata);
    }
  }

  private async writeToFile(logEntry: LogEntry) {
    if (!this.logFileHandle) return;

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

  private async writeToDatabase(logEntry: LogEntry) {
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
    } catch (error) {
      this.logger.error('Failed to write log to database:', error);
      // Don't throw here to prevent infinite loop
    }
  }

  async queryLogs(query: LogQueryDto, tenantId?: number): Promise<{ logs: LogEntry[]; total: number }> {
    try {
      const where: any = {};

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
      const orderBy: any = {};

      if (query.sortBy) {
        orderBy[query.sortBy] = query.sortOrder || 'desc';
      } else {
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
          level: log.level as LogLevel,
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
    } catch (error) {
      this.logger.error('Failed to query logs:', error);
      throw error;
    }
  }

  // Convenient logging methods
  async logError(message: string, context?: string, metadata?: any, tenantId?: number): Promise<void> {
    await this.createLogEntry({
      level: LogLevel.ERROR,
      message,
      context,
      metadata,
    }, tenantId);
  }

  async logWarn(message: string, context?: string, metadata?: any, tenantId?: number): Promise<void> {
    await this.createLogEntry({
      level: LogLevel.WARN,
      message,
      context,
      metadata,
    }, tenantId);
  }

  async logInfo(message: string, context?: string, metadata?: any, tenantId?: number): Promise<void> {
    await this.createLogEntry({
      level: LogLevel.INFO,
      message,
      context,
      metadata,
    }, tenantId);
  }

  async logDebug(message: string, context?: string, metadata?: any, tenantId?: number): Promise<void> {
    await this.createLogEntry({
      level: LogLevel.DEBUG,
      message,
      context,
      metadata,
    }, tenantId);
  }

  // ===== METRICS COLLECTION =====

  private async startMetricsCollection() {
    if (!this.config.metrics.enabled) return;

    this.logger.log('Starting metrics collection...');

    // Collect initial metrics
    await this.collectSystemMetrics();

    // Schedule regular collection
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        this.logger.error('Error collecting metrics:', error);
      }
    }, this.config.metrics.collectionInterval * 1000);
  }

  private async collectSystemMetrics() {
    const timestamp = new Date();
    const metrics: SystemMetric[] = [];

    try {
      if (this.config.metrics.enableSystemMetrics) {
        // CPU Metrics
        const cpus = os.cpus();
        const loadAverage = os.loadavg();

        metrics.push({
          timestamp,
          name: 'system.cpu.usage',
          type: MetricType.GAUGE,
          value: this.calculateCPUUsage(),
          unit: 'percent',
          labels: { component: 'system' },
          source: 'system',
        });

        metrics.push({
          timestamp,
          name: 'system.cpu.load_average',
          type: MetricType.GAUGE,
          value: loadAverage[0],
          unit: 'load',
          labels: { component: 'system', period: '1min' },
          source: 'system',
        });

        // Memory Metrics
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = process.memoryUsage();

        metrics.push({
          timestamp,
          name: 'system.memory.total',
          type: MetricType.GAUGE,
          value: totalMemory,
          unit: 'bytes',
          labels: { component: 'system' },
          source: 'system',
        });

        metrics.push({
          timestamp,
          name: 'system.memory.used',
          type: MetricType.GAUGE,
          value: usedMemory,
          unit: 'bytes',
          labels: { component: 'system' },
          source: 'system',
        });

        metrics.push({
          timestamp,
          name: 'system.memory.free',
          type: MetricType.GAUGE,
          value: freeMemory,
          unit: 'bytes',
          labels: { component: 'system' },
          source: 'system',
        });

        metrics.push({
          timestamp,
          name: 'application.memory.heap_used',
          type: MetricType.GAUGE,
          value: memoryUsage.heapUsed,
          unit: 'bytes',
          labels: { component: 'application' },
          source: 'application',
        });
      }

      if (this.config.metrics.enableApplicationMetrics) {
        // Application Metrics
        const uptime = process.uptime();

        metrics.push({
          timestamp,
          name: 'application.uptime',
          type: MetricType.GAUGE,
          value: uptime,
          unit: 'seconds',
          labels: { component: 'application' },
          source: 'application',
        });

        // Add process-specific metrics here
      }

      // Store metrics
      for (const metric of metrics) {
        await this.createMetric(metric);
      }

      // Cache latest metrics for dashboard
      const performanceMetrics: PerformanceMetrics = await this.getPerformanceMetrics();
      this.lastPerformanceMetrics = performanceMetrics;

      // Emit real-time event
      this.emit('metrics', performanceMetrics);

      this.logger.debug(`Collected ${metrics.length} metrics`);
    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  private calculateCPUUsage(): number {
    // Simplified CPU usage calculation
    // In a real implementation, you'd track CPU times over intervals
    return Math.min(os.loadavg()[0] * 10, 100);
  }

  async createMetric(metricDto: CreateMetricDto | SystemMetric, tenantId?: number): Promise<SystemMetric> {
    try {
      const metric: SystemMetric = {
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

      // Store in database
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

      // Cache for quick access
      const cacheKey = `${metric.name}-${tenantId || 'global'}`;
      if (!this.metricsCache.has(cacheKey)) {
        this.metricsCache.set(cacheKey, []);
      }

      const cached = this.metricsCache.get(cacheKey)!;
      cached.push(metric);

      // Keep only last 100 metrics in cache
      if (cached.length > 100) {
        cached.shift();
      }

      return metric;
    } catch (error) {
      this.logger.error('Failed to create metric:', error);
      throw error;
    }
  }

  async queryMetrics(query: MetricQueryDto, tenantId?: number): Promise<SystemMetric[]> {
    try {
      const where: any = {};

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
        type: metric.metricType as MetricType,
        value: metric.value,
        unit: metric.unit,
        labels: metric.metadata ? metric.metadata : undefined,
        tenantId: metric.tenantId,
        source: metric.component,
        description: metric.tags?.join(', '),
      }));
    } catch (error) {
      this.logger.error('Failed to query metrics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const timestamp = new Date();

    // System metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = this.calculateCPUUsage();
    const loadAverage = os.loadavg();
    const uptime = process.uptime();

    // Application metrics (simplified - in real app, you'd track these)
    const applicationMetrics = {
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      activeConnections: 0, // Would be tracked by connection pool
      totalRequests: 0, // Would be tracked by request counter
      requestsPerSecond: 0, // Calculated from request counter
      errorRate: 0, // Calculated from error counter
      averageResponseTime: 0, // Tracked by timing middleware
      p95ResponseTime: 0,
      p99ResponseTime: 0,
    };

    // Database metrics (simplified)
    const databaseMetrics = {
      connections: {
        active: 5, // Would get from Prisma connection pool
        idle: 5,
        total: 10,
      },
      queries: {
        total: 0, // Would be tracked
        slow: 0,
        failed: 0,
        averageTime: 0,
      },
      size: 0, // Would get from database statistics
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
        used: 0, // Would implement disk usage check
        total: 0,
        free: 0,
        percentage: 0,
      },
      network: {
        bytesIn: 0, // Would track network I/O
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
      },
      application: applicationMetrics,
      database: databaseMetrics,
    };
  }

  // ===== HEALTH CHECKS =====

  private async startHealthChecks() {
    if (!this.config.healthChecks.enabled) return;

    this.logger.log('Starting health checks...');

    // Perform initial health check
    await this.performHealthChecks();

    // Schedule regular health checks
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        this.logger.error('Error performing health checks:', error);
      }
    }, this.config.healthChecks.interval * 1000);
  }

  private async performHealthChecks() {
    const services = this.config.healthChecks.services;
    const healthChecks: ServiceHealth[] = [];

    for (const serviceName of services) {
      try {
        const health = await this.checkServiceHealth(serviceName);
        healthChecks.push(health);
      } catch (error) {
        this.logger.error(`Health check failed for ${serviceName}:`, error);
        healthChecks.push({
          service: serviceName,
          status: HealthStatus.UNHEALTHY,
          checks: [{
            name: `${serviceName}-check`,
            status: HealthStatus.UNHEALTHY,
            message: error.message,
            timestamp: new Date(),
          }],
          lastChecked: new Date(),
          uptime: 0,
        });
      }
    }

    // Emit real-time event
    this.emit('health', healthChecks);

    this.logger.debug(`Performed health checks for ${services.length} services`);
  }

  private async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

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

  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      const duration = Date.now() - startTime;

      return {
        service: 'database',
        status: HealthStatus.HEALTHY,
        checks: [{
          name: 'database-connection',
          status: HealthStatus.HEALTHY,
          message: 'Database connection successful',
          timestamp: new Date(),
          duration,
        }],
        lastChecked: new Date(),
        uptime: (Date.now() - this.startTime.getTime()) / 1000,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        service: 'database',
        status: HealthStatus.UNHEALTHY,
        checks: [{
          name: 'database-connection',
          status: HealthStatus.UNHEALTHY,
          message: `Database connection failed: ${error.message}`,
          timestamp: new Date(),
          duration,
        }],
        lastChecked: new Date(),
        uptime: 0,
      };
    }
  }

  private async checkRedisHealth(): Promise<ServiceHealth> {
    // Simplified Redis health check
    // In real implementation, you'd check actual Redis connection
    return {
      service: 'redis',
      status: HealthStatus.HEALTHY,
      checks: [{
        name: 'redis-connection',
        status: HealthStatus.HEALTHY,
        message: 'Redis connection healthy',
        timestamp: new Date(),
        duration: 5,
      }],
      lastChecked: new Date(),
      uptime: (Date.now() - this.startTime.getTime()) / 1000,
    };
  }

  private async checkApplicationHealth(): Promise<ServiceHealth> {
    const memoryUsage = process.memoryUsage();
    const isHealthy = memoryUsage.heapUsed < (512 * 1024 * 1024); // 512MB threshold

    return {
      service: 'application',
      status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      checks: [{
        name: 'memory-usage',
        status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        message: `Heap used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        timestamp: new Date(),
        metadata: { heapUsed: memoryUsage.heapUsed },
      }],
      lastChecked: new Date(),
      uptime: process.uptime(),
    };
  }

  // ===== ALERT PROCESSING =====

  private async startAlertProcessing() {
    if (!this.config.alerting.enabled) return;

    this.logger.log('Starting alert processing...');

    // Process alerts initially
    await this.processAlerts();

    // Schedule regular alert processing
    this.alertCheckInterval = setInterval(async () => {
      try {
        await this.processAlerts();
      } catch (error) {
        this.logger.error('Error processing alerts:', error);
      }
    }, this.config.alerting.checkInterval * 1000);
  }

  private async processAlerts() {
    try {
      const alertRules = await this.getActiveAlertRules();

      for (const rule of alertRules) {
        await this.evaluateAlertRule(rule);
      }
    } catch (error) {
      this.logger.error('Error processing alerts:', error);
    }
  }

  private async getActiveAlertRules(): Promise<AlertRule[]> {
    const rules = await this.prisma.alertRule.findMany({
      where: { enabled: true },
    });

    return rules.map(rule => ({
      id: rule.id.toString(),
      name: rule.name,
      description: rule.description,
      metric: rule.metric,
      condition: rule.condition as 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte',
      threshold: rule.threshold,
      severity: rule.severity as AlertSeverity,
      enabled: rule.enabled,
      tenantId: rule.tenantId,
      duration: rule.duration,
      cooldown: rule.cooldown,
      notificationChannels: rule.notificationChannels as NotificationChannel[],
      recipients: rule.recipients,
      labels: rule.labels ? JSON.parse(rule.labels) : undefined,
      annotations: rule.annotations ? JSON.parse(rule.annotations) : undefined,
      runbook: rule.runbook,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    }));
  }

  private async evaluateAlertRule(rule: AlertRule) {
    try {
      // Get latest metric value
      const latestMetric = await this.getLatestMetricValue(rule.metric, rule.tenantId);

      if (!latestMetric) {
        this.logger.debug(`No metric data found for rule: ${rule.name}`);
        return;
      }

      // Evaluate condition
      const isTriggered = this.evaluateCondition(
        latestMetric.value,
        rule.condition,
        rule.threshold
      );

      if (isTriggered) {
        await this.triggerAlert(rule, latestMetric);
      } else {
        await this.resolveAlert(rule);
      }
    } catch (error) {
      this.logger.error(`Error evaluating alert rule ${rule.name}:`, error);
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
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

  private async getLatestMetricValue(metricName: string, tenantId?: number): Promise<SystemMetric | null> {
    const metric = await this.prisma.systemMetric.findFirst({
      where: {
        metricName,
        tenantId,
      },
      orderBy: { recordedAt: 'desc' },
    });

    if (!metric) return null;

    return {
      id: metric.id.toString(),
      timestamp: metric.recordedAt,
      name: metric.metricName,
      type: metric.metricType as MetricType,
      value: metric.value,
      unit: metric.unit,
      tenantId: metric.tenantId,
    };
  }

  private async triggerAlert(rule: AlertRule, metric: SystemMetric) {
    // Check if there's already an active alert for this rule
    const existingAlert = await this.prisma.alert.findFirst({
      where: {
        ruleId: rule.id,
        status: AlertStatus.ACTIVE,
      },
    });

    if (existingAlert) {
      this.logger.debug(`Alert already active for rule: ${rule.name}`);
      return;
    }

    // Create new alert
    const alert: Alert = {
      ruleId: rule.id!,
      status: AlertStatus.ACTIVE,
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

      // Send notifications
      await this.sendAlertNotifications(alert, rule);

      // Emit real-time event
      this.emit('alert', alert);

      this.logger.warn(`Alert triggered: ${alert.message}`);
    } catch (error) {
      this.logger.error('Failed to create alert:', error);
    }
  }

  private async resolveAlert(rule: AlertRule) {
    await this.prisma.alert.updateMany({
      where: {
        ruleId: rule.id,
        status: AlertStatus.ACTIVE,
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }

  private async sendAlertNotifications(alert: Alert, rule: AlertRule) {
    for (const channel of rule.notificationChannels) {
      for (const recipient of rule.recipients) {
        try {
          await this.sendNotification(channel, recipient, alert, rule);
        } catch (error) {
          this.logger.error(`Failed to send ${channel} notification to ${recipient}:`, error);
        }
      }
    }
  }

  private async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    alert: Alert,
    rule: AlertRule
  ) {
    // Simplified notification sending
    // In real implementation, you'd integrate with email services, Slack, etc.
    this.logger.log(`Sending ${channel} notification to ${recipient} for alert: ${alert.message}`);

    switch (channel) {
      case NotificationChannel.EMAIL:
        // Send email notification
        break;
      case NotificationChannel.WEBHOOK:
        // Send webhook notification
        break;
      case NotificationChannel.SLACK:
        // Send Slack notification
        break;
      // Add other notification channels
    }
  }

  // ===== STATISTICS AND DASHBOARD =====

  async getMonitoringStats(tenantId?: number): Promise<MonitoringStats> {
    const [
      totalLogs,
      totalMetrics,
      activeAlerts,
      recentLogs,
      recentMetrics,
      alertsByStatus,
      alertsBySeverity,
      logsByLevel,
    ] = await Promise.all([
      this.prisma.logEntry.count({ where: { tenantId } }),
      this.prisma.systemMetric.count({ where: { tenantId } }),
      this.prisma.alert.count({ where: { tenantId, status: AlertStatus.ACTIVE } }),
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
        healthyServices: 3, // Would calculate from actual health checks
        totalServices: 3,
        uptime,
      },
      logStats: {
        byLevel: logsByLevel.reduce((acc, item) => {
          acc[item.level as LogLevel] = item._count.level;
          return acc;
        }, {} as Record<LogLevel, number>),
        last24Hours: recentLogs,
        lastHour: 0, // Would implement hour-based counting
        avgLogsPerMinute: recentLogs / (24 * 60),
        topContexts: [], // Would implement context grouping
      },
      metricStats: {
        byType: {
          [MetricType.COUNTER]: 0,
          [MetricType.GAUGE]: 0,
          [MetricType.HISTOGRAM]: 0,
          [MetricType.TIMER]: 0,
        }, // Would implement type grouping
        last24Hours: recentMetrics,
        lastHour: 0,
        avgMetricsPerMinute: recentMetrics / (24 * 60),
        topMetrics: [],
      },
      alertStats: {
        byStatus: alertsByStatus.reduce((acc, item) => {
          acc[item.status as AlertStatus] = item._count.status;
          return acc;
        }, {} as Record<AlertStatus, number>),
        bySeverity: alertsBySeverity.reduce((acc, item) => {
          acc[item.severity as AlertSeverity] = item._count.severity;
          return acc;
        }, {} as Record<AlertSeverity, number>),
        last24Hours: 0,
        avgResponseTime: 0,
        topAlerts: [],
      },
    };
  }

  async getDashboardData(tenantId?: number): Promise<DashboardData> {
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

  private async getRecentAlerts(limit: number, tenantId?: number): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { triggeredAt: 'desc' },
    });

    return alerts.map(alert => ({
      id: alert.id.toString(),
      ruleId: alert.ruleId,
      status: alert.status as AlertStatus,
      severity: alert.severity as AlertSeverity,
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

  private async getRecentLogs(limit: number, tenantId?: number): Promise<LogEntry[]> {
    const logs = await this.prisma.logEntry.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return logs.map(log => ({
      id: log.id.toString(),
      timestamp: log.timestamp,
      level: log.level as LogLevel,
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

  private async getServiceHealthStatuses(): Promise<ServiceHealth[]> {
    // Return cached health statuses or perform quick check
    return [
      await this.checkDatabaseHealth(),
      await this.checkApplicationHealth(),
    ];
  }

  // ===== CLEANUP TASKS =====

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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

      this.logger.log(
        `Cleanup complete: ${deletedLogs.count} logs, ${deletedMetrics.count} metrics deleted`
      );
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }

  // ===== PUBLIC API METHODS =====

  // Additional methods for alert management, health checks, etc.
  // These would be exposed through the controller

  async createAlertRule(ruleDto: CreateAlertRuleDto, tenantId?: number): Promise<AlertRule> {
    // Implementation for creating alert rules
    throw new Error('Method not implemented');
  }

  async updateAlertRule(id: string, updateDto: UpdateAlertRuleDto): Promise<AlertRule> {
    // Implementation for updating alert rules
    throw new Error('Method not implemented');
  }

  async deleteAlertRule(id: string): Promise<void> {
    // Implementation for deleting alert rules
    throw new Error('Method not implemented');
  }
}