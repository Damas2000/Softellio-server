import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ==================== CATEGORY ADMIN ROUTES ====================

  @Post('admin/categories')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new blog category (Admin)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Slug conflict in specified language' })
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.createCategory(createCategoryDto, tenantId);
  }

  @Get('admin/categories')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all categories (Admin)' })
  @ApiQuery({ name: 'language', type: String, required: false })
  @ApiQuery({ name: 'parentId', type: Number, required: false })
  @ApiQuery({ name: 'includeChildren', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAllCategoriesAdmin(
    @CurrentTenant() tenantId: number,
    @Query('language') language?: string,
    @Query('parentId') parentId?: number,
    @Query('includeChildren') includeChildren?: boolean,
  ) {
    return this.blogService.findAllCategories(tenantId, {
      language,
      parentId: parentId ? Number(parentId) : undefined,
      includeChildren: includeChildren !== false,
    });
  }

  @Get('admin/categories/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get category by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOneCategoryAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.findOneCategory(id, tenantId);
  }

  @Patch('admin/categories/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update category (Admin)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.updateCategory(id, updateCategoryDto, tenantId);
  }

  @Delete('admin/categories/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete category (Admin)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with children or posts' })
  removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.removeCategory(id, tenantId);
  }

  // ==================== POST ADMIN ROUTES ====================

  @Post('admin/posts')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new blog post (Admin)' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 409, description: 'Slug conflict in specified language' })
  createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentTenant() tenantId: number,
    @CurrentUser() user: any
  ) {
    return this.blogService.createPost(createPostDto, tenantId, user.id);
  }

  @Get('admin/posts')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all posts (Admin)' })
  @ApiQuery({ name: 'categoryId', type: Number, required: false })
  @ApiQuery({ name: 'authorId', type: Number, required: false })
  @ApiQuery({ name: 'isPublished', type: Boolean, required: false })
  @ApiQuery({ name: 'language', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'List of posts with pagination' })
  findAllPostsAdmin(
    @CurrentTenant() tenantId: number,
    @Query('categoryId') categoryId?: number,
    @Query('authorId') authorId?: number,
    @Query('isPublished') isPublished?: boolean,
    @Query('language') language?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blogService.findAllPosts(tenantId, {
      categoryId: categoryId ? Number(categoryId) : undefined,
      authorId: authorId ? Number(authorId) : undefined,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      language,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('admin/posts/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get post by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOnePostAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.findOnePost(id, tenantId);
  }

  // ==================== PUBLIC CATEGORY ROUTES ====================

  @Get('public/:language/categories')
  @Public()
  @ApiOperation({ summary: 'Get published categories by language (Public)' })
  @ApiQuery({ name: 'parentId', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'List of categories in specified language' })
  findPublicCategories(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query('parentId') parentId?: number,
  ) {
    return this.blogService.findAllCategories(tenantId, {
      language,
      parentId: parentId ? Number(parentId) : undefined,
    });
  }

  // ==================== PUBLIC POST ROUTES ====================

  @Get('public/:language/posts')
  @Public()
  @ApiOperation({ summary: 'Get published posts by language (Public)' })
  @ApiQuery({ name: 'categoryId', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'List of published posts in specified language' })
  findPublicPosts(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query('categoryId') categoryId?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blogService.findAllPosts(tenantId, {
      categoryId: categoryId ? Number(categoryId) : undefined,
      isPublished: true, // Only published posts for public
      language,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('public/:language/posts/:slug')
  @Public()
  @ApiOperation({ summary: 'Get published post by slug and language (Public)' })
  @ApiResponse({ status: 200, description: 'Post content in specified language' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findPostBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.findPostBySlug(slug, language, tenantId, false);
  }

  @Get('public/:language/categories/:categorySlug/posts')
  @Public()
  @ApiOperation({ summary: 'Get posts by category slug (Public)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Posts in the specified category' })
  findPostsByCategory(
    @Param('language') language: string,
    @Param('categorySlug') categorySlug: string,
    @CurrentTenant() tenantId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Note: This would require a method to find category by slug first
    // For now, returning empty - would implement findCategoryBySlug method
    return { posts: [], total: 0, totalPages: 0, currentPage: 1 };
  }

  // ==================== PREVIEW ROUTES (Admin) ====================

  @Get('preview/:language/posts/:slug')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Preview post by slug (including unpublished) (Admin)' })
  @ApiResponse({ status: 200, description: 'Post content preview' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  previewPostBySlug(
    @Param('language') language: string,
    @Param('slug') slug: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.blogService.findPostBySlug(slug, language, tenantId, true);
  }
}