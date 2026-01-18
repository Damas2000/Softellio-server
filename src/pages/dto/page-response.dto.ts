import { ApiProperty } from '@nestjs/swagger';
import { PageStatus } from './create-page.dto';

export class PageTranslationResponseDto {
  @ApiProperty({
    description: 'Translation ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Language code',
    example: 'tr',
  })
  language: string;

  @ApiProperty({
    description: 'Page title in this language',
    example: 'Hakkımızda',
  })
  title: string;

  @ApiProperty({
    description: 'URL slug in this language',
    example: 'hakkimizda',
  })
  slug: string;

  @ApiProperty({
    description: 'Rich content as JSON',
    required: false,
    example: {
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'Bu bizim hikayemiz...' }
        }
      ]
    },
  })
  contentJson?: any;

  @ApiProperty({
    description: 'SEO meta title',
    required: false,
    example: 'Şirketimiz Hakkında - Demo',
  })
  metaTitle?: string;

  @ApiProperty({
    description: 'SEO meta description',
    required: false,
    example: 'Hakkımızda bilgi edinin ve hikayemizi öğrenin.',
  })
  metaDescription?: string;
}

export class PageResponseDto {
  @ApiProperty({
    description: 'Unique page identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tenant ID this page belongs to',
    example: 5,
  })
  tenantId: number;

  @ApiProperty({
    description: 'Page status',
    enum: PageStatus,
    example: PageStatus.PUBLISHED,
  })
  status: PageStatus;

  @ApiProperty({
    description: 'Page creation timestamp',
    example: '2025-12-21T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Page last update timestamp',
    example: '2025-12-21T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'All translations for this page',
    type: [PageTranslationResponseDto],
  })
  translations: PageTranslationResponseDto[];
}

export class PaginatedPageResponseDto {
  @ApiProperty({
    description: 'Array of pages in current page',
    type: [PageResponseDto],
  })
  pages: PageResponseDto[];

  @ApiProperty({
    description: 'Total number of pages matching the query',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages in pagination',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}

export class PageDeleteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Page deleted successfully',
  })
  message: string;
}

export class BulkDeleteResponseDto {
  @ApiProperty({
    description: 'Number of pages deleted',
    example: 3,
  })
  deleted: number;
}