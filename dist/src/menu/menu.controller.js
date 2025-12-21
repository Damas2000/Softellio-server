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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const menu_service_1 = require("./menu.service");
const create_menu_dto_1 = require("./dto/create-menu.dto");
const update_menu_dto_1 = require("./dto/update-menu.dto");
const create_menu_item_dto_1 = require("./dto/create-menu-item.dto");
const update_menu_item_dto_1 = require("./dto/update-menu-item.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let MenuController = class MenuController {
    constructor(menuService) {
        this.menuService = menuService;
    }
    createMenu(createMenuDto, tenantId) {
        return this.menuService.createMenu(createMenuDto, tenantId);
    }
    findAllMenus(tenantId) {
        return this.menuService.findAllMenus(tenantId);
    }
    findOneMenu(id, tenantId) {
        return this.menuService.findOneMenu(id, tenantId);
    }
    updateMenu(id, updateMenuDto, tenantId) {
        return this.menuService.updateMenu(id, updateMenuDto, tenantId);
    }
    removeMenu(id, tenantId) {
        return this.menuService.removeMenu(id, tenantId);
    }
    createMenuItem(createMenuItemDto, tenantId) {
        return this.menuService.createMenuItem(createMenuItemDto, tenantId);
    }
    updateMenuItem(id, updateMenuItemDto, tenantId) {
        return this.menuService.updateMenuItem(id, updateMenuItemDto, tenantId);
    }
    removeMenuItem(id, tenantId) {
        return this.menuService.removeMenuItem(id, tenantId);
    }
    reorderMenuItems(menuId, body, tenantId) {
        return this.menuService.reorderMenuItems(menuId, tenantId, body.items);
    }
    getPublicMenu(language, key, tenantId) {
        return this.menuService.buildNavigationTree(key, language, tenantId);
    }
    getRawMenu(language, key, tenantId) {
        return this.menuService.findMenuByKey(key, tenantId, language);
    }
    findMenuByKey(key, tenantId, language) {
        return this.menuService.findMenuByKey(key, tenantId, language);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new menu (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Menu created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Menu key already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all menus (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of menus' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findAllMenus", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu by ID with items (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu details with hierarchy' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findOneMenu", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update menu (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_menu_dto_1.UpdateMenuDto, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "updateMenu", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete menu (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "removeMenu", null);
__decorate([
    (0, common_1.Post)('admin/items'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new menu item (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Menu item created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid menu, page, or parent item' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_item_dto_1.CreateMenuItemDto, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Patch)('admin/items/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update menu item (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu item updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu item not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_menu_item_dto_1.UpdateMenuItemDto, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "updateMenuItem", null);
__decorate([
    (0, common_1.Delete)('admin/items/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete menu item (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu item deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu item not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "removeMenuItem", null);
__decorate([
    (0, common_1.Post)('admin/:menuId/reorder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder menu items (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu items reordered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('menuId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "reorderMenuItems", null);
__decorate([
    (0, common_1.Get)('public/:language/:key'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu for public navigation (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu structure for navigation' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "getPublicMenu", null);
__decorate([
    (0, common_1.Get)('public/:language/:key/raw'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get raw menu data (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Raw menu data with all relations' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "getRawMenu", null);
__decorate([
    (0, common_1.Get)('admin/by-key/:key'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu by key (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'language', type: String, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Menu not found' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findMenuByKey", null);
exports.MenuController = MenuController = __decorate([
    (0, swagger_1.ApiTags)('Menu Management'),
    (0, common_1.Controller)('menu'),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map