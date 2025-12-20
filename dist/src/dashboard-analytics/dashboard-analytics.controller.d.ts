import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { RecordVisitDto, AnalyticsQueryDto, CreateDashboardWidgetDto, UpdateDashboardWidgetDto, DashboardQueryDto, CreateAnalyticsReportDto, UpdateAnalyticsReportDto, RecordSystemMetricDto, SystemMetricsQueryDto, UpdateContentAnalyticsDto, ContentAnalyticsQueryDto, UpdateActiveSessionDto, CreateConversionGoalDto, UpdateConversionGoalDto, RecordConversionDto, DashboardOverviewQueryDto, WidgetDataQueryDto, RealTimeQueryDto } from './dto/dashboard-analytics.dto';
export declare class DashboardAnalyticsController {
    private readonly dashboardAnalyticsService;
    constructor(dashboardAnalyticsService: DashboardAnalyticsService);
    trackVisit(recordVisitDto: RecordVisitDto, tenantId: number, ipAddress: string, userAgent: string): Promise<{
        success: boolean;
    }>;
    trackConversion(recordConversionDto: RecordConversionDto, ipAddress: string, userAgent: string): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            value: number | null;
            ipAddress: string | null;
            userAgent: string | null;
            referrer: string | null;
            sessionId: string | null;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            currency: string | null;
            goalId: number;
            convertedAt: Date;
        };
    }>;
    updateActiveSession(sessionId: string, updateSessionDto: UpdateActiveSessionDto, tenantId: number): Promise<{
        success: boolean;
    }>;
    getDashboardOverview(tenantId: number, query: DashboardOverviewQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").OverviewStatsResponse;
    }>;
    getPopularPages(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").PopularPagesResponse[];
    }>;
    getTrafficSources(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").TrafficSourcesResponse[];
    }>;
    getDeviceAnalytics(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").DeviceAnalyticsResponse[];
    }>;
    getGeographicAnalytics(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").GeographicAnalyticsResponse[];
    }>;
    getAnalyticsTrends(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: {
            date: Date;
            visitors: any;
            pageviews: any;
            averageSessionDuration: number;
        }[];
    }>;
    getAllDashboardWidgets(tenantId: number, query: DashboardQueryDto): Promise<{
        success: boolean;
        data: {
            isPublic: boolean;
            description: string | null;
            type: string;
            title: string | null;
            query: import("@prisma/client/runtime/library").JsonValue | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            size: string;
            icon: string | null;
            position: import("@prisma/client/runtime/library").JsonValue | null;
            color: string | null;
            dataSource: string;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            allowedRoles: string[];
            refreshInterval: number | null;
        }[];
    }>;
    getDashboardWidgetById(id: number, tenantId: number): Promise<{
        success: boolean;
        data: {
            isPublic: boolean;
            description: string | null;
            type: string;
            title: string | null;
            query: import("@prisma/client/runtime/library").JsonValue | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            size: string;
            icon: string | null;
            position: import("@prisma/client/runtime/library").JsonValue | null;
            color: string | null;
            dataSource: string;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            allowedRoles: string[];
            refreshInterval: number | null;
        };
    }>;
    createDashboardWidget(createDto: CreateDashboardWidgetDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            isPublic: boolean;
            description: string | null;
            type: string;
            title: string | null;
            query: import("@prisma/client/runtime/library").JsonValue | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            size: string;
            icon: string | null;
            position: import("@prisma/client/runtime/library").JsonValue | null;
            color: string | null;
            dataSource: string;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            allowedRoles: string[];
            refreshInterval: number | null;
        };
    }>;
    updateDashboardWidget(id: number, updateDto: UpdateDashboardWidgetDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            isPublic: boolean;
            description: string | null;
            type: string;
            title: string | null;
            query: import("@prisma/client/runtime/library").JsonValue | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            size: string;
            icon: string | null;
            position: import("@prisma/client/runtime/library").JsonValue | null;
            color: string | null;
            dataSource: string;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            allowedRoles: string[];
            refreshInterval: number | null;
        };
    }>;
    deleteDashboardWidget(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getWidgetData(tenantId: number, query: WidgetDataQueryDto): Promise<{
        success: boolean;
        data: any;
    }>;
    getAllAnalyticsReports(tenantId: number): Promise<{
        success: boolean;
        data: ({
            executions: {
                status: string;
                id: number;
                createdAt: Date;
                startedAt: Date;
                reportId: number;
                completedAt: Date | null;
                duration: number | null;
                fileUrl: string | null;
                fileSize: number | null;
                recordCount: number | null;
                errorMessage: string | null;
                executionData: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
        } & {
            description: string | null;
            format: string;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            reportType: string;
            metrics: import("@prisma/client/runtime/library").JsonValue;
            dateRange: string;
            recipients: string[];
            isScheduled: boolean;
            schedule: string | null;
            timezone: string;
            nextRunAt: Date | null;
            lastRunAt: Date | null;
        })[];
    }>;
    createAnalyticsReport(createDto: CreateAnalyticsReportDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            format: string;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            reportType: string;
            metrics: import("@prisma/client/runtime/library").JsonValue;
            dateRange: string;
            recipients: string[];
            isScheduled: boolean;
            schedule: string | null;
            timezone: string;
            nextRunAt: Date | null;
            lastRunAt: Date | null;
        };
    }>;
    updateAnalyticsReport(id: number, updateDto: UpdateAnalyticsReportDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            format: string;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            reportType: string;
            metrics: import("@prisma/client/runtime/library").JsonValue;
            dateRange: string;
            recipients: string[];
            isScheduled: boolean;
            schedule: string | null;
            timezone: string;
            nextRunAt: Date | null;
            lastRunAt: Date | null;
        };
    }>;
    generateReport(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/dashboard-analytics.dto").OverviewStatsResponse | {
            data: {
                id: number;
                tenantId: number;
                createdAt: Date;
                updatedAt: Date;
                entityType: string;
                entityId: number;
                viewCount: number;
                date: Date;
                bounceRate: number;
                contentTitle: string | null;
                contentSlug: string | null;
                uniqueViews: number;
                averageTimeOnPage: number;
                conversionRate: number;
                shareCount: number;
                commentCount: number;
                organicTraffic: number;
                searchImpressions: number;
                searchClicks: number;
                averagePosition: number;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
        };
    }>;
    recordSystemMetric(recordDto: RecordSystemMetricDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            tags: string[];
            status: string;
            id: number;
            tenantId: number | null;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            value: number;
            category: string;
            metricType: string;
            metricName: string;
            unit: string | null;
            component: string | null;
            warningThreshold: number | null;
            criticalThreshold: number | null;
            recordedAt: Date;
        };
    }>;
    getSystemMetrics(tenantId: number, query: SystemMetricsQueryDto): Promise<{
        success: boolean;
        data: any;
    }>;
    updateContentAnalytics(updateDto: UpdateContentAnalyticsDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            tenantId: number;
            createdAt: Date;
            updatedAt: Date;
            entityType: string;
            entityId: number;
            viewCount: number;
            date: Date;
            bounceRate: number;
            contentTitle: string | null;
            contentSlug: string | null;
            uniqueViews: number;
            averageTimeOnPage: number;
            conversionRate: number;
            shareCount: number;
            commentCount: number;
            organicTraffic: number;
            searchImpressions: number;
            searchClicks: number;
            averagePosition: number;
        };
    }>;
    getContentAnalytics(tenantId: number, query: ContentAnalyticsQueryDto): Promise<{
        success: boolean;
        data: {
            data: {
                id: number;
                tenantId: number;
                createdAt: Date;
                updatedAt: Date;
                entityType: string;
                entityId: number;
                viewCount: number;
                date: Date;
                bounceRate: number;
                contentTitle: string | null;
                contentSlug: string | null;
                uniqueViews: number;
                averageTimeOnPage: number;
                conversionRate: number;
                shareCount: number;
                commentCount: number;
                organicTraffic: number;
                searchImpressions: number;
                searchClicks: number;
                averagePosition: number;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
        };
    }>;
    getAllConversionGoals(tenantId: number): Promise<{
        success: boolean;
        data: ({
            conversions: {
                id: number;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                value: number | null;
                ipAddress: string | null;
                userAgent: string | null;
                referrer: string | null;
                sessionId: string | null;
                utmSource: string | null;
                utmMedium: string | null;
                utmCampaign: string | null;
                currency: string | null;
                goalId: number;
                convertedAt: Date;
            }[];
        } & {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            goalType: string;
            targetUrl: string | null;
            targetElement: string | null;
            eventName: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            hasValue: boolean;
            defaultValue: number | null;
            currency: string | null;
        })[];
    }>;
    createConversionGoal(createDto: CreateConversionGoalDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            goalType: string;
            targetUrl: string | null;
            targetElement: string | null;
            eventName: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            hasValue: boolean;
            defaultValue: number | null;
            currency: string | null;
        };
    }>;
    updateConversionGoal(id: number, updateDto: UpdateConversionGoalDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            goalType: string;
            targetUrl: string | null;
            targetElement: string | null;
            eventName: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            hasValue: boolean;
            defaultValue: number | null;
            currency: string | null;
        };
    }>;
    deleteConversionGoal(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getRealTimeVisitors(tenantId: number, query: RealTimeQueryDto): Promise<{
        success: boolean;
        data: import("./dto/dashboard-analytics.dto").RealTimeVisitorsResponse;
    }>;
    cleanupExpiredSessions(): Promise<{
        success: boolean;
        message: string;
        data: {
            cleaned: number;
        };
    }>;
    getSupportedWidgetTypes(): Promise<{
        success: boolean;
        data: {
            value: string;
            label: string;
            icon: string;
            category: string;
        }[];
    }>;
    getSupportedMetricTypes(): Promise<{
        success: boolean;
        data: {
            value: string;
            label: string;
            unit: string;
            category: string;
        }[];
    }>;
}
