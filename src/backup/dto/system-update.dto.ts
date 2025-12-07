import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UpdateType {
  PATCH = 'patch',
  MINOR = 'minor',
  MAJOR = 'major',
  SECURITY = 'security',
  HOTFIX = 'hotfix',
}

export class CreateSystemUpdateDto {
  @ApiProperty({ description: 'Update name/title' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Update description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: UpdateType, description: 'Type of update' })
  @IsEnum(UpdateType)
  updateType: UpdateType;

  @ApiProperty({ description: 'Target version to update to' })
  @IsString()
  version: string;

  @ApiPropertyOptional({ description: 'Current system version' })
  @IsOptional()
  @IsString()
  currentVersion?: string;

  @ApiPropertyOptional({ description: 'URL to download update package' })
  @IsOptional()
  @IsUrl()
  packageUrl?: string;

  @ApiPropertyOptional({ description: 'Package size in bytes' })
  @IsOptional()
  @IsNumber()
  packageSize?: number;

  @ApiPropertyOptional({ description: 'Package integrity checksum' })
  @IsOptional()
  @IsString()
  packageChecksum?: string;

  @ApiPropertyOptional({ description: 'Release notes or changelog' })
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiPropertyOptional({ description: 'System requirements for update' })
  @IsOptional()
  requirements?: any;

  @ApiPropertyOptional({ description: 'Dependencies that need to be updated' })
  @IsOptional()
  dependencies?: any;

  @ApiPropertyOptional({ description: 'Known conflicts or issues' })
  @IsOptional()
  conflicts?: any;

  @ApiPropertyOptional({ description: 'Automatically create backup before update', default: true })
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @ApiPropertyOptional({ description: 'When update is scheduled' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Whether rollback is possible', default: true })
  @IsOptional()
  @IsBoolean()
  canRollback?: boolean;

  @ApiPropertyOptional({ description: 'Notify when update completes', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnComplete?: boolean;

  @ApiPropertyOptional({ description: 'Notify if update fails', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @ApiPropertyOptional({ description: 'Email addresses for notifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateSystemUpdateDto {
  @ApiPropertyOptional({ description: 'Update name/title' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Update description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'When update is scheduled' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Whether rollback is possible' })
  @IsOptional()
  @IsBoolean()
  canRollback?: boolean;

  @ApiPropertyOptional({ description: 'Notify when update completes' })
  @IsOptional()
  @IsBoolean()
  notifyOnComplete?: boolean;

  @ApiPropertyOptional({ description: 'Notify if update fails' })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @ApiPropertyOptional({ description: 'Email addresses for notifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SystemUpdateResponse {
  @ApiProperty({ description: 'Update operation ID' })
  id: string;

  @ApiProperty({ description: 'Update name' })
  name: string;

  @ApiProperty({ description: 'Target version' })
  version: string;

  @ApiProperty({ description: 'Update type' })
  updateType: string;

  @ApiProperty({ description: 'Current status of the update' })
  status: string;

  @ApiProperty({ description: 'Current progress percentage (0-100)' })
  progress: number;

  @ApiPropertyOptional({ description: 'Current phase of update operation' })
  currentPhase?: string;

  @ApiPropertyOptional({ description: 'Error message if update failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'When update was created' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'When update was started' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'When update was completed' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'When update was scheduled' })
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Whether rollback is possible' })
  canRollback?: boolean;
}