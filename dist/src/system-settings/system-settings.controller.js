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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const system_settings_service_1 = require("./system-settings.service");
const system_settings_dto_1 = require("./dto/system-settings.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs/promises");
let SystemSettingsController = class SystemSettingsController {
    constructor(systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }
    create(createSystemSettingsDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.create(createSystemSettingsDto, requestingUserTenantId);
    }
    findAll(query, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.findAll(query, requestingUserTenantId);
    }
    getCategories(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.getCategories(requestingUserTenantId);
    }
    getStatistics(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.getStatistics(requestingUserTenantId);
    }
    findByCategory(category, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.findByCategory(category, requestingUserTenantId);
    }
    async exportSettings(categoriesParam, user, tenantId, res) {
        try {
            const categories = categoriesParam ? categoriesParam.split(',').map(c => c.trim()) : undefined;
            const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
            const exportData = await this.systemSettingsService.exportSettings(categories, requestingUserTenantId);
            const filename = `system-settings-export-${Date.now()}.json`;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(JSON.stringify(exportData, null, 2));
        }
        catch (error) {
            throw error;
        }
    }
    async importSettings(file, user, tenantId) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            const fileContent = await fs.readFile(file.path, 'utf-8');
            const importData = JSON.parse(fileContent);
            const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
            const result = await this.systemSettingsService.importSettings(importData, requestingUserTenantId);
            await fs.unlink(file.path);
            return result;
        }
        catch (error) {
            if (file && file.path) {
                try {
                    await fs.unlink(file.path);
                }
                catch (unlinkError) {
                }
            }
            throw error;
        }
    }
    createBackup(backupDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.createBackup(backupDto, requestingUserTenantId);
    }
    getBackups(user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.getBackups(requestingUserTenantId);
    }
    restoreFromBackup(restoreDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.restoreFromBackup(restoreDto, requestingUserTenantId);
    }
    deleteBackup(backupId, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.deleteBackup(backupId, requestingUserTenantId);
    }
    resetToDefaults(category, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.resetToDefaults(category, requestingUserTenantId);
    }
    findOne(id, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.findOne(id, requestingUserTenantId);
    }
    update(id, updateSystemSettingsDto, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.update(id, updateSystemSettingsDto, requestingUserTenantId);
    }
    toggleActive(id, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.toggleActive(id, requestingUserTenantId);
    }
    remove(id, user, tenantId) {
        const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
        return this.systemSettingsService.remove(id, requestingUserTenantId);
    }
    async getHealthStatus(user, tenantId) {
        try {
            const requestingUserTenantId = user.role === client_1.Role.SUPER_ADMIN ? undefined : tenantId;
            const stats = await this.systemSettingsService.getStatistics(requestingUserTenantId);
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                configurations: {
                    total: stats.totalConfigurations,
                    active: stats.activeConfigurations,
                    inactive: stats.inactiveConfigurations,
                },
                categories: stats.categoriesCount,
                lastUpdated: stats.recentlyUpdated[0]?.updatedAt || null,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }
    async validateSettings(settingsDto) {
        try {
            return {
                valid: true,
                message: 'Settings configuration is valid',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw error;
        }
    }
    getDefaultTemplate() {
        return {
            general: {
                appName: '',
                appDescription: '',
                appVersion: '1.0.0',
                environment: 'development',
                defaultLanguage: 'en',
                supportedLanguages: ['en'],
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm:ss',
                currency: 'USD',
                numberLocale: 'en-US',
            },
            security: {
                enableTwoFactor: false,
                forceHttps: true,
                sessionTimeout: 60,
                maxLoginAttempts: 5,
                lockoutDuration: 15,
                passwordMinLength: 8,
                passwordRequireSpecialChars: true,
                passwordRequireNumbers: true,
                passwordRequireUppercase: true,
                passwordExpirationDays: 90,
                allowUserRegistration: true,
                requireEmailVerification: true,
                enableRateLimiting: true,
                rateLimitPerMinute: 100,
                corsOrigins: [],
                jwtAccessExpiration: '15m',
                jwtRefreshExpiration: '7d',
            },
            email: {
                enabled: false,
                smtpHost: '',
                smtpPort: 587,
                smtpSecure: true,
                smtpUsername: '',
                smtpPassword: '',
                fromEmail: '',
                fromName: '',
                replyToEmail: '',
                queueEnabled: true,
                templatesEnabled: true,
            },
            fileUpload: {
                driver: 'local',
                maxFileSize: 10,
                maxFiles: 5,
                allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
                allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif'],
                imageQuality: 85,
                generateThumbnails: true,
                thumbnailSizes: ['150x150', '300x300'],
                localPath: './uploads',
            },
            cache: {
                driver: 'memory',
                defaultTtl: 3600,
                cacheUserSessions: true,
                cacheDatabaseQueries: false,
                cacheApiResponses: true,
                cachePageContent: true,
            },
            database: {
                driver: 'postgresql',
                maxConnections: 10,
                connectionTimeout: 60,
                enableLogging: false,
                enableSsl: false,
            },
            logging: {
                level: 'info',
                enableFileLogging: true,
                filePath: './logs',
                maxFileSize: 10,
                maxFiles: 5,
                enableRotation: true,
                enableDatabaseLogging: false,
                enableErrorTracking: true,
                format: 'combined',
            },
            performance: {
                enableCompression: true,
                compressionThreshold: 1024,
                enableRequestTimeout: true,
                requestTimeout: 30,
                maxRequestBodySize: 10,
                enableKeepAlive: true,
                keepAliveTimeout: 5,
            },
            features: {
                userRegistration: true,
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: false,
                analyticsTracking: true,
                errorReporting: true,
                maintenanceMode: false,
                apiDocumentation: true,
                healthChecks: true,
                metricsCollection: true,
                socialLogin: false,
                fileUploads: true,
                multiTenancy: true,
                backupSystem: true,
            },
        };
    }
};
exports.SystemSettingsController = SystemSettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new system settings configuration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'System settings configuration created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Settings configuration already exists for this category' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid settings data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.CreateSystemSettingsDto, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all system settings with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of system settings configurations' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, description: 'Filter by active status' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort by field' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort direction', enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.SystemSettingsQueryDto, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available settings categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of settings categories with counts' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get system settings statistics and overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings statistics' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get system settings by category' }),
    (0, swagger_1.ApiParam)({ name: 'category', description: 'Settings category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings for the specified category' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings category not found' }),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export system settings to JSON file' }),
    (0, swagger_1.ApiQuery)({ name: 'categories', required: false, description: 'Comma-separated list of categories to export' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings exported successfully' }),
    __param(0, (0, common_1.Query)('categories')),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "exportSettings", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Import system settings from JSON file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or data' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'settings-import-' + uniqueSuffix + path.extname(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
                cb(new common_1.BadRequestException('Only JSON files are allowed'), false);
            }
            else {
                cb(null, true);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "importSettings", null);
__decorate([
    (0, common_1.Post)('backup'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create configuration backup' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configuration backup created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No settings found to backup' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.ConfigurationBackupDto, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Get)('backups'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of configuration backups' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of configuration backups' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getBackups", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Restore configuration from backup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.ConfigurationRestoreDto, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "restoreFromBackup", null);
__decorate([
    (0, common_1.Delete)('backups/:backupId'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete configuration backup' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', description: 'Backup ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration backup deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    __param(0, (0, common_1.Param)('backupId')),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "deleteBackup", null);
__decorate([
    (0, common_1.Post)('reset-defaults'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reset settings to default values' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Specific category to reset (optional)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings reset to defaults successfully' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "resetToDefaults", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get system settings configuration by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings configuration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings configuration details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings configuration not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update system settings configuration' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings configuration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings configuration updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings configuration not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid settings data' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(3, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, system_settings_dto_1.UpdateSystemSettingsDto, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle active status of system settings configuration' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings configuration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings configuration status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings configuration not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete system settings configuration' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings configuration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings configuration deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settings configuration not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('health/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get system settings health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings health information' }),
    __param(0, (0, current_tenant_decorator_1.CurrentUser)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Validate system settings configuration without saving' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings configuration is valid' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Settings configuration is invalid' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.CreateSystemSettingsDto]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "validateSettings", null);
__decorate([
    (0, common_1.Get)('templates/defaults'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get default settings template for each category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default settings template' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getDefaultTemplate", null);
exports.SystemSettingsController = SystemSettingsController = __decorate([
    (0, swagger_1.ApiTags)('System Settings'),
    (0, common_1.Controller)('system-settings'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService])
], SystemSettingsController);
//# sourceMappingURL=system-settings.controller.js.map