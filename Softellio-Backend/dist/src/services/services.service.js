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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let ServicesService = class ServicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createServiceDto, tenantId) {
        const service = await this.prisma.service.create({
            data: {
                tenantId,
                iconUrl: createServiceDto.iconUrl,
                order: createServiceDto.order,
                isActive: createServiceDto.isActive,
                isFeatured: createServiceDto.isFeatured,
                translations: {
                    create: createServiceDto.translations,
                },
            },
            include: {
                translations: true,
            },
        });
        return service;
    }
    async findAll(tenantId, query = {}) {
        const { page = 1, limit = 20, search, featured, sortBy = 'order', sortOrder = 'asc', } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (featured !== undefined) {
            whereClause.isFeatured = featured;
        }
        if (search) {
            whereClause.translations = {
                some: {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            };
        }
        let orderBy = {};
        if (sortBy === 'title') {
            orderBy = {
                translations: {
                    _count: sortOrder,
                },
            };
        }
        else {
            orderBy[sortBy] = sortOrder;
        }
        const [services, total] = await Promise.all([
            this.prisma.service.findMany({
                where: whereClause,
                include: {
                    translations: true,
                },
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.service.count({ where: whereClause }),
        ]);
        return {
            services: services,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOne(id, tenantId) {
        const service = await this.prisma.service.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
            },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        return service;
    }
    async findBySlug(slug, language, tenantId) {
        const service = await this.prisma.service.findFirst({
            where: {
                tenantId,
                translations: {
                    some: {
                        slug,
                        language,
                    },
                },
            },
            include: {
                translations: true,
            },
        });
        return service;
    }
    async findFeatured(tenantId) {
        const services = await this.prisma.service.findMany({
            where: {
                tenantId,
                isActive: true,
                isFeatured: true,
            },
            include: {
                translations: true,
            },
            orderBy: {
                order: 'asc',
            },
        });
        return services;
    }
    async findPublicServices(tenantId, language, query = {}) {
        const { page = 1, limit = 20, search, featured, } = query;
        const offset = (page - 1) * limit;
        const whereClause = {
            tenantId,
            isActive: true,
        };
        if (featured !== undefined) {
            whereClause.isFeatured = featured;
        }
        if (search) {
            whereClause.translations = {
                some: {
                    AND: [
                        { language },
                        {
                            title: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            };
        }
        const [services, total] = await Promise.all([
            this.prisma.service.findMany({
                where: whereClause,
                include: {
                    translations: {
                        where: { language },
                        take: 1,
                    },
                },
                orderBy: {
                    order: 'asc',
                },
                skip: offset,
                take: limit,
            }),
            this.prisma.service.count({ where: whereClause }),
        ]);
        const formattedServices = services.map(service => ({
            id: service.id,
            iconUrl: service.iconUrl,
            order: service.order,
            isFeatured: service.isFeatured,
            translation: service.translations[0] || null,
        }));
        return {
            services: formattedServices,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async update(id, updateServiceDto, tenantId) {
        await this.findOne(id, tenantId);
        const updateData = {};
        if (updateServiceDto.iconUrl !== undefined)
            updateData.iconUrl = updateServiceDto.iconUrl;
        if (updateServiceDto.order !== undefined)
            updateData.order = updateServiceDto.order;
        if (updateServiceDto.isActive !== undefined)
            updateData.isActive = updateServiceDto.isActive;
        if (updateServiceDto.isFeatured !== undefined)
            updateData.isFeatured = updateServiceDto.isFeatured;
        await this.prisma.service.update({
            where: { id },
            data: updateData,
        });
        if (updateServiceDto.translations) {
            await this.prisma.serviceTranslation.deleteMany({
                where: { serviceId: id },
            });
            await this.prisma.serviceTranslation.createMany({
                data: updateServiceDto.translations.map(translation => ({
                    serviceId: id,
                    ...translation,
                })),
            });
        }
        return this.findOne(id, tenantId);
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.service.delete({
            where: { id },
        });
    }
    async bulkDelete(ids, tenantId) {
        let deleted = 0;
        let failed = 0;
        for (const id of ids) {
            try {
                await this.remove(id, tenantId);
                deleted++;
            }
            catch (error) {
                console.error(`Failed to delete service ${id}:`, error);
                failed++;
            }
        }
        return { deleted, failed };
    }
    async reorder(serviceUpdates, tenantId) {
        for (const update of serviceUpdates) {
            await this.findOne(update.id, tenantId);
        }
        for (const update of serviceUpdates) {
            await this.prisma.service.update({
                where: { id: update.id },
                data: { order: update.order },
            });
        }
    }
    async getStats(tenantId) {
        const [total, active, featured, translationStats] = await Promise.all([
            this.prisma.service.count({ where: { tenantId } }),
            this.prisma.service.count({ where: { tenantId, isActive: true } }),
            this.prisma.service.count({ where: { tenantId, isFeatured: true } }),
            this.prisma.serviceTranslation.groupBy({
                by: ['language'],
                where: {
                    service: { tenantId },
                },
                _count: true,
            }),
        ]);
        const byLanguage = translationStats.reduce((acc, item) => {
            acc[item.language] = item._count;
            return acc;
        }, {});
        return {
            total,
            active,
            featured,
            byLanguage,
        };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map