import { IsString, IsOptional, IsArray, IsObject, IsUrl, IsEnum, IsNumber, ValidateNested, ArrayNotEmpty, IsHexColor, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Site Configuration DTOs - Tenant branding and navigation
 * Strict validation with no unknown fields allowed
 */

// Navigation item structure
export class NavItemDto {
  @ApiProperty({
    example: 'Home',
    description: 'Navigation item label'
  })
  @IsString()
  label: string;

  @ApiProperty({
    example: '/',
    description: 'Navigation item URL/path'
  })
  @IsString()
  href: string;

  @ApiProperty({
    example: 1,
    description: 'Display order'
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    example: false,
    description: 'Whether this is a call-to-action button',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isCTA?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this link opens externally',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @ApiProperty({
    type: [NavItemDto],
    description: 'Child navigation items for dropdown menus',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  children?: NavItemDto[];
}

// Footer link structure
export class FooterLinkDto {
  @ApiProperty({
    example: 'Privacy Policy',
    description: 'Footer link label'
  })
  @IsString()
  label: string;

  @ApiProperty({
    example: '/privacy',
    description: 'Footer link URL'
  })
  @IsString()
  url: string;
}

// Footer column structure
export class FooterColumnDto {
  @ApiProperty({
    example: 'Quick Links',
    description: 'Footer column title'
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: [FooterLinkDto],
    description: 'Links in this footer column'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links: FooterLinkDto[];
}

// Social media link structure
export class SocialLinkDto {
  @ApiProperty({
    example: 'facebook',
    description: 'Social media platform',
    enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok']
  })
  @IsEnum(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'])
  platform: string;

  @ApiProperty({
    example: 'https://facebook.com/yourcompany',
    description: 'Social media URL'
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'Follow us on Facebook',
    description: 'Link accessibility label'
  })
  @IsString()
  label: string;
}

// Footer configuration structure
export class FooterConfigDto {
  @ApiProperty({
    type: [FooterColumnDto],
    description: 'Footer columns with links'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  columns: FooterColumnDto[];

  @ApiProperty({
    type: [SocialLinkDto],
    description: 'Social media links',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @ApiProperty({
    example: '© 2024 Your Company Name. All rights reserved.',
    description: 'Copyright text',
    required: false
  })
  @IsOptional()
  @IsString()
  copyrightText?: string;
}

// Branding configuration structure
export class BrandingConfigDto {
  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Company logo URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    example: 'https://example.com/favicon.ico',
    description: 'Favicon URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Primary brand color (hex)',
    required: false
  })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiProperty({
    example: '#1E40AF',
    description: 'Secondary brand color (hex)',
    required: false
  })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiProperty({
    example: 'Inter, sans-serif',
    description: 'Font family for the site',
    required: false
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;
}

// SEO defaults structure
export class SeoDefaultsDto {
  @ApiProperty({
    example: 'Your Company Name - Professional Services',
    description: 'Default meta title',
    required: false
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Professional services and solutions for your business needs.',
    description: 'Default meta description',
    required: false
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'https://example.com/og-image.jpg',
    description: 'Default Open Graph image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @ApiProperty({
    example: 'summary_large_image',
    description: 'Twitter card type',
    required: false
  })
  @IsOptional()
  @IsString()
  twitterCard?: string;
}

/**
 * Create/Update Tenant Site Configuration DTO
 */
export class UpsertSiteConfigDto {
  @ApiProperty({
    example: 'printing-premium-v1',
    description: 'Template key to use for this tenant'
  })
  @IsString()
  templateKey: string;

  @ApiProperty({
    type: BrandingConfigDto,
    description: 'Branding configuration'
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BrandingConfigDto)
  branding: BrandingConfigDto;

  @ApiProperty({
    type: [NavItemDto],
    description: 'Navigation structure'
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  navigation: NavItemDto[];

  @ApiProperty({
    type: FooterConfigDto,
    description: 'Footer configuration'
  })
  @IsObject()
  @ValidateNested()
  @Type(() => FooterConfigDto)
  footer: FooterConfigDto;

  @ApiProperty({
    type: SeoDefaultsDto,
    description: 'Default SEO configuration',
    required: false
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeoDefaultsDto)
  seoDefaults?: SeoDefaultsDto;

  @ApiProperty({
    example: '/* Custom CSS here */',
    description: 'Custom CSS for advanced styling',
    required: false
  })
  @IsOptional()
  @IsString()
  customCSS?: string;
}

/**
 * Site Configuration Response DTO
 */
export class SiteConfigResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Configuration ID'
  })
  id: number;

  @ApiProperty({
    example: 123,
    description: 'Tenant ID'
  })
  tenantId: number;

  @ApiProperty({
    example: 'printing-premium-v1',
    description: 'Template key'
  })
  templateKey: string;

  @ApiProperty({
    type: BrandingConfigDto,
    description: 'Branding configuration'
  })
  branding: BrandingConfigDto;

  @ApiProperty({
    type: [NavItemDto],
    description: 'Navigation structure'
  })
  navigation: NavItemDto[];

  @ApiProperty({
    type: FooterConfigDto,
    description: 'Footer configuration'
  })
  footer: FooterConfigDto;

  @ApiProperty({
    type: SeoDefaultsDto,
    description: 'Default SEO configuration',
    required: false
  })
  seoDefaults?: SeoDefaultsDto;

  @ApiProperty({
    example: '/* Custom CSS here */',
    description: 'Custom CSS',
    required: false
  })
  customCSS?: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Configuration creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Configuration last update timestamp'
  })
  updatedAt: Date;
}