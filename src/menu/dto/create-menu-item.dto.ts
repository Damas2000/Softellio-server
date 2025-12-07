import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Page ID to link to (for internal links)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  pageId?: number;

  @ApiProperty({
    example: 'https://external-website.com',
    description: 'External URL (for external links)',
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

export { MenuItemTranslationDto };