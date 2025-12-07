import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MonitoringService } from './monitoring.service';
import {
  CreateLogEntryDto,
  LogQueryDto,
  CreateMetricDto,
  MetricQueryDto,
  CreateAlertRuleDto,
  UpdateAlertRuleDto,
  AlertQueryDto,
  AcknowledgeAlertDto,
  ResolveAlertDto,
  CreateHealthCheckDto,
  CreateNotificationTemplateDto,
  SendTestNotificationDto,
  CreateMaintenanceWindowDto,
  MonitoringConfigurationDto,
} from './dto/monitoring.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';

@ApiTags('Monitoring')
@Controller('monitoring')
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  // ===== CONFIGURATION =====

  @Get('config')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get monitoring configuration' })
  @ApiResponse({ status: 200, description: 'Current monitoring configuration' })
  getConfiguration() {
    return this.monitoringService.getConfiguration();
  }

  @Patch('config')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update monitoring configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid configuration' })
  updateConfiguration(@Body() configDto: MonitoringConfigurationDto) {
    return this.monitoringService.updateConfiguration(configDto);
  }

  // ===== LOGGING =====

  @Post('logs')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create log entry' })
  @ApiResponse({ status: 201, description: 'Log entry created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid log entry data' })
  createLogEntry(
    @Body() logDto: CreateLogEntryDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.monitoringService.createLogEntry(logDto, tenantId);
  }

  @Get('logs')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Query log entries with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Log entries retrieved successfully' })
  @ApiQuery({ name: 'levels', required: false, description: 'Filter by log levels' })
  @ApiQuery({ name: 'startTime', required: false, description: 'Start time filter' })
  @ApiQuery({ name: 'endTime', required: false, description: 'End time filter' })
  @ApiQuery({ name: 'context', required: false, description: 'Context filter' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in message' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort direction' })
  queryLogs(
    @Query() query: LogQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.monitoringService.queryLogs(query, requestingUserTenantId);
  }

  @Get('logs/contexts')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get available log contexts' })
  @ApiResponse({ status: 200, description: 'Available log contexts' })
  getLogContexts(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would return distinct contexts from logs
    return { contexts: ['AuthService', 'UserService', 'MonitoringService', 'DatabaseService'] };
  }

  @Get('logs/export')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Export logs to file' })
  @ApiResponse({ status: 200, description: 'Logs exported successfully' })
  exportLogs(
    @Query() query: LogQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    // Implementation would export logs to CSV/JSON file
    return { message: 'Export functionality coming soon' };
  }

  // ===== METRICS =====

  @Post('metrics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create custom metric' })
  @ApiResponse({ status: 201, description: 'Metric created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid metric data' })
  createMetric(
    @Body() metricDto: CreateMetricDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.monitoringService.createMetric(metricDto, tenantId);
  }

  @Get('metrics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Query metrics with filtering' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  @ApiQuery({ name: 'names', required: false, description: 'Metric names to query' })
  @ApiQuery({ name: 'startTime', required: false, description: 'Start time filter' })
  @ApiQuery({ name: 'endTime', required: false, description: 'End time filter' })
  @ApiQuery({ name: 'labels', required: false, description: 'Label filters' })
  @ApiQuery({ name: 'aggregation', required: false, description: 'Aggregation function' })
  @ApiQuery({ name: 'interval', required: false, description: 'Aggregation interval' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum data points' })
  queryMetrics(
    @Query() query: MetricQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.monitoringService.queryMetrics(query, requestingUserTenantId);
  }

  @Get('metrics/performance')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get current system performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  getPerformanceMetrics() {
    return this.monitoringService.getPerformanceMetrics();
  }

  @Get('metrics/names')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get available metric names' })
  @ApiResponse({ status: 200, description: 'Available metric names' })
  getMetricNames(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would return distinct metric names
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

  // ===== ALERTS =====

  @Post('alerts/rules')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create alert rule' })
  @ApiResponse({ status: 201, description: 'Alert rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid alert rule data' })
  createAlertRule(
    @Body() ruleDto: CreateAlertRuleDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.monitoringService.createAlertRule(ruleDto, tenantId);
  }

  @Get('alerts/rules')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all alert rules' })
  @ApiResponse({ status: 200, description: 'Alert rules retrieved successfully' })
  getAlertRules(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would return alert rules
    return { rules: [], total: 0 };
  }

  @Get('alerts/rules/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get alert rule by ID' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule details' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  getAlertRule(@Param('id') id: string) {
    // Implementation would return specific alert rule
    return { message: 'Alert rule details' };
  }

  @Patch('alerts/rules/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  updateAlertRule(
    @Param('id') id: string,
    @Body() updateDto: UpdateAlertRuleDto,
  ) {
    return this.monitoringService.updateAlertRule(id, updateDto);
  }

  @Delete('alerts/rules/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete alert rule' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlertRule(@Param('id') id: string) {
    return this.monitoringService.deleteAlertRule(id);
  }

  @Get('alerts')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Query alerts with filtering' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by alert status' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by alert severity' })
  @ApiQuery({ name: 'startTime', required: false, description: 'Start time filter' })
  @ApiQuery({ name: 'endTime', required: false, description: 'End time filter' })
  @ApiQuery({ name: 'metric', required: false, description: 'Filter by metric name' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in alert message' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  queryAlerts(
    @Query() query: AlertQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would return filtered alerts
    return { alerts: [], total: 0 };
  }

  @Post('alerts/:id/acknowledge')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Acknowledge alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  acknowledgeAlert(
    @Param('id') id: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
    @CurrentUser() user: any,
  ) {
    // Implementation would acknowledge alert
    return { message: 'Alert acknowledged', acknowledgedBy: user.id };
  }

  @Post('alerts/:id/resolve')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Resolve alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  resolveAlert(
    @Param('id') id: string,
    @Body() resolveDto: ResolveAlertDto,
    @CurrentUser() user: any,
  ) {
    // Implementation would resolve alert
    return { message: 'Alert resolved', resolvedBy: user.id };
  }

  @Get('alerts/statistics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiResponse({ status: 200, description: 'Alert statistics' })
  getAlertStatistics(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    // Implementation would return alert statistics
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      resolvedAlerts: 0,
      acknowledgedAlerts: 0,
      alertsBySeverity: {},
      alertsByRule: [],
    };
  }

  // ===== HEALTH CHECKS =====

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health information' })
  getSystemHealth() {
    // Implementation would return comprehensive health status
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: [],
      uptime: process.uptime(),
    };
  }

  @Get('health/services')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get detailed service health checks' })
  @ApiResponse({ status: 200, description: 'Service health details' })
  getServiceHealth() {
    // Implementation would return detailed service health
    return { services: [] };
  }

  @Post('health/checks')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create custom health check' })
  @ApiResponse({ status: 201, description: 'Health check created successfully' })
  createHealthCheck(@Body() healthCheckDto: CreateHealthCheckDto) {
    // Implementation would create custom health check
    return { message: 'Health check created' };
  }

  @Post('health/checks/:id/run')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Run specific health check' })
  @ApiParam({ name: 'id', description: 'Health check ID' })
  @ApiResponse({ status: 200, description: 'Health check executed successfully' })
  runHealthCheck(@Param('id') id: string) {
    // Implementation would execute specific health check
    return { message: 'Health check executed', status: 'healthy' };
  }

  // ===== NOTIFICATIONS =====

  @Get('notifications/templates')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get notification templates' })
  @ApiResponse({ status: 200, description: 'Notification templates retrieved' })
  getNotificationTemplates(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    // Implementation would return notification templates
    return { templates: [] };
  }

  @Post('notifications/templates')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  createNotificationTemplate(
    @Body() templateDto: CreateNotificationTemplateDto,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would create notification template
    return { message: 'Template created' };
  }

  @Post('notifications/test')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  sendTestNotification(@Body() testDto: SendTestNotificationDto) {
    // Implementation would send test notification
    return { message: 'Test notification sent' };
  }

  // ===== MAINTENANCE WINDOWS =====

  @Get('maintenance')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get maintenance windows' })
  @ApiResponse({ status: 200, description: 'Maintenance windows retrieved' })
  getMaintenanceWindows(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    // Implementation would return maintenance windows
    return { windows: [] };
  }

  @Post('maintenance')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create maintenance window' })
  @ApiResponse({ status: 201, description: 'Maintenance window created' })
  createMaintenanceWindow(
    @Body() maintenanceDto: CreateMaintenanceWindowDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Implementation would create maintenance window
    return { message: 'Maintenance window created' };
  }

  @Delete('maintenance/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete maintenance window' })
  @ApiParam({ name: 'id', description: 'Maintenance window ID' })
  @ApiResponse({ status: 200, description: 'Maintenance window deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMaintenanceWindow(@Param('id') id: string) {
    // Implementation would delete maintenance window
    return;
  }

  // ===== DASHBOARD AND STATISTICS =====

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get comprehensive dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getDashboardData(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.monitoringService.getDashboardData(requestingUserTenantId);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get monitoring statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.monitoringService.getMonitoringStats(requestingUserTenantId);
  }

  @Get('statistics/overview')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get monitoring overview statistics' })
  @ApiResponse({ status: 200, description: 'Overview statistics' })
  getOverviewStatistics(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    // Implementation would return overview statistics
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

  // ===== REAL-TIME MONITORING =====

  @Sse('events')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Server-Sent Events for real-time monitoring data' })
  @ApiResponse({ status: 200, description: 'Real-time monitoring stream' })
  streamEvents(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ): Observable<MessageEvent> {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;

    return interval(5000).pipe(
      switchMap(async () => {
        const dashboardData = await this.monitoringService.getDashboardData(requestingUserTenantId);

        return {
          data: JSON.stringify({
            timestamp: new Date().toISOString(),
            type: 'dashboard_update',
            payload: dashboardData,
          }),
        } as MessageEvent;
      }),
    );
  }

  @Sse('alerts')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Real-time alert notifications' })
  @ApiResponse({ status: 200, description: 'Real-time alert stream' })
  streamAlerts(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      // Implementation would listen to alert events from MonitoringService
      this.monitoringService.on('alert', (alert) => {
        observer.next({
          data: {
            timestamp: new Date().toISOString(),
            type: 'alert',
            payload: alert,
          },
        } as MessageEvent);
      });

      this.monitoringService.on('health', (health) => {
        observer.next({
          data: {
            timestamp: new Date().toISOString(),
            type: 'health_update',
            payload: health,
          },
        } as MessageEvent);
      });
    });
  }

  @Sse('logs')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Real-time log stream' })
  @ApiResponse({ status: 200, description: 'Real-time log stream' })
  streamLogs(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      // Implementation would listen to log events from MonitoringService
      this.monitoringService.on('log', (logEntry) => {
        observer.next({
          data: {
            timestamp: new Date().toISOString(),
            type: 'log',
            payload: logEntry,
          },
        } as MessageEvent);
      });
    });
  }

  @Sse('metrics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Real-time metrics stream' })
  @ApiResponse({ status: 200, description: 'Real-time metrics stream' })
  streamMetrics(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      // Implementation would listen to metrics events from MonitoringService
      this.monitoringService.on('metrics', (performanceMetrics) => {
        observer.next({
          data: {
            timestamp: new Date().toISOString(),
            type: 'metrics',
            payload: performanceMetrics,
          },
        } as MessageEvent);
      });
    });
  }

  // ===== SYSTEM INFORMATION =====

  @Get('system/info')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'System information' })
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

  @Get('system/status')
  @ApiOperation({ summary: 'Get simple system status (public endpoint)' })
  @ApiResponse({ status: 200, description: 'System status' })
  getSystemStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  // ===== MONITORING HEALTH CHECK =====

  @Get('health/monitoring')
  @ApiOperation({ summary: 'Monitoring service health check' })
  @ApiResponse({ status: 200, description: 'Monitoring service health' })
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
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}