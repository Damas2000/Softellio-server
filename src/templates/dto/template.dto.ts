import { IsString, IsOptional, IsArray, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Template DTOs - Read-only global template system
 * Templates cannot be modified through the API, only read
 */

export class TemplateResponseDto {
  @ApiProperty({
    example: 'printing-premium-v1',
    description: 'Unique template key identifier'
  })
  key: string;

  @ApiProperty({
    example: 'Premium Printing Template',
    description: 'Human-readable template name'
  })
  name: string;

  @ApiProperty({
    example: 'Professional template for printing companies with hero, services, and contact sections',
    description: 'Template description',
    required: false
  })
  description?: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'Template version for compatibility tracking'
  })
  version: string;

  @ApiProperty({
    example: 'https://example.com/template-preview.jpg',
    description: 'Preview image URL',
    required: false
  })
  previewImage?: string;

  @ApiProperty({
    example: ['hero', 'services', 'testimonials', 'contact', 'gallery'],
    description: 'Array of supported section types'
  })
  supportedSections: string[];

  @ApiProperty({
    example: {
      sections: [
        {
          type: 'hero',
          variant: 'default',
          order: 1,
          enabled: true,
          propsJson: {
            title: 'Your Business Name',
            subtitle: 'Professional services you can trust'
          }
        }
      ]
    },
    description: 'Default layout structure for new tenants'
  })
  defaultLayout: any;

  @ApiProperty({
    example: true,
    description: 'Whether template is active and available for use'
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Template creation timestamp'
  })
  createdAt: Date;
}

/**
 * Create template DTO (Admin only - for seeding/management)
 */
export class CreateTemplateDto {
  @ApiProperty({
    example: 'printing-premium-v2',
    description: 'Unique template key identifier'
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: 'Premium Printing Template v2',
    description: 'Human-readable template name'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Enhanced template for printing companies with advanced features',
    description: 'Template description',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2.0.0',
    description: 'Template version'
  })
  @IsString()
  version: string;

  @ApiProperty({
    example: 'https://example.com/template-preview-v2.jpg',
    description: 'Preview image URL',
    required: false
  })
  @IsOptional()
  @IsString()
  previewImage?: string;

  @ApiProperty({
    example: ['hero', 'services', 'testimonials', 'contact', 'gallery', 'portfolio'],
    description: 'Array of supported section types'
  })
  @IsArray()
  @IsString({ each: true })
  supportedSections: string[];

  @ApiProperty({
    example: {
      sections: [
        {
          type: 'hero',
          variant: 'default',
          order: 1,
          enabled: true,
          propsJson: {
            title: 'Your Business Name',
            subtitle: 'Professional services you can trust'
          }
        }
      ]
    },
    description: 'Default layout structure'
  })
  @IsObject()
  defaultLayout: any;

  @ApiProperty({
    example: true,
    description: 'Whether template is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}