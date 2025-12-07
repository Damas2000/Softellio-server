import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateSystemSettingsDto,
  UpdateSystemSettingsDto,
  SystemSettingsQueryDto,
  ConfigurationBackupDto,
  ConfigurationRestoreDto,
  EnvironmentType,
} from './dto/system-settings.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Create new system settings configuration
  async create(createDto: CreateSystemSettingsDto, tenantId?: number) {
    try {
      // Check if settings with the same category already exists for this tenant
      const existingSettings = await this.prisma.systemSettings.findFirst({
        where: {
          category: createDto.category,
          tenantId,
        },
      });

      if (existingSettings) {
        throw new ConflictException(
          `Settings configuration for category '${createDto.category}' already exists`,
        );
      }

      // Validate settings based on category
      this.validateSettingsByCategory(createDto);

      const systemSettings = await this.prisma.systemSettings.create({
        data: {
          ...createDto,
          tenantId,
          general: createDto.general ? JSON.stringify(createDto.general) : null,
          security: createDto.security ? JSON.stringify(createDto.security) : null,
          email: createDto.email ? JSON.stringify(createDto.email) : null,
          fileUpload: createDto.fileUpload ? JSON.stringify(createDto.fileUpload) : null,
          cache: createDto.cache ? JSON.stringify(createDto.cache) : null,
          database: createDto.database ? JSON.stringify(createDto.database) : null,
          logging: createDto.logging ? JSON.stringify(createDto.logging) : null,
          performance: createDto.performance ? JSON.stringify(createDto.performance) : null,
          features: createDto.features ? JSON.stringify(createDto.features) : null,
          customSettings: createDto.customSettings ? JSON.stringify(createDto.customSettings) : null,
        },
      });

      this.logger.log(
        `System settings configuration created: ${systemSettings.category} (ID: ${systemSettings.id})`,
      );

      return this.formatSettingsResponse(systemSettings);
    } catch (error) {
      this.logger.error('Failed to create system settings configuration', error.stack);
      throw error;
    }
  }

  // Get all system settings with filtering and pagination
  async findAll(query: SystemSettingsQueryDto, tenantId?: number) {
    try {
      const { page, limit, search, category, isActive, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.SystemSettingsWhereInput = {
        tenantId,
        ...(category && { category: { contains: category, mode: 'insensitive' } }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const orderBy: Prisma.SystemSettingsOrderByWithRelationInput = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder || 'asc';
      } else {
        orderBy.updatedAt = 'desc';
      }

      const [settings, total] = await Promise.all([
        this.prisma.systemSettings.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.systemSettings.count({ where }),
      ]);

      const formattedSettings = settings.map(setting => this.formatSettingsResponse(setting));

      return {
        data: formattedSettings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        meta: {
          totalActiveConfigurations: await this.prisma.systemSettings.count({
            where: { ...where, isActive: true },
          }),
          categoriesCount: await this.prisma.systemSettings.groupBy({
            by: ['category'],
            where,
          }).then(result => result.length),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch system settings', error.stack);
      throw error;
    }
  }

  // Get system settings by ID
  async findOne(id: number, tenantId?: number) {
    try {
      const settings = await this.prisma.systemSettings.findFirst({
        where: { id, tenantId },
      });

      if (!settings) {
        throw new NotFoundException('System settings configuration not found');
      }

      return this.formatSettingsResponse(settings);
    } catch (error) {
      this.logger.error(`Failed to fetch system settings with ID: ${id}`, error.stack);
      throw error;
    }
  }

  // Get system settings by category
  async findByCategory(category: string, tenantId?: number) {
    try {
      const settings = await this.prisma.systemSettings.findFirst({
        where: { category, tenantId },
      });

      if (!settings) {
        throw new NotFoundException(`System settings for category '${category}' not found`);
      }

      return this.formatSettingsResponse(settings);
    } catch (error) {
      this.logger.error(`Failed to fetch system settings for category: ${category}`, error.stack);
      throw error;
    }
  }

  // Update system settings
  async update(id: number, updateDto: UpdateSystemSettingsDto, tenantId?: number) {
    try {
      const existingSettings = await this.findOne(id, tenantId);

      // Validate updated settings
      if (updateDto.category || updateDto.general || updateDto.security || updateDto.email ||
          updateDto.fileUpload || updateDto.cache || updateDto.database || updateDto.logging ||
          updateDto.performance || updateDto.features) {
        const fullSettingsForValidation = {
          ...existingSettings,
          ...updateDto,
        };
        this.validateSettingsByCategory(fullSettingsForValidation);
      }

      const updatedSettings = await this.prisma.systemSettings.update({
        where: { id },
        data: {
          ...updateDto,
          general: updateDto.general ? JSON.stringify(updateDto.general) : undefined,
          security: updateDto.security ? JSON.stringify(updateDto.security) : undefined,
          email: updateDto.email ? JSON.stringify(updateDto.email) : undefined,
          fileUpload: updateDto.fileUpload ? JSON.stringify(updateDto.fileUpload) : undefined,
          cache: updateDto.cache ? JSON.stringify(updateDto.cache) : undefined,
          database: updateDto.database ? JSON.stringify(updateDto.database) : undefined,
          logging: updateDto.logging ? JSON.stringify(updateDto.logging) : undefined,
          performance: updateDto.performance ? JSON.stringify(updateDto.performance) : undefined,
          features: updateDto.features ? JSON.stringify(updateDto.features) : undefined,
          customSettings: updateDto.customSettings ? JSON.stringify(updateDto.customSettings) : undefined,
        },
      });

      this.logger.log(`System settings updated: ${updatedSettings.category} (ID: ${id})`);

      return this.formatSettingsResponse(updatedSettings);
    } catch (error) {
      this.logger.error(`Failed to update system settings with ID: ${id}`, error.stack);
      throw error;
    }
  }

  // Delete system settings
  async remove(id: number, tenantId?: number) {
    try {
      const existingSettings = await this.findOne(id, tenantId);

      await this.prisma.systemSettings.delete({
        where: { id },
      });

      this.logger.log(`System settings deleted: ${existingSettings.category} (ID: ${id})`);

      return { message: 'System settings configuration deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete system settings with ID: ${id}`, error.stack);
      throw error;
    }
  }

  // Get all available categories
  async getCategories(tenantId?: number) {
    try {
      const categories = await this.prisma.systemSettings.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      });

      return categories.map(cat => ({
        category: cat.category,
        count: cat._count.category,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch system settings categories', error.stack);
      throw error;
    }
  }

  // Get system settings statistics
  async getStatistics(tenantId?: number) {
    try {
      const [
        totalConfigurations,
        activeConfigurations,
        categoriesCount,
        recentlyUpdated,
      ] = await Promise.all([
        this.prisma.systemSettings.count({ where: { tenantId } }),
        this.prisma.systemSettings.count({ where: { tenantId, isActive: true } }),
        this.prisma.systemSettings.groupBy({
          by: ['category'],
          where: { tenantId },
        }).then(result => result.length),
        this.prisma.systemSettings.findMany({
          where: { tenantId },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            category: true,
            updatedAt: true,
          },
        }),
      ]);

      return {
        totalConfigurations,
        activeConfigurations,
        inactiveConfigurations: totalConfigurations - activeConfigurations,
        categoriesCount,
        recentlyUpdated,
      };
    } catch (error) {
      this.logger.error('Failed to fetch system settings statistics', error.stack);
      throw error;
    }
  }

  // Toggle active status
  async toggleActive(id: number, tenantId?: number) {
    try {
      const existingSettings = await this.findOne(id, tenantId);

      const updatedSettings = await this.prisma.systemSettings.update({
        where: { id },
        data: {
          isActive: !existingSettings.isActive,
        },
      });

      this.logger.log(
        `System settings status toggled: ${updatedSettings.category} (ID: ${id}) - Active: ${updatedSettings.isActive}`,
      );

      return this.formatSettingsResponse(updatedSettings);
    } catch (error) {
      this.logger.error(`Failed to toggle system settings status with ID: ${id}`, error.stack);
      throw error;
    }
  }

  // Create configuration backup
  async createBackup(backupDto: ConfigurationBackupDto, tenantId?: number) {
    try {
      const { name, description, includeAll, categories } = backupDto;

      // Build where condition based on backup scope
      const where: Prisma.SystemSettingsWhereInput = { tenantId };
      if (!includeAll && categories && categories.length > 0) {
        where.category = { in: categories };
      }

      // Get settings to backup
      const settingsToBackup = await this.prisma.systemSettings.findMany({
        where,
      });

      if (settingsToBackup.length === 0) {
        throw new BadRequestException('No settings found to backup');
      }

      // Create backup record
      const backup = await this.prisma.configurationBackup.create({
        data: {
          name,
          description,
          tenantId,
          settingsData: JSON.stringify(settingsToBackup),
          settingsCount: settingsToBackup.length,
          categories: categories || settingsToBackup.map(s => s.category).filter((v, i, a) => a.indexOf(v) === i),
        },
      });

      this.logger.log(`Configuration backup created: ${name} (ID: ${backup.id})`);

      return {
        id: backup.id,
        name: backup.name,
        description: backup.description,
        settingsCount: backup.settingsCount,
        categories: backup.categories,
        createdAt: backup.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to create configuration backup', error.stack);
      throw error;
    }
  }

  // Restore configuration from backup
  async restoreFromBackup(restoreDto: ConfigurationRestoreDto, tenantId?: number) {
    try {
      const { backupId, restoreAll, categories, createBackup } = restoreDto;

      // Get backup data
      const backup = await this.prisma.configurationBackup.findFirst({
        where: { id: backupId, tenantId },
      });

      if (!backup) {
        throw new NotFoundException('Configuration backup not found');
      }

      // Create backup before restore if requested
      if (createBackup) {
        await this.createBackup({
          name: `Pre-restore backup - ${new Date().toISOString()}`,
          description: `Automatic backup created before restoring from ${backup.name}`,
          includeAll: true,
        }, tenantId);
      }

      // Parse backup data
      const backupSettings = JSON.parse(backup.settingsData);

      // Filter settings to restore if specific categories are requested
      let settingsToRestore = backupSettings;
      if (!restoreAll && categories && categories.length > 0) {
        settingsToRestore = backupSettings.filter(setting => categories.includes(setting.category));
      }

      // Restore settings using transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const restoredSettings = [];

        for (const settingData of settingsToRestore) {
          // Check if setting exists
          const existingSetting = await tx.systemSettings.findFirst({
            where: {
              category: settingData.category,
              tenantId,
            },
          });

          if (existingSetting) {
            // Update existing setting
            const updated = await tx.systemSettings.update({
              where: { id: existingSetting.id },
              data: {
                name: settingData.name,
                description: settingData.description,
                general: settingData.general,
                security: settingData.security,
                email: settingData.email,
                fileUpload: settingData.fileUpload,
                cache: settingData.cache,
                database: settingData.database,
                logging: settingData.logging,
                performance: settingData.performance,
                features: settingData.features,
                customSettings: settingData.customSettings,
                isActive: settingData.isActive,
              },
            });
            restoredSettings.push(updated);
          } else {
            // Create new setting
            const created = await tx.systemSettings.create({
              data: {
                ...settingData,
                id: undefined, // Let database generate new ID
                tenantId,
                createdAt: undefined,
                updatedAt: undefined,
              },
            });
            restoredSettings.push(created);
          }
        }

        return restoredSettings;
      });

      this.logger.log(`Configuration restored from backup: ${backup.name} (${result.length} settings)`);

      return {
        message: 'Configuration restored successfully',
        restoredCount: result.length,
        categories: [...new Set(result.map(s => s.category))],
      };
    } catch (error) {
      this.logger.error('Failed to restore configuration from backup', error.stack);
      throw error;
    }
  }

  // Get backup list
  async getBackups(tenantId?: number) {
    try {
      const backups = await this.prisma.configurationBackup.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          settingsCount: true,
          categories: true,
          createdAt: true,
        },
      });

      return backups;
    } catch (error) {
      this.logger.error('Failed to fetch configuration backups', error.stack);
      throw error;
    }
  }

  // Delete backup
  async deleteBackup(backupId: string, tenantId?: number) {
    try {
      const backup = await this.prisma.configurationBackup.findFirst({
        where: { id: backupId, tenantId },
      });

      if (!backup) {
        throw new NotFoundException('Configuration backup not found');
      }

      await this.prisma.configurationBackup.delete({
        where: { id: backupId },
      });

      this.logger.log(`Configuration backup deleted: ${backup.name} (ID: ${backupId})`);

      return { message: 'Configuration backup deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete configuration backup', error.stack);
      throw error;
    }
  }

  // Export settings to file
  async exportSettings(categories?: string[], tenantId?: number) {
    try {
      const where: Prisma.SystemSettingsWhereInput = { tenantId };
      if (categories && categories.length > 0) {
        where.category = { in: categories };
      }

      const settings = await this.prisma.systemSettings.findMany({ where });

      const exportData = {
        exportDate: new Date().toISOString(),
        tenantId,
        categories: categories || 'all',
        settingsCount: settings.length,
        settings: settings.map(setting => this.formatSettingsResponse(setting)),
      };

      return exportData;
    } catch (error) {
      this.logger.error('Failed to export settings', error.stack);
      throw error;
    }
  }

  // Import settings from file
  async importSettings(importData: any, tenantId?: number) {
    try {
      const { settings } = importData;

      if (!settings || !Array.isArray(settings)) {
        throw new BadRequestException('Invalid import data format');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const importedSettings = [];

        for (const settingData of settings) {
          try {
            // Check if setting exists
            const existingSetting = await tx.systemSettings.findFirst({
              where: {
                category: settingData.category,
                tenantId,
              },
            });

            if (existingSetting) {
              // Update existing setting
              const updated = await tx.systemSettings.update({
                where: { id: existingSetting.id },
                data: {
                  name: settingData.name,
                  description: settingData.description,
                  general: settingData.general ? JSON.stringify(settingData.general) : null,
                  security: settingData.security ? JSON.stringify(settingData.security) : null,
                  email: settingData.email ? JSON.stringify(settingData.email) : null,
                  fileUpload: settingData.fileUpload ? JSON.stringify(settingData.fileUpload) : null,
                  cache: settingData.cache ? JSON.stringify(settingData.cache) : null,
                  database: settingData.database ? JSON.stringify(settingData.database) : null,
                  logging: settingData.logging ? JSON.stringify(settingData.logging) : null,
                  performance: settingData.performance ? JSON.stringify(settingData.performance) : null,
                  features: settingData.features ? JSON.stringify(settingData.features) : null,
                  customSettings: settingData.customSettings ? JSON.stringify(settingData.customSettings) : null,
                  isActive: settingData.isActive,
                },
              });
              importedSettings.push({ action: 'updated', setting: updated });
            } else {
              // Create new setting
              const created = await tx.systemSettings.create({
                data: {
                  category: settingData.category,
                  name: settingData.name,
                  description: settingData.description,
                  tenantId,
                  general: settingData.general ? JSON.stringify(settingData.general) : null,
                  security: settingData.security ? JSON.stringify(settingData.security) : null,
                  email: settingData.email ? JSON.stringify(settingData.email) : null,
                  fileUpload: settingData.fileUpload ? JSON.stringify(settingData.fileUpload) : null,
                  cache: settingData.cache ? JSON.stringify(settingData.cache) : null,
                  database: settingData.database ? JSON.stringify(settingData.database) : null,
                  logging: settingData.logging ? JSON.stringify(settingData.logging) : null,
                  performance: settingData.performance ? JSON.stringify(settingData.performance) : null,
                  features: settingData.features ? JSON.stringify(settingData.features) : null,
                  customSettings: settingData.customSettings ? JSON.stringify(settingData.customSettings) : null,
                  isActive: settingData.isActive !== undefined ? settingData.isActive : true,
                },
              });
              importedSettings.push({ action: 'created', setting: created });
            }
          } catch (itemError) {
            this.logger.warn(`Failed to import setting ${settingData.category}`, itemError.stack);
          }
        }

        return importedSettings;
      });

      this.logger.log(`Settings imported: ${result.length} configurations processed`);

      return {
        message: 'Settings imported successfully',
        processed: result.length,
        created: result.filter(r => r.action === 'created').length,
        updated: result.filter(r => r.action === 'updated').length,
      };
    } catch (error) {
      this.logger.error('Failed to import settings', error.stack);
      throw error;
    }
  }

  // Reset settings to default
  async resetToDefaults(category?: string, tenantId?: number) {
    try {
      const where: Prisma.SystemSettingsWhereInput = { tenantId };
      if (category) {
        where.category = category;
      }

      // Get current settings that will be reset
      const currentSettings = await this.prisma.systemSettings.findMany({ where });

      // Create backup before reset
      if (currentSettings.length > 0) {
        await this.createBackup({
          name: `Pre-reset backup - ${new Date().toISOString()}`,
          description: `Automatic backup created before resetting ${category ? `category: ${category}` : 'all settings'}`,
          includeAll: !category,
          categories: category ? [category] : undefined,
        }, tenantId);
      }

      // Delete existing settings
      await this.prisma.systemSettings.deleteMany({ where });

      // Create default settings
      const defaultSettings = this.getDefaultSettings();
      const settingsToCreate = category ?
        defaultSettings.filter(s => s.category === category) :
        defaultSettings;

      const createdSettings = [];
      for (const defaultSetting of settingsToCreate) {
        const created = await this.create(defaultSetting, tenantId);
        createdSettings.push(created);
      }

      this.logger.log(`Settings reset to defaults: ${category || 'all categories'} (${createdSettings.length} configurations)`);

      return {
        message: 'Settings reset to defaults successfully',
        resetCount: createdSettings.length,
        categories: [...new Set(createdSettings.map(s => s.category))],
      };
    } catch (error) {
      this.logger.error('Failed to reset settings to defaults', error.stack);
      throw error;
    }
  }

  // Private helper methods

  private formatSettingsResponse(settings: any) {
    return {
      id: settings.id,
      category: settings.category,
      name: settings.name,
      description: settings.description,
      general: settings.general ? JSON.parse(settings.general) : null,
      security: settings.security ? JSON.parse(settings.security) : null,
      email: settings.email ? JSON.parse(settings.email) : null,
      fileUpload: settings.fileUpload ? JSON.parse(settings.fileUpload) : null,
      cache: settings.cache ? JSON.parse(settings.cache) : null,
      database: settings.database ? JSON.parse(settings.database) : null,
      logging: settings.logging ? JSON.parse(settings.logging) : null,
      performance: settings.performance ? JSON.parse(settings.performance) : null,
      features: settings.features ? JSON.parse(settings.features) : null,
      customSettings: settings.customSettings ? JSON.parse(settings.customSettings) : null,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private validateSettingsByCategory(settings: any) {
    // Add category-specific validation logic here
    if (settings.category === 'security' && settings.security) {
      if (settings.security.passwordMinLength && settings.security.passwordMinLength < 8) {
        throw new BadRequestException('Password minimum length must be at least 8 characters');
      }
    }

    if (settings.category === 'email' && settings.email) {
      if (settings.email.enabled && !settings.email.smtpHost) {
        throw new BadRequestException('SMTP host is required when email service is enabled');
      }
    }

    // Add more validation rules as needed
  }

  private getDefaultSettings(): CreateSystemSettingsDto[] {
    return [
      {
        category: 'general',
        name: 'General Application Settings',
        description: 'Basic application configuration settings',
        general: {
          appName: 'Softellio CMS',
          appDescription: 'Professional Content Management System',
          appVersion: '1.0.0',
          environment: EnvironmentType.DEVELOPMENT,
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'tr'],
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm:ss',
          currency: 'USD',
          numberLocale: 'en-US',
        },
        isActive: true,
      },
      {
        category: 'security',
        name: 'Security Configuration',
        description: 'Application security and authentication settings',
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
          corsOrigins: ['http://localhost:3000', 'http://localhost:4200'],
          jwtAccessExpiration: '15m',
          jwtRefreshExpiration: '7d',
        },
        isActive: true,
      },
      // Add more default configurations as needed
    ];
  }
}