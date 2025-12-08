import { Role } from '@prisma/client';
export declare class UserResponseDto {
    id: number;
    email: string;
    name?: string;
    role: Role;
    tenantId?: number;
    isActive: boolean;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: UserResponseDto;
}
export declare class RefreshResponseDto {
    accessToken: string;
}
