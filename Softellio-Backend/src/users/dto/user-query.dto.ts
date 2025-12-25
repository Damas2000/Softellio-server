import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserQueryDto {
  @ApiProperty({
    required: false,
    description: 'Search users by name or email',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: Role,
    description: 'Filter by user role',
    example: Role.TENANT_ADMIN,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filter by tenant ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tenantId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter users created after this date',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiProperty({
    required: false,
    description: 'Filter users created before this date',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

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
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({
    required: false,
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'email', 'name', 'role'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    required: false,
    description: 'Sort direction',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class BulkUserOperationDto {
  @ApiProperty({
    description: 'Array of user IDs to operate on',
    example: [1, 2, 3],
  })
  @IsInt({ each: true })
  userIds: number[];

  @ApiProperty({
    description: 'Operation to perform',
    enum: ['activate', 'deactivate', 'delete', 'change_role'],
    example: 'activate',
  })
  @IsEnum(['activate', 'deactivate', 'delete', 'change_role'])
  operation: 'activate' | 'deactivate' | 'delete' | 'change_role';

  @ApiProperty({
    description: 'New role for change_role operation',
    enum: Role,
    required: false,
    example: Role.EDITOR,
  })
  @IsOptional()
  @IsEnum(Role)
  newRole?: Role;
}

export class UserInviteDto {
  @ApiProperty({
    description: 'Email address to invite',
    example: 'newuser@example.com',
  })
  @IsString()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: 'User role for the invite',
    enum: Role,
    example: Role.EDITOR,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Custom invitation message',
    required: false,
    example: 'Welcome to our CMS!',
  })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldPassword123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123!',
    minLength: 6,
  })
  @IsString()
  @Transform(({ value }) => value.toString().length >= 6 ? value : undefined)
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token from email',
    example: 'reset_token_123456789',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123!',
    minLength: 6,
  })
  @IsString()
  @Transform(({ value }) => value.toString().length >= 6 ? value : undefined)
  newPassword: string;
}