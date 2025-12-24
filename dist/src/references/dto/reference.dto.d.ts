export declare class ReferenceTranslationDto {
    language: string;
    title: string;
    slug: string;
    description?: string;
    contentJson?: any;
    metaTitle?: string;
    metaDescription?: string;
}
export declare class ReferenceGalleryDto {
    imageUrl: string;
    caption?: string;
    order?: number;
}
export declare class CreateReferenceDto {
    imageUrl?: string;
    projectUrl?: string;
    clientName?: string;
    projectDate?: string;
    category?: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    translations: ReferenceTranslationDto[];
    gallery?: ReferenceGalleryDto[];
}
export declare class UpdateReferenceDto {
    imageUrl?: string;
    projectUrl?: string;
    clientName?: string;
    projectDate?: string;
    category?: string;
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    translations?: ReferenceTranslationDto[];
    gallery?: ReferenceGalleryDto[];
}
export declare class ReferenceQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    featured?: boolean;
    client?: string;
    year?: number;
    sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'projectDate' | 'title';
    sortOrder?: 'asc' | 'desc';
}
export declare class BulkReferenceDeleteDto {
    ids: number[];
}
export declare class ReferenceReorderDto {
    references: ReferenceOrderDto[];
}
export declare class ReferenceOrderDto {
    id: number;
    order: number;
}
