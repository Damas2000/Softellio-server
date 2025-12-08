export declare class ServiceTranslationDto {
    language: string;
    title: string;
    slug: string;
    shortDescription?: string;
    contentJson?: any;
    metaTitle?: string;
    metaDescription?: string;
}
export declare class CreateServiceDto {
    iconUrl?: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    translations: ServiceTranslationDto[];
}
export declare class UpdateServiceDto {
    iconUrl?: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    translations?: ServiceTranslationDto[];
}
export declare class ServiceQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
    sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}
