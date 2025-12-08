export declare class SliderTranslationDto {
    language: string;
    title?: string;
    description?: string;
}
export declare class SliderItemTranslationDto {
    language: string;
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonColor?: string;
    altText?: string;
}
export declare class CreateSliderItemDto {
    imageUrl: string;
    mobileImageUrl?: string;
    tabletImageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    linkTarget?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    textPosition?: string;
    animationIn?: string;
    animationOut?: string;
    order?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    translations: SliderItemTranslationDto[];
}
export declare class CreateSliderDto {
    key: string;
    type?: string;
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    showDots?: boolean;
    showArrows?: boolean;
    infinite?: boolean;
    slidesToShow?: number;
    slidesToScroll?: number;
    responsive?: any;
    order?: number;
    isActive?: boolean;
    translations: SliderTranslationDto[];
}
export declare class BannerTranslationDto {
    language: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    altText?: string;
}
export declare class CreateBannerDto {
    type?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    linkUrl?: string;
    order?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    translations: BannerTranslationDto[];
}
export declare class CreateBannerPositionDto {
    key: string;
    name: string;
    width?: number;
    height?: number;
    maxBanners?: number;
    autoRotate?: boolean;
    rotateSpeed?: number;
}
export declare class BannerPositionAssignmentDto {
    bannerId: number;
    order?: number;
    weight?: number;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateSliderDto {
    key?: string;
    type?: string;
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    showDots?: boolean;
    showArrows?: boolean;
    infinite?: boolean;
    slidesToShow?: number;
    slidesToScroll?: number;
    responsive?: any;
    order?: number;
    isActive?: boolean;
    translations?: SliderTranslationDto[];
}
export declare class UpdateSliderItemDto {
    imageUrl?: string;
    mobileImageUrl?: string;
    tabletImageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    linkTarget?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    textPosition?: string;
    animationIn?: string;
    animationOut?: string;
    order?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    translations?: SliderItemTranslationDto[];
}
export declare class UpdateBannerDto {
    type?: string;
    imageUrl?: string;
    mobileImageUrl?: string;
    linkUrl?: string;
    order?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    translations?: BannerTranslationDto[];
}
export declare class UpdateBannerPositionDto {
    key?: string;
    name?: string;
    width?: number;
    height?: number;
    maxBanners?: number;
    autoRotate?: boolean;
    rotateSpeed?: number;
}
export declare class BannerSliderQueryDto {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: boolean;
    search?: string;
}
export declare class CreateBannerPositionAssignmentDto {
    bannerId: number;
    bannerPositionId: number;
    order?: number;
    isActive?: boolean;
}
export declare class UpdateBannerPositionAssignmentDto {
    bannerId?: number;
    bannerPositionId?: number;
    order?: number;
    isActive?: boolean;
}
export declare class SliderQueryDto {
    type?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class BannerQueryDto {
    type?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
