export declare enum ScheduleType {
    DATABASE = "database",
    SYSTEM = "system",
    FILES = "files",
    CONFIG = "config"
}
export declare enum ScheduleBackupType {
    FULL = "full",
    INCREMENTAL = "incremental",
    DIFFERENTIAL = "differential"
}
export declare class CreateBackupScheduleDto {
    name: string;
    description?: string;
    scheduleType: ScheduleType;
    backupType: ScheduleBackupType;
    cronExpression: string;
    timezone?: string;
    isEnabled?: boolean;
    retentionDays?: number;
    compressionType?: string;
    maxBackups?: number;
    notifyOnSuccess?: boolean;
    notifyOnFailure?: boolean;
    recipients?: string[];
    maxDuration?: number;
    maxSize?: number;
    tags?: string[];
}
export declare class UpdateBackupScheduleDto {
    name?: string;
    description?: string;
    cronExpression?: string;
    timezone?: string;
    isEnabled?: boolean;
    retentionDays?: number;
    maxBackups?: number;
    notifyOnSuccess?: boolean;
    notifyOnFailure?: boolean;
    recipients?: string[];
    maxDuration?: number;
    maxSize?: number;
    tags?: string[];
}
