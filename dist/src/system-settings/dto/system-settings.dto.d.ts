export declare enum EnvironmentType {
    DEVELOPMENT = "development",
    STAGING = "staging",
    PRODUCTION = "production"
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export declare enum CacheDriver {
    MEMORY = "memory",
    REDIS = "redis",
    DATABASE = "database"
}
export declare enum FileStorageDriver {
    LOCAL = "local",
    CLOUDINARY = "cloudinary",
    AWS_S3 = "s3",
    GOOGLE_CLOUD = "gcs"
}
export declare enum DatabaseDriver {
    POSTGRESQL = "postgresql",
    MYSQL = "mysql",
    SQLITE = "sqlite"
}
export declare class GeneralSettingsDto {
    appName?: string;
    appDescription?: string;
    appVersion?: string;
    environment?: EnvironmentType;
    appUrl?: string;
    apiUrl?: string;
    frontendUrl?: string;
    adminUrl?: string;
    defaultLanguage?: string;
    supportedLanguages?: string[];
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    currency?: string;
    numberLocale?: string;
}
export declare class SecuritySettingsDto {
    enableTwoFactor?: boolean;
    forceHttps?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
    lockoutDuration?: number;
    passwordMinLength?: number;
    passwordRequireSpecialChars?: boolean;
    passwordRequireNumbers?: boolean;
    passwordRequireUppercase?: boolean;
    passwordExpirationDays?: number;
    allowUserRegistration?: boolean;
    requireEmailVerification?: boolean;
    enableRateLimiting?: boolean;
    rateLimitPerMinute?: number;
    corsOrigins?: string[];
    jwtSecret?: string;
    jwtAccessExpiration?: string;
    jwtRefreshExpiration?: string;
}
export declare class EmailSettingsDto {
    enabled?: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUsername?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    replyToEmail?: string;
    queueEnabled?: boolean;
    templatesEnabled?: boolean;
}
export declare class FileUploadSettingsDto {
    driver?: FileStorageDriver;
    maxFileSize?: number;
    maxFiles?: number;
    allowedFileTypes?: string[];
    allowedImageTypes?: string[];
    imageQuality?: number;
    generateThumbnails?: boolean;
    thumbnailSizes?: string[];
    localPath?: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    cloudinaryApiSecret?: string;
}
export declare class CacheSettingsDto {
    driver?: CacheDriver;
    defaultTtl?: number;
    redisHost?: string;
    redisPort?: number;
    redisPassword?: string;
    redisDatabase?: number;
    cacheUserSessions?: boolean;
    cacheDatabaseQueries?: boolean;
    cacheApiResponses?: boolean;
    cachePageContent?: boolean;
}
export declare class DatabaseSettingsDto {
    driver?: DatabaseDriver;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    maxConnections?: number;
    connectionTimeout?: number;
    enableLogging?: boolean;
    enableSsl?: boolean;
}
export declare class LoggingSettingsDto {
    level?: LogLevel;
    enableFileLogging?: boolean;
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
    enableRotation?: boolean;
    enableDatabaseLogging?: boolean;
    enableErrorTracking?: boolean;
    format?: string;
}
export declare class PerformanceSettingsDto {
    enableCompression?: boolean;
    compressionThreshold?: number;
    enableRequestTimeout?: boolean;
    requestTimeout?: number;
    maxRequestBodySize?: number;
    enableKeepAlive?: boolean;
    keepAliveTimeout?: number;
}
export declare class FeatureTogglesDto {
    userRegistration?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    analyticsTracking?: boolean;
    errorReporting?: boolean;
    maintenanceMode?: boolean;
    apiDocumentation?: boolean;
    healthChecks?: boolean;
    metricsCollection?: boolean;
    socialLogin?: boolean;
    fileUploads?: boolean;
    multiTenancy?: boolean;
    backupSystem?: boolean;
}
export declare class CreateSystemSettingsDto {
    category: string;
    name: string;
    description?: string;
    general?: GeneralSettingsDto;
    security?: SecuritySettingsDto;
    email?: EmailSettingsDto;
    fileUpload?: FileUploadSettingsDto;
    cache?: CacheSettingsDto;
    database?: DatabaseSettingsDto;
    logging?: LoggingSettingsDto;
    performance?: PerformanceSettingsDto;
    features?: FeatureTogglesDto;
    customSettings?: Record<string, any>;
    isActive?: boolean;
}
export declare class UpdateSystemSettingsDto {
    category?: string;
    name?: string;
    description?: string;
    general?: GeneralSettingsDto;
    security?: SecuritySettingsDto;
    email?: EmailSettingsDto;
    fileUpload?: FileUploadSettingsDto;
    cache?: CacheSettingsDto;
    database?: DatabaseSettingsDto;
    logging?: LoggingSettingsDto;
    performance?: PerformanceSettingsDto;
    features?: FeatureTogglesDto;
    customSettings?: Record<string, any>;
    isActive?: boolean;
}
export declare class SystemSettingsQueryDto {
    category?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ConfigurationBackupDto {
    name: string;
    description?: string;
    includeAll?: boolean;
    categories?: string[];
}
export declare class ConfigurationRestoreDto {
    backupId: string;
    restoreAll?: boolean;
    categories?: string[];
    createBackup?: boolean;
}
