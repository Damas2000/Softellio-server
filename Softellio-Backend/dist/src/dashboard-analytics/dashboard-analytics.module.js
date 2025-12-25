"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_analytics_service_1 = require("./dashboard-analytics.service");
const dashboard_analytics_controller_1 = require("./dashboard-analytics.controller");
const prisma_module_1 = require("../config/prisma.module");
let DashboardAnalyticsModule = class DashboardAnalyticsModule {
};
exports.DashboardAnalyticsModule = DashboardAnalyticsModule;
exports.DashboardAnalyticsModule = DashboardAnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [dashboard_analytics_controller_1.DashboardAnalyticsController],
        providers: [dashboard_analytics_service_1.DashboardAnalyticsService],
        exports: [dashboard_analytics_service_1.DashboardAnalyticsService],
    })
], DashboardAnalyticsModule);
//# sourceMappingURL=dashboard-analytics.module.js.map