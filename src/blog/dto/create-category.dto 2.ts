import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CategoryTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code (tr, en, ar, etc.)',
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Teknoloji',
    description: 'Category name in this language',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'teknoloji',
    description: 'URL slug in this language',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class CreateCategoryDto {
  @ApiProperty({
    example: 1,
    description: 'Parent category ID for hierarchical categories',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    type: [CategoryTranslationDto],
    description: 'Category translations for different languages',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  translations: CategoryTranslationDto[];
}

export { CategoryTranslationDto };