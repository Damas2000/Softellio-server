import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiProperty({
    example: 'updated-image-name.jpg',
    description: 'New filename for the media file',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;
}