declare class PostTranslationDto {
    language: string;
    title: string;
    slug: string;
    summary?: string;
    contentJson?: any;
    metaTitle?: string;
    metaDescription?: string;
}
export declare class CreatePostDto {
    categoryId?: number;
    authorId?: number;
    isPublished?: boolean;
    publishedAt?: Date;
    translations: PostTranslationDto[];
}
export { PostTranslationDto };
