import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, ValidateNested, IsUrl, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Dynamic Page DTOs - For page management system
 * Strict validation with no unknown fields allowed
 */

// Page type enumeration for validation
export enum PageType {
  HOME = 'HOME',
  SERVICES = 'SERVICES',
  CONTACT = 'CONTACT',
  ABOUT = 'ABOUT',
  CUSTOM = 'CUSTOM'
}

// SEO configuration structure
export class SeoConfigDto {
  @ApiProperty({
    example: 'About Us - Your Company Name',
    description: 'Page meta title for SEO',
    required: false
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Learn more about our company history, mission, and values.',
    description: 'Page meta description for SEO',
    required: false
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'business, services, company, professional',
    description: 'Meta keywords for SEO',
    required: false
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({
    example: 'About Our Company',
    description: 'Open Graph title',
    required: false
  })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiProperty({
    example: 'Discover our story and commitment to excellence.',
    description: 'Open Graph description',
    required: false
  })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiProperty({
    example: 'https://example.com/og-about.jpg',
    description: 'Open Graph image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  ogImage?: string;
}

/**
 * Create Dynamic Page DTO
 */
export class CreateDynamicPageDto {
  @ApiProperty({
    example: '/about-us',
    description: 'Page URL slug (unique per tenant)',
    pattern: '^[a-z0-9-_/]+$'
  })
  @IsString()
  @Matches(/^\/[a-z0-9\-_\/]*[a-z0-9\-_]$/, {
    message: 'Slug must start with / and contain only lowercase letters, numbers, hyphens, and underscores'
  })
  slug: string;

  @ApiProperty({
    example: 'About Us',
    description: 'Page title for admin interface and SEO'
  })
  @IsString()
  title: string;

  @ApiProperty({
    enum: PageType,
    example: PageType.CUSTOM,
    description: 'Page type classification'
  })
  @IsEnum(PageType)
  pageType: PageType;

  @ApiProperty({
    type: SeoConfigDto,
    description: 'SEO configuration for this page',
    required: false
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeoConfigDto)
  seo?: SeoConfigDto;

  @ApiProperty({
    example: false,
    description: 'Whether page is published and visible',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    example: 'tr',
    description: 'Page content language',
    default: 'tr'
  })
  @IsOptional()
  @IsString()
  language?: string;
}

/**
 * Update Dynamic Page DTO
 */
export class UpdateDynamicPageDto {
  @ApiProperty({
    example: '/about-us',
    description: 'Page URL slug (unique per tenant)',
    pattern: '^[a-z0-9-_/]+$',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^\/[a-z0-9\-_\/]*[a-z0-9\-_]$/, {
    message: 'Slug must start with / and contain only lowercase letters, numbers, hyphens, and underscores'
  })
  slug?: string;

  @ApiProperty({
    example: 'About Us',
    description: 'Page title for admin interface and SEO',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    enum: PageType,
    example: PageType.CUSTOM,
    description: 'Page type classification',
    required: false
  })
  @IsOptional()
  @IsEnum(PageType)
  pageType?: PageType;

  @ApiProperty({
    type: SeoConfigDto,
    description: 'SEO configuration for this page',
    required: false
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeoConfigDto)
  seo?: SeoConfigDto;

  @ApiProperty({
    example: true,
    description: 'Whether page is published and visible',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

/**
 * Dynamic Page Response DTO
 */
export class DynamicPageResponseDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Page unique identifier'
  })
  id: string;

  @ApiProperty({
    example: 123,
    description: 'Tenant ID'
  })
  tenantId: number;

  @ApiProperty({
    example: '/about-us',
    description: 'Page URL slug'
  })
  slug: string;

  @ApiProperty({
    example: 'About Us',
    description: 'Page title'
  })
  title: string;

  @ApiProperty({
    example: 'CUSTOM_PAGE_abc123',
    description: 'Layout key for CMS system'
  })
  layoutKey: string;

  @ApiProperty({
    type: SeoConfigDto,
    description: 'SEO configuration',
    required: false
  })
  seo?: SeoConfigDto;

  @ApiProperty({
    example: true,
    description: 'Whether page is published'
  })
  published: boolean;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Publication timestamp',
    required: false
  })
  publishedAt?: Date;

  @ApiProperty({
    enum: PageType,
    example: PageType.CUSTOM,
    description: 'Page type'
  })
  pageType: PageType;

  @ApiProperty({
    example: 'tr',
    description: 'Page language'
  })
  language: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Page creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Page last update timestamp'
  })
  updatedAt: Date;
}

/**
 * Page list item DTO for listing pages
 */
export class PageListItemDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Page unique identifier'
  })
  id: string;

  @ApiProperty({
    example: '/about-us',
    description: 'Page URL slug'
  })
  slug: string;

  @ApiProperty({
    example: 'About Us',
    description: 'Page title'
  })
  title: string;

  @ApiProperty({
    enum: PageType,
    example: PageType.CUSTOM,
    description: 'Page type'
  })
  pageType: PageType;

  @ApiProperty({
    example: true,
    description: 'Whether page is published'
  })
  published: boolean;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Page last update timestamp'
  })
  updatedAt: Date;
}