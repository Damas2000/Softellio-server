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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const tar = require("tar");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.maxConcurrentBackups = 3;
        this.runningBackups = new Map();
        this.runningRestores = new Map();
        this.backupDir = this.configService.get('BACKUP_DIRECTORY') ||
            path.join(process.cwd(), 'backups');
        this.ensureBackupDirectoryExists();
    }
    async ensureBackupDirectoryExists() {
        try {
            await fs.ensureDir(this.backupDir);
            await fs.ensureDir(path.join(this.backupDir, 'database'));
            await fs.ensureDir(path.join(this.backupDir, 'system'));
            await fs.ensureDir(path.join(this.backupDir, 'temp'));
        }
        catch (error) {
            this.logger.error(`Failed to create backup directories: ${error.message}`, error.stack);
        }
    }
    async createDatabaseBackup(tenantId, createBackupDto) {
        this.logger.log(`Creating database backup: ${createBackupDto.name} for tenant: ${tenantId}`);
        if (this.runningBackups.size >= this.maxConcurrentBackups) {
            throw new common_1.BadRequestException('Maximum concurrent backups reached. Please try again later.');
        }
        const backupId = crypto.randomUUID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `db_backup_${timestamp}_${backupId.substring(0, 8)}.sql`;
        const filePath = path.join(this.backupDir, 'database', fileName);
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
        this.performDatabaseBackup(backup).catch(error => {
            this.logger.error(`Database backup failed: ${error.message}`, error.stack);
        });
        return backup;
    }
    async performDatabaseBackup(backup) {
        const progress = {
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
            progress.currentPhase = 'preparing';
            progress.progress = 10;
            const dbUrl = this.configService.get('DATABASE_URL');
            if (!dbUrl) {
                throw new Error('Database URL not configured');
            }
            progress.currentPhase = 'dumping';
            progress.progress = 30;
            const dumpCommand = this.buildDumpCommand(dbUrl, backup);
            const { stdout, stderr } = await execAsync(dumpCommand);
            if (stderr && !stderr.includes('pg_dump: warning')) {
                throw new Error(`Database dump failed: ${stderr}`);
            }
            if (backup.compressionType !== 'none') {
                progress.currentPhase = 'compressing';
                progress.progress = 70;
                await this.compressFile(backup.filePath, backup.compressionType);
            }
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
                    duration: Math.round((Date.now() - progress.startedAt.getTime()) / 1000),
                },
            });
            progress.status = 'completed';
            progress.progress = 100;
            progress.currentPhase = 'completed';
            this.logger.log(`Database backup completed: ${backup.name} (${this.formatBytes(stats.size)})`);
        }
        catch (error) {
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
            try {
                await fs.remove(backup.filePath);
            }
            catch (cleanupError) {
                this.logger.error(`Failed to clean up backup file: ${cleanupError.message}`);
            }
        }
        finally {
            this.runningBackups.delete(backup.id);
        }
    }
    buildDumpCommand(dbUrl, backup) {
        const url = new URL(dbUrl);
        const host = url.hostname;
        const port = url.port || '5432';
        const database = url.pathname.substring(1);
        const username = url.username;
        const password = url.password;
        let command = `PGPASSWORD="${password}" pg_dump`;
        command += ` -h ${host} -p ${port} -U ${username} -d ${database}`;
        command += ` --verbose --format=custom`;
        if (backup.tenantId) {
            command += ` --exclude-table-data=users --exclude-table-data=tenants`;
        }
        if (backup.backupType === 'schema_only') {
            command += ` --schema-only`;
        }
        else if (backup.backupType === 'data_only') {
            command += ` --data-only`;
        }
        command += ` -f "${backup.filePath}"`;
        return command;
    }
    async createSystemBackup(tenantId, createBackupDto) {
        this.logger.log(`Creating system backup: ${createBackupDto.name} for tenant: ${tenantId}`);
        if (this.runningBackups.size >= this.maxConcurrentBackups) {
            throw new common_1.BadRequestException('Maximum concurrent backups reached. Please try again later.');
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
        this.performSystemBackup(backup).catch(error => {
            this.logger.error(`System backup failed: ${error.message}`, error.stack);
        });
        return backup;
    }
    async performSystemBackup(backup) {
        const progress = {
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
            if (backup.includeDatabase) {
                progress.currentPhase = 'database';
                progress.progress = 10;
                await this.backupDatabase(tempDir, backup.tenantId);
            }
            if (backup.includeFiles) {
                progress.currentPhase = 'files';
                progress.progress = 30;
                await this.backupApplicationFiles(tempDir);
            }
            if (backup.includeConfig) {
                progress.currentPhase = 'config';
                progress.progress = 50;
                await this.backupConfiguration(tempDir);
            }
            if (backup.includeMedia) {
                progress.currentPhase = 'media';
                progress.progress = 70;
                await this.backupMediaFiles(tempDir, backup.tenantId);
            }
            if (backup.includeLogs) {
                progress.currentPhase = 'logs';
                progress.progress = 80;
                await this.backupLogs(tempDir);
            }
            progress.currentPhase = 'archive';
            progress.progress = 90;
            await tar.create({
                gzip: true,
                file: backup.archivePath,
                cwd: tempDir,
            }, ['.']);
            progress.currentPhase = 'finalizing';
            progress.progress = 95;
            const stats = await fs.stat(backup.archivePath);
            const originalSize = await this.calculateDirectorySize(tempDir);
            const checksum = await this.calculateFileChecksum(backup.archivePath);
            await this.prisma.systemBackup.update({
                where: { id: backup.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    archiveSize: stats.size,
                    originalSize,
                    compressionRatio: originalSize > 0 ? stats.size / originalSize : 0,
                    checksum,
                    duration: Math.round((Date.now() - progress.startedAt.getTime()) / 1000),
                },
            });
            progress.status = 'completed';
            progress.progress = 100;
            progress.currentPhase = 'completed';
            this.logger.log(`System backup completed: ${backup.name} (${this.formatBytes(stats.size)})`);
        }
        catch (error) {
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
            try {
                if (backup.archivePath && await fs.pathExists(backup.archivePath)) {
                    await fs.remove(backup.archivePath);
                }
            }
            catch (cleanupError) {
                this.logger.error(`Failed to clean up backup archive: ${cleanupError.message}`);
            }
        }
        finally {
            try {
                await fs.remove(tempDir);
            }
            catch (cleanupError) {
                this.logger.error(`Failed to clean up temp directory: ${cleanupError.message}`);
            }
            this.runningBackups.delete(backup.id);
        }
    }
    async createRestoreOperation(tenantId, createRestoreDto) {
        this.logger.log(`Creating restore operation for backup: ${createRestoreDto.backupId}`);
        const backup = await this.prisma.systemBackup.findUnique({
            where: { id: createRestoreDto.backupId },
        });
        if (!backup) {
            throw new common_1.NotFoundException('Backup not found');
        }
        if (backup.status !== 'completed') {
            throw new common_1.BadRequestException('Cannot restore from incomplete backup');
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
    async performRestoreOperation(restore) {
        const progress = {
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
            await this.prisma.restoreOperation.update({
                where: { id: restore.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    duration: Math.round((Date.now() - progress.startedAt.getTime()) / 1000),
                },
            });
            progress.status = 'completed';
            progress.progress = 100;
            this.logger.log(`Restore operation completed: ${restore.id}`);
        }
        catch (error) {
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
        }
        finally {
            this.runningRestores.delete(restore.id);
        }
    }
    async compressFile(filePath, compressionType) {
        if (compressionType === 'none')
            return;
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
    async calculateFileChecksum(filePath) {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    async calculateDirectorySize(dirPath) {
        let size = 0;
        const items = await fs.readdir(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                size += await this.calculateDirectorySize(itemPath);
            }
            else {
                size += stats.size;
            }
        }
        return size;
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    async backupDatabase(tempDir, tenantId) {
    }
    async backupApplicationFiles(tempDir) {
    }
    async backupConfiguration(tempDir) {
    }
    async backupMediaFiles(tempDir, tenantId) {
    }
    async backupLogs(tempDir) {
    }
    async cleanupExpiredBackups() {
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
                }
                catch (error) {
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
                }
                catch (error) {
                    this.logger.error(`Failed to delete system backup ${backup.id}: ${error.message}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Cleanup failed: ${error.message}`, error.stack);
        }
    }
    getBackupProgress(backupId) {
        return this.runningBackups.get(backupId) || null;
    }
    getRestoreProgress(restoreId) {
        return this.runningRestores.get(restoreId) || null;
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "cleanupExpiredBackups", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], BackupService);
//# sourceMappingURL=backup.service.js.map