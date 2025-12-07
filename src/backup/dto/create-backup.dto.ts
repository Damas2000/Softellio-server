import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SCHEMA_ONLY = 'schema_only',
  DATA_ONLY = 'data_only',
}

export enum SystemBackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  FILES_ONLY = 'files_only',
  CONFIG_ONLY = 'config_only',
  MEDIA_ONLY = 'media_only',
}

export enum CompressionType {
  GZIP = 'gzip',
  LZ4 = 'lz4',
  ZSTD = 'zstd',
  NONE = 'none',
}

export class CreateDatabaseBackupDto {
  @ApiProperty({ description: 'Human-readable backup name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Backup description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BackupType, description: 'Type of database backup' })
  @IsEnum(BackupType)
  backupType: BackupType;

  @ApiPropertyOptional({ enum: CompressionType, description: 'Compression type', default: CompressionType.GZIP })
  @IsOptional()
  @IsEnum(CompressionType)
  compressionType?: CompressionType;

  @ApiPropertyOptional({ description: 'Days to keep backup', minimum: 1, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  retentionDays?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether backup is automatically generated' })
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;
}

export class CreateSystemBackupDto {
  @ApiProperty({ description: 'Human-readable backup name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Backup description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SystemBackupType, description: 'Type of system backup' })
  @IsEnum(SystemBackupType)
  backupType: SystemBackupType;

  @ApiPropertyOptional({ description: 'Include database in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeDatabase?: boolean;

  @ApiPropertyOptional({ description: 'Include files in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean;

  @ApiPropertyOptional({ description: 'Include configuration in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeConfig?: boolean;

  @ApiPropertyOptional({ description: 'Include media files in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeMedia?: boolean;

  @ApiPropertyOptional({ description: 'Include logs in backup', default: false })
  @IsOptional()
  @IsBoolean()
  includeLogs?: boolean;

  @ApiPropertyOptional({ description: 'Days to keep backup', minimum: 1, maximum: 90 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  retentionDays?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether backup is automatically generated' })
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;
}