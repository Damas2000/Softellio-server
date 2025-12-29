import { PrismaService } from '../config/prisma.service';
import { CreateSliderDto, UpdateSliderDto, CreateSliderItemDto, UpdateSliderItemDto, CreateBannerDto, UpdateBannerDto, CreateBannerPositionDto, UpdateBannerPositionDto, BannerPositionAssignmentDto, BannerSliderQueryDto } from './dto/banner-slider.dto';
export interface SliderWithRelations {
    id: number;
    tenantId: number;
    key: string;
    type: string;
    autoPlay: boolean;
    autoPlaySpeed: number;
    showDots: boolean;
    showArrows: boolean;
    infinite: boolean;
    slidesToShow: number;
    slidesToScroll: number;
    responsive: any;
    isActive: boolean;
    order: number | null;
    createdAt: Date;
    updatedAt: Date;
    translations: {
        id: number;
        language: string;
        title: string | null;
        description: string | null;
    }[];
    items: SliderItemWithRelations[];
}
export interface SliderItemWithRelations {
    id: number;
    sliderId: number;
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
    order: number | null;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    clickCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    translations: {
        id: number;
        language: string;
        title: string | null;
        subtitle: string | null;
        content: string | null;
        buttonText: string | null;
        buttonColor: string | null;
        altText: string | null;
    }[];
}
export interface BannerWithRelations {
    id: number;
    tenantId: number;
    type: string;
    imageUrl: string;
    mobileImageUrl: string | null;
    linkUrl: string | null;
    order: number | null;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    translations: {
        id: number;
        language: string;
        title: string | null;
        subtitle: string | null;
        buttonText: string | null;
        altText: string | null;
    }[];
    positions: {
        id: number;
        order: number;
        weight: number;
        isActive: boolean;
        startDate: Date | null;
        endDate: Date | null;
        clickCount: number;
        viewCount: number;
        conversionCount: number;
        position: {
            id: number;
            key: string;
            name: string;
            width: number | null;
            height: number | null;
            maxBanners: number;
            autoRotate: boolean;
            rotateSpeed: number;
        };
    }[];
}
export interface BannerPositionWithRelations {
    id: number;
    tenantId: number;
    key: string;
    name: string;
    width: number | null;
    height: number | null;
    maxBanners: number;
    autoRotate: boolean;
    rotateSpeed: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    banners: {
        id: number;
        order: number;
        weight: number;
        isActive: boolean;
        startDate: Date | null;
        endDate: Date | null;
        clickCount: number;
        viewCount: number;
        conversionCount: number;
        banner: {
            id: number;
            type: string;
            imageUrl: string;
            mobileImageUrl: string | null;
            linkUrl: string | null;
            isActive: boolean;
            translations: {
                language: string;
                title: string | null;
                subtitle: string | null;
                buttonText: string | null;
                altText: string | null;
            }[];
        };
    }[];
}
export declare class BannersSlidersService {
    private prisma;
    constructor(prisma: PrismaService);
    createSlider(createSliderDto: CreateSliderDto, tenantId: number): Promise<SliderWithRelations>;
    findAllSliders(tenantId: number, query?: BannerSliderQueryDto): Promise<{
        sliders: SliderWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findSliderById(id: number, tenantId: number): Promise<SliderWithRelations>;
    findSliderByKey(key: string, tenantId: number): Promise<SliderWithRelations | null>;
    updateSlider(id: number, updateSliderDto: UpdateSliderDto, tenantId: number): Promise<SliderWithRelations>;
    removeSlider(id: number, tenantId: number): Promise<void>;
    createSliderItem(sliderId: number, createSliderItemDto: CreateSliderItemDto, tenantId: number): Promise<SliderItemWithRelations>;
    findSliderItemById(id: number, tenantId: number): Promise<SliderItemWithRelations>;
    updateSliderItem(id: number, updateSliderItemDto: UpdateSliderItemDto, tenantId: number): Promise<SliderItemWithRelations>;
    removeSliderItem(id: number, tenantId: number): Promise<void>;
    trackSliderItemView(id: number, tenantId: number): Promise<void>;
    trackSliderItemClick(id: number, tenantId: number): Promise<void>;
    createBanner(createBannerDto: CreateBannerDto, tenantId: number): Promise<BannerWithRelations>;
    findAllBanners(tenantId: number, query?: BannerSliderQueryDto): Promise<{
        banners: BannerWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findBannerById(id: number, tenantId: number): Promise<BannerWithRelations>;
    updateBanner(id: number, updateBannerDto: UpdateBannerDto, tenantId: number): Promise<BannerWithRelations>;
    removeBanner(id: number, tenantId: number): Promise<void>;
    createBannerPosition(createBannerPositionDto: CreateBannerPositionDto, tenantId: number): Promise<BannerPositionWithRelations>;
    findAllBannerPositions(tenantId: number): Promise<BannerPositionWithRelations[]>;
    findBannerPositionById(id: number, tenantId: number): Promise<BannerPositionWithRelations>;
    findBannerPositionByKey(key: string, tenantId: number): Promise<BannerPositionWithRelations | null>;
    updateBannerPosition(id: number, updateBannerPositionDto: UpdateBannerPositionDto, tenantId: number): Promise<BannerPositionWithRelations>;
    removeBannerPosition(id: number, tenantId: number): Promise<void>;
    assignBannerToPosition(positionId: number, assignmentDto: BannerPositionAssignmentDto, tenantId: number): Promise<void>;
    removeBannerFromPosition(positionId: number, bannerId: number, tenantId: number): Promise<void>;
    trackBannerView(assignmentId: number): Promise<void>;
    trackBannerClick(assignmentId: number): Promise<void>;
    getBannerAnalytics(tenantId: number): Promise<{
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
    }>;
    getSliderByKey(key: string, tenantId: number): Promise<SliderWithRelations | null>;
    trackSliderView(id: number): Promise<void>;
    trackSliderClick(id: number): Promise<void>;
    getBannersByPosition(position: string, tenantId: number): Promise<({
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
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        order: number | null;
        startDate: Date | null;
        endDate: Date | null;
        imageUrl: string;
        mobileImageUrl: string | null;
        linkUrl: string | null;
    })[]>;
    getAllSliders(tenantId: number, query: any): Promise<{
        data: ({
            items: {
                id: number;
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                order: number | null;
                overlayColor: string | null;
                startDate: Date | null;
                endDate: Date | null;
                imageUrl: string;
                mobileImageUrl: string | null;
                tabletImageUrl: string | null;
                videoUrl: string | null;
                linkUrl: string | null;
                linkTarget: string;
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
            createdAt: Date;
            isActive: boolean;
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
    }>;
    getSliderById(id: number, tenantId: number): Promise<SliderWithRelations>;
    deleteSlider(id: number, tenantId: number): Promise<void>;
    toggleSliderStatus(id: number, tenantId: number): Promise<SliderWithRelations>;
    getSliderItems(sliderId: number, tenantId: number): Promise<({
        translations: {
            content: string | null;
            title: string | null;
            id: number;
            language: string;
            subtitle: string | null;
            buttonText: string | null;
            buttonColor: string | null;
            altText: string | null;
            sliderItemId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        order: number | null;
        overlayColor: string | null;
        startDate: Date | null;
        endDate: Date | null;
        imageUrl: string;
        mobileImageUrl: string | null;
        tabletImageUrl: string | null;
        videoUrl: string | null;
        linkUrl: string | null;
        linkTarget: string;
        overlayOpacity: number;
        textPosition: string;
        animationIn: string;
        animationOut: string;
        sliderId: number;
        clickCount: number;
        viewCount: number;
    })[]>;
    deleteSliderItem(id: number, tenantId: number): Promise<void>;
    updateSliderItemOrder(id: number, newOrder: number, tenantId: number): Promise<any>;
    getAllBannerPositions(tenantId: number): Promise<({
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
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                order: number | null;
                startDate: Date | null;
                endDate: Date | null;
                imageUrl: string;
                mobileImageUrl: string | null;
                linkUrl: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            order: number;
            startDate: Date | null;
            endDate: Date | null;
            bannerId: number;
            weight: number;
            clickCount: number;
            viewCount: number;
            positionId: number;
            conversionCount: number;
        })[];
    } & {
        name: string;
        id: number;
        tenantId: number;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        key: string;
        width: number | null;
        height: number | null;
        maxBanners: number;
        autoRotate: boolean;
        rotateSpeed: number;
    })[]>;
    deleteBannerPosition(id: number, tenantId: number): Promise<void>;
    getAllBanners(tenantId: number, query: any): Promise<{
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
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            order: number | null;
            startDate: Date | null;
            endDate: Date | null;
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
    }>;
    createBannerPositionAssignment(data: any, tenantId: number): Promise<{
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
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            order: number | null;
            startDate: Date | null;
            endDate: Date | null;
            imageUrl: string;
            mobileImageUrl: string | null;
            linkUrl: string | null;
        };
        position: {
            name: string;
            id: number;
            tenantId: number;
            createdAt: Date;
            isActive: boolean;
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
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        order: number;
        startDate: Date | null;
        endDate: Date | null;
        bannerId: number;
        weight: number;
        clickCount: number;
        viewCount: number;
        positionId: number;
        conversionCount: number;
    }>;
    updateBannerPositionAssignment(id: number, data: any, tenantId: number): Promise<{
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
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            order: number | null;
            startDate: Date | null;
            endDate: Date | null;
            imageUrl: string;
            mobileImageUrl: string | null;
            linkUrl: string | null;
        };
        position: {
            name: string;
            id: number;
            tenantId: number;
            createdAt: Date;
            isActive: boolean;
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
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        order: number;
        startDate: Date | null;
        endDate: Date | null;
        bannerId: number;
        weight: number;
        clickCount: number;
        viewCount: number;
        positionId: number;
        conversionCount: number;
    }>;
    deleteBannerPositionAssignment(id: number, tenantId: number): Promise<void>;
    getSliderAnalytics(id: number, tenantId: number, startDate?: string, endDate?: string): Promise<{
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
    }>;
}
