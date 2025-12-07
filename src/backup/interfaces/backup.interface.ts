export interface BackupProgress {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'corrupted';
  progress: number; // 0-100
  currentPhase?: string;
  startedAt?: Date;
  estimatedCompletion?: Date;
  filesProcessed?: number;
  totalFiles?: number;
  bytesProcessed?: number;
  totalBytes?: number;
  errorMessage?: string;
}

export interface BackupValidationResult {
  isValid: boolean;
  checksum?: string;
  expectedChecksum?: string;
  fileSize?: number;
  expectedSize?: number;
  errors: string[];
  warnings: string[];
}

export interface BackupMetrics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  averageDuration: number;
  lastBackupDate?: Date;
  nextScheduledBackup?: Date;
}

export interface RestoreProgress {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentPhase?: string;
  startedAt?: Date;
  estimatedCompletion?: Date;
  filesRestored?: number;
  totalFiles?: number;
  bytesRestored?: number;
  totalBytes?: number;
  errorMessage?: string;
}

export interface SystemInfo {
  version: string;
  platform: string;
  nodeVersion: string;
  databaseVersion?: string;
  diskSpace: {
    total: number;
    used: number;
    free: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
}

export interface BackupStorageInfo {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  basePath: string;
  totalCapacity?: number;
  usedSpace?: number;
  freeSpace?: number;
  configuration: Record<string, any>;
}

export interface UpdateProgress {
  id: string;
  status: 'pending' | 'downloading' | 'applying' | 'completed' | 'failed' | 'rolled_back';
  progress: number; // 0-100
  currentPhase?: string;
  startedAt?: Date;
  estimatedCompletion?: Date;
  bytesDownloaded?: number;
  totalBytes?: number;
  errorMessage?: string;
  rollbackAvailable?: boolean;
}

export interface BackupConfiguration {
  databaseBackup: {
    enabled: boolean;
    schedule?: string;
    retentionDays: number;
    compressionType: string;
    encryptionEnabled: boolean;
  };
  systemBackup: {
    enabled: boolean;
    schedule?: string;
    retentionDays: number;
    includeFiles: boolean;
    includeConfig: boolean;
    includeMedia: boolean;
    includeLogs: boolean;
  };
  storage: BackupStorageInfo;
  notifications: {
    emailEnabled: boolean;
    webhookEnabled: boolean;
    recipients: string[];
    webhookUrl?: string;
  };
}

export interface BackupCleanupResult {
  deletedBackups: string[];
  freedSpace: number;
  errors: string[];
}

export interface BackupStatistics {
  dailyStats: {
    date: string;
    backupsCreated: number;
    totalSize: number;
    avgDuration: number;
    successRate: number;
  }[];
  weeklyStats: {
    week: string;
    backupsCreated: number;
    totalSize: number;
    avgDuration: number;
    successRate: number;
  }[];
  monthlyStats: {
    month: string;
    backupsCreated: number;
    totalSize: number;
    avgDuration: number;
    successRate: number;
  }[];
}