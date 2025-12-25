import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDomainDto {
  @ApiProperty({
    description: 'Whether this domain should be set as primary',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Whether this domain is active',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}