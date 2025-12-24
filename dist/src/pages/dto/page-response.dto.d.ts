import { PageStatus } from './create-page.dto';
export declare class PageTranslationResponseDto {
    id: number;
    language: string;
    title: string;
    slug: string;
    contentJson?: any;
    metaTitle?: string;
    metaDescription?: string;
}
export declare class PageResponseDto {
    id: number;
    tenantId: number;
    status: PageStatus;
    createdAt: Date;
    updatedAt: Date;
    translations: PageTranslationResponseDto[];
}
export declare class PaginatedPageResponseDto {
    pages: PageResponseDto[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}
export declare class PageDeleteResponseDto {
    message: string;
}
export declare class BulkDeleteResponseDto {
    deleted: number;
}
