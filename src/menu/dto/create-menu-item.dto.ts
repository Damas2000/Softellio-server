import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsUrl, ValidatorConstraint, ValidatorConstraintInterface, Validate, ValidationArguments, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'MenuItemLinkValidation', async: false })
export class MenuItemLinkValidation implements ValidatorConstraintInterface {
  validate(pageId: any, args: ValidationArguments) {
    const object = args.object as any;
    const externalUrl = object.externalUrl;

    // Both can be null/undefined (for group items)
    if (!pageId && !externalUrl) {
      return true;
    }

    // Only one should be provided, not both
    return Boolean(pageId) !== Boolean(externalUrl);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const externalUrl = object.externalUrl;

    if (args.value && externalUrl) {
      return 'Menu item cannot have both pageId and externalUrl';
    }
    return 'Menu item validation passed';
  }
}

class MenuItemTranslationDto {
  @ApiProperty({
    example: 'tr',
    description: 'Language code (tr, en, ar, etc.)',
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Ana Sayfa',
    description: 'Menu item label in this language',
  })
  @IsString()
  label: string;
}

export class CreateMenuItemDto {
  @ApiProperty({
    example: 1,
    description: 'Menu ID this item belongs to',
  })
  @IsNumber()
  menuId: number;

  @ApiProperty({
    example: 1,
    description: 'Parent menu item ID for nested menus',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    example: 1,
    description: 'Display order of the menu item',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    example: 5,
    description: 'Page ID to link to (for internal links). Cannot be used together with externalUrl. If both pageId and externalUrl are null, this creates a group/parent menu item.',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Validate(MenuItemLinkValidation)
  pageId?: number;

  @ApiProperty({
    example: 'https://external-website.com',
    description: 'External URL (for external links). Cannot be used together with pageId. If both pageId and externalUrl are null, this creates a group/parent menu item.',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiProperty({
    type: [MenuItemTranslationDto],
    description: 'Menu item translations for different languages',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemTranslationDto)
  translations: MenuItemTranslationDto[];
}

export class MenuReorderDto {
  @ApiProperty({
    description: 'Array of menu items with their new order and optional parent assignment',
    example: [
      { id: 1, order: 1, parentId: null },
      { id: 2, order: 2, parentId: 1 },
      { id: 3, order: 1, parentId: 1 }
    ],
    type: [Object],
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one menu item is required' })
  @ValidateNested({ each: true })
  @Type(() => MenuItemOrderDto)
  items: MenuItemOrderDto[];
}

export class MenuItemOrderDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: 1,
  })
  @IsNumber({}, { message: 'ID must be a number' })
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: 'New order position',
    example: 1,
  })
  @IsNumber({}, { message: 'Order must be a number' })
  @Type(() => Number)
  order: number;

  @ApiProperty({
    description: 'Parent menu item ID (null for root items)',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number | null;
}

export { MenuItemTranslationDto };