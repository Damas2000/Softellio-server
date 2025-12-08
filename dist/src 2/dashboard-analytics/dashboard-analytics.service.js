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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let DashboardAnalyticsService = class DashboardAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordVisit(visitData, tenantId, ipAddress, userAgent) {
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
    async getAnalyticsOverview(tenantId, query) {
        const { startDate, endDate, period = 'last_30_days', includeComparison = true } = query;
        const dateRange = this.calculateDateRange(period, startDate, endDate);
        const currentPeriod = { gte: dateRange.start, lte: dateRange.end };
        const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
        const previousStart = new Date(dateRange.start.getTime() - periodDuration);
        const previousEnd = new Date(dateRange.end.getTime() - periodDuration);
        const previousPeriod = { gte: previousStart, lte: previousEnd };
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
    async getPopularPages(tenantId, query) {
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
        const results = await Promise.all(popularPages.map(async (page) => {
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
        }));
        return results;
    }
    async getTrafficSources(tenantId, query) {
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
                change: 0,
            };
        })
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 10);
    }
    async getDeviceAnalytics(tenantId, query) {
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
    async getGeographicAnalytics(tenantId, query) {
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
            bounceRate: 0,
        }));
    }
    async getAnalyticsTrends(tenantId, query) {
        const { startDate, endDate, groupBy = 'day' } = query;
        const dateFilter = this.buildDateFilter(startDate, endDate);
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
        const groupedData = this.groupAnalyticsByDate(analytics, groupBy);
        return Object.entries(groupedData).map(([date, data]) => ({
            date: new Date(date),
            visitors: data.uniqueSessions.size,
            pageviews: data.pageviews,
            averageSessionDuration: data.totalTime / data.pageviews || 0,
        }));
    }
    async getAllDashboardWidgets(tenantId, query) {
        const { category, isActive, search } = query;
        const where = { tenantId };
        if (category)
            where.category = category;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
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
    async getDashboardWidgetById(id, tenantId) {
        const widget = await this.prisma.dashboardWidget.findFirst({
            where: { id, tenantId },
        });
        if (!widget) {
            throw new common_1.NotFoundException('Dashboard widget not found');
        }
        return widget;
    }
    async createDashboardWidget(createDto, tenantId) {
        return await this.prisma.dashboardWidget.create({
            data: {
                ...createDto,
                tenantId,
            },
        });
    }
    async updateDashboardWidget(id, updateDto, tenantId) {
        const existingWidget = await this.prisma.dashboardWidget.findFirst({
            where: { id, tenantId },
        });
        if (!existingWidget) {
            throw new common_1.NotFoundException('Dashboard widget not found');
        }
        return await this.prisma.dashboardWidget.update({
            where: { id },
            data: updateDto,
        });
    }
    async deleteDashboardWidget(id, tenantId) {
        const existingWidget = await this.prisma.dashboardWidget.findFirst({
            where: { id, tenantId },
        });
        if (!existingWidget) {
            throw new common_1.NotFoundException('Dashboard widget not found');
        }
        await this.prisma.dashboardWidget.delete({
            where: { id },
        });
    }
    async getWidgetData(tenantId, query) {
        const { widgetId, startDate, endDate, additionalFilters } = query;
        const widget = await this.getDashboardWidgetById(widgetId, tenantId);
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
                throw new common_1.BadRequestException('Unsupported widget data source');
        }
    }
    async getAllAnalyticsReports(tenantId) {
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
    async createAnalyticsReport(createDto, tenantId) {
        const { schedule, isScheduled, ...reportData } = createDto;
        const data = {
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
    async updateAnalyticsReport(id, updateDto, tenantId) {
        const existingReport = await this.prisma.analyticsReport.findFirst({
            where: { id, tenantId },
        });
        if (!existingReport) {
            throw new common_1.NotFoundException('Analytics report not found');
        }
        const { schedule, isScheduled, ...reportData } = updateDto;
        const data = { ...reportData };
        if (typeof isScheduled === 'boolean') {
            data.isScheduled = isScheduled;
            if (isScheduled && schedule) {
                data.schedule = schedule;
                data.nextRunAt = this.calculateNextRunTime(schedule);
            }
            else if (!isScheduled) {
                data.schedule = null;
                data.nextRunAt = null;
            }
        }
        return await this.prisma.analyticsReport.update({
            where: { id },
            data,
        });
    }
    async generateReport(reportId, tenantId) {
        const report = await this.prisma.analyticsReport.findFirst({
            where: { id: reportId, tenantId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Analytics report not found');
        }
        const execution = await this.prisma.reportExecution.create({
            data: {
                reportId,
                status: 'running',
            },
        });
        try {
            const reportData = await this.generateReportData(report, tenantId);
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
        }
        catch (error) {
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
    async recordSystemMetric(metricData, tenantId) {
        return await this.prisma.systemMetric.create({
            data: {
                ...metricData,
                tenantId,
            },
        });
    }
    async getSystemMetrics(tenantId, query) {
        const { metricType, category, component, status, startDate, endDate, groupBy = 'hour' } = query;
        const where = { tenantId };
        if (metricType)
            where.metricType = metricType;
        if (category)
            where.category = category;
        if (component)
            where.component = component;
        if (status)
            where.status = status;
        const dateFilter = this.buildDateFilter(startDate, endDate);
        if (dateFilter)
            where.recordedAt = dateFilter;
        const metrics = await this.prisma.systemMetric.findMany({
            where,
            orderBy: { recordedAt: 'desc' },
            take: 1000,
        });
        return this.groupMetricsByTime(metrics, groupBy);
    }
    async updateContentAnalytics(updateDto, tenantId) {
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
    async getContentAnalytics(tenantId, query) {
        const { entityType, entityId, startDate, endDate, groupBy = 'day', sortBy = 'viewCount', sortOrder = 'desc', page = 1, limit = 20 } = query;
        const where = { tenantId };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        const dateFilter = this.buildDateFilter(startDate, endDate);
        if (dateFilter)
            where.date = dateFilter;
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
    async createActiveSession(sessionData, tenantId, ipAddress, userAgent) {
        const deviceInfo = this.parseUserAgent(userAgent);
        const geoInfo = await this.getGeoInfo(ipAddress);
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
    async updateActiveSession(sessionId, updateData, tenantId) {
        const existingSession = await this.prisma.activeSession.findFirst({
            where: { id: sessionId, tenantId },
        });
        if (!existingSession) {
            throw new common_1.NotFoundException('Active session not found');
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
    async getRealTimeVisitors(tenantId, query) {
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
    async getAllConversionGoals(tenantId) {
        return await this.prisma.conversionGoal.findMany({
            where: { tenantId },
            include: {
                conversions: {
                    where: {
                        convertedAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createConversionGoal(createDto, tenantId) {
        return await this.prisma.conversionGoal.create({
            data: {
                ...createDto,
                tenantId,
            },
        });
    }
    async updateConversionGoal(id, updateDto, tenantId) {
        const existingGoal = await this.prisma.conversionGoal.findFirst({
            where: { id, tenantId },
        });
        if (!existingGoal) {
            throw new common_1.NotFoundException('Conversion goal not found');
        }
        return await this.prisma.conversionGoal.update({
            where: { id },
            data: updateDto,
        });
    }
    async deleteConversionGoal(id, tenantId) {
        const existingGoal = await this.prisma.conversionGoal.findFirst({
            where: { id, tenantId },
        });
        if (!existingGoal) {
            throw new common_1.NotFoundException('Conversion goal not found');
        }
        await this.prisma.conversionGoal.delete({
            where: { id },
        });
    }
    async recordConversion(conversionData, ipAddress, userAgent) {
        const { goalId, ...data } = conversionData;
        const goal = await this.prisma.conversionGoal.findUnique({
            where: { id: goalId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Conversion goal not found');
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
    async getBasicStats(tenantId, dateFilter) {
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
    calculatePercentageChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 10000) / 100;
    }
    calculateDateRange(period, startDate, endDate) {
        const end = endDate ? new Date(endDate) : new Date();
        let start;
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
    buildDateFilter(startDate, endDate) {
        if (!startDate && !endDate)
            return undefined;
        const filter = {};
        if (startDate)
            filter.gte = new Date(startDate);
        if (endDate)
            filter.lte = new Date(endDate);
        return filter;
    }
    parseUserAgent(userAgent) {
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
        return { deviceType, browserName, osName, language: 'en' };
    }
    async getGeoInfo(ipAddress) {
        return { country: 'Unknown', city: 'Unknown' };
    }
    extractDomain(url) {
        if (!url)
            return 'Direct';
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        }
        catch {
            return 'Unknown';
        }
    }
    getCountryCode(country) {
        const countryMap = {
            'Turkey': 'TR',
            'United States': 'US',
            'Germany': 'DE',
            'France': 'FR',
            'United Kingdom': 'GB',
        };
        return countryMap[country] || 'XX';
    }
    async calculatePageBounceRate(tenantId, pageUrl, dateFilter) {
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
    getGroupByFields(groupBy) {
        switch (groupBy) {
            case 'hour':
                return ['visitedAt'];
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
    formatGroupByDate(trend, groupBy) {
        return trend.visitedAt;
    }
    calculateNextRunTime(cronExpression) {
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 24);
        return nextRun;
    }
    async generateReportData(report, tenantId) {
        switch (report.reportType) {
            case 'traffic':
                return await this.generateTrafficReport(tenantId, report);
            case 'content':
                return await this.generateContentReport(tenantId, report);
            default:
                throw new common_1.BadRequestException('Unsupported report type');
        }
    }
    async generateTrafficReport(tenantId, report) {
        return await this.getAnalyticsOverview(tenantId, {
            period: report.dateRange,
            startDate: report.startDate?.toISOString(),
            endDate: report.endDate?.toISOString(),
        });
    }
    async generateContentReport(tenantId, report) {
        return await this.getContentAnalytics(tenantId, {
            startDate: report.startDate?.toISOString(),
            endDate: report.endDate?.toISOString(),
        });
    }
    async getWebsiteAnalyticsData(tenantId, filters) {
        return await this.getAnalyticsTrends(tenantId, filters);
    }
    async getContentAnalyticsData(tenantId, filters) {
        return await this.getContentAnalytics(tenantId, filters);
    }
    async getSystemMetricsData(tenantId, filters) {
        return await this.getSystemMetrics(tenantId, filters);
    }
    groupMetricsByTime(metrics, groupBy) {
        return metrics.reduce((acc, metric) => {
            const timeKey = this.getTimeKey(metric.recordedAt, groupBy);
            if (!acc[timeKey]) {
                acc[timeKey] = [];
            }
            acc[timeKey].push(metric);
            return acc;
        }, {});
    }
    getTimeKey(date, groupBy) {
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
    groupAnalyticsByDate(analytics, groupBy) {
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
};
exports.DashboardAnalyticsService = DashboardAnalyticsService;
exports.DashboardAnalyticsService = DashboardAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardAnalyticsService);
//# sourceMappingURL=dashboard-analytics.service.js.map