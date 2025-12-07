import { IsString, IsOptional, IsArray, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Tenant name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'acme.example.com',
    description: 'Tenant domain',
  })
  @IsString()
  domain: string;

  @ApiProperty({
    example: 'tr',
    description: 'Default language code',
    default: 'tr',
  })
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiProperty({
    example: ['tr', 'en'],
    description: 'Array of available language codes',
    default: ['tr'],
  })
  @IsOptional()
  @IsArray()
  availableLanguages?: string[];

  @ApiProperty({
    example: 'default',
    description: 'Theme name',
    required: false,
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({
    example: '#007bff',
    description: 'Primary color for the tenant',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    example: 'admin@acme.com',
    description: 'Email for the tenant admin user',
  })
  @IsEmail({}, { message: 'Please provide a valid admin email address' })
  adminEmail: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password for the tenant admin user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Admin password must be at least 6 characters long' })
  adminPassword: string;

  @ApiProperty({
    example: 'Admin Name',
    description: 'Name for the tenant admin user',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminName?: string;
}