import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  Length,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLayoutDto {
  @ApiProperty({
    description: 'Layout key identifier',
    example: 'ABOUT'
  })
  @IsString()
  @Length(1, 50)
  key: string;

  @ApiProperty({
    description: 'Content language',
    example: 'tr',
    default: 'tr'
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiProperty({
    description: 'Layout status',
    example: 'published',
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;
}

export class UpdateLayoutDto {
  @ApiProperty({ description: 'Layout key identifier', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  key?: string;

  @ApiProperty({ description: 'Content language', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiProperty({ description: 'Layout status', enum: ['draft', 'published', 'archived'], required: false })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;
}

export class CreateSectionDto {
  @ApiProperty({
    description: 'Section type (hero, services, testimonials, etc.)',
    example: 'hero'
  })
  @IsString()
  @Length(1, 50)
  type: string;

  @ApiProperty({
    description: 'Section variant (premium, basic, v1, v2, etc.)',
    example: 'premium',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  variant?: string;

  @ApiProperty({
    description: 'Section order in layout',
    example: 1,
    minimum: 0,
    maximum: 100
  })
  @IsInt()
  @Min(0)
  @Max(100)
  order: number;

  @ApiProperty({
    description: 'Section is enabled/visible',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'Section status',
    example: 'published',
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiProperty({
    description: 'Section props/configuration as JSON',
    example: {
      title: 'Welcome to Our Site',
      subtitle: 'We provide excellent services',
      backgroundColor: '#1E40AF',
      textAlign: 'center'
    }
  })
  @IsObject()
  propsJson: object;
}

export class UpdateSectionDto {
  @ApiProperty({ description: 'Section type', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  type?: string;

  @ApiProperty({ description: 'Section variant', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  variant?: string;

  @ApiProperty({ description: 'Section order in layout', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  order?: number;

  @ApiProperty({ description: 'Section is enabled/visible', required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: 'Section status', enum: ['draft', 'published', 'archived'], required: false })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiProperty({ description: 'Section props/configuration as JSON', required: false })
  @IsOptional()
  @IsObject()
  propsJson?: object;
}

export class ReorderSectionDto {
  @ApiProperty({ description: 'Section ID', example: 1 })
  @IsInt()
  sectionId: number;

  @ApiProperty({ description: 'New order position', example: 2, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  newOrder: number;
}

export class ReorderSectionsDto {
  @ApiProperty({
    description: 'Array of section reorder operations',
    type: [ReorderSectionDto],
    example: [
      { sectionId: 1, newOrder: 2 },
      { sectionId: 2, newOrder: 1 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSectionDto)
  sections: ReorderSectionDto[];
}

export class SectionResponseDto {
  @ApiProperty({ description: 'Section ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tenant ID', example: 1 })
  tenantId: number;

  @ApiProperty({ description: 'Layout ID', example: 1 })
  layoutId: number;

  @ApiProperty({ description: 'Section type', example: 'hero' })
  type: string;

  @ApiProperty({ description: 'Section variant', example: 'premium', required: false })
  variant?: string;

  @ApiProperty({ description: 'Section order in layout', example: 1 })
  order: number;

  @ApiProperty({ description: 'Section is enabled/visible', example: true })
  isEnabled: boolean;

  @ApiProperty({ description: 'Section status', example: 'published' })
  status: string;

  @ApiProperty({ description: 'Section props/configuration as JSON' })
  propsJson: object;

  @ApiProperty({ description: 'Section creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Section last update date' })
  updatedAt: Date;
}

export class LayoutResponseDto {
  @ApiProperty({ description: 'Layout ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tenant ID', example: 1 })
  tenantId: number;

  @ApiProperty({ description: 'Layout key identifier', example: 'ABOUT' })
  key: string;

  @ApiProperty({ description: 'Content language', example: 'tr' })
  language?: string;

  @ApiProperty({ description: 'Layout status', example: 'published' })
  status: string;

  @ApiProperty({ description: 'Layout creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Layout last update date' })
  updatedAt: Date;

  @ApiProperty({ type: [SectionResponseDto], description: 'Layout sections', required: false })
  sections?: SectionResponseDto[];
}

export class LayoutQueryDto {
  @ApiProperty({
    description: 'Search term for layout key',
    example: 'about',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by language',
    example: 'tr',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['draft', 'published', 'archived'],
    required: false
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

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

export class PaginatedLayoutResponseDto {
  @ApiProperty({ type: [LayoutResponseDto] })
  layouts: LayoutResponseDto[];

  @ApiProperty({ description: 'Total number of layouts', example: 42 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;
}