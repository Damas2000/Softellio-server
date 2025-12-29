import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, BulkUserOperationDto, UserInviteDto, ChangePasswordDto, ResetPasswordDto } from './dto/user-query.dto';
import { UserActivityQueryDto } from './dto/user-activity.dto';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<Omit<{
        name: string | null;
        id: number;
        tenantId: number | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        password: string;
        isActive: boolean;
        updatedAt: Date;
    }, "password">>;
    findAll(user: any, tenantId: number): Promise<Omit<{
        name: string | null;
        id: number;
        tenantId: number | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        password: string;
        isActive: boolean;
        updatedAt: Date;
    }, "password">[]>;
    findAllAdvanced(queryDto: UserQueryDto, user: any, tenantId: number): Promise<{
        users: Omit<import(".prisma/client").User, "password">[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserStatistics(user: any, tenantId: number): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        usersByRole: Record<Role, number>;
        recentlyCreated: number;
        lastLogin?: Date;
    }>;
    inviteUser(inviteDto: UserInviteDto, user: any, tenantId: number): Promise<{
        message: string;
        inviteToken: string;
    }>;
    bulkOperation(bulkDto: BulkUserOperationDto, user: any, tenantId: number): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
        resetToken?: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    findOne(id: number, user: any, tenantId: number): Promise<Omit<{
        name: string | null;
        id: number;
        tenantId: number | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        password: string;
        isActive: boolean;
        updatedAt: Date;
    }, "password">>;
    update(id: number, updateUserDto: UpdateUserDto, user: any, tenantId: number): Promise<Omit<{
        name: string | null;
        id: number;
        tenantId: number | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        password: string;
        isActive: boolean;
        updatedAt: Date;
    }, "password">>;
    deactivate(id: number, user: any, tenantId: number): Promise<{
        message: string;
    }>;
    getUserActivity(id: number, user: any, tenantId: number): Promise<{
        lastLogin?: Date;
        loginCount: number;
        lastActivity?: Date;
        createdContent: number;
    }>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto, user: any, tenantId: number): Promise<{
        message: string;
    }>;
    getUserActivityLog(id: number, queryDto: UserActivityQueryDto, user: any, tenantId: number): Promise<{
        activities: import("./dto/user-activity.dto").UserActivityResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserActivitySummary(id: number, user: any, tenantId: number): Promise<import("./dto/user-activity.dto").UserActivitySummary>;
    getGlobalActivitySummary(user: any, tenantId: number): Promise<{
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
}
