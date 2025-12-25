import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Cron } from '@nestjs/schedule';
import { BackupSchedule } from '@prisma/client';
import { CreateBackupScheduleDto, UpdateBackupScheduleDto } from '../dto/backup-schedule.dto';
import { BackupService } from './backup.service';
import * as cron from 'node-cron';

@Injectable()
export class BackupSchedulerService {
  private readonly logger = new Logger(BackupSchedulerService.name);
  private scheduledJobs = new Map<string, any>();

  constructor(
    private prisma: PrismaService,
    private backupService: BackupService,
  ) {
    this.initializeSchedules();
  }

  async createBackupSchedule(
    tenantId: number | null,
    createScheduleDto: CreateBackupScheduleDto
  ): Promise<BackupSchedule> {
    this.logger.log(`Creating backup schedule: ${createScheduleDto.name} for tenant: ${tenantId}`);

    // Validate cron expression
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

    // Register the schedule
    if (schedule.isEnabled) {
      this.registerSchedule(schedule);
    }

    return schedule;
  }

  async updateBackupSchedule(
    scheduleId: string,
    updateScheduleDto: UpdateBackupScheduleDto
  ): Promise<BackupSchedule> {
    this.logger.log(`Updating backup schedule: ${scheduleId}`);

    const existingSchedule = await this.prisma.backupSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      throw new Error('Backup schedule not found');
    }

    // Validate cron expression if provided
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

    // Update the registered schedule
    this.unregisterSchedule(scheduleId);
    if (updatedSchedule.isEnabled) {
      this.registerSchedule(updatedSchedule);
    }

    return updatedSchedule;
  }

  async deleteBackupSchedule(scheduleId: string): Promise<void> {
    this.logger.log(`Deleting backup schedule: ${scheduleId}`);

    this.unregisterSchedule(scheduleId);

    await this.prisma.backupSchedule.delete({
      where: { id: scheduleId },
    });
  }

  async getBackupSchedules(tenantId: number | null): Promise<BackupSchedule[]> {
    return this.prisma.backupSchedule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleSchedule(scheduleId: string, enabled: boolean): Promise<BackupSchedule> {
    const schedule = await this.prisma.backupSchedule.update({
      where: { id: scheduleId },
      data: { isEnabled: enabled },
    });

    if (enabled) {
      this.registerSchedule(schedule);
    } else {
      this.unregisterSchedule(scheduleId);
    }

    return schedule;
  }

  private async initializeSchedules(): Promise<void> {
    this.logger.log('Initializing backup schedules...');

    try {
      const enabledSchedules = await this.prisma.backupSchedule.findMany({
        where: { isEnabled: true },
      });

      for (const schedule of enabledSchedules) {
        this.registerSchedule(schedule);
      }

      this.logger.log(`Initialized ${enabledSchedules.length} backup schedules`);
    } catch (error) {
      this.logger.error(`Failed to initialize schedules: ${error.message}`, error.stack);
    }
  }

  private registerSchedule(schedule: BackupSchedule): void {
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
    } catch (error) {
      this.logger.error(`Failed to register schedule ${schedule.id}: ${error.message}`, error.stack);
    }
  }

  private unregisterSchedule(scheduleId: string): void {
    const job = this.scheduledJobs.get(scheduleId);
    if (job) {
      job.stop();
      job.destroy();
      this.scheduledJobs.delete(scheduleId);
      this.logger.log(`Unregistered backup schedule: ${scheduleId}`);
    }
  }

  private async executeScheduledBackup(schedule: BackupSchedule): Promise<void> {
    this.logger.log(`Executing scheduled backup: ${schedule.name}`);

    const startTime = Date.now();

    try {
      // Update last run time
      await this.prisma.backupSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: this.getNextRunTime(schedule.cronExpression, schedule.timezone),
        },
      });

      let backupPromise: Promise<any>;

      // Create backup based on schedule type
      if (schedule.scheduleType === 'database') {
        backupPromise = this.backupService.createDatabaseBackup(schedule.tenantId, {
          name: `Scheduled ${schedule.name} - ${new Date().toISOString()}`,
          description: `Automatically generated backup from schedule: ${schedule.name}`,
          backupType: schedule.backupType as any,
          compressionType: schedule.compressionType as any,
          retentionDays: schedule.retentionDays,
          tags: [...(schedule.tags || []), 'scheduled', schedule.scheduleType],
          isAutomatic: true,
        });
      } else {
        backupPromise = this.backupService.createSystemBackup(schedule.tenantId, {
          name: `Scheduled ${schedule.name} - ${new Date().toISOString()}`,
          description: `Automatically generated backup from schedule: ${schedule.name}`,
          backupType: schedule.backupType as any,
          retentionDays: schedule.retentionDays,
          tags: [...(schedule.tags || []), 'scheduled', schedule.scheduleType],
          isAutomatic: true,
        });
      }

      const backup = await backupPromise;

      // Wait for backup to complete (with timeout)
      await this.waitForBackupCompletion(backup.id, schedule.maxDuration);

      // Update schedule status
      await this.prisma.backupSchedule.update({
        where: { id: schedule.id },
        data: {
          lastStatus: 'success',
          consecutiveFailures: 0,
        },
      });

      // Clean up old backups if needed
      await this.cleanupOldScheduledBackups(schedule);

      // Send success notification if enabled
      if (schedule.notifyOnSuccess) {
        await this.sendNotification(schedule, 'success', {
          backupId: backup.id,
          duration: Date.now() - startTime,
        });
      }

      this.logger.log(`Scheduled backup completed: ${schedule.name}`);

    } catch (error) {
      this.logger.error(`Scheduled backup failed: ${schedule.name} - ${error.message}`, error.stack);

      // Update failure count
      const updatedSchedule = await this.prisma.backupSchedule.update({
        where: { id: schedule.id },
        data: {
          lastStatus: 'failed',
          consecutiveFailures: { increment: 1 },
        },
      });

      // Send failure notification
      if (schedule.notifyOnFailure) {
        await this.sendNotification(schedule, 'failed', {
          error: error.message,
          consecutiveFailures: updatedSchedule.consecutiveFailures,
        });
      }

      // Disable schedule if too many consecutive failures
      if (updatedSchedule.consecutiveFailures >= 5) {
        this.logger.warn(`Disabling schedule ${schedule.name} due to consecutive failures`);
        await this.toggleSchedule(schedule.id, false);
      }
    }
  }

  private async waitForBackupCompletion(backupId: string, maxDuration?: number): Promise<void> {
    const timeout = maxDuration ? maxDuration * 1000 : 30 * 60 * 1000; // Default 30 minutes
    const startTime = Date.now();
    const pollInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < timeout) {
      const progress = this.backupService.getBackupProgress(backupId);

      if (!progress) {
        // Backup not in progress, check database status
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

  private async cleanupOldScheduledBackups(schedule: BackupSchedule): Promise<void> {
    if (!schedule.maxBackups || schedule.maxBackups <= 0) return;

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
      } else {
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
    } catch (error) {
      this.logger.error(`Failed to cleanup old backups: ${error.message}`, error.stack);
    }
  }

  private getNextRunTime(cronExpression: string, timezone: string = 'UTC'): Date {
    // Simple implementation - can be enhanced with a proper cron parser
    const now = new Date();
    return new Date(now.getTime() + 60000); // Next minute as fallback
  }

  private async sendNotification(
    schedule: BackupSchedule,
    status: 'success' | 'failed',
    details: any
  ): Promise<void> {
    // Placeholder for notification implementation
    // This would integrate with email service, webhooks, etc.
    this.logger.log(`Notification sent for schedule ${schedule.name}: ${status}`, details);
  }

  // ===== SCHEDULED HEALTH CHECK =====

  @Cron('*/10 * * * *') // Every 10 minutes
  async healthCheck(): Promise<void> {
    try {
      // Check for stuck schedules
      const stuckSchedules = await this.prisma.backupSchedule.findMany({
        where: {
          isEnabled: true,
          nextRunAt: { lte: new Date(Date.now() - 30 * 60 * 1000) }, // 30 minutes ago
          lastRunAt: { lte: new Date(Date.now() - 60 * 60 * 1000) }, // 1 hour ago
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
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
    }
  }
}