export declare class UserActivityQueryDto {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export interface UserActivityResponse {
    id: number;
    userId: number;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    user?: {
        id: number;
        email: string;
        name?: string;
    };
}
export interface UserActivitySummary {
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByDay: Array<{
        date: string;
        count: number;
    }>;
    lastActivity?: Date;
    mostActiveHour: number;
}
