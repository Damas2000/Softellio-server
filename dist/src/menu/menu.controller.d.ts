import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto, MenuReorderDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    createMenu(createMenuDto: CreateMenuDto, tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
    }>;
    findAllMenus(tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
    }[]>;
    findOneMenu(id: number, tenantId: number): Promise<import("../common/types").MenuWithItems>;
    updateMenu(id: number, updateMenuDto: UpdateMenuDto, tenantId: number): Promise<{
        id: number;
        tenantId: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
    }>;
    removeMenu(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    createMenuItem(createMenuItemDto: CreateMenuItemDto, tenantId: number): Promise<import("../common/types").MenuItemWithTranslations>;
    updateMenuItem(id: number, updateMenuItemDto: UpdateMenuItemDto, tenantId: number): Promise<import("../common/types").MenuItemWithTranslations>;
    removeMenuItem(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    reorderMenuItems(menuId: number, reorderDto: MenuReorderDto, tenantId: number): Promise<{
        message: string;
    }>;
    getPublicMenu(language: string, key: string, tenantId: number): Promise<{
        key: string;
        items: any[];
    }>;
    getRawMenu(language: string, key: string, tenantId: number): Promise<import("../common/types").MenuWithItems>;
    findMenuByKey(key: string, tenantId: number, language?: string): Promise<import("../common/types").MenuWithItems>;
}
