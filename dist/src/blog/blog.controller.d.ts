import { BlogService } from './blog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    createCategory(createCategoryDto: CreateCategoryDto, tenantId: number): Promise<import("../common/types").BlogCategoryWithTranslations>;
    findAllCategoriesAdmin(tenantId: number, language?: string, parentId?: number, includeChildren?: boolean): Promise<import("../common/types").BlogCategoryWithTranslations[]>;
    findOneCategoryAdmin(id: number, tenantId: number): Promise<import("../common/types").BlogCategoryWithTranslations>;
    updateCategory(id: number, updateCategoryDto: UpdateCategoryDto, tenantId: number): Promise<import("../common/types").BlogCategoryWithTranslations>;
    removeCategory(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    createPost(createPostDto: CreatePostDto, tenantId: number, user: any): Promise<import("../common/types").BlogPostWithTranslations>;
    findAllPostsAdmin(tenantId: number, categoryId?: number, authorId?: number, isPublished?: boolean, language?: string, search?: string, page?: number, limit?: number): Promise<{
        posts: import("../common/types").BlogPostWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOnePostAdmin(id: number, tenantId: number): Promise<import("../common/types").BlogPostWithTranslations>;
    findPublicCategories(language: string, tenantId: number, parentId?: number): Promise<import("../common/types").BlogCategoryWithTranslations[]>;
    findPublicPosts(language: string, tenantId: number, categoryId?: number, search?: string, page?: number, limit?: number): Promise<{
        posts: import("../common/types").BlogPostWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findPostBySlug(language: string, slug: string, tenantId: number): Promise<import("../common/types").BlogPostWithTranslations>;
    findPostsByCategory(language: string, categorySlug: string, tenantId: number, page?: number, limit?: number): {
        posts: any[];
        total: number;
        totalPages: number;
        currentPage: number;
    };
    previewPostBySlug(language: string, slug: string, tenantId: number): Promise<import("../common/types").BlogPostWithTranslations>;
}
