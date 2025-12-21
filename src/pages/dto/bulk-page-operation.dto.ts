import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsEnum, IsOptional, ArrayMinSize } from 'class-validator';
import { PageStatus } from './create-page.dto';

export class BulkPageDeleteDto {
  @ApiProperty({
    description: 'Array of page IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one page ID is required' })
  @IsInt({ each: true, message: 'Each ID must be a valid integer' })
  ids: number[];
}

export class BulkPageStatusUpdateDto {
  @ApiProperty({
    description: 'Array of page IDs to update',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one page ID is required' })
  @IsInt({ each: true, message: 'Each ID must be a valid integer' })
  ids: number[];

  @ApiProperty({
    description: 'New status to apply to all specified pages',
    enum: PageStatus,
    example: PageStatus.PUBLISHED,
  })
  @IsEnum(PageStatus, { message: 'Status must be a valid page status' })
  status: PageStatus;
}

export class BulkPageOperationDto {
  @ApiProperty({
    description: 'Array of page IDs to operate on',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one page ID is required' })
  @IsInt({ each: true, message: 'Each ID must be a valid integer' })
  ids: number[];

  @ApiProperty({
    description: 'Operation to perform',
    enum: ['delete', 'publish', 'draft', 'archive'],
    example: 'publish',
  })
  @IsEnum(['delete', 'publish', 'draft', 'archive'], {
    message: 'Operation must be one of: delete, publish, draft, archive',
  })
  operation: 'delete' | 'publish' | 'draft' | 'archive';

  @ApiProperty({
    description: 'New status (for status change operations)',
    enum: PageStatus,
    required: false,
    example: PageStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  newStatus?: PageStatus;
}

export class BulkOperationResultDto {
  @ApiProperty({
    description: 'Number of pages successfully processed',
    example: 3,
  })
  processed: number;

  @ApiProperty({
    description: 'Number of pages that failed to process',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: 'Array of page IDs that were successfully processed',
    type: [Number],
    example: [1, 2, 3],
  })
  successIds: number[];

  @ApiProperty({
    description: 'Array of page IDs that failed to process with error messages',
    type: [Object],
    example: [{ id: 4, error: 'Page not found' }],
    required: false,
  })
  @IsOptional()
  failedIds?: Array<{ id: number; error: string }>;

  @ApiProperty({
    description: 'Operation that was performed',
    example: 'publish',
  })
  operation: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Bulk operation completed successfully',
  })
  message: string;
}