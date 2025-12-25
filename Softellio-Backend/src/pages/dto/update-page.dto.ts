import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePageDto, PageTranslationDto, PageStatus } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiProperty({
    description: 'Page status to update to',
    enum: PageStatus,
    required: false,
    example: PageStatus.PUBLISHED,
  })
  @IsOptional()
  status?: PageStatus;

  @ApiProperty({
    type: [PageTranslationDto],
    description: 'Page translations to update or add (if provided, must have at least one translation)',
    required: false,
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, {
    message: 'If translations are provided, at least one translation is required'
  })
  @ValidateNested({ each: true })
  @Type(() => PageTranslationDto)
  translations?: PageTranslationDto[];
}