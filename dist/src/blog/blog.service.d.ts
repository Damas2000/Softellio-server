import { PrismaService } from '../config/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { BlogPostWithTranslations, BlogCategoryWithTranslations } from '../common/types';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    createCategory(createCategoryDto: CreateCategoryDto, tenantId: number): Promise<BlogCategoryWithTranslations>;
    findAllCategories(tenantId: number, options?: {
        language?: string;
        parentId?: number;
        includeChildren?: boolean;
    }): Promise<BlogCategoryWithTranslations[]>;
    findOneCategory(id: number, tenantId: number): Promise<BlogCategoryWithTranslations>;
    updateCategory(id: number, updateCategoryDto: UpdateCategoryDto, tenantId: number): Promise<BlogCategoryWithTranslations>;
    removeCategory(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    createPost(createPostDto: CreatePostDto, tenantId: number, authorId?: number): Promise<BlogPostWithTranslations>;
    findAllPosts(tenantId: number, options?: {
        categoryId?: number;
        authorId?: number;
        isPublished?: boolean;
        language?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        posts: BlogPostWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOnePost(id: number, tenantId: number): Promise<BlogPostWithTranslations>;
    findPostBySlug(slug: string, language: string, tenantId: number, includeUnpublished?: boolean): Promise<BlogPostWithTranslations>;
    private generateSlug;
}
