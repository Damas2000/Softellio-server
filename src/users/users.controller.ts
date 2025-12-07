import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, BulkUserOperationDto, UserInviteDto, ChangePasswordDto, ResetPasswordDto } from './dto/user-query.dto';
import { UserActivityQueryDto } from './dto/user-activity.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(@CurrentUser() user: any, @CurrentTenant() tenantId: number) {
    // Super admins can see all users, tenant admins only their tenant's users
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.findAll(scopeTenantId);
  }

  @Get('advanced')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get users with advanced filtering, pagination and search' })
  @ApiResponse({ status: 200, description: 'Paginated list of users with total count' })
  findAllAdvanced(
    @Query() queryDto: UserQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.findAllWithQuery(queryDto, requestingUserTenantId);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get user statistics and analytics' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  getUserStatistics(@CurrentUser() user: any, @CurrentTenant() tenantId: number) {
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.getUserStatistics(scopeTenantId);
  }

  @Post('invite')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Invite a new user' })
  @ApiResponse({ status: 200, description: 'User invited successfully' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  inviteUser(
    @Body() inviteDto: UserInviteDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const inviterTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.inviteUser(inviteDto, inviterTenantId);
  }

  @Post('bulk-operation')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Perform bulk operations on users' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  bulkOperation(
    @Body() bulkDto: BulkUserOperationDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.bulkOperation(bulkDto, requestingUserTenantId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  requestPasswordReset(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.usersService.generatePasswordResetToken(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Super admins can see any user, tenant admins only their tenant's users
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.findOne(id, scopeTenantId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Super admins can update any user, tenant admins only their tenant's users
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.update(id, updateUserDto, scopeTenantId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Super admins can deactivate any user, tenant admins only their tenant's users
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.deactivate(id, scopeTenantId);
  }

  @Get(':id/activity')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get user activity and statistics' })
  @ApiResponse({ status: 200, description: 'User activity data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.getUserActivity(id, requestingUserTenantId);
  }

  @Post(':id/change-password')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'User not found' })
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    // Users can only change their own password, admins can change any user's password
    const isOwnPassword = user.id === id;
    const isAdmin = [Role.SUPER_ADMIN, Role.TENANT_ADMIN].includes(user.role);

    if (!isOwnPassword && !isAdmin) {
      throw new BadRequestException('You can only change your own password');
    }

    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.changePassword(id, changePasswordDto, requestingUserTenantId);
  }

  @Get(':id/activity-log')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get user activity log with pagination' })
  @ApiResponse({ status: 200, description: 'User activity log' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserActivityLog(
    @Param('id', ParseIntPipe) id: number,
    @Query() queryDto: UserActivityQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.getUserActivityLog(id, queryDto, requestingUserTenantId);
  }

  @Get(':id/activity-summary')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get user activity summary and statistics' })
  @ApiResponse({ status: 200, description: 'User activity summary' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserActivitySummary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.getUserActivitySummary(id, requestingUserTenantId);
  }

  @Get('activity/global-summary')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get global user activity summary for all users' })
  @ApiResponse({ status: 200, description: 'Global activity summary' })
  getGlobalActivitySummary(@CurrentUser() user: any, @CurrentTenant() tenantId: number) {
    const scopeTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.usersService.getAllUsersActivitySummary(scopeTenantId);
  }
}