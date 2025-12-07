import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
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
  OverviewStatsResponse,
  PopularPagesResponse,
  TrafficSourcesResponse,
  DeviceAnalyticsResponse,
  GeographicAnalyticsResponse,
  RealTimeVisitorsResponse,
} from './dto/dashboard-analytics.dto';

// Interfaces for better type safety
interface AnalyticsOverviewData {
  totalVisitors: number;
  totalPageviews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ url: string; views: number }>;
  trafficSources: Array<{ source: string; percentage: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
}

interface MetricTrend {
  date: Date;
  value: number;
  change?: number;
  changePercentage?: number;
}

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // =================== WEBSITE ANALYTICS ===================

  async recordVisit(visitData: RecordVisitDto, tenantId: number, ipAddress?: string, userAgent?: string) {
    // Parse user agent for device and browser info
    const deviceInfo = this.parseUserAgent(userAgent);
    const geoInfo = await this.getGeoInfo(ipAddress);

    const analyticsData = {
      ...visitData,
      tenantId,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      browserName: deviceInfo.browserName,
      osName: deviceInfo.osName,
      country: geoInfo.country,
      city: geoInfo.city,
      language: deviceInfo.language,
    };

    return await this.prisma.websiteAnalytics.create({
      data: analyticsData,
    });
  }

  async getAnalyticsOverview(tenantId: number, query: DashboardOverviewQueryDto): Promise<OverviewStatsResponse> {
    const { startDate, endDate, period = 'last_30_days', includeComparison = true } = query;

    const dateRange = this.calculateDateRange(period, startDate, endDate);
    const currentPeriod = { gte: dateRange.start, lte: dateRange.end };

    // Calculate previous period for comparison
    const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
    const previousStart = new Date(dateRange.start.getTime() - periodDuration);
    const previousEnd = new Date(dateRange.end.getTime() - periodDuration);
    const previousPeriod = { gte: previousStart, lte: previousEnd };

    // Get current period stats
    const currentStats = await this.getBasicStats(tenantId, currentPeriod);
    let previousStats = { visitors: 0, pageviews: 0, bounceRate: 0, avgSessionDuration: 0 };

    if (includeComparison) {
      previousStats = await this.getBasicStats(tenantId, previousPeriod);
    }

    return {
      visitors: {
        current: currentStats.visitors,
        previous: previousStats.visitors,
        change: currentStats.visitors - previousStats.visitors,
        changePercentage: this.calculatePercentageChange(currentStats.visitors, previousStats.visitors),
      },
      pageviews: {
        current: currentStats.pageviews,
        previous: previousStats.pageviews,
        change: currentStats.pageviews - previousStats.pageviews,
        changePercentage: this.calculatePercentageChange(currentStats.pageviews, previousStats.pageviews),
      },
      bounceRate: {
        current: currentStats.bounceRate,
        previous: previousStats.bounceRate,
        change: currentStats.bounceRate - previousStats.bounceRate,
        changePercentage: this.calculatePercentageChange(currentStats.bounceRate, previousStats.bounceRate),
      },
      avgSessionDuration: {
        current: currentStats.avgSessionDuration,
        previous: previousStats.avgSessionDuration,
        change: currentStats.avgSessionDuration - previousStats.avgSessionDuration,
        changePercentage: this.calculatePercentageChange(currentStats.avgSessionDuration, previousStats.avgSessionDuration),
      },
    };
  }

  async getPopularPages(tenantId: number, query: AnalyticsQueryDto): Promise<PopularPagesResponse[]> {
    const { startDate, endDate, limit = 10 } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const popularPages = await this.prisma.websiteAnalytics.groupBy({
      by: ['pageUrl', 'pageTitle'],
      where: {
        tenantId,
        visitedAt: dateFilter,
      },
      _count: {
        id: true,
      },
      _avg: {
        timeOnPage: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // Calculate unique views and bounce rate for each page
    const results = await Promise.all(
      popularPages.map(async (page) => {
        const uniqueViews = await this.prisma.websiteAnalytics.groupBy({
          by: ['sessionId'],
          where: {
            tenantId,
            pageUrl: page.pageUrl,
            visitedAt: dateFilter,
            sessionId: { not: null },
          },
          _count: { sessionId: true },
        });

        const bounceRate = await this.calculatePageBounceRate(tenantId, page.pageUrl, dateFilter);

        return {
          url: page.pageUrl,
          title: page.pageTitle || page.pageUrl,
          views: page._count.id,
          uniqueViews: uniqueViews.length,
          averageTime: Math.round(page._avg.timeOnPage || 0),
          bounceRate: bounceRate,
        };
      }),
    );

    return results;
  }

  async getTrafficSources(tenantId: number, query: AnalyticsQueryDto): Promise<TrafficSourcesResponse[]> {
    const { startDate, endDate } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const sources = await this.prisma.websiteAnalytics.groupBy({
      by: ['utmSource', 'referrer'],
      where: {
        tenantId,
        visitedAt: dateFilter,
      },
      _count: {
        sessionId: true,
      },
    });

    const totalVisitors = sources.reduce((sum, source) => sum + source._count.sessionId, 0);

    return sources
      .map((source) => {
        const sourceName = source.utmSource || this.extractDomain(source.referrer) || 'Direct';
        return {
          source: sourceName,
          visitors: source._count.sessionId,
          percentage: (source._count.sessionId / totalVisitors) * 100,
          change: 0, // TODO: Calculate change from previous period
        };
      })
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  }

  async getDeviceAnalytics(tenantId: number, query: AnalyticsQueryDto): Promise<DeviceAnalyticsResponse[]> {
    const { startDate, endDate } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const devices = await this.prisma.websiteAnalytics.groupBy({
      by: ['deviceType'],
      where: {
        tenantId,
        deviceType: { not: null },
        visitedAt: dateFilter,
      },
      _count: {
        sessionId: true,
      },
      _avg: {
        timeOnPage: true,
      },
    });

    const totalSessions = devices.reduce((sum, device) => sum + device._count.sessionId, 0);

    return devices.map((device) => ({
      device: device.deviceType || 'Unknown',
      sessions: device._count.sessionId,
      percentage: (device._count.sessionId / totalSessions) * 100,
      averageSessionDuration: Math.round(device._avg.timeOnPage || 0),
    }));
  }

  async getGeographicAnalytics(tenantId: number, query: AnalyticsQueryDto): Promise<GeographicAnalyticsResponse[]> {
    const { startDate, endDate, limit = 20 } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const countries = await this.prisma.websiteAnalytics.groupBy({
      by: ['country'],
      where: {
        tenantId,
        country: { not: null },
        visitedAt: dateFilter,
      },
      _count: {
        sessionId: true,
      },
      orderBy: {
        _count: {
          sessionId: 'desc',
        },
      },
      take: limit,
    });

    const totalVisitors = countries.reduce((sum, country) => sum + country._count.sessionId, 0);

    return countries.map((country) => ({
      country: country.country || 'Unknown',
      countryCode: this.getCountryCode(country.country || ''),
      visitors: country._count.sessionId,
      percentage: (country._count.sessionId / totalVisitors) * 100,
      sessions: country._count.sessionId,
      bounceRate: 0, // TODO: Calculate bounce rate by country
    }));
  }

  async getAnalyticsTrends(tenantId: number, query: AnalyticsQueryDto) {
    const { startDate, endDate, groupBy = 'day' } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Simplified approach to avoid Prisma groupBy complexities
    const analytics = await this.prisma.websiteAnalytics.findMany({
      where: {
        tenantId,
        visitedAt: dateFilter,
      },
      select: {
        visitedAt: true,
        sessionId: true,
        timeOnPage: true,
      },
      orderBy: { visitedAt: 'asc' },
    });

    // Group manually by date
    const groupedData = this.groupAnalyticsByDate(analytics, groupBy);

    return Object.entries(groupedData).map(([date, data]: [string, any]) => ({
      date: new Date(date),
      visitors: data.uniqueSessions.size,
      pageviews: data.pageviews,
      averageSessionDuration: data.totalTime / data.pageviews || 0,
    }));
  }

  // =================== DASHBOARD WIDGETS ===================

  async getAllDashboardWidgets(tenantId: number, query: DashboardQueryDto) {
    const { category, isActive, search } = query;

    const where: any = { tenantId };

    if (category) where.category = category;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.dashboardWidget.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async getDashboardWidgetById(id: number, tenantId: number) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id, tenantId },
    });

    if (!widget) {
      throw new NotFoundException('Dashboard widget not found');
    }

    return widget;
  }

  async createDashboardWidget(createDto: CreateDashboardWidgetDto, tenantId: number) {
    return await this.prisma.dashboardWidget.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async updateDashboardWidget(id: number, updateDto: UpdateDashboardWidgetDto, tenantId: number) {
    const existingWidget = await this.prisma.dashboardWidget.findFirst({
      where: { id, tenantId },
    });

    if (!existingWidget) {
      throw new NotFoundException('Dashboard widget not found');
    }

    return await this.prisma.dashboardWidget.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteDashboardWidget(id: number, tenantId: number) {
    const existingWidget = await this.prisma.dashboardWidget.findFirst({
      where: { id, tenantId },
    });

    if (!existingWidget) {
      throw new NotFoundException('Dashboard widget not found');
    }

    await this.prisma.dashboardWidget.delete({
      where: { id },
    });
  }

  async getWidgetData(tenantId: number, query: WidgetDataQueryDto) {
    const { widgetId, startDate, endDate, additionalFilters } = query;

    const widget = await this.getDashboardWidgetById(widgetId, tenantId);

    // Execute widget query based on data source and configuration
    switch (widget.dataSource) {
      case 'website_analytics':
        return await this.getWebsiteAnalyticsData(tenantId, {
          startDate,
          endDate,
          ...additionalFilters,
        });
      case 'content_analytics':
        return await this.getContentAnalyticsData(tenantId, {
          startDate,
          endDate,
          ...additionalFilters,
        });
      case 'system_metrics':
        return await this.getSystemMetricsData(tenantId, {
          startDate,
          endDate,
          ...additionalFilters,
        });
      default:
        throw new BadRequestException('Unsupported widget data source');
    }
  }

  // =================== ANALYTICS REPORTS ===================

  async getAllAnalyticsReports(tenantId: number) {
    return await this.prisma.analyticsReport.findMany({
      where: { tenantId },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnalyticsReport(createDto: CreateAnalyticsReportDto, tenantId: number) {
    const { schedule, isScheduled, ...reportData } = createDto;

    const data: any = {
      ...reportData,
      tenantId,
      isScheduled,
    };

    if (isScheduled && schedule) {
      data.schedule = schedule;
      data.nextRunAt = this.calculateNextRunTime(schedule);
    }

    return await this.prisma.analyticsReport.create({
      data,
    });
  }

  async updateAnalyticsReport(id: number, updateDto: UpdateAnalyticsReportDto, tenantId: number) {
    const existingReport = await this.prisma.analyticsReport.findFirst({
      where: { id, tenantId },
    });

    if (!existingReport) {
      throw new NotFoundException('Analytics report not found');
    }

    const { schedule, isScheduled, ...reportData } = updateDto;

    const data: any = { ...reportData };

    if (typeof isScheduled === 'boolean') {
      data.isScheduled = isScheduled;
      if (isScheduled && schedule) {
        data.schedule = schedule;
        data.nextRunAt = this.calculateNextRunTime(schedule);
      } else if (!isScheduled) {
        data.schedule = null;
        data.nextRunAt = null;
      }
    }

    return await this.prisma.analyticsReport.update({
      where: { id },
      data,
    });
  }

  async generateReport(reportId: number, tenantId: number) {
    const report = await this.prisma.analyticsReport.findFirst({
      where: { id: reportId, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Analytics report not found');
    }

    // Create execution record
    const execution = await this.prisma.reportExecution.create({
      data: {
        reportId,
        status: 'running',
      },
    });

    try {
      // Generate report data based on report type and configuration
      const reportData = await this.generateReportData(report, tenantId);

      // Update execution with success
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          recordCount: Array.isArray(reportData) ? reportData.length : 0,
          duration: Math.round((Date.now() - execution.startedAt.getTime()) / 1000),
        },
      });

      return reportData;
    } catch (error) {
      // Update execution with error
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
          duration: Math.round((Date.now() - execution.startedAt.getTime()) / 1000),
        },
      });

      throw error;
    }
  }

  // =================== SYSTEM METRICS ===================

  async recordSystemMetric(metricData: RecordSystemMetricDto, tenantId: number) {
    return await this.prisma.systemMetric.create({
      data: {
        ...metricData,
        tenantId,
      },
    });
  }

  async getSystemMetrics(tenantId: number, query: SystemMetricsQueryDto) {
    const { metricType, category, component, status, startDate, endDate, groupBy = 'hour' } = query;

    const where: any = { tenantId };

    if (metricType) where.metricType = metricType;
    if (category) where.category = category;
    if (component) where.component = component;
    if (status) where.status = status;

    const dateFilter = this.buildDateFilter(startDate, endDate);
    if (dateFilter) where.recordedAt = dateFilter;

    const metrics = await this.prisma.systemMetric.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: 1000, // Limit to prevent large responses
    });

    return this.groupMetricsByTime(metrics, groupBy);
  }

  // =================== CONTENT ANALYTICS ===================

  async updateContentAnalytics(updateDto: UpdateContentAnalyticsDto, tenantId: number) {
    const { entityType, entityId, ...analyticsData } = updateDto;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.prisma.contentAnalytics.upsert({
      where: {
        tenantId_entityType_entityId_date: {
          tenantId,
          entityType,
          entityId,
          date: today,
        },
      },
      update: analyticsData,
      create: {
        ...updateDto,
        tenantId,
        date: today,
      },
    });
  }

  async getContentAnalytics(tenantId: number, query: ContentAnalyticsQueryDto) {
    const { entityType, entityId, startDate, endDate, groupBy = 'day', sortBy = 'viewCount', sortOrder = 'desc', page = 1, limit = 20 } = query;

    const where: any = { tenantId };

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const dateFilter = this.buildDateFilter(startDate, endDate);
    if (dateFilter) where.date = dateFilter;

    const [analytics, total] = await Promise.all([
      this.prisma.contentAnalytics.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contentAnalytics.count({ where }),
    ]);

    return {
      data: analytics,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // =================== ACTIVE SESSIONS ===================

  async createActiveSession(sessionData: CreateActiveSessionDto, tenantId: number, ipAddress?: string, userAgent?: string) {
    const deviceInfo = this.parseUserAgent(userAgent);
    const geoInfo = await this.getGeoInfo(ipAddress);

    // Session expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return await this.prisma.activeSession.upsert({
      where: { id: sessionData.sessionId },
      update: {
        currentPage: sessionData.currentPage,
        pageTitle: sessionData.pageTitle,
        lastActivity: new Date(),
        pageViews: { increment: 1 },
        expiresAt,
      },
      create: {
        id: sessionData.sessionId,
        tenantId,
        ipAddress,
        userAgent,
        deviceType: deviceInfo.deviceType,
        country: geoInfo.country,
        city: geoInfo.city,
        currentPage: sessionData.currentPage,
        pageTitle: sessionData.pageTitle,
        referrer: sessionData.referrer,
        expiresAt,
      },
    });
  }

  async updateActiveSession(sessionId: string, updateData: UpdateActiveSessionDto, tenantId: number) {
    const existingSession = await this.prisma.activeSession.findFirst({
      where: { id: sessionId, tenantId },
    });

    if (!existingSession) {
      throw new NotFoundException('Active session not found');
    }

    return await this.prisma.activeSession.update({
      where: { id: sessionId },
      data: {
        ...updateData,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
  }

  async getRealTimeVisitors(tenantId: number, query: RealTimeQueryDto): Promise<RealTimeVisitorsResponse> {
    const { minutes = 30 } = query;
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const [activeSessions, recentVisitors] = await Promise.all([
      this.prisma.activeSession.findMany({
        where: {
          tenantId,
          lastActivity: { gte: since },
        },
        orderBy: { lastActivity: 'desc' },
      }),
      this.prisma.websiteAnalytics.findMany({
        where: {
          tenantId,
          visitedAt: { gte: since },
        },
        select: {
          visitedAt: true,
          pageUrl: true,
          pageTitle: true,
          country: true,
          deviceType: true,
        },
        orderBy: { visitedAt: 'desc' },
        take: 20,
      }),
    ]);

    const topPages = await this.prisma.activeSession.groupBy({
      by: ['currentPage'],
      where: {
        tenantId,
        lastActivity: { gte: since },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return {
      activeVisitors: activeSessions.length,
      currentHour: new Date().getHours(),
      recentVisitors: recentVisitors.map(visitor => ({
        timestamp: visitor.visitedAt,
        page: visitor.pageTitle || visitor.pageUrl,
        country: visitor.country || undefined,
        device: visitor.deviceType || undefined,
      })),
      topPages: topPages.map(page => ({
        page: page.currentPage,
        activeVisitors: page._count.id,
      })),
    };
  }

  async cleanupExpiredSessions() {
    const now = new Date();
    const deleted = await this.prisma.activeSession.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    return deleted.count;
  }

  // =================== CONVERSION GOALS ===================

  async getAllConversionGoals(tenantId: number) {
    return await this.prisma.conversionGoal.findMany({
      where: { tenantId },
      include: {
        conversions: {
          where: {
            convertedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createConversionGoal(createDto: CreateConversionGoalDto, tenantId: number) {
    return await this.prisma.conversionGoal.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async updateConversionGoal(id: number, updateDto: UpdateConversionGoalDto, tenantId: number) {
    const existingGoal = await this.prisma.conversionGoal.findFirst({
      where: { id, tenantId },
    });

    if (!existingGoal) {
      throw new NotFoundException('Conversion goal not found');
    }

    return await this.prisma.conversionGoal.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteConversionGoal(id: number, tenantId: number) {
    const existingGoal = await this.prisma.conversionGoal.findFirst({
      where: { id, tenantId },
    });

    if (!existingGoal) {
      throw new NotFoundException('Conversion goal not found');
    }

    await this.prisma.conversionGoal.delete({
      where: { id },
    });
  }

  async recordConversion(conversionData: RecordConversionDto, ipAddress?: string, userAgent?: string) {
    const { goalId, ...data } = conversionData;

    // Verify goal exists
    const goal = await this.prisma.conversionGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Conversion goal not found');
    }

    return await this.prisma.conversion.create({
      data: {
        goalId,
        ipAddress,
        userAgent,
        ...data,
      },
    });
  }

  // =================== HELPER METHODS ===================

  private async getBasicStats(tenantId: number, dateFilter: any) {
    const [analytics, uniqueVisitors] = await Promise.all([
      this.prisma.websiteAnalytics.aggregate({
        where: {
          tenantId,
          visitedAt: dateFilter,
        },
        _count: { id: true },
        _avg: { timeOnPage: true },
      }),
      this.prisma.websiteAnalytics.groupBy({
        by: ['sessionId'],
        where: {
          tenantId,
          visitedAt: dateFilter,
          sessionId: { not: null },
        },
      }),
    ]);

    const bounces = await this.prisma.websiteAnalytics.count({
      where: {
        tenantId,
        visitedAt: dateFilter,
        bounceRate: true,
      },
    });

    const totalSessions = uniqueVisitors.length;
    const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;

    return {
      visitors: totalSessions,
      pageviews: analytics._count.id || 0,
      bounceRate: Math.round(bounceRate * 100) / 100,
      avgSessionDuration: Math.round(analytics._avg.timeOnPage || 0),
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }

  private calculateDateRange(period: string, startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    let start: Date;

    switch (period) {
      case 'today':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'last_30_days':
        start = new Date();
        start.setDate(start.getDate() - 30);
        break;
      case 'last_90_days':
        start = new Date();
        start.setDate(start.getDate() - 90);
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date();
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;

    const filter: any = {};
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) filter.lte = new Date(endDate);

    return filter;
  }

  private parseUserAgent(userAgent?: string) {
    // Simplified user agent parsing
    // In production, consider using a library like 'ua-parser-js'
    const deviceType = userAgent?.includes('Mobile') ? 'mobile' :
                      userAgent?.includes('Tablet') ? 'tablet' : 'desktop';

    const browserName = userAgent?.includes('Chrome') ? 'chrome' :
                       userAgent?.includes('Firefox') ? 'firefox' :
                       userAgent?.includes('Safari') ? 'safari' :
                       userAgent?.includes('Edge') ? 'edge' : 'unknown';

    const osName = userAgent?.includes('Windows') ? 'windows' :
                  userAgent?.includes('Mac') ? 'macos' :
                  userAgent?.includes('Linux') ? 'linux' :
                  userAgent?.includes('Android') ? 'android' :
                  userAgent?.includes('iOS') ? 'ios' : 'unknown';

    return { deviceType, browserName, osName, language: 'en' }; // Language detection would need more logic
  }

  private async getGeoInfo(ipAddress?: string) {
    // Placeholder for geo IP lookup
    // In production, integrate with a service like MaxMind or IP2Location
    return { country: 'Unknown', city: 'Unknown' };
  }

  private extractDomain(url?: string): string {
    if (!url) return 'Direct';
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  private getCountryCode(country: string): string {
    // Simplified country code mapping
    // In production, use a proper country code library
    const countryMap: { [key: string]: string } = {
      'Turkey': 'TR',
      'United States': 'US',
      'Germany': 'DE',
      'France': 'FR',
      'United Kingdom': 'GB',
    };
    return countryMap[country] || 'XX';
  }

  private async calculatePageBounceRate(tenantId: number, pageUrl: string, dateFilter: any): Promise<number> {
    const totalSessions = await this.prisma.websiteAnalytics.groupBy({
      by: ['sessionId'],
      where: {
        tenantId,
        pageUrl,
        visitedAt: dateFilter,
        sessionId: { not: null },
      },
    });

    const bounceSessions = await this.prisma.websiteAnalytics.count({
      where: {
        tenantId,
        pageUrl,
        visitedAt: dateFilter,
        bounceRate: true,
      },
    });

    return totalSessions.length > 0 ? (bounceSessions / totalSessions.length) * 100 : 0;
  }

  private getGroupByFields(groupBy: string) {
    switch (groupBy) {
      case 'hour':
        return ['visitedAt']; // Would need date truncation in real SQL
      case 'day':
        return ['visitedAt'];
      case 'week':
        return ['visitedAt'];
      case 'month':
        return ['visitedAt'];
      default:
        return ['visitedAt'];
    }
  }

  private formatGroupByDate(trend: any, groupBy: string): Date {
    // Simplified date formatting - would need proper grouping in real implementation
    return trend.visitedAt;
  }

  private calculateNextRunTime(cronExpression: string): Date {
    // Simplified cron parsing - use a proper cron library in production
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + 24); // Default to daily
    return nextRun;
  }

  private async generateReportData(report: any, tenantId: number) {
    // Generate report data based on report type
    switch (report.reportType) {
      case 'traffic':
        return await this.generateTrafficReport(tenantId, report);
      case 'content':
        return await this.generateContentReport(tenantId, report);
      default:
        throw new BadRequestException('Unsupported report type');
    }
  }

  private async generateTrafficReport(tenantId: number, report: any) {
    // Generate traffic report data
    return await this.getAnalyticsOverview(tenantId, {
      period: report.dateRange,
      startDate: report.startDate?.toISOString(),
      endDate: report.endDate?.toISOString(),
    });
  }

  private async generateContentReport(tenantId: number, report: any) {
    // Generate content performance report
    return await this.getContentAnalytics(tenantId, {
      startDate: report.startDate?.toISOString(),
      endDate: report.endDate?.toISOString(),
    });
  }

  private async getWebsiteAnalyticsData(tenantId: number, filters: any) {
    return await this.getAnalyticsTrends(tenantId, filters);
  }

  private async getContentAnalyticsData(tenantId: number, filters: any) {
    return await this.getContentAnalytics(tenantId, filters);
  }

  private async getSystemMetricsData(tenantId: number, filters: any) {
    return await this.getSystemMetrics(tenantId, filters);
  }

  private groupMetricsByTime(metrics: any[], groupBy: string) {
    // Group metrics by time period
    return metrics.reduce((acc, metric) => {
      const timeKey = this.getTimeKey(metric.recordedAt, groupBy);
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(metric);
      return acc;
    }, {});
  }

  private getTimeKey(date: Date, groupBy: string): string {
    switch (groupBy) {
      case 'minute':
        return date.toISOString().substring(0, 16);
      case 'hour':
        return date.toISOString().substring(0, 13);
      case 'day':
        return date.toISOString().substring(0, 10);
      default:
        return date.toISOString().substring(0, 13);
    }
  }

  private groupAnalyticsByDate(analytics: any[], groupBy: string) {
    return analytics.reduce((acc, item) => {
      const dateKey = this.getTimeKey(item.visitedAt, groupBy);

      if (!acc[dateKey]) {
        acc[dateKey] = {
          uniqueSessions: new Set(),
          pageviews: 0,
          totalTime: 0,
        };
      }

      if (item.sessionId) {
        acc[dateKey].uniqueSessions.add(item.sessionId);
      }
      acc[dateKey].pageviews += 1;
      acc[dateKey].totalTime += item.timeOnPage || 0;

      return acc;
    }, {});
  }
}