import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThemeSettingDto {
  @ApiProperty({
    example: '#3B82F6',
    description: 'Primary brand color in hex format',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    example: '#6B7280',
    description: 'Secondary color in hex format',
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({
    example: '#FFFFFF',
    description: 'Background color in hex format',
    required: false,
  })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({
    example: '#111827',
    description: 'Text color in hex format',
    required: false,
  })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiProperty({
    example: 'Inter, sans-serif',
    description: 'CSS font family',
    required: false,
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiProperty({
    example: 8,
    description: 'Border radius in pixels',
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  radius?: number;

  @ApiProperty({
    example: 1,
    description: 'Shadow level (0-5)',
    minimum: 0,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  shadowLevel?: number;

  @ApiProperty({
    example: 1200,
    description: 'Container max width in pixels',
    minimum: 800,
    maximum: 2000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(800)
  @Max(2000)
  containerMaxWidth?: number;

  @ApiProperty({
    example: 24,
    description: 'Grid gap in pixels',
    minimum: 8,
    maximum: 64,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(64)
  gridGap?: number;

  @ApiProperty({
    example: 'solid',
    description: 'Button style variant',
    enum: ['solid', 'outline', 'glass'],
    required: false,
  })
  @IsOptional()
  @IsString()
  buttonStyle?: string;

  @ApiProperty({
    example: 'default',
    description: 'Header variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  headerVariant?: string;

  @ApiProperty({
    example: 'default',
    description: 'Footer variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  footerVariant?: string;
}

export class ThemeSettingResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  tenantId: number;

  @ApiProperty({ example: '#3B82F6' })
  primaryColor: string;

  @ApiProperty({ example: '#6B7280' })
  secondaryColor: string;

  @ApiProperty({ example: '#FFFFFF' })
  backgroundColor: string;

  @ApiProperty({ example: '#111827' })
  textColor: string;

  @ApiProperty({ example: 'Inter, sans-serif' })
  fontFamily: string;

  @ApiProperty({ example: 8 })
  radius: number;

  @ApiProperty({ example: 1 })
  shadowLevel: number;

  @ApiProperty({ example: 1200 })
  containerMaxWidth: number;

  @ApiProperty({ example: 24 })
  gridGap: number;

  @ApiProperty({ example: 'solid' })
  buttonStyle: string;

  @ApiProperty({ example: 'default' })
  headerVariant: string;

  @ApiProperty({ example: 'default' })
  footerVariant: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}