import { PrismaService } from '../config/prisma.service';
import { CreateSystemSettingsDto, UpdateSystemSettingsDto, SystemSettingsQueryDto, ConfigurationBackupDto, ConfigurationRestoreDto } from './dto/system-settings.dto';
import { ConfigService } from '@nestjs/config';
export declare class SystemSettingsService {
    private prisma;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(createDto: CreateSystemSettingsDto, tenantId?: number): Promise<{
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
    findAll(query: SystemSettingsQueryDto, tenantId?: number): Promise<{
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
    findOne(id: number, tenantId?: number): Promise<{
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
    findByCategory(category: string, tenantId?: number): Promise<{
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
    update(id: number, updateDto: UpdateSystemSettingsDto, tenantId?: number): Promise<{
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
    remove(id: number, tenantId?: number): Promise<{
        message: string;
    }>;
    getCategories(tenantId?: number): Promise<{
        category: string;
        count: number;
    }[]>;
    getStatistics(tenantId?: number): Promise<{
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
    toggleActive(id: number, tenantId?: number): Promise<{
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
    createBackup(backupDto: ConfigurationBackupDto, tenantId?: number): Promise<{
        id: string;
        name: string;
        description: string;
        settingsCount: number;
        categories: string[];
        createdAt: Date;
    }>;
    restoreFromBackup(restoreDto: ConfigurationRestoreDto, tenantId?: number): Promise<{
        message: string;
        restoredCount: number;
        categories: any[];
    }>;
    getBackups(tenantId?: number): Promise<{
        description: string;
        id: string;
        name: string;
        createdAt: Date;
        categories: string[];
        settingsCount: number;
    }[]>;
    deleteBackup(backupId: string, tenantId?: number): Promise<{
        message: string;
    }>;
    exportSettings(categories?: string[], tenantId?: number): Promise<{
        exportDate: string;
        tenantId: number;
        categories: string | string[];
        settingsCount: number;
        settings: {
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
    }>;
    importSettings(importData: any, tenantId?: number): Promise<{
        message: string;
        processed: number;
        created: number;
        updated: number;
    }>;
    resetToDefaults(category?: string, tenantId?: number): Promise<{
        message: string;
        resetCount: number;
        categories: any[];
    }>;
    private formatSettingsResponse;
    private validateSettingsByCategory;
    private getDefaultSettings;
}
