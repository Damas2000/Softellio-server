import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateSocialMediaLinkDto,
  UpdateSocialMediaLinkDto,
  CreateMapConfigurationDto,
  UpdateMapConfigurationDto,
  CreateLocationCategoryDto,
  UpdateLocationCategoryDto,
  CreateLocationAssignmentDto,
  UpdateLocationAssignmentDto,
  CreateSocialMediaAnalyticsDto,
  CreateSocialMediaShareDto,
  SocialMediaQueryDto,
  MapQueryDto,
  LocationQueryDto,
  AnalyticsQueryDto,
  ShareAnalyticsQueryDto,
  UpdateOfficeDto,
  PublicMapConfigDto,
  PublicSocialLinksDto,
} from './dto/social-media-maps.dto';

// Interfaces for better type safety
interface SocialMediaLinkWithAnalytics {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order?: number;
  analytics?: {
    totalClicks: number;
    totalImpressions: number;
    totalShares: number;
  };
}

interface MapWithLocations {
  id: number;
  name: string;
  mapType: string;
  provider: string;
  locations: {
    id: number;
    office: {
      id: number;
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
    customMarkerIcon?: string;
    customMarkerColor?: string;
  }[];
}

interface AnalyticsData {
  platform: string;
  metricType: string;
  value: number;
  date: Date;
}

@Injectable()
export class SocialMediaMapsService {
  constructor(private readonly prisma: PrismaService) {}

  // =================== SOCIAL MEDIA LINKS ===================

  async getAllSocialMediaLinks(tenantId: number, query: SocialMediaQueryDto) {
    const {
      platform,
      isActive,
      search,
      contactInfoId,
      teamMemberId,
      page = 1,
      limit = 20,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const where: any = { tenantId };

    if (platform) where.platform = { contains: platform, mode: 'insensitive' };
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (contactInfoId) where.contactInfoId = contactInfoId;
    if (teamMemberId) where.teamMemberId = teamMemberId;
    if (search) {
      where.OR = [
        { platform: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [links, total] = await Promise.all([
      this.prisma.socialMediaLink.findMany({
        where,
        include: {
          contactInfo: {
            select: { id: true, logo: true },
          },
          teamMember: {
            select: {
              id: true,
              translations: {
                select: { name: true, position: true },
              },
            },
          },
          analytics: {
            select: {
              metricType: true,
              metricValue: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.socialMediaLink.count({ where }),
    ]);

    return {
      data: links,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSocialMediaLinkById(id: number, tenantId: number) {
    const link = await this.prisma.socialMediaLink.findFirst({
      where: { id, tenantId },
      include: {
        contactInfo: true,
        teamMember: true,
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Social media link not found');
    }

    return link;
  }

  async createSocialMediaLink(createDto: CreateSocialMediaLinkDto, tenantId: number) {
    return await this.prisma.socialMediaLink.create({
      data: {
        ...createDto,
        tenantId,
      },
      include: {
        contactInfo: true,
        teamMember: true,
      },
    });
  }

  async updateSocialMediaLink(id: number, updateDto: UpdateSocialMediaLinkDto, tenantId: number) {
    const existingLink = await this.prisma.socialMediaLink.findFirst({
      where: { id, tenantId },
    });

    if (!existingLink) {
      throw new NotFoundException('Social media link not found');
    }

    return await this.prisma.socialMediaLink.update({
      where: { id },
      data: updateDto,
      include: {
        contactInfo: true,
        teamMember: true,
      },
    });
  }

  async deleteSocialMediaLink(id: number, tenantId: number) {
    const existingLink = await this.prisma.socialMediaLink.findFirst({
      where: { id, tenantId },
    });

    if (!existingLink) {
      throw new NotFoundException('Social media link not found');
    }

    await this.prisma.socialMediaLink.delete({
      where: { id },
    });
  }

  // =================== MAP CONFIGURATIONS ===================

  async getAllMapConfigurations(tenantId: number, query: MapQueryDto) {
    const { mapType, provider, isActive, search, page = 1, limit = 20 } = query;

    const where: any = { tenantId };

    if (mapType) where.mapType = mapType;
    if (provider) where.provider = provider;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [configurations, total] = await Promise.all([
      this.prisma.mapConfiguration.findMany({
        where,
        include: {
          locationAssignments: {
            include: {
              office: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                  isPrimary: true,
                },
              },
              locationCategory: {
                select: { id: true, name: true, color: true, icon: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mapConfiguration.count({ where }),
    ]);

    return {
      data: configurations,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMapConfigurationById(id: number, tenantId: number) {
    const config = await this.prisma.mapConfiguration.findFirst({
      where: { id, tenantId },
      include: {
        locationAssignments: {
          include: {
            office: true,
            locationCategory: {
              include: { translations: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!config) {
      throw new NotFoundException('Map configuration not found');
    }

    return config;
  }

  async createMapConfiguration(createDto: CreateMapConfigurationDto, tenantId: number) {
    return await this.prisma.mapConfiguration.create({
      data: {
        ...createDto,
        tenantId,
      },
      include: {
        locationAssignments: {
          include: { office: true, locationCategory: true },
        },
      },
    });
  }

  async updateMapConfiguration(id: number, updateDto: UpdateMapConfigurationDto, tenantId: number) {
    const existingConfig = await this.prisma.mapConfiguration.findFirst({
      where: { id, tenantId },
    });

    if (!existingConfig) {
      throw new NotFoundException('Map configuration not found');
    }

    return await this.prisma.mapConfiguration.update({
      where: { id },
      data: updateDto,
      include: {
        locationAssignments: {
          include: { office: true, locationCategory: true },
        },
      },
    });
  }

  async deleteMapConfiguration(id: number, tenantId: number) {
    const existingConfig = await this.prisma.mapConfiguration.findFirst({
      where: { id, tenantId },
    });

    if (!existingConfig) {
      throw new NotFoundException('Map configuration not found');
    }

    // Check if map configuration has assigned locations
    const assignmentsCount = await this.prisma.locationAssignment.count({
      where: { mapConfigurationId: id },
    });

    if (assignmentsCount > 0) {
      throw new ConflictException(
        'Cannot delete map configuration with assigned locations. Remove locations first.',
      );
    }

    await this.prisma.mapConfiguration.delete({
      where: { id },
    });
  }

  // =================== LOCATION CATEGORIES ===================

  async getAllLocationCategories(tenantId: number) {
    return await this.prisma.locationCategory.findMany({
      where: { tenantId },
      include: {
        translations: true,
        locationAssignments: {
          include: { office: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async getLocationCategoryById(id: number, tenantId: number) {
    const category = await this.prisma.locationCategory.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
        locationAssignments: {
          include: { office: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Location category not found');
    }

    return category;
  }

  async createLocationCategory(createDto: CreateLocationCategoryDto, tenantId: number) {
    const { translations, ...categoryData } = createDto;

    return await this.prisma.locationCategory.create({
      data: {
        ...categoryData,
        tenantId,
        translations: translations
          ? {
              create: translations,
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });
  }

  async updateLocationCategory(id: number, updateDto: UpdateLocationCategoryDto, tenantId: number) {
    const existingCategory = await this.prisma.locationCategory.findFirst({
      where: { id, tenantId },
    });

    if (!existingCategory) {
      throw new NotFoundException('Location category not found');
    }

    const { translations, ...categoryData } = updateDto;

    // Update category and handle translations
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update main category data
      const updatedCategory = await prisma.locationCategory.update({
        where: { id },
        data: categoryData,
      });

      // Handle translations if provided
      if (translations && translations.length > 0) {
        // Delete existing translations
        await prisma.locationCategoryTranslation.deleteMany({
          where: { locationCategoryId: id },
        });

        // Create new translations
        await prisma.locationCategoryTranslation.createMany({
          data: translations.map((translation) => ({
            ...translation,
            locationCategoryId: id,
          })),
        });
      }

      return prisma.locationCategory.findFirst({
        where: { id },
        include: { translations: true },
      });
    });

    return result;
  }

  async deleteLocationCategory(id: number, tenantId: number) {
    const existingCategory = await this.prisma.locationCategory.findFirst({
      where: { id, tenantId },
    });

    if (!existingCategory) {
      throw new NotFoundException('Location category not found');
    }

    // Check if category has assigned locations
    const assignmentsCount = await this.prisma.locationAssignment.count({
      where: { locationCategoryId: id },
    });

    if (assignmentsCount > 0) {
      throw new ConflictException(
        'Cannot delete category with assigned locations. Remove assignments first.',
      );
    }

    await this.prisma.locationCategory.delete({
      where: { id },
    });
  }

  // =================== LOCATION ASSIGNMENTS ===================

  async getLocationAssignments(tenantId: number, query: LocationQueryDto) {
    const { categoryId, mapConfigurationId, showInWidget, search } = query;

    const where: any = {
      office: { contactInfo: { tenantId } },
    };

    if (categoryId) where.locationCategoryId = categoryId;
    if (mapConfigurationId) where.mapConfigurationId = mapConfigurationId;
    if (typeof showInWidget === 'boolean') where.showInWidget = showInWidget;
    if (search) {
      where.office = {
        ...where.office,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    return await this.prisma.locationAssignment.findMany({
      where,
      include: {
        office: {
          include: { contactInfo: { select: { id: true } } },
        },
        mapConfiguration: { select: { id: true, name: true } },
        locationCategory: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'desc' }],
    });
  }

  async createLocationAssignment(createDto: CreateLocationAssignmentDto, tenantId: number) {
    // Verify office belongs to tenant
    const office = await this.prisma.office.findFirst({
      where: {
        id: createDto.officeId,
        contactInfo: { tenantId },
      },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Verify map configuration belongs to tenant (if provided)
    if (createDto.mapConfigurationId) {
      const mapConfig = await this.prisma.mapConfiguration.findFirst({
        where: {
          id: createDto.mapConfigurationId,
          tenantId,
        },
      });

      if (!mapConfig) {
        throw new NotFoundException('Map configuration not found');
      }
    }

    // Verify location category belongs to tenant (if provided)
    if (createDto.locationCategoryId) {
      const category = await this.prisma.locationCategory.findFirst({
        where: {
          id: createDto.locationCategoryId,
          tenantId,
        },
      });

      if (!category) {
        throw new NotFoundException('Location category not found');
      }
    }

    return await this.prisma.locationAssignment.create({
      data: createDto,
      include: {
        office: true,
        mapConfiguration: true,
        locationCategory: true,
      },
    });
  }

  async updateLocationAssignment(id: number, updateDto: UpdateLocationAssignmentDto, tenantId: number) {
    const existingAssignment = await this.prisma.locationAssignment.findFirst({
      where: {
        id,
        office: { contactInfo: { tenantId } },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException('Location assignment not found');
    }

    return await this.prisma.locationAssignment.update({
      where: { id },
      data: updateDto,
      include: {
        office: true,
        mapConfiguration: true,
        locationCategory: true,
      },
    });
  }

  async deleteLocationAssignment(id: number, tenantId: number) {
    const existingAssignment = await this.prisma.locationAssignment.findFirst({
      where: {
        id,
        office: { contactInfo: { tenantId } },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException('Location assignment not found');
    }

    await this.prisma.locationAssignment.delete({
      where: { id },
    });
  }

  // =================== OFFICE MANAGEMENT ===================

  async updateOffice(id: number, updateDto: UpdateOfficeDto, tenantId: number) {
    const existingOffice = await this.prisma.office.findFirst({
      where: {
        id,
        contactInfo: { tenantId },
      },
    });

    if (!existingOffice) {
      throw new NotFoundException('Office not found');
    }

    // If setting as primary, unset other primary offices
    if (updateDto.isPrimary === true) {
      await this.prisma.office.updateMany({
        where: {
          contactInfo: { tenantId },
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    return await this.prisma.office.update({
      where: { id },
      data: updateDto,
      include: {
        locationAssignments: {
          include: {
            mapConfiguration: true,
            locationCategory: true,
          },
        },
      },
    });
  }

  // =================== ANALYTICS ===================

  async recordSocialMediaAnalytics(createDto: CreateSocialMediaAnalyticsDto, tenantId: number) {
    return await this.prisma.socialMediaAnalytics.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async getSocialMediaAnalytics(tenantId: number, query: AnalyticsQueryDto) {
    const { platform, metricType, startDate, endDate, socialLinkId, groupBy = 'day' } = query;

    const where: any = { tenantId };

    if (platform) where.platform = platform;
    if (metricType) where.metricType = metricType;
    if (socialLinkId) where.socialLinkId = socialLinkId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const analytics = await this.prisma.socialMediaAnalytics.findMany({
      where,
      include: {
        socialLink: {
          select: { platform: true, url: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return this.groupAnalyticsData(analytics, groupBy);
  }

  async recordSocialMediaShare(createDto: CreateSocialMediaShareDto, tenantId: number) {
    return await this.prisma.socialMediaShare.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async getSocialMediaShares(tenantId: number, query: ShareAnalyticsQueryDto) {
    const { entityType, entityId, platform, startDate, endDate, groupBy = 'day' } = query;

    const where: any = { tenantId };

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (platform) where.platform = platform;
    if (startDate || endDate) {
      where.sharedAt = {};
      if (startDate) where.sharedAt.gte = new Date(startDate);
      if (endDate) where.sharedAt.lte = new Date(endDate);
    }

    const shares = await this.prisma.socialMediaShare.findMany({
      where,
      orderBy: { sharedAt: 'desc' },
    });

    return this.groupSharesData(shares, groupBy);
  }

  // =================== PUBLIC API ===================

  async getPublicSocialMediaLinks(tenantId: number, query: PublicSocialLinksDto) {
    const { platform, activeOnly = true } = query;

    const where: any = { tenantId, contactInfoId: { not: null } };

    if (platform) where.platform = platform;
    if (activeOnly) where.isActive = true;

    return await this.prisma.socialMediaLink.findMany({
      where,
      select: {
        id: true,
        platform: true,
        url: true,
        icon: true,
        order: true,
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }

  async getPublicMapConfiguration(tenantId: number, query: PublicMapConfigDto) {
    const { mapKey, language = 'tr' } = query;

    const mapConfig = await this.prisma.mapConfiguration.findFirst({
      where: {
        tenantId,
        name: mapKey,
        isActive: true,
      },
      include: {
        locationAssignments: {
          where: { showInWidget: true },
          include: {
            office: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
                phone: true,
                email: true,
              },
            },
            locationCategory: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!mapConfig) {
      throw new NotFoundException('Map configuration not found');
    }

    // Remove sensitive data for public API
    const { apiKey, ...publicConfig } = mapConfig;

    return publicConfig;
  }

  async trackSocialMediaClick(linkId: number, ipAddress?: string, userAgent?: string, referrer?: string) {
    const socialLink = await this.prisma.socialMediaLink.findUnique({
      where: { id: linkId },
      select: { id: true, platform: true, tenantId: true },
    });

    if (!socialLink) {
      throw new NotFoundException('Social media link not found');
    }

    // Record click analytics
    await this.prisma.socialMediaAnalytics.create({
      data: {
        tenantId: socialLink.tenantId,
        socialLinkId: linkId,
        platform: socialLink.platform,
        metricType: 'clicks',
        metricValue: 1,
        ipAddress,
        userAgent,
        referrer,
      },
    });
  }

  // =================== HELPER METHODS ===================

  private groupAnalyticsData(analytics: any[], groupBy: string) {
    const grouped = analytics.reduce((acc, item) => {
      const date = this.formatDateByGrouping(item.date, groupBy);
      const key = `${date}_${item.platform}_${item.metricType}`;

      if (!acc[key]) {
        acc[key] = {
          date,
          platform: item.platform,
          metricType: item.metricType,
          value: 0,
        };
      }

      acc[key].value += item.metricValue;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private groupSharesData(shares: any[], groupBy: string) {
    const grouped = shares.reduce((acc, item) => {
      const date = this.formatDateByGrouping(item.sharedAt, groupBy);
      const key = `${date}_${item.platform}`;

      if (!acc[key]) {
        acc[key] = {
          date,
          platform: item.platform,
          count: 0,
        };
      }

      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private formatDateByGrouping(date: Date, groupBy: string): string {
    const d = new Date(date);
    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const week = this.getWeekNumber(d);
        return `${d.getFullYear()}-W${week}`;
      case 'month':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return String(d.getFullYear());
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}