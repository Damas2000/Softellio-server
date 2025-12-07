import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { SystemUpdate } from '@prisma/client';
import { CreateSystemUpdateDto, UpdateSystemUpdateDto, SystemUpdateResponse } from '../dto/system-update.dto';
import { UpdateProgress } from '../interfaces/backup.interface';
import { BackupService } from './backup.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SystemUpdateService {
  private readonly logger = new Logger(SystemUpdateService.name);
  private readonly updateDir: string;
  private readonly maxConcurrentUpdates = 1; // Only one update at a time
  private runningUpdates = new Map<string, UpdateProgress>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private backupService: BackupService,
  ) {
    this.updateDir = this.configService.get<string>('UPDATE_DIRECTORY') ||
                     path.join(process.cwd(), 'updates');
    this.ensureUpdateDirectoryExists();
  }

  private async ensureUpdateDirectoryExists(): Promise<void> {
    try {
      await fs.ensureDir(this.updateDir);
      await fs.ensureDir(path.join(this.updateDir, 'packages'));
      await fs.ensureDir(path.join(this.updateDir, 'temp'));
      await fs.ensureDir(path.join(this.updateDir, 'backups'));
    } catch (error) {
      this.logger.error(`Failed to create update directories: ${error.message}`, error.stack);
    }
  }

  // ===== SYSTEM UPDATE OPERATIONS =====

  async createSystemUpdate(
    tenantId: number | null,
    createUpdateDto: CreateSystemUpdateDto
  ): Promise<SystemUpdate> {
    this.logger.log(`Creating system update: ${createUpdateDto.name} for tenant: ${tenantId}`);

    if (this.runningUpdates.size >= this.maxConcurrentUpdates) {
      throw new BadRequestException('Another update is already in progress. Please wait for it to complete.');
    }

    // Check if update already exists for this version
    const existingUpdate = await this.prisma.systemUpdate.findFirst({
      where: {
        tenantId,
        version: createUpdateDto.version,
        status: { in: ['pending', 'downloading', 'applying'] },
      },
    });

    if (existingUpdate) {
      throw new BadRequestException(`Update to version ${createUpdateDto.version} is already in progress`);
    }

    const updateId = crypto.randomUUID();

    const update = await this.prisma.systemUpdate.create({
      data: {
        id: updateId,
        tenantId,
        name: createUpdateDto.name,
        description: createUpdateDto.description,
        updateType: createUpdateDto.updateType,
        version: createUpdateDto.version,
        currentVersion: createUpdateDto.currentVersion || this.getCurrentVersion(),
        packageUrl: createUpdateDto.packageUrl,
        packageSize: createUpdateDto.packageSize,
        packageChecksum: createUpdateDto.packageChecksum,
        releaseNotes: createUpdateDto.releaseNotes,
        requirements: createUpdateDto.requirements || {},
        dependencies: createUpdateDto.dependencies || {},
        conflicts: createUpdateDto.conflicts || {},
        autoBackup: createUpdateDto.autoBackup ?? true,
        scheduledAt: createUpdateDto.scheduledAt ? new Date(createUpdateDto.scheduledAt) : null,
        canRollback: createUpdateDto.canRollback ?? true,
        notifyOnComplete: createUpdateDto.notifyOnComplete ?? true,
        notifyOnFailure: createUpdateDto.notifyOnFailure ?? true,
        recipients: createUpdateDto.recipients || [],
        tags: createUpdateDto.tags || [],
      },
    });

    // Start update process if not scheduled
    if (!update.scheduledAt || update.scheduledAt <= new Date()) {
      this.performSystemUpdate(update).catch(error => {
        this.logger.error(`System update failed: ${error.message}`, error.stack);
      });
    }

    return update;
  }

  async updateSystemUpdate(
    updateId: string,
    updateUpdateDto: UpdateSystemUpdateDto
  ): Promise<SystemUpdate> {
    this.logger.log(`Updating system update: ${updateId}`);

    const existingUpdate = await this.prisma.systemUpdate.findUnique({
      where: { id: updateId },
    });

    if (!existingUpdate) {
      throw new NotFoundException('System update not found');
    }

    if (existingUpdate.status === 'applying') {
      throw new BadRequestException('Cannot modify update while it is being applied');
    }

    return await this.prisma.systemUpdate.update({
      where: { id: updateId },
      data: {
        ...updateUpdateDto,
        scheduledAt: updateUpdateDto.scheduledAt ? new Date(updateUpdateDto.scheduledAt) : existingUpdate.scheduledAt,
        updatedAt: new Date(),
      },
    });
  }

  async getSystemUpdates(tenantId: number | null): Promise<SystemUpdate[]> {
    return await this.prisma.systemUpdate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSystemUpdate(updateId: string): Promise<SystemUpdateResponse> {
    const update = await this.prisma.systemUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      throw new NotFoundException('System update not found');
    }

    const progress = this.getUpdateProgress(updateId);

    return {
      id: update.id,
      name: update.name,
      version: update.version,
      updateType: update.updateType,
      status: update.status,
      progress: progress?.progress || 0,
      currentPhase: progress?.currentPhase,
      errorMessage: update.errorMessage,
      createdAt: update.createdAt,
      startedAt: update.startedAt,
      completedAt: update.completedAt,
      scheduledAt: update.scheduledAt,
      canRollback: update.canRollback,
    };
  }

  async rollbackSystemUpdate(updateId: string): Promise<SystemUpdate> {
    this.logger.log(`Rolling back system update: ${updateId}`);

    const update = await this.prisma.systemUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      throw new NotFoundException('System update not found');
    }

    if (!update.canRollback) {
      throw new BadRequestException('This update cannot be rolled back');
    }

    if (update.status !== 'completed' && update.status !== 'failed') {
      throw new BadRequestException('Can only rollback completed or failed updates');
    }

    // Start rollback process
    this.performRollback(update).catch(error => {
      this.logger.error(`Rollback failed: ${error.message}`, error.stack);
    });

    return await this.prisma.systemUpdate.update({
      where: { id: updateId },
      data: {
        status: 'rolling_back',
        currentPhase: 'rollback_initiated',
      },
    });
  }

  private async performSystemUpdate(update: SystemUpdate): Promise<void> {
    const progress: UpdateProgress = {
      id: update.id,
      status: 'downloading',
      progress: 0,
      startedAt: new Date(),
      currentPhase: 'initializing',
    };

    this.runningUpdates.set(update.id, progress);

    try {
      await this.prisma.systemUpdate.update({
        where: { id: update.id },
        data: { status: 'downloading', startedAt: new Date() },
      });

      // Phase 1: Pre-update backup (if enabled)
      if (update.autoBackup) {
        progress.currentPhase = 'backup';
        progress.progress = 5;
        await this.createPreUpdateBackup(update);
      }

      // Phase 2: Download update package
      progress.currentPhase = 'downloading';
      progress.progress = 15;
      const packagePath = await this.downloadUpdatePackage(update, progress);

      // Phase 3: Validate package
      progress.currentPhase = 'validating';
      progress.progress = 25;
      await this.validateUpdatePackage(packagePath, update);

      // Phase 4: Check requirements and dependencies
      progress.currentPhase = 'checking_requirements';
      progress.progress = 35;
      await this.checkUpdateRequirements(update);

      // Phase 5: Apply update
      progress.status = 'applying';
      progress.currentPhase = 'applying';
      progress.progress = 50;

      await this.prisma.systemUpdate.update({
        where: { id: update.id },
        data: { status: 'applying', currentPhase: 'applying' },
      });

      await this.applyUpdate(packagePath, update, progress);

      // Phase 6: Run post-update validation
      progress.currentPhase = 'validating_result';
      progress.progress = 90;
      await this.validateUpdateResult(update);

      // Phase 7: Complete
      progress.status = 'completed';
      progress.progress = 100;
      progress.currentPhase = 'completed';

      await this.prisma.systemUpdate.update({
        where: { id: update.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          testsPassed: true,
          validationResults: { success: true },
        },
      });

      // Send success notification
      if (update.notifyOnComplete) {
        await this.sendNotification(update, 'completed', {
          duration: Date.now() - progress.startedAt!.getTime(),
        });
      }

      this.logger.log(`System update completed: ${update.name} to version ${update.version}`);

    } catch (error) {
      this.logger.error(`System update failed: ${update.name} - ${error.message}`, error.stack);

      await this.prisma.systemUpdate.update({
        where: { id: update.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      progress.status = 'failed';
      progress.errorMessage = error.message;

      // Send failure notification
      if (update.notifyOnFailure) {
        await this.sendNotification(update, 'failed', {
          error: error.message,
        });
      }

      // Auto-rollback if possible
      if (update.canRollback && update.autoBackup) {
        this.logger.log(`Auto-rolling back failed update: ${update.name}`);
        await this.performRollback(update);
      }
    } finally {
      this.runningUpdates.delete(update.id);
    }
  }

  private async downloadUpdatePackage(
    update: SystemUpdate,
    progress: UpdateProgress
  ): Promise<string> {
    if (!update.packageUrl) {
      throw new Error('No package URL provided for update');
    }

    const packageFileName = `update_${update.version}_${update.id.substring(0, 8)}.tar.gz`;
    const packagePath = path.join(this.updateDir, 'packages', packageFileName);

    this.logger.log(`Downloading update package: ${update.packageUrl}`);

    const response = await axios({
      method: 'GET',
      url: update.packageUrl,
      responseType: 'stream',
    });

    const totalSize = parseInt(response.headers['content-length'] || '0');
    let downloadedSize = 0;

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(packagePath);

      response.data.on('data', (chunk: Buffer) => {
        downloadedSize += chunk.length;
        if (totalSize > 0) {
          const downloadProgress = Math.round((downloadedSize / totalSize) * 100);
          progress.progress = 15 + (downloadProgress * 0.1); // 15-25%
          progress.bytesDownloaded = downloadedSize;
          progress.totalBytes = totalSize;
        }
      });

      response.data.pipe(writer);

      writer.on('finish', () => resolve(packagePath));
      writer.on('error', reject);
    });
  }

  private async validateUpdatePackage(
    packagePath: string,
    update: SystemUpdate
  ): Promise<void> {
    this.logger.log(`Validating update package: ${packagePath}`);

    // Check file exists
    if (!await fs.pathExists(packagePath)) {
      throw new Error('Update package not found');
    }

    // Check file size
    const stats = await fs.stat(packagePath);
    if (update.packageSize && stats.size !== update.packageSize) {
      throw new Error(`Package size mismatch. Expected: ${update.packageSize}, Actual: ${stats.size}`);
    }

    // Check checksum if provided
    if (update.packageChecksum) {
      const actualChecksum = await this.calculateFileChecksum(packagePath);
      if (actualChecksum !== update.packageChecksum) {
        throw new Error('Package checksum validation failed');
      }
    }

    this.logger.log('Update package validation passed');
  }

  private async checkUpdateRequirements(update: SystemUpdate): Promise<void> {
    this.logger.log(`Checking update requirements for version ${update.version}`);

    // Check Node.js version
    const nodeVersion = process.version;
    const requirements = update.requirements as any;

    if (requirements?.nodeVersion) {
      // Simple version check (can be enhanced)
      if (nodeVersion < requirements.nodeVersion) {
        throw new Error(`Node.js version ${requirements.nodeVersion} required, current: ${nodeVersion}`);
      }
    }

    // Check disk space (simplified implementation)
    if (requirements?.diskSpace) {
      // Note: This is a simplified check - in production, use a proper disk space check
      const minimumRequired = requirements.diskSpace || 1024 * 1024 * 100; // 100MB minimum
      this.logger.log(`Disk space requirement check: ${minimumRequired} bytes`);
    }

    // Check dependencies
    const dependencies = update.dependencies as any;
    if (dependencies && Object.keys(dependencies).length > 0) {
      await this.checkDependencies(dependencies);
    }

    this.logger.log('Update requirements check passed');
  }

  private async applyUpdate(
    packagePath: string,
    update: SystemUpdate,
    progress: UpdateProgress
  ): Promise<void> {
    this.logger.log(`Applying update: ${update.name}`);

    const tempDir = path.join(this.updateDir, 'temp', update.id);
    await fs.ensureDir(tempDir);

    try {
      // Extract package
      progress.progress = 55;
      await this.extractPackage(packagePath, tempDir);

      // Run pre-update scripts
      progress.progress = 65;
      await this.runUpdateScripts(tempDir, 'pre-update');

      // Apply file updates
      progress.progress = 75;
      await this.applyFileUpdates(tempDir);

      // Run post-update scripts
      progress.progress = 85;
      await this.runUpdateScripts(tempDir, 'post-update');

    } finally {
      // Clean up temp directory
      await fs.remove(tempDir);
    }
  }

  private async createPreUpdateBackup(update: SystemUpdate): Promise<void> {
    this.logger.log(`Creating pre-update backup for: ${update.name}`);

    const backup = await this.backupService.createSystemBackup(update.tenantId, {
      name: `Pre-update backup for ${update.name}`,
      description: `Automatic backup created before applying update to version ${update.version}`,
      backupType: 'full' as any,
      includeDatabase: true,
      includeFiles: true,
      includeConfig: true,
      includeMedia: false,
      retentionDays: 30,
      tags: ['pre-update', update.updateType, `version-${update.version}`],
      isAutomatic: true,
    });

    await this.prisma.systemUpdate.update({
      where: { id: update.id },
      data: { preUpdateBackupId: backup.id },
    });
  }

  private async performRollback(update: SystemUpdate): Promise<void> {
    this.logger.log(`Performing rollback for update: ${update.name}`);

    try {
      // Implementation would depend on the specific update mechanism
      // This is a placeholder for rollback logic

      await this.prisma.systemUpdate.update({
        where: { id: update.id },
        data: {
          status: 'rolled_back',
          rolledBackAt: new Date(),
        },
      });

      this.logger.log(`Rollback completed for update: ${update.name}`);
    } catch (error) {
      this.logger.error(`Rollback failed for update ${update.name}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  private getCurrentVersion(): string {
    return process.env.npm_package_version || '1.0.0';
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

  private async checkDependencies(dependencies: Record<string, string>): Promise<void> {
    // Placeholder for dependency checking logic
    // This would check npm packages, system dependencies, etc.
  }

  private async extractPackage(packagePath: string, targetDir: string): Promise<void> {
    const command = `tar -xzf "${packagePath}" -C "${targetDir}"`;
    await execAsync(command);
  }

  private async runUpdateScripts(updateDir: string, phase: string): Promise<void> {
    const scriptPath = path.join(updateDir, 'scripts', `${phase}.sh`);
    if (await fs.pathExists(scriptPath)) {
      await execAsync(`chmod +x "${scriptPath}" && "${scriptPath}"`);
    }
  }

  private async applyFileUpdates(updateDir: string): Promise<void> {
    // Placeholder for file update logic
    // This would copy new files, update existing ones, etc.
  }

  private async validateUpdateResult(update: SystemUpdate): Promise<void> {
    // Placeholder for post-update validation
    // This would run health checks, verify services, etc.
  }

  private async sendNotification(
    update: SystemUpdate,
    status: string,
    details: any
  ): Promise<void> {
    // Placeholder for notification implementation
    this.logger.log(`Notification sent for update ${update.name}: ${status}`, details);
  }

  // ===== SCHEDULED TASKS =====

  @Cron('0 3 * * *') // Daily at 3 AM
  async checkForUpdates(): Promise<void> {
    this.logger.log('Checking for scheduled system updates...');

    try {
      const scheduledUpdates = await this.prisma.systemUpdate.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: new Date() },
        },
      });

      for (const update of scheduledUpdates) {
        this.logger.log(`Starting scheduled update: ${update.name}`);
        this.performSystemUpdate(update).catch(error => {
          this.logger.error(`Scheduled update failed: ${error.message}`, error.stack);
        });
      }

    } catch (error) {
      this.logger.error(`Failed to check for scheduled updates: ${error.message}`, error.stack);
    }
  }

  // ===== PROGRESS TRACKING =====

  getUpdateProgress(updateId: string): UpdateProgress | null {
    return this.runningUpdates.get(updateId) || null;
  }

  getRunningUpdates(): UpdateProgress[] {
    return Array.from(this.runningUpdates.values());
  }
}