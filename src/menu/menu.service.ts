import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuWithItems, MenuItemWithTranslations } from '../common/types';
import { Menu, MenuItem, MenuItemTranslation, Page } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ==================== MENU METHODS ====================

  async createMenu(createMenuDto: CreateMenuDto, tenantId: number): Promise<Menu> {
    // Check if menu with this key already exists for this tenant
    const existingMenu = await this.prisma.menu.findFirst({
      where: {
        tenantId,
        key: createMenuDto.key,
      },
    });

    if (existingMenu) {
      throw new ConflictException(`Menu with key '${createMenuDto.key}' already exists`);
    }

    return this.prisma.menu.create({
      data: {
        tenantId,
        key: createMenuDto.key,
      },
    });
  }

  async findAllMenus(tenantId: number): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneMenu(id: number, tenantId: number): Promise<MenuWithItems> {
    const menu = await this.prisma.menu.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          where: { parentId: null }, // Only top-level items
          include: {
            translations: true,
            page: {
              include: {
                translations: true,
              },
            },
            children: {
              include: {
                translations: true,
                page: {
                  include: {
                    translations: true,
                  },
                },
                children: {
                  include: {
                    translations: true,
                    page: {
                      include: {
                        translations: true,
                      },
                    },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return menu as unknown as MenuWithItems;
  }

  async findMenuByKey(key: string, tenantId: number, language?: string): Promise<MenuWithItems> {
    const includeTranslations = language
      ? { where: { language } }
      : true;

    const menu = await this.prisma.menu.findFirst({
      where: { key, tenantId },
      include: {
        items: {
          where: { parentId: null }, // Only top-level items
          include: {
            translations: includeTranslations,
            page: {
              include: {
                translations: language ? { where: { language } } : true,
              },
            },
            children: {
              include: {
                translations: includeTranslations,
                page: {
                  include: {
                    translations: language ? { where: { language } } : true,
                  },
                },
                children: {
                  include: {
                    translations: includeTranslations,
                    page: {
                      include: {
                        translations: language ? { where: { language } } : true,
                      },
                    },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    // Filter out items without translations in the requested language
    if (language) {
      menu.items = this.filterMenuItemsByLanguage(menu.items as any, language);
    }

    return menu as unknown as MenuWithItems;
  }

  async updateMenu(id: number, updateMenuDto: UpdateMenuDto, tenantId: number): Promise<Menu> {
    // Check if menu exists
    const existingMenu = await this.prisma.menu.findFirst({
      where: { id, tenantId },
    });

    if (!existingMenu) {
      throw new NotFoundException('Menu not found');
    }

    // Check if new key conflicts with existing menus
    if (updateMenuDto.key && updateMenuDto.key !== existingMenu.key) {
      const conflictingMenu = await this.prisma.menu.findFirst({
        where: {
          tenantId,
          key: updateMenuDto.key,
          id: { not: id },
        },
      });

      if (conflictingMenu) {
        throw new ConflictException(`Menu with key '${updateMenuDto.key}' already exists`);
      }
    }

    return this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async removeMenu(id: number, tenantId: number): Promise<{ message: string }> {
    // Check if menu exists
    await this.findOneMenu(id, tenantId);

    await this.prisma.menu.delete({
      where: { id },
    });

    return { message: 'Menu deleted successfully' };
  }

  // ==================== MENU ITEM METHODS ====================

  async createMenuItem(createMenuItemDto: CreateMenuItemDto, tenantId: number): Promise<MenuItemWithTranslations> {
    // Validate translations
    if (!createMenuItemDto.translations || createMenuItemDto.translations.length === 0) {
      throw new BadRequestException('At least one translation is required');
    }

    // Validate menu exists and belongs to tenant
    const menu = await this.prisma.menu.findFirst({
      where: { id: createMenuItemDto.menuId, tenantId },
    });

    if (!menu) {
      throw new BadRequestException('Menu not found');
    }

    // Validate parent item if specified
    if (createMenuItemDto.parentId) {
      const parentItem = await this.prisma.menuItem.findFirst({
        where: { id: createMenuItemDto.parentId, tenantId },
      });

      if (!parentItem) {
        throw new BadRequestException('Parent menu item not found');
      }
    }

    // Validate page exists if pageId is specified
    if (createMenuItemDto.pageId) {
      const page = await this.prisma.page.findFirst({
        where: { id: createMenuItemDto.pageId, tenantId },
      });

      if (!page) {
        throw new BadRequestException('Page not found');
      }
    }

    // Validate mutual exclusivity - can't have both pageId and externalUrl
    // But allow both to be null (for group/parent menu items)
    if (createMenuItemDto.pageId && createMenuItemDto.externalUrl) {
      throw new BadRequestException('Menu item cannot have both pageId and externalUrl');
    }

    return this.prisma.$transaction(async (tx) => {
      // Auto-assign order if not provided
      let order = createMenuItemDto.order;
      if (order === undefined) {
        const maxOrder = await tx.menuItem.findFirst({
          where: {
            menuId: createMenuItemDto.menuId,
            parentId: createMenuItemDto.parentId || null,
          },
          orderBy: { order: 'desc' },
          select: { order: true },
        });

        order = (maxOrder?.order || 0) + 1;
      }

      // Create menu item
      const menuItem = await tx.menuItem.create({
        data: {
          tenantId,
          menuId: createMenuItemDto.menuId,
          parentId: createMenuItemDto.parentId || null,
          order,
          pageId: createMenuItemDto.pageId || null,
          externalUrl: createMenuItemDto.externalUrl || null,
        },
      });

      // Create translations
      await tx.menuItemTranslation.createMany({
        data: createMenuItemDto.translations.map(translation => ({
          menuItemId: menuItem.id,
          language: translation.language,
          label: translation.label,
        })),
      });

      // Return menu item with translations
      return tx.menuItem.findUnique({
        where: { id: menuItem.id },
        include: {
          translations: true,
          page: {
            include: {
              translations: true,
            },
          },
          children: {
            include: {
              translations: true,
              page: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      }) as unknown as MenuItemWithTranslations;
    });
  }

  async updateMenuItem(id: number, updateMenuItemDto: UpdateMenuItemDto, tenantId: number): Promise<MenuItemWithTranslations> {
    // Check if menu item exists
    const existingMenuItem = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });

    if (!existingMenuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update basic fields if provided
      const updateData: any = {};

      if (updateMenuItemDto.order !== undefined) updateData.order = updateMenuItemDto.order;
      if (updateMenuItemDto.pageId !== undefined) updateData.pageId = updateMenuItemDto.pageId;
      if (updateMenuItemDto.externalUrl !== undefined) updateData.externalUrl = updateMenuItemDto.externalUrl;

      if (Object.keys(updateData).length > 0) {
        await tx.menuItem.update({
          where: { id },
          data: updateData,
        });
      }

      // Update translations if provided
      if (updateMenuItemDto.translations) {
        for (const translation of updateMenuItemDto.translations) {
          await tx.menuItemTranslation.upsert({
            where: {
              menuItemId_language: {
                menuItemId: id,
                language: translation.language,
              },
            },
            update: {
              label: translation.label,
            },
            create: {
              menuItemId: id,
              language: translation.language,
              label: translation.label,
            },
          });
        }
      }

      // Return updated menu item
      return tx.menuItem.findUnique({
        where: { id },
        include: {
          translations: true,
          page: {
            include: {
              translations: true,
            },
          },
          children: {
            include: {
              translations: true,
              page: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      }) as unknown as MenuItemWithTranslations;
    });
  }

  async removeMenuItem(id: number, tenantId: number): Promise<{ message: string }> {
    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item deleted successfully' };
  }

  async reorderMenuItems(menuId: number, tenantId: number, itemOrders: { id: number; order: number; parentId?: number | null }[]): Promise<{ message: string }> {
    // Validate menu exists and belongs to tenant
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, tenantId },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    // Validate all items belong to this menu and tenant
    const itemIds = itemOrders.map(item => item.id);
    const existingItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        menuId,
        tenantId
      },
      select: { id: true }
    });

    if (existingItems.length !== itemIds.length) {
      throw new BadRequestException('One or more menu items not found or do not belong to this menu');
    }

    // Validate parent IDs if specified
    const parentIds = itemOrders
      .map(item => item.parentId)
      .filter((parentId): parentId is number => parentId !== null && parentId !== undefined);

    if (parentIds.length > 0) {
      const existingParents = await this.prisma.menuItem.findMany({
        where: {
          id: { in: parentIds },
          menuId,
          tenantId
        },
        select: { id: true }
      });

      if (existingParents.length !== new Set(parentIds).size) {
        throw new BadRequestException('One or more parent items not found or do not belong to this menu');
      }
    }

    // Update orders and parentIds in transaction
    await this.prisma.$transaction(
      itemOrders.map(({ id, order, parentId }) =>
        this.prisma.menuItem.update({
          where: { id },
          data: {
            order,
            parentId: parentId !== undefined ? parentId : undefined
          },
        })
      )
    );

    return { message: 'Menu items reordered successfully' };
  }

  // ==================== HELPER METHODS ====================

  private filterMenuItemsByLanguage(items: any[], language: string): any[] {
    return items
      .map(item => ({
        ...item,
        translations: item.translations.filter((t: any) => t.language === language),
        children: this.filterMenuItemsByLanguage(item.children || [], language),
      }))
      .filter(item => item.translations.length > 0);
  }

  // ==================== PUBLIC NAVIGATION BUILDER ====================

  async buildNavigationTree(menuKey: string, language: string, tenantId: number) {
    const menu = await this.findMenuByKey(menuKey, tenantId, language);

    return {
      key: menu.key,
      items: this.buildMenuItemUrls(menu.items, language),
    };
  }

  private buildMenuItemUrls(items: MenuItemWithTranslations[], language: string): any[] {
    return items.map(item => {
      const translation = item.translations.find(t => t.language === language);

      let url = '#';
      if (item.externalUrl) {
        url = item.externalUrl;
      } else if (item.page && item.page.translations) {
        const pageTranslation = item.page.translations.find((t: any) => t.language === language);
        if (pageTranslation) {
          url = `/public/${language}/pages/${pageTranslation.slug}`;
        }
      }

      return {
        id: item.id,
        label: translation?.label || '',
        url,
        order: item.order,
        children: this.buildMenuItemUrls(item.children || [], language),
      };
    });
  }
}