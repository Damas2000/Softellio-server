export declare enum RestoreType {
    FULL = "full",
    PARTIAL = "partial",
    SELECTIVE = "selective"
}
export declare enum RestoreBackupType {
    DATABASE = "database",
    SYSTEM = "system",
    FILES = "files",
    CONFIG = "config"
}
export declare class CreateRestoreOperationDto {
    backupId: string;
    backupType: RestoreBackupType;
    restoreType: RestoreType;
    targetLocation?: string;
    restoreDatabase?: boolean;
    restoreFiles?: boolean;
    restoreConfig?: boolean;
    restoreMedia?: boolean;
    reason?: string;
}
export declare class RestoreOperationResponse {
    id: string;
    status: string;
    progress: number;
    currentPhase?: string;
    errorMessage?: string;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
}
