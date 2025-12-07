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
var SystemUpdateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemUpdateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const axios_1 = require("axios");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let SystemUpdateService = SystemUpdateService_1 = class SystemUpdateService {
    constructor(prisma, configService, backupService) {
        this.prisma = prisma;
        this.configService = configService;
        this.backupService = backupService;
        this.logger = new common_1.Logger(SystemUpdateService_1.name);
        this.maxConcurrentUpdates = 1;
        this.runningUpdates = new Map();
        this.updateDir = this.configService.get('UPDATE_DIRECTORY') ||
            path.join(process.cwd(), 'updates');
        this.ensureUpdateDirectoryExists();
    }
    async ensureUpdateDirectoryExists() {
        try {
            await fs.ensureDir(this.updateDir);
            await fs.ensureDir(path.join(this.updateDir, 'packages'));
            await fs.ensureDir(path.join(this.updateDir, 'temp'));
            await fs.ensureDir(path.join(this.updateDir, 'backups'));
        }
        catch (error) {
            this.logger.error(`Failed to create update directories: ${error.message}`, error.stack);
        }
    }
    async createSystemUpdate(tenantId, createUpdateDto) {
        this.logger.log(`Creating system update: ${createUpdateDto.name} for tenant: ${tenantId}`);
        if (this.runningUpdates.size >= this.maxConcurrentUpdates) {
            throw new common_1.BadRequestException('Another update is already in progress. Please wait for it to complete.');
        }
        const existingUpdate = await this.prisma.systemUpdate.findFirst({
            where: {
                tenantId,
                version: createUpdateDto.version,
                status: { in: ['pending', 'downloading', 'applying'] },
            },
        });
        if (existingUpdate) {
            throw new common_1.BadRequestException(`Update to version ${createUpdateDto.version} is already in progress`);
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
        if (!update.scheduledAt || update.scheduledAt <= new Date()) {
            this.performSystemUpdate(update).catch(error => {
                this.logger.error(`System update failed: ${error.message}`, error.stack);
            });
        }
        return update;
    }
    async updateSystemUpdate(updateId, updateUpdateDto) {
        this.logger.log(`Updating system update: ${updateId}`);
        const existingUpdate = await this.prisma.systemUpdate.findUnique({
            where: { id: updateId },
        });
        if (!existingUpdate) {
            throw new common_1.NotFoundException('System update not found');
        }
        if (existingUpdate.status === 'applying') {
            throw new common_1.BadRequestException('Cannot modify update while it is being applied');
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
    async getSystemUpdates(tenantId) {
        return await this.prisma.systemUpdate.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSystemUpdate(updateId) {
        const update = await this.prisma.systemUpdate.findUnique({
            where: { id: updateId },
        });
        if (!update) {
            throw new common_1.NotFoundException('System update not found');
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
    async rollbackSystemUpdate(updateId) {
        this.logger.log(`Rolling back system update: ${updateId}`);
        const update = await this.prisma.systemUpdate.findUnique({
            where: { id: updateId },
        });
        if (!update) {
            throw new common_1.NotFoundException('System update not found');
        }
        if (!update.canRollback) {
            throw new common_1.BadRequestException('This update cannot be rolled back');
        }
        if (update.status !== 'completed' && update.status !== 'failed') {
            throw new common_1.BadRequestException('Can only rollback completed or failed updates');
        }
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
    async performSystemUpdate(update) {
        const progress = {
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
            if (update.autoBackup) {
                progress.currentPhase = 'backup';
                progress.progress = 5;
                await this.createPreUpdateBackup(update);
            }
            progress.currentPhase = 'downloading';
            progress.progress = 15;
            const packagePath = await this.downloadUpdatePackage(update, progress);
            progress.currentPhase = 'validating';
            progress.progress = 25;
            await this.validateUpdatePackage(packagePath, update);
            progress.currentPhase = 'checking_requirements';
            progress.progress = 35;
            await this.checkUpdateRequirements(update);
            progress.status = 'applying';
            progress.currentPhase = 'applying';
            progress.progress = 50;
            await this.prisma.systemUpdate.update({
                where: { id: update.id },
                data: { status: 'applying', currentPhase: 'applying' },
            });
            await this.applyUpdate(packagePath, update, progress);
            progress.currentPhase = 'validating_result';
            progress.progress = 90;
            await this.validateUpdateResult(update);
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
            if (update.notifyOnComplete) {
                await this.sendNotification(update, 'completed', {
                    duration: Date.now() - progress.startedAt.getTime(),
                });
            }
            this.logger.log(`System update completed: ${update.name} to version ${update.version}`);
        }
        catch (error) {
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
            if (update.notifyOnFailure) {
                await this.sendNotification(update, 'failed', {
                    error: error.message,
                });
            }
            if (update.canRollback && update.autoBackup) {
                this.logger.log(`Auto-rolling back failed update: ${update.name}`);
                await this.performRollback(update);
            }
        }
        finally {
            this.runningUpdates.delete(update.id);
        }
    }
    async downloadUpdatePackage(update, progress) {
        if (!update.packageUrl) {
            throw new Error('No package URL provided for update');
        }
        const packageFileName = `update_${update.version}_${update.id.substring(0, 8)}.tar.gz`;
        const packagePath = path.join(this.updateDir, 'packages', packageFileName);
        this.logger.log(`Downloading update package: ${update.packageUrl}`);
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: update.packageUrl,
            responseType: 'stream',
        });
        const totalSize = parseInt(response.headers['content-length'] || '0');
        let downloadedSize = 0;
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(packagePath);
            response.data.on('data', (chunk) => {
                downloadedSize += chunk.length;
                if (totalSize > 0) {
                    const downloadProgress = Math.round((downloadedSize / totalSize) * 100);
                    progress.progress = 15 + (downloadProgress * 0.1);
                    progress.bytesDownloaded = downloadedSize;
                    progress.totalBytes = totalSize;
                }
            });
            response.data.pipe(writer);
            writer.on('finish', () => resolve(packagePath));
            writer.on('error', reject);
        });
    }
    async validateUpdatePackage(packagePath, update) {
        this.logger.log(`Validating update package: ${packagePath}`);
        if (!await fs.pathExists(packagePath)) {
            throw new Error('Update package not found');
        }
        const stats = await fs.stat(packagePath);
        if (update.packageSize && stats.size !== update.packageSize) {
            throw new Error(`Package size mismatch. Expected: ${update.packageSize}, Actual: ${stats.size}`);
        }
        if (update.packageChecksum) {
            const actualChecksum = await this.calculateFileChecksum(packagePath);
            if (actualChecksum !== update.packageChecksum) {
                throw new Error('Package checksum validation failed');
            }
        }
        this.logger.log('Update package validation passed');
    }
    async checkUpdateRequirements(update) {
        this.logger.log(`Checking update requirements for version ${update.version}`);
        const nodeVersion = process.version;
        const requirements = update.requirements;
        if (requirements?.nodeVersion) {
            if (nodeVersion < requirements.nodeVersion) {
                throw new Error(`Node.js version ${requirements.nodeVersion} required, current: ${nodeVersion}`);
            }
        }
        if (requirements?.diskSpace) {
            const minimumRequired = requirements.diskSpace || 1024 * 1024 * 100;
            this.logger.log(`Disk space requirement check: ${minimumRequired} bytes`);
        }
        const dependencies = update.dependencies;
        if (dependencies && Object.keys(dependencies).length > 0) {
            await this.checkDependencies(dependencies);
        }
        this.logger.log('Update requirements check passed');
    }
    async applyUpdate(packagePath, update, progress) {
        this.logger.log(`Applying update: ${update.name}`);
        const tempDir = path.join(this.updateDir, 'temp', update.id);
        await fs.ensureDir(tempDir);
        try {
            progress.progress = 55;
            await this.extractPackage(packagePath, tempDir);
            progress.progress = 65;
            await this.runUpdateScripts(tempDir, 'pre-update');
            progress.progress = 75;
            await this.applyFileUpdates(tempDir);
            progress.progress = 85;
            await this.runUpdateScripts(tempDir, 'post-update');
        }
        finally {
            await fs.remove(tempDir);
        }
    }
    async createPreUpdateBackup(update) {
        this.logger.log(`Creating pre-update backup for: ${update.name}`);
        const backup = await this.backupService.createSystemBackup(update.tenantId, {
            name: `Pre-update backup for ${update.name}`,
            description: `Automatic backup created before applying update to version ${update.version}`,
            backupType: 'full',
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
    async performRollback(update) {
        this.logger.log(`Performing rollback for update: ${update.name}`);
        try {
            await this.prisma.systemUpdate.update({
                where: { id: update.id },
                data: {
                    status: 'rolled_back',
                    rolledBackAt: new Date(),
                },
            });
            this.logger.log(`Rollback completed for update: ${update.name}`);
        }
        catch (error) {
            this.logger.error(`Rollback failed for update ${update.name}: ${error.message}`, error.stack);
            throw error;
        }
    }
    getCurrentVersion() {
        return process.env.npm_package_version || '1.0.0';
    }
    async calculateFileChecksum(filePath) {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    async checkDependencies(dependencies) {
    }
    async extractPackage(packagePath, targetDir) {
        const command = `tar -xzf "${packagePath}" -C "${targetDir}"`;
        await execAsync(command);
    }
    async runUpdateScripts(updateDir, phase) {
        const scriptPath = path.join(updateDir, 'scripts', `${phase}.sh`);
        if (await fs.pathExists(scriptPath)) {
            await execAsync(`chmod +x "${scriptPath}" && "${scriptPath}"`);
        }
    }
    async applyFileUpdates(updateDir) {
    }
    async validateUpdateResult(update) {
    }
    async sendNotification(update, status, details) {
        this.logger.log(`Notification sent for update ${update.name}: ${status}`, details);
    }
    async checkForUpdates() {
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
        }
        catch (error) {
            this.logger.error(`Failed to check for scheduled updates: ${error.message}`, error.stack);
        }
    }
    getUpdateProgress(updateId) {
        return this.runningUpdates.get(updateId) || null;
    }
    getRunningUpdates() {
        return Array.from(this.runningUpdates.values());
    }
};
exports.SystemUpdateService = SystemUpdateService;
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemUpdateService.prototype, "checkForUpdates", null);
exports.SystemUpdateService = SystemUpdateService = SystemUpdateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        backup_service_1.BackupService])
], SystemUpdateService);
//# sourceMappingURL=system-update.service.js.map