import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean, IsInt, IsEnum, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class PortalLoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class PortalUserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'admin@example.com' })
  email: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: Role;

  @ApiProperty({ description: 'Portal access enabled', example: true })
  portalAccess: boolean;

  @ApiProperty({ description: 'User is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Tenant ID if user belongs to a tenant', example: 1, required: false })
  tenantId?: number;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last account update date' })
  updatedAt: Date;
}

export class PortalLoginResponseDto {
  @ApiProperty({ description: 'Authentication token', example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ description: 'Token expiration timestamp' })
  expiresAt: Date;

  @ApiProperty({ type: PortalUserResponseDto })
  user: PortalUserResponseDto;
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User password', example: 'securePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, description: 'User role', example: Role.TENANT_ADMIN })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Enable portal access', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  portalAccess?: boolean;

  @ApiProperty({ description: 'User is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Tenant ID to associate user with', example: 1, required: false })
  @IsOptional()
  @IsInt()
  tenantId?: number;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User password', example: 'newSecurePassword123', required: false, minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: Role, description: 'User role', required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ description: 'Enable portal access', required: false })
  @IsOptional()
  @IsBoolean()
  portalAccess?: boolean;

  @ApiProperty({ description: 'User is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Tenant ID to associate user with', required: false })
  @IsOptional()
  @IsInt()
  tenantId?: number;
}