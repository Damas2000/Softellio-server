import { PrismaService } from '../config/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuWithItems, MenuItemWithTranslations } from '../common/types';
import { Menu } from '@prisma/client';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    createMenu(createMenuDto: CreateMenuDto, tenantId: number): Promise<Menu>;
    findAllMenus(tenantId: number): Promise<Menu[]>;
    findOneMenu(id: number, tenantId: number): Promise<MenuWithItems>;
    findMenuByKey(key: string, tenantId: number, language?: string): Promise<MenuWithItems>;
    updateMenu(id: number, updateMenuDto: UpdateMenuDto, tenantId: number): Promise<Menu>;
    removeMenu(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    createMenuItem(createMenuItemDto: CreateMenuItemDto, tenantId: number): Promise<MenuItemWithTranslations>;
    updateMenuItem(id: number, updateMenuItemDto: UpdateMenuItemDto, tenantId: number): Promise<MenuItemWithTranslations>;
    removeMenuItem(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    reorderMenuItems(menuId: number, tenantId: number, itemOrders: {
        id: number;
        order: number;
    }[]): Promise<{
        message: string;
    }>;
    private filterMenuItemsByLanguage;
    buildNavigationTree(menuKey: string, language: string, tenantId: number): Promise<{
        key: string;
        items: any[];
    }>;
    private buildMenuItemUrls;
}
