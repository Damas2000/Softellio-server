import { Response } from 'express';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingsDto, UpdateSystemSettingsDto, SystemSettingsQueryDto, ConfigurationBackupDto, ConfigurationRestoreDto } from './dto/system-settings.dto';
export declare class SystemSettingsController {
    private readonly systemSettingsService;
    constructor(systemSettingsService: SystemSettingsService);
    create(createSystemSettingsDto: CreateSystemSettingsDto, user: any, tenantId: number): Promise<{
        id: any;
        category: any;
        name: any;
        description: any;
        general: any;
        security: any;
        email: any;
        fileUpload: any;
        cache: any;
        database: any;
        logging: any;
        performance: any;
        features: any;
        customSettings: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findAll(query: SystemSettingsQueryDto, user: any, tenantId: number): Promise<{
        data: {
            id: any;
            category: any;
            name: any;
            description: any;
            general: any;
            security: any;
            email: any;
            fileUpload: any;
            cache: any;
            database: any;
            logging: any;
            performance: any;
            features: any;
            customSettings: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        meta: {
            totalActiveConfigurations: number;
            categoriesCount: number;
        };
    }>;
    getCategories(user: any, tenantId: number): Promise<{
        category: string;
        count: number;
    }[]>;
    getStatistics(user: any, tenantId: number): Promise<{
        totalConfigurations: number;
        activeConfigurations: number;
        inactiveConfigurations: number;
        categoriesCount: number;
        recentlyUpdated: {
            id: number;
            name: string;
            updatedAt: Date;
            category: string;
        }[];
    }>;
    findByCategory(category: string, user: any, tenantId: number): Promise<{
        id: any;
        category: any;
        name: any;
        description: any;
        general: any;
        security: any;
        email: any;
        fileUpload: any;
        cache: any;
        database: any;
        logging: any;
        performance: any;
        features: any;
        customSettings: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    exportSettings(categoriesParam: string, user: any, tenantId: number, res: Response): Promise<void>;
    importSettings(file: Express.Multer.File, user: any, tenantId: number): Promise<{
        message: string;
        processed: number;
        created: number;
        updated: number;
    }>;
    createBackup(backupDto: ConfigurationBackupDto, user: any, tenantId: number): Promise<{
        id: string;
        name: string;
        description: string;
        settingsCount: number;
        categories: string[];
        createdAt: Date;
    }>;
    getBackups(user: any, tenantId: number): Promise<{
        description: string;
        id: string;
        name: string;
        createdAt: Date;
        categories: string[];
        settingsCount: number;
    }[]>;
    restoreFromBackup(restoreDto: ConfigurationRestoreDto, user: any, tenantId: number): Promise<{
        message: string;
        restoredCount: number;
        categories: any[];
    }>;
    deleteBackup(backupId: string, user: any, tenantId: number): Promise<{
        message: string;
    }>;
    resetToDefaults(category: string, user: any, tenantId: number): Promise<{
        message: string;
        resetCount: number;
        categories: any[];
    }>;
    findOne(id: number, user: any, tenantId: number): Promise<{
        id: any;
        category: any;
        name: any;
        description: any;
        general: any;
        security: any;
        email: any;
        fileUpload: any;
        cache: any;
        database: any;
        logging: any;
        performance: any;
        features: any;
        customSettings: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: number, updateSystemSettingsDto: UpdateSystemSettingsDto, user: any, tenantId: number): Promise<{
        id: any;
        category: any;
        name: any;
        description: any;
        general: any;
        security: any;
        email: any;
        fileUpload: any;
        cache: any;
        database: any;
        logging: any;
        performance: any;
        features: any;
        customSettings: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    toggleActive(id: number, user: any, tenantId: number): Promise<{
        id: any;
        category: any;
        name: any;
        description: any;
        general: any;
        security: any;
        email: any;
        fileUpload: any;
        cache: any;
        database: any;
        logging: any;
        performance: any;
        features: any;
        customSettings: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(id: number, user: any, tenantId: number): Promise<{
        message: string;
    }>;
    getHealthStatus(user: any, tenantId: number): Promise<{
        status: string;
        timestamp: string;
        configurations: {
            total: number;
            active: number;
            inactive: number;
        };
        categories: number;
        lastUpdated: Date;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        error: any;
        configurations?: undefined;
        categories?: undefined;
        lastUpdated?: undefined;
    }>;
    validateSettings(settingsDto: CreateSystemSettingsDto): Promise<{
        valid: boolean;
        message: string;
        timestamp: string;
    }>;
    getDefaultTemplate(): {
        general: {
            appName: string;
            appDescription: string;
            appVersion: string;
            environment: string;
            defaultLanguage: string;
            supportedLanguages: string[];
            timezone: string;
            dateFormat: string;
            timeFormat: string;
            currency: string;
            numberLocale: string;
        };
        security: {
            enableTwoFactor: boolean;
            forceHttps: boolean;
            sessionTimeout: number;
            maxLoginAttempts: number;
            lockoutDuration: number;
            passwordMinLength: number;
            passwordRequireSpecialChars: boolean;
            passwordRequireNumbers: boolean;
            passwordRequireUppercase: boolean;
            passwordExpirationDays: number;
            allowUserRegistration: boolean;
            requireEmailVerification: boolean;
            enableRateLimiting: boolean;
            rateLimitPerMinute: number;
            corsOrigins: any[];
            jwtAccessExpiration: string;
            jwtRefreshExpiration: string;
        };
        email: {
            enabled: boolean;
            smtpHost: string;
            smtpPort: number;
            smtpSecure: boolean;
            smtpUsername: string;
            smtpPassword: string;
            fromEmail: string;
            fromName: string;
            replyToEmail: string;
            queueEnabled: boolean;
            templatesEnabled: boolean;
        };
        fileUpload: {
            driver: string;
            maxFileSize: number;
            maxFiles: number;
            allowedFileTypes: string[];
            allowedImageTypes: string[];
            imageQuality: number;
            generateThumbnails: boolean;
            thumbnailSizes: string[];
            localPath: string;
        };
        cache: {
            driver: string;
            defaultTtl: number;
            cacheUserSessions: boolean;
            cacheDatabaseQueries: boolean;
            cacheApiResponses: boolean;
            cachePageContent: boolean;
        };
        database: {
            driver: string;
            maxConnections: number;
            connectionTimeout: number;
            enableLogging: boolean;
            enableSsl: boolean;
        };
        logging: {
            level: string;
            enableFileLogging: boolean;
            filePath: string;
            maxFileSize: number;
            maxFiles: number;
            enableRotation: boolean;
            enableDatabaseLogging: boolean;
            enableErrorTracking: boolean;
            format: string;
        };
        performance: {
            enableCompression: boolean;
            compressionThreshold: number;
            enableRequestTimeout: boolean;
            requestTimeout: number;
            maxRequestBodySize: number;
            enableKeepAlive: boolean;
            keepAliveTimeout: number;
        };
        features: {
            userRegistration: boolean;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            analyticsTracking: boolean;
            errorReporting: boolean;
            maintenanceMode: boolean;
            apiDocumentation: boolean;
            healthChecks: boolean;
            metricsCollection: boolean;
            socialLogin: boolean;
            fileUploads: boolean;
            multiTenancy: boolean;
            backupSystem: boolean;
        };
    };
}
