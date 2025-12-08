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
exports.BannersSlidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let BannersSlidersService = class BannersSlidersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSlider(createSliderDto, tenantId) {
        const existingSlider = await this.prisma.slider.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key: createSliderDto.key,
                },
            },
        });
        if (existingSlider) {
            throw new common_1.BadRequestException(`Slider with key '${createSliderDto.key}' already exists`);
        }
        const slider = await this.prisma.slider.create({
            data: {
                tenantId,
                key: createSliderDto.key,
                type: createSliderDto.type,
                autoPlay: createSliderDto.autoPlay,
                autoPlaySpeed: createSliderDto.autoPlaySpeed,
                showDots: createSliderDto.showDots,
                showArrows: createSliderDto.showArrows,
                infinite: createSliderDto.infinite,
                slidesToShow: createSliderDto.slidesToShow,
                slidesToScroll: createSliderDto.slidesToScroll,
                responsive: createSliderDto.responsive,
                order: createSliderDto.order,
                isActive: createSliderDto.isActive,
                translations: {
                    create: createSliderDto.translations,
                },
            },
            include: {
                translations: true,
                items: {
                    include: {
                        translations: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return slider;
    }
    async findAllSliders(tenantId, query = {}) {
        const { page = 1, limit = 20, type, isActive, search } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (type) {
            whereClause.type = type;
        }
        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }
        if (search) {
            whereClause.key = {
                contains: search,
                mode: 'insensitive',
            };
        }
        const [sliders, total] = await Promise.all([
            this.prisma.slider.findMany({
                where: whereClause,
                include: {
                    translations: true,
                    items: {
                        include: {
                            translations: true,
                        },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { order: 'asc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.slider.count({ where: whereClause }),
        ]);
        return {
            sliders: sliders,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findSliderById(id, tenantId) {
        const slider = await this.prisma.slider.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                items: {
                    include: {
                        translations: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        return slider;
    }
    async findSliderByKey(key, tenantId) {
        const slider = await this.prisma.slider.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key,
                },
            },
            include: {
                translations: true,
                items: {
                    include: {
                        translations: true,
                    },
                    where: {
                        isActive: true,
                        OR: [
                            { startDate: null },
                            { startDate: { lte: new Date() } },
                        ],
                        AND: [
                            {
                                OR: [
                                    { endDate: null },
                                    { endDate: { gte: new Date() } },
                                ],
                            },
                        ],
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return slider;
    }
    async updateSlider(id, updateSliderDto, tenantId) {
        await this.findSliderById(id, tenantId);
        if (updateSliderDto.key) {
            const existingSlider = await this.prisma.slider.findUnique({
                where: {
                    tenantId_key: {
                        tenantId,
                        key: updateSliderDto.key,
                    },
                },
            });
            if (existingSlider && existingSlider.id !== id) {
                throw new common_1.BadRequestException(`Slider with key '${updateSliderDto.key}' already exists`);
            }
        }
        const updateData = {};
        if (updateSliderDto.key !== undefined)
            updateData.key = updateSliderDto.key;
        if (updateSliderDto.type !== undefined)
            updateData.type = updateSliderDto.type;
        if (updateSliderDto.autoPlay !== undefined)
            updateData.autoPlay = updateSliderDto.autoPlay;
        if (updateSliderDto.autoPlaySpeed !== undefined)
            updateData.autoPlaySpeed = updateSliderDto.autoPlaySpeed;
        if (updateSliderDto.showDots !== undefined)
            updateData.showDots = updateSliderDto.showDots;
        if (updateSliderDto.showArrows !== undefined)
            updateData.showArrows = updateSliderDto.showArrows;
        if (updateSliderDto.infinite !== undefined)
            updateData.infinite = updateSliderDto.infinite;
        if (updateSliderDto.slidesToShow !== undefined)
            updateData.slidesToShow = updateSliderDto.slidesToShow;
        if (updateSliderDto.slidesToScroll !== undefined)
            updateData.slidesToScroll = updateSliderDto.slidesToScroll;
        if (updateSliderDto.responsive !== undefined)
            updateData.responsive = updateSliderDto.responsive;
        if (updateSliderDto.order !== undefined)
            updateData.order = updateSliderDto.order;
        if (updateSliderDto.isActive !== undefined)
            updateData.isActive = updateSliderDto.isActive;
        await this.prisma.slider.update({
            where: { id },
            data: updateData,
        });
        if (updateSliderDto.translations) {
            await this.prisma.sliderTranslation.deleteMany({
                where: { sliderId: id },
            });
            await this.prisma.sliderTranslation.createMany({
                data: updateSliderDto.translations.map(translation => ({
                    sliderId: id,
                    ...translation,
                })),
            });
        }
        return this.findSliderById(id, tenantId);
    }
    async removeSlider(id, tenantId) {
        await this.findSliderById(id, tenantId);
        await this.prisma.slider.delete({ where: { id } });
    }
    async createSliderItem(sliderId, createSliderItemDto, tenantId) {
        await this.findSliderById(sliderId, tenantId);
        const sliderItem = await this.prisma.sliderItem.create({
            data: {
                sliderId,
                imageUrl: createSliderItemDto.imageUrl,
                mobileImageUrl: createSliderItemDto.mobileImageUrl,
                tabletImageUrl: createSliderItemDto.tabletImageUrl,
                videoUrl: createSliderItemDto.videoUrl,
                linkUrl: createSliderItemDto.linkUrl,
                linkTarget: createSliderItemDto.linkTarget,
                overlayColor: createSliderItemDto.overlayColor,
                overlayOpacity: createSliderItemDto.overlayOpacity,
                textPosition: createSliderItemDto.textPosition,
                animationIn: createSliderItemDto.animationIn,
                animationOut: createSliderItemDto.animationOut,
                order: createSliderItemDto.order,
                isActive: createSliderItemDto.isActive,
                startDate: createSliderItemDto.startDate ? new Date(createSliderItemDto.startDate) : null,
                endDate: createSliderItemDto.endDate ? new Date(createSliderItemDto.endDate) : null,
                translations: {
                    create: createSliderItemDto.translations,
                },
            },
            include: {
                translations: true,
            },
        });
        return sliderItem;
    }
    async findSliderItemById(id, tenantId) {
        const sliderItem = await this.prisma.sliderItem.findFirst({
            where: {
                id,
                slider: { tenantId },
            },
            include: {
                translations: true,
            },
        });
        if (!sliderItem) {
            throw new common_1.NotFoundException('Slider item not found');
        }
        return sliderItem;
    }
    async updateSliderItem(id, updateSliderItemDto, tenantId) {
        await this.findSliderItemById(id, tenantId);
        const updateData = {};
        if (updateSliderItemDto.imageUrl !== undefined)
            updateData.imageUrl = updateSliderItemDto.imageUrl;
        if (updateSliderItemDto.mobileImageUrl !== undefined)
            updateData.mobileImageUrl = updateSliderItemDto.mobileImageUrl;
        if (updateSliderItemDto.tabletImageUrl !== undefined)
            updateData.tabletImageUrl = updateSliderItemDto.tabletImageUrl;
        if (updateSliderItemDto.videoUrl !== undefined)
            updateData.videoUrl = updateSliderItemDto.videoUrl;
        if (updateSliderItemDto.linkUrl !== undefined)
            updateData.linkUrl = updateSliderItemDto.linkUrl;
        if (updateSliderItemDto.linkTarget !== undefined)
            updateData.linkTarget = updateSliderItemDto.linkTarget;
        if (updateSliderItemDto.overlayColor !== undefined)
            updateData.overlayColor = updateSliderItemDto.overlayColor;
        if (updateSliderItemDto.overlayOpacity !== undefined)
            updateData.overlayOpacity = updateSliderItemDto.overlayOpacity;
        if (updateSliderItemDto.textPosition !== undefined)
            updateData.textPosition = updateSliderItemDto.textPosition;
        if (updateSliderItemDto.animationIn !== undefined)
            updateData.animationIn = updateSliderItemDto.animationIn;
        if (updateSliderItemDto.animationOut !== undefined)
            updateData.animationOut = updateSliderItemDto.animationOut;
        if (updateSliderItemDto.order !== undefined)
            updateData.order = updateSliderItemDto.order;
        if (updateSliderItemDto.isActive !== undefined)
            updateData.isActive = updateSliderItemDto.isActive;
        if (updateSliderItemDto.startDate !== undefined)
            updateData.startDate = updateSliderItemDto.startDate ? new Date(updateSliderItemDto.startDate) : null;
        if (updateSliderItemDto.endDate !== undefined)
            updateData.endDate = updateSliderItemDto.endDate ? new Date(updateSliderItemDto.endDate) : null;
        await this.prisma.sliderItem.update({
            where: { id },
            data: updateData,
        });
        if (updateSliderItemDto.translations) {
            await this.prisma.sliderItemTranslation.deleteMany({
                where: { sliderItemId: id },
            });
            await this.prisma.sliderItemTranslation.createMany({
                data: updateSliderItemDto.translations.map(translation => ({
                    sliderItemId: id,
                    ...translation,
                })),
            });
        }
        return this.findSliderItemById(id, tenantId);
    }
    async removeSliderItem(id, tenantId) {
        await this.findSliderItemById(id, tenantId);
        await this.prisma.sliderItem.delete({ where: { id } });
    }
    async trackSliderItemView(id, tenantId) {
        await this.findSliderItemById(id, tenantId);
        await this.prisma.sliderItem.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }
    async trackSliderItemClick(id, tenantId) {
        await this.findSliderItemById(id, tenantId);
        await this.prisma.sliderItem.update({
            where: { id },
            data: { clickCount: { increment: 1 } },
        });
    }
    async createBanner(createBannerDto, tenantId) {
        const banner = await this.prisma.banner.create({
            data: {
                tenantId,
                type: createBannerDto.type,
                imageUrl: createBannerDto.imageUrl,
                mobileImageUrl: createBannerDto.mobileImageUrl,
                linkUrl: createBannerDto.linkUrl,
                order: createBannerDto.order,
                isActive: createBannerDto.isActive,
                startDate: createBannerDto.startDate ? new Date(createBannerDto.startDate) : null,
                endDate: createBannerDto.endDate ? new Date(createBannerDto.endDate) : null,
                translations: {
                    create: createBannerDto.translations,
                },
            },
            include: {
                translations: true,
                positions: {
                    include: {
                        position: true,
                    },
                },
            },
        });
        return banner;
    }
    async findAllBanners(tenantId, query = {}) {
        const { page = 1, limit = 20, type, isActive } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (type) {
            whereClause.type = type;
        }
        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }
        const [banners, total] = await Promise.all([
            this.prisma.banner.findMany({
                where: whereClause,
                include: {
                    translations: true,
                    positions: {
                        include: {
                            position: true,
                        },
                    },
                },
                orderBy: { order: 'asc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.banner.count({ where: whereClause }),
        ]);
        return {
            banners: banners,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findBannerById(id, tenantId) {
        const banner = await this.prisma.banner.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                positions: {
                    include: {
                        position: true,
                    },
                },
            },
        });
        if (!banner) {
            throw new common_1.NotFoundException('Banner not found');
        }
        return banner;
    }
    async updateBanner(id, updateBannerDto, tenantId) {
        await this.findBannerById(id, tenantId);
        const updateData = {};
        if (updateBannerDto.type !== undefined)
            updateData.type = updateBannerDto.type;
        if (updateBannerDto.imageUrl !== undefined)
            updateData.imageUrl = updateBannerDto.imageUrl;
        if (updateBannerDto.mobileImageUrl !== undefined)
            updateData.mobileImageUrl = updateBannerDto.mobileImageUrl;
        if (updateBannerDto.linkUrl !== undefined)
            updateData.linkUrl = updateBannerDto.linkUrl;
        if (updateBannerDto.order !== undefined)
            updateData.order = updateBannerDto.order;
        if (updateBannerDto.isActive !== undefined)
            updateData.isActive = updateBannerDto.isActive;
        if (updateBannerDto.startDate !== undefined)
            updateData.startDate = updateBannerDto.startDate ? new Date(updateBannerDto.startDate) : null;
        if (updateBannerDto.endDate !== undefined)
            updateData.endDate = updateBannerDto.endDate ? new Date(updateBannerDto.endDate) : null;
        await this.prisma.banner.update({
            where: { id },
            data: updateData,
        });
        if (updateBannerDto.translations) {
            await this.prisma.bannerTranslation.deleteMany({
                where: { bannerId: id },
            });
            await this.prisma.bannerTranslation.createMany({
                data: updateBannerDto.translations.map(translation => ({
                    bannerId: id,
                    ...translation,
                })),
            });
        }
        return this.findBannerById(id, tenantId);
    }
    async removeBanner(id, tenantId) {
        await this.findBannerById(id, tenantId);
        await this.prisma.banner.delete({ where: { id } });
    }
    async createBannerPosition(createBannerPositionDto, tenantId) {
        const existingPosition = await this.prisma.bannerPosition.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key: createBannerPositionDto.key,
                },
            },
        });
        if (existingPosition) {
            throw new common_1.BadRequestException(`Banner position with key '${createBannerPositionDto.key}' already exists`);
        }
        const position = await this.prisma.bannerPosition.create({
            data: {
                tenantId,
                key: createBannerPositionDto.key,
                name: createBannerPositionDto.name,
                width: createBannerPositionDto.width,
                height: createBannerPositionDto.height,
                maxBanners: createBannerPositionDto.maxBanners,
                autoRotate: createBannerPositionDto.autoRotate,
                rotateSpeed: createBannerPositionDto.rotateSpeed,
            },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                },
            },
        });
        return position;
    }
    async findAllBannerPositions(tenantId) {
        const positions = await this.prisma.bannerPosition.findMany({
            where: { tenantId },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { key: 'asc' },
        });
        return positions;
    }
    async findBannerPositionById(id, tenantId) {
        const position = await this.prisma.bannerPosition.findFirst({
            where: { id, tenantId },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!position) {
            throw new common_1.NotFoundException('Banner position not found');
        }
        return position;
    }
    async findBannerPositionByKey(key, tenantId) {
        const position = await this.prisma.bannerPosition.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key,
                },
            },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                    where: {
                        isActive: true,
                        banner: {
                            isActive: true,
                            OR: [
                                { startDate: null },
                                { startDate: { lte: new Date() } },
                            ],
                            AND: [
                                {
                                    OR: [
                                        { endDate: null },
                                        { endDate: { gte: new Date() } },
                                    ],
                                },
                            ],
                        },
                    },
                    orderBy: [
                        { order: 'asc' },
                        { weight: 'desc' },
                    ],
                },
            },
        });
        return position;
    }
    async updateBannerPosition(id, updateBannerPositionDto, tenantId) {
        await this.findBannerPositionById(id, tenantId);
        if (updateBannerPositionDto.key) {
            const existingPosition = await this.prisma.bannerPosition.findUnique({
                where: {
                    tenantId_key: {
                        tenantId,
                        key: updateBannerPositionDto.key,
                    },
                },
            });
            if (existingPosition && existingPosition.id !== id) {
                throw new common_1.BadRequestException(`Banner position with key '${updateBannerPositionDto.key}' already exists`);
            }
        }
        const position = await this.prisma.bannerPosition.update({
            where: { id },
            data: {
                key: updateBannerPositionDto.key,
                name: updateBannerPositionDto.name,
                width: updateBannerPositionDto.width,
                height: updateBannerPositionDto.height,
                maxBanners: updateBannerPositionDto.maxBanners,
                autoRotate: updateBannerPositionDto.autoRotate,
                rotateSpeed: updateBannerPositionDto.rotateSpeed,
            },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return position;
    }
    async removeBannerPosition(id, tenantId) {
        await this.findBannerPositionById(id, tenantId);
        await this.prisma.bannerPosition.delete({ where: { id } });
    }
    async assignBannerToPosition(positionId, assignmentDto, tenantId) {
        await this.findBannerPositionById(positionId, tenantId);
        await this.findBannerById(assignmentDto.bannerId, tenantId);
        const existingAssignment = await this.prisma.bannerPositionAssignment.findUnique({
            where: {
                bannerId_positionId: {
                    bannerId: assignmentDto.bannerId,
                    positionId,
                },
            },
        });
        if (existingAssignment) {
            throw new common_1.BadRequestException('Banner is already assigned to this position');
        }
        await this.prisma.bannerPositionAssignment.create({
            data: {
                bannerId: assignmentDto.bannerId,
                positionId,
                order: assignmentDto.order,
                weight: assignmentDto.weight,
                startDate: assignmentDto.startDate ? new Date(assignmentDto.startDate) : null,
                endDate: assignmentDto.endDate ? new Date(assignmentDto.endDate) : null,
            },
        });
    }
    async removeBannerFromPosition(positionId, bannerId, tenantId) {
        await this.findBannerPositionById(positionId, tenantId);
        const assignment = await this.prisma.bannerPositionAssignment.findUnique({
            where: {
                bannerId_positionId: {
                    bannerId,
                    positionId,
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Banner assignment not found');
        }
        await this.prisma.bannerPositionAssignment.delete({
            where: {
                bannerId_positionId: {
                    bannerId,
                    positionId,
                },
            },
        });
    }
    async trackBannerView(assignmentId) {
        await this.prisma.bannerPositionAssignment.update({
            where: { id: assignmentId },
            data: { viewCount: { increment: 1 } },
        });
    }
    async trackBannerClick(assignmentId) {
        await this.prisma.bannerPositionAssignment.updateMany({
            where: { id: assignmentId },
            data: {
                clickCount: { increment: 1 },
                conversionCount: { increment: 1 },
            },
        });
    }
    async getBannerAnalytics(tenantId) {
        const [bannerStats, sliderStats, positionStats, topPerforming] = await Promise.all([
            this.prisma.banner.aggregate({
                where: { tenantId },
                _count: { id: true },
            }),
            this.prisma.slider.aggregate({
                where: { tenantId },
                _count: { id: true },
            }),
            this.prisma.bannerPosition.aggregate({
                where: { tenantId },
                _count: { id: true },
            }),
            this.prisma.bannerPositionAssignment.findMany({
                where: {
                    position: { tenantId },
                    clickCount: { gt: 0 },
                },
                include: {
                    banner: {
                        include: {
                            translations: true,
                        },
                    },
                    position: true,
                },
                orderBy: { clickCount: 'desc' },
                take: 10,
            }),
        ]);
        const totalViews = await this.prisma.bannerPositionAssignment.aggregate({
            where: { position: { tenantId } },
            _sum: { viewCount: true },
        });
        const totalClicks = await this.prisma.bannerPositionAssignment.aggregate({
            where: { position: { tenantId } },
            _sum: { clickCount: true },
        });
        const sliderItemViews = await this.prisma.sliderItem.aggregate({
            where: { slider: { tenantId } },
            _sum: { viewCount: true },
        });
        const sliderItemClicks = await this.prisma.sliderItem.aggregate({
            where: { slider: { tenantId } },
            _sum: { clickCount: true },
        });
        return {
            overview: {
                total_banners: bannerStats._count.id,
                total_sliders: sliderStats._count.id,
                total_positions: positionStats._count.id,
                banner_views: totalViews._sum.viewCount || 0,
                banner_clicks: totalClicks._sum.clickCount || 0,
                slider_views: sliderItemViews._sum.viewCount || 0,
                slider_clicks: sliderItemClicks._sum.clickCount || 0,
                click_through_rate: totalViews._sum.viewCount ?
                    ((totalClicks._sum.clickCount || 0) / totalViews._sum.viewCount * 100).toFixed(2) + '%' :
                    '0%',
            },
            top_performing: topPerforming.map(assignment => ({
                banner_id: assignment.bannerId,
                banner_title: assignment.banner.translations[0]?.title || 'Untitled Banner',
                position_name: assignment.position.name,
                views: assignment.viewCount,
                clicks: assignment.clickCount,
                conversions: assignment.conversionCount,
                ctr: assignment.viewCount ?
                    (assignment.clickCount / assignment.viewCount * 100).toFixed(2) + '%' :
                    '0%',
            })),
        };
    }
    async getSliderByKey(key, tenantId) {
        return await this.prisma.slider.findFirst({
            where: {
                key,
                tenantId,
                isActive: true
            },
            include: {
                translations: true,
                items: {
                    where: { isActive: true },
                    include: { translations: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    async trackSliderView(id) {
        await this.prisma.sliderItem.updateMany({
            where: { sliderId: id },
            data: { viewCount: { increment: 1 } }
        });
    }
    async trackSliderClick(id) {
        await this.prisma.sliderItem.updateMany({
            where: { id },
            data: { clickCount: { increment: 1 } }
        });
    }
    async getBannersByPosition(position, tenantId) {
        const bannerPosition = await this.prisma.bannerPosition.findFirst({
            where: { key: position, tenantId }
        });
        if (!bannerPosition)
            return [];
        const assignments = await this.prisma.bannerPositionAssignment.findMany({
            where: {
                positionId: bannerPosition.id,
                isActive: true,
                banner: { isActive: true }
            },
            include: {
                banner: {
                    include: { translations: true }
                }
            },
            orderBy: { order: 'asc' }
        });
        return assignments.map(assignment => assignment.banner);
    }
    async getAllSliders(tenantId, query) {
        const { type, isActive, search, page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = query;
        const where = { tenantId };
        if (type)
            where.type = type;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { key: { contains: search, mode: 'insensitive' } },
                { translations: { some: { title: { contains: search, mode: 'insensitive' } } } }
            ];
        }
        const [sliders, total] = await Promise.all([
            this.prisma.slider.findMany({
                where,
                include: {
                    translations: true,
                    items: { where: { isActive: true }, orderBy: { order: 'asc' } }
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            }),
            this.prisma.slider.count({ where })
        ]);
        return {
            data: sliders,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getSliderById(id, tenantId) {
        const slider = await this.prisma.slider.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                items: {
                    include: { translations: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        return slider;
    }
    async deleteSlider(id, tenantId) {
        const slider = await this.prisma.slider.findFirst({
            where: { id, tenantId }
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        await this.prisma.slider.delete({ where: { id } });
    }
    async toggleSliderStatus(id, tenantId) {
        const slider = await this.prisma.slider.findFirst({
            where: { id, tenantId }
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        const updatedSlider = await this.prisma.slider.update({
            where: { id },
            data: { isActive: !slider.isActive },
            include: {
                translations: true,
                items: {
                    include: { translations: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        return updatedSlider;
    }
    async getSliderItems(sliderId, tenantId) {
        const slider = await this.prisma.slider.findFirst({
            where: { id: sliderId, tenantId }
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        return await this.prisma.sliderItem.findMany({
            where: { sliderId },
            include: { translations: true },
            orderBy: { order: 'asc' }
        });
    }
    async deleteSliderItem(id, tenantId) {
        const sliderItem = await this.prisma.sliderItem.findFirst({
            where: {
                id,
                slider: { tenantId }
            }
        });
        if (!sliderItem) {
            throw new common_1.NotFoundException('Slider item not found');
        }
        await this.prisma.sliderItem.delete({ where: { id } });
    }
    async updateSliderItemOrder(id, newOrder, tenantId) {
        const sliderItem = await this.prisma.sliderItem.findFirst({
            where: {
                id,
                slider: { tenantId }
            }
        });
        if (!sliderItem) {
            throw new common_1.NotFoundException('Slider item not found');
        }
        return await this.prisma.sliderItem.update({
            where: { id },
            data: { order: newOrder },
            include: { translations: true }
        });
    }
    async getAllBannerPositions(tenantId) {
        return await this.prisma.bannerPosition.findMany({
            where: { tenantId },
            include: {
                banners: {
                    include: {
                        banner: {
                            include: { translations: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
    async deleteBannerPosition(id, tenantId) {
        const position = await this.prisma.bannerPosition.findFirst({
            where: { id, tenantId }
        });
        if (!position) {
            throw new common_1.NotFoundException('Banner position not found');
        }
        await this.prisma.bannerPosition.delete({ where: { id } });
    }
    async getAllBanners(tenantId, query) {
        const { type, isActive, search, page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = query;
        const where = { tenantId };
        if (type)
            where.type = type;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { imageUrl: { contains: search, mode: 'insensitive' } },
                { translations: { some: { title: { contains: search, mode: 'insensitive' } } } }
            ];
        }
        const [banners, total] = await Promise.all([
            this.prisma.banner.findMany({
                where,
                include: { translations: true },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            }),
            this.prisma.banner.count({ where })
        ]);
        return {
            data: banners,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async createBannerPositionAssignment(data, tenantId) {
        const banner = await this.prisma.banner.findFirst({
            where: { id: data.bannerId, tenantId }
        });
        if (!banner) {
            throw new common_1.NotFoundException('Banner not found');
        }
        const position = await this.prisma.bannerPosition.findFirst({
            where: { id: data.bannerPositionId, tenantId }
        });
        if (!position) {
            throw new common_1.NotFoundException('Banner position not found');
        }
        return await this.prisma.bannerPositionAssignment.create({
            data,
            include: {
                banner: { include: { translations: true } },
                position: true
            }
        });
    }
    async updateBannerPositionAssignment(id, data, tenantId) {
        const assignment = await this.prisma.bannerPositionAssignment.findFirst({
            where: {
                id,
                position: { tenantId }
            }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Banner position assignment not found');
        }
        return await this.prisma.bannerPositionAssignment.update({
            where: { id },
            data,
            include: {
                banner: { include: { translations: true } },
                position: true
            }
        });
    }
    async deleteBannerPositionAssignment(id, tenantId) {
        const assignment = await this.prisma.bannerPositionAssignment.findFirst({
            where: {
                id,
                position: { tenantId }
            }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Banner position assignment not found');
        }
        await this.prisma.bannerPositionAssignment.delete({ where: { id } });
    }
    async getSliderAnalytics(id, tenantId, startDate, endDate) {
        const slider = await this.prisma.slider.findFirst({
            where: { id, tenantId }
        });
        if (!slider) {
            throw new common_1.NotFoundException('Slider not found');
        }
        const items = await this.prisma.sliderItem.findMany({
            where: { sliderId: id },
            include: { translations: true }
        });
        const totalViews = items.reduce((sum, item) => sum + (item.viewCount || 0), 0);
        const totalClicks = items.reduce((sum, item) => sum + (item.clickCount || 0), 0);
        return {
            slider: {
                id: slider.id,
                key: slider.key,
                type: slider.type,
                totalViews,
                totalClicks,
                clickThroughRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) + '%' : '0%'
            },
            items: items.map(item => ({
                id: item.id,
                title: item.translations[0]?.title || 'Untitled',
                views: item.viewCount || 0,
                clicks: item.clickCount || 0,
                ctr: (item.viewCount || 0) > 0 ? (((item.clickCount || 0) / (item.viewCount || 0)) * 100).toFixed(2) + '%' : '0%'
            }))
        };
    }
};
exports.BannersSlidersService = BannersSlidersService;
exports.BannersSlidersService = BannersSlidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BannersSlidersService);
//# sourceMappingURL=banners-sliders.service.js.map