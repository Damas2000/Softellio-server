import { BannersSlidersService } from './banners-sliders.service';
import { CreateSliderDto, UpdateSliderDto, CreateSliderItemDto, UpdateSliderItemDto, CreateBannerPositionDto, UpdateBannerPositionDto, CreateBannerPositionAssignmentDto, UpdateBannerPositionAssignmentDto, SliderQueryDto, BannerQueryDto } from './dto/banner-slider.dto';
export declare class BannersSlidersController {
    private readonly bannersSlidersService;
    constructor(bannersSlidersService: BannersSlidersService);
    getPublicSlider(key: string, tenantId: number): Promise<{
        success: boolean;
        data: import("./banners-sliders.service").SliderWithRelations;
    }>;
    getPublicBanners(position: string, tenantId: number): Promise<{
        success: boolean;
        data: ({
            translations: {
                title: string | null;
                id: number;
                language: string;
                subtitle: string | null;
                buttonText: string | null;
                altText: string | null;
                bannerId: number;
            }[];
        } & {
            type: string;
            id: number;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            order: number | null;
            imageUrl: string;
            mobileImageUrl: string | null;
            linkUrl: string | null;
        })[];
    }>;
    trackBannerClick(bannerId: number): Promise<{
        success: boolean;
    }>;
    trackSliderClick(sliderId: number): Promise<{
        success: boolean;
    }>;
    getAllSliders(tenantId: number, query: SliderQueryDto): Promise<{
        success: boolean;
        data: {
            data: ({
                items: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    startDate: Date | null;
                    endDate: Date | null;
                    order: number | null;
                    imageUrl: string;
                    mobileImageUrl: string | null;
                    tabletImageUrl: string | null;
                    videoUrl: string | null;
                    linkUrl: string | null;
                    linkTarget: string;
                    overlayColor: string | null;
                    overlayOpacity: number;
                    textPosition: string;
                    animationIn: string;
                    animationOut: string;
                    sliderId: number;
                    clickCount: number;
                    viewCount: number;
                }[];
                translations: {
                    description: string | null;
                    title: string | null;
                    id: number;
                    language: string;
                    sliderId: number;
                }[];
            } & {
                type: string;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                key: string;
                order: number | null;
                autoPlay: boolean;
                autoPlaySpeed: number;
                showDots: boolean;
                showArrows: boolean;
                infinite: boolean;
                slidesToShow: number;
                slidesToScroll: number;
                responsive: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
            meta: {
                total: number;
                page: any;
                limit: any;
                pages: number;
            };
        };
    }>;
    getSliderById(id: number, tenantId: number): Promise<{
        success: boolean;
        data: import("./banners-sliders.service").SliderWithRelations;
    }>;
    createSlider(createSliderDto: CreateSliderDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").SliderWithRelations;
    }>;
    updateSlider(id: number, updateSliderDto: UpdateSliderDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").SliderWithRelations;
    }>;
    deleteSlider(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleSliderStatus(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").SliderWithRelations;
    }>;
    getSliderItems(sliderId: number, tenantId: number): Promise<{
        success: boolean;
        data: ({
            translations: {
                title: string | null;
                id: number;
                content: string | null;
                language: string;
                subtitle: string | null;
                buttonText: string | null;
                buttonColor: string | null;
                altText: string | null;
                sliderItemId: number;
            }[];
        } & {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            order: number | null;
            imageUrl: string;
            mobileImageUrl: string | null;
            tabletImageUrl: string | null;
            videoUrl: string | null;
            linkUrl: string | null;
            linkTarget: string;
            overlayColor: string | null;
            overlayOpacity: number;
            textPosition: string;
            animationIn: string;
            animationOut: string;
            sliderId: number;
            clickCount: number;
            viewCount: number;
        })[];
    }>;
    createSliderItem(sliderId: number, createSliderItemDto: CreateSliderItemDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").SliderItemWithRelations;
    }>;
    updateSliderItem(id: number, updateSliderItemDto: UpdateSliderItemDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").SliderItemWithRelations;
    }>;
    deleteSliderItem(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSliderItemOrder(id: number, newOrder: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getAllBannerPositions(tenantId: number): Promise<{
        success: boolean;
        data: ({
            banners: ({
                banner: {
                    translations: {
                        title: string | null;
                        id: number;
                        language: string;
                        subtitle: string | null;
                        buttonText: string | null;
                        altText: string | null;
                        bannerId: number;
                    }[];
                } & {
                    type: string;
                    id: number;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    startDate: Date | null;
                    endDate: Date | null;
                    order: number | null;
                    imageUrl: string;
                    mobileImageUrl: string | null;
                    linkUrl: string | null;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date | null;
                endDate: Date | null;
                order: number;
                bannerId: number;
                weight: number;
                clickCount: number;
                viewCount: number;
                positionId: number;
                conversionCount: number;
            })[];
        } & {
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            width: number | null;
            height: number | null;
            maxBanners: number;
            autoRotate: boolean;
            rotateSpeed: number;
        })[];
    }>;
    createBannerPosition(createBannerPositionDto: CreateBannerPositionDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").BannerPositionWithRelations;
    }>;
    updateBannerPosition(id: number, updateBannerPositionDto: UpdateBannerPositionDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./banners-sliders.service").BannerPositionWithRelations;
    }>;
    deleteBannerPosition(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllBanners(tenantId: number, query: BannerQueryDto): Promise<{
        success: boolean;
        data: {
            data: ({
                translations: {
                    title: string | null;
                    id: number;
                    language: string;
                    subtitle: string | null;
                    buttonText: string | null;
                    altText: string | null;
                    bannerId: number;
                }[];
            } & {
                type: string;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date | null;
                endDate: Date | null;
                order: number | null;
                imageUrl: string;
                mobileImageUrl: string | null;
                linkUrl: string | null;
            })[];
            meta: {
                total: number;
                page: any;
                limit: any;
                pages: number;
            };
        };
    }>;
    createBannerAssignment(createAssignmentDto: CreateBannerPositionAssignmentDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            banner: {
                translations: {
                    title: string | null;
                    id: number;
                    language: string;
                    subtitle: string | null;
                    buttonText: string | null;
                    altText: string | null;
                    bannerId: number;
                }[];
            } & {
                type: string;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date | null;
                endDate: Date | null;
                order: number | null;
                imageUrl: string;
                mobileImageUrl: string | null;
                linkUrl: string | null;
            };
            position: {
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                key: string;
                width: number | null;
                height: number | null;
                maxBanners: number;
                autoRotate: boolean;
                rotateSpeed: number;
            };
        } & {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            order: number;
            bannerId: number;
            weight: number;
            clickCount: number;
            viewCount: number;
            positionId: number;
            conversionCount: number;
        };
    }>;
    updateBannerAssignment(id: number, updateAssignmentDto: UpdateBannerPositionAssignmentDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            banner: {
                translations: {
                    title: string | null;
                    id: number;
                    language: string;
                    subtitle: string | null;
                    buttonText: string | null;
                    altText: string | null;
                    bannerId: number;
                }[];
            } & {
                type: string;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date | null;
                endDate: Date | null;
                order: number | null;
                imageUrl: string;
                mobileImageUrl: string | null;
                linkUrl: string | null;
            };
            position: {
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                key: string;
                width: number | null;
                height: number | null;
                maxBanners: number;
                autoRotate: boolean;
                rotateSpeed: number;
            };
        } & {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            order: number;
            bannerId: number;
            weight: number;
            clickCount: number;
            viewCount: number;
            positionId: number;
            conversionCount: number;
        };
    }>;
    deleteBannerAssignment(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getSliderAnalytics(id: number, tenantId: number, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            slider: {
                id: number;
                key: string;
                type: string;
                totalViews: number;
                totalClicks: number;
                clickThroughRate: string;
            };
            items: {
                id: number;
                title: string;
                views: number;
                clicks: number;
                ctr: string;
            }[];
        };
    }>;
    getBannerAnalytics(id: number, tenantId: number, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            overview: {
                total_banners: number;
                total_sliders: number;
                total_positions: number;
                banner_views: number;
                banner_clicks: number;
                slider_views: number;
                slider_clicks: number;
                click_through_rate: string;
            };
            top_performing: {
                banner_id: number;
                banner_title: string;
                position_name: string;
                views: number;
                clicks: number;
                conversions: number;
                ctr: string;
            }[];
        };
    }>;
}
