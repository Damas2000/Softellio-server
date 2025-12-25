import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsEnum, IsOptional, Matches } from 'class-validator';
import { DomainType } from '@prisma/client';

export class CreateDomainDto {
  @ApiProperty({
    description: 'Domain name without protocol or path',
    example: 'hamza.com',
    pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/, {
    message: 'Invalid domain format. Domain must be a valid domain name without protocol or path.'
  })
  domain: string;

  @ApiProperty({
    description: 'Domain type',
    enum: DomainType,
    example: DomainType.CUSTOM
  })
  @IsEnum(DomainType)
  type: DomainType;

  @ApiProperty({
    description: 'Whether this domain should be set as primary',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}