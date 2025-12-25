import { Role } from '@prisma/client';
export declare class UserQueryDto {
    search?: string;
    role?: Role;
    isActive?: boolean;
    tenantId?: number;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class BulkUserOperationDto {
    userIds: number[];
    operation: 'activate' | 'deactivate' | 'delete' | 'change_role';
    newRole?: Role;
}
export declare class UserInviteDto {
    email: string;
    role: Role;
    name?: string;
    customMessage?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
