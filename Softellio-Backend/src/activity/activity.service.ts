import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UserActivity, Prisma } from '@prisma/client';

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

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a user activity
   */
  async logActivity(params: ActivityLogParams): Promise<UserActivity> {
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
    } catch (error) {
      // Log the error but don't throw to avoid breaking the main flow
      console.error('Failed to log user activity:', error);
      throw error;
    }
  }

  /**
   * Get activity summary for a user
   */
  async getActivitySummary(
    userId: number,
    tenantId?: number,
    days: number = 30,
  ): Promise<ActivitySummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause with tenant isolation
    const whereClause: Prisma.UserActivityWhereInput = {
      userId,
      createdAt: { gte: startDate },
    };

    if (tenantId !== undefined) {
      whereClause.tenantId = tenantId;
    }

    // Get all activities for the user in the time period
    const activities = await this.prisma.userActivity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total activities
    const totalActivities = activities.length;

    // Group by action
    const activitiesByAction: Record<string, number> = {};
    activities.forEach((activity) => {
      activitiesByAction[activity.action] =
        (activitiesByAction[activity.action] || 0) + 1;
    });

    // Group by day
    const activitiesByDayMap = new Map<string, number>();
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      activitiesByDayMap.set(date, (activitiesByDayMap.get(date) || 0) + 1);
    });

    // Convert to array and sort by date descending
    const activitiesByDay = Array.from(activitiesByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Get last activity
    const lastActivityRecord = await this.prisma.userActivity.findFirst({
      where: {
        userId,
        ...(tenantId !== undefined && { tenantId }),
      },
      orderBy: { createdAt: 'desc' },
    });
    const lastActivity = lastActivityRecord?.createdAt;

    // Calculate most active hour
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

  /**
   * Get paginated activity log for a user
   */
  async getActivityLog(
    userId: number,
    tenantId?: number,
    page: number = 1,
    limit: number = 50,
    action?: string,
  ): Promise<{
    activities: ActivityLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.UserActivityWhereInput = {
      userId,
      ...(tenantId !== undefined && { tenantId }),
      ...(action && { action }),
    };

    // Get total count
    const total = await this.prisma.userActivity.count({ where: whereClause });

    // Get activities
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

    // Transform to response format
    const activityEntries: ActivityLogEntry[] = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      metadata: activity.metadata ? JSON.parse(activity.metadata as string) : null,
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

  /**
   * Get global activity summary for all users in a tenant
   */
  async getGlobalActivitySummary(
    tenantId?: number,
    days: number = 30,
  ): Promise<{
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
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause
    const whereClause: Prisma.UserActivityWhereInput = {
      createdAt: { gte: startDate },
      ...(tenantId !== undefined && { tenantId }),
    };

    // Get all activities
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

    // Calculate metrics
    const totalActivities = activities.length;
    const uniqueUsers = new Set(activities.map((a) => a.userId));
    const totalUsers = uniqueUsers.size;

    // Group by action
    const activitiesByAction: Record<string, number> = {};
    activities.forEach((activity) => {
      activitiesByAction[activity.action] =
        (activitiesByAction[activity.action] || 0) + 1;
    });

    // Group by day
    const activitiesByDayMap = new Map<string, number>();
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      activitiesByDayMap.set(date, (activitiesByDayMap.get(date) || 0) + 1);
    });
    const activitiesByDay = Array.from(activitiesByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Top users by activity count
    const userActivityCounts = new Map<number, {
      user: any;
      count: number;
    }>();

    activities.forEach((activity) => {
      const existing = userActivityCounts.get(activity.userId);
      if (existing) {
        existing.count++;
      } else {
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

  /**
   * Clean up old activities (for maintenance)
   */
  async cleanupOldActivities(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.userActivity.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Get activity statistics for monitoring/dashboard
   */
  async getActivityStats(tenantId?: number): Promise<{
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    totalUsers: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const baseWhere = tenantId !== undefined ? { tenantId } : {};

    const [todayCount, yesterdayCount, weekCount, monthCount, totalUsers] =
      await Promise.all([
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
}