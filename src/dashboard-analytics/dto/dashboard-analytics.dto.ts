import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsIn,
  Min,
  Max,
  IsObject,
  IsUrl,
  IsJSON,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// =================== WEBSITE ANALYTICS DTOs ===================

export class RecordVisitDto {
  @IsString()
  pageUrl: string;

  @IsString()
  pagePath: string;

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsInt()
  entityId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeOnPage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  scrollDepth?: number;

  @IsOptional()
  @IsBoolean()
  bounceRate?: boolean;

  @IsOptional()
  @IsBoolean()
  exitPage?: boolean;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  loadTime?: number;

  @IsOptional()
  @IsString()
  errors?: string;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  entityId?: number;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month'])
  groupBy?: string = 'day';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// =================== DASHBOARD WIDGET DTOs ===================

export class CreateDashboardWidgetDto {
  @IsString()
  name: string;

  @IsEnum(['chart_line', 'chart_bar', 'chart_pie', 'stat_card', 'table', 'map', 'gauge', 'funnel'])
  type: string;

  @IsEnum(['analytics', 'content', 'ecommerce', 'social', 'system', 'seo'])
  category: string;

  @IsString()
  dataSource: string;

  @IsOptional()
  @IsObject()
  query?: any;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  size?: string = 'medium';

  @IsOptional()
  @IsObject()
  position?: any;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[] = [];

  @IsOptional()
  @IsInt()
  @Min(60)
  refreshInterval?: number = 300;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateDashboardWidgetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['chart_line', 'chart_bar', 'chart_pie', 'stat_card', 'table', 'map', 'gauge', 'funnel'])
  type?: string;

  @IsOptional()
  @IsEnum(['analytics', 'content', 'ecommerce', 'social', 'system', 'seo'])
  category?: string;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsObject()
  query?: any;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  size?: string;

  @IsOptional()
  @IsObject()
  position?: any;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @IsOptional()
  @IsInt()
  @Min(60)
  refreshInterval?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DashboardQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

// =================== ANALYTICS REPORT DTOs ===================

export class CreateAnalyticsReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['traffic', 'content', 'social', 'seo', 'conversion', 'custom'])
  reportType: string;

  @IsObject()
  metrics: any;

  @IsEnum(['last_7_days', 'last_30_days', 'last_90_days', 'custom'])
  dateRange: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsEnum(['pdf', 'excel', 'csv', 'json'])
  format?: string = 'pdf';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[] = [];

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean = false;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateAnalyticsReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['traffic', 'content', 'social', 'seo', 'conversion', 'custom'])
  reportType?: string;

  @IsOptional()
  @IsObject()
  metrics?: any;

  @IsOptional()
  @IsEnum(['last_7_days', 'last_30_days', 'last_90_days', 'custom'])
  dateRange?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsEnum(['pdf', 'excel', 'csv', 'json'])
  format?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// =================== SYSTEM METRICS DTOs ===================

export class RecordSystemMetricDto {
  @IsString()
  @IsIn(['cpu_usage', 'memory_usage', 'disk_space', 'response_time', 'error_count', 'request_count', 'database_connections'])
  metricType: string;

  @IsString()
  metricName: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsEnum(['system', 'application', 'database', 'external_api', 'network'])
  category: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;

  @IsOptional()
  @IsNumber()
  criticalThreshold?: number;

  @IsOptional()
  @IsEnum(['normal', 'warning', 'critical'])
  status?: string = 'normal';

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];
}

export class SystemMetricsQueryDto {
  @IsOptional()
  @IsString()
  metricType?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsEnum(['normal', 'warning', 'critical'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['minute', 'hour', 'day'])
  groupBy?: string = 'hour';
}

// =================== CONTENT ANALYTICS DTOs ===================

export class UpdateContentAnalyticsDto {
  @IsString()
  @IsIn(['page', 'blog_post', 'service', 'team_member', 'reference'])
  entityType: string;

  @IsInt()
  entityId: number;

  @IsOptional()
  @IsString()
  contentTitle?: string;

  @IsOptional()
  @IsString()
  contentSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  uniqueViews?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  averageTimeOnPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bounceRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  conversionRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shareCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  commentCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  organicTraffic?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  searchImpressions?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  searchClicks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averagePosition?: number;
}

export class ContentAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  entityId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  groupBy?: string = 'day';

  @IsOptional()
  @IsString()
  sortBy?: string = 'viewCount';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// =================== ACTIVE SESSIONS DTOs ===================

export class CreateActiveSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  currentPage: string;

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageViews?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeOnSite?: number = 0;

  @IsOptional()
  @IsBoolean()
  isBot?: boolean = false;
}

export class UpdateActiveSessionDto {
  @IsOptional()
  @IsString()
  currentPage?: string;

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageViews?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeOnSite?: number;
}

// =================== CONVERSION GOAL DTOs ===================

export class CreateConversionGoalDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['page_visit', 'form_submission', 'time_on_site', 'custom_event', 'download', 'email_click'])
  goalType: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  targetElement?: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsObject()
  conditions?: any;

  @IsOptional()
  @IsBoolean()
  hasValue?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultValue?: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateConversionGoalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['page_visit', 'form_submission', 'time_on_site', 'custom_event', 'download', 'email_click'])
  goalType?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  targetElement?: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsObject()
  conditions?: any;

  @IsOptional()
  @IsBoolean()
  hasValue?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultValue?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RecordConversionDto {
  @IsInt()
  goalId: number;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

// =================== DASHBOARD OVERVIEW DTOs ===================

export class DashboardOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'custom'])
  period?: string = 'last_30_days';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeComparison?: boolean = true;
}

export class WidgetDataQueryDto {
  @IsInt()
  @Type(() => Number)
  widgetId: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  additionalFilters?: any;
}

// =================== REAL-TIME DTOs ===================

export class RealTimeQueryDto {
  @IsOptional()
  @IsEnum(['visitors', 'pageviews', 'events', 'conversions'])
  metric?: string = 'visitors';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(1440)
  minutes?: number = 30;
}

// =================== EXPORT DTOs ===================

export class ExportAnalyticsDto {
  @IsEnum(['csv', 'excel', 'pdf', 'json'])
  format: string;

  @IsEnum(['traffic', 'content', 'social', 'conversion', 'system'])
  dataType: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];
}

// =================== ALERT DTOs ===================

export class CreateAnalyticsAlertDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  metricType: string; // traffic_drop, spike_detection, goal_completion, error_rate

  @IsObject()
  conditions: any; // Threshold conditions

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationChannels?: string[] = ['email'];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[] = [];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

// =================== RESPONSE INTERFACES ===================

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