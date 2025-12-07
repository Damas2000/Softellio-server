import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ContactInfoTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code for this translation'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'ABC İnşaat Ltd. Şti.',
    description: 'Company name in this language'
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    example: 'Güvenilir İnşaat Çözümleri',
    description: 'Company tagline/slogan',
    required: false
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiProperty({
    example: 'Kaliteli inşaat projeleri ile 20 yıllık deneyim...',
    description: 'Company description',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Pazartesi-Cuma 09:00-18:00',
    description: 'Working hours',
    required: false
  })
  @IsOptional()
  @IsString()
  workingHours?: string;
}

export class OfficeDto {
  @ApiProperty({
    example: 'İstanbul Merkez Ofisi',
    description: 'Office name'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'info@company.com',
    description: 'Office email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+90 212 123 45 67',
    description: 'Office phone number',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '+90 212 123 45 68',
    description: 'Office fax number',
    required: false
  })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiProperty({
    example: 'Levent, Büyükdere Cd. No:123, 34394 Şişli/İstanbul',
    description: 'Office address',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: '<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>',
    description: 'Google Maps embed URL',
    required: false
  })
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiProperty({
    example: 41.0122,
    description: 'GPS latitude',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({
    example: 28.9769,
    description: 'GPS longitude',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({
    example: true,
    description: 'Is this the primary office',
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
  isPrimary?: boolean = false;

  @ApiProperty({
    example: true,
    description: 'Is this office active',
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
    example: 1,
    description: 'Display order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class SocialMediaLinkDto {
  @ApiProperty({
    example: 'facebook',
    description: 'Social media platform (facebook, twitter, instagram, linkedin, youtube, etc.)'
  })
  @IsString()
  platform: string;

  @ApiProperty({
    example: 'https://facebook.com/company',
    description: 'Social media profile URL'
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'fab fa-facebook',
    description: 'Icon class or URL',
    required: false
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Is this link active',
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
    example: 1,
    description: 'Display order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class CreateContactInfoDto {
  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Company logo URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    example: 'https://example.com/favicon.ico',
    description: 'Favicon URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  favicon?: string;

  @ApiProperty({
    type: [ContactInfoTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => ContactInfoTranslationDto)
  translations: ContactInfoTranslationDto[];

  @ApiProperty({
    type: [OfficeDto],
    description: 'Office locations',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficeDto)
  offices?: OfficeDto[];

  @ApiProperty({
    type: [SocialMediaLinkDto],
    description: 'Social media links',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  socialLinks?: SocialMediaLinkDto[];
}

export class UpdateContactInfoDto {
  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Company logo URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    example: 'https://example.com/favicon.ico',
    description: 'Favicon URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  favicon?: string;

  @ApiProperty({
    type: [ContactInfoTranslationDto],
    description: 'Updated translations for different languages',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContactInfoTranslationDto)
  translations?: ContactInfoTranslationDto[];

  @ApiProperty({
    type: [OfficeDto],
    description: 'Updated office locations',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficeDto)
  offices?: OfficeDto[];

  @ApiProperty({
    type: [SocialMediaLinkDto],
    description: 'Updated social media links',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  socialLinks?: SocialMediaLinkDto[];
}

// Contact form submission DTO
export class ContactSubmissionDto {
  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Contact person name'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ahmet@example.com',
    description: 'Contact email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+90 533 123 45 67',
    description: 'Contact phone number',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Proje Hakkında Bilgi',
    description: 'Message subject',
    required: false
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    example: 'Merhaba, yeni bir proje için bilgi almak istiyorum...',
    description: 'Message content'
  })
  @IsString()
  message: string;
}

export class ContactSubmissionQueryDto {
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
    example: 'Ahmet',
    description: 'Search term for name or email',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: false,
    description: 'Filter by unread messages only',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiProperty({
    example: 'createdAt',
    description: 'Field to sort by',
    enum: ['createdAt', 'name', 'email'],
    required: false,
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'name' | 'email' = 'createdAt';

  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}