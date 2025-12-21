"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerQueryDto = exports.SliderQueryDto = exports.UpdateBannerPositionAssignmentDto = exports.CreateBannerPositionAssignmentDto = exports.BannerSliderQueryDto = exports.UpdateBannerPositionDto = exports.UpdateBannerDto = exports.UpdateSliderItemDto = exports.UpdateSliderDto = exports.BannerPositionAssignmentDto = exports.CreateBannerPositionDto = exports.CreateBannerDto = exports.BannerTranslationDto = exports.CreateSliderDto = exports.CreateSliderItemDto = exports.SliderItemTranslationDto = exports.SliderTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SliderTranslationDto {
}
exports.SliderTranslationDto = SliderTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ana Sayfa Slider',
        description: 'Slider title for admin reference',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İşletmenizin en önemli görselleri',
        description: 'Slider description',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderTranslationDto.prototype, "description", void 0);
class SliderItemTranslationDto {
}
exports.SliderItemTranslationDto = SliderItemTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Profesyonel Çözümler',
        description: 'Slide title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İşletmeniz İçin Güvenilir Partner',
        description: 'Slide subtitle',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '<p>20 yıllık deneyimimizle <strong>profesyonel hizmet</strong> sunuyoruz.</p>',
        description: 'Slide rich text content',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hemen İletişime Geçin',
        description: 'Call-to-action button text',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "buttonText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#007bff',
        description: 'Button background color',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "buttonColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Profesyonel hizmet veren ekip görseli',
        description: 'Image alt text for accessibility',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderItemTranslationDto.prototype, "altText", void 0);
class CreateSliderItemDto {
    constructor() {
        this.linkTarget = '_self';
        this.overlayOpacity = 0.0;
        this.textPosition = 'center';
        this.animationIn = 'fadeIn';
        this.animationOut = 'fadeOut';
        this.isActive = true;
    }
}
exports.CreateSliderItemDto = CreateSliderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/slider-image.jpg',
        description: 'Main image URL for desktop'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/slider-image-mobile.jpg',
        description: 'Mobile-optimized image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "mobileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/slider-image-tablet.jpg',
        description: 'Tablet-optimized image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "tabletImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://www.youtube.com/embed/abc123',
        description: 'Video URL (YouTube, Vimeo, etc.)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/contact',
        description: 'Link URL for call-to-action',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '_blank',
        description: 'Link target',
        enum: ['_self', '_blank'],
        required: false,
        default: '_self'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['_self', '_blank']),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "linkTarget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#000000',
        description: 'Overlay color for text readability',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "overlayColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0.3,
        description: 'Overlay opacity (0.0 to 1.0)',
        required: false,
        default: 0.0
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0),
    (0, class_validator_1.Max)(1.0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderItemDto.prototype, "overlayOpacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'center',
        description: 'Text position on slide',
        enum: ['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'],
        required: false,
        default: 'center'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right']),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "textPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'fadeIn',
        description: 'Animation when slide appears',
        enum: ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'],
        required: false,
        default: 'fadeIn'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none']),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "animationIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'fadeOut',
        description: 'Animation when slide disappears',
        enum: ['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'],
        required: false,
        default: 'fadeOut'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none']),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "animationOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order within slider',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderItemDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether slide is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderItemDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Schedule slide to start showing',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-31T23:59:59.000Z',
        description: 'Schedule slide to stop showing',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSliderItemDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SliderItemTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SliderItemTranslationDto),
    __metadata("design:type", Array)
], CreateSliderItemDto.prototype, "translations", void 0);
class CreateSliderDto {
    constructor() {
        this.type = 'carousel';
        this.autoPlay = true;
        this.autoPlaySpeed = 5000;
        this.showDots = true;
        this.showArrows = true;
        this.infinite = true;
        this.slidesToShow = 1;
        this.slidesToScroll = 1;
        this.isActive = true;
    }
}
exports.CreateSliderDto = CreateSliderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'home-hero',
        description: 'Unique slider key (home-hero, about-gallery, services-showcase, testimonials)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSliderDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'carousel',
        description: 'Slider type',
        enum: ['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'],
        required: false,
        default: 'carousel'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio']),
    __metadata("design:type", String)
], CreateSliderDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Auto-play slides',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderDto.prototype, "autoPlay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5000,
        description: 'Auto-play speed in milliseconds',
        required: false,
        default: 5000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(30000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderDto.prototype, "autoPlaySpeed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Show navigation dots',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderDto.prototype, "showDots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Show navigation arrows',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderDto.prototype, "showArrows", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Infinite loop sliding',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderDto.prototype, "infinite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Number of slides to show simultaneously',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderDto.prototype, "slidesToShow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Number of slides to scroll at once',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderDto.prototype, "slidesToScroll", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            "1024": { "slidesToShow": 2, "slidesToScroll": 1 },
            "768": { "slidesToShow": 1, "slidesToScroll": 1 }
        },
        description: 'Responsive breakpoints configuration',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", Object)
], CreateSliderDto.prototype, "responsive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order if multiple sliders',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSliderDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether slider is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateSliderDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SliderTranslationDto],
        description: 'Slider translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SliderTranslationDto),
    __metadata("design:type", Array)
], CreateSliderDto.prototype, "translations", void 0);
class BannerTranslationDto {
}
exports.BannerTranslationDto = BannerTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Özel Kampanya',
        description: 'Banner title',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerTranslationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '%50 İndirim Fırsatı',
        description: 'Banner subtitle',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerTranslationDto.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Şimdi Başvur',
        description: 'Button text',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerTranslationDto.prototype, "buttonText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kampanya banner görseli',
        description: 'Image alt text',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerTranslationDto.prototype, "altText", void 0);
class CreateBannerDto {
    constructor() {
        this.type = 'promotional';
        this.isActive = true;
    }
}
exports.CreateBannerDto = CreateBannerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'promotional',
        description: 'Banner type',
        enum: ['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'],
        required: false,
        default: 'promotional'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline']),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/banner-image.jpg',
        description: 'Banner image URL'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/banner-mobile.jpg',
        description: 'Mobile-optimized image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "mobileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/special-offer',
        description: 'Link URL for banner click',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBannerDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether banner is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Schedule banner start date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-31T23:59:59.000Z',
        description: 'Schedule banner end date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [BannerTranslationDto],
        description: 'Banner translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BannerTranslationDto),
    __metadata("design:type", Array)
], CreateBannerDto.prototype, "translations", void 0);
class CreateBannerPositionDto {
    constructor() {
        this.maxBanners = 1;
        this.autoRotate = false;
        this.rotateSpeed = 10000;
    }
}
exports.CreateBannerPositionDto = CreateBannerPositionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'header-top',
        description: 'Position key (header-top, sidebar-right, footer-bottom, home-hero)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerPositionDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Header Top Banner',
        description: 'Human readable position name'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerPositionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1200,
        description: 'Recommended banner width in pixels',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBannerPositionDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Recommended banner height in pixels',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBannerPositionDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Maximum number of banners in this position',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBannerPositionDto.prototype, "maxBanners", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Auto-rotate multiple banners',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateBannerPositionDto.prototype, "autoRotate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10000,
        description: 'Rotation speed in milliseconds',
        required: false,
        default: 10000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(3000),
    (0, class_validator_1.Max)(60000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBannerPositionDto.prototype, "rotateSpeed", void 0);
class BannerPositionAssignmentDto {
    constructor() {
        this.order = 0;
        this.weight = 100;
    }
}
exports.BannerPositionAssignmentDto = BannerPositionAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Banner ID'
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BannerPositionAssignmentDto.prototype, "bannerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'Display order in position',
        required: false,
        default: 0
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BannerPositionAssignmentDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Weight for A/B testing (higher = more likely to show)',
        required: false,
        default: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BannerPositionAssignmentDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Schedule assignment start date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BannerPositionAssignmentDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-31T23:59:59.000Z',
        description: 'Schedule assignment end date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BannerPositionAssignmentDto.prototype, "endDate", void 0);
class UpdateSliderDto {
}
exports.UpdateSliderDto = UpdateSliderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'home-hero-updated',
        description: 'Updated slider key',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSliderDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'showcase',
        description: 'Updated slider type',
        enum: ['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['carousel', 'gallery', 'showcase', 'testimonials', 'hero', 'portfolio']),
    __metadata("design:type", String)
], UpdateSliderDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Auto-play slides',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderDto.prototype, "autoPlay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7000,
        description: 'Auto-play speed in milliseconds',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(30000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderDto.prototype, "autoPlaySpeed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Show navigation dots',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderDto.prototype, "showDots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Show navigation arrows',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderDto.prototype, "showArrows", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Infinite loop sliding',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderDto.prototype, "infinite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 3,
        description: 'Number of slides to show simultaneously',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderDto.prototype, "slidesToShow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: 'Number of slides to scroll at once',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderDto.prototype, "slidesToScroll", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated responsive configuration',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", Object)
], UpdateSliderDto.prototype, "responsive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: 'Updated display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether slider is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SliderTranslationDto],
        description: 'Updated slider translations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SliderTranslationDto),
    __metadata("design:type", Array)
], UpdateSliderDto.prototype, "translations", void 0);
class UpdateSliderItemDto {
}
exports.UpdateSliderItemDto = UpdateSliderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-image.jpg',
        description: 'Updated image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-mobile-image.jpg',
        description: 'Updated mobile image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "mobileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-tablet-image.jpg',
        description: 'Updated tablet image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "tabletImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://www.youtube.com/embed/xyz789',
        description: 'Updated video URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-link',
        description: 'Updated link URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '_blank',
        description: 'Updated link target',
        enum: ['_self', '_blank'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['_self', '_blank']),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "linkTarget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#ffffff',
        description: 'Updated overlay color',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "overlayColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0.5,
        description: 'Updated overlay opacity',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0),
    (0, class_validator_1.Max)(1.0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderItemDto.prototype, "overlayOpacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'bottom-left',
        description: 'Updated text position',
        enum: ['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['left', 'center', 'right', 'bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right']),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "textPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'slideInLeft',
        description: 'Updated animation in',
        enum: ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'zoomIn', 'none']),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "animationIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'slideOutRight',
        description: 'Updated animation out',
        enum: ['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown', 'zoomOut', 'none']),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "animationOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Updated order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSliderItemDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether slide is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateSliderItemDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-06-01T00:00:00.000Z',
        description: 'Updated start date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-06-30T23:59:59.000Z',
        description: 'Updated end date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSliderItemDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SliderItemTranslationDto],
        description: 'Updated translations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SliderItemTranslationDto),
    __metadata("design:type", Array)
], UpdateSliderItemDto.prototype, "translations", void 0);
class UpdateBannerDto {
}
exports.UpdateBannerDto = UpdateBannerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'hero',
        description: 'Updated banner type',
        enum: ['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['hero', 'promotional', 'sidebar', 'footer', 'popup', 'inline']),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-banner.jpg',
        description: 'Updated image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-mobile-banner.jpg',
        description: 'Updated mobile image URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "mobileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-landing-page',
        description: 'Updated link URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Updated order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBannerDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether banner is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-07-01T00:00:00.000Z',
        description: 'Updated start date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-07-31T23:59:59.000Z',
        description: 'Updated end date',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBannerDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [BannerTranslationDto],
        description: 'Updated banner translations',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BannerTranslationDto),
    __metadata("design:type", Array)
], UpdateBannerDto.prototype, "translations", void 0);
class UpdateBannerPositionDto {
}
exports.UpdateBannerPositionDto = UpdateBannerPositionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'header-top-updated',
        description: 'Updated position key',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBannerPositionDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Updated Header Top Banner',
        description: 'Updated position name',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBannerPositionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1400,
        description: 'Updated recommended width',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBannerPositionDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Updated recommended height',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBannerPositionDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 3,
        description: 'Updated maximum banners',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBannerPositionDto.prototype, "maxBanners", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Updated auto-rotate setting',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateBannerPositionDto.prototype, "autoRotate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 8000,
        description: 'Updated rotation speed',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(3000),
    (0, class_validator_1.Max)(60000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBannerPositionDto.prototype, "rotateSpeed", void 0);
class BannerSliderQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.BannerSliderQueryDto = BannerSliderQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Page number for pagination',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BannerSliderQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Number of items per page',
        required: false,
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BannerSliderQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'carousel',
        description: 'Filter by type',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerSliderQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Filter by active status',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BannerSliderQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'home',
        description: 'Search in keys',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerSliderQueryDto.prototype, "search", void 0);
class CreateBannerPositionAssignmentDto {
    constructor() {
        this.isActive = true;
    }
}
exports.CreateBannerPositionAssignmentDto = CreateBannerPositionAssignmentDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBannerPositionAssignmentDto.prototype, "bannerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBannerPositionAssignmentDto.prototype, "bannerPositionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBannerPositionAssignmentDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBannerPositionAssignmentDto.prototype, "isActive", void 0);
class UpdateBannerPositionAssignmentDto {
}
exports.UpdateBannerPositionAssignmentDto = UpdateBannerPositionAssignmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateBannerPositionAssignmentDto.prototype, "bannerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateBannerPositionAssignmentDto.prototype, "bannerPositionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateBannerPositionAssignmentDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBannerPositionAssignmentDto.prototype, "isActive", void 0);
class SliderQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'order';
        this.sortOrder = 'asc';
    }
}
exports.SliderQueryDto = SliderQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], SliderQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SliderQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SliderQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SliderQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], SliderQueryDto.prototype, "sortOrder", void 0);
class BannerQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'order';
        this.sortOrder = 'asc';
    }
}
exports.BannerQueryDto = BannerQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    __metadata("design:type", Boolean)
], BannerQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BannerQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], BannerQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BannerQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], BannerQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=banner-slider.dto.js.map