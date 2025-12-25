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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const blog_service_1 = require("./blog.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const create_post_dto_1 = require("./dto/create-post.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let BlogController = class BlogController {
    constructor(blogService) {
        this.blogService = blogService;
    }
    createCategory(createCategoryDto, tenantId) {
        return this.blogService.createCategory(createCategoryDto, tenantId);
    }
    findAllCategoriesAdmin(tenantId, language, parentId, includeChildren) {
        return this.blogService.findAllCategories(tenantId, {
            language,
            parentId: parentId ? Number(parentId) : undefined,
            includeChildren: includeChildren !== false,
        });
    }
    findOneCategoryAdmin(id, tenantId) {
        return this.blogService.findOneCategory(id, tenantId);
    }
    updateCategory(id, updateCategoryDto, tenantId) {
        return this.blogService.updateCategory(id, updateCategoryDto, tenantId);
    }
    removeCategory(id, tenantId) {
        return this.blogService.removeCategory(id, tenantId);
    }
    createPost(createPostDto, tenantId, user) {
        return this.blogService.createPost(createPostDto, tenantId, user.id);
    }
    findAllPostsAdmin(tenantId, categoryId, authorId, isPublished, language, search, page, limit) {
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
    findOnePostAdmin(id, tenantId) {
        return this.blogService.findOnePost(id, tenantId);
    }
    findPublicCategories(language, tenantId, parentId) {
        return this.blogService.findAllCategories(tenantId, {
            language,
            parentId: parentId ? Number(parentId) : undefined,
        });
    }
    findPublicPosts(language, tenantId, categoryId, search, page, limit) {
        return this.blogService.findAllPosts(tenantId, {
            categoryId: categoryId ? Number(categoryId) : undefined,
            isPublished: true,
            language,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    findPostBySlug(language, slug, tenantId) {
        return this.blogService.findPostBySlug(slug, language, tenantId, false);
    }
    findPostsByCategory(language, categorySlug, tenantId, page, limit) {
        return { posts: [], total: 0, totalPages: 0, currentPage: 1 };
    }
    previewPostBySlug(language, slug, tenantId) {
        return this.blogService.findPostBySlug(slug, language, tenantId, true);
    }
};
exports.BlogController = BlogController;
__decorate([
    (0, common_1.Post)('admin/categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new blog category (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slug conflict in specified language' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('admin/categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'language', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'includeChildren', type: Boolean, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of categories' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('parentId')),
    __param(3, (0, common_1.Query)('includeChildren')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Boolean]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findAllCategoriesAdmin", null);
__decorate([
    (0, common_1.Get)('admin/categories/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get category by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findOneCategoryAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/categories/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update category (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_category_dto_1.UpdateCategoryDto, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('admin/categories/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete category with children or posts' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Post)('admin/posts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new blog post (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Post created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slug conflict in specified language' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto, Number, Object]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('admin/posts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all posts (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'authorId', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isPublished', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'language', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of posts with pagination' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('authorId')),
    __param(3, (0, common_1.Query)('isPublished')),
    __param(4, (0, common_1.Query)('language')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Boolean, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findAllPostsAdmin", null);
__decorate([
    (0, common_1.Get)('admin/posts/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get post by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Post not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findOnePostAdmin", null);
__decorate([
    (0, common_1.Get)('public/:language/categories'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published categories by language (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of categories in specified language' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findPublicCategories", null);
__decorate([
    (0, common_1.Get)('public/:language/posts'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published posts by language (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of published posts in specified language' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findPublicPosts", null);
__decorate([
    (0, common_1.Get)('public/:language/posts/:slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get published post by slug and language (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post content in specified language' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Post not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findPostBySlug", null);
__decorate([
    (0, common_1.Get)('public/:language/categories/:categorySlug/posts'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get posts by category slug (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Posts in the specified category' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('categorySlug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "findPostsByCategory", null);
__decorate([
    (0, common_1.Get)('preview/:language/posts/:slug'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Preview post by slug (including unpublished) (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post content preview' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Post not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], BlogController.prototype, "previewPostBySlug", null);
exports.BlogController = BlogController = __decorate([
    (0, swagger_1.ApiTags)('Blog'),
    (0, common_1.Controller)('blog'),
    __metadata("design:paramtypes", [blog_service_1.BlogService])
], BlogController);
//# sourceMappingURL=blog.controller.js.map