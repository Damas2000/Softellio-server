import { IsString, IsOptional, IsInt, IsBoolean, IsObject, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageSectionDto {
  @ApiProperty({
    example: 1,
    description: 'Layout ID this section belongs to',
  })
  @IsInt()
  layoutId: number;

  @ApiProperty({
    example: 'hero',
    description: 'Section type',
    enum: ['hero', 'features', 'servicesGrid', 'promoCards', 'testimonials', 'faq', 'blogGrid', 'teamGrid', 'contactCta', 'stats', 'gallery'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'v1',
    description: 'Section variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({
    example: 1,
    description: 'Display order (will be auto-assigned if not provided)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether section is enabled/visible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    example: 'published',
    description: 'Section status',
    enum: ['published', 'draft'],
    default: 'published',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: {
      title: 'Welcome to Our Site',
      subtitle: 'We create amazing experiences',
      buttonText: 'Get Started',
      buttonUrl: '/contact'
    },
    description: 'Section configuration and content as JSON object',
  })
  @IsObject()
  propsJson: any;
}

export class UpdatePageSectionDto {
  @ApiProperty({
    example: 'hero',
    description: 'Section type',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: 'v2',
    description: 'Section variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({
    example: true,
    description: 'Whether section is enabled/visible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    example: 'published',
    description: 'Section status',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: {
      title: 'Updated Title',
      subtitle: 'Updated subtitle'
    },
    description: 'Updated section configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  propsJson?: any;
}

export class ReorderSectionItemDto {
  @ApiProperty({
    example: 1,
    description: 'Section ID',
  })
  @IsInt()
  id: number;

  @ApiProperty({
    example: 2,
    description: 'New order position',
  })
  @IsInt()
  @Min(1)
  order: number;
}

export class ReorderSectionsDto {
  @ApiProperty({
    type: [ReorderSectionItemDto],
    description: 'Array of sections with new order',
    example: [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSectionItemDto)
  items: ReorderSectionItemDto[];
}

export class ToggleSectionDto {
  @ApiProperty({
    example: true,
    description: 'Whether to enable or disable the section',
  })
  @IsBoolean()
  isEnabled: boolean;
}

export class PageSectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  tenantId: number;

  @ApiProperty({ example: 1 })
  layoutId: number;

  @ApiProperty({ example: 'hero' })
  type: string;

  @ApiProperty({ example: 'v1' })
  variant: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isEnabled: boolean;

  @ApiProperty({ example: 'published' })
  status: string;

  @ApiProperty({
    example: {
      title: 'Welcome to Our Site',
      subtitle: 'We create amazing experiences'
    }
  })
  propsJson: any;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}

export class PageLayoutResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  tenantId: number;

  @ApiProperty({ example: 'HOME' })
  key: string;

  @ApiProperty({ example: 'tr' })
  language: string;

  @ApiProperty({ example: 'published' })
  status: string;

  @ApiProperty({ type: [PageSectionResponseDto] })
  sections: PageSectionResponseDto[];

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}

export class UpsertPageLayoutDto {
  @ApiProperty({
    example: 'tr',
    description: 'Layout language',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    example: 'published',
    description: 'Layout status',
    enum: ['published', 'draft'],
    default: 'published',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CmsSectionDto {
  @ApiProperty({
    example: 'hero',
    description: 'Section type',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'default',
    description: 'Section variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({
    example: 1,
    description: 'Display order',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether section is enabled/visible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    example: {
      title: 'Welcome to Our Site',
      subtitle: 'We create amazing experiences',
      buttonText: 'Get Started'
    },
    description: 'Section configuration and content as JSON object',
  })
  @IsOptional()
  @IsObject()
  propsJson?: any;
}

export class UpdatePageLayoutDto {
  @ApiProperty({
    example: 'published',
    description: 'Layout status',
    enum: ['published', 'draft'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    type: [CmsSectionDto],
    description: 'Array of sections for the layout',
    required: false,
    example: [
      {
        type: 'hero',
        variant: 'default',
        order: 1,
        enabled: true,
        propsJson: {
          title: 'Welcome to Our Site',
          subtitle: 'We create amazing experiences'
        }
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsSectionDto)
  sections?: CmsSectionDto[];
}