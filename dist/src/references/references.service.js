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
exports.ReferencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let ReferencesService = class ReferencesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createReferenceDto, tenantId) {
        const reference = await this.prisma.reference.create({
            data: {
                tenantId,
                imageUrl: createReferenceDto.imageUrl,
                projectUrl: createReferenceDto.projectUrl,
                clientName: createReferenceDto.clientName,
                projectDate: createReferenceDto.projectDate ? new Date(createReferenceDto.projectDate) : null,
                category: createReferenceDto.category,
                order: createReferenceDto.order,
                isActive: createReferenceDto.isActive,
                isFeatured: createReferenceDto.isFeatured,
                translations: {
                    create: createReferenceDto.translations,
                },
                gallery: createReferenceDto.gallery ? {
                    create: createReferenceDto.gallery,
                } : undefined,
            },
            include: {
                translations: true,
                gallery: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return reference;
    }
    async findAll(tenantId, query = {}) {
        const { page = 1, limit = 20, search, category, featured, client, year, sortBy = 'order', sortOrder = 'asc', } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (featured !== undefined) {
            whereClause.isFeatured = featured;
        }
        if (category) {
            whereClause.category = category;
        }
        if (client) {
            whereClause.clientName = {
                contains: client,
                mode: 'insensitive',
            };
        }
        if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59);
            whereClause.projectDate = {
                gte: startOfYear,
                lte: endOfYear,
            };
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
        const [references, total] = await Promise.all([
            this.prisma.reference.findMany({
                where: whereClause,
                include: {
                    translations: true,
                    gallery: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.reference.count({ where: whereClause }),
        ]);
        return {
            references: references,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOne(id, tenantId) {
        const reference = await this.prisma.reference.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                gallery: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!reference) {
            throw new common_1.NotFoundException('Reference not found');
        }
        return reference;
    }
    async findBySlug(slug, language, tenantId) {
        const reference = await this.prisma.reference.findFirst({
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
                gallery: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return reference;
    }
    async findFeatured(tenantId) {
        const references = await this.prisma.reference.findMany({
            where: {
                tenantId,
                isActive: true,
                isFeatured: true,
            },
            include: {
                translations: true,
                gallery: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
        return references;
    }
    async findByCategory(category, tenantId, language) {
        const references = await this.prisma.reference.findMany({
            where: {
                tenantId,
                isActive: true,
                category,
            },
            include: {
                translations: language ? {
                    where: { language },
                } : true,
                gallery: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
        return references;
    }
    async findPublicReferences(tenantId, language, query = {}) {
        const { page = 1, limit = 20, search, category, featured, client, year, } = query;
        const offset = (page - 1) * limit;
        const whereClause = {
            tenantId,
            isActive: true,
        };
        if (featured !== undefined) {
            whereClause.isFeatured = featured;
        }
        if (category) {
            whereClause.category = category;
        }
        if (client) {
            whereClause.clientName = {
                contains: client,
                mode: 'insensitive',
            };
        }
        if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59);
            whereClause.projectDate = {
                gte: startOfYear,
                lte: endOfYear,
            };
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
        const [references, total] = await Promise.all([
            this.prisma.reference.findMany({
                where: whereClause,
                include: {
                    translations: {
                        where: { language },
                        take: 1,
                    },
                    gallery: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
                skip: offset,
                take: limit,
            }),
            this.prisma.reference.count({ where: whereClause }),
        ]);
        const formattedReferences = references.map(reference => ({
            id: reference.id,
            imageUrl: reference.imageUrl,
            projectUrl: reference.projectUrl,
            clientName: reference.clientName,
            projectDate: reference.projectDate,
            category: reference.category,
            order: reference.order,
            isFeatured: reference.isFeatured,
            translation: reference.translations[0] || null,
            gallery: reference.gallery,
        })).filter(reference => reference.translation);
        return {
            references: formattedReferences,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async update(id, updateReferenceDto, tenantId) {
        await this.findOne(id, tenantId);
        const updateData = {};
        if (updateReferenceDto.imageUrl !== undefined)
            updateData.imageUrl = updateReferenceDto.imageUrl;
        if (updateReferenceDto.projectUrl !== undefined)
            updateData.projectUrl = updateReferenceDto.projectUrl;
        if (updateReferenceDto.clientName !== undefined)
            updateData.clientName = updateReferenceDto.clientName;
        if (updateReferenceDto.projectDate !== undefined) {
            updateData.projectDate = updateReferenceDto.projectDate ? new Date(updateReferenceDto.projectDate) : null;
        }
        if (updateReferenceDto.category !== undefined)
            updateData.category = updateReferenceDto.category;
        if (updateReferenceDto.order !== undefined)
            updateData.order = updateReferenceDto.order;
        if (updateReferenceDto.isActive !== undefined)
            updateData.isActive = updateReferenceDto.isActive;
        if (updateReferenceDto.isFeatured !== undefined)
            updateData.isFeatured = updateReferenceDto.isFeatured;
        await this.prisma.reference.update({
            where: { id },
            data: updateData,
        });
        if (updateReferenceDto.translations) {
            await this.prisma.referenceTranslation.deleteMany({
                where: { referenceId: id },
            });
            await this.prisma.referenceTranslation.createMany({
                data: updateReferenceDto.translations.map(translation => ({
                    referenceId: id,
                    ...translation,
                })),
            });
        }
        if (updateReferenceDto.gallery) {
            await this.prisma.referenceGallery.deleteMany({
                where: { referenceId: id },
            });
            if (updateReferenceDto.gallery.length > 0) {
                await this.prisma.referenceGallery.createMany({
                    data: updateReferenceDto.gallery.map(image => ({
                        referenceId: id,
                        ...image,
                    })),
                });
            }
        }
        return this.findOne(id, tenantId);
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.reference.delete({
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
                console.error(`Failed to delete reference ${id}:`, error);
                failed++;
            }
        }
        return { deleted, failed };
    }
    async reorder(referenceUpdates, tenantId) {
        for (const update of referenceUpdates) {
            await this.findOne(update.id, tenantId);
        }
        for (const update of referenceUpdates) {
            await this.prisma.reference.update({
                where: { id: update.id },
                data: { order: update.order },
            });
        }
    }
    async getStats(tenantId) {
        const [total, active, featured, categoryStats, yearStats, translationStats] = await Promise.all([
            this.prisma.reference.count({ where: { tenantId } }),
            this.prisma.reference.count({ where: { tenantId, isActive: true } }),
            this.prisma.reference.count({ where: { tenantId, isFeatured: true } }),
            this.prisma.reference.groupBy({
                by: ['category'],
                where: { tenantId, category: { not: null } },
                _count: true,
            }),
            this.prisma.reference.groupBy({
                by: ['projectDate'],
                where: { tenantId, projectDate: { not: null } },
                _count: true,
            }),
            this.prisma.referenceTranslation.groupBy({
                by: ['language'],
                where: {
                    reference: { tenantId },
                },
                _count: true,
            }),
        ]);
        const byCategory = categoryStats.reduce((acc, item) => {
            acc[item.category || 'uncategorized'] = item._count;
            return acc;
        }, {});
        const byYear = yearStats.reduce((acc, item) => {
            const year = item.projectDate ? new Date(item.projectDate).getFullYear().toString() : 'unknown';
            if (!acc[year])
                acc[year] = 0;
            acc[year] += item._count;
            return acc;
        }, {});
        const byLanguage = translationStats.reduce((acc, item) => {
            acc[item.language] = item._count;
            return acc;
        }, {});
        return {
            total,
            active,
            featured,
            byCategory,
            byYear,
            byLanguage,
        };
    }
    async getCategories(tenantId) {
        const categories = await this.prisma.reference.findMany({
            where: {
                tenantId,
                isActive: true,
                category: { not: null },
            },
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        return categories.map(c => c.category).filter(Boolean);
    }
    async getYears(tenantId) {
        const references = await this.prisma.reference.findMany({
            where: {
                tenantId,
                isActive: true,
                projectDate: { not: null },
            },
            select: {
                projectDate: true,
            },
        });
        const years = references
            .map(r => r.projectDate ? new Date(r.projectDate).getFullYear() : null)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index);
        return years.sort((a, b) => b - a);
    }
};
exports.ReferencesService = ReferencesService;
exports.ReferencesService = ReferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferencesService);
//# sourceMappingURL=references.service.js.map