import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, BulkUserOperationDto, UserInviteDto, ChangePasswordDto, ResetPasswordDto } from './dto/user-query.dto';
import { UserActivityQueryDto, UserActivityResponse, UserActivitySummary } from './dto/user-activity.dto';
import { User, Role, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate tenant assignment
    if (createUserDto.role !== Role.SUPER_ADMIN) {
      if (!createUserDto.tenantId) {
        throw new BadRequestException('Non-super-admin users must be assigned to a tenant');
      }

      // Verify tenant exists
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: createUserDto.tenantId, isActive: true },
      });

      if (!tenant) {
        throw new BadRequestException('Invalid or inactive tenant');
      }
    } else {
      // Super admins should not have a tenant
      if (createUserDto.tenantId) {
        throw new BadRequestException('Super admin users cannot be assigned to a tenant');
      }
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role,
        tenantId: createUserDto.tenantId || null,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(tenantId?: number): Promise<Omit<User, 'password'>[]> {
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

  async findAllWithQuery(queryDto: UserQueryDto, requestingUserTenantId?: number): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, role, isActive, tenantId, createdAfter, createdBefore, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    // Build where clause
    const whereClause: Prisma.UserWhereInput = {};

    // Apply tenant scoping
    if (requestingUserTenantId !== undefined) {
      whereClause.tenantId = requestingUserTenantId;
    } else if (tenantId !== undefined) {
      whereClause.tenantId = tenantId;
    }

    // Apply filters
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

    // Get total count
    const total = await this.prisma.user.count({ where: whereClause });

    // Get paginated results
    const skip = (page - 1) * limit;
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    orderBy[sortBy as keyof User] = sortOrder;

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

  async bulkOperation(bulkDto: BulkUserOperationDto, requestingUserTenantId?: number): Promise<{ success: number; failed: number; errors: string[] }> {
    const { userIds, operation, newRole } = bulkDto;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        // Check if user exists and belongs to the right tenant
        const whereClause: Prisma.UserWhereInput = { id: userId };
        if (requestingUserTenantId !== undefined) {
          whereClause.tenantId = requestingUserTenantId;
        }

        const user = await this.prisma.user.findFirst({ where: whereClause });
        if (!user) {
          errors.push(`User with ID ${userId} not found or not accessible`);
          failed++;
          continue;
        }

        // Perform the operation
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
              data: { isActive: false }, // Soft delete
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
      } catch (error) {
        errors.push(`Error updating user ${userId}: ${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  async getUserStatistics(tenantId?: number): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<Role, number>;
    recentlyCreated: number;
    lastLogin?: Date;
  }> {
    const whereClause = tenantId ? { tenantId } : {};

    // Get total counts
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

    // Users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCreated = await this.prisma.user.count({
      where: {
        ...whereClause,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Transform role statistics
    const roleStats: Record<Role, number> = {
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

  async inviteUser(inviteDto: UserInviteDto, inviterTenantId?: number): Promise<{ message: string; inviteToken: string }> {
    const { email, role, name, customMessage } = inviteDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // For now, we'll just return the token. In a real application, you would:
    // 1. Store the invitation in a database with expiration
    // 2. Send an email with the invitation link
    // 3. Handle the acceptance of the invitation

    // TODO: Implement invitation storage and email sending
    console.log(`Invitation sent to ${email} with token: ${inviteToken}`);
    console.log(`Custom message: ${customMessage || 'Welcome to our CMS!'}`);

    return {
      message: `Invitation sent to ${email}`,
      inviteToken,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto, requestingUserTenantId?: number): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find the user
    const whereClause: Prisma.UserWhereInput = { id: userId };
    if (requestingUserTenantId !== undefined) {
      whereClause.tenantId = requestingUserTenantId;
    }

    const user = await this.prisma.user.findFirst({ where: whereClause });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.authService.validatePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.authService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async generatePasswordResetToken(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });

    if (!user) {
      // Don't reveal whether the email exists or not for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    // TODO: Store reset token in database with expiration and send email
    console.log(`Password reset token generated for ${email}: ${resetToken}`);

    return {
      message: 'If the email exists, a password reset link has been sent',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // TODO: Validate reset token from database
    // For now, we'll simulate token validation
    console.log(`Reset token received: ${token}`);

    // Hash new password
    const hashedPassword = await this.authService.hashPassword(newPassword);

    // TODO: Update user password based on valid token
    // For now, we'll just return success message

    return { message: 'Password reset successfully' };
  }

  async getUserActivity(userId: number, requestingUserTenantId?: number): Promise<{
    lastLogin?: Date;
    loginCount: number;
    lastActivity?: Date;
    createdContent: number;
  }> {
    const whereClause: Prisma.UserWhereInput = { id: userId };
    if (requestingUserTenantId !== undefined) {
      whereClause.tenantId = requestingUserTenantId;
    }

    const user = await this.prisma.user.findFirst({ where: whereClause });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count blog posts created by this user
    const createdContent = await this.prisma.blogPost.count({
      where: { authorId: userId },
    });

    // TODO: Implement actual activity tracking
    // For now, return mock data
    return {
      lastLogin: undefined,
      loginCount: 0,
      lastActivity: user.updatedAt,
      createdContent,
    };
  }

  // User Activity Tracking Methods
  async logUserActivity(
    userId: number,
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // TODO: Create UserActivity table in Prisma schema
    // For now, just log to console
    console.log(`User Activity - User ${userId}: ${action}`, {
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  async getUserActivityLog(
    userId: number,
    queryDto: UserActivityQueryDto,
    requestingUserTenantId?: number,
  ): Promise<{
    activities: UserActivityResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Verify user exists and belongs to the right tenant
    const whereClause: Prisma.UserWhereInput = { id: userId };
    if (requestingUserTenantId !== undefined) {
      whereClause.tenantId = requestingUserTenantId;
    }

    const user = await this.prisma.user.findFirst({ where: whereClause });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 50, startDate, endDate } = queryDto;

    // TODO: Implement actual activity log retrieval
    // For now, return mock data
    const mockActivities: UserActivityResponse[] = [
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
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
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

  async getUserActivitySummary(
    userId: number,
    requestingUserTenantId?: number,
    days: number = 30,
  ): Promise<UserActivitySummary> {
    // Verify user exists and belongs to the right tenant
    const whereClause: Prisma.UserWhereInput = { id: userId };
    if (requestingUserTenantId !== undefined) {
      whereClause.tenantId = requestingUserTenantId;
    }

    const user = await this.prisma.user.findFirst({ where: whereClause });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Implement actual activity summary
    // For now, return mock data
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
      mostActiveHour: 14, // 2 PM
    };
  }

  async getAllUsersActivitySummary(tenantId?: number): Promise<{
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
  }> {
    // TODO: Implement actual global activity summary
    // For now, return mock data
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

  async findOne(id: number, tenantId?: number): Promise<Omit<User, 'password'>> {
    const whereClause: any = { id, isActive: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const user = await this.prisma.user.findUnique({
      where: whereClause,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto, tenantId?: number): Promise<Omit<User, 'password'>> {
    // First check if user exists and belongs to the right tenant
    await this.findOne(id, tenantId);

    // Check email uniqueness if email is being updated
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const whereClause: any = { id };
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

  async deactivate(id: number, tenantId?: number): Promise<{ message: string }> {
    // First check if user exists and belongs to the right tenant
    await this.findOne(id, tenantId);

    const whereClause: any = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    await this.prisma.user.update({
      where: whereClause,
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async findByTenant(tenantId: number): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(({ password, ...user }) => user);
  }
}