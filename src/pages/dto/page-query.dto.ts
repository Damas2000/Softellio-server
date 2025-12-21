import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max, Length, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PageStatus } from './create-page.dto';

export class PageQueryDto {
  @ApiProperty({
    description: 'Filter pages by status',
    enum: PageStatus,
    required: false,
    example: PageStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiProperty({
    description: 'Filter pages by language (returns pages with translations in this language)',
    required: false,
    example: 'tr',
    minLength: 2,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(2, 10, { message: 'Language code must be between 2 and 10 characters' })
  language?: string;

  @ApiProperty({
    description: 'Search in page title and slug (case-insensitive)',
    required: false,
    example: 'hakkımızda',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Search term must be between 1 and 100 characters' })
  search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page number must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort pages by field',
    required: false,
    enum: ['createdAt', 'updatedAt', 'title', 'status'],
    default: 'updatedAt',
    example: 'updatedAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status' = 'updatedAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Filter pages created after this date (ISO 8601)',
    required: false,
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created after date must be a valid ISO 8601 date string' })
  createdAfter?: string;

  @ApiProperty({
    description: 'Filter pages created before this date (ISO 8601)',
    required: false,
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created before date must be a valid ISO 8601 date string' })
  createdBefore?: string;
}