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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let BlogService = class BlogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(createCategoryDto, tenantId) {
        if (!createCategoryDto.translations || createCategoryDto.translations.length === 0) {
            throw new common_1.BadRequestException('At least one translation is required');
        }
        if (createCategoryDto.parentId) {
            const parentCategory = await this.prisma.blogCategory.findFirst({
                where: { id: createCategoryDto.parentId, tenantId },
            });
            if (!parentCategory) {
                throw new common_1.BadRequestException('Parent category not found');
            }
        }
        for (const translation of createCategoryDto.translations) {
            const slug = translation.slug || this.generateSlug(translation.name);
            const existingCategory = await this.prisma.blogCategoryTranslation.findFirst({
                where: {
                    category: { tenantId },
                    language: translation.language,
                    slug,
                },
            });
            if (existingCategory) {
                throw new common_1.ConflictException(`Category with slug '${slug}' already exists in language '${translation.language}'`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const category = await tx.blogCategory.create({
                data: {
                    tenantId,
                    parentId: createCategoryDto.parentId || null,
                },
            });
            await tx.blogCategoryTranslation.createMany({
                data: createCategoryDto.translations.map(translation => ({
                    categoryId: category.id,
                    language: translation.language,
                    name: translation.name,
                    slug: translation.slug || this.generateSlug(translation.name),
                })),
            });
            return tx.blogCategory.findUnique({
                where: { id: category.id },
                include: {
                    translations: true,
                    parent: { include: { translations: true } },
                    children: { include: { translations: true } },
                },
            });
        });
    }
    async findAllCategories(tenantId, options = {}) {
        const { language, parentId, includeChildren = true } = options;
        const whereClause = { tenantId };
        if (parentId !== undefined) {
            whereClause.parentId = parentId;
        }
        const includeClause = {
            translations: language ? { where: { language } } : true,
        };
        if (includeChildren) {
            includeClause.children = {
                include: {
                    translations: language ? { where: { language } } : true,
                },
            };
        }
        if (parentId === undefined) {
            includeClause.parent = {
                include: { translations: true },
            };
        }
        const categories = await this.prisma.blogCategory.findMany({
            where: whereClause,
            include: includeClause,
            orderBy: { id: 'asc' },
        });
        const filteredCategories = language
            ? categories.filter(category => category.translations.length > 0)
            : categories;
        return filteredCategories;
    }
    async findOneCategory(id, tenantId) {
        const category = await this.prisma.blogCategory.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                parent: { include: { translations: true } },
                children: { include: { translations: true } },
                _count: { select: { blogPosts: true } },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto, tenantId) {
        await this.findOneCategory(id, tenantId);
        return this.prisma.$transaction(async (tx) => {
            if (updateCategoryDto.parentId !== undefined) {
                if (updateCategoryDto.parentId) {
                    const parentCategory = await tx.blogCategory.findFirst({
                        where: { id: updateCategoryDto.parentId, tenantId },
                    });
                    if (!parentCategory) {
                        throw new common_1.BadRequestException('Parent category not found');
                    }
                    if (updateCategoryDto.parentId === id) {
                        throw new common_1.BadRequestException('Category cannot be its own parent');
                    }
                }
                await tx.blogCategory.update({
                    where: { id },
                    data: { parentId: updateCategoryDto.parentId },
                });
            }
            if (updateCategoryDto.translations) {
                for (const translation of updateCategoryDto.translations) {
                    const slug = translation.slug || this.generateSlug(translation.name);
                    const existingTranslation = await tx.blogCategoryTranslation.findFirst({
                        where: {
                            category: { tenantId },
                            language: translation.language,
                            slug,
                            NOT: { categoryId: id },
                        },
                    });
                    if (existingTranslation) {
                        throw new common_1.ConflictException(`Category with slug '${slug}' already exists in language '${translation.language}'`);
                    }
                    await tx.blogCategoryTranslation.upsert({
                        where: {
                            categoryId_language: {
                                categoryId: id,
                                language: translation.language,
                            },
                        },
                        update: {
                            name: translation.name,
                            slug,
                        },
                        create: {
                            categoryId: id,
                            language: translation.language,
                            name: translation.name,
                            slug,
                        },
                    });
                }
            }
            return tx.blogCategory.findUnique({
                where: { id },
                include: {
                    translations: true,
                    parent: { include: { translations: true } },
                    children: { include: { translations: true } },
                },
            });
        });
    }
    async removeCategory(id, tenantId) {
        await this.findOneCategory(id, tenantId);
        const childrenCount = await this.prisma.blogCategory.count({
            where: { parentId: id, tenantId },
        });
        if (childrenCount > 0) {
            throw new common_1.BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
        }
        const postsCount = await this.prisma.blogPost.count({
            where: { categoryId: id, tenantId },
        });
        if (postsCount > 0) {
            throw new common_1.BadRequestException('Cannot delete category with posts. Move posts to another category first.');
        }
        await this.prisma.blogCategory.delete({
            where: { id },
        });
        return { message: 'Category deleted successfully' };
    }
    async createPost(createPostDto, tenantId, authorId) {
        if (!createPostDto.translations || createPostDto.translations.length === 0) {
            throw new common_1.BadRequestException('At least one translation is required');
        }
        if (createPostDto.categoryId) {
            const category = await this.prisma.blogCategory.findFirst({
                where: { id: createPostDto.categoryId, tenantId },
            });
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
            }
        }
        for (const translation of createPostDto.translations) {
            const existingPost = await this.prisma.blogPostTranslation.findFirst({
                where: {
                    post: { tenantId },
                    language: translation.language,
                    slug: translation.slug,
                },
            });
            if (existingPost) {
                throw new common_1.ConflictException(`Post with slug '${translation.slug}' already exists in language '${translation.language}'`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.blogPost.create({
                data: {
                    tenantId,
                    categoryId: createPostDto.categoryId || null,
                    authorId: createPostDto.authorId || authorId || null,
                    isPublished: createPostDto.isPublished || false,
                    publishedAt: createPostDto.isPublished ? (createPostDto.publishedAt || new Date()) : null,
                },
            });
            await tx.blogPostTranslation.createMany({
                data: createPostDto.translations.map(translation => ({
                    postId: post.id,
                    language: translation.language,
                    title: translation.title,
                    slug: translation.slug,
                    summary: translation.summary,
                    contentJson: translation.contentJson || null,
                    metaTitle: translation.metaTitle,
                    metaDescription: translation.metaDescription,
                })),
            });
            return tx.blogPost.findUnique({
                where: { id: post.id },
                include: {
                    translations: true,
                    category: { include: { translations: true } },
                    author: { select: { id: true, name: true, email: true } },
                },
            });
        });
    }
    async findAllPosts(tenantId, options = {}) {
        const { categoryId, authorId, isPublished, language, search, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (categoryId)
            whereClause.categoryId = categoryId;
        if (authorId)
            whereClause.authorId = authorId;
        if (isPublished !== undefined)
            whereClause.isPublished = isPublished;
        if (search) {
            whereClause.translations = {
                some: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { summary: { contains: search, mode: 'insensitive' } },
                    ],
                    ...(language && { language }),
                },
            };
        }
        const includeClause = {
            translations: language ? { where: { language } } : true,
            category: { include: { translations: true } },
            author: { select: { id: true, name: true, email: true } },
        };
        const [posts, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                where: whereClause,
                include: includeClause,
                orderBy: [
                    { publishedAt: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: offset,
                take: limit,
            }),
            this.prisma.blogPost.count({ where: whereClause }),
        ]);
        const filteredPosts = language
            ? posts.filter(post => post.translations.length > 0)
            : posts;
        return {
            posts: filteredPosts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOnePost(id, tenantId) {
        const post = await this.prisma.blogPost.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                category: { include: { translations: true } },
                author: { select: { id: true, name: true, email: true } },
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    async findPostBySlug(slug, language, tenantId, includeUnpublished = false) {
        const whereClause = {
            post: {
                tenantId,
                ...(includeUnpublished ? {} : { isPublished: true })
            },
            language,
            slug,
        };
        const postTranslation = await this.prisma.blogPostTranslation.findFirst({
            where: whereClause,
            include: {
                post: {
                    include: {
                        translations: true,
                        category: { include: { translations: true } },
                        author: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
        if (!postTranslation) {
            throw new common_1.NotFoundException('Post not found');
        }
        return postTranslation.post;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map