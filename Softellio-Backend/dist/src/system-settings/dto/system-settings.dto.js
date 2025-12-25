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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRestoreDto = exports.ConfigurationBackupDto = exports.SystemSettingsQueryDto = exports.UpdateSystemSettingsDto = exports.CreateSystemSettingsDto = exports.FeatureTogglesDto = exports.PerformanceSettingsDto = exports.LoggingSettingsDto = exports.DatabaseSettingsDto = exports.CacheSettingsDto = exports.FileUploadSettingsDto = exports.EmailSettingsDto = exports.SecuritySettingsDto = exports.GeneralSettingsDto = exports.DatabaseDriver = exports.FileStorageDriver = exports.CacheDriver = exports.LogLevel = exports.EnvironmentType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType["DEVELOPMENT"] = "development";
    EnvironmentType["STAGING"] = "staging";
    EnvironmentType["PRODUCTION"] = "production";
})(EnvironmentType || (exports.EnvironmentType = EnvironmentType = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var CacheDriver;
(function (CacheDriver) {
    CacheDriver["MEMORY"] = "memory";
    CacheDriver["REDIS"] = "redis";
    CacheDriver["DATABASE"] = "database";
})(CacheDriver || (exports.CacheDriver = CacheDriver = {}));
var FileStorageDriver;
(function (FileStorageDriver) {
    FileStorageDriver["LOCAL"] = "local";
    FileStorageDriver["CLOUDINARY"] = "cloudinary";
    FileStorageDriver["AWS_S3"] = "s3";
    FileStorageDriver["GOOGLE_CLOUD"] = "gcs";
})(FileStorageDriver || (exports.FileStorageDriver = FileStorageDriver = {}));
var DatabaseDriver;
(function (DatabaseDriver) {
    DatabaseDriver["POSTGRESQL"] = "postgresql";
    DatabaseDriver["MYSQL"] = "mysql";
    DatabaseDriver["SQLITE"] = "sqlite";
})(DatabaseDriver || (exports.DatabaseDriver = DatabaseDriver = {}));
class GeneralSettingsDto {
}
exports.GeneralSettingsDto = GeneralSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "appName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "appDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "appVersion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: EnvironmentType, description: 'Environment type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EnvironmentType),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "environment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Application URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "appUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'API URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "apiUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frontend URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "frontendUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin panel URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "adminUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default language code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "defaultLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supported languages', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeneralSettingsDto.prototype, "supportedLanguages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default timezone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date format' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "dateFormat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Time format' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "timeFormat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number format locale' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralSettingsDto.prototype, "numberLocale", void 0);
class SecuritySettingsDto {
}
exports.SecuritySettingsDto = SecuritySettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable two-factor authentication' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "enableTwoFactor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Force HTTPS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "forceHttps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session timeout in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "sessionTimeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum login attempts' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "maxLoginAttempts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account lockout duration in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "lockoutDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Password minimum length' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(8),
    (0, class_validator_1.Max)(128),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "passwordMinLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Require password special characters' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "passwordRequireSpecialChars", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Require password numbers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "passwordRequireNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Require password uppercase letters' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "passwordRequireUppercase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Password expiration days (0 = never)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "passwordExpirationDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allow user registration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "allowUserRegistration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Require email verification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "requireEmailVerification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable API rate limiting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SecuritySettingsDto.prototype, "enableRateLimiting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rate limit requests per minute' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], SecuritySettingsDto.prototype, "rateLimitPerMinute", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'CORS allowed origins', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SecuritySettingsDto.prototype, "corsOrigins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'JWT secret key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecuritySettingsDto.prototype, "jwtSecret", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'JWT access token expiration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecuritySettingsDto.prototype, "jwtAccessExpiration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'JWT refresh token expiration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SecuritySettingsDto.prototype, "jwtRefreshExpiration", void 0);
class EmailSettingsDto {
}
exports.EmailSettingsDto = EmailSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email service enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmailSettingsDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SMTP host' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "smtpHost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SMTP port' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EmailSettingsDto.prototype, "smtpPort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SMTP secure connection' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmailSettingsDto.prototype, "smtpSecure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SMTP username' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "smtpUsername", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SMTP password' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "smtpPassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'From email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "fromEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'From name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "fromName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply to email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailSettingsDto.prototype, "replyToEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email queue enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmailSettingsDto.prototype, "queueEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email templates enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmailSettingsDto.prototype, "templatesEnabled", void 0);
class FileUploadSettingsDto {
}
exports.FileUploadSettingsDto = FileUploadSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: FileStorageDriver, description: 'File storage driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileStorageDriver),
    __metadata("design:type", String)
], FileUploadSettingsDto.prototype, "driver", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum file size in MB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], FileUploadSettingsDto.prototype, "maxFileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum files per upload' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], FileUploadSettingsDto.prototype, "maxFiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allowed file types', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FileUploadSettingsDto.prototype, "allowedFileTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allowed image types', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FileUploadSettingsDto.prototype, "allowedImageTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image quality (1-100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FileUploadSettingsDto.prototype, "imageQuality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Generate thumbnails' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FileUploadSettingsDto.prototype, "generateThumbnails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Thumbnail sizes', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FileUploadSettingsDto.prototype, "thumbnailSizes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Local storage path' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadSettingsDto.prototype, "localPath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cloudinary cloud name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadSettingsDto.prototype, "cloudinaryCloudName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cloudinary API key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadSettingsDto.prototype, "cloudinaryApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cloudinary API secret' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadSettingsDto.prototype, "cloudinaryApiSecret", void 0);
class CacheSettingsDto {
}
exports.CacheSettingsDto = CacheSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CacheDriver, description: 'Cache driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CacheDriver),
    __metadata("design:type", String)
], CacheSettingsDto.prototype, "driver", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default cache TTL in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CacheSettingsDto.prototype, "defaultTtl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redis host' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CacheSettingsDto.prototype, "redisHost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redis port' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], CacheSettingsDto.prototype, "redisPort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redis password' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CacheSettingsDto.prototype, "redisPassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redis database number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(15),
    __metadata("design:type", Number)
], CacheSettingsDto.prototype, "redisDatabase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cache user sessions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CacheSettingsDto.prototype, "cacheUserSessions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cache database queries' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CacheSettingsDto.prototype, "cacheDatabaseQueries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cache API responses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CacheSettingsDto.prototype, "cacheApiResponses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cache page content' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CacheSettingsDto.prototype, "cachePageContent", void 0);
class DatabaseSettingsDto {
}
exports.DatabaseSettingsDto = DatabaseSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DatabaseDriver, description: 'Database driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DatabaseDriver),
    __metadata("design:type", String)
], DatabaseSettingsDto.prototype, "driver", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Database host' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseSettingsDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Database port' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], DatabaseSettingsDto.prototype, "port", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Database name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseSettingsDto.prototype, "database", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Database username' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseSettingsDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Database password' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseSettingsDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum connection pool size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], DatabaseSettingsDto.prototype, "maxConnections", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Connection timeout in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], DatabaseSettingsDto.prototype, "connectionTimeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable database logging' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DatabaseSettingsDto.prototype, "enableLogging", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable database SSL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DatabaseSettingsDto.prototype, "enableSsl", void 0);
class LoggingSettingsDto {
}
exports.LoggingSettingsDto = LoggingSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: LogLevel, description: 'Log level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LogLevel),
    __metadata("design:type", String)
], LoggingSettingsDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable file logging' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingSettingsDto.prototype, "enableFileLogging", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Log file path' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoggingSettingsDto.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum log file size in MB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], LoggingSettingsDto.prototype, "maxFileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of log files' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LoggingSettingsDto.prototype, "maxFiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Log rotation enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingSettingsDto.prototype, "enableRotation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable database logging' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingSettingsDto.prototype, "enableDatabaseLogging", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable error tracking' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoggingSettingsDto.prototype, "enableErrorTracking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Log format' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoggingSettingsDto.prototype, "format", void 0);
class PerformanceSettingsDto {
}
exports.PerformanceSettingsDto = PerformanceSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable compression' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PerformanceSettingsDto.prototype, "enableCompression", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compression threshold in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PerformanceSettingsDto.prototype, "compressionThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable request timeout' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PerformanceSettingsDto.prototype, "enableRequestTimeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Request timeout in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], PerformanceSettingsDto.prototype, "requestTimeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum request body size in MB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PerformanceSettingsDto.prototype, "maxRequestBodySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable keep alive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PerformanceSettingsDto.prototype, "enableKeepAlive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Keep alive timeout in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], PerformanceSettingsDto.prototype, "keepAliveTimeout", void 0);
class FeatureTogglesDto {
}
exports.FeatureTogglesDto = FeatureTogglesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable user registration' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "userRegistration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable email notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable SMS notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable push notifications' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable analytics tracking' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "analyticsTracking", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable error reporting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "errorReporting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable maintenance mode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "maintenanceMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable API documentation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "apiDocumentation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable health checks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "healthChecks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable metrics collection' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "metricsCollection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable social media login' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "socialLogin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable file uploads' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "fileUploads", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable multi-tenancy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "multiTenancy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable backup system' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeatureTogglesDto.prototype, "backupSystem", void 0);
class CreateSystemSettingsDto {
}
exports.CreateSystemSettingsDto = CreateSystemSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settings category identifier' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settings name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Settings description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingsDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: GeneralSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GeneralSettingsDto),
    __metadata("design:type", GeneralSettingsDto)
], CreateSystemSettingsDto.prototype, "general", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: SecuritySettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SecuritySettingsDto),
    __metadata("design:type", SecuritySettingsDto)
], CreateSystemSettingsDto.prototype, "security", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: EmailSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EmailSettingsDto),
    __metadata("design:type", EmailSettingsDto)
], CreateSystemSettingsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: FileUploadSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileUploadSettingsDto),
    __metadata("design:type", FileUploadSettingsDto)
], CreateSystemSettingsDto.prototype, "fileUpload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CacheSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CacheSettingsDto),
    __metadata("design:type", CacheSettingsDto)
], CreateSystemSettingsDto.prototype, "cache", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: DatabaseSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatabaseSettingsDto),
    __metadata("design:type", DatabaseSettingsDto)
], CreateSystemSettingsDto.prototype, "database", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: LoggingSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoggingSettingsDto),
    __metadata("design:type", LoggingSettingsDto)
], CreateSystemSettingsDto.prototype, "logging", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: PerformanceSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PerformanceSettingsDto),
    __metadata("design:type", PerformanceSettingsDto)
], CreateSystemSettingsDto.prototype, "performance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: FeatureTogglesDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FeatureTogglesDto),
    __metadata("design:type", FeatureTogglesDto)
], CreateSystemSettingsDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom settings as JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSystemSettingsDto.prototype, "customSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is settings configuration active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemSettingsDto.prototype, "isActive", void 0);
class UpdateSystemSettingsDto {
}
exports.UpdateSystemSettingsDto = UpdateSystemSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Settings category identifier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Settings name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Settings description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingsDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: GeneralSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GeneralSettingsDto),
    __metadata("design:type", GeneralSettingsDto)
], UpdateSystemSettingsDto.prototype, "general", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: SecuritySettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SecuritySettingsDto),
    __metadata("design:type", SecuritySettingsDto)
], UpdateSystemSettingsDto.prototype, "security", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: EmailSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EmailSettingsDto),
    __metadata("design:type", EmailSettingsDto)
], UpdateSystemSettingsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: FileUploadSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileUploadSettingsDto),
    __metadata("design:type", FileUploadSettingsDto)
], UpdateSystemSettingsDto.prototype, "fileUpload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CacheSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CacheSettingsDto),
    __metadata("design:type", CacheSettingsDto)
], UpdateSystemSettingsDto.prototype, "cache", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: DatabaseSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatabaseSettingsDto),
    __metadata("design:type", DatabaseSettingsDto)
], UpdateSystemSettingsDto.prototype, "database", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: LoggingSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoggingSettingsDto),
    __metadata("design:type", LoggingSettingsDto)
], UpdateSystemSettingsDto.prototype, "logging", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: PerformanceSettingsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PerformanceSettingsDto),
    __metadata("design:type", PerformanceSettingsDto)
], UpdateSystemSettingsDto.prototype, "performance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: FeatureTogglesDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FeatureTogglesDto),
    __metadata("design:type", FeatureTogglesDto)
], UpdateSystemSettingsDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom settings as JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSystemSettingsDto.prototype, "customSettings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is settings configuration active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSystemSettingsDto.prototype, "isActive", void 0);
class SystemSettingsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.SystemSettingsQueryDto = SystemSettingsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingsQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search in settings name and description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SystemSettingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SystemSettingsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by field' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort direction', enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], SystemSettingsQueryDto.prototype, "sortOrder", void 0);
class ConfigurationBackupDto {
}
exports.ConfigurationBackupDto = ConfigurationBackupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Backup name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigurationBackupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Backup description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigurationBackupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include all settings categories' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigurationBackupDto.prototype, "includeAll", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific categories to backup', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ConfigurationBackupDto.prototype, "categories", void 0);
class ConfigurationRestoreDto {
}
exports.ConfigurationRestoreDto = ConfigurationRestoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Backup ID to restore from' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigurationRestoreDto.prototype, "backupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Restore all settings' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigurationRestoreDto.prototype, "restoreAll", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific categories to restore', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ConfigurationRestoreDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Create backup before restore' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigurationRestoreDto.prototype, "createBackup", void 0);
//# sourceMappingURL=system-settings.dto.js.map