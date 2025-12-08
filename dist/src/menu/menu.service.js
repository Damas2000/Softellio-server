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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let MenuService = class MenuService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMenu(createMenuDto, tenantId) {
        const existingMenu = await this.prisma.menu.findFirst({
            where: {
                tenantId,
                key: createMenuDto.key,
            },
        });
        if (existingMenu) {
            throw new common_1.ConflictException(`Menu with key '${createMenuDto.key}' already exists`);
        }
        return this.prisma.menu.create({
            data: {
                tenantId,
                key: createMenuDto.key,
            },
        });
    }
    async findAllMenus(tenantId) {
        return this.prisma.menu.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneMenu(id, tenantId) {
        const menu = await this.prisma.menu.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    where: { parentId: null },
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
            throw new common_1.NotFoundException('Menu not found');
        }
        return menu;
    }
    async findMenuByKey(key, tenantId, language) {
        const includeTranslations = language
            ? { where: { language } }
            : true;
        const menu = await this.prisma.menu.findFirst({
            where: { key, tenantId },
            include: {
                items: {
                    where: { parentId: null },
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
            throw new common_1.NotFoundException('Menu not found');
        }
        if (language) {
            menu.items = this.filterMenuItemsByLanguage(menu.items, language);
        }
        return menu;
    }
    async updateMenu(id, updateMenuDto, tenantId) {
        const existingMenu = await this.prisma.menu.findFirst({
            where: { id, tenantId },
        });
        if (!existingMenu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        if (updateMenuDto.key && updateMenuDto.key !== existingMenu.key) {
            const conflictingMenu = await this.prisma.menu.findFirst({
                where: {
                    tenantId,
                    key: updateMenuDto.key,
                    id: { not: id },
                },
            });
            if (conflictingMenu) {
                throw new common_1.ConflictException(`Menu with key '${updateMenuDto.key}' already exists`);
            }
        }
        return this.prisma.menu.update({
            where: { id },
            data: updateMenuDto,
        });
    }
    async removeMenu(id, tenantId) {
        await this.findOneMenu(id, tenantId);
        await this.prisma.menu.delete({
            where: { id },
        });
        return { message: 'Menu deleted successfully' };
    }
    async createMenuItem(createMenuItemDto, tenantId) {
        if (!createMenuItemDto.translations || createMenuItemDto.translations.length === 0) {
            throw new common_1.BadRequestException('At least one translation is required');
        }
        const menu = await this.prisma.menu.findFirst({
            where: { id: createMenuItemDto.menuId, tenantId },
        });
        if (!menu) {
            throw new common_1.BadRequestException('Menu not found');
        }
        if (createMenuItemDto.parentId) {
            const parentItem = await this.prisma.menuItem.findFirst({
                where: { id: createMenuItemDto.parentId, tenantId },
            });
            if (!parentItem) {
                throw new common_1.BadRequestException('Parent menu item not found');
            }
        }
        if (createMenuItemDto.pageId) {
            const page = await this.prisma.page.findFirst({
                where: { id: createMenuItemDto.pageId, tenantId },
            });
            if (!page) {
                throw new common_1.BadRequestException('Page not found');
            }
        }
        if (createMenuItemDto.pageId && createMenuItemDto.externalUrl) {
            throw new common_1.BadRequestException('Menu item cannot have both pageId and externalUrl');
        }
        if (!createMenuItemDto.pageId && !createMenuItemDto.externalUrl) {
            throw new common_1.BadRequestException('Menu item must have either pageId or externalUrl');
        }
        return this.prisma.$transaction(async (tx) => {
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
            await tx.menuItemTranslation.createMany({
                data: createMenuItemDto.translations.map(translation => ({
                    menuItemId: menuItem.id,
                    language: translation.language,
                    label: translation.label,
                })),
            });
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
            });
        });
    }
    async updateMenuItem(id, updateMenuItemDto, tenantId) {
        const existingMenuItem = await this.prisma.menuItem.findFirst({
            where: { id, tenantId },
        });
        if (!existingMenuItem) {
            throw new common_1.NotFoundException('Menu item not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updateData = {};
            if (updateMenuItemDto.order !== undefined)
                updateData.order = updateMenuItemDto.order;
            if (updateMenuItemDto.pageId !== undefined)
                updateData.pageId = updateMenuItemDto.pageId;
            if (updateMenuItemDto.externalUrl !== undefined)
                updateData.externalUrl = updateMenuItemDto.externalUrl;
            if (Object.keys(updateData).length > 0) {
                await tx.menuItem.update({
                    where: { id },
                    data: updateData,
                });
            }
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
            });
        });
    }
    async removeMenuItem(id, tenantId) {
        const menuItem = await this.prisma.menuItem.findFirst({
            where: { id, tenantId },
        });
        if (!menuItem) {
            throw new common_1.NotFoundException('Menu item not found');
        }
        await this.prisma.menuItem.delete({
            where: { id },
        });
        return { message: 'Menu item deleted successfully' };
    }
    async reorderMenuItems(menuId, tenantId, itemOrders) {
        const menu = await this.prisma.menu.findFirst({
            where: { id: menuId, tenantId },
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        await this.prisma.$transaction(itemOrders.map(({ id, order }) => this.prisma.menuItem.update({
            where: { id },
            data: { order },
        })));
        return { message: 'Menu items reordered successfully' };
    }
    filterMenuItemsByLanguage(items, language) {
        return items
            .map(item => ({
            ...item,
            translations: item.translations.filter((t) => t.language === language),
            children: this.filterMenuItemsByLanguage(item.children || [], language),
        }))
            .filter(item => item.translations.length > 0);
    }
    async buildNavigationTree(menuKey, language, tenantId) {
        const menu = await this.findMenuByKey(menuKey, tenantId, language);
        return {
            key: menu.key,
            items: this.buildMenuItemUrls(menu.items, language),
        };
    }
    buildMenuItemUrls(items, language) {
        return items.map(item => {
            const translation = item.translations.find(t => t.language === language);
            let url = '#';
            if (item.externalUrl) {
                url = item.externalUrl;
            }
            else if (item.page && item.page.translations) {
                const pageTranslation = item.page.translations.find((t) => t.language === language);
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
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map