import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDomainDto {
  @ApiProperty({
    example: false,
    description: 'Whether this domain should be set as the primary domain for the tenant',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean value' })
  isPrimary?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether this domain should be active',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}