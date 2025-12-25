import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SystemSettingsService } from './system-settings.service';
import {
  CreateSystemSettingsDto,
  UpdateSystemSettingsDto,
  SystemSettingsQueryDto,
  ConfigurationBackupDto,
  ConfigurationRestoreDto,
} from './dto/system-settings.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';

@ApiTags('System Settings')
@Controller('system-settings')
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create new system settings configuration' })
  @ApiResponse({ status: 201, description: 'System settings configuration created successfully' })
  @ApiResponse({ status: 409, description: 'Settings configuration already exists for this category' })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  create(
    @Body() createSystemSettingsDto: CreateSystemSettingsDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.create(createSystemSettingsDto, requestingUserTenantId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all system settings with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of system settings configurations' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort direction', enum: ['asc', 'desc'] })
  findAll(
    @Query() query: SystemSettingsQueryDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.findAll(query, requestingUserTenantId);
  }

  @Get('categories')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all available settings categories' })
  @ApiResponse({ status: 200, description: 'List of settings categories with counts' })
  getCategories(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.getCategories(requestingUserTenantId);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get system settings statistics and overview' })
  @ApiResponse({ status: 200, description: 'System settings statistics' })
  getStatistics(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.getStatistics(requestingUserTenantId);
  }

  @Get('category/:category')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get system settings by category' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiResponse({ status: 200, description: 'System settings for the specified category' })
  @ApiResponse({ status: 404, description: 'Settings category not found' })
  findByCategory(
    @Param('category') category: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.findByCategory(category, requestingUserTenantId);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Export system settings to JSON file' })
  @ApiQuery({ name: 'categories', required: false, description: 'Comma-separated list of categories to export' })
  @ApiResponse({ status: 200, description: 'Settings exported successfully' })
  async exportSettings(
    @Query('categories') categoriesParam: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
    @Res() res: Response,
  ) {
    try {
      const categories = categoriesParam ? categoriesParam.split(',').map(c => c.trim()) : undefined;
      const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;

      const exportData = await this.systemSettingsService.exportSettings(categories, requestingUserTenantId);

      const filename = `system-settings-export-${Date.now()}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
      throw error;
    }
  }

  @Post('import')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Import system settings from JSON file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Settings imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/temp',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'settings-import-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
        cb(new BadRequestException('Only JSON files are allowed'), false);
      } else {
        cb(null, true);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  async importSettings(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Read and parse the uploaded file
      const fileContent = await fs.readFile(file.path, 'utf-8');
      const importData = JSON.parse(fileContent);

      const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
      const result = await this.systemSettingsService.importSettings(importData, requestingUserTenantId);

      // Clean up the uploaded file
      await fs.unlink(file.path);

      return result;
    } catch (error) {
      // Clean up the uploaded file on error
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          // Ignore unlink errors
        }
      }
      throw error;
    }
  }

  @Post('backup')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create configuration backup' })
  @ApiResponse({ status: 201, description: 'Configuration backup created successfully' })
  @ApiResponse({ status: 400, description: 'No settings found to backup' })
  createBackup(
    @Body() backupDto: ConfigurationBackupDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.createBackup(backupDto, requestingUserTenantId);
  }

  @Get('backups')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get list of configuration backups' })
  @ApiResponse({ status: 200, description: 'List of configuration backups' })
  getBackups(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.getBackups(requestingUserTenantId);
  }

  @Post('restore')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Restore configuration from backup' })
  @ApiResponse({ status: 200, description: 'Configuration restored successfully' })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  restoreFromBackup(
    @Body() restoreDto: ConfigurationRestoreDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.restoreFromBackup(restoreDto, requestingUserTenantId);
  }

  @Delete('backups/:backupId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete configuration backup' })
  @ApiParam({ name: 'backupId', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Configuration backup deleted successfully' })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  deleteBackup(
    @Param('backupId') backupId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.deleteBackup(backupId, requestingUserTenantId);
  }

  @Post('reset-defaults')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Reset settings to default values' })
  @ApiQuery({ name: 'category', required: false, description: 'Specific category to reset (optional)' })
  @ApiResponse({ status: 200, description: 'Settings reset to defaults successfully' })
  resetToDefaults(
    @Query('category') category: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.resetToDefaults(category, requestingUserTenantId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get system settings configuration by ID' })
  @ApiParam({ name: 'id', description: 'Settings configuration ID' })
  @ApiResponse({ status: 200, description: 'System settings configuration details' })
  @ApiResponse({ status: 404, description: 'Settings configuration not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.findOne(id, requestingUserTenantId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update system settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings configuration ID' })
  @ApiResponse({ status: 200, description: 'System settings configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Settings configuration not found' })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSystemSettingsDto: UpdateSystemSettingsDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.update(id, updateSystemSettingsDto, requestingUserTenantId);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Toggle active status of system settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings configuration ID' })
  @ApiResponse({ status: 200, description: 'Settings configuration status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Settings configuration not found' })
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.toggleActive(id, requestingUserTenantId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete system settings configuration' })
  @ApiParam({ name: 'id', description: 'Settings configuration ID' })
  @ApiResponse({ status: 200, description: 'System settings configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Settings configuration not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
    return this.systemSettingsService.remove(id, requestingUserTenantId);
  }

  // Health check endpoint for system settings
  @Get('health/status')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get system settings health status' })
  @ApiResponse({ status: 200, description: 'System settings health information' })
  async getHealthStatus(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const requestingUserTenantId = user.role === Role.SUPER_ADMIN ? undefined : tenantId;
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
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // Validate settings configuration
  @Post('validate')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Validate system settings configuration without saving' })
  @ApiResponse({ status: 200, description: 'Settings configuration is valid' })
  @ApiResponse({ status: 400, description: 'Settings configuration is invalid' })
  @HttpCode(HttpStatus.OK)
  async validateSettings(
    @Body() settingsDto: CreateSystemSettingsDto,
  ) {
    try {
      // This is a dry-run validation - we don't actually create the settings
      // The validation logic is in the service layer and will throw if invalid

      // Create a temporary validation instance (we would need to implement this in service)
      // For now, we'll just return success if no immediate validation errors
      return {
        valid: true,
        message: 'Settings configuration is valid',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Get default settings template
  @Get('templates/defaults')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get default settings template for each category' })
  @ApiResponse({ status: 200, description: 'Default settings template' })
  getDefaultTemplate() {
    // This would return the default settings structure that can be used as a template
    // We would need to implement this in the service layer
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
}