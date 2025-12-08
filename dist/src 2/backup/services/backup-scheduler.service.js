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
var BackupSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
const cron = require("node-cron");
let BackupSchedulerService = BackupSchedulerService_1 = class BackupSchedulerService {
    constructor(prisma, backupService) {
        this.prisma = prisma;
        this.backupService = backupService;
        this.logger = new common_1.Logger(BackupSchedulerService_1.name);
        this.scheduledJobs = new Map();
        this.initializeSchedules();
    }
    async createBackupSchedule(tenantId, createScheduleDto) {
        this.logger.log(`Creating backup schedule: ${createScheduleDto.name} for tenant: ${tenantId}`);
        if (!cron.validate(createScheduleDto.cronExpression)) {
            throw new Error('Invalid cron expression');
        }
        const nextRunAt = this.getNextRunTime(createScheduleDto.cronExpression, createScheduleDto.timezone);
        const schedule = await this.prisma.backupSchedule.create({
            data: {
                tenantId,
                name: createScheduleDto.name,
                description: createScheduleDto.description,
                scheduleType: createScheduleDto.scheduleType,
                backupType: createScheduleDto.backupType,
                cronExpression: createScheduleDto.cronExpression,
                timezone: createScheduleDto.timezone || 'UTC',
                isEnabled: createScheduleDto.isEnabled ?? true,
                retentionDays: createScheduleDto.retentionDays || 30,
                compressionType: createScheduleDto.compressionType || 'gzip',
                maxBackups: createScheduleDto.maxBackups || 10,
                notifyOnSuccess: createScheduleDto.notifyOnSuccess || false,
                notifyOnFailure: createScheduleDto.notifyOnFailure || true,
                recipients: createScheduleDto.recipients || [],
                maxDuration: createScheduleDto.maxDuration,
                maxSize: createScheduleDto.maxSize,
                tags: createScheduleDto.tags || [],
                nextRunAt,
            },
        });
        if (schedule.isEnabled) {
            this.registerSchedule(schedule);
        }
        return schedule;
    }
    async updateBackupSchedule(scheduleId, updateScheduleDto) {
        this.logger.log(`Updating backup schedule: ${scheduleId}`);
        const existingSchedule = await this.prisma.backupSchedule.findUnique({
            where: { id: scheduleId },
        });
        if (!existingSchedule) {
            throw new Error('Backup schedule not found');
        }
        if (updateScheduleDto.cronExpression && !cron.validate(updateScheduleDto.cronExpression)) {
            throw new Error('Invalid cron expression');
        }
        const cronExpression = updateScheduleDto.cronExpression || existingSchedule.cronExpression;
        const timezone = updateScheduleDto.timezone || existingSchedule.timezone;
        const nextRunAt = this.getNextRunTime(cronExpression, timezone);
        const updatedSchedule = await this.prisma.backupSchedule.update({
            where: { id: scheduleId },
            data: {
                ...updateScheduleDto,
                nextRunAt,
                updatedAt: new Date(),
            },
        });
        this.unregisterSchedule(scheduleId);
        if (updatedSchedule.isEnabled) {
            this.registerSchedule(updatedSchedule);
        }
        return updatedSchedule;
    }
    async deleteBackupSchedule(scheduleId) {
        this.logger.log(`Deleting backup schedule: ${scheduleId}`);
        this.unregisterSchedule(scheduleId);
        await this.prisma.backupSchedule.delete({
            where: { id: scheduleId },
        });
    }
    async getBackupSchedules(tenantId) {
        return this.prisma.backupSchedule.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async toggleSchedule(scheduleId, enabled) {
        const schedule = await this.prisma.backupSchedule.update({
            where: { id: scheduleId },
            data: { isEnabled: enabled },
        });
        if (enabled) {
            this.registerSchedule(schedule);
        }
        else {
            this.unregisterSchedule(scheduleId);
        }
        return schedule;
    }
    async initializeSchedules() {
        this.logger.log('Initializing backup schedules...');
        try {
            const enabledSchedules = await this.prisma.backupSchedule.findMany({
                where: { isEnabled: true },
            });
            for (const schedule of enabledSchedules) {
                this.registerSchedule(schedule);
            }
            this.logger.log(`Initialized ${enabledSchedules.length} backup schedules`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize schedules: ${error.message}`, error.stack);
        }
    }
    registerSchedule(schedule) {
        try {
            const job = cron.schedule(schedule.cronExpression, () => {
                this.executeScheduledBackup(schedule).catch(error => {
                    this.logger.error(`Scheduled backup failed: ${error.message}`, error.stack);
                });
            }, {
                timezone: schedule.timezone,
            });
            job.start();
            this.scheduledJobs.set(schedule.id, job);
            this.logger.log(`Registered backup schedule: ${schedule.name} (${schedule.cronExpression})`);
        }
        catch (error) {
            this.logger.error(`Failed to register schedule ${schedule.id}: ${error.message}`, error.stack);
        }
    }
    unregisterSchedule(scheduleId) {
        const job = this.scheduledJobs.get(scheduleId);
        if (job) {
            job.stop();
            job.destroy();
            this.scheduledJobs.delete(scheduleId);
            this.logger.log(`Unregistered backup schedule: ${scheduleId}`);
        }
    }
    async executeScheduledBackup(schedule) {
        this.logger.log(`Executing scheduled backup: ${schedule.name}`);
        const startTime = Date.now();
        try {
            await this.prisma.backupSchedule.update({
                where: { id: schedule.id },
                data: {
                    lastRunAt: new Date(),
                    nextRunAt: this.getNextRunTime(schedule.cronExpression, schedule.timezone),
                },
            });
            let backupPromise;
            if (schedule.scheduleType === 'database') {
                backupPromise = this.backupService.createDatabaseBackup(schedule.tenantId, {
                    name: `Scheduled ${schedule.name} - ${new Date().toISOString()}`,
                    description: `Automatically generated backup from schedule: ${schedule.name}`,
                    backupType: schedule.backupType,
                    compressionType: schedule.compressionType,
                    retentionDays: schedule.retentionDays,
                    tags: [...(schedule.tags || []), 'scheduled', schedule.scheduleType],
                    isAutomatic: true,
                });
            }
            else {
                backupPromise = this.backupService.createSystemBackup(schedule.tenantId, {
                    name: `Scheduled ${schedule.name} - ${new Date().toISOString()}`,
                    description: `Automatically generated backup from schedule: ${schedule.name}`,
                    backupType: schedule.backupType,
                    retentionDays: schedule.retentionDays,
                    tags: [...(schedule.tags || []), 'scheduled', schedule.scheduleType],
                    isAutomatic: true,
                });
            }
            const backup = await backupPromise;
            await this.waitForBackupCompletion(backup.id, schedule.maxDuration);
            await this.prisma.backupSchedule.update({
                where: { id: schedule.id },
                data: {
                    lastStatus: 'success',
                    consecutiveFailures: 0,
                },
            });
            await this.cleanupOldScheduledBackups(schedule);
            if (schedule.notifyOnSuccess) {
                await this.sendNotification(schedule, 'success', {
                    backupId: backup.id,
                    duration: Date.now() - startTime,
                });
            }
            this.logger.log(`Scheduled backup completed: ${schedule.name}`);
        }
        catch (error) {
            this.logger.error(`Scheduled backup failed: ${schedule.name} - ${error.message}`, error.stack);
            const updatedSchedule = await this.prisma.backupSchedule.update({
                where: { id: schedule.id },
                data: {
                    lastStatus: 'failed',
                    consecutiveFailures: { increment: 1 },
                },
            });
            if (schedule.notifyOnFailure) {
                await this.sendNotification(schedule, 'failed', {
                    error: error.message,
                    consecutiveFailures: updatedSchedule.consecutiveFailures,
                });
            }
            if (updatedSchedule.consecutiveFailures >= 5) {
                this.logger.warn(`Disabling schedule ${schedule.name} due to consecutive failures`);
                await this.toggleSchedule(schedule.id, false);
            }
        }
    }
    async waitForBackupCompletion(backupId, maxDuration) {
        const timeout = maxDuration ? maxDuration * 1000 : 30 * 60 * 1000;
        const startTime = Date.now();
        const pollInterval = 5000;
        while (Date.now() - startTime < timeout) {
            const progress = this.backupService.getBackupProgress(backupId);
            if (!progress) {
                const databaseBackup = await this.prisma.databaseBackup.findUnique({
                    where: { id: backupId },
                });
                const systemBackup = await this.prisma.systemBackup.findUnique({
                    where: { id: backupId },
                });
                const backup = databaseBackup || systemBackup;
                if (backup && (backup.status === 'completed' || backup.status === 'failed')) {
                    if (backup.status === 'failed') {
                        throw new Error(backup.errorMessage || 'Backup failed');
                    }
                    return;
                }
            }
            if (progress && (progress.status === 'completed' || progress.status === 'failed')) {
                if (progress.status === 'failed') {
                    throw new Error(progress.errorMessage || 'Backup failed');
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error('Backup timeout exceeded');
    }
    async cleanupOldScheduledBackups(schedule) {
        if (!schedule.maxBackups || schedule.maxBackups <= 0)
            return;
        try {
            if (schedule.scheduleType === 'database') {
                const oldBackups = await this.prisma.databaseBackup.findMany({
                    where: {
                        tenantId: schedule.tenantId,
                        isAutomatic: true,
                        tags: { has: schedule.scheduleType },
                        status: 'completed',
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: schedule.maxBackups,
                });
                for (const backup of oldBackups) {
                    await this.prisma.databaseBackup.delete({ where: { id: backup.id } });
                }
            }
            else {
                const oldBackups = await this.prisma.systemBackup.findMany({
                    where: {
                        tenantId: schedule.tenantId,
                        isAutomatic: true,
                        tags: { has: schedule.scheduleType },
                        status: 'completed',
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: schedule.maxBackups,
                });
                for (const backup of oldBackups) {
                    await this.prisma.systemBackup.delete({ where: { id: backup.id } });
                }
            }
            this.logger.log(`Cleaned up old backups for schedule: ${schedule.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to cleanup old backups: ${error.message}`, error.stack);
        }
    }
    getNextRunTime(cronExpression, timezone = 'UTC') {
        const now = new Date();
        return new Date(now.getTime() + 60000);
    }
    async sendNotification(schedule, status, details) {
        this.logger.log(`Notification sent for schedule ${schedule.name}: ${status}`, details);
    }
    async healthCheck() {
        try {
            const stuckSchedules = await this.prisma.backupSchedule.findMany({
                where: {
                    isEnabled: true,
                    nextRunAt: { lte: new Date(Date.now() - 30 * 60 * 1000) },
                    lastRunAt: { lte: new Date(Date.now() - 60 * 60 * 1000) },
                },
            });
            for (const schedule of stuckSchedules) {
                this.logger.warn(`Detected stuck schedule: ${schedule.name}, re-registering...`);
                this.unregisterSchedule(schedule.id);
                this.registerSchedule(schedule);
                await this.prisma.backupSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        nextRunAt: this.getNextRunTime(schedule.cronExpression, schedule.timezone),
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`, error.stack);
        }
    }
};
exports.BackupSchedulerService = BackupSchedulerService;
__decorate([
    (0, schedule_1.Cron)('*/10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupSchedulerService.prototype, "healthCheck", null);
exports.BackupSchedulerService = BackupSchedulerService = BackupSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        backup_service_1.BackupService])
], BackupSchedulerService);
//# sourceMappingURL=backup-scheduler.service.js.map