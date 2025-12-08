declare class CategoryTranslationDto {
    language: string;
    name: string;
    slug?: string;
}
export declare class CreateCategoryDto {
    parentId?: number;
    translations: CategoryTranslationDto[];
}
export { CategoryTranslationDto };
