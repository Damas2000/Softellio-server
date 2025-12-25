import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogPostWithTranslations, BlogCategoryWithTranslations } from '../common/types';
import { BlogPost, BlogCategory } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ==================== CATEGORY METHODS ====================

  async createCategory(createCategoryDto: CreateCategoryDto, tenantId: number): Promise<BlogCategoryWithTranslations> {
    // Validate translations
    if (!createCategoryDto.translations || createCategoryDto.translations.length === 0) {
      throw new BadRequestException('At least one translation is required');
    }

    // Validate parent category if specified
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.blogCategory.findFirst({
        where: { id: createCategoryDto.parentId, tenantId },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }
    }

    // Check for slug uniqueness per language per tenant
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
        throw new ConflictException(
          `Category with slug '${slug}' already exists in language '${translation.language}'`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the category
      const category = await tx.blogCategory.create({
        data: {
          tenantId,
          parentId: createCategoryDto.parentId || null,
        },
      });

      // Create translations
      await tx.blogCategoryTranslation.createMany({
        data: createCategoryDto.translations.map(translation => ({
          categoryId: category.id,
          language: translation.language,
          name: translation.name,
          slug: translation.slug || this.generateSlug(translation.name),
        })),
      });

      // Return category with translations
      return tx.blogCategory.findUnique({
        where: { id: category.id },
        include: {
          translations: true,
          parent: { include: { translations: true } },
          children: { include: { translations: true } },
        },
      }) as unknown as BlogCategoryWithTranslations;
    });
  }

  async findAllCategories(
    tenantId: number,
    options: {
      language?: string;
      parentId?: number;
      includeChildren?: boolean;
    } = {}
  ): Promise<BlogCategoryWithTranslations[]> {
    const { language, parentId, includeChildren = true } = options;

    const whereClause: any = { tenantId };

    if (parentId !== undefined) {
      whereClause.parentId = parentId;
    }

    const includeClause: any = {
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

    // Filter out categories that don't have translations in the requested language
    const filteredCategories = language
      ? categories.filter(category => category.translations.length > 0)
      : categories;

    return filteredCategories as unknown as BlogCategoryWithTranslations[];
  }

  async findOneCategory(id: number, tenantId: number): Promise<BlogCategoryWithTranslations> {
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
      throw new NotFoundException('Category not found');
    }

    return category as unknown as BlogCategoryWithTranslations;
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto, tenantId: number): Promise<BlogCategoryWithTranslations> {
    // Check if category exists
    await this.findOneCategory(id, tenantId);

    return this.prisma.$transaction(async (tx) => {
      // Update parent if provided
      if (updateCategoryDto.parentId !== undefined) {
        // Validate parent category if specified
        if (updateCategoryDto.parentId) {
          const parentCategory = await tx.blogCategory.findFirst({
            where: { id: updateCategoryDto.parentId, tenantId },
          });

          if (!parentCategory) {
            throw new BadRequestException('Parent category not found');
          }

          // Prevent circular references
          if (updateCategoryDto.parentId === id) {
            throw new BadRequestException('Category cannot be its own parent');
          }
        }

        await tx.blogCategory.update({
          where: { id },
          data: { parentId: updateCategoryDto.parentId },
        });
      }

      // Update translations if provided
      if (updateCategoryDto.translations) {
        for (const translation of updateCategoryDto.translations) {
          const slug = translation.slug || this.generateSlug(translation.name);

          // Check for slug conflicts (exclude current category)
          const existingTranslation = await tx.blogCategoryTranslation.findFirst({
            where: {
              category: { tenantId },
              language: translation.language,
              slug,
              NOT: { categoryId: id },
            },
          });

          if (existingTranslation) {
            throw new ConflictException(
              `Category with slug '${slug}' already exists in language '${translation.language}'`
            );
          }

          // Upsert translation
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

      // Return updated category
      return tx.blogCategory.findUnique({
        where: { id },
        include: {
          translations: true,
          parent: { include: { translations: true } },
          children: { include: { translations: true } },
        },
      }) as unknown as BlogCategoryWithTranslations;
    });
  }

  async removeCategory(id: number, tenantId: number): Promise<{ message: string }> {
    // Check if category exists
    await this.findOneCategory(id, tenantId);

    // Check if category has children
    const childrenCount = await this.prisma.blogCategory.count({
      where: { parentId: id, tenantId },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
    }

    // Check if category has posts
    const postsCount = await this.prisma.blogPost.count({
      where: { categoryId: id, tenantId },
    });

    if (postsCount > 0) {
      throw new BadRequestException('Cannot delete category with posts. Move posts to another category first.');
    }

    await this.prisma.blogCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  // ==================== POST METHODS ====================

  async createPost(createPostDto: CreatePostDto, tenantId: number, authorId?: number): Promise<BlogPostWithTranslations> {
    // Validate translations
    if (!createPostDto.translations || createPostDto.translations.length === 0) {
      throw new BadRequestException('At least one translation is required');
    }

    // Validate category if specified
    if (createPostDto.categoryId) {
      const category = await this.prisma.blogCategory.findFirst({
        where: { id: createPostDto.categoryId, tenantId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check for slug uniqueness per language per tenant
    for (const translation of createPostDto.translations) {
      const existingPost = await this.prisma.blogPostTranslation.findFirst({
        where: {
          post: { tenantId },
          language: translation.language,
          slug: translation.slug,
        },
      });

      if (existingPost) {
        throw new ConflictException(
          `Post with slug '${translation.slug}' already exists in language '${translation.language}'`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the post
      const post = await tx.blogPost.create({
        data: {
          tenantId,
          categoryId: createPostDto.categoryId || null,
          authorId: createPostDto.authorId || authorId || null,
          isPublished: createPostDto.isPublished || false,
          publishedAt: createPostDto.isPublished ? (createPostDto.publishedAt || new Date()) : null,
        },
      });

      // Create translations
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

      // Return post with translations and relations
      return tx.blogPost.findUnique({
        where: { id: post.id },
        include: {
          translations: true,
          category: { include: { translations: true } },
          author: { select: { id: true, name: true, email: true } },
        },
      }) as unknown as BlogPostWithTranslations;
    });
  }

  async findAllPosts(
    tenantId: number,
    options: {
      categoryId?: number;
      authorId?: number;
      isPublished?: boolean;
      language?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { categoryId, authorId, isPublished, language, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (categoryId) whereClause.categoryId = categoryId;
    if (authorId) whereClause.authorId = authorId;
    if (isPublished !== undefined) whereClause.isPublished = isPublished;

    // Search in translations if search term is provided
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

    const includeClause: any = {
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

    // Filter out posts that don't have translations in the requested language
    const filteredPosts = language
      ? posts.filter(post => post.translations.length > 0)
      : posts;

    return {
      posts: filteredPosts as unknown as BlogPostWithTranslations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOnePost(id: number, tenantId: number): Promise<BlogPostWithTranslations> {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
        category: { include: { translations: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post as unknown as BlogPostWithTranslations;
  }

  async findPostBySlug(
    slug: string,
    language: string,
    tenantId: number,
    includeUnpublished = false
  ): Promise<BlogPostWithTranslations> {
    const whereClause: any = {
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
      throw new NotFoundException('Post not found');
    }

    return postTranslation.post as unknown as BlogPostWithTranslations;
  }

  // Helper method for slug generation
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}