import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export class UploadMediaDto {
  @ApiProperty({
    example: 'My uploaded image',
    description: 'Custom filename for the uploaded media',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    enum: MediaType,
    example: MediaType.IMAGE,
    description: 'Type of media being uploaded',
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiProperty({
    example: 'blog-images',
    description: 'Folder/category to organize media',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}