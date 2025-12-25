import { PrismaService } from '../../config/prisma.service';
import { BackupSchedule } from '@prisma/client';
import { CreateBackupScheduleDto, UpdateBackupScheduleDto } from '../dto/backup-schedule.dto';
import { BackupService } from './backup.service';
export declare class BackupSchedulerService {
    private prisma;
    private backupService;
    private readonly logger;
    private scheduledJobs;
    constructor(prisma: PrismaService, backupService: BackupService);
    createBackupSchedule(tenantId: number | null, createScheduleDto: CreateBackupScheduleDto): Promise<BackupSchedule>;
    updateBackupSchedule(scheduleId: string, updateScheduleDto: UpdateBackupScheduleDto): Promise<BackupSchedule>;
    deleteBackupSchedule(scheduleId: string): Promise<void>;
    getBackupSchedules(tenantId: number | null): Promise<BackupSchedule[]>;
    toggleSchedule(scheduleId: string, enabled: boolean): Promise<BackupSchedule>;
    private initializeSchedules;
    private registerSchedule;
    private unregisterSchedule;
    private executeScheduledBackup;
    private waitForBackupCompletion;
    private cleanupOldScheduledBackups;
    private getNextRunTime;
    private sendNotification;
    healthCheck(): Promise<void>;
}
