import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, ValidateNested, IsArray, IsDateString, IsEnum, Min, Max, IsJSON, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ==================== SLIDER DTOs ====================

export class SliderTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Ana Sayfa Slider',
    description: 'Slider title for admin reference',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'İşletmenizin en önemli görselleri',
    description: 'Slider description',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SliderItemTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Profesyonel Çözümler',
    description: 'Slide title',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'İşletmeniz İçin Güvenilir Partner',
    description: 'Slide subtitle',
    required: false
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    example: '<p>20 yıllık deneyimimizle <strong>profesyonel hizmet</strong> sunuyoruz.</p>',
    description: 'Slide rich text content',
    required: false
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: 'Hemen İletişime Geçin',
    description: 'Call-to-action button text',
    required: false
  })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiProperty({
    example: '#007bff',
    description: 'Button background color',
    required: false
  })
  @IsOptional()
  @IsString()
  buttonColor?: string;

  @ApiProperty({
    example: 'Profesyonel hizmet veren ekip görseli',
    description: 'Image alt text for accessibility',
    required: false
  })
  @IsOptional()
  @IsString()
  altText?: string;
}

export class CreateSliderItemDto {
  @ApiProperty({
    example: 'https://example.com/slider-image.jpg',
    description: 'Main image URL for desktop'
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    example: 'https://example.com/slider-image-mobile.jpg',
    description: 'Mobile-optimized image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/slider-image-tablet.jpg',
    description: 'Tablet-optimized image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  tabletImageUrl?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/embed/abc123',
    description: 'Video URL (YouTube, Vimeo, etc.)',
    required: false
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({
    example: 'https://example.com/contact',
    description: 'Link URL for call-to-action',
    required: false
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    example: '_blank',
    description: 'Link target',
    enum: ['_self', '_blank'],
    required: false,
    default: '_self'
  })
  @IsOptional()
  @IsEnum(['_self', '_blank'])
  linkTarget?: string = '_self';

  @ApiProperty({
    example: '#000000',
    description: 'Overlay color for text readability',
    required: false
  })
  @IsOptional()
  @IsString()
  overlayColor?: string;

  @ApiProperty({
    example: 0.3,
    description: 'Overlay opacity (0.0 to 1.0)',
    required: false,
    default: 0.0
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  @Type(() => Number)
  overlayOpacity?: number = 0.0;

  @ApiProperty({
    example: 'center',
    description: 'Text position on slide',
    enum: ['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'],
    required: false,
    default: 'center'
  })
  @IsOptional()
  @IsEnum(['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'])
  textPosition?: string = 'center';

  @ApiProperty({
    example: 'fadeIn',
    description: 'Animation when slide appears',
    enum: ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'],
    required: false,
    default: 'fadeIn'
  })
  @IsOptional()
  @IsEnum(['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'])
  animationIn?: string = 'fadeIn';

  @ApiProperty({
    example: 'fadeOut',
    description: 'Animation when slide disappears',
    enum: ['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'],
    required: false,
    default: 'fadeOut'
  })
  @IsOptional()
  @IsEnum(['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'])
  animationOut?: string = 'fadeOut';

  @ApiProperty({
    example: 1,
    description: 'Display order within slider',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether slide is active',
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
    example: '2024-01-01T00:00:00.000Z',
    description: 'Schedule slide to start showing',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Schedule slide to stop showing',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    type: [SliderItemTranslationDto],
    description: 'Translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => SliderItemTranslationDto)
  translations: SliderItemTranslationDto[];
}

export class CreateSliderDto {
  @ApiProperty({
    example: 'home-hero',
    description: 'Unique slider key (home-hero, about-gallery, services-showcase, testimonials)'
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: 'carousel',
    description: 'Slider type',
    enum: ['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'],
    required: false,
    default: 'carousel'
  })
  @IsOptional()
  @IsEnum(['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'])
  type?: string = 'carousel';

  @ApiProperty({
    example: true,
    description: 'Auto-play slides',
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
  autoPlay?: boolean = true;

  @ApiProperty({
    example: 5000,
    description: 'Auto-play speed in milliseconds',
    required: false,
    default: 5000
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  @Type(() => Number)
  autoPlaySpeed?: number = 5000;

  @ApiProperty({
    example: true,
    description: 'Show navigation dots',
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
  showDots?: boolean = true;

  @ApiProperty({
    example: true,
    description: 'Show navigation arrows',
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
  showArrows?: boolean = true;

  @ApiProperty({
    example: true,
    description: 'Infinite loop sliding',
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
  infinite?: boolean = true;

  @ApiProperty({
    example: 1,
    description: 'Number of slides to show simultaneously',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  slidesToShow?: number = 1;

  @ApiProperty({
    example: 1,
    description: 'Number of slides to scroll at once',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  slidesToScroll?: number = 1;

  @ApiProperty({
    example: {
      "1024": {"slidesToShow": 2, "slidesToScroll": 1},
      "768": {"slidesToShow": 1, "slidesToScroll": 1}
    },
    description: 'Responsive breakpoints configuration',
    required: false
  })
  @IsOptional()
  @IsJSON()
  responsive?: any;

  @ApiProperty({
    example: 1,
    description: 'Display order if multiple sliders',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Whether slider is active',
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
    type: [SliderTranslationDto],
    description: 'Slider translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => SliderTranslationDto)
  translations: SliderTranslationDto[];
}

// ==================== BANNER DTOs ====================

export class BannerTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code'
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Özel Kampanya',
    description: 'Banner title',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '%50 İndirim Fırsatı',
    description: 'Banner subtitle',
    required: false
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    example: 'Şimdi Başvur',
    description: 'Button text',
    required: false
  })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiProperty({
    example: 'Kampanya banner görseli',
    description: 'Image alt text',
    required: false
  })
  @IsOptional()
  @IsString()
  altText?: string;
}

export class CreateBannerDto {
  @ApiProperty({
    example: 'promotional',
    description: 'Banner type',
    enum: ['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'],
    required: false,
    default: 'promotional'
  })
  @IsOptional()
  @IsEnum(['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'])
  type?: string = 'promotional';

  @ApiProperty({
    example: 'https://example.com/banner-image.jpg',
    description: 'Banner image URL'
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    example: 'https://example.com/banner-mobile.jpg',
    description: 'Mobile-optimized image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/special-offer',
    description: 'Link URL for banner click',
    required: false
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

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
    description: 'Whether banner is active',
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
    example: '2024-01-01T00:00:00.000Z',
    description: 'Schedule banner start date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Schedule banner end date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    type: [BannerTranslationDto],
    description: 'Banner translations for different languages'
  })
  @ValidateNested({ each: true })
  @Type(() => BannerTranslationDto)
  translations: BannerTranslationDto[];
}

// ==================== BANNER POSITION DTOs ====================

export class CreateBannerPositionDto {
  @ApiProperty({
    example: 'header-top',
    description: 'Position key (header-top, sidebar-right, footer-bottom, home-hero)'
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: 'Header Top Banner',
    description: 'Human readable position name'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1200,
    description: 'Recommended banner width in pixels',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @ApiProperty({
    example: 100,
    description: 'Recommended banner height in pixels',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

  @ApiProperty({
    example: 1,
    description: 'Maximum number of banners in this position',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxBanners?: number = 1;

  @ApiProperty({
    example: false,
    description: 'Auto-rotate multiple banners',
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
  autoRotate?: boolean = false;

  @ApiProperty({
    example: 10000,
    description: 'Rotation speed in milliseconds',
    required: false,
    default: 10000
  })
  @IsOptional()
  @IsNumber()
  @Min(3000)
  @Max(60000)
  @Type(() => Number)
  rotateSpeed?: number = 10000;
}

export class BannerPositionAssignmentDto {
  @ApiProperty({
    example: 1,
    description: 'Banner ID'
  })
  @IsNumber()
  @Type(() => Number)
  bannerId: number;

  @ApiProperty({
    example: 0,
    description: 'Display order in position',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number = 0;

  @ApiProperty({
    example: 100,
    description: 'Weight for A/B testing (higher = more likely to show)',
    required: false,
    default: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  weight?: number = 100;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Schedule assignment start date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Schedule assignment end date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ==================== UPDATE DTOs ====================

export class UpdateSliderDto {
  @ApiProperty({
    example: 'home-hero-updated',
    description: 'Updated slider key',
    required: false
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    example: 'showcase',
    description: 'Updated slider type',
    enum: ['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'],
    required: false
  })
  @IsOptional()
  @IsEnum(['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'])
  type?: string;

  @ApiProperty({
    example: false,
    description: 'Auto-play slides',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  autoPlay?: boolean;

  @ApiProperty({
    example: 7000,
    description: 'Auto-play speed in milliseconds',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  @Type(() => Number)
  autoPlaySpeed?: number;

  @ApiProperty({
    example: false,
    description: 'Show navigation dots',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showDots?: boolean;

  @ApiProperty({
    example: false,
    description: 'Show navigation arrows',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showArrows?: boolean;

  @ApiProperty({
    example: false,
    description: 'Infinite loop sliding',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  infinite?: boolean;

  @ApiProperty({
    example: 3,
    description: 'Number of slides to show simultaneously',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  slidesToShow?: number;

  @ApiProperty({
    example: 2,
    description: 'Number of slides to scroll at once',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  slidesToScroll?: number;

  @ApiProperty({
    description: 'Updated responsive configuration',
    required: false
  })
  @IsOptional()
  @IsJSON()
  responsive?: any;

  @ApiProperty({
    example: 2,
    description: 'Updated display order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: false,
    description: 'Whether slider is active',
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
    type: [SliderTranslationDto],
    description: 'Updated slider translations',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SliderTranslationDto)
  translations?: SliderTranslationDto[];
}

export class UpdateSliderItemDto {
  @ApiProperty({
    example: 'https://example.com/new-image.jpg',
    description: 'Updated image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/new-mobile-image.jpg',
    description: 'Updated mobile image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/new-tablet-image.jpg',
    description: 'Updated tablet image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  tabletImageUrl?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/embed/xyz789',
    description: 'Updated video URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({
    example: 'https://example.com/new-link',
    description: 'Updated link URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    example: '_blank',
    description: 'Updated link target',
    enum: ['_self', '_blank'],
    required: false
  })
  @IsOptional()
  @IsEnum(['_self', '_blank'])
  linkTarget?: string;

  @ApiProperty({
    example: '#ffffff',
    description: 'Updated overlay color',
    required: false
  })
  @IsOptional()
  @IsString()
  overlayColor?: string;

  @ApiProperty({
    example: 0.5,
    description: 'Updated overlay opacity',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  @Type(() => Number)
  overlayOpacity?: number;

  @ApiProperty({
    example: 'bottom-left',
    description: 'Updated text position',
    enum: ['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'],
    required: false
  })
  @IsOptional()
  @IsEnum(['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'])
  textPosition?: string;

  @ApiProperty({
    example: 'slideInLeft',
    description: 'Updated animation in',
    enum: ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'],
    required: false
  })
  @IsOptional()
  @IsEnum(['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'])
  animationIn?: string;

  @ApiProperty({
    example: 'slideOutRight',
    description: 'Updated animation out',
    enum: ['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'],
    required: false
  })
  @IsOptional()
  @IsEnum(['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'])
  animationOut?: string;

  @ApiProperty({
    example: 5,
    description: 'Updated order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: false,
    description: 'Whether slide is active',
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
    example: '2024-06-01T00:00:00.000Z',
    description: 'Updated start date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-06-30T23:59:59.000Z',
    description: 'Updated end date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    type: [SliderItemTranslationDto],
    description: 'Updated translations',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SliderItemTranslationDto)
  translations?: SliderItemTranslationDto[];
}

export class UpdateBannerDto {
  @ApiProperty({
    example: 'hero',
    description: 'Updated banner type',
    enum: ['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'],
    required: false
  })
  @IsOptional()
  @IsEnum(['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'])
  type?: string;

  @ApiProperty({
    example: 'https://example.com/new-banner.jpg',
    description: 'Updated image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/new-mobile-banner.jpg',
    description: 'Updated mobile image URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/new-landing-page',
    description: 'Updated link URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    example: 5,
    description: 'Updated order',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    example: false,
    description: 'Whether banner is active',
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
    example: '2024-07-01T00:00:00.000Z',
    description: 'Updated start date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-07-31T23:59:59.000Z',
    description: 'Updated end date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    type: [BannerTranslationDto],
    description: 'Updated banner translations',
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BannerTranslationDto)
  translations?: BannerTranslationDto[];
}

export class UpdateBannerPositionDto {
  @ApiProperty({
    example: 'header-top-updated',
    description: 'Updated position key',
    required: false
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    example: 'Updated Header Top Banner',
    description: 'Updated position name',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 1400,
    description: 'Updated recommended width',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @ApiProperty({
    example: 120,
    description: 'Updated recommended height',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

  @ApiProperty({
    example: 3,
    description: 'Updated maximum banners',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxBanners?: number;

  @ApiProperty({
    example: true,
    description: 'Updated auto-rotate setting',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  autoRotate?: boolean;

  @ApiProperty({
    example: 8000,
    description: 'Updated rotation speed',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(3000)
  @Max(60000)
  @Type(() => Number)
  rotateSpeed?: number;
}

// ==================== QUERY DTOs ====================

export class BannerSliderQueryDto {
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
    example: 'carousel',
    description: 'Filter by type',
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 'home',
    description: 'Search in keys',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;
}

// Banner Position Assignment DTOs
export class CreateBannerPositionAssignmentDto {
  @IsInt()
  bannerId: number;

  @IsInt()
  bannerPositionId: number;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateBannerPositionAssignmentDto {
  @IsOptional()
  @IsInt()
  bannerId?: number;

  @IsOptional()
  @IsInt()
  bannerPositionId?: number;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Query DTOs
export class SliderQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'order';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class BannerQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'order';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}