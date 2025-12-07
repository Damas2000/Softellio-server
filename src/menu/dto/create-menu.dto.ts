import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    example: 'main-menu',
    description: 'Unique key for the menu (e.g., main-menu, footer-menu)',
  })
  @IsString()
  key: string;
}