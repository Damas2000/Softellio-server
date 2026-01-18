import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: Role,
    example: Role.TENANT_ADMIN,
    description: 'User role',
  })
  @IsEnum(Role, { message: 'Role must be a valid role' })
  role: Role;

  @ApiProperty({
    example: 1,
    description: 'Tenant ID (required for non-super-admin users)',
    required: false,
  })
  @IsOptional()
  tenantId?: number;
}