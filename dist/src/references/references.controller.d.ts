import { ReferencesService } from './references.service';
import { CreateReferenceDto, UpdateReferenceDto, ReferenceQueryDto, ReferenceReorderDto } from './dto/reference.dto';
import { BulkDeleteDto } from '../common/dto/bulk-delete.dto';
export declare class ReferencesController {
    private readonly referencesService;
    constructor(referencesService: ReferencesService);
    create(createReferenceDto: CreateReferenceDto, tenantId: number): Promise<import("./references.service").ReferenceWithRelations>;
    findAll(tenantId: number, query: ReferenceQueryDto): Promise<{
        references: import("./references.service").ReferenceWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getStats(tenantId: number): Promise<{
        total: number;
        active: number;
        featured: number;
        byCategory: Record<string, number>;
        byYear: Record<string, number>;
        byLanguage: Record<string, number>;
    }>;
    getCategories(tenantId: number): Promise<string[]>;
    getYears(tenantId: number): Promise<number[]>;
    getFeatured(tenantId: number): Promise<import("./references.service").ReferenceWithRelations[]>;
    findOne(id: number, tenantId: number): Promise<import("./references.service").ReferenceWithRelations>;
    update(id: number, updateReferenceDto: UpdateReferenceDto, tenantId: number): Promise<import("./references.service").ReferenceWithRelations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(bulkDeleteDto: BulkDeleteDto, tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    bulkDeleteDeprecated(body: any): never;
    reorder(reorderDto: ReferenceReorderDto, tenantId: number): Promise<void>;
    findPublic(language: string, tenantId: number, query: ReferenceQueryDto): Promise<{
        references: {
            id: number;
            imageUrl: string | null;
            projectUrl: string | null;
            clientName: string | null;
            projectDate: Date | null;
            category: string | null;
            order: number | null;
            isFeatured: boolean;
            translation: {
                title: string;
                slug: string;
                description: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            } | null;
            gallery: {
                imageUrl: string;
                caption: string | null;
                order: number | null;
            }[];
        }[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getFeaturedPublic(language: string, tenantId: number): Promise<{
        references: {
            id: number;
            imageUrl: string;
            projectUrl: string;
            clientName: string;
            projectDate: Date;
            category: string;
            order: number;
            translation: {
                id: number;
                language: string;
                title: string;
                slug: string;
                description: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            };
            gallery: {
                id: number;
                imageUrl: string;
                caption: string | null;
                order: number | null;
            }[];
        }[];
    }>;
    getByCategory(language: string, category: string, tenantId: number, query: ReferenceQueryDto): Promise<{
        references: {
            id: number;
            imageUrl: string | null;
            projectUrl: string | null;
            clientName: string | null;
            projectDate: Date | null;
            category: string | null;
            order: number | null;
            isFeatured: boolean;
            translation: {
                title: string;
                slug: string;
                description: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            } | null;
            gallery: {
                imageUrl: string;
                caption: string | null;
                order: number | null;
            }[];
        }[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findBySlug(language: string, slug: string, tenantId: number): Promise<import("./references.service").ReferenceWithRelations>;
    getLatestShowcase(language: string, tenantId: number): Promise<{
        showcase: {
            id: number;
            imageUrl: string | null;
            projectUrl: string | null;
            clientName: string | null;
            projectDate: Date | null;
            category: string | null;
            order: number | null;
            isFeatured: boolean;
            translation: {
                title: string;
                slug: string;
                description: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            } | null;
            gallery: {
                imageUrl: string;
                caption: string | null;
                order: number | null;
            }[];
        }[];
        title: string;
        subtitle: string;
    }>;
    getFeaturedShowcase(language: string, tenantId: number): Promise<{
        showcase: {
            id: number;
            imageUrl: string | null;
            projectUrl: string | null;
            clientName: string | null;
            projectDate: Date | null;
            category: string | null;
            order: number | null;
            isFeatured: boolean;
            translation: {
                title: string;
                slug: string;
                description: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            } | null;
            gallery: {
                imageUrl: string;
                caption: string | null;
                order: number | null;
            }[];
        }[];
        title: string;
        subtitle: string;
    }>;
    getPortfolioGrid(language: string, tenantId: number, query: ReferenceQueryDto): Promise<{
        portfolio: {
            id: number;
            title: string;
            slug: string;
            imageUrl: string;
            category: string;
            clientName: string;
            projectDate: Date;
            isFeatured: boolean;
        }[];
        total: number;
        categories: string[];
        years: number[];
    }>;
    getSitemap(language: string, tenantId: number): Promise<{
        references: {
            slug: string;
            lastModified: Date;
            changeFreq: string;
            priority: number;
            category: string;
        }[];
    }>;
    getPublicStats(tenantId: number): Promise<{
        totalProjects: number;
        featuredProjects: number;
        categories: string[];
        projectYears: number[];
    }>;
}
