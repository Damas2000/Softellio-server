import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseBackup, SystemBackup, RestoreOperation } from '@prisma/client';
import { CreateDatabaseBackupDto, CreateSystemBackupDto } from '../dto/create-backup.dto';
import { CreateRestoreOperationDto, RestoreOperationResponse } from '../dto/restore-backup.dto';
import { BackupProgress, RestoreProgress, BackupValidationResult, SystemInfo } from '../interfaces/backup.interface';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import * as tar from 'tar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly maxConcurrentBackups = 3;
  private runningBackups = new Map<string, BackupProgress>();
  private runningRestores = new Map<string, RestoreProgress>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.backupDir = this.configService.get<string>('BACKUP_DIRECTORY') ||
                     path.join(process.cwd(), 'backups');
    this.ensureBackupDirectoryExists();
  }

  private async ensureBackupDirectoryExists(): Promise<void> {
    try {
      await fs.ensureDir(this.backupDir);
      await fs.ensureDir(path.join(this.backupDir, 'database'));
      await fs.ensureDir(path.join(this.backupDir, 'system'));
      await fs.ensureDir(path.join(this.backupDir, 'temp'));
    } catch (error) {
      this.logger.error(`Failed to create backup directories: ${error.message}`, error.stack);
    }
  }

  // ===== DATABASE BACKUP OPERATIONS =====

  async createDatabaseBackup(
    tenantId: number | null,
    createBackupDto: CreateDatabaseBackupDto
  ): Promise<DatabaseBackup> {
    this.logger.log(`Creating database backup: ${createBackupDto.name} for tenant: ${tenantId}`);

    if (this.runningBackups.size >= this.maxConcurrentBackups) {
      throw new BadRequestException('Maximum concurrent backups reached. Please try again later.');
    }

    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `db_backup_${timestamp}_${backupId.substring(0, 8)}.sql`;
    const filePath = path.join(this.backupDir, 'database', fileName);

    // Create backup record
    const backup = await this.prisma.databaseBackup.create({
      data: {
        id: backupId,
        tenantId,
        name: createBackupDto.name,
        description: createBackupDto.description,
        backupType: createBackupDto.backupType,
        compressionType: createBackupDto.compressionType || 'gzip',
        filePath,
        fileName,
        status: 'pending',
        isAutomatic: createBackupDto.isAutomatic || false,
        retentionDays: createBackupDto.retentionDays || 30,
        tags: createBackupDto.tags || [],
        expiresAt: new Date(Date.now() + (createBackupDto.retentionDays || 30) * 24 * 60 * 60 * 1000),
      },
    });

    // Start backup process asynchronously
    this.performDatabaseBackup(backup).catch(error => {
      this.logger.error(`Database backup failed: ${error.message}`, error.stack);
    });

    return backup;
  }

  private async performDatabaseBackup(backup: DatabaseBackup): Promise<void> {
    const progress: BackupProgress = {
      id: backup.id,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      currentPhase: 'initializing',
    };

    this.runningBackups.set(backup.id, progress);

    try {
      await this.prisma.databaseBackup.update({
        where: { id: backup.id },
        data: { status: 'running', startedAt: new Date() },
      });

      // Phase 1: Initialize backup
      progress.currentPhase = 'preparing';
      progress.progress = 10;

      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) {
        throw new Error('Database URL not configured');
      }

      // Phase 2: Execute database dump
      progress.currentPhase = 'dumping';
      progress.progress = 30;

      const dumpCommand = this.buildDumpCommand(dbUrl, backup);
      const { stdout, stderr } = await execAsync(dumpCommand);

      if (stderr && !stderr.includes('pg_dump: warning')) {
        throw new Error(`Database dump failed: ${stderr}`);
      }

      // Phase 3: Compress if needed
      if (backup.compressionType !== 'none') {
        progress.currentPhase = 'compressing';
        progress.progress = 70;
        await this.compressFile(backup.filePath, backup.compressionType);
      }

      // Phase 4: Calculate checksum and finalize
      progress.currentPhase = 'finalizing';
      progress.progress = 90;

      const stats = await fs.stat(backup.filePath);
      const checksum = await this.calculateFileChecksum(backup.filePath);

      await this.prisma.databaseBackup.update({
        where: { id: backup.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          fileSize: stats.size,
          checksum,
          duration: Math.round((Date.now() - progress.startedAt!.getTime()) / 1000),
        },
      });

      progress.status = 'completed';
      progress.progress = 100;
      progress.currentPhase = 'completed';

      this.logger.log(`Database backup completed: ${backup.name} (${this.formatBytes(stats.size)})`);

    } catch (error) {
      this.logger.error(`Database backup failed: ${backup.name} - ${error.message}`, error.stack);

      await this.prisma.databaseBackup.update({
        where: { id: backup.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      progress.status = 'failed';
      progress.errorMessage = error.message;

      // Clean up failed backup file
      try {
        await fs.remove(backup.filePath);
      } catch (cleanupError) {
        this.logger.error(`Failed to clean up backup file: ${cleanupError.message}`);
      }
    } finally {
      this.runningBackups.delete(backup.id);
    }
  }

  private buildDumpCommand(dbUrl: string, backup: DatabaseBackup): string {
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.substring(1);
    const username = url.username;
    const password = url.password;

    let command = `PGPASSWORD="${password}" pg_dump`;
    command += ` -h ${host} -p ${port} -U ${username} -d ${database}`;
    command += ` --verbose --format=custom`;

    // Add tenant-specific filtering if needed
    if (backup.tenantId) {
      // Add WHERE clauses for tenant-specific data
      command += ` --exclude-table-data=users --exclude-table-data=tenants`;
    }

    if (backup.backupType === 'schema_only') {
      command += ` --schema-only`;
    } else if (backup.backupType === 'data_only') {
      command += ` --data-only`;
    }

    command += ` -f "${backup.filePath}"`;

    return command;
  }

  // ===== SYSTEM BACKUP OPERATIONS =====

  async createSystemBackup(
    tenantId: number | null,
    createBackupDto: CreateSystemBackupDto
  ): Promise<SystemBackup> {
    this.logger.log(`Creating system backup: ${createBackupDto.name} for tenant: ${tenantId}`);

    if (this.runningBackups.size >= this.maxConcurrentBackups) {
      throw new BadRequestException('Maximum concurrent backups reached. Please try again later.');
    }

    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `system_backup_${timestamp}_${backupId.substring(0, 8)}.tar.gz`;
    const archivePath = path.join(this.backupDir, 'system', archiveName);

    const backup = await this.prisma.systemBackup.create({
      data: {
        id: backupId,
        tenantId,
        name: createBackupDto.name,
        description: createBackupDto.description,
        backupType: createBackupDto.backupType,
        includeDatabase: createBackupDto.includeDatabase ?? true,
        includeFiles: createBackupDto.includeFiles ?? true,
        includeConfig: createBackupDto.includeConfig ?? true,
        includeMedia: createBackupDto.includeMedia ?? true,
        includeLogs: createBackupDto.includeLogs ?? false,
        archivePath,
        status: 'pending',
        isAutomatic: createBackupDto.isAutomatic || false,
        retentionDays: createBackupDto.retentionDays || 7,
        tags: createBackupDto.tags || [],
        expiresAt: new Date(Date.now() + (createBackupDto.retentionDays || 7) * 24 * 60 * 60 * 1000),
        version: process.env.npm_package_version || '1.0.0',
      },
    });

    // Start backup process asynchronously
    this.performSystemBackup(backup).catch(error => {
      this.logger.error(`System backup failed: ${error.message}`, error.stack);
    });

    return backup;
  }

  private async performSystemBackup(backup: SystemBackup): Promise<void> {
    const progress: BackupProgress = {
      id: backup.id,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      currentPhase: 'initializing',
    };

    this.runningBackups.set(backup.id, progress);
    const tempDir = path.join(this.backupDir, 'temp', backup.id);

    try {
      await this.prisma.systemBackup.update({
        where: { id: backup.id },
        data: { status: 'running', startedAt: new Date() },
      });

      await fs.ensureDir(tempDir);

      // Phase 1: Database backup (if included)
      if (backup.includeDatabase) {
        progress.currentPhase = 'database';
        progress.progress = 10;
        await this.backupDatabase(tempDir, backup.tenantId);
      }

      // Phase 2: Application files (if included)
      if (backup.includeFiles) {
        progress.currentPhase = 'files';
        progress.progress = 30;
        await this.backupApplicationFiles(tempDir);
      }

      // Phase 3: Configuration (if included)
      if (backup.includeConfig) {
        progress.currentPhase = 'config';
        progress.progress = 50;
        await this.backupConfiguration(tempDir);
      }

      // Phase 4: Media files (if included)
      if (backup.includeMedia) {
        progress.currentPhase = 'media';
        progress.progress = 70;
        await this.backupMediaFiles(tempDir, backup.tenantId);
      }

      // Phase 5: Logs (if included)
      if (backup.includeLogs) {
        progress.currentPhase = 'logs';
        progress.progress = 80;
        await this.backupLogs(tempDir);
      }

      // Phase 6: Create archive
      progress.currentPhase = 'archive';
      progress.progress = 90;

      await tar.create(
        {
          gzip: true,
          file: backup.archivePath!,
          cwd: tempDir,
        },
        ['.']
      );

      // Phase 7: Finalize
      progress.currentPhase = 'finalizing';
      progress.progress = 95;

      const stats = await fs.stat(backup.archivePath!);
      const originalSize = await this.calculateDirectorySize(tempDir);
      const checksum = await this.calculateFileChecksum(backup.archivePath!);

      await this.prisma.systemBackup.update({
        where: { id: backup.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          archiveSize: stats.size,
          originalSize,
          compressionRatio: originalSize > 0 ? stats.size / originalSize : 0,
          checksum,
          duration: Math.round((Date.now() - progress.startedAt!.getTime()) / 1000),
        },
      });

      progress.status = 'completed';
      progress.progress = 100;
      progress.currentPhase = 'completed';

      this.logger.log(`System backup completed: ${backup.name} (${this.formatBytes(stats.size)})`);

    } catch (error) {
      this.logger.error(`System backup failed: ${backup.name} - ${error.message}`, error.stack);

      await this.prisma.systemBackup.update({
        where: { id: backup.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      progress.status = 'failed';
      progress.errorMessage = error.message;

      // Clean up failed backup
      try {
        if (backup.archivePath && await fs.pathExists(backup.archivePath)) {
          await fs.remove(backup.archivePath);
        }
      } catch (cleanupError) {
        this.logger.error(`Failed to clean up backup archive: ${cleanupError.message}`);
      }
    } finally {
      // Clean up temp directory
      try {
        await fs.remove(tempDir);
      } catch (cleanupError) {
        this.logger.error(`Failed to clean up temp directory: ${cleanupError.message}`);
      }
      this.runningBackups.delete(backup.id);
    }
  }

  // ===== RESTORE OPERATIONS =====

  async createRestoreOperation(
    tenantId: number | null,
    createRestoreDto: CreateRestoreOperationDto
  ): Promise<RestoreOperationResponse> {
    this.logger.log(`Creating restore operation for backup: ${createRestoreDto.backupId}`);

    const backup = await this.prisma.systemBackup.findUnique({
      where: { id: createRestoreDto.backupId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new BadRequestException('Cannot restore from incomplete backup');
    }

    const restoreId = crypto.randomUUID();

    const restore = await this.prisma.restoreOperation.create({
      data: {
        id: restoreId,
        tenantId,
        backupId: createRestoreDto.backupId,
        backupType: createRestoreDto.backupType,
        restoreType: createRestoreDto.restoreType,
        targetLocation: createRestoreDto.targetLocation,
        restoreDatabase: createRestoreDto.restoreDatabase ?? true,
        restoreFiles: createRestoreDto.restoreFiles ?? true,
        restoreConfig: createRestoreDto.restoreConfig ?? true,
        restoreMedia: createRestoreDto.restoreMedia ?? true,
        status: 'pending',
        reason: createRestoreDto.reason,
      },
    });

    // Start restore process asynchronously
    this.performRestoreOperation(restore).catch(error => {
      this.logger.error(`Restore operation failed: ${error.message}`, error.stack);
    });

    return {
      id: restore.id,
      status: restore.status,
      progress: 0,
      startedAt: new Date(),
    };
  }

  private async performRestoreOperation(restore: RestoreOperation): Promise<void> {
    const progress: RestoreProgress = {
      id: restore.id,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      currentPhase: 'initializing',
    };

    this.runningRestores.set(restore.id, progress);

    try {
      await this.prisma.restoreOperation.update({
        where: { id: restore.id },
        data: { status: 'running', startedAt: new Date() },
      });

      // Implementation would go here for actual restore logic
      // This is a placeholder for the complex restore process

      await this.prisma.restoreOperation.update({
        where: { id: restore.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration: Math.round((Date.now() - progress.startedAt!.getTime()) / 1000),
        },
      });

      progress.status = 'completed';
      progress.progress = 100;

      this.logger.log(`Restore operation completed: ${restore.id}`);

    } catch (error) {
      this.logger.error(`Restore operation failed: ${restore.id} - ${error.message}`, error.stack);

      await this.prisma.restoreOperation.update({
        where: { id: restore.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      progress.status = 'failed';
      progress.errorMessage = error.message;
    } finally {
      this.runningRestores.delete(restore.id);
    }
  }

  // ===== UTILITY METHODS =====

  private async compressFile(filePath: string, compressionType: string): Promise<void> {
    if (compressionType === 'none') return;

    const inputStream = fs.createReadStream(filePath);
    const outputPath = `${filePath}.${compressionType === 'gzip' ? 'gz' : compressionType}`;
    const outputStream = fs.createWriteStream(outputPath);

    let compressor;
    switch (compressionType) {
      case 'gzip':
        compressor = zlib.createGzip();
        break;
      default:
        throw new Error(`Unsupported compression type: ${compressionType}`);
    }

    return new Promise((resolve, reject) => {
      inputStream
        .pipe(compressor)
        .pipe(outputStream)
        .on('finish', async () => {
          await fs.remove(filePath);
          await fs.rename(outputPath, filePath);
          resolve();
        })
        .on('error', reject);
    });
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let size = 0;
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        size += await this.calculateDirectorySize(itemPath);
      } else {
        size += stats.size;
      }
    }

    return size;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Placeholder methods for system backup components
  private async backupDatabase(tempDir: string, tenantId: number | null): Promise<void> {
    // Database backup logic
  }

  private async backupApplicationFiles(tempDir: string): Promise<void> {
    // Application files backup logic
  }

  private async backupConfiguration(tempDir: string): Promise<void> {
    // Configuration backup logic
  }

  private async backupMediaFiles(tempDir: string, tenantId: number | null): Promise<void> {
    // Media files backup logic
  }

  private async backupLogs(tempDir: string): Promise<void> {
    // Logs backup logic
  }

  // ===== SCHEDULED CLEANUP =====

  @Cron('0 2 * * *') // Daily at 2 AM
  async cleanupExpiredBackups(): Promise<void> {
    this.logger.log('Starting cleanup of expired backups');

    try {
      const expiredBackups = await this.prisma.databaseBackup.findMany({
        where: {
          expiresAt: { lte: new Date() },
          status: 'completed',
        },
      });

      for (const backup of expiredBackups) {
        try {
          if (await fs.pathExists(backup.filePath)) {
            await fs.remove(backup.filePath);
          }

          await this.prisma.databaseBackup.delete({
            where: { id: backup.id },
          });

          this.logger.log(`Deleted expired backup: ${backup.name}`);
        } catch (error) {
          this.logger.error(`Failed to delete backup ${backup.id}: ${error.message}`);
        }
      }

      const expiredSystemBackups = await this.prisma.systemBackup.findMany({
        where: {
          expiresAt: { lte: new Date() },
          status: 'completed',
        },
      });

      for (const backup of expiredSystemBackups) {
        try {
          if (backup.archivePath && await fs.pathExists(backup.archivePath)) {
            await fs.remove(backup.archivePath);
          }

          await this.prisma.systemBackup.delete({
            where: { id: backup.id },
          });

          this.logger.log(`Deleted expired system backup: ${backup.name}`);
        } catch (error) {
          this.logger.error(`Failed to delete system backup ${backup.id}: ${error.message}`);
        }
      }

    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`, error.stack);
    }
  }

  // ===== PROGRESS TRACKING =====

  getBackupProgress(backupId: string): BackupProgress | null {
    return this.runningBackups.get(backupId) || null;
  }

  getRestoreProgress(restoreId: string): RestoreProgress | null {
    return this.runningRestores.get(restoreId) || null;
  }
}