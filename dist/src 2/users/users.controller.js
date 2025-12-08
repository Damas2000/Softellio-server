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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_query_dto_1 = require("./dto/user-query.dto");
const user_activity_dto_1 = require("./dto/user-activity.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll(user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.findAll(scopeTenantId);
    }
    findAllAdvanced(queryDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.findAllWithQuery(queryDto, requestingUserTenantId);
    }
    getUserStatistics(user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.getUserStatistics(scopeTenantId);
    }
    inviteUser(inviteDto, user, tenantId) {
        const inviterTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.inviteUser(inviteDto, inviterTenantId);
    }
    bulkOperation(bulkDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.bulkOperation(bulkDto, requestingUserTenantId);
    }
    requestPasswordReset(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email is required');
        }
        return this.usersService.generatePasswordResetToken(email);
    }
    resetPassword(resetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }
    findOne(id, user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.findOne(id, scopeTenantId);
    }
    update(id, updateUserDto, user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.update(id, updateUserDto, scopeTenantId);
    }
    deactivate(id, user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.deactivate(id, scopeTenantId);
    }
    getUserActivity(id, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.getUserActivity(id, requestingUserTenantId);
    }
    changePassword(id, changePasswordDto, user, tenantId) {
        const isOwnPassword = user.id === id;
        const isAdmin = [client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN].includes(user.role);
        if (!isOwnPassword && !isAdmin) {
            throw new common_1.BadRequestException('You can only change your own password');
        }
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.changePassword(id, changePasswordDto, requestingUserTenantId);
    }
    getUserActivityLog(id, queryDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.getUserActivityLog(id, queryDto, requestingUserTenantId);
    }
    getUserActivitySummary(id, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.getUserActivitySummary(id, requestingUserTenantId);
    }
    getGlobalActivitySummary(user, tenantId) {
        const scopeTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.usersService.getAllUsersActivitySummary(scopeTenantId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User with email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of users' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('advanced'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with advanced filtering, pagination and search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of users with total count' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_query_dto_1.UserQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAllAdvanced", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics and analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserStatistics", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User invited successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User with email already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_query_dto_1.UserInviteDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "inviteUser", null);
__decorate([
    (0, common_1.Post)('bulk-operation'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk operations on users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk operation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_query_dto_1.BulkUserOperationDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "bulkOperation", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent if user exists' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_query_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(3, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Get)(':id/activity'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Post)(':id/change-password'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Current password is incorrect' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(3, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_query_dto_1.ChangePasswordDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)(':id/activity-log'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity log with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity log' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(3, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_activity_dto_1.UserActivityQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserActivityLog", null);
__decorate([
    (0, common_1.Get)(':id/activity-summary'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity summary and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity summary' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserActivitySummary", null);
__decorate([
    (0, common_1.Get)('activity/global-summary'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get global user activity summary for all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global activity summary' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getGlobalActivitySummary", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map