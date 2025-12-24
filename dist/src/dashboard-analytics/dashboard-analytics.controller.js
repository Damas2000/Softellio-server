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
exports.DashboardAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_analytics_service_1 = require("./dashboard-analytics.service");
const dashboard_analytics_dto_1 = require("./dto/dashboard-analytics.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let DashboardAnalyticsController = class DashboardAnalyticsController {
    constructor(dashboardAnalyticsService) {
        this.dashboardAnalyticsService = dashboardAnalyticsService;
    }
    async trackVisit(recordVisitDto, tenantId, ipAddress, userAgent) {
        try {
            await this.dashboardAnalyticsService.recordVisit(recordVisitDto, tenantId, ipAddress, userAgent);
            return { success: true };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track visit', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackConversion(recordConversionDto, ipAddress, userAgent) {
        try {
            const conversion = await this.dashboardAnalyticsService.recordConversion(recordConversionDto, ipAddress, userAgent);
            return {
                success: true,
                data: conversion,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track conversion', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateActiveSession(sessionId, updateSessionDto, tenantId) {
        try {
            await this.dashboardAnalyticsService.updateActiveSession(sessionId, updateSessionDto, tenantId);
            return { success: true };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to update session', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDashboardOverview(tenantId, query) {
        try {
            const overview = await this.dashboardAnalyticsService.getAnalyticsOverview(tenantId, query);
            return {
                success: true,
                data: overview,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get dashboard overview', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPopularPages(tenantId, query) {
        try {
            const pages = await this.dashboardAnalyticsService.getPopularPages(tenantId, query);
            return {
                success: true,
                data: pages,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get popular pages', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTrafficSources(tenantId, query) {
        try {
            const sources = await this.dashboardAnalyticsService.getTrafficSources(tenantId, query);
            return {
                success: true,
                data: sources,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get traffic sources', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDeviceAnalytics(tenantId, query) {
        try {
            const devices = await this.dashboardAnalyticsService.getDeviceAnalytics(tenantId, query);
            return {
                success: true,
                data: devices,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get device analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGeographicAnalytics(tenantId, query) {
        try {
            const geographic = await this.dashboardAnalyticsService.getGeographicAnalytics(tenantId, query);
            return {
                success: true,
                data: geographic,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get geographic analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAnalyticsTrends(tenantId, query) {
        try {
            const trends = await this.dashboardAnalyticsService.getAnalyticsTrends(tenantId, query);
            return {
                success: true,
                data: trends,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get analytics trends', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllDashboardWidgets(tenantId, query) {
        try {
            const widgets = await this.dashboardAnalyticsService.getAllDashboardWidgets(tenantId, query);
            return {
                success: true,
                data: widgets,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get dashboard widgets', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDashboardWidgetById(id, tenantId) {
        try {
            const widget = await this.dashboardAnalyticsService.getDashboardWidgetById(id, tenantId);
            return {
                success: true,
                data: widget,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get dashboard widget', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createDashboardWidget(createDto, tenantId) {
        try {
            const widget = await this.dashboardAnalyticsService.createDashboardWidget(createDto, tenantId);
            return {
                success: true,
                message: 'Dashboard widget created successfully',
                data: widget,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create dashboard widget', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateDashboardWidget(id, updateDto, tenantId) {
        try {
            const widget = await this.dashboardAnalyticsService.updateDashboardWidget(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Dashboard widget updated successfully',
                data: widget,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update dashboard widget', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteDashboardWidget(id, tenantId) {
        try {
            await this.dashboardAnalyticsService.deleteDashboardWidget(id, tenantId);
            return {
                success: true,
                message: 'Dashboard widget deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete dashboard widget', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getWidgetData(tenantId, query) {
        try {
            const data = await this.dashboardAnalyticsService.getWidgetData(tenantId, query);
            return {
                success: true,
                data: data,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get widget data', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllAnalyticsReports(tenantId) {
        try {
            const reports = await this.dashboardAnalyticsService.getAllAnalyticsReports(tenantId);
            return {
                success: true,
                data: reports,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get analytics reports', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createAnalyticsReport(createDto, tenantId) {
        try {
            const report = await this.dashboardAnalyticsService.createAnalyticsReport(createDto, tenantId);
            return {
                success: true,
                message: 'Analytics report created successfully',
                data: report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create analytics report', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateAnalyticsReport(id, updateDto, tenantId) {
        try {
            const report = await this.dashboardAnalyticsService.updateAnalyticsReport(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Analytics report updated successfully',
                data: report,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update analytics report', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateReport(id, tenantId) {
        try {
            const reportData = await this.dashboardAnalyticsService.generateReport(id, tenantId);
            return {
                success: true,
                message: 'Report generated successfully',
                data: reportData,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to generate report', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async recordSystemMetric(recordDto, tenantId) {
        try {
            const metric = await this.dashboardAnalyticsService.recordSystemMetric(recordDto, tenantId);
            return {
                success: true,
                message: 'System metric recorded successfully',
                data: metric,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to record system metric', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSystemMetrics(tenantId, query) {
        try {
            const metrics = await this.dashboardAnalyticsService.getSystemMetrics(tenantId, query);
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get system metrics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateContentAnalytics(updateDto, tenantId) {
        try {
            const analytics = await this.dashboardAnalyticsService.updateContentAnalytics(updateDto, tenantId);
            return {
                success: true,
                message: 'Content analytics updated successfully',
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update content analytics', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getContentAnalytics(tenantId, query) {
        try {
            const analytics = await this.dashboardAnalyticsService.getContentAnalytics(tenantId, query);
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get content analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllConversionGoals(tenantId) {
        try {
            const goals = await this.dashboardAnalyticsService.getAllConversionGoals(tenantId);
            return {
                success: true,
                data: goals,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get conversion goals', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createConversionGoal(createDto, tenantId) {
        try {
            const goal = await this.dashboardAnalyticsService.createConversionGoal(createDto, tenantId);
            return {
                success: true,
                message: 'Conversion goal created successfully',
                data: goal,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create conversion goal', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateConversionGoal(id, updateDto, tenantId) {
        try {
            const goal = await this.dashboardAnalyticsService.updateConversionGoal(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Conversion goal updated successfully',
                data: goal,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update conversion goal', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteConversionGoal(id, tenantId) {
        try {
            await this.dashboardAnalyticsService.deleteConversionGoal(id, tenantId);
            return {
                success: true,
                message: 'Conversion goal deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete conversion goal', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getRealTimeVisitors(tenantId, query) {
        try {
            const visitors = await this.dashboardAnalyticsService.getRealTimeVisitors(tenantId, query);
            return {
                success: true,
                data: visitors,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get real-time visitors', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cleanupExpiredSessions() {
        try {
            const count = await this.dashboardAnalyticsService.cleanupExpiredSessions();
            return {
                success: true,
                message: `Cleaned up ${count} expired sessions`,
                data: { cleaned: count },
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to cleanup sessions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
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
};
exports.DashboardAnalyticsController = DashboardAnalyticsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/visit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.RecordVisitDto, Number, String, String]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "trackVisit", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/conversion'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.RecordConversionDto, String, String]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "trackConversion", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_analytics_dto_1.UpdateActiveSessionDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "updateActiveSession", null);
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.DashboardOverviewQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getDashboardOverview", null);
__decorate([
    (0, common_1.Get)('admin/popular-pages'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getPopularPages", null);
__decorate([
    (0, common_1.Get)('admin/traffic-sources'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getTrafficSources", null);
__decorate([
    (0, common_1.Get)('admin/device-analytics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getDeviceAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/geographic-analytics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getGeographicAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/trends'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getAnalyticsTrends", null);
__decorate([
    (0, common_1.Get)('admin/widgets'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getAllDashboardWidgets", null);
__decorate([
    (0, common_1.Get)('admin/widgets/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getDashboardWidgetById", null);
__decorate([
    (0, common_1.Post)('admin/widgets'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.CreateDashboardWidgetDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "createDashboardWidget", null);
__decorate([
    (0, common_1.Put)('admin/widgets/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.UpdateDashboardWidgetDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "updateDashboardWidget", null);
__decorate([
    (0, common_1.Delete)('admin/widgets/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "deleteDashboardWidget", null);
__decorate([
    (0, common_1.Get)('admin/widgets/:id/data'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.WidgetDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getWidgetData", null);
__decorate([
    (0, common_1.Get)('admin/reports'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getAllAnalyticsReports", null);
__decorate([
    (0, common_1.Post)('admin/reports'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.CreateAnalyticsReportDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "createAnalyticsReport", null);
__decorate([
    (0, common_1.Put)('admin/reports/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.UpdateAnalyticsReportDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "updateAnalyticsReport", null);
__decorate([
    (0, common_1.Post)('admin/reports/:id/generate'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Post)('admin/system/metrics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.RecordSystemMetricDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "recordSystemMetric", null);
__decorate([
    (0, common_1.Get)('admin/system/metrics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.SystemMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Put)('admin/content/analytics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.UpdateContentAnalyticsDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "updateContentAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/content/analytics'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.ContentAnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getContentAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/conversion-goals'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getAllConversionGoals", null);
__decorate([
    (0, common_1.Post)('admin/conversion-goals'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_analytics_dto_1.CreateConversionGoalDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "createConversionGoal", null);
__decorate([
    (0, common_1.Put)('admin/conversion-goals/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.UpdateConversionGoalDto, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "updateConversionGoal", null);
__decorate([
    (0, common_1.Delete)('admin/conversion-goals/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "deleteConversionGoal", null);
__decorate([
    (0, common_1.Get)('admin/real-time/visitors'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dashboard_analytics_dto_1.RealTimeQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getRealTimeVisitors", null);
__decorate([
    (0, common_1.Post)('admin/sessions/cleanup'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "cleanupExpiredSessions", null);
__decorate([
    (0, common_1.Get)('admin/widget-types'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getSupportedWidgetTypes", null);
__decorate([
    (0, common_1.Get)('admin/metric-types'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardAnalyticsController.prototype, "getSupportedMetricTypes", null);
exports.DashboardAnalyticsController = DashboardAnalyticsController = __decorate([
    (0, common_1.Controller)('dashboard-analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, tenant_guard_1.TenantGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [dashboard_analytics_service_1.DashboardAnalyticsService])
], DashboardAnalyticsController);
//# sourceMappingURL=dashboard-analytics.controller.js.map