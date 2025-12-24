declare class MenuItemTranslationDto {
    language: string;
    label: string;
}
export declare class CreateMenuItemDto {
    menuId: number;
    parentId?: number;
    order?: number;
    pageId?: number;
    externalUrl?: string;
    translations: MenuItemTranslationDto[];
}
export { MenuItemTranslationDto };
