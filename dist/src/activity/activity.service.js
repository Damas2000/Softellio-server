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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let ActivityService = class ActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logActivity(params) {
        try {
            return await this.prisma.userActivity.create({
                data: {
                    userId: params.userId,
                    tenantId: params.tenantId,
                    action: params.action,
                    details: params.details,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                },
            });
        }
        catch (error) {
            console.error('Failed to log user activity:', error);
            throw error;
        }
    }
    async getActivitySummary(userId, tenantId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const whereClause = {
            userId,
            createdAt: { gte: startDate },
        };
        if (tenantId !== undefined) {
            whereClause.tenantId = tenantId;
        }
        const activities = await this.prisma.userActivity.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        const totalActivities = activities.length;
        const activitiesByAction = {};
        activities.forEach((activity) => {
            activitiesByAction[activity.action] =
                (activitiesByAction[activity.action] || 0) + 1;
        });
        const activitiesByDayMap = new Map();
        activities.forEach((activity) => {
            const date = activity.createdAt.toISOString().split('T')[0];
            activitiesByDayMap.set(date, (activitiesByDayMap.get(date) || 0) + 1);
        });
        const activitiesByDay = Array.from(activitiesByDayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.date.localeCompare(a.date));
        const lastActivityRecord = await this.prisma.userActivity.findFirst({
            where: {
                userId,
                ...(tenantId !== undefined && { tenantId }),
            },
            orderBy: { createdAt: 'desc' },
        });
        const lastActivity = lastActivityRecord?.createdAt;
        const hourCounts = new Array(24).fill(0);
        activities.forEach((activity) => {
            const hour = activity.createdAt.getHours();
            hourCounts[hour]++;
        });
        const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
        return {
            totalActivities,
            activitiesByAction,
            activitiesByDay,
            lastActivity,
            mostActiveHour,
        };
    }
    async getActivityLog(userId, tenantId, page = 1, limit = 50, action) {
        const skip = (page - 1) * limit;
        const whereClause = {
            userId,
            ...(tenantId !== undefined && { tenantId }),
            ...(action && { action }),
        };
        const total = await this.prisma.userActivity.count({ where: whereClause });
        const activities = await this.prisma.userActivity.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const activityEntries = activities.map((activity) => ({
            id: activity.id,
            action: activity.action,
            details: activity.details,
            ipAddress: activity.ipAddress,
            userAgent: activity.userAgent,
            metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
            createdAt: activity.createdAt,
            user: activity.user,
        }));
        return {
            activities: activityEntries,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getGlobalActivitySummary(tenantId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const whereClause = {
            createdAt: { gte: startDate },
            ...(tenantId !== undefined && { tenantId }),
        };
        const activities = await this.prisma.userActivity.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalActivities = activities.length;
        const uniqueUsers = new Set(activities.map((a) => a.userId));
        const totalUsers = uniqueUsers.size;
        const activitiesByAction = {};
        activities.forEach((activity) => {
            activitiesByAction[activity.action] =
                (activitiesByAction[activity.action] || 0) + 1;
        });
        const activitiesByDayMap = new Map();
        activities.forEach((activity) => {
            const date = activity.createdAt.toISOString().split('T')[0];
            activitiesByDayMap.set(date, (activitiesByDayMap.get(date) || 0) + 1);
        });
        const activitiesByDay = Array.from(activitiesByDayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.date.localeCompare(a.date));
        const userActivityCounts = new Map();
        activities.forEach((activity) => {
            const existing = userActivityCounts.get(activity.userId);
            if (existing) {
                existing.count++;
            }
            else {
                userActivityCounts.set(activity.userId, {
                    user: activity.user,
                    count: 1,
                });
            }
        });
        const topUsers = Array.from(userActivityCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((entry) => ({
            userId: entry.user.id,
            userName: entry.user.name,
            userEmail: entry.user.email,
            activityCount: entry.count,
        }));
        return {
            totalActivities,
            totalUsers,
            activitiesByAction,
            activitiesByDay,
            topUsers,
        };
    }
    async cleanupOldActivities(olderThanDays = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.prisma.userActivity.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
        return result.count;
    }
    async getActivityStats(tenantId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const baseWhere = tenantId !== undefined ? { tenantId } : {};
        const [todayCount, yesterdayCount, weekCount, monthCount, totalUsers] = await Promise.all([
            this.prisma.userActivity.count({
                where: { ...baseWhere, createdAt: { gte: today } },
            }),
            this.prisma.userActivity.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: yesterday, lt: today },
                },
            }),
            this.prisma.userActivity.count({
                where: { ...baseWhere, createdAt: { gte: thisWeekStart } },
            }),
            this.prisma.userActivity.count({
                where: { ...baseWhere, createdAt: { gte: thisMonthStart } },
            }),
            this.prisma.user.count({
                where: tenantId !== undefined ? { tenantId } : {},
            }),
        ]);
        return {
            today: todayCount,
            yesterday: yesterdayCount,
            thisWeek: weekCount,
            thisMonth: monthCount,
            totalUsers,
        };
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map