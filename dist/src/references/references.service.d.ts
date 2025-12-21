import { PrismaService } from '../config/prisma.service';
import { CreateReferenceDto, UpdateReferenceDto, ReferenceQueryDto } from './dto/reference.dto';
import { Reference } from '@prisma/client';
export interface ReferenceWithRelations extends Reference {
    translations: {
        id: number;
        language: string;
        title: string;
        slug: string;
        description: string | null;
        contentJson: any;
        metaTitle: string | null;
        metaDescription: string | null;
    }[];
    gallery: {
        id: number;
        imageUrl: string;
        caption: string | null;
        order: number | null;
    }[];
}
export declare class ReferencesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createReferenceDto: CreateReferenceDto, tenantId: number): Promise<ReferenceWithRelations>;
    findAll(tenantId: number, query?: ReferenceQueryDto): Promise<{
        references: ReferenceWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: number, tenantId: number): Promise<ReferenceWithRelations>;
    findBySlug(slug: string, language: string, tenantId: number): Promise<ReferenceWithRelations | null>;
    findFeatured(tenantId: number): Promise<ReferenceWithRelations[]>;
    findByCategory(category: string, tenantId: number, language?: string): Promise<ReferenceWithRelations[]>;
    findPublicReferences(tenantId: number, language: string, query?: ReferenceQueryDto): Promise<{
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
    update(id: number, updateReferenceDto: UpdateReferenceDto, tenantId: number): Promise<ReferenceWithRelations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(ids: number[], tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    reorder(referenceUpdates: {
        id: number;
        order: number;
    }[], tenantId: number): Promise<void>;
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
}
