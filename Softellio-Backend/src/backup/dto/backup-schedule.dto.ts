import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScheduleType {
  DATABASE = 'database',
  SYSTEM = 'system',
  FILES = 'files',
  CONFIG = 'config',
}

export enum ScheduleBackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export class CreateBackupScheduleDto {
  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Schedule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ScheduleType, description: 'Type of backup to schedule' })
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @ApiProperty({ enum: ScheduleBackupType, description: 'Backup type for scheduled backups' })
  @IsEnum(ScheduleBackupType)
  backupType: ScheduleBackupType;

  @ApiProperty({
    description: 'Cron expression for scheduling (e.g., "0 2 * * *" for daily at 2 AM)',
    example: '0 2 * * *'
  })
  @IsString()
  @Matches(/^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([12]?\d|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/, {
    message: 'Invalid cron expression format',
  })
  cronExpression: string;

  @ApiPropertyOptional({ description: 'Timezone for scheduling', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Enable or disable schedule', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Days to keep backups', minimum: 1, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  retentionDays?: number;

  @ApiPropertyOptional({ description: 'Compression type for backups' })
  @IsOptional()
  @IsString()
  compressionType?: string;

  @ApiPropertyOptional({ description: 'Maximum number of backups to keep', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxBackups?: number;

  @ApiPropertyOptional({ description: 'Notify on successful backup' })
  @IsOptional()
  @IsBoolean()
  notifyOnSuccess?: boolean;

  @ApiPropertyOptional({ description: 'Notify on backup failure' })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @ApiPropertyOptional({ description: 'Email addresses for notifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Maximum allowed duration in seconds' })
  @IsOptional()
  @IsNumber()
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum allowed backup size in bytes' })
  @IsOptional()
  @IsNumber()
  maxSize?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateBackupScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Schedule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Cron expression for scheduling',
    example: '0 2 * * *'
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([12]?\d|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/, {
    message: 'Invalid cron expression format',
  })
  cronExpression?: string;

  @ApiPropertyOptional({ description: 'Timezone for scheduling' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Enable or disable schedule' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Days to keep backups', minimum: 1, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  retentionDays?: number;

  @ApiPropertyOptional({ description: 'Maximum number of backups to keep', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxBackups?: number;

  @ApiPropertyOptional({ description: 'Notify on successful backup' })
  @IsOptional()
  @IsBoolean()
  notifyOnSuccess?: boolean;

  @ApiPropertyOptional({ description: 'Notify on backup failure' })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @ApiPropertyOptional({ description: 'Email addresses for notifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Maximum allowed duration in seconds' })
  @IsOptional()
  @IsNumber()
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum allowed backup size in bytes' })
  @IsOptional()
  @IsNumber()
  maxSize?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}