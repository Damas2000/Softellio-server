import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateSliderDto,
  UpdateSliderDto,
  CreateSliderItemDto,
  UpdateSliderItemDto,
  CreateBannerDto,
  UpdateBannerDto,
  CreateBannerPositionDto,
  UpdateBannerPositionDto,
  BannerPositionAssignmentDto,
  BannerSliderQueryDto
} from './dto/banner-slider.dto';

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

@Injectable()
export class BannersSlidersService {
  constructor(private prisma: PrismaService) {}

  // ==================== SLIDER MANAGEMENT ====================

  async createSlider(
    createSliderDto: CreateSliderDto,
    tenantId: number,
  ): Promise<SliderWithRelations> {
    // Check if slider with same key already exists
    const existingSlider = await this.prisma.slider.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: createSliderDto.key,
        },
      },
    });

    if (existingSlider) {
      throw new BadRequestException(`Slider with key '${createSliderDto.key}' already exists`);
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

    return slider as SliderWithRelations;
  }

  async findAllSliders(
    tenantId: number,
    query: BannerSliderQueryDto = {},
  ): Promise<{
    sliders: SliderWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20, type, isActive, search } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

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
      sliders: sliders as SliderWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findSliderById(
    id: number,
    tenantId: number,
  ): Promise<SliderWithRelations> {
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
      throw new NotFoundException('Slider not found');
    }

    return slider as SliderWithRelations;
  }

  async findSliderByKey(
    key: string,
    tenantId: number,
  ): Promise<SliderWithRelations | null> {
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

    return slider as SliderWithRelations | null;
  }

  async updateSlider(
    id: number,
    updateSliderDto: UpdateSliderDto,
    tenantId: number,
  ): Promise<SliderWithRelations> {
    await this.findSliderById(id, tenantId);

    // Check for duplicate key if updating key
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
        throw new BadRequestException(`Slider with key '${updateSliderDto.key}' already exists`);
      }
    }

    // Update basic slider data
    const updateData: any = {};
    if (updateSliderDto.key !== undefined) updateData.key = updateSliderDto.key;
    if (updateSliderDto.type !== undefined) updateData.type = updateSliderDto.type;
    if (updateSliderDto.autoPlay !== undefined) updateData.autoPlay = updateSliderDto.autoPlay;
    if (updateSliderDto.autoPlaySpeed !== undefined) updateData.autoPlaySpeed = updateSliderDto.autoPlaySpeed;
    if (updateSliderDto.showDots !== undefined) updateData.showDots = updateSliderDto.showDots;
    if (updateSliderDto.showArrows !== undefined) updateData.showArrows = updateSliderDto.showArrows;
    if (updateSliderDto.infinite !== undefined) updateData.infinite = updateSliderDto.infinite;
    if (updateSliderDto.slidesToShow !== undefined) updateData.slidesToShow = updateSliderDto.slidesToShow;
    if (updateSliderDto.slidesToScroll !== undefined) updateData.slidesToScroll = updateSliderDto.slidesToScroll;
    if (updateSliderDto.responsive !== undefined) updateData.responsive = updateSliderDto.responsive;
    if (updateSliderDto.order !== undefined) updateData.order = updateSliderDto.order;
    if (updateSliderDto.isActive !== undefined) updateData.isActive = updateSliderDto.isActive;

    await this.prisma.slider.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
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

  async removeSlider(id: number, tenantId: number): Promise<void> {
    await this.findSliderById(id, tenantId);
    await this.prisma.slider.delete({ where: { id } });
  }

  // ==================== SLIDER ITEM MANAGEMENT ====================

  async createSliderItem(
    sliderId: number,
    createSliderItemDto: CreateSliderItemDto,
    tenantId: number,
  ): Promise<SliderItemWithRelations> {
    // Verify slider exists and belongs to tenant
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

    return sliderItem as SliderItemWithRelations;
  }

  async findSliderItemById(
    id: number,
    tenantId: number,
  ): Promise<SliderItemWithRelations> {
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
      throw new NotFoundException('Slider item not found');
    }

    return sliderItem as SliderItemWithRelations;
  }

  async updateSliderItem(
    id: number,
    updateSliderItemDto: UpdateSliderItemDto,
    tenantId: number,
  ): Promise<SliderItemWithRelations> {
    await this.findSliderItemById(id, tenantId);

    // Update basic slider item data
    const updateData: any = {};
    if (updateSliderItemDto.imageUrl !== undefined) updateData.imageUrl = updateSliderItemDto.imageUrl;
    if (updateSliderItemDto.mobileImageUrl !== undefined) updateData.mobileImageUrl = updateSliderItemDto.mobileImageUrl;
    if (updateSliderItemDto.tabletImageUrl !== undefined) updateData.tabletImageUrl = updateSliderItemDto.tabletImageUrl;
    if (updateSliderItemDto.videoUrl !== undefined) updateData.videoUrl = updateSliderItemDto.videoUrl;
    if (updateSliderItemDto.linkUrl !== undefined) updateData.linkUrl = updateSliderItemDto.linkUrl;
    if (updateSliderItemDto.linkTarget !== undefined) updateData.linkTarget = updateSliderItemDto.linkTarget;
    if (updateSliderItemDto.overlayColor !== undefined) updateData.overlayColor = updateSliderItemDto.overlayColor;
    if (updateSliderItemDto.overlayOpacity !== undefined) updateData.overlayOpacity = updateSliderItemDto.overlayOpacity;
    if (updateSliderItemDto.textPosition !== undefined) updateData.textPosition = updateSliderItemDto.textPosition;
    if (updateSliderItemDto.animationIn !== undefined) updateData.animationIn = updateSliderItemDto.animationIn;
    if (updateSliderItemDto.animationOut !== undefined) updateData.animationOut = updateSliderItemDto.animationOut;
    if (updateSliderItemDto.order !== undefined) updateData.order = updateSliderItemDto.order;
    if (updateSliderItemDto.isActive !== undefined) updateData.isActive = updateSliderItemDto.isActive;
    if (updateSliderItemDto.startDate !== undefined) updateData.startDate = updateSliderItemDto.startDate ? new Date(updateSliderItemDto.startDate) : null;
    if (updateSliderItemDto.endDate !== undefined) updateData.endDate = updateSliderItemDto.endDate ? new Date(updateSliderItemDto.endDate) : null;

    await this.prisma.sliderItem.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
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

  async removeSliderItem(id: number, tenantId: number): Promise<void> {
    await this.findSliderItemById(id, tenantId);
    await this.prisma.sliderItem.delete({ where: { id } });
  }

  async trackSliderItemView(id: number, tenantId: number): Promise<void> {
    await this.findSliderItemById(id, tenantId);
    await this.prisma.sliderItem.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async trackSliderItemClick(id: number, tenantId: number): Promise<void> {
    await this.findSliderItemById(id, tenantId);
    await this.prisma.sliderItem.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });
  }

  // ==================== BANNER MANAGEMENT ====================

  async createBanner(
    createBannerDto: CreateBannerDto,
    tenantId: number,
  ): Promise<BannerWithRelations> {
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

    return banner as BannerWithRelations;
  }

  async findAllBanners(
    tenantId: number,
    query: BannerSliderQueryDto = {},
  ): Promise<{
    banners: BannerWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 20, type, isActive } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

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
      banners: banners as BannerWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findBannerById(
    id: number,
    tenantId: number,
  ): Promise<BannerWithRelations> {
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
      throw new NotFoundException('Banner not found');
    }

    return banner as BannerWithRelations;
  }

  async updateBanner(
    id: number,
    updateBannerDto: UpdateBannerDto,
    tenantId: number,
  ): Promise<BannerWithRelations> {
    await this.findBannerById(id, tenantId);

    // Update basic banner data
    const updateData: any = {};
    if (updateBannerDto.type !== undefined) updateData.type = updateBannerDto.type;
    if (updateBannerDto.imageUrl !== undefined) updateData.imageUrl = updateBannerDto.imageUrl;
    if (updateBannerDto.mobileImageUrl !== undefined) updateData.mobileImageUrl = updateBannerDto.mobileImageUrl;
    if (updateBannerDto.linkUrl !== undefined) updateData.linkUrl = updateBannerDto.linkUrl;
    if (updateBannerDto.order !== undefined) updateData.order = updateBannerDto.order;
    if (updateBannerDto.isActive !== undefined) updateData.isActive = updateBannerDto.isActive;
    if (updateBannerDto.startDate !== undefined) updateData.startDate = updateBannerDto.startDate ? new Date(updateBannerDto.startDate) : null;
    if (updateBannerDto.endDate !== undefined) updateData.endDate = updateBannerDto.endDate ? new Date(updateBannerDto.endDate) : null;

    await this.prisma.banner.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
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

  async removeBanner(id: number, tenantId: number): Promise<void> {
    await this.findBannerById(id, tenantId);
    await this.prisma.banner.delete({ where: { id } });
  }

  // ==================== BANNER POSITION MANAGEMENT ====================

  async createBannerPosition(
    createBannerPositionDto: CreateBannerPositionDto,
    tenantId: number,
  ): Promise<BannerPositionWithRelations> {
    // Check if position with same key already exists
    const existingPosition = await this.prisma.bannerPosition.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: createBannerPositionDto.key,
        },
      },
    });

    if (existingPosition) {
      throw new BadRequestException(`Banner position with key '${createBannerPositionDto.key}' already exists`);
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

    return position as BannerPositionWithRelations;
  }

  async findAllBannerPositions(
    tenantId: number,
  ): Promise<BannerPositionWithRelations[]> {
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

    return positions as BannerPositionWithRelations[];
  }

  async findBannerPositionById(
    id: number,
    tenantId: number,
  ): Promise<BannerPositionWithRelations> {
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
      throw new NotFoundException('Banner position not found');
    }

    return position as BannerPositionWithRelations;
  }

  async findBannerPositionByKey(
    key: string,
    tenantId: number,
  ): Promise<BannerPositionWithRelations | null> {
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

    return position as BannerPositionWithRelations | null;
  }

  async updateBannerPosition(
    id: number,
    updateBannerPositionDto: UpdateBannerPositionDto,
    tenantId: number,
  ): Promise<BannerPositionWithRelations> {
    await this.findBannerPositionById(id, tenantId);

    // Check for duplicate key if updating key
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
        throw new BadRequestException(`Banner position with key '${updateBannerPositionDto.key}' already exists`);
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

    return position as BannerPositionWithRelations;
  }

  async removeBannerPosition(id: number, tenantId: number): Promise<void> {
    await this.findBannerPositionById(id, tenantId);
    await this.prisma.bannerPosition.delete({ where: { id } });
  }

  async assignBannerToPosition(
    positionId: number,
    assignmentDto: BannerPositionAssignmentDto,
    tenantId: number,
  ): Promise<void> {
    // Verify position exists and belongs to tenant
    await this.findBannerPositionById(positionId, tenantId);

    // Verify banner exists and belongs to tenant
    await this.findBannerById(assignmentDto.bannerId, tenantId);

    // Check if assignment already exists
    const existingAssignment = await this.prisma.bannerPositionAssignment.findUnique({
      where: {
        bannerId_positionId: {
          bannerId: assignmentDto.bannerId,
          positionId,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Banner is already assigned to this position');
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

  async removeBannerFromPosition(
    positionId: number,
    bannerId: number,
    tenantId: number,
  ): Promise<void> {
    // Verify position belongs to tenant
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
      throw new NotFoundException('Banner assignment not found');
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

  async trackBannerView(assignmentId: number): Promise<void> {
    await this.prisma.bannerPositionAssignment.update({
      where: { id: assignmentId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async trackBannerClick(assignmentId: number): Promise<void> {
    await this.prisma.bannerPositionAssignment.updateMany({
      where: { id: assignmentId },
      data: {
        clickCount: { increment: 1 },
        conversionCount: { increment: 1 },
      },
    });
  }

  // ==================== ANALYTICS & REPORTS ====================

  async getBannerAnalytics(tenantId: number) {
    const [bannerStats, sliderStats, positionStats, topPerforming] = await Promise.all([
      // Banner statistics
      this.prisma.banner.aggregate({
        where: { tenantId },
        _count: { id: true },
      }),

      // Slider statistics
      this.prisma.slider.aggregate({
        where: { tenantId },
        _count: { id: true },
      }),

      // Position statistics
      this.prisma.bannerPosition.aggregate({
        where: { tenantId },
        _count: { id: true },
      }),

      // Top performing banners
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

  // ==================== ADDITIONAL CONTROLLER METHODS ====================

  async getSliderByKey(key: string, tenantId: number): Promise<SliderWithRelations | null> {
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

  async trackSliderView(id: number): Promise<void> {
    // Track all slider items for the slider
    await this.prisma.sliderItem.updateMany({
      where: { sliderId: id },
      data: { viewCount: { increment: 1 } }
    });
  }

  async trackSliderClick(id: number): Promise<void> {
    // Track specific slider item click
    await this.prisma.sliderItem.updateMany({
      where: { id },
      data: { clickCount: { increment: 1 } }
    });
  }

  async getBannersByPosition(position: string, tenantId: number) {
    const bannerPosition = await this.prisma.bannerPosition.findFirst({
      where: { key: position, tenantId }
    });

    if (!bannerPosition) return [];

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

  async getAllSliders(tenantId: number, query: any) {
    const { type, isActive, search, page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = query;

    const where: any = { tenantId };
    if (type) where.type = type;
    if (typeof isActive === 'boolean') where.isActive = isActive;
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

  async getSliderById(id: number, tenantId: number): Promise<SliderWithRelations> {
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
      throw new NotFoundException('Slider not found');
    }

    return slider;
  }

  async deleteSlider(id: number, tenantId: number): Promise<void> {
    const slider = await this.prisma.slider.findFirst({
      where: { id, tenantId }
    });

    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    await this.prisma.slider.delete({ where: { id } });
  }

  async toggleSliderStatus(id: number, tenantId: number): Promise<SliderWithRelations> {
    const slider = await this.prisma.slider.findFirst({
      where: { id, tenantId }
    });

    if (!slider) {
      throw new NotFoundException('Slider not found');
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

  async getSliderItems(sliderId: number, tenantId: number) {
    // First verify the slider belongs to the tenant
    const slider = await this.prisma.slider.findFirst({
      where: { id: sliderId, tenantId }
    });

    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    return await this.prisma.sliderItem.findMany({
      where: { sliderId },
      include: { translations: true },
      orderBy: { order: 'asc' }
    });
  }

  async deleteSliderItem(id: number, tenantId: number): Promise<void> {
    const sliderItem = await this.prisma.sliderItem.findFirst({
      where: {
        id,
        slider: { tenantId }
      }
    });

    if (!sliderItem) {
      throw new NotFoundException('Slider item not found');
    }

    await this.prisma.sliderItem.delete({ where: { id } });
  }

  async updateSliderItemOrder(id: number, newOrder: number, tenantId: number): Promise<any> {
    const sliderItem = await this.prisma.sliderItem.findFirst({
      where: {
        id,
        slider: { tenantId }
      }
    });

    if (!sliderItem) {
      throw new NotFoundException('Slider item not found');
    }

    return await this.prisma.sliderItem.update({
      where: { id },
      data: { order: newOrder },
      include: { translations: true }
    });
  }

  async getAllBannerPositions(tenantId: number) {
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

  async deleteBannerPosition(id: number, tenantId: number): Promise<void> {
    const position = await this.prisma.bannerPosition.findFirst({
      where: { id, tenantId }
    });

    if (!position) {
      throw new NotFoundException('Banner position not found');
    }

    await this.prisma.bannerPosition.delete({ where: { id } });
  }

  async getAllBanners(tenantId: number, query: any) {
    const { type, isActive, search, page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = query;

    const where: any = { tenantId };
    if (type) where.type = type;
    if (typeof isActive === 'boolean') where.isActive = isActive;
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

  async createBannerPositionAssignment(data: any, tenantId: number) {
    // Verify banner belongs to tenant
    const banner = await this.prisma.banner.findFirst({
      where: { id: data.bannerId, tenantId }
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    // Verify position belongs to tenant
    const position = await this.prisma.bannerPosition.findFirst({
      where: { id: data.bannerPositionId, tenantId }
    });

    if (!position) {
      throw new NotFoundException('Banner position not found');
    }

    return await this.prisma.bannerPositionAssignment.create({
      data,
      include: {
        banner: { include: { translations: true } },
        position: true
      }
    });
  }

  async updateBannerPositionAssignment(id: number, data: any, tenantId: number) {
    const assignment = await this.prisma.bannerPositionAssignment.findFirst({
      where: {
        id,
        position: { tenantId }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Banner position assignment not found');
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

  async deleteBannerPositionAssignment(id: number, tenantId: number): Promise<void> {
    const assignment = await this.prisma.bannerPositionAssignment.findFirst({
      where: {
        id,
        position: { tenantId }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Banner position assignment not found');
    }

    await this.prisma.bannerPositionAssignment.delete({ where: { id } });
  }

  async getSliderAnalytics(id: number, tenantId: number, startDate?: string, endDate?: string) {
    const slider = await this.prisma.slider.findFirst({
      where: { id, tenantId }
    });

    if (!slider) {
      throw new NotFoundException('Slider not found');
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
}