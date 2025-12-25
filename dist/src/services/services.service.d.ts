import { PrismaService } from '../config/prisma.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
import { Service } from '@prisma/client';
export interface ServiceWithTranslations extends Service {
    translations: {
        id: number;
        language: string;
        title: string;
        slug: string;
        shortDescription: string | null;
        contentJson: any;
        metaTitle: string | null;
        metaDescription: string | null;
    }[];
}
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createServiceDto: CreateServiceDto, tenantId: number): Promise<ServiceWithTranslations>;
    findAll(tenantId: number, query?: ServiceQueryDto): Promise<{
        services: ServiceWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: number, tenantId: number): Promise<ServiceWithTranslations>;
    findBySlug(slug: string, language: string, tenantId: number): Promise<ServiceWithTranslations | null>;
    findFeatured(tenantId: number): Promise<ServiceWithTranslations[]>;
    findPublicServices(tenantId: number, language: string, query?: ServiceQueryDto): Promise<{
        services: {
            id: number;
            iconUrl: string | null;
            order: number | null;
            isFeatured: boolean;
            translation: {
                title: string;
                slug: string;
                shortDescription: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            } | null;
        }[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    update(id: number, updateServiceDto: UpdateServiceDto, tenantId: number): Promise<ServiceWithTranslations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(ids: number[], tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    reorder(serviceUpdates: {
        id: number;
        order: number;
    }[], tenantId: number): Promise<void>;
    getStats(tenantId: number): Promise<{
        total: number;
        active: number;
        featured: number;
        byLanguage: Record<string, number>;
    }>;
}
