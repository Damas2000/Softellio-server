import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class MenuItemLinkValidation implements ValidatorConstraintInterface {
    validate(pageId: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): "Menu item cannot have both pageId and externalUrl" | "Menu item validation passed";
}
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
export declare class MenuReorderDto {
    items: MenuItemOrderDto[];
}
export declare class MenuItemOrderDto {
    id: number;
    order: number;
    parentId?: number | null;
}
export { MenuItemTranslationDto };
