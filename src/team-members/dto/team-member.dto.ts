import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code for this translation'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Team member name in this language'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Genel Müdür',
    description: 'Position/title in this language'
  })
  @IsString()
  position: string;

  @ApiProperty({
    example: 'İnşaat sektöründe 15 yıllık deneyime sahip...',
    description: 'Biography in this language',
    required: false
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'Proje Yönetimi, İnşaat Mühendisliği, Kalite Kontrol',
    description: 'Areas of expertise in this language',
    required: false
  })
  @IsOptional()
  @IsString()
  expertise?: string;
}

export class TeamMemberSocialLinkDto {
  @ApiProperty({
    example: 'linkedin',
    description: 'Social media platform'
  })
  @IsString()
  platform: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/ahmet-yilmaz',
    description: 'Social media profile URL'
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'fab fa-linkedin',
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

export class CreateTeamMemberDto {
  @ApiProperty({
    example: 'ahmet@company.com',
    description: 'Team member email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+90 533 123 45 67',
    description: 'Team member phone',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/photos/ahmet.jpg',
    description: 'Profile photo URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

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
    description: 'Whether the team member is active',
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
    type: [TeamMemberTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => TeamMemberTranslationDto)
  translations: TeamMemberTranslationDto[];

  @ApiProperty({
    type: [TeamMemberSocialLinkDto],
    description: 'Social media links',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberSocialLinkDto)
  socialLinks?: TeamMemberSocialLinkDto[];
}

export class UpdateTeamMemberDto {
  @ApiProperty({
    example: 'ahmet@company.com',
    description: 'Team member email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+90 533 123 45 67',
    description: 'Team member phone',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/photos/ahmet.jpg',
    description: 'Profile photo URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

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
    description: 'Whether the team member is active',
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
    type: [TeamMemberTranslationDto],
    description: 'Updated translations for different languages',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberTranslationDto)
  translations?: TeamMemberTranslationDto[];

  @ApiProperty({
    type: [TeamMemberSocialLinkDto],
    description: 'Updated social media links',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberSocialLinkDto)
  socialLinks?: TeamMemberSocialLinkDto[];
}

export class TeamMemberQueryDto {
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
    description: 'Search term for team member name or position',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 'order',
    description: 'Field to sort by',
    enum: ['order', 'createdAt', 'updatedAt', 'name'],
    required: false,
    default: 'order'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'name' = 'order';

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