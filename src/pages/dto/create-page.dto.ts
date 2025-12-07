import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

class PageTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code (tr, en, ar, etc.)',
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Hakkımızda',
    description: 'Page title in this language',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'hakkimizda',
    description: 'URL slug in this language',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    example: { blocks: [{ type: 'paragraph', data: { text: 'Bu bizim hikayemiz...' } }] },
    description: 'Page content as JSON (supports rich content, blocks, etc.)',
    required: false,
  })
  @IsOptional()
  contentJson?: any;

  @ApiProperty({
    example: 'Şirketimiz Hakkında | Ana Sayfa',
    description: 'SEO meta title',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Şirketimizin geçmişi, vizyonu ve ekibi hakkında bilgi edinin.',
    description: 'SEO meta description',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class CreatePageDto {
  @ApiProperty({
    enum: PageStatus,
    example: PageStatus.DRAFT,
    description: 'Page publication status',
    default: PageStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus = PageStatus.DRAFT;

  @ApiProperty({
    type: [PageTranslationDto],
    description: 'Page translations for different languages',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageTranslationDto)
  translations: PageTranslationDto[];
}

export { PageStatus, PageTranslationDto };