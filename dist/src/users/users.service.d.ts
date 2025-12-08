import { PrismaService } from '../config/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, BulkUserOperationDto, UserInviteDto, ChangePasswordDto, ResetPasswordDto } from './dto/user-query.dto';
import { UserActivityQueryDto, UserActivityResponse, UserActivitySummary } from './dto/user-activity.dto';
import { User, Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    private authService;
    constructor(prisma: PrismaService, authService: AuthService);
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findAll(tenantId?: number): Promise<Omit<User, 'password'>[]>;
    findAllWithQuery(queryDto: UserQueryDto, requestingUserTenantId?: number): Promise<{
        users: Omit<User, 'password'>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    bulkOperation(bulkDto: BulkUserOperationDto, requestingUserTenantId?: number): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    getUserStatistics(tenantId?: number): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        usersByRole: Record<Role, number>;
        recentlyCreated: number;
        lastLogin?: Date;
    }>;
    inviteUser(inviteDto: UserInviteDto, inviterTenantId?: number): Promise<{
        message: string;
        inviteToken: string;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto, requestingUserTenantId?: number): Promise<{
        message: string;
    }>;
    generatePasswordResetToken(email: string): Promise<{
        message: string;
        resetToken?: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getUserActivity(userId: number, requestingUserTenantId?: number): Promise<{
        lastLogin?: Date;
        loginCount: number;
        lastActivity?: Date;
        createdContent: number;
    }>;
    logUserActivity(userId: number, action: string, details?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    getUserActivityLog(userId: number, queryDto: UserActivityQueryDto, requestingUserTenantId?: number): Promise<{
        activities: UserActivityResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserActivitySummary(userId: number, requestingUserTenantId?: number, days?: number): Promise<UserActivitySummary>;
    getAllUsersActivitySummary(tenantId?: number): Promise<{
        totalActivities: number;
        activeUsersToday: number;
        activeUsersThisWeek: number;
        mostActiveUsers: Array<{
            userId: number;
            userName?: string;
            email: string;
            activityCount: number;
        }>;
        activityTrends: Array<{
            date: string;
            totalActivities: number;
            uniqueUsers: number;
        }>;
    }>;
    findOne(id: number, tenantId?: number): Promise<Omit<User, 'password'>>;
    update(id: number, updateUserDto: UpdateUserDto, tenantId?: number): Promise<Omit<User, 'password'>>;
    deactivate(id: number, tenantId?: number): Promise<{
        message: string;
    }>;
    findByTenant(tenantId: number): Promise<Omit<User, 'password'>[]>;
}
