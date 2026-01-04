import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array of IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[];
}

export class BulkDeleteResponseDto {
  @ApiProperty({
    description: 'Number of items successfully deleted',
    example: 3,
  })
  deleted: number;

  @ApiProperty({
    description: 'Number of items that failed to delete',
    example: 0,
    required: false,
  })
  failed?: number;
}