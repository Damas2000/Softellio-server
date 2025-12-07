import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, ValidateNested, IsArray, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReferenceTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code for this translation'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'İstanbul Plaza İnşaatı',
    description: 'Project title in this language'
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'istanbul-plaza-insaati',
    description: 'URL-friendly slug for this project'
  })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'Modern plaza inşaat projesi',
    description: 'Short project description',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      blocks: [
        { type: 'header', data: { text: 'İstanbul Plaza İnşaatı', level: 2 } },
        { type: 'paragraph', data: { text: 'Detaylı proje açıklaması...' } }
      ]
    },
    description: 'Full project content in JSON format',
    required: false
  })
  @IsOptional()
  contentJson?: any;

  @ApiProperty({
    example: 'İstanbul Plaza İnşaatı - ABC İnşaat',
    description: 'SEO meta title',
    required: false
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'İstanbul Plaza inşaat projesi hakkında detaylı bilgi',
    description: 'SEO meta description',
    required: false
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class ReferenceGalleryDto {
  @ApiProperty({
    example: 'https://example.com/images/project1.jpg',
    description: 'Image URL for gallery'
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    example: 'Binanın dış cephe görünümü',
    description: 'Image caption',
    required: false
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({
    example: 1,
    description: 'Display order in gallery',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class CreateReferenceDto {
  @ApiProperty({
    example: 'https://example.com/images/main-project.jpg',
    description: 'Main project image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://istanbul-plaza.com',
    description: 'Link to live project or website',
    required: false
  })
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiProperty({
    example: 'ABC Şirketi',
    description: 'Client company name',
    required: false
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    example: '2023-06-15T00:00:00.000Z',
    description: 'Project completion date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  projectDate?: string;

  @ApiProperty({
    example: 'construction',
    description: 'Project category (construction, legal, design, etc.)',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;

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
    description: 'Whether the reference is active',
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
    description: 'Whether the reference is featured',
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
    type: [ReferenceTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => ReferenceTranslationDto)
  translations: ReferenceTranslationDto[];

  @ApiProperty({
    type: [ReferenceGalleryDto],
    description: 'Project gallery images',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceGalleryDto)
  gallery?: ReferenceGalleryDto[];
}

export class UpdateReferenceDto {
  @ApiProperty({
    example: 'https://example.com/images/main-project.jpg',
    description: 'Main project image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://istanbul-plaza.com',
    description: 'Link to live project or website',
    required: false
  })
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiProperty({
    example: 'ABC Şirketi',
    description: 'Client company name',
    required: false
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    example: '2023-06-15T00:00:00.000Z',
    description: 'Project completion date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  projectDate?: string;

  @ApiProperty({
    example: 'construction',
    description: 'Project category',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;

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
    description: 'Whether the reference is active',
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
    description: 'Whether the reference is featured',
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
    type: [ReferenceTranslationDto],
    description: 'Updated translations for different languages',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReferenceTranslationDto)
  translations?: ReferenceTranslationDto[];

  @ApiProperty({
    type: [ReferenceGalleryDto],
    description: 'Updated project gallery images',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceGalleryDto)
  gallery?: ReferenceGalleryDto[];
}

export class ReferenceQueryDto {
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
    example: 'plaza',
    description: 'Search term for project title',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 'construction',
    description: 'Filter by project category',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by featured projects only',
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
    example: 'ABC Şirketi',
    description: 'Filter by client name',
    required: false
  })
  @IsOptional()
  @IsString()
  client?: string;

  @ApiProperty({
    example: 2023,
    description: 'Filter by project year',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @ApiProperty({
    example: 'order',
    description: 'Field to sort by',
    enum: ['order', 'createdAt', 'updatedAt', 'projectDate', 'title'],
    required: false,
    default: 'order'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'projectDate' | 'title' = 'order';

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