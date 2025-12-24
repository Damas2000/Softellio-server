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
exports.SocialMediaMapsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let SocialMediaMapsService = class SocialMediaMapsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllSocialMediaLinks(tenantId, query) {
        const { platform, isActive, search, contactInfoId, teamMemberId, page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc', } = query;
        const where = { tenantId };
        if (platform)
            where.platform = { contains: platform, mode: 'insensitive' };
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (contactInfoId)
            where.contactInfoId = contactInfoId;
        if (teamMemberId)
            where.teamMemberId = teamMemberId;
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
    async getSocialMediaLinkById(id, tenantId) {
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
            throw new common_1.NotFoundException('Social media link not found');
        }
        return link;
    }
    async createSocialMediaLink(createDto, tenantId) {
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
    async updateSocialMediaLink(id, updateDto, tenantId) {
        const existingLink = await this.prisma.socialMediaLink.findFirst({
            where: { id, tenantId },
        });
        if (!existingLink) {
            throw new common_1.NotFoundException('Social media link not found');
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
    async deleteSocialMediaLink(id, tenantId) {
        const existingLink = await this.prisma.socialMediaLink.findFirst({
            where: { id, tenantId },
        });
        if (!existingLink) {
            throw new common_1.NotFoundException('Social media link not found');
        }
        await this.prisma.socialMediaLink.delete({
            where: { id },
        });
    }
    async getAllMapConfigurations(tenantId, query) {
        const { mapType, provider, isActive, search, page = 1, limit = 20 } = query;
        const where = { tenantId };
        if (mapType)
            where.mapType = mapType;
        if (provider)
            where.provider = provider;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
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
    async getMapConfigurationById(id, tenantId) {
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
            throw new common_1.NotFoundException('Map configuration not found');
        }
        return config;
    }
    async createMapConfiguration(createDto, tenantId) {
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
    async updateMapConfiguration(id, updateDto, tenantId) {
        const existingConfig = await this.prisma.mapConfiguration.findFirst({
            where: { id, tenantId },
        });
        if (!existingConfig) {
            throw new common_1.NotFoundException('Map configuration not found');
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
    async deleteMapConfiguration(id, tenantId) {
        const existingConfig = await this.prisma.mapConfiguration.findFirst({
            where: { id, tenantId },
        });
        if (!existingConfig) {
            throw new common_1.NotFoundException('Map configuration not found');
        }
        const assignmentsCount = await this.prisma.locationAssignment.count({
            where: { mapConfigurationId: id },
        });
        if (assignmentsCount > 0) {
            throw new common_1.ConflictException('Cannot delete map configuration with assigned locations. Remove locations first.');
        }
        await this.prisma.mapConfiguration.delete({
            where: { id },
        });
    }
    async getAllLocationCategories(tenantId) {
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
    async getLocationCategoryById(id, tenantId) {
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
            throw new common_1.NotFoundException('Location category not found');
        }
        return category;
    }
    async createLocationCategory(createDto, tenantId) {
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
    async updateLocationCategory(id, updateDto, tenantId) {
        const existingCategory = await this.prisma.locationCategory.findFirst({
            where: { id, tenantId },
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException('Location category not found');
        }
        const { translations, ...categoryData } = updateDto;
        const result = await this.prisma.$transaction(async (prisma) => {
            const updatedCategory = await prisma.locationCategory.update({
                where: { id },
                data: categoryData,
            });
            if (translations && translations.length > 0) {
                await prisma.locationCategoryTranslation.deleteMany({
                    where: { locationCategoryId: id },
                });
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
    async deleteLocationCategory(id, tenantId) {
        const existingCategory = await this.prisma.locationCategory.findFirst({
            where: { id, tenantId },
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException('Location category not found');
        }
        const assignmentsCount = await this.prisma.locationAssignment.count({
            where: { locationCategoryId: id },
        });
        if (assignmentsCount > 0) {
            throw new common_1.ConflictException('Cannot delete category with assigned locations. Remove assignments first.');
        }
        await this.prisma.locationCategory.delete({
            where: { id },
        });
    }
    async getLocationAssignments(tenantId, query) {
        const { categoryId, mapConfigurationId, showInWidget, search } = query;
        const where = {
            office: { contactInfo: { tenantId } },
        };
        if (categoryId)
            where.locationCategoryId = categoryId;
        if (mapConfigurationId)
            where.mapConfigurationId = mapConfigurationId;
        if (typeof showInWidget === 'boolean')
            where.showInWidget = showInWidget;
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
    async createLocationAssignment(createDto, tenantId) {
        const office = await this.prisma.office.findFirst({
            where: {
                id: createDto.officeId,
                contactInfo: { tenantId },
            },
        });
        if (!office) {
            throw new common_1.NotFoundException('Office not found');
        }
        if (createDto.mapConfigurationId) {
            const mapConfig = await this.prisma.mapConfiguration.findFirst({
                where: {
                    id: createDto.mapConfigurationId,
                    tenantId,
                },
            });
            if (!mapConfig) {
                throw new common_1.NotFoundException('Map configuration not found');
            }
        }
        if (createDto.locationCategoryId) {
            const category = await this.prisma.locationCategory.findFirst({
                where: {
                    id: createDto.locationCategoryId,
                    tenantId,
                },
            });
            if (!category) {
                throw new common_1.NotFoundException('Location category not found');
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
    async updateLocationAssignment(id, updateDto, tenantId) {
        const existingAssignment = await this.prisma.locationAssignment.findFirst({
            where: {
                id,
                office: { contactInfo: { tenantId } },
            },
        });
        if (!existingAssignment) {
            throw new common_1.NotFoundException('Location assignment not found');
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
    async deleteLocationAssignment(id, tenantId) {
        const existingAssignment = await this.prisma.locationAssignment.findFirst({
            where: {
                id,
                office: { contactInfo: { tenantId } },
            },
        });
        if (!existingAssignment) {
            throw new common_1.NotFoundException('Location assignment not found');
        }
        await this.prisma.locationAssignment.delete({
            where: { id },
        });
    }
    async updateOffice(id, updateDto, tenantId) {
        const existingOffice = await this.prisma.office.findFirst({
            where: {
                id,
                contactInfo: { tenantId },
            },
        });
        if (!existingOffice) {
            throw new common_1.NotFoundException('Office not found');
        }
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
    async recordSocialMediaAnalytics(createDto, tenantId) {
        return await this.prisma.socialMediaAnalytics.create({
            data: {
                ...createDto,
                tenantId,
            },
        });
    }
    async getSocialMediaAnalytics(tenantId, query) {
        const { platform, metricType, startDate, endDate, socialLinkId, groupBy = 'day' } = query;
        const where = { tenantId };
        if (platform)
            where.platform = platform;
        if (metricType)
            where.metricType = metricType;
        if (socialLinkId)
            where.socialLinkId = socialLinkId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
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
    async recordSocialMediaShare(createDto, tenantId) {
        return await this.prisma.socialMediaShare.create({
            data: {
                ...createDto,
                tenantId,
            },
        });
    }
    async getSocialMediaShares(tenantId, query) {
        const { entityType, entityId, platform, startDate, endDate, groupBy = 'day' } = query;
        const where = { tenantId };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        if (platform)
            where.platform = platform;
        if (startDate || endDate) {
            where.sharedAt = {};
            if (startDate)
                where.sharedAt.gte = new Date(startDate);
            if (endDate)
                where.sharedAt.lte = new Date(endDate);
        }
        const shares = await this.prisma.socialMediaShare.findMany({
            where,
            orderBy: { sharedAt: 'desc' },
        });
        return this.groupSharesData(shares, groupBy);
    }
    async getPublicSocialMediaLinks(tenantId, query) {
        const { platform, activeOnly = true } = query;
        const where = { tenantId, contactInfoId: { not: null } };
        if (platform)
            where.platform = platform;
        if (activeOnly)
            where.isActive = true;
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
    async getPublicMapConfiguration(tenantId, query) {
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
            throw new common_1.NotFoundException('Map configuration not found');
        }
        const { apiKey, ...publicConfig } = mapConfig;
        return publicConfig;
    }
    async trackSocialMediaClick(linkId, ipAddress, userAgent, referrer) {
        const socialLink = await this.prisma.socialMediaLink.findUnique({
            where: { id: linkId },
            select: { id: true, platform: true, tenantId: true },
        });
        if (!socialLink) {
            throw new common_1.NotFoundException('Social media link not found');
        }
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
    groupAnalyticsData(analytics, groupBy) {
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
    groupSharesData(shares, groupBy) {
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
    formatDateByGrouping(date, groupBy) {
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
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
};
exports.SocialMediaMapsService = SocialMediaMapsService;
exports.SocialMediaMapsService = SocialMediaMapsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialMediaMapsService);
//# sourceMappingURL=social-media-maps.service.js.map