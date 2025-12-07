import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUrl,
  IsEmail,
  ValidateNested,
  IsArray,
  Min,
  Max,
  IsInt,
  IsObject,
  IsJSON,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export enum CacheDriver {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
}

export enum FileStorageDriver {
  LOCAL = 'local',
  CLOUDINARY = 'cloudinary',
  AWS_S3 = 's3',
  GOOGLE_CLOUD = 'gcs',
}

export enum DatabaseDriver {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
}

export class GeneralSettingsDto {
  @ApiPropertyOptional({ description: 'Application name' })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({ description: 'Application description' })
  @IsOptional()
  @IsString()
  appDescription?: string;

  @ApiPropertyOptional({ description: 'Application version' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({ enum: EnvironmentType, description: 'Environment type' })
  @IsOptional()
  @IsEnum(EnvironmentType)
  environment?: EnvironmentType;

  @ApiPropertyOptional({ description: 'Application URL' })
  @IsOptional()
  @IsUrl()
  appUrl?: string;

  @ApiPropertyOptional({ description: 'API URL' })
  @IsOptional()
  @IsUrl()
  apiUrl?: string;

  @ApiPropertyOptional({ description: 'Frontend URL' })
  @IsOptional()
  @IsUrl()
  frontendUrl?: string;

  @ApiPropertyOptional({ description: 'Admin panel URL' })
  @IsOptional()
  @IsUrl()
  adminUrl?: string;

  @ApiPropertyOptional({ description: 'Default language code' })
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiPropertyOptional({ description: 'Supported languages', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedLanguages?: string[];

  @ApiPropertyOptional({ description: 'Default timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Date format' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ description: 'Time format' })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Number format locale' })
  @IsOptional()
  @IsString()
  numberLocale?: string;
}

export class SecuritySettingsDto {
  @ApiPropertyOptional({ description: 'Enable two-factor authentication' })
  @IsOptional()
  @IsBoolean()
  enableTwoFactor?: boolean;

  @ApiPropertyOptional({ description: 'Force HTTPS' })
  @IsOptional()
  @IsBoolean()
  forceHttps?: boolean;

  @ApiPropertyOptional({ description: 'Session timeout in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  sessionTimeout?: number;

  @ApiPropertyOptional({ description: 'Maximum login attempts' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxLoginAttempts?: number;

  @ApiPropertyOptional({ description: 'Account lockout duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  lockoutDuration?: number;

  @ApiPropertyOptional({ description: 'Password minimum length' })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(128)
  passwordMinLength?: number;

  @ApiPropertyOptional({ description: 'Require password special characters' })
  @IsOptional()
  @IsBoolean()
  passwordRequireSpecialChars?: boolean;

  @ApiPropertyOptional({ description: 'Require password numbers' })
  @IsOptional()
  @IsBoolean()
  passwordRequireNumbers?: boolean;

  @ApiPropertyOptional({ description: 'Require password uppercase letters' })
  @IsOptional()
  @IsBoolean()
  passwordRequireUppercase?: boolean;

  @ApiPropertyOptional({ description: 'Password expiration days (0 = never)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  passwordExpirationDays?: number;

  @ApiPropertyOptional({ description: 'Allow user registration' })
  @IsOptional()
  @IsBoolean()
  allowUserRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Require email verification' })
  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @ApiPropertyOptional({ description: 'Enable API rate limiting' })
  @IsOptional()
  @IsBoolean()
  enableRateLimiting?: boolean;

  @ApiPropertyOptional({ description: 'Rate limit requests per minute' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rateLimitPerMinute?: number;

  @ApiPropertyOptional({ description: 'CORS allowed origins', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  corsOrigins?: string[];

  @ApiPropertyOptional({ description: 'JWT secret key' })
  @IsOptional()
  @IsString()
  jwtSecret?: string;

  @ApiPropertyOptional({ description: 'JWT access token expiration' })
  @IsOptional()
  @IsString()
  jwtAccessExpiration?: string;

  @ApiPropertyOptional({ description: 'JWT refresh token expiration' })
  @IsOptional()
  @IsString()
  jwtRefreshExpiration?: string;
}

export class EmailSettingsDto {
  @ApiPropertyOptional({ description: 'Email service enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'SMTP host' })
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiPropertyOptional({ description: 'SMTP port' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @ApiPropertyOptional({ description: 'SMTP secure connection' })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiPropertyOptional({ description: 'SMTP username' })
  @IsOptional()
  @IsString()
  smtpUsername?: string;

  @ApiPropertyOptional({ description: 'SMTP password' })
  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @ApiPropertyOptional({ description: 'From email address' })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiPropertyOptional({ description: 'From name' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'Reply to email address' })
  @IsOptional()
  @IsEmail()
  replyToEmail?: string;

  @ApiPropertyOptional({ description: 'Email queue enabled' })
  @IsOptional()
  @IsBoolean()
  queueEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Email templates enabled' })
  @IsOptional()
  @IsBoolean()
  templatesEnabled?: boolean;
}

export class FileUploadSettingsDto {
  @ApiPropertyOptional({ enum: FileStorageDriver, description: 'File storage driver' })
  @IsOptional()
  @IsEnum(FileStorageDriver)
  driver?: FileStorageDriver;

  @ApiPropertyOptional({ description: 'Maximum file size in MB' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxFileSize?: number;

  @ApiPropertyOptional({ description: 'Maximum files per upload' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxFiles?: number;

  @ApiPropertyOptional({ description: 'Allowed file types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ description: 'Allowed image types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedImageTypes?: string[];

  @ApiPropertyOptional({ description: 'Image quality (1-100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  imageQuality?: number;

  @ApiPropertyOptional({ description: 'Generate thumbnails' })
  @IsOptional()
  @IsBoolean()
  generateThumbnails?: boolean;

  @ApiPropertyOptional({ description: 'Thumbnail sizes', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thumbnailSizes?: string[];

  @ApiPropertyOptional({ description: 'Local storage path' })
  @IsOptional()
  @IsString()
  localPath?: string;

  @ApiPropertyOptional({ description: 'Cloudinary cloud name' })
  @IsOptional()
  @IsString()
  cloudinaryCloudName?: string;

  @ApiPropertyOptional({ description: 'Cloudinary API key' })
  @IsOptional()
  @IsString()
  cloudinaryApiKey?: string;

  @ApiPropertyOptional({ description: 'Cloudinary API secret' })
  @IsOptional()
  @IsString()
  cloudinaryApiSecret?: string;
}

export class CacheSettingsDto {
  @ApiPropertyOptional({ enum: CacheDriver, description: 'Cache driver' })
  @IsOptional()
  @IsEnum(CacheDriver)
  driver?: CacheDriver;

  @ApiPropertyOptional({ description: 'Default cache TTL in seconds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultTtl?: number;

  @ApiPropertyOptional({ description: 'Redis host' })
  @IsOptional()
  @IsString()
  redisHost?: string;

  @ApiPropertyOptional({ description: 'Redis port' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  redisPort?: number;

  @ApiPropertyOptional({ description: 'Redis password' })
  @IsOptional()
  @IsString()
  redisPassword?: string;

  @ApiPropertyOptional({ description: 'Redis database number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(15)
  redisDatabase?: number;

  @ApiPropertyOptional({ description: 'Cache user sessions' })
  @IsOptional()
  @IsBoolean()
  cacheUserSessions?: boolean;

  @ApiPropertyOptional({ description: 'Cache database queries' })
  @IsOptional()
  @IsBoolean()
  cacheDatabaseQueries?: boolean;

  @ApiPropertyOptional({ description: 'Cache API responses' })
  @IsOptional()
  @IsBoolean()
  cacheApiResponses?: boolean;

  @ApiPropertyOptional({ description: 'Cache page content' })
  @IsOptional()
  @IsBoolean()
  cachePageContent?: boolean;
}

export class DatabaseSettingsDto {
  @ApiPropertyOptional({ enum: DatabaseDriver, description: 'Database driver' })
  @IsOptional()
  @IsEnum(DatabaseDriver)
  driver?: DatabaseDriver;

  @ApiPropertyOptional({ description: 'Database host' })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiPropertyOptional({ description: 'Database port' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional({ description: 'Database name' })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({ description: 'Database username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Database password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Maximum connection pool size' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxConnections?: number;

  @ApiPropertyOptional({ description: 'Connection timeout in seconds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  connectionTimeout?: number;

  @ApiPropertyOptional({ description: 'Enable database logging' })
  @IsOptional()
  @IsBoolean()
  enableLogging?: boolean;

  @ApiPropertyOptional({ description: 'Enable database SSL' })
  @IsOptional()
  @IsBoolean()
  enableSsl?: boolean;
}

export class LoggingSettingsDto {
  @ApiPropertyOptional({ enum: LogLevel, description: 'Log level' })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @ApiPropertyOptional({ description: 'Enable file logging' })
  @IsOptional()
  @IsBoolean()
  enableFileLogging?: boolean;

  @ApiPropertyOptional({ description: 'Log file path' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ description: 'Maximum log file size in MB' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxFileSize?: number;

  @ApiPropertyOptional({ description: 'Maximum number of log files' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxFiles?: number;

  @ApiPropertyOptional({ description: 'Log rotation enabled' })
  @IsOptional()
  @IsBoolean()
  enableRotation?: boolean;

  @ApiPropertyOptional({ description: 'Enable database logging' })
  @IsOptional()
  @IsBoolean()
  enableDatabaseLogging?: boolean;

  @ApiPropertyOptional({ description: 'Enable error tracking' })
  @IsOptional()
  @IsBoolean()
  enableErrorTracking?: boolean;

  @ApiPropertyOptional({ description: 'Log format' })
  @IsOptional()
  @IsString()
  format?: string;
}

export class PerformanceSettingsDto {
  @ApiPropertyOptional({ description: 'Enable compression' })
  @IsOptional()
  @IsBoolean()
  enableCompression?: boolean;

  @ApiPropertyOptional({ description: 'Compression threshold in bytes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  compressionThreshold?: number;

  @ApiPropertyOptional({ description: 'Enable request timeout' })
  @IsOptional()
  @IsBoolean()
  enableRequestTimeout?: boolean;

  @ApiPropertyOptional({ description: 'Request timeout in seconds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  requestTimeout?: number;

  @ApiPropertyOptional({ description: 'Maximum request body size in MB' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxRequestBodySize?: number;

  @ApiPropertyOptional({ description: 'Enable keep alive' })
  @IsOptional()
  @IsBoolean()
  enableKeepAlive?: boolean;

  @ApiPropertyOptional({ description: 'Keep alive timeout in seconds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  keepAliveTimeout?: number;
}

export class FeatureTogglesDto {
  @ApiPropertyOptional({ description: 'Enable user registration' })
  @IsOptional()
  @IsBoolean()
  userRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable analytics tracking' })
  @IsOptional()
  @IsBoolean()
  analyticsTracking?: boolean;

  @ApiPropertyOptional({ description: 'Enable error reporting' })
  @IsOptional()
  @IsBoolean()
  errorReporting?: boolean;

  @ApiPropertyOptional({ description: 'Enable maintenance mode' })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ description: 'Enable API documentation' })
  @IsOptional()
  @IsBoolean()
  apiDocumentation?: boolean;

  @ApiPropertyOptional({ description: 'Enable health checks' })
  @IsOptional()
  @IsBoolean()
  healthChecks?: boolean;

  @ApiPropertyOptional({ description: 'Enable metrics collection' })
  @IsOptional()
  @IsBoolean()
  metricsCollection?: boolean;

  @ApiPropertyOptional({ description: 'Enable social media login' })
  @IsOptional()
  @IsBoolean()
  socialLogin?: boolean;

  @ApiPropertyOptional({ description: 'Enable file uploads' })
  @IsOptional()
  @IsBoolean()
  fileUploads?: boolean;

  @ApiPropertyOptional({ description: 'Enable multi-tenancy' })
  @IsOptional()
  @IsBoolean()
  multiTenancy?: boolean;

  @ApiPropertyOptional({ description: 'Enable backup system' })
  @IsOptional()
  @IsBoolean()
  backupSystem?: boolean;
}

export class CreateSystemSettingsDto {
  @ApiProperty({ description: 'Settings category identifier' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Settings name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Settings description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: GeneralSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @ApiPropertyOptional({ type: SecuritySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  security?: SecuritySettingsDto;

  @ApiPropertyOptional({ type: EmailSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettingsDto)
  email?: EmailSettingsDto;

  @ApiPropertyOptional({ type: FileUploadSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadSettingsDto)
  fileUpload?: FileUploadSettingsDto;

  @ApiPropertyOptional({ type: CacheSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CacheSettingsDto)
  cache?: CacheSettingsDto;

  @ApiPropertyOptional({ type: DatabaseSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseSettingsDto)
  database?: DatabaseSettingsDto;

  @ApiPropertyOptional({ type: LoggingSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LoggingSettingsDto)
  logging?: LoggingSettingsDto;

  @ApiPropertyOptional({ type: PerformanceSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performance?: PerformanceSettingsDto;

  @ApiPropertyOptional({ type: FeatureTogglesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureTogglesDto)
  features?: FeatureTogglesDto;

  @ApiPropertyOptional({ description: 'Custom settings as JSON' })
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is settings configuration active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({ description: 'Settings category identifier' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Settings name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Settings description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: GeneralSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @ApiPropertyOptional({ type: SecuritySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  security?: SecuritySettingsDto;

  @ApiPropertyOptional({ type: EmailSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettingsDto)
  email?: EmailSettingsDto;

  @ApiPropertyOptional({ type: FileUploadSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadSettingsDto)
  fileUpload?: FileUploadSettingsDto;

  @ApiPropertyOptional({ type: CacheSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CacheSettingsDto)
  cache?: CacheSettingsDto;

  @ApiPropertyOptional({ type: DatabaseSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DatabaseSettingsDto)
  database?: DatabaseSettingsDto;

  @ApiPropertyOptional({ type: LoggingSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LoggingSettingsDto)
  logging?: LoggingSettingsDto;

  @ApiPropertyOptional({ type: PerformanceSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performance?: PerformanceSettingsDto;

  @ApiPropertyOptional({ type: FeatureTogglesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureTogglesDto)
  features?: FeatureTogglesDto;

  @ApiPropertyOptional({ description: 'Custom settings as JSON' })
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is settings configuration active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SystemSettingsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search in settings name and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class ConfigurationBackupDto {
  @ApiProperty({ description: 'Backup name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Backup description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Include all settings categories' })
  @IsOptional()
  @IsBoolean()
  includeAll?: boolean;

  @ApiPropertyOptional({ description: 'Specific categories to backup', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}

export class ConfigurationRestoreDto {
  @ApiProperty({ description: 'Backup ID to restore from' })
  @IsString()
  backupId: string;

  @ApiPropertyOptional({ description: 'Restore all settings' })
  @IsOptional()
  @IsBoolean()
  restoreAll?: boolean;

  @ApiPropertyOptional({ description: 'Specific categories to restore', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Create backup before restore' })
  @IsOptional()
  @IsBoolean()
  createBackup?: boolean;
}