import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, Length, Matches, ArrayMinSize } from 'class-validator';
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
    minLength: 2,
    maxLength: 10,
  })
  @IsString()
  @Length(2, 10, {
    message: 'Language code must be between 2 and 10 characters'
  })
  language: string;

  @ApiProperty({
    example: 'Hakkımızda',
    description: 'Page title in this language',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200, {
    message: 'Title must be between 1 and 200 characters'
  })
  title: string;

  @ApiProperty({
    example: 'hakkimizda',
    description: 'URL slug in this language (lowercase letters, numbers, and hyphens only)',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @Length(1, 100, {
    message: 'Slug must be between 1 and 100 characters'
  })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens'
  })
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
    minLength: 1,
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(1, 300, {
    message: 'Meta title must be between 1 and 300 characters'
  })
  metaTitle?: string;

  @ApiProperty({
    example: 'Şirketimizin geçmişi, vizyonu ve ekibi hakkında bilgi edinin.',
    description: 'SEO meta description',
    required: false,
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, {
    message: 'Meta description must be between 1 and 500 characters'
  })
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
    description: 'Page translations for different languages (at least one required)',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one translation is required'
  })
  @ValidateNested({ each: true })
  @Type(() => PageTranslationDto)
  translations: PageTranslationDto[];
}

export { PageStatus, PageTranslationDto };