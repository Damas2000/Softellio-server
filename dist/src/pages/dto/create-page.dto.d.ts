declare enum PageStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
declare class PageTranslationDto {
    language: string;
    title: string;
    slug: string;
    contentJson?: any;
    metaTitle?: string;
    metaDescription?: string;
}
export declare class CreatePageDto {
    status?: PageStatus;
    translations: PageTranslationDto[];
}
export { PageStatus, PageTranslationDto };
