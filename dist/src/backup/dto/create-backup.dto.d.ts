export declare enum BackupType {
    FULL = "full",
    INCREMENTAL = "incremental",
    DIFFERENTIAL = "differential",
    SCHEMA_ONLY = "schema_only",
    DATA_ONLY = "data_only"
}
export declare enum SystemBackupType {
    FULL = "full",
    INCREMENTAL = "incremental",
    FILES_ONLY = "files_only",
    CONFIG_ONLY = "config_only",
    MEDIA_ONLY = "media_only"
}
export declare enum CompressionType {
    GZIP = "gzip",
    LZ4 = "lz4",
    ZSTD = "zstd",
    NONE = "none"
}
export declare class CreateDatabaseBackupDto {
    name: string;
    description?: string;
    backupType: BackupType;
    compressionType?: CompressionType;
    retentionDays?: number;
    tags?: string[];
    isAutomatic?: boolean;
}
export declare class CreateSystemBackupDto {
    name: string;
    description?: string;
    backupType: SystemBackupType;
    includeDatabase?: boolean;
    includeFiles?: boolean;
    includeConfig?: boolean;
    includeMedia?: boolean;
    includeLogs?: boolean;
    retentionDays?: number;
    tags?: string[];
    isAutomatic?: boolean;
}
