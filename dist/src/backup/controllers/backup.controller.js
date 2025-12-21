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
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const backup_service_1 = require("../services/backup.service");
const backup_scheduler_service_1 = require("../services/backup-scheduler.service");
const system_update_service_1 = require("../services/system-update.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../../common/decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
const create_backup_dto_1 = require("../dto/create-backup.dto");
const restore_backup_dto_1 = require("../dto/restore-backup.dto");
const backup_schedule_dto_1 = require("../dto/backup-schedule.dto");
const system_update_dto_1 = require("../dto/system-update.dto");
let BackupController = class BackupController {
    constructor(backupService, schedulerService, updateService) {
        this.backupService = backupService;
        this.schedulerService = schedulerService;
        this.updateService = updateService;
    }
    async createDatabaseBackup(tenantId, createBackupDto) {
        return this.backupService.createDatabaseBackup(tenantId, createBackupDto);
    }
    async getDatabaseBackups(tenantId, status, limit, offset) {
        return { message: 'Database backups endpoint - implementation needed' };
    }
    async getDatabaseBackup(tenantId, backupId) {
        return { message: `Database backup ${backupId} details - implementation needed` };
    }
    async getDatabaseBackupProgress(backupId) {
        const progress = this.backupService.getBackupProgress(backupId);
        if (!progress) {
            throw new common_1.BadRequestException('Backup not found or not in progress');
        }
        return progress;
    }
    async deleteDatabaseBackup(tenantId, backupId) {
    }
    async createSystemBackup(tenantId, createBackupDto) {
        return this.backupService.createSystemBackup(tenantId, createBackupDto);
    }
    async getSystemBackups(tenantId, status, limit, offset) {
        return { message: 'System backups endpoint - implementation needed' };
    }
    async getSystemBackup(tenantId, backupId) {
        return { message: `System backup ${backupId} details - implementation needed` };
    }
    async getSystemBackupProgress(backupId) {
        const progress = this.backupService.getBackupProgress(backupId);
        if (!progress) {
            throw new common_1.BadRequestException('Backup not found or not in progress');
        }
        return progress;
    }
    async deleteSystemBackup(tenantId, backupId) {
    }
    async createRestoreOperation(tenantId, createRestoreDto) {
        return this.backupService.createRestoreOperation(tenantId, createRestoreDto);
    }
    async getRestoreOperations(tenantId, status, limit, offset) {
        return { message: 'Restore operations endpoint - implementation needed' };
    }
    async getRestoreOperation(tenantId, restoreId) {
        return { message: `Restore operation ${restoreId} details - implementation needed` };
    }
    async getRestoreProgress(restoreId) {
        const progress = this.backupService.getRestoreProgress(restoreId);
        if (!progress) {
            throw new common_1.BadRequestException('Restore operation not found or not in progress');
        }
        return progress;
    }
    async cancelRestoreOperation(tenantId, restoreId) {
        return { message: `Cancel restore operation ${restoreId} - implementation needed` };
    }
    async createBackupSchedule(tenantId, createScheduleDto) {
        return this.schedulerService.createBackupSchedule(tenantId, createScheduleDto);
    }
    async getBackupSchedules(tenantId) {
        return this.schedulerService.getBackupSchedules(tenantId);
    }
    async getBackupSchedule(tenantId, scheduleId) {
        return { message: `Backup schedule ${scheduleId} details - implementation needed` };
    }
    async updateBackupSchedule(tenantId, scheduleId, updateScheduleDto) {
        return this.schedulerService.updateBackupSchedule(scheduleId, updateScheduleDto);
    }
    async toggleBackupSchedule(tenantId, scheduleId, enabled) {
        return this.schedulerService.toggleSchedule(scheduleId, enabled);
    }
    async deleteBackupSchedule(tenantId, scheduleId) {
        await this.schedulerService.deleteBackupSchedule(scheduleId);
    }
    async createSystemUpdate(tenantId, createUpdateDto) {
        return this.updateService.createSystemUpdate(tenantId, createUpdateDto);
    }
    async getSystemUpdates(tenantId, status) {
        return this.updateService.getSystemUpdates(tenantId);
    }
    async getSystemUpdate(updateId) {
        return this.updateService.getSystemUpdate(updateId);
    }
    async getSystemUpdateProgress(updateId) {
        const progress = this.updateService.getUpdateProgress(updateId);
        if (!progress) {
            throw new common_1.BadRequestException('Update not found or not in progress');
        }
        return progress;
    }
    async updateSystemUpdate(updateId, updateUpdateDto) {
        return this.updateService.updateSystemUpdate(updateId, updateUpdateDto);
    }
    async rollbackSystemUpdate(updateId) {
        return this.updateService.rollbackSystemUpdate(updateId);
    }
    async getBackupDashboard(tenantId) {
        return {
            message: 'Backup dashboard endpoint - implementation needed',
            data: {
                totalBackups: 0,
                successfulBackups: 0,
                failedBackups: 0,
                totalStorageUsed: 0,
                lastBackupDate: null,
                nextScheduledBackup: null,
                runningOperations: [],
                recentBackups: [],
                schedules: [],
                systemUpdates: [],
            }
        };
    }
    async getBackupStatistics(tenantId, period, startDate, endDate) {
        return { message: 'Backup statistics endpoint - implementation needed' };
    }
    async getBackupSystemHealth(tenantId) {
        return {
            status: 'healthy',
            services: {
                backupService: 'healthy',
                scheduler: 'healthy',
                storage: 'healthy',
                database: 'healthy',
            },
            metrics: {
                runningBackups: this.backupService['runningBackups'].size,
                runningUpdates: this.updateService.getRunningUpdates().length,
                scheduledJobs: this.schedulerService['scheduledJobs'].size,
                diskSpace: {
                    total: 0,
                    used: 0,
                    free: 0,
                }
            },
            lastCheck: new Date(),
        };
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Post)('database'),
    (0, swagger_1.ApiOperation)({ summary: 'Create database backup' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Database backup creation initiated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_backup_dto_1.CreateDatabaseBackupDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createDatabaseBackup", null);
__decorate([
    (0, common_1.Get)('database'),
    (0, swagger_1.ApiOperation)({ summary: 'List database backups' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'running', 'completed', 'failed'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Database backups retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getDatabaseBackups", null);
__decorate([
    (0, common_1.Get)('database/:backupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get database backup details' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'Database backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Database backup details retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getDatabaseBackup", null);
__decorate([
    (0, common_1.Get)('database/:backupId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get database backup progress' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'Database backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup progress retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getDatabaseBackupProgress", null);
__decorate([
    (0, common_1.Delete)('database/:backupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete database backup' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'Database backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Database backup deleted successfully',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteDatabaseBackup", null);
__decorate([
    (0, common_1.Post)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Create system backup' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'System backup creation initiated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_backup_dto_1.CreateSystemBackupDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createSystemBackup", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'List system backups' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'running', 'completed', 'failed'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System backups retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemBackups", null);
__decorate([
    (0, common_1.Get)('system/:backupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system backup details' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'System backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System backup details retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemBackup", null);
__decorate([
    (0, common_1.Get)('system/:backupId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system backup progress' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'System backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup progress retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemBackupProgress", null);
__decorate([
    (0, common_1.Delete)('system/:backupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete system backup' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'System backup ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'System backup deleted successfully',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteSystemBackup", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Create restore operation' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Restore operation initiated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, restore_backup_dto_1.CreateRestoreOperationDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createRestoreOperation", null);
__decorate([
    (0, common_1.Get)('restore'),
    (0, swagger_1.ApiOperation)({ summary: 'List restore operations' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Restore operations retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getRestoreOperations", null);
__decorate([
    (0, common_1.Get)('restore/:restoreId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get restore operation details' }),
    (0, swagger_1.ApiParam)({ name: 'restoreId', description: 'Restore operation ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Restore operation details retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('restoreId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getRestoreOperation", null);
__decorate([
    (0, common_1.Get)('restore/:restoreId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get restore operation progress' }),
    (0, swagger_1.ApiParam)({ name: 'restoreId', description: 'Restore operation ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Restore progress retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('restoreId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getRestoreProgress", null);
__decorate([
    (0, common_1.Post)('restore/:restoreId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel restore operation' }),
    (0, swagger_1.ApiParam)({ name: 'restoreId', description: 'Restore operation ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Restore operation cancelled successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('restoreId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "cancelRestoreOperation", null);
__decorate([
    (0, common_1.Post)('schedules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create backup schedule' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Backup schedule created successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, backup_schedule_dto_1.CreateBackupScheduleDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createBackupSchedule", null);
__decorate([
    (0, common_1.Get)('schedules'),
    (0, swagger_1.ApiOperation)({ summary: 'List backup schedules' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup schedules retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupSchedules", null);
__decorate([
    (0, common_1.Get)('schedules/:scheduleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup schedule details' }),
    (0, swagger_1.ApiParam)({ name: 'scheduleId', description: 'Backup schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup schedule details retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupSchedule", null);
__decorate([
    (0, common_1.Patch)('schedules/:scheduleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update backup schedule' }),
    (0, swagger_1.ApiParam)({ name: 'scheduleId', description: 'Backup schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup schedule updated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, backup_schedule_dto_1.UpdateBackupScheduleDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "updateBackupSchedule", null);
__decorate([
    (0, common_1.Post)('schedules/:scheduleId/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable or disable backup schedule' }),
    (0, swagger_1.ApiParam)({ name: 'scheduleId', description: 'Backup schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup schedule toggled successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __param(2, (0, common_1.Body)('enabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Boolean]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "toggleBackupSchedule", null);
__decorate([
    (0, common_1.Delete)('schedules/:scheduleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete backup schedule' }),
    (0, swagger_1.ApiParam)({ name: 'scheduleId', description: 'Backup schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Backup schedule deleted successfully',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteBackupSchedule", null);
__decorate([
    (0, common_1.Post)('updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create system update' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'System update created successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, system_update_dto_1.CreateSystemUpdateDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createSystemUpdate", null);
__decorate([
    (0, common_1.Get)('updates'),
    (0, swagger_1.ApiOperation)({ summary: 'List system updates' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'downloading', 'applying', 'completed', 'failed', 'rolled_back'] }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System updates retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemUpdates", null);
__decorate([
    (0, common_1.Get)('updates/:updateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system update details' }),
    (0, swagger_1.ApiParam)({ name: 'updateId', description: 'System update ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System update details retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('updateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemUpdate", null);
__decorate([
    (0, common_1.Get)('updates/:updateId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system update progress' }),
    (0, swagger_1.ApiParam)({ name: 'updateId', description: 'System update ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Update progress retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)('updateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getSystemUpdateProgress", null);
__decorate([
    (0, common_1.Patch)('updates/:updateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update system update' }),
    (0, swagger_1.ApiParam)({ name: 'updateId', description: 'System update ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System update updated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('updateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, system_update_dto_1.UpdateSystemUpdateDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "updateSystemUpdate", null);
__decorate([
    (0, common_1.Post)('updates/:updateId/rollback'),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback system update' }),
    (0, swagger_1.ApiParam)({ name: 'updateId', description: 'System update ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'System update rollback initiated successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('updateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "rollbackSystemUpdate", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup dashboard data' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup dashboard data retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupDashboard", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup statistics retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupStatistics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup system health status' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Backup system health status retrieved successfully',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupSystemHealth", null);
exports.BackupController = BackupController = __decorate([
    (0, swagger_1.ApiTags)('Backup & Update Management'),
    (0, common_1.Controller)('backup'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [backup_service_1.BackupService,
        backup_scheduler_service_1.BackupSchedulerService,
        system_update_service_1.SystemUpdateService])
], BackupController);
//# sourceMappingURL=backup.controller.js.map