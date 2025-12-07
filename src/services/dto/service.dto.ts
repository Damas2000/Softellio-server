import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code for this translation'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'İnşaat Hizmetleri',
    description: 'Service title in this language'
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'insaat-hizmetleri',
    description: 'URL-friendly slug for this service'
  })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'Kaliteli inşaat hizmetleri sunuyoruz.',
    description: 'Short description of the service',
    required: false
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    example: {
      blocks: [
        { type: 'header', data: { text: 'İnşaat Hizmetleri', level: 2 } },
        { type: 'paragraph', data: { text: 'Detaylı hizmet açıklaması...' } }
      ]
    },
    description: 'Full service content in JSON format',
    required: false
  })
  @IsOptional()
  contentJson?: any;

  @ApiProperty({
    example: 'İnşaat Hizmetleri - Firma Adı',
    description: 'SEO meta title',
    required: false
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Kaliteli inşaat hizmetleri hakkında detaylı bilgi',
    description: 'SEO meta description',
    required: false
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class CreateServiceDto {
  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'Icon or image URL for the service',
    required: false
  })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiProperty({
    example: 1,
    description: 'Display order (lower numbers appear first)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the service is active',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean = true;

  @ApiProperty({
    example: false,
    description: 'Whether the service is featured',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFeatured?: boolean = false;

  @ApiProperty({
    type: [ServiceTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations: ServiceTranslationDto[];
}

export class UpdateServiceDto {
  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'Icon or image URL for the service',
    required: false
  })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiProperty({
    example: 1,
    description: 'Display order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the service is active',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the service is featured',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFeatured?: boolean;

  @ApiProperty({
    type: [ServiceTranslationDto],
    description: 'Updated translations for different languages',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations?: ServiceTranslationDto[];
}

export class ServiceQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number for pagination',
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    example: 20,
    description: 'Number of items per page',
    required: false,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiProperty({
    example: 'insaat',
    description: 'Search term for service title',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by featured services only',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({
    example: 'order',
    description: 'Field to sort by',
    enum: ['order', 'createdAt', 'updatedAt', 'title'],
    required: false,
    default: 'order'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'title' = 'order';

  @ApiProperty({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}