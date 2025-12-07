import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SiteSettingTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code for this translation'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'My Amazing Website',
    description: 'Site name in this language'
  })
  @IsString()
  siteName: string;

  @ApiProperty({
    example: 'Welcome to our amazing website',
    description: 'Site description in this language',
    required: false
  })
  @IsOptional()
  @IsString()
  siteDescription?: string;

  @ApiProperty({
    example: 'My Amazing Website - Welcome',
    description: 'SEO meta title for this language',
    required: false
  })
  @IsOptional()
  @IsString()
  seoMetaTitle?: string;

  @ApiProperty({
    example: 'Discover amazing content on our website',
    description: 'SEO meta description for this language',
    required: false
  })
  @IsOptional()
  @IsString()
  seoMetaDescription?: string;
}

export class CreateSiteSettingDto {
  @ApiProperty({
    type: [SiteSettingTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => SiteSettingTranslationDto)
  translations: SiteSettingTranslationDto[];
}

export class UpdateSiteSettingDto {
  @ApiProperty({
    type: [SiteSettingTranslationDto],
    description: 'Updated translations for different languages',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SiteSettingTranslationDto)
  translations?: SiteSettingTranslationDto[];
}