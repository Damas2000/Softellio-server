export declare enum UpdateType {
    PATCH = "patch",
    MINOR = "minor",
    MAJOR = "major",
    SECURITY = "security",
    HOTFIX = "hotfix"
}
export declare class CreateSystemUpdateDto {
    name: string;
    description?: string;
    updateType: UpdateType;
    version: string;
    currentVersion?: string;
    packageUrl?: string;
    packageSize?: number;
    packageChecksum?: string;
    releaseNotes?: string;
    requirements?: any;
    dependencies?: any;
    conflicts?: any;
    autoBackup?: boolean;
    scheduledAt?: string;
    canRollback?: boolean;
    notifyOnComplete?: boolean;
    notifyOnFailure?: boolean;
    recipients?: string[];
    tags?: string[];
}
export declare class UpdateSystemUpdateDto {
    name?: string;
    description?: string;
    scheduledAt?: string;
    canRollback?: boolean;
    notifyOnComplete?: boolean;
    notifyOnFailure?: boolean;
    recipients?: string[];
    tags?: string[];
}
export declare class SystemUpdateResponse {
    id: string;
    name: string;
    version: string;
    updateType: string;
    status: string;
    progress: number;
    currentPhase?: string;
    errorMessage?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    scheduledAt?: Date;
    canRollback?: boolean;
}
