import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageLayoutDto {
  @ApiProperty({
    example: 'about-us',
    description: 'Page slug for the layout',
  })
  @IsString()
  pageSlug: string;

  @ApiProperty({
    example: 'tr',
    description: 'Layout language',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    example: 'published',
    description: 'Layout status',
    enum: ['published', 'draft'],
    default: 'published',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: true,
    description: 'Whether to copy sections from HOME layout as starting point',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  copyFromHome?: boolean;
}

export class PageLayoutListDto {
  @ApiProperty({
    example: ['HOME', 'PAGE:about-us', 'PAGE:contact'],
    description: 'Available layout keys',
  })
  @IsArray()
  layoutKeys: string[];

  @ApiProperty({
    example: 3,
    description: 'Total number of layouts',
  })
  count: number;
}

export class LayoutKeyInfoDto {
  @ApiProperty({ example: 'PAGE:about-us' })
  key: string;

  @ApiProperty({ example: 'page' })
  type: 'global' | 'page';

  @ApiProperty({ example: 'about-us' })
  slug?: string;

  @ApiProperty({ example: 'About Us Page Layout' })
  displayName: string;

  @ApiProperty({ example: 5 })
  sectionsCount: number;

  @ApiProperty({ example: 'tr' })
  language: string;

  @ApiProperty({ example: 'published' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}