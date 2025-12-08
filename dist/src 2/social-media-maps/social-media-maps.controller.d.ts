import { SocialMediaMapsService } from './social-media-maps.service';
import { CreateSocialMediaLinkDto, UpdateSocialMediaLinkDto, CreateMapConfigurationDto, UpdateMapConfigurationDto, CreateLocationCategoryDto, UpdateLocationCategoryDto, CreateLocationAssignmentDto, UpdateLocationAssignmentDto, CreateSocialMediaAnalyticsDto, CreateSocialMediaShareDto, SocialMediaQueryDto, MapQueryDto, LocationQueryDto, AnalyticsQueryDto, ShareAnalyticsQueryDto, UpdateOfficeDto, PublicSocialLinksDto } from './dto/social-media-maps.dto';
export declare class SocialMediaMapsController {
    private readonly socialMediaMapsService;
    constructor(socialMediaMapsService: SocialMediaMapsService);
    getPublicSocialLinks(tenantId: number, query: PublicSocialLinksDto): Promise<{
        success: boolean;
        data: {
            id: number;
            order: number;
            url: string;
            platform: string;
            icon: string;
        }[];
    }>;
    getPublicMapConfiguration(mapKey: string, tenantId: number, language?: string): Promise<{
        success: boolean;
        data: {
            locationAssignments: ({
                office: {
                    email: string;
                    id: number;
                    name: string;
                    phone: string;
                    address: string;
                    latitude: number;
                    longitude: number;
                };
                locationCategory: {
                    translations: {
                        description: string | null;
                        id: number;
                        name: string;
                        language: string;
                        locationCategoryId: number;
                    }[];
                } & {
                    description: string | null;
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    order: number | null;
                    icon: string | null;
                    color: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            style: string | null;
            width: string | null;
            height: string | null;
            mapType: string;
            provider: string;
            defaultZoom: number;
            showMarkers: boolean;
            showInfoWindows: boolean;
            enableDirections: boolean;
            enableStreetView: boolean;
            markerColor: string | null;
            markerIcon: string | null;
        };
    }>;
    trackSocialClick(linkId: number, ipAddress: string, userAgent: string, referrer?: string): Promise<{
        success: boolean;
    }>;
    trackSocialShare(createDto: CreateSocialMediaShareDto, tenantId: number, ipAddress: string, userAgent: string, referrer?: string): Promise<{
        success: boolean;
        data: {
            title: string | null;
            id: number;
            tenantId: number;
            url: string;
            platform: string;
            ipAddress: string | null;
            userAgent: string | null;
            entityType: string;
            entityId: number;
            referrer: string | null;
            sharedAt: Date;
        };
    }>;
    getAllSocialMediaLinks(tenantId: number, query: SocialMediaQueryDto): Promise<{
        data: ({
            teamMember: {
                id: number;
                translations: {
                    name: string;
                    position: string;
                }[];
            };
            contactInfo: {
                id: number;
                logo: string;
            };
            analytics: {
                metricType: string;
                metricValue: number;
            }[];
        } & {
            id: number;
            tenantId: number;
            isActive: boolean;
            order: number | null;
            url: string;
            platform: string;
            icon: string | null;
            contactInfoId: number | null;
            teamMemberId: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        success: boolean;
    }>;
    getSocialMediaLinkById(id: number, tenantId: number): Promise<{
        success: boolean;
        data: {
            teamMember: {
                email: string | null;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number | null;
                phone: string | null;
                imageUrl: string | null;
            };
            contactInfo: {
                id: number;
                tenantId: number;
                createdAt: Date;
                updatedAt: Date;
                logo: string | null;
                favicon: string | null;
            };
            analytics: {
                id: number;
                tenantId: number;
                platform: string;
                ipAddress: string | null;
                userAgent: string | null;
                socialLinkId: number | null;
                metricType: string;
                metricValue: number;
                referrer: string | null;
                date: Date;
            }[];
        } & {
            id: number;
            tenantId: number;
            isActive: boolean;
            order: number | null;
            url: string;
            platform: string;
            icon: string | null;
            contactInfoId: number | null;
            teamMemberId: number | null;
        };
    }>;
    createSocialMediaLink(createDto: CreateSocialMediaLinkDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            teamMember: {
                email: string | null;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number | null;
                phone: string | null;
                imageUrl: string | null;
            };
            contactInfo: {
                id: number;
                tenantId: number;
                createdAt: Date;
                updatedAt: Date;
                logo: string | null;
                favicon: string | null;
            };
        } & {
            id: number;
            tenantId: number;
            isActive: boolean;
            order: number | null;
            url: string;
            platform: string;
            icon: string | null;
            contactInfoId: number | null;
            teamMemberId: number | null;
        };
    }>;
    updateSocialMediaLink(id: number, updateDto: UpdateSocialMediaLinkDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            teamMember: {
                email: string | null;
                id: number;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number | null;
                phone: string | null;
                imageUrl: string | null;
            };
            contactInfo: {
                id: number;
                tenantId: number;
                createdAt: Date;
                updatedAt: Date;
                logo: string | null;
                favicon: string | null;
            };
        } & {
            id: number;
            tenantId: number;
            isActive: boolean;
            order: number | null;
            url: string;
            platform: string;
            icon: string | null;
            contactInfoId: number | null;
            teamMemberId: number | null;
        };
    }>;
    deleteSocialMediaLink(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllMapConfigurations(tenantId: number, query: MapQueryDto): Promise<{
        data: ({
            locationAssignments: ({
                office: {
                    id: number;
                    name: string;
                    address: string;
                    latitude: number;
                    longitude: number;
                    isPrimary: boolean;
                };
                locationCategory: {
                    id: number;
                    name: string;
                    icon: string;
                    color: string;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            style: string | null;
            width: string | null;
            height: string | null;
            mapType: string;
            provider: string;
            apiKey: string | null;
            defaultZoom: number;
            showMarkers: boolean;
            showInfoWindows: boolean;
            enableDirections: boolean;
            enableStreetView: boolean;
            markerColor: string | null;
            markerIcon: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        success: boolean;
    }>;
    getMapConfigurationById(id: number, tenantId: number): Promise<{
        success: boolean;
        data: {
            locationAssignments: ({
                office: {
                    email: string | null;
                    id: number;
                    name: string;
                    isActive: boolean;
                    order: number | null;
                    phone: string | null;
                    fax: string | null;
                    address: string | null;
                    mapUrl: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    isPrimary: boolean;
                    contactInfoId: number;
                };
                locationCategory: {
                    translations: {
                        description: string | null;
                        id: number;
                        name: string;
                        language: string;
                        locationCategoryId: number;
                    }[];
                } & {
                    description: string | null;
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    order: number | null;
                    icon: string | null;
                    color: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            style: string | null;
            width: string | null;
            height: string | null;
            mapType: string;
            provider: string;
            apiKey: string | null;
            defaultZoom: number;
            showMarkers: boolean;
            showInfoWindows: boolean;
            enableDirections: boolean;
            enableStreetView: boolean;
            markerColor: string | null;
            markerIcon: string | null;
        };
    }>;
    createMapConfiguration(createDto: CreateMapConfigurationDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            locationAssignments: ({
                office: {
                    email: string | null;
                    id: number;
                    name: string;
                    isActive: boolean;
                    order: number | null;
                    phone: string | null;
                    fax: string | null;
                    address: string | null;
                    mapUrl: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    isPrimary: boolean;
                    contactInfoId: number;
                };
                locationCategory: {
                    description: string | null;
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    order: number | null;
                    icon: string | null;
                    color: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            style: string | null;
            width: string | null;
            height: string | null;
            mapType: string;
            provider: string;
            apiKey: string | null;
            defaultZoom: number;
            showMarkers: boolean;
            showInfoWindows: boolean;
            enableDirections: boolean;
            enableStreetView: boolean;
            markerColor: string | null;
            markerIcon: string | null;
        };
    }>;
    updateMapConfiguration(id: number, updateDto: UpdateMapConfigurationDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            locationAssignments: ({
                office: {
                    email: string | null;
                    id: number;
                    name: string;
                    isActive: boolean;
                    order: number | null;
                    phone: string | null;
                    fax: string | null;
                    address: string | null;
                    mapUrl: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    isPrimary: boolean;
                    contactInfoId: number;
                };
                locationCategory: {
                    description: string | null;
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    order: number | null;
                    icon: string | null;
                    color: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            style: string | null;
            width: string | null;
            height: string | null;
            mapType: string;
            provider: string;
            apiKey: string | null;
            defaultZoom: number;
            showMarkers: boolean;
            showInfoWindows: boolean;
            enableDirections: boolean;
            enableStreetView: boolean;
            markerColor: string | null;
            markerIcon: string | null;
        };
    }>;
    deleteMapConfiguration(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllLocationCategories(tenantId: number): Promise<{
        success: boolean;
        data: ({
            translations: {
                description: string | null;
                id: number;
                name: string;
                language: string;
                locationCategoryId: number;
            }[];
            locationAssignments: ({
                office: {
                    id: number;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number | null;
            icon: string | null;
            color: string | null;
        })[];
    }>;
    getLocationCategoryById(id: number, tenantId: number): Promise<{
        success: boolean;
        data: {
            translations: {
                description: string | null;
                id: number;
                name: string;
                language: string;
                locationCategoryId: number;
            }[];
            locationAssignments: ({
                office: {
                    email: string | null;
                    id: number;
                    name: string;
                    isActive: boolean;
                    order: number | null;
                    phone: string | null;
                    fax: string | null;
                    address: string | null;
                    mapUrl: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    isPrimary: boolean;
                    contactInfoId: number;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number | null;
            icon: string | null;
            color: string | null;
        };
    }>;
    createLocationCategory(createDto: CreateLocationCategoryDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            translations: {
                description: string | null;
                id: number;
                name: string;
                language: string;
                locationCategoryId: number;
            }[];
        } & {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number | null;
            icon: string | null;
            color: string | null;
        };
    }>;
    updateLocationCategory(id: number, updateDto: UpdateLocationCategoryDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            translations: {
                description: string | null;
                id: number;
                name: string;
                language: string;
                locationCategoryId: number;
            }[];
        } & {
            description: string | null;
            id: number;
            name: string;
            tenantId: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number | null;
            icon: string | null;
            color: string | null;
        };
    }>;
    deleteLocationCategory(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getLocationAssignments(tenantId: number, query: LocationQueryDto): Promise<{
        success: boolean;
        data: ({
            office: {
                contactInfo: {
                    id: number;
                };
            } & {
                email: string | null;
                id: number;
                name: string;
                isActive: boolean;
                order: number | null;
                phone: string | null;
                fax: string | null;
                address: string | null;
                mapUrl: string | null;
                latitude: number | null;
                longitude: number | null;
                isPrimary: boolean;
                contactInfoId: number;
            };
            mapConfiguration: {
                id: number;
                name: string;
            };
            locationCategory: {
                id: number;
                name: string;
                icon: string;
                color: string;
            };
        } & {
            id: number;
            createdAt: Date;
            order: number | null;
            officeId: number;
            mapConfigurationId: number | null;
            locationCategoryId: number | null;
            customMarkerIcon: string | null;
            customMarkerColor: string | null;
            showInWidget: boolean;
        })[];
    }>;
    createLocationAssignment(createDto: CreateLocationAssignmentDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            office: {
                email: string | null;
                id: number;
                name: string;
                isActive: boolean;
                order: number | null;
                phone: string | null;
                fax: string | null;
                address: string | null;
                mapUrl: string | null;
                latitude: number | null;
                longitude: number | null;
                isPrimary: boolean;
                contactInfoId: number;
            };
            mapConfiguration: {
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                style: string | null;
                width: string | null;
                height: string | null;
                mapType: string;
                provider: string;
                apiKey: string | null;
                defaultZoom: number;
                showMarkers: boolean;
                showInfoWindows: boolean;
                enableDirections: boolean;
                enableStreetView: boolean;
                markerColor: string | null;
                markerIcon: string | null;
            };
            locationCategory: {
                description: string | null;
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number | null;
                icon: string | null;
                color: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            order: number | null;
            officeId: number;
            mapConfigurationId: number | null;
            locationCategoryId: number | null;
            customMarkerIcon: string | null;
            customMarkerColor: string | null;
            showInWidget: boolean;
        };
    }>;
    updateLocationAssignment(id: number, updateDto: UpdateLocationAssignmentDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            office: {
                email: string | null;
                id: number;
                name: string;
                isActive: boolean;
                order: number | null;
                phone: string | null;
                fax: string | null;
                address: string | null;
                mapUrl: string | null;
                latitude: number | null;
                longitude: number | null;
                isPrimary: boolean;
                contactInfoId: number;
            };
            mapConfiguration: {
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                style: string | null;
                width: string | null;
                height: string | null;
                mapType: string;
                provider: string;
                apiKey: string | null;
                defaultZoom: number;
                showMarkers: boolean;
                showInfoWindows: boolean;
                enableDirections: boolean;
                enableStreetView: boolean;
                markerColor: string | null;
                markerIcon: string | null;
            };
            locationCategory: {
                description: string | null;
                id: number;
                name: string;
                tenantId: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number | null;
                icon: string | null;
                color: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            order: number | null;
            officeId: number;
            mapConfigurationId: number | null;
            locationCategoryId: number | null;
            customMarkerIcon: string | null;
            customMarkerColor: string | null;
            showInWidget: boolean;
        };
    }>;
    deleteLocationAssignment(id: number, tenantId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateOffice(id: number, updateDto: UpdateOfficeDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            locationAssignments: ({
                mapConfiguration: {
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    style: string | null;
                    width: string | null;
                    height: string | null;
                    mapType: string;
                    provider: string;
                    apiKey: string | null;
                    defaultZoom: number;
                    showMarkers: boolean;
                    showInfoWindows: boolean;
                    enableDirections: boolean;
                    enableStreetView: boolean;
                    markerColor: string | null;
                    markerIcon: string | null;
                };
                locationCategory: {
                    description: string | null;
                    id: number;
                    name: string;
                    tenantId: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    order: number | null;
                    icon: string | null;
                    color: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                order: number | null;
                officeId: number;
                mapConfigurationId: number | null;
                locationCategoryId: number | null;
                customMarkerIcon: string | null;
                customMarkerColor: string | null;
                showInWidget: boolean;
            })[];
        } & {
            email: string | null;
            id: number;
            name: string;
            isActive: boolean;
            order: number | null;
            phone: string | null;
            fax: string | null;
            address: string | null;
            mapUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            isPrimary: boolean;
            contactInfoId: number;
        };
    }>;
    recordSocialMediaAnalytics(createDto: CreateSocialMediaAnalyticsDto, tenantId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            tenantId: number;
            platform: string;
            ipAddress: string | null;
            userAgent: string | null;
            socialLinkId: number | null;
            metricType: string;
            metricValue: number;
            referrer: string | null;
            date: Date;
        };
    }>;
    getSocialMediaAnalytics(tenantId: number, query: AnalyticsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    getSocialMediaShares(tenantId: number, query: ShareAnalyticsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    getSupportedPlatforms(): Promise<{
        success: boolean;
        data: {
            value: string;
            label: string;
            icon: string;
            color: string;
        }[];
    }>;
    getSupportedMapProviders(): Promise<{
        success: boolean;
        data: {
            value: string;
            label: string;
            features: string[];
            requiresApiKey: boolean;
        }[];
    }>;
}
