import { PrismaService } from '../config/prisma.service';
import { UserActivity } from '@prisma/client';
export interface ActivityLogParams {
    userId: number;
    tenantId?: number;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
}
export interface ActivitySummary {
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByDay: Array<{
        date: string;
        count: number;
    }>;
    lastActivity?: Date;
    mostActiveHour: number;
}
export interface ActivityLogEntry {
    id: number;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
    createdAt: Date;
    user?: {
        id: number;
        name?: string;
        email: string;
    };
}
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    logActivity(params: ActivityLogParams): Promise<UserActivity>;
    getActivitySummary(userId: number, tenantId?: number, days?: number): Promise<ActivitySummary>;
    getActivityLog(userId: number, tenantId?: number, page?: number, limit?: number, action?: string): Promise<{
        activities: ActivityLogEntry[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getGlobalActivitySummary(tenantId?: number, days?: number): Promise<{
        totalActivities: number;
        totalUsers: number;
        activitiesByAction: Record<string, number>;
        activitiesByDay: Array<{
            date: string;
            count: number;
        }>;
        topUsers: Array<{
            userId: number;
            userName?: string;
            userEmail: string;
            activityCount: number;
        }>;
    }>;
    cleanupOldActivities(olderThanDays?: number): Promise<number>;
    getActivityStats(tenantId?: number): Promise<{
        today: number;
        yesterday: number;
        thisWeek: number;
        thisMonth: number;
        totalUsers: number;
    }>;
}
