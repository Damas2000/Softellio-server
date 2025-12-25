import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RestoreType {
  FULL = 'full',
  PARTIAL = 'partial',
  SELECTIVE = 'selective',
}

export enum RestoreBackupType {
  DATABASE = 'database',
  SYSTEM = 'system',
  FILES = 'files',
  CONFIG = 'config',
}

export class CreateRestoreOperationDto {
  @ApiProperty({ description: 'ID of the backup to restore' })
  @IsString()
  backupId: string;

  @ApiProperty({ enum: RestoreBackupType, description: 'Type of backup to restore' })
  @IsEnum(RestoreBackupType)
  backupType: RestoreBackupType;

  @ApiProperty({ enum: RestoreType, description: 'Type of restore operation' })
  @IsEnum(RestoreType)
  restoreType: RestoreType;

  @ApiPropertyOptional({ description: 'Target restore location (if different from original)' })
  @IsOptional()
  @IsString()
  targetLocation?: string;

  @ApiPropertyOptional({ description: 'Restore database components', default: true })
  @IsOptional()
  @IsBoolean()
  restoreDatabase?: boolean;

  @ApiPropertyOptional({ description: 'Restore files', default: true })
  @IsOptional()
  @IsBoolean()
  restoreFiles?: boolean;

  @ApiPropertyOptional({ description: 'Restore configuration', default: true })
  @IsOptional()
  @IsBoolean()
  restoreConfig?: boolean;

  @ApiPropertyOptional({ description: 'Restore media files', default: true })
  @IsOptional()
  @IsBoolean()
  restoreMedia?: boolean;

  @ApiPropertyOptional({ description: 'Reason for restore operation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RestoreOperationResponse {
  @ApiProperty({ description: 'Restore operation ID' })
  id: string;

  @ApiProperty({ description: 'Current status of the restore' })
  status: string;

  @ApiProperty({ description: 'Current progress percentage (0-100)' })
  progress: number;

  @ApiPropertyOptional({ description: 'Current phase of restore operation' })
  currentPhase?: string;

  @ApiPropertyOptional({ description: 'Error message if restore failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'When restore was started' })
  startedAt: Date;

  @ApiPropertyOptional({ description: 'When restore was completed' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Duration of restore in seconds' })
  duration?: number;
}