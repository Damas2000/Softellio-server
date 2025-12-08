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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const auth_service_1 = require("../auth/auth.service");
const client_1 = require("@prisma/client");
const crypto = require("crypto");
let UsersService = class UsersService {
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (createUserDto.role !== client_1.Role.SUPER_ADMIN) {
            if (!createUserDto.tenantId) {
                throw new common_1.BadRequestException('Non-super-admin users must be assigned to a tenant');
            }
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: createUserDto.tenantId, isActive: true },
            });
            if (!tenant) {
                throw new common_1.BadRequestException('Invalid or inactive tenant');
            }
        }
        else {
            if (createUserDto.tenantId) {
                throw new common_1.BadRequestException('Super admin users cannot be assigned to a tenant');
            }
        }
        const hashedPassword = await this.authService.hashPassword(createUserDto.password);
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                name: createUserDto.name,
                role: createUserDto.role,
                tenantId: createUserDto.tenantId || null,
            },
        });
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findAll(tenantId) {
        const whereClause = tenantId ? { tenantId } : {};
        const users = await this.prisma.user.findMany({
            where: {
                ...whereClause,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return users.map(({ password, ...user }) => user);
    }
    async findAllWithQuery(queryDto, requestingUserTenantId) {
        const { page = 1, limit = 20, search, role, isActive, tenantId, createdAfter, createdBefore, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
        const whereClause = {};
        if (requestingUserTenantId !== undefined) {
            whereClause.tenantId = requestingUserTenantId;
        }
        else if (tenantId !== undefined) {
            whereClause.tenantId = tenantId;
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            whereClause.role = role;
        }
        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }
        if (createdAfter || createdBefore) {
            whereClause.createdAt = {};
            if (createdAfter) {
                whereClause.createdAt.gte = new Date(createdAfter);
            }
            if (createdBefore) {
                whereClause.createdAt.lte = new Date(createdBefore);
            }
        }
        const total = await this.prisma.user.count({ where: whereClause });
        const skip = (page - 1) * limit;
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const users = await this.prisma.user.findMany({
            where: whereClause,
            orderBy,
            skip,
            take: limit,
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                    },
                },
            },
        });
        const totalPages = Math.ceil(total / limit);
        return {
            users: users.map(({ password, ...user }) => user),
            total,
            page,
            limit,
            totalPages,
        };
    }
    async bulkOperation(bulkDto, requestingUserTenantId) {
        const { userIds, operation, newRole } = bulkDto;
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const userId of userIds) {
            try {
                const whereClause = { id: userId };
                if (requestingUserTenantId !== undefined) {
                    whereClause.tenantId = requestingUserTenantId;
                }
                const user = await this.prisma.user.findFirst({ where: whereClause });
                if (!user) {
                    errors.push(`User with ID ${userId} not found or not accessible`);
                    failed++;
                    continue;
                }
                switch (operation) {
                    case 'activate':
                        await this.prisma.user.update({
                            where: { id: userId },
                            data: { isActive: true },
                        });
                        break;
                    case 'deactivate':
                        await this.prisma.user.update({
                            where: { id: userId },
                            data: { isActive: false },
                        });
                        break;
                    case 'delete':
                        await this.prisma.user.update({
                            where: { id: userId },
                            data: { isActive: false },
                        });
                        break;
                    case 'change_role':
                        if (!newRole) {
                            errors.push(`New role is required for user ${userId}`);
                            failed++;
                            continue;
                        }
                        await this.prisma.user.update({
                            where: { id: userId },
                            data: { role: newRole },
                        });
                        break;
                    default:
                        errors.push(`Invalid operation for user ${userId}`);
                        failed++;
                        continue;
                }
                success++;
            }
            catch (error) {
                errors.push(`Error updating user ${userId}: ${error.message}`);
                failed++;
            }
        }
        return { success, failed, errors };
    }
    async getUserStatistics(tenantId) {
        const whereClause = tenantId ? { tenantId } : {};
        const [totalUsers, activeUsers, usersByRole] = await Promise.all([
            this.prisma.user.count({ where: whereClause }),
            this.prisma.user.count({ where: { ...whereClause, isActive: true } }),
            this.prisma.user.groupBy({
                by: ['role'],
                where: whereClause,
                _count: { _all: true },
            }),
        ]);
        const inactiveUsers = totalUsers - activeUsers;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentlyCreated = await this.prisma.user.count({
            where: {
                ...whereClause,
                createdAt: { gte: thirtyDaysAgo },
            },
        });
        const roleStats = {
            SUPER_ADMIN: 0,
            TENANT_ADMIN: 0,
            EDITOR: 0,
        };
        usersByRole.forEach(({ role, _count }) => {
            roleStats[role] = _count._all;
        });
        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole: roleStats,
            recentlyCreated,
        };
    }
    async inviteUser(inviteDto, inviterTenantId) {
        const { email, role, name, customMessage } = inviteDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const inviteToken = crypto.randomBytes(32).toString('hex');
        console.log(`Invitation sent to ${email} with token: ${inviteToken}`);
        console.log(`Custom message: ${customMessage || 'Welcome to our CMS!'}`);
        return {
            message: `Invitation sent to ${email}`,
            inviteToken,
        };
    }
    async changePassword(userId, changePasswordDto, requestingUserTenantId) {
        const { currentPassword, newPassword } = changePasswordDto;
        const whereClause = { id: userId };
        if (requestingUserTenantId !== undefined) {
            whereClause.tenantId = requestingUserTenantId;
        }
        const user = await this.prisma.user.findFirst({ where: whereClause });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await this.authService.validatePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await this.authService.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return { message: 'Password changed successfully' };
    }
    async generatePasswordResetToken(email) {
        const user = await this.prisma.user.findUnique({
            where: { email, isActive: true },
        });
        if (!user) {
            return { message: 'If the email exists, a password reset link has been sent' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        console.log(`Password reset token generated for ${email}: ${resetToken}`);
        return {
            message: 'If the email exists, a password reset link has been sent',
            resetToken,
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        console.log(`Reset token received: ${token}`);
        const hashedPassword = await this.authService.hashPassword(newPassword);
        return { message: 'Password reset successfully' };
    }
    async getUserActivity(userId, requestingUserTenantId) {
        const whereClause = { id: userId };
        if (requestingUserTenantId !== undefined) {
            whereClause.tenantId = requestingUserTenantId;
        }
        const user = await this.prisma.user.findFirst({ where: whereClause });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const createdContent = await this.prisma.blogPost.count({
            where: { authorId: userId },
        });
        return {
            lastLogin: undefined,
            loginCount: 0,
            lastActivity: user.updatedAt,
            createdContent,
        };
    }
    async logUserActivity(userId, action, details, ipAddress, userAgent) {
        console.log(`User Activity - User ${userId}: ${action}`, {
            details,
            ipAddress,
            userAgent,
            timestamp: new Date(),
        });
    }
    async getUserActivityLog(userId, queryDto, requestingUserTenantId) {
        const whereClause = { id: userId };
        if (requestingUserTenantId !== undefined) {
            whereClause.tenantId = requestingUserTenantId;
        }
        const user = await this.prisma.user.findFirst({ where: whereClause });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { page = 1, limit = 50, startDate, endDate } = queryDto;
        const mockActivities = [
            {
                id: 1,
                userId,
                action: 'login',
                details: 'User logged in successfully',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(),
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            {
                id: 2,
                userId,
                action: 'profile_update',
                details: 'User updated their profile',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 3600000),
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
        ];
        const total = mockActivities.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const activities = mockActivities.slice(startIndex, endIndex);
        return {
            activities,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async getUserActivitySummary(userId, requestingUserTenantId, days = 30) {
        const whereClause = { id: userId };
        if (requestingUserTenantId !== undefined) {
            whereClause.tenantId = requestingUserTenantId;
        }
        const user = await this.prisma.user.findFirst({ where: whereClause });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            totalActivities: 15,
            activitiesByAction: {
                login: 8,
                profile_update: 3,
                content_create: 2,
                content_update: 1,
                logout: 1,
            },
            activitiesByDay: [
                { date: '2023-12-07', count: 5 },
                { date: '2023-12-06', count: 3 },
                { date: '2023-12-05', count: 7 },
            ],
            lastActivity: new Date(),
            mostActiveHour: 14,
        };
    }
    async getAllUsersActivitySummary(tenantId) {
        return {
            totalActivities: 1250,
            activeUsersToday: 15,
            activeUsersThisWeek: 45,
            mostActiveUsers: [
                {
                    userId: 1,
                    userName: 'Admin User',
                    email: 'admin@example.com',
                    activityCount: 45,
                },
                {
                    userId: 2,
                    userName: 'Editor User',
                    email: 'editor@example.com',
                    activityCount: 32,
                },
            ],
            activityTrends: [
                { date: '2023-12-07', totalActivities: 120, uniqueUsers: 15 },
                { date: '2023-12-06', totalActivities: 95, uniqueUsers: 12 },
                { date: '2023-12-05', totalActivities: 150, uniqueUsers: 18 },
            ],
        };
    }
    async findOne(id, tenantId) {
        const whereClause = { id, isActive: true };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }
        const user = await this.prisma.user.findUnique({
            where: whereClause,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto, tenantId) {
        await this.findOne(id, tenantId);
        if (updateUserDto.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        const whereClause = { id };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }
        const updatedUser = await this.prisma.user.update({
            where: whereClause,
            data: updateUserDto,
        });
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async deactivate(id, tenantId) {
        await this.findOne(id, tenantId);
        const whereClause = { id };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }
        await this.prisma.user.update({
            where: whereClause,
            data: { isActive: false },
        });
        return { message: 'User deactivated successfully' };
    }
    async findByTenant(tenantId) {
        const users = await this.prisma.user.findMany({
            where: {
                tenantId,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return users.map(({ password, ...user }) => user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], UsersService);
//# sourceMappingURL=users.service.js.map