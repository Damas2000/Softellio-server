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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Menu Management')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ==================== MENU ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new menu (Admin)' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 409, description: 'Menu key already exists' })
  createMenu(
    @Body() createMenuDto: CreateMenuDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.createMenu(createMenuDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all menus (Admin)' })
  @ApiResponse({ status: 200, description: 'List of menus' })
  findAllMenus(@CurrentTenant() tenantId: number) {
    return this.menuService.findAllMenus(tenantId);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get menu by ID with items (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu details with hierarchy' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findOneMenu(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.findOneMenu(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update menu (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.updateMenu(id, updateMenuDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete menu (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  removeMenu(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.removeMenu(id, tenantId);
  }

  // ==================== MENU ITEM ADMIN ROUTES ====================

  @Post('admin/items')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new menu item (Admin)' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid menu, page, or parent item' })
  createMenuItem(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.createMenuItem(createMenuItemDto, tenantId);
  }

  @Patch('admin/items/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update menu item (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  updateMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto, tenantId);
  }

  @Delete('admin/items/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete menu item (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  removeMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.removeMenuItem(id, tenantId);
  }

  @Post('admin/:menuId/reorder')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder menu items (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu items reordered successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  reorderMenuItems(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() body: { items: { id: number; order: number }[] },
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.reorderMenuItems(menuId, tenantId, body.items);
  }

  // ==================== PUBLIC MENU ROUTES ====================

  @Get('public/:language/:key')
  @Public()
  @ApiOperation({ summary: 'Get menu for public navigation (Public)' })
  @ApiResponse({ status: 200, description: 'Menu structure for navigation' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  getPublicMenu(
    @Param('language') language: string,
    @Param('key') key: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.buildNavigationTree(key, language, tenantId);
  }

  @Get('public/:language/:key/raw')
  @Public()
  @ApiOperation({ summary: 'Get raw menu data (Public)' })
  @ApiResponse({ status: 200, description: 'Raw menu data with all relations' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  getRawMenu(
    @Param('language') language: string,
    @Param('key') key: string,
    @CurrentTenant() tenantId: number
  ) {
    return this.menuService.findMenuByKey(key, tenantId, language);
  }

  // ==================== MENU BY KEY ADMIN ROUTES ====================

  @Get('admin/by-key/:key')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get menu by key (Admin)' })
  @ApiQuery({ name: 'language', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Menu found' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findMenuByKey(
    @Param('key') key: string,
    @CurrentTenant() tenantId: number,
    @Query('language') language?: string
  ) {
    return this.menuService.findMenuByKey(key, tenantId, language);
  }
}