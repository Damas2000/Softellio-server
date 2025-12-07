export declare class RecordVisitDto {
    pageUrl: string;
    pagePath: string;
    pageTitle?: string;
    sessionId?: string;
    userId?: string;
    referrer?: string;
    entityType?: string;
    entityId?: number;
    timeOnPage?: number;
    scrollDepth?: number;
    bounceRate?: boolean;
    exitPage?: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    loadTime?: number;
    errors?: string;
}
export declare class AnalyticsQueryDto {
    startDate?: string;
    endDate?: string;
    entityType?: string;
    entityId?: number;
    deviceType?: string;
    country?: string;
    utmSource?: string;
    utmMedium?: string;
    groupBy?: string;
    page?: number;
    limit?: number;
}
export declare class CreateDashboardWidgetDto {
    name: string;
    type: string;
    category: string;
    dataSource: string;
    query?: any;
    filters?: any;
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
    size?: string;
    position?: any;
    isPublic?: boolean;
    allowedRoles?: string[];
    refreshInterval?: number;
    isActive?: boolean;
}
export declare class UpdateDashboardWidgetDto {
    name?: string;
    type?: string;
    category?: string;
    dataSource?: string;
    query?: any;
    filters?: any;
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
    size?: string;
    position?: any;
    isPublic?: boolean;
    allowedRoles?: string[];
    refreshInterval?: number;
    isActive?: boolean;
}
export declare class DashboardQueryDto {
    category?: string;
    isActive?: boolean;
    search?: string;
}
export declare class CreateAnalyticsReportDto {
    name: string;
    description?: string;
    reportType: string;
    metrics: any;
    dateRange: string;
    startDate?: string;
    endDate?: string;
    filters?: any;
    format?: string;
    recipients?: string[];
    isScheduled?: boolean;
    schedule?: string;
    timezone?: string;
    isActive?: boolean;
}
export declare class UpdateAnalyticsReportDto {
    name?: string;
    description?: string;
    reportType?: string;
    metrics?: any;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    filters?: any;
    format?: string;
    recipients?: string[];
    isScheduled?: boolean;
    schedule?: string;
    timezone?: string;
    isActive?: boolean;
}
export declare class RecordSystemMetricDto {
    metricType: string;
    metricName: string;
    value: number;
    unit?: string;
    category: string;
    component?: string;
    warningThreshold?: number;
    criticalThreshold?: number;
    status?: string;
    metadata?: any;
    tags?: string[];
}
export declare class SystemMetricsQueryDto {
    metricType?: string;
    category?: string;
    component?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
}
export declare class UpdateContentAnalyticsDto {
    entityType: string;
    entityId: number;
    contentTitle?: string;
    contentSlug?: string;
    viewCount?: number;
    uniqueViews?: number;
    averageTimeOnPage?: number;
    bounceRate?: number;
    conversionRate?: number;
    shareCount?: number;
    commentCount?: number;
    organicTraffic?: number;
    searchImpressions?: number;
    searchClicks?: number;
    averagePosition?: number;
}
export declare class ContentAnalyticsQueryDto {
    entityType?: string;
    entityId?: number;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class CreateActiveSessionDto {
    sessionId: string;
    currentPage: string;
    pageTitle?: string;
    referrer?: string;
    pageViews?: number;
    timeOnSite?: number;
    isBot?: boolean;
}
export declare class UpdateActiveSessionDto {
    currentPage?: string;
    pageTitle?: string;
    pageViews?: number;
    timeOnSite?: number;
}
export declare class CreateConversionGoalDto {
    name: string;
    description?: string;
    goalType: string;
    targetUrl?: string;
    targetElement?: string;
    eventName?: string;
    conditions?: any;
    hasValue?: boolean;
    defaultValue?: number;
    currency?: string;
    isActive?: boolean;
}
export declare class UpdateConversionGoalDto {
    name?: string;
    description?: string;
    goalType?: string;
    targetUrl?: string;
    targetElement?: string;
    eventName?: string;
    conditions?: any;
    hasValue?: boolean;
    defaultValue?: number;
    currency?: string;
    isActive?: boolean;
}
export declare class RecordConversionDto {
    goalId: number;
    sessionId?: string;
    value?: number;
    currency?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    metadata?: any;
}
export declare class DashboardOverviewQueryDto {
    startDate?: string;
    endDate?: string;
    period?: string;
    includeComparison?: boolean;
}
export declare class WidgetDataQueryDto {
    widgetId: number;
    startDate?: string;
    endDate?: string;
    additionalFilters?: any;
}
export declare class RealTimeQueryDto {
    metric?: string;
    minutes?: number;
}
export declare class ExportAnalyticsDto {
    format: string;
    dataType: string;
    startDate?: string;
    endDate?: string;
    filters?: any;
    columns?: string[];
}
export declare class CreateAnalyticsAlertDto {
    name: string;
    description?: string;
    metricType: string;
    conditions: any;
    notificationChannels?: string[];
    recipients?: string[];
    isActive?: boolean;
}
export interface OverviewStatsResponse {
    visitors: {
        current: number;
        previous: number;
        change: number;
        changePercentage: number;
    };
    pageviews: {
        current: number;
        previous: number;
        change: number;
        changePercentage: number;
    };
    bounceRate: {
        current: number;
        previous: number;
        change: number;
        changePercentage: number;
    };
    avgSessionDuration: {
        current: number;
        previous: number;
        change: number;
        changePercentage: number;
    };
}
export interface PopularPagesResponse {
    url: string;
    title: string;
    views: number;
    uniqueViews: number;
    averageTime: number;
    bounceRate: number;
}
export interface TrafficSourcesResponse {
    source: string;
    visitors: number;
    percentage: number;
    change: number;
}
export interface DeviceAnalyticsResponse {
    device: string;
    sessions: number;
    percentage: number;
    averageSessionDuration: number;
}
export interface GeographicAnalyticsResponse {
    country: string;
    countryCode: string;
    visitors: number;
    percentage: number;
    sessions: number;
    bounceRate: number;
}
export interface RealTimeVisitorsResponse {
    activeVisitors: number;
    currentHour: number;
    recentVisitors: Array<{
        timestamp: Date;
        page: string;
        country?: string;
        device?: string;
    }>;
    topPages: Array<{
        page: string;
        activeVisitors: number;
    }>;
}
