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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const create_page_dto_1 = require("./dto/create-page.dto");
let PagesService = class PagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformToResponseDto(page) {
        return {
            id: page.id,
            tenantId: page.tenantId,
            status: page.status,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            translations: page.translations.map(translation => ({
                id: translation.id,
                language: translation.language,
                title: translation.title,
                slug: translation.slug,
                contentJson: translation.contentJson,
                metaTitle: translation.metaTitle,
                metaDescription: translation.metaDescription,
            })),
        };
    }
    validateSlugFormat(slug) {
        if (!/^[a-z0-9-]+$/.test(slug)) {
            throw new common_1.BadRequestException(`Slug '${slug}' contains invalid characters. Only lowercase letters, numbers, and hyphens are allowed.`);
        }
        if (slug.length > 100) {
            throw new common_1.BadRequestException(`Slug '${slug}' is too long. Maximum 100 characters allowed.`);
        }
        if (slug.startsWith('-') || slug.endsWith('-')) {
            throw new common_1.BadRequestException(`Slug '${slug}' cannot start or end with hyphen.`);
        }
        if (slug.includes('--')) {
            throw new common_1.BadRequestException(`Slug '${slug}' cannot contain consecutive hyphens.`);
        }
    }
    async validateSlugUniqueness(slug, language, tenantId, excludePageId) {
        const existingPage = await this.prisma.pageTranslation.findFirst({
            where: {
                page: { tenantId },
                language,
                slug,
                ...(excludePageId && { NOT: { pageId: excludePageId } }),
            },
            include: {
                page: {
                    select: { id: true }
                }
            }
        });
        if (existingPage) {
            throw new common_1.ConflictException(`A page with slug '${slug}' already exists in language '${language}'. Please choose a different slug.`);
        }
    }
    async validateTranslations(translations, tenantId, excludePageId) {
        if (!translations || translations.length === 0) {
            throw new common_1.BadRequestException('At least one translation is required');
        }
        const languages = translations.map(t => t.language);
        const uniqueLanguages = new Set(languages);
        if (languages.length !== uniqueLanguages.size) {
            throw new common_1.BadRequestException('Duplicate languages are not allowed in the same page');
        }
        for (const translation of translations) {
            this.validateSlugFormat(translation.slug);
            await this.validateSlugUniqueness(translation.slug, translation.language, tenantId, excludePageId);
        }
    }
    async create(createPageDto, tenantId) {
        await this.validateTranslations(createPageDto.translations, tenantId);
        const result = await this.prisma.$transaction(async (tx) => {
            const page = await tx.page.create({
                data: {
                    tenantId,
                    status: createPageDto.status || create_page_dto_1.PageStatus.DRAFT,
                },
            });
            await tx.pageTranslation.createMany({
                data: createPageDto.translations.map(translation => ({
                    pageId: page.id,
                    language: translation.language,
                    title: translation.title,
                    slug: translation.slug,
                    contentJson: translation.contentJson || null,
                    metaTitle: translation.metaTitle,
                    metaDescription: translation.metaDescription,
                })),
            });
            return tx.page.findUnique({
                where: { id: page.id },
                include: { translations: true },
            });
        });
        return this.transformToResponseDto(result);
    }
    async findAll(tenantId, query) {
        const { search, status, language, page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc', createdAfter, createdBefore } = query;
        const whereClause = { tenantId };
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause.translations = {
                some: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { slug: { contains: search, mode: 'insensitive' } }
                    ]
                }
            };
        }
        if (createdAfter || createdBefore) {
            whereClause.createdAt = {};
            if (createdAfter) {
                whereClause.createdAt.gte = new Date(createdAfter);
            }
            if (createdBefore) {
                whereClause.createdAt.lte = new Date(createdBefore);
            }
        }
        const includeClause = {
            translations: language ? { where: { language } } : true,
        };
        const orderByClause = {};
        if (sortBy === 'title') {
            orderByClause.translations = {
                _count: 'desc'
            };
        }
        else {
            orderByClause[sortBy] = sortOrder;
        }
        const [pages, total] = await Promise.all([
            this.prisma.page.findMany({
                where: whereClause,
                include: includeClause,
                orderBy: orderByClause,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.page.count({ where: whereClause }),
        ]);
        const filteredPages = language
            ? pages.filter(page => page.translations.length > 0)
            : pages;
        const responsePages = filteredPages.map(page => this.transformToResponseDto(page));
        return {
            pages: responsePages,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        };
    }
    async findOne(id, tenantId) {
        const page = await this.prisma.page.findFirst({
            where: { id, tenantId },
            include: { translations: true },
        });
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        return this.transformToResponseDto(page);
    }
    async findBySlug(slug, language, tenantId, includeUnpublished = false) {
        const whereClause = {
            page: {
                tenantId,
                ...(includeUnpublished ? {} : { status: create_page_dto_1.PageStatus.PUBLISHED })
            },
            language,
            slug,
        };
        const pageTranslation = await this.prisma.pageTranslation.findFirst({
            where: whereClause,
            include: {
                page: {
                    include: {
                        translations: true,
                    },
                },
            },
        });
        if (!pageTranslation) {
            throw new common_1.NotFoundException('Page not found');
        }
        return this.transformToResponseDto(pageTranslation.page);
    }
    async update(id, updatePageDto, tenantId) {
        await this.findOne(id, tenantId);
        if (updatePageDto.translations) {
            await this.validateTranslations(updatePageDto.translations, tenantId, id);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            if (updatePageDto.status !== undefined) {
                await tx.page.update({
                    where: { id },
                    data: { status: updatePageDto.status },
                });
            }
            if (updatePageDto.translations) {
                for (const translation of updatePageDto.translations) {
                    await tx.pageTranslation.upsert({
                        where: {
                            pageId_language: {
                                pageId: id,
                                language: translation.language,
                            },
                        },
                        update: {
                            title: translation.title,
                            slug: translation.slug,
                            contentJson: translation.contentJson,
                            metaTitle: translation.metaTitle,
                            metaDescription: translation.metaDescription,
                        },
                        create: {
                            pageId: id,
                            language: translation.language,
                            title: translation.title,
                            slug: translation.slug,
                            contentJson: translation.contentJson,
                            metaTitle: translation.metaTitle,
                            metaDescription: translation.metaDescription,
                        },
                    });
                }
            }
            return tx.page.findUnique({
                where: { id },
                include: { translations: true },
            });
        });
        return this.transformToResponseDto(result);
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.page.delete({
            where: { id },
        });
        return { message: 'Page deleted successfully' };
    }
    async duplicate(id, tenantId) {
        const originalPage = await this.findOne(id, tenantId);
        const result = await this.prisma.$transaction(async (tx) => {
            const newPage = await tx.page.create({
                data: {
                    tenantId,
                    status: create_page_dto_1.PageStatus.DRAFT,
                },
            });
            await Promise.all(originalPage.translations.map(async (translation) => {
                let newSlug = `${translation.slug}-copy`;
                let counter = 1;
                while (await tx.pageTranslation.findFirst({
                    where: {
                        page: { tenantId },
                        language: translation.language,
                        slug: newSlug,
                    },
                })) {
                    newSlug = `${translation.slug}-copy-${counter}`;
                    counter++;
                }
                return tx.pageTranslation.create({
                    data: {
                        pageId: newPage.id,
                        language: translation.language,
                        title: `${translation.title} (Copy)`,
                        slug: newSlug,
                        contentJson: translation.contentJson,
                        metaTitle: translation.metaTitle,
                        metaDescription: translation.metaDescription,
                    },
                });
            }));
            return tx.page.findUnique({
                where: { id: newPage.id },
                include: { translations: true },
            });
        });
        return this.transformToResponseDto(result);
    }
    async bulkDelete(ids, tenantId) {
        const result = await this.prisma.page.deleteMany({
            where: {
                id: { in: ids },
                tenantId,
            },
        });
        return { deleted: result.count };
    }
    async getPagesByLanguage(language, tenantId, published = true) {
        const whereClause = {
            tenantId,
            translations: {
                some: { language },
            },
        };
        if (published) {
            whereClause.status = create_page_dto_1.PageStatus.PUBLISHED;
        }
        const pages = await this.prisma.page.findMany({
            where: whereClause,
            include: {
                translations: {
                    where: { language },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return pages.map(page => this.transformToResponseDto(page));
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PagesService);
//# sourceMappingURL=pages.service.js.map