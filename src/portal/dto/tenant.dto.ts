import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUrl,
  Length,
  ArrayMinSize,
  Matches
} from 'class-validator';
import { SubscriptionStatus, PlanKey } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Tenant domain (subdomain or custom domain)',
    example: 'acme.softellio.com'
  })
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, {
    message: 'Domain must be a valid domain name (lowercase, alphanumeric, hyphens, dots)',
  })
  domain: string;

  @ApiProperty({
    description: 'Default language',
    example: 'tr',
    default: 'tr'
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  defaultLanguage?: string;

  @ApiProperty({
    description: 'Available languages',
    example: ['tr', 'en'],
    type: [String],
    default: ['tr']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  availableLanguages?: string[];

  @ApiProperty({
    description: 'Template theme key',
    example: 'printing-premium-v1',
    required: false
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({
    description: 'Primary brand color',
    example: '#3B82F6',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Primary color must be a valid hex color (e.g., #3B82F6)',
  })
  primaryColor?: string;

  @ApiProperty({
    enum: SubscriptionStatus,
    description: 'Subscription status',
    example: SubscriptionStatus.trial,
    default: SubscriptionStatus.trial
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty({
    enum: PlanKey,
    description: 'Plan key',
    example: PlanKey.basic,
    default: PlanKey.basic
  })
  @IsOptional()
  @IsEnum(PlanKey)
  planKey?: PlanKey;

  @ApiProperty({
    description: 'Tenant is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTenantDto {
  @ApiProperty({ description: 'Tenant name', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({ description: 'Tenant domain', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, {
    message: 'Domain must be a valid domain name (lowercase, alphanumeric, hyphens, dots)',
  })
  domain?: string;

  @ApiProperty({ description: 'Default language', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  defaultLanguage?: string;

  @ApiProperty({ description: 'Available languages', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  availableLanguages?: string[];

  @ApiProperty({ description: 'Template theme key', required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ description: 'Primary brand color', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Primary color must be a valid hex color (e.g., #3B82F6)',
  })
  primaryColor?: string;

  @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status', required: false })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty({ enum: PlanKey, description: 'Plan key', required: false })
  @IsOptional()
  @IsEnum(PlanKey)
  planKey?: PlanKey;

  @ApiProperty({ description: 'Tenant is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation' })
  name: string;

  @ApiProperty({ description: 'Unique tenant slug', example: 'ckx1234567890' })
  slug: string;

  @ApiProperty({ description: 'Tenant domain', example: 'acme.softellio.com' })
  domain: string;

  @ApiProperty({ description: 'Tenant status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Default language', example: 'tr' })
  defaultLanguage: string;

  @ApiProperty({ description: 'Available languages', type: [String], example: ['tr', 'en'] })
  availableLanguages: string[];

  @ApiProperty({ description: 'Template theme key', example: 'printing-premium-v1', required: false })
  theme?: string;

  @ApiProperty({ description: 'Primary brand color', example: '#3B82F6', required: false })
  primaryColor?: string;

  @ApiProperty({ description: 'Tenant is active', example: true })
  isActive: boolean;

  @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status' })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({ enum: PlanKey, description: 'Plan key' })
  planKey: PlanKey;

  @ApiProperty({ description: 'Current period start', required: false })
  currentPeriodStart?: Date;

  @ApiProperty({ description: 'Current period end', required: false })
  currentPeriodEnd?: Date;

  @ApiProperty({ description: 'Tenant creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Tenant last update date' })
  updatedAt: Date;
}

export class TenantQueryDto {
  @ApiProperty({
    description: 'Search term for name or domain',
    example: 'acme',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: SubscriptionStatus,
    description: 'Filter by subscription status',
    required: false
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    required: false
  })
  @IsOptional()
  limit?: number = 20;
}

export class PaginatedTenantResponseDto {
  @ApiProperty({ type: [TenantResponseDto] })
  tenants: TenantResponseDto[];

  @ApiProperty({ description: 'Total number of tenants', example: 42 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;
}