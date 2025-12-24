import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, ValidateNested, IsArray, IsJSON, IsEnum, Min, Max, IsObject, ValidatorConstraint, ValidatorConstraintInterface, Validate, ValidationArguments } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ==================== CUSTOM VALIDATORS ====================

@ValidatorConstraint({ name: 'ValidStructuredData', async: false })
export class ValidStructuredDataValidator implements ValidatorConstraintInterface {
  validate(jsonLd: any, args: ValidationArguments) {
    if (!jsonLd || typeof jsonLd !== 'object') {
      return false;
    }

    // Check required Schema.org properties
    if (!jsonLd['@context'] || !jsonLd['@type']) {
      return false;
    }

    // Validate @context
    if (typeof jsonLd['@context'] !== 'string' || !jsonLd['@context'].includes('schema.org')) {
      return false;
    }

    // Validate @type
    if (typeof jsonLd['@type'] !== 'string') {
      return false;
    }

    // Check JSON size limit (100KB)
    const jsonString = JSON.stringify(jsonLd);
    if (jsonString.length > 102400) { // 100KB
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'JSON-LD must be a valid Schema.org structured data object with @context, @type, and under 100KB size limit';
  }
}

// ==================== STRUCTURED DATA DTOs ====================

export class CreateStructuredDataDto {
  @ApiProperty({
    example: 'organization',
    description: 'Type of entity (organization, website, article, service, person)'
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    example: 'main',
    description: 'ID of the specific entity'
  })
  @IsString()
  entityId: string;

  @ApiProperty({
    example: 'Organization',
    description: 'Schema.org @type value'
  })
  @IsString()
  schemaType: string;

  @ApiProperty({
    example: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ABC İnşaat",
      "url": "https://abcinsaat.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-212-555-0123",
        "contactType": "customer service"
      }
    },
    description: 'Complete JSON-LD structured data object (will be stored as JSON in database). Must include @context and @type. Size limit: 100KB.'
  })
  @IsObject()
  @Validate(ValidStructuredDataValidator)
  jsonLd: Record<string, any>;

  @ApiProperty({
    example: true,
    description: 'Whether the structured data is active',
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
}

export class UpdateStructuredDataDto {
  @ApiProperty({
    example: 'organization',
    description: 'Type of entity',
    required: false
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    example: 'main',
    description: 'ID of the specific entity',
    required: false
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    example: 'Organization',
    description: 'Schema.org @type value',
    required: false
  })
  @IsOptional()
  @IsString()
  schemaType?: string;

  @ApiProperty({
    example: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Updated ABC İnşaat",
      "url": "https://abcinsaat.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-212-555-0123",
        "contactType": "customer service"
      }
    },
    description: 'Complete JSON-LD structured data object (will be stored as JSON in database). Must include @context and @type. Size limit: 100KB.',
    required: false
  })
  @IsOptional()
  @IsObject()
  @Validate(ValidStructuredDataValidator)
  jsonLd?: Record<string, any>;

  @ApiProperty({
    example: true,
    description: 'Whether the structured data is active',
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
}

// ==================== PAGE SEO DTOs ====================

export class PageSEOTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'İstanbul İnşaat Şirketi - ABC İnşaat',
    description: 'Page meta title',
    required: false
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'İstanbul\'da profesyonel inşaat hizmetleri. 20 yıllık deneyim.',
    description: 'Page meta description',
    required: false
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'istanbul inşaat, inşaat şirketi, konut inşaatı',
    description: 'Meta keywords',
    required: false
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({
    example: 'İstanbul İnşaat Şirketi - ABC İnşaat',
    description: 'Open Graph title',
    required: false
  })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiProperty({
    example: 'İstanbul\'da profesyonel inşaat hizmetleri.',
    description: 'Open Graph description',
    required: false
  })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiProperty({
    example: 'https://example.com/og-image.jpg',
    description: 'Open Graph image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @ApiProperty({
    example: 'website',
    description: 'Open Graph type',
    enum: ['website', 'article', 'product', 'video', 'book'],
    required: false,
    default: 'website'
  })
  @IsOptional()
  @IsEnum(['website', 'article', 'product', 'video', 'book'])
  ogType?: string = 'website';

  @ApiProperty({
    example: 'summary_large_image',
    description: 'Twitter Card type',
    enum: ['summary', 'summary_large_image', 'app', 'player'],
    required: false,
    default: 'summary_large_image'
  })
  @IsOptional()
  @IsEnum(['summary', 'summary_large_image', 'app', 'player'])
  twitterCard?: string = 'summary_large_image';

  @ApiProperty({
    example: 'İstanbul İnşaat Şirketi',
    description: 'Twitter title',
    required: false
  })
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiProperty({
    example: 'Profesyonel inşaat hizmetleri',
    description: 'Twitter description',
    required: false
  })
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiProperty({
    example: 'https://example.com/twitter-image.jpg',
    description: 'Twitter image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  twitterImage?: string;
}

export class CreatePageSEODto {
  @ApiProperty({
    example: 'page',
    description: 'Type of entity (page, blog_post, service, team_member, reference)'
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the specific entity'
  })
  @IsNumber()
  @Type(() => Number)
  entityId: number;

  @ApiProperty({
    example: 'https://example.com/canonical-page',
    description: 'Custom canonical URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Prevent search engines from indexing',
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
  noIndex?: boolean = false;

  @ApiProperty({
    example: false,
    description: 'Prevent search engines from following links',
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
  noFollow?: boolean = false;

  @ApiProperty({
    example: 0.8,
    description: 'Sitemap priority (0.0 to 1.0)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  @Type(() => Number)
  priority?: number;

  @ApiProperty({
    example: 'monthly',
    description: 'Sitemap change frequency',
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
    required: false
  })
  @IsOptional()
  @IsEnum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
  changeFreq?: string;

  @ApiProperty({
    example: 'noindex, nofollow',
    description: 'Custom robots meta tag',
    required: false
  })
  @IsOptional()
  @IsString()
  customRobots?: string;

  @ApiProperty({
    type: [PageSEOTranslationDto],
    description: 'SEO translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => PageSEOTranslationDto)
  translations: PageSEOTranslationDto[];
}

export class UpdatePageSEODto {
  @ApiProperty({
    example: 'page',
    description: 'Type of entity',
    required: false
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the specific entity',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  entityId?: number;

  @ApiProperty({
    example: 'https://example.com/canonical-page',
    description: 'Custom canonical URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Prevent search engines from indexing',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  noIndex?: boolean;

  @ApiProperty({
    example: false,
    description: 'Prevent search engines from following links',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  noFollow?: boolean;

  @ApiProperty({
    example: 0.8,
    description: 'Sitemap priority (0.0 to 1.0)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  @Type(() => Number)
  priority?: number;

  @ApiProperty({
    example: 'monthly',
    description: 'Sitemap change frequency',
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
    required: false
  })
  @IsOptional()
  @IsEnum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
  changeFreq?: string;

  @ApiProperty({
    example: 'noindex, nofollow',
    description: 'Custom robots meta tag',
    required: false
  })
  @IsOptional()
  @IsString()
  customRobots?: string;

  @ApiProperty({
    type: [PageSEOTranslationDto],
    description: 'Updated SEO translations',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PageSEOTranslationDto)
  translations?: PageSEOTranslationDto[];
}

// ==================== REDIRECT DTOs ====================

export class CreateRedirectDto {
  @ApiProperty({
    example: '/old-page',
    description: 'Old URL (relative path from domain root)'
  })
  @IsString()
  fromUrl: string;

  @ApiProperty({
    example: '/new-page',
    description: 'New URL (can be relative or absolute)'
  })
  @IsString()
  toUrl: string;

  @ApiProperty({
    example: 301,
    description: 'HTTP status code for redirect',
    enum: [301, 302, 307, 308],
    required: false,
    default: 301
  })
  @IsOptional()
  @IsEnum([301, 302, 307, 308])
  statusCode?: number = 301;

  @ApiProperty({
    example: true,
    description: 'Whether the redirect is active',
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
    example: 'Old product page moved to new location',
    description: 'Admin note about this redirect',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRedirectDto {
  @ApiProperty({
    example: '/old-page',
    description: 'Old URL',
    required: false
  })
  @IsOptional()
  @IsString()
  fromUrl?: string;

  @ApiProperty({
    example: '/new-page',
    description: 'New URL',
    required: false
  })
  @IsOptional()
  @IsString()
  toUrl?: string;

  @ApiProperty({
    example: 301,
    description: 'HTTP status code',
    enum: [301, 302, 307, 308],
    required: false
  })
  @IsOptional()
  @IsEnum([301, 302, 307, 308])
  statusCode?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the redirect is active',
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
    example: 'Updated redirect description',
    description: 'Admin note',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

// ==================== SITEMAP CONFIG DTOs ====================

export class UpdateSitemapConfigDto {
  @ApiProperty({
    example: true,
    description: 'Include pages in sitemap',
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
  includePages?: boolean;

  @ApiProperty({
    example: true,
    description: 'Include blog posts in sitemap',
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
  includeBlog?: boolean;

  @ApiProperty({
    example: true,
    description: 'Include services in sitemap',
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
  includeServices?: boolean;

  @ApiProperty({
    example: false,
    description: 'Include team members in sitemap',
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
  includeTeam?: boolean;

  @ApiProperty({
    example: true,
    description: 'Include references/portfolio in sitemap',
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
  includeReferences?: boolean;

  @ApiProperty({
    example: false,
    description: 'Include galleries in sitemap',
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
  includeGalleries?: boolean;

  @ApiProperty({
    example: 50000,
    description: 'Maximum number of URLs in sitemap',
    required: false,
    default: 50000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50000)
  @Type(() => Number)
  maxUrls?: number;

  @ApiProperty({
    example: false,
    description: 'Auto-submit sitemap to search engines',
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
  autoSubmit?: boolean;
}

// ==================== SEO INTEGRATION DTOs ====================

export class UpdateSEOIntegrationDto {
  @ApiProperty({
    example: 'G-XXXXXXXXXX',
    description: 'Google Analytics 4 Measurement ID',
    required: false
  })
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiProperty({
    example: 'GTM-XXXXXXX',
    description: 'Google Tag Manager Container ID',
    required: false
  })
  @IsOptional()
  @IsString()
  googleTagManagerId?: string;

  @ApiProperty({
    example: 'google-site-verification=xxxxxxxxxxxxxxxxxxxxx',
    description: 'Google Search Console verification meta tag content',
    required: false
  })
  @IsOptional()
  @IsString()
  googleSearchConsole?: string;

  @ApiProperty({
    example: 'msvalidate.01=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Bing Webmaster Tools verification meta tag content',
    required: false
  })
  @IsOptional()
  @IsString()
  bingWebmasterTools?: string;

  @ApiProperty({
    example: 'facebook-domain-verification=xxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Facebook domain verification meta tag content',
    required: false
  })
  @IsOptional()
  @IsString()
  facebookDomainVerif?: string;

  @ApiProperty({
    example: 'p:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Pinterest verification meta tag content',
    required: false
  })
  @IsOptional()
  @IsString()
  pinterestVerif?: string;

  @ApiProperty({
    example: 'yandex-verification=xxxxxxxxxxxxxxxx',
    description: 'Yandex verification meta tag content',
    required: false
  })
  @IsOptional()
  @IsString()
  yandexVerif?: string;

  @ApiProperty({
    example: '<script>console.log("Custom head script");</script>',
    description: 'Custom scripts to inject in <head>',
    required: false
  })
  @IsOptional()
  @IsString()
  customHeadScripts?: string;

  @ApiProperty({
    example: '<script>console.log("Custom body script");</script>',
    description: 'Custom scripts to inject before </body>',
    required: false
  })
  @IsOptional()
  @IsString()
  customBodyScripts?: string;

  @ApiProperty({
    example: true,
    description: 'Whether integrations are active',
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
  isActive?: boolean;
}

// ==================== OPEN GRAPH TEMPLATE DTOs ====================

export class OGTemplateTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: '{title} | {siteName}',
    description: 'Title template with variables',
    required: false
  })
  @IsOptional()
  @IsString()
  titleTemplate?: string;

  @ApiProperty({
    example: '{excerpt} | {siteName}',
    description: 'Description template with variables',
    required: false
  })
  @IsOptional()
  @IsString()
  descTemplate?: string;
}

export class CreateOGTemplateDto {
  @ApiProperty({
    example: 'Blog Post Template',
    description: 'Template name for admin reference'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'blog',
    description: 'What entity type this template is for (blog, service, page, etc.)'
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is the default template for this entity type',
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
  isDefault?: boolean = false;

  @ApiProperty({
    example: 'https://example.com/default-og-image.jpg',
    description: 'Default Open Graph image URL for this template',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 1200,
    description: 'Open Graph image width in pixels',
    required: false,
    default: 1200
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(2000)
  @Type(() => Number)
  imageWidth?: number = 1200;

  @ApiProperty({
    example: 630,
    description: 'Open Graph image height in pixels',
    required: false,
    default: 630
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(2000)
  @Type(() => Number)
  imageHeight?: number = 630;

  @ApiProperty({
    type: [OGTemplateTranslationDto],
    description: 'Template translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => OGTemplateTranslationDto)
  translations: OGTemplateTranslationDto[];
}

export class UpdateOGTemplateDto {
  @ApiProperty({
    example: 'Updated Blog Post Template',
    description: 'Template name',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'blog',
    description: 'Entity type',
    required: false
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is the default template',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isDefault?: boolean;

  @ApiProperty({
    example: 'https://example.com/new-og-image.jpg',
    description: 'Default Open Graph image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 1200,
    description: 'Image width in pixels',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(2000)
  @Type(() => Number)
  imageWidth?: number;

  @ApiProperty({
    example: 630,
    description: 'Image height in pixels',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(2000)
  @Type(() => Number)
  imageHeight?: number;

  @ApiProperty({
    type: [OGTemplateTranslationDto],
    description: 'Updated template translations',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OGTemplateTranslationDto)
  translations?: OGTemplateTranslationDto[];
}

// ==================== QUERY DTOs ====================

export class SEOQueryDto {
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
    example: 'organization',
    description: 'Filter by entity type',
    required: false
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    example: 'Article',
    description: 'Filter by schema type',
    required: false
  })
  @IsOptional()
  @IsString()
  schemaType?: string;
}