import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PostTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code (tr, en, ar, etc.)',
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Yapay Zeka ve Gelecek',
    description: 'Post title in this language',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'yapay-zeka-ve-gelecek',
    description: 'URL slug in this language',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'Yapay zeka teknolojilerinin gelecekteki rolü hakkında detaylı bir analiz...',
    description: 'Post summary/excerpt',
    required: false,
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    example: {
      blocks: [
        { type: 'header', data: { text: 'Yapay Zeka ve Gelecek', level: 1 } },
        { type: 'paragraph', data: { text: 'Yapay zeka teknolojilerinin günümüzdeki gelişimi...' } }
      ]
    },
    description: 'Post content as JSON (supports rich content, blocks, etc.)',
    required: false,
  })
  @IsOptional()
  contentJson?: any;

  @ApiProperty({
    example: 'Yapay Zeka ve Gelecek | Blog',
    description: 'SEO meta title',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Yapay zeka teknolojilerinin gelecekteki rolü ve etkisi hakkında detaylı analiz.',
    description: 'SEO meta description',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class CreatePostDto {
  @ApiProperty({
    example: 1,
    description: 'Category ID for this post',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    example: 1,
    description: 'Author user ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the post is published',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'When to publish the post (for scheduled publishing)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @ApiProperty({
    type: [PostTranslationDto],
    description: 'Post translations for different languages',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostTranslationDto)
  translations: PostTranslationDto[];
}

export { PostTranslationDto };