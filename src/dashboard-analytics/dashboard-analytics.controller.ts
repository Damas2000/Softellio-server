import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpException,
  Patch,
  Ip,
  Headers,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import {
  RecordVisitDto,
  AnalyticsQueryDto,
  CreateDashboardWidgetDto,
  UpdateDashboardWidgetDto,
  DashboardQueryDto,
  CreateAnalyticsReportDto,
  UpdateAnalyticsReportDto,
  RecordSystemMetricDto,
  SystemMetricsQueryDto,
  UpdateContentAnalyticsDto,
  ContentAnalyticsQueryDto,
  CreateActiveSessionDto,
  UpdateActiveSessionDto,
  CreateConversionGoalDto,
  UpdateConversionGoalDto,
  RecordConversionDto,
  DashboardOverviewQueryDto,
  WidgetDataQueryDto,
  RealTimeQueryDto,
  ExportAnalyticsDto,
} from './dto/dashboard-analytics.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('dashboard-analytics')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class DashboardAnalyticsController {
  constructor(private readonly dashboardAnalyticsService: DashboardAnalyticsService) {}

  // =================== PUBLIC ROUTES - TRACKING ===================

  @Public()
  @Post('public/track/visit')
  async trackVisit(
    @Body() recordVisitDto: RecordVisitDto,
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      await this.dashboardAnalyticsService.recordVisit(recordVisitDto, tenantId, ipAddress, userAgent);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        'Failed to track visit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('public/track/conversion')
  async trackConversion(
    @Body() recordConversionDto: RecordConversionDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const conversion = await this.dashboardAnalyticsService.recordConversion(
        recordConversionDto,
        ipAddress,
        userAgent,
      );
      return {
        success: true,
        data: conversion,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to track conversion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('public/sessions/:sessionId')
  async updateActiveSession(
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: UpdateActiveSessionDto,
    @Query('tenantId', ParseIntPipe) tenantId: number,
  ) {
    try {
      await this.dashboardAnalyticsService.updateActiveSession(sessionId, updateSessionDto, tenantId);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        'Failed to update session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - OVERVIEW ===================

  @Get('admin/overview')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getDashboardOverview(
    @CurrentTenant() tenantId: number,
    @Query() query: DashboardOverviewQueryDto,
  ) {
    try {
      const overview = await this.dashboardAnalyticsService.getAnalyticsOverview(tenantId, query);
      return {
        success: true,
        data: overview,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get dashboard overview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/popular-pages')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getPopularPages(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const pages = await this.dashboardAnalyticsService.getPopularPages(tenantId, query);
      return {
        success: true,
        data: pages,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get popular pages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/traffic-sources')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getTrafficSources(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const sources = await this.dashboardAnalyticsService.getTrafficSources(tenantId, query);
      return {
        success: true,
        data: sources,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get traffic sources',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/device-analytics')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getDeviceAnalytics(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const devices = await this.dashboardAnalyticsService.getDeviceAnalytics(tenantId, query);
      return {
        success: true,
        data: devices,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get device analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/geographic-analytics')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getGeographicAnalytics(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const geographic = await this.dashboardAnalyticsService.getGeographicAnalytics(tenantId, query);
      return {
        success: true,
        data: geographic,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get geographic analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/trends')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAnalyticsTrends(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const trends = await this.dashboardAnalyticsService.getAnalyticsTrends(tenantId, query);
      return {
        success: true,
        data: trends,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get analytics trends',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - DASHBOARD WIDGETS ===================

  @Get('admin/widgets')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllDashboardWidgets(
    @CurrentTenant() tenantId: number,
    @Query() query: DashboardQueryDto,
  ) {
    try {
      const widgets = await this.dashboardAnalyticsService.getAllDashboardWidgets(tenantId, query);
      return {
        success: true,
        data: widgets,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get dashboard widgets',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/widgets/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getDashboardWidgetById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const widget = await this.dashboardAnalyticsService.getDashboardWidgetById(id, tenantId);
      return {
        success: true,
        data: widget,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get dashboard widget',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('admin/widgets')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createDashboardWidget(
    @Body() createDto: CreateDashboardWidgetDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const widget = await this.dashboardAnalyticsService.createDashboardWidget(createDto, tenantId);
      return {
        success: true,
        message: 'Dashboard widget created successfully',
        data: widget,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create dashboard widget',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/widgets/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateDashboardWidget(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDashboardWidgetDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const widget = await this.dashboardAnalyticsService.updateDashboardWidget(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Dashboard widget updated successfully',
        data: widget,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update dashboard widget',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/widgets/:id')
  @Roles('TENANT_ADMIN')
  async deleteDashboardWidget(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.dashboardAnalyticsService.deleteDashboardWidget(id, tenantId);
      return {
        success: true,
        message: 'Dashboard widget deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete dashboard widget',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('admin/widgets/:id/data')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getWidgetData(
    @CurrentTenant() tenantId: number,
    @Query() query: WidgetDataQueryDto,
  ) {
    try {
      const data = await this.dashboardAnalyticsService.getWidgetData(tenantId, query);
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get widget data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - ANALYTICS REPORTS ===================

  @Get('admin/reports')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllAnalyticsReports(
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const reports = await this.dashboardAnalyticsService.getAllAnalyticsReports(tenantId);
      return {
        success: true,
        data: reports,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get analytics reports',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/reports')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createAnalyticsReport(
    @Body() createDto: CreateAnalyticsReportDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const report = await this.dashboardAnalyticsService.createAnalyticsReport(createDto, tenantId);
      return {
        success: true,
        message: 'Analytics report created successfully',
        data: report,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create analytics report',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/reports/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateAnalyticsReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAnalyticsReportDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const report = await this.dashboardAnalyticsService.updateAnalyticsReport(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Analytics report updated successfully',
        data: report,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update analytics report',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('admin/reports/:id/generate')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async generateReport(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const reportData = await this.dashboardAnalyticsService.generateReport(id, tenantId);
      return {
        success: true,
        message: 'Report generated successfully',
        data: reportData,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate report',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - SYSTEM METRICS ===================

  @Post('admin/system/metrics')
  @Roles('TENANT_ADMIN')
  async recordSystemMetric(
    @Body() recordDto: RecordSystemMetricDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const metric = await this.dashboardAnalyticsService.recordSystemMetric(recordDto, tenantId);
      return {
        success: true,
        message: 'System metric recorded successfully',
        data: metric,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to record system metric',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('admin/system/metrics')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSystemMetrics(
    @CurrentTenant() tenantId: number,
    @Query() query: SystemMetricsQueryDto,
  ) {
    try {
      const metrics = await this.dashboardAnalyticsService.getSystemMetrics(tenantId, query);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get system metrics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - CONTENT ANALYTICS ===================

  @Put('admin/content/analytics')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateContentAnalytics(
    @Body() updateDto: UpdateContentAnalyticsDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const analytics = await this.dashboardAnalyticsService.updateContentAnalytics(updateDto, tenantId);
      return {
        success: true,
        message: 'Content analytics updated successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update content analytics',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('admin/content/analytics')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getContentAnalytics(
    @CurrentTenant() tenantId: number,
    @Query() query: ContentAnalyticsQueryDto,
  ) {
    try {
      const analytics = await this.dashboardAnalyticsService.getContentAnalytics(tenantId, query);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get content analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - CONVERSION GOALS ===================

  @Get('admin/conversion-goals')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllConversionGoals(
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const goals = await this.dashboardAnalyticsService.getAllConversionGoals(tenantId);
      return {
        success: true,
        data: goals,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get conversion goals',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/conversion-goals')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createConversionGoal(
    @Body() createDto: CreateConversionGoalDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const goal = await this.dashboardAnalyticsService.createConversionGoal(createDto, tenantId);
      return {
        success: true,
        message: 'Conversion goal created successfully',
        data: goal,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create conversion goal',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/conversion-goals/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateConversionGoal(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConversionGoalDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const goal = await this.dashboardAnalyticsService.updateConversionGoal(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Conversion goal updated successfully',
        data: goal,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update conversion goal',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/conversion-goals/:id')
  @Roles('TENANT_ADMIN')
  async deleteConversionGoal(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.dashboardAnalyticsService.deleteConversionGoal(id, tenantId);
      return {
        success: true,
        message: 'Conversion goal deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete conversion goal',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== REAL-TIME ANALYTICS ===================

  @Get('admin/real-time/visitors')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getRealTimeVisitors(
    @CurrentTenant() tenantId: number,
    @Query() query: RealTimeQueryDto,
  ) {
    try {
      const visitors = await this.dashboardAnalyticsService.getRealTimeVisitors(tenantId, query);
      return {
        success: true,
        data: visitors,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get real-time visitors',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/sessions/cleanup')
  @Roles('TENANT_ADMIN')
  async cleanupExpiredSessions() {
    try {
      const count = await this.dashboardAnalyticsService.cleanupExpiredSessions();
      return {
        success: true,
        message: `Cleaned up ${count} expired sessions`,
        data: { cleaned: count },
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== UTILITY ROUTES ===================

  @Get('admin/widget-types')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSupportedWidgetTypes() {
    const widgetTypes = [
      { value: 'chart_line', label: 'Line Chart', icon: 'fas fa-chart-line', category: 'charts' },
      { value: 'chart_bar', label: 'Bar Chart', icon: 'fas fa-chart-bar', category: 'charts' },
      { value: 'chart_pie', label: 'Pie Chart', icon: 'fas fa-chart-pie', category: 'charts' },
      { value: 'stat_card', label: 'Statistic Card', icon: 'fas fa-square-poll-vertical', category: 'stats' },
      { value: 'table', label: 'Data Table', icon: 'fas fa-table', category: 'data' },
      { value: 'map', label: 'Geographic Map', icon: 'fas fa-map', category: 'geo' },
      { value: 'gauge', label: 'Gauge Chart', icon: 'fas fa-gauge', category: 'charts' },
      { value: 'funnel', label: 'Funnel Chart', icon: 'fas fa-filter', category: 'charts' },
    ];

    return {
      success: true,
      data: widgetTypes,
    };
  }

  @Get('admin/metric-types')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSupportedMetricTypes() {
    const metricTypes = [
      { value: 'cpu_usage', label: 'CPU Usage', unit: '%', category: 'system' },
      { value: 'memory_usage', label: 'Memory Usage', unit: '%', category: 'system' },
      { value: 'disk_space', label: 'Disk Space', unit: 'GB', category: 'system' },
      { value: 'response_time', label: 'Response Time', unit: 'ms', category: 'application' },
      { value: 'error_count', label: 'Error Count', unit: 'count', category: 'application' },
      { value: 'request_count', label: 'Request Count', unit: 'count', category: 'application' },
      { value: 'database_connections', label: 'DB Connections', unit: 'count', category: 'database' },
    ];

    return {
      success: true,
      data: metricTypes,
    };
  }
}