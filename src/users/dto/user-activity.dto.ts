import { IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserActivityQueryDto {
  @ApiProperty({
    required: false,
    description: 'Filter activities after this date',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'Filter activities before this date',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    required: false,
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}

export interface UserActivityResponse {
  id: number;
  userId: number;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export interface UserActivitySummary {
  totalActivities: number;
  activitiesByAction: Record<string, number>;
  activitiesByDay: Array<{
    date: string;
    count: number;
  }>;
  lastActivity?: Date;
  mostActiveHour: number;
}