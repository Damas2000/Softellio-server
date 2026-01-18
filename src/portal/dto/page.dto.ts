import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
  IsDateString,
  Length,
  Matches
} from 'class-validator';
import { PageType } from '@prisma/client';

export class CreatePageDto {
  @ApiProperty({
    description: 'Page URL slug',
    example: '/about-us',
    pattern: '^/[a-z0-9-/]*$'
  })
  @IsString()
  @Length(1, 200)
  @Matches(/^\/[a-z0-9\-\/]*$/, {
    message: 'Slug must start with / and contain only lowercase letters, numbers, hyphens, and forward slashes',
  })
  slug: string;

  @ApiProperty({
    description: 'Page title',
    example: 'About Us'
  })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty({
    description: 'Layout key reference',
    example: 'ABOUT',
    default: 'CUSTOM'
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  layoutKey?: string;

  @ApiProperty({
    description: 'SEO configuration',
    example: {
      metaTitle: 'About Us - Company Name',
      metaDescription: 'Learn more about our company history and values',
      metaKeywords: 'about, company, history',
      ogTitle: 'About Us',
      ogDescription: 'Learn more about our company',
      ogImage: 'https://example.com/og-image.jpg'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  seo?: object;

  @ApiProperty({
    enum: PageType,
    description: 'Page type classification',
    example: PageType.CUSTOM,
    default: PageType.CUSTOM
  })
  @IsOptional()
  @IsEnum(PageType)
  pageType?: PageType;

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
    description: 'Page is published',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdatePageDto {
  @ApiProperty({ description: 'Page URL slug', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Matches(/^\/[a-z0-9\-\/]*$/, {
    message: 'Slug must start with / and contain only lowercase letters, numbers, hyphens, and forward slashes',
  })
  slug?: string;

  @ApiProperty({ description: 'Page title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiProperty({ description: 'Layout key reference', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  layoutKey?: string;

  @ApiProperty({ description: 'SEO configuration', required: false })
  @IsOptional()
  @IsObject()
  seo?: object;

  @ApiProperty({ enum: PageType, description: 'Page type classification', required: false })
  @IsOptional()
  @IsEnum(PageType)
  pageType?: PageType;

  @ApiProperty({ description: 'Content language', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiProperty({ description: 'Page is published', required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class PageResponseDto {
  @ApiProperty({ description: 'Page ID', example: 'ckx1234567890' })
  id: string;

  @ApiProperty({ description: 'Tenant ID', example: 1 })
  tenantId: number;

  @ApiProperty({ description: 'Page URL slug', example: '/about-us' })
  slug: string;

  @ApiProperty({ description: 'Page title', example: 'About Us' })
  title: string;

  @ApiProperty({ description: 'Layout key reference', example: 'ABOUT' })
  layoutKey: string;

  @ApiProperty({ description: 'SEO configuration', required: false })
  seo?: object;

  @ApiProperty({ description: 'Page is published', example: true })
  published: boolean;

  @ApiProperty({ description: 'Published date', required: false })
  publishedAt?: Date;

  @ApiProperty({ enum: PageType, description: 'Page type classification' })
  pageType: PageType;

  @ApiProperty({ description: 'Content language', example: 'tr' })
  language: string;

  @ApiProperty({ description: 'Page creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Page last update date' })
  updatedAt: Date;
}

export class PageQueryDto {
  @ApiProperty({
    description: 'Search term for title or slug',
    example: 'about',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by published status',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    enum: PageType,
    description: 'Filter by page type',
    required: false
  })
  @IsOptional()
  @IsEnum(PageType)
  pageType?: PageType;

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

export class PaginatedPageResponseDto {
  @ApiProperty({ type: [PageResponseDto] })
  pages: PageResponseDto[];

  @ApiProperty({ description: 'Total number of pages', example: 42 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;
}

export class PublishPageDto {
  @ApiProperty({
    description: 'Publish date/time (optional, defaults to now)',
    example: '2024-01-15T10:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}