import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUrl,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsIn,
  Min,
  Max,
  IsHexColor,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// =================== SOCIAL MEDIA LINK DTOs ===================

export class CreateSocialMediaLinkDto {
  @IsString()
  platform: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsInt()
  contactInfoId?: number;

  @IsOptional()
  @IsInt()
  teamMemberId?: number;
}

export class UpdateSocialMediaLinkDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}

// =================== MAP CONFIGURATION DTOs ===================

export class CreateMapConfigurationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(['google', 'openstreet', 'mapbox'])
  mapType?: string = 'google';

  @IsOptional()
  @IsEnum(['google', 'mapbox', 'openstreet'])
  provider?: string = 'google';

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  defaultZoom?: number = 15;

  @IsOptional()
  @IsBoolean()
  showMarkers?: boolean = true;

  @IsOptional()
  @IsBoolean()
  showInfoWindows?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableDirections?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableStreetView?: boolean = true;

  @IsOptional()
  @IsHexColor()
  markerColor?: string = '#FF0000';

  @IsOptional()
  @IsUrl()
  markerIcon?: string;

  @IsOptional()
  @IsString()
  width?: string = '100%';

  @IsOptional()
  @IsString()
  height?: string = '400px';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateMapConfigurationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['google', 'openstreet', 'mapbox'])
  mapType?: string;

  @IsOptional()
  @IsEnum(['google', 'mapbox', 'openstreet'])
  provider?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  defaultZoom?: number;

  @IsOptional()
  @IsBoolean()
  showMarkers?: boolean;

  @IsOptional()
  @IsBoolean()
  showInfoWindows?: boolean;

  @IsOptional()
  @IsBoolean()
  enableDirections?: boolean;

  @IsOptional()
  @IsBoolean()
  enableStreetView?: boolean;

  @IsOptional()
  @IsHexColor()
  markerColor?: string;

  @IsOptional()
  @IsUrl()
  markerIcon?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// =================== LOCATION CATEGORY DTOs ===================

export class LocationCategoryTranslationDto {
  @IsString()
  language: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateLocationCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationCategoryTranslationDto)
  translations?: LocationCategoryTranslationDto[];
}

export class UpdateLocationCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationCategoryTranslationDto)
  translations?: LocationCategoryTranslationDto[];
}

// =================== LOCATION ASSIGNMENT DTOs ===================

export class CreateLocationAssignmentDto {
  @IsInt()
  officeId: number;

  @IsOptional()
  @IsInt()
  mapConfigurationId?: number;

  @IsOptional()
  @IsInt()
  locationCategoryId?: number;

  @IsOptional()
  @IsUrl()
  customMarkerIcon?: string;

  @IsOptional()
  @IsHexColor()
  customMarkerColor?: string;

  @IsOptional()
  @IsBoolean()
  showInWidget?: boolean = true;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateLocationAssignmentDto {
  @IsOptional()
  @IsInt()
  mapConfigurationId?: number;

  @IsOptional()
  @IsInt()
  locationCategoryId?: number;

  @IsOptional()
  @IsUrl()
  customMarkerIcon?: string;

  @IsOptional()
  @IsHexColor()
  customMarkerColor?: string;

  @IsOptional()
  @IsBoolean()
  showInWidget?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}

// =================== SOCIAL MEDIA ANALYTICS DTOs ===================

export class CreateSocialMediaAnalyticsDto {
  @IsOptional()
  @IsInt()
  socialLinkId?: number;

  @IsString()
  platform: string;

  @IsString()
  @IsIn(['clicks', 'impressions', 'shares', 'followers', 'engagement'])
  metricType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  metricValue?: number = 0;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

// =================== SOCIAL MEDIA SHARING DTOs ===================

export class CreateSocialMediaShareDto {
  @IsString()
  @IsIn(['page', 'blog_post', 'service', 'team_member', 'reference'])
  entityType: string;

  @IsInt()
  entityId: number;

  @IsString()
  @IsIn(['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'instagram', 'pinterest'])
  platform: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}

// =================== QUERY DTOs ===================

export class SocialMediaQueryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  contactInfoId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  teamMemberId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'order';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class MapQueryDto {
  @IsOptional()
  @IsString()
  mapType?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class LocationQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mapConfigurationId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  showInWidget?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  metricType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  socialLinkId?: number;

  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  groupBy?: string = 'day';
}

export class ShareAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  entityId?: number;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  groupBy?: string = 'day';
}

// =================== OFFICE UPDATE DTOs ===================

export class UpdateOfficeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  mapUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}

// =================== PUBLIC API DTOs ===================

export class PublicMapConfigDto {
  @IsString()
  mapKey: string;

  @IsOptional()
  @IsString()
  language?: string = 'tr';
}

export class PublicSocialLinksDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean = true;
}