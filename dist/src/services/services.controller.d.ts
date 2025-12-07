import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(createServiceDto: CreateServiceDto, tenantId: number): Promise<import("./services.service").ServiceWithTranslations>;
    findAll(tenantId: number, query: ServiceQueryDto): Promise<{
        services: import("./services.service").ServiceWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getStats(tenantId: number): Promise<{
        total: number;
        active: number;
        featured: number;
        byLanguage: Record<string, number>;
    }>;
    getFeatured(tenantId: number): Promise<import("./services.service").ServiceWithTranslations[]>;
    findOne(id: number, tenantId: number): Promise<import("./services.service").ServiceWithTranslations>;
    update(id: number, updateServiceDto: UpdateServiceDto, tenantId: number): Promise<import("./services.service").ServiceWithTranslations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(body: {
        ids: number[];
    }, tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    reorder(body: {
        services: {
            id: number;
            order: number;
        }[];
    }, tenantId: number): Promise<void>;
    findPublic(language: string, tenantId: number, query: ServiceQueryDto): Promise<{
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
    getFeaturedPublic(language: string, tenantId: number): Promise<{
        services: {
            id: number;
            iconUrl: string;
            order: number;
            translation: {
                id: number;
                language: string;
                title: string;
                slug: string;
                shortDescription: string | null;
                contentJson: any;
                metaTitle: string | null;
                metaDescription: string | null;
            };
        }[];
    }>;
    findBySlug(language: string, slug: string, tenantId: number): Promise<import("./services.service").ServiceWithTranslations>;
    getSitemap(language: string, tenantId: number): Promise<{
        services: {
            slug: string;
            lastModified: Date;
            changeFreq: string;
            priority: number;
        }[];
    }>;
}
