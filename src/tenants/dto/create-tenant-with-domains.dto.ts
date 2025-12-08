import { IsString, IsOptional, IsArray, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantWithDomainsDto {
  @ApiProperty({
    example: 'Reis İnşaat',
    description: 'Company name (will be used to generate slug and domains)',
  })
  @IsString()
  name: string;

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
    example: '#007bff',
    description: 'Primary color for the tenant',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    example: 'admin@reisinsaat.com',
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