export declare class CreateSocialMediaLinkDto {
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
    contactInfoId?: number;
    teamMemberId?: number;
}
export declare class UpdateSocialMediaLinkDto {
    platform?: string;
    url?: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
}
export declare class CreateMapConfigurationDto {
    name: string;
    mapType?: string;
    provider?: string;
    apiKey?: string;
    style?: string;
    defaultZoom?: number;
    showMarkers?: boolean;
    showInfoWindows?: boolean;
    enableDirections?: boolean;
    enableStreetView?: boolean;
    markerColor?: string;
    markerIcon?: string;
    width?: string;
    height?: string;
    isActive?: boolean;
}
export declare class UpdateMapConfigurationDto {
    name?: string;
    mapType?: string;
    provider?: string;
    apiKey?: string;
    style?: string;
    defaultZoom?: number;
    showMarkers?: boolean;
    showInfoWindows?: boolean;
    enableDirections?: boolean;
    enableStreetView?: boolean;
    markerColor?: string;
    markerIcon?: string;
    width?: string;
    height?: string;
    isActive?: boolean;
}
export declare class LocationCategoryTranslationDto {
    language: string;
    name: string;
    description?: string;
}
export declare class CreateLocationCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    description?: string;
    isActive?: boolean;
    order?: number;
    translations?: LocationCategoryTranslationDto[];
}
export declare class UpdateLocationCategoryDto {
    name?: string;
    icon?: string;
    color?: string;
    description?: string;
    isActive?: boolean;
    order?: number;
    translations?: LocationCategoryTranslationDto[];
}
export declare class CreateLocationAssignmentDto {
    officeId: number;
    mapConfigurationId?: number;
    locationCategoryId?: number;
    customMarkerIcon?: string;
    customMarkerColor?: string;
    showInWidget?: boolean;
    order?: number;
}
export declare class UpdateLocationAssignmentDto {
    mapConfigurationId?: number;
    locationCategoryId?: number;
    customMarkerIcon?: string;
    customMarkerColor?: string;
    showInWidget?: boolean;
    order?: number;
}
export declare class CreateSocialMediaAnalyticsDto {
    socialLinkId?: number;
    platform: string;
    metricType: string;
    metricValue?: number;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class CreateSocialMediaShareDto {
    entityType: string;
    entityId: number;
    platform: string;
    url: string;
    title?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
}
export declare class SocialMediaQueryDto {
    platform?: string;
    isActive?: boolean;
    search?: string;
    contactInfoId?: number;
    teamMemberId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class MapQueryDto {
    mapType?: string;
    provider?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class LocationQueryDto {
    categoryId?: number;
    mapConfigurationId?: number;
    showInWidget?: boolean;
    search?: string;
}
export declare class AnalyticsQueryDto {
    platform?: string;
    metricType?: string;
    startDate?: string;
    endDate?: string;
    socialLinkId?: number;
    groupBy?: string;
}
export declare class ShareAnalyticsQueryDto {
    entityType?: string;
    entityId?: number;
    platform?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
}
export declare class UpdateOfficeDto {
    name?: string;
    email?: string;
    phone?: string;
    fax?: string;
    address?: string;
    mapUrl?: string;
    latitude?: number;
    longitude?: number;
    isPrimary?: boolean;
    isActive?: boolean;
    order?: number;
}
export declare class PublicMapConfigDto {
    mapKey: string;
    language?: string;
}
export declare class PublicSocialLinksDto {
    platform?: string;
    activeOnly?: boolean;
}
