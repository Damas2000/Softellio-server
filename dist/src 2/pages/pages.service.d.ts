import { PrismaService } from '../config/prisma.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageWithTranslations } from '../common/types';
export declare class PagesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPageDto: CreatePageDto, tenantId: number): Promise<PageWithTranslations>;
    findAll(tenantId: number, options?: {
        status?: PageStatus;
        language?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        pages: PageWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: number, tenantId: number): Promise<PageWithTranslations>;
    findBySlug(slug: string, language: string, tenantId: number, includeUnpublished?: boolean): Promise<PageWithTranslations>;
    update(id: number, updatePageDto: UpdatePageDto, tenantId: number): Promise<PageWithTranslations>;
    remove(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    duplicate(id: number, tenantId: number): Promise<PageWithTranslations>;
    bulkDelete(ids: number[], tenantId: number): Promise<{
        deleted: number;
    }>;
    getPagesByLanguage(language: string, tenantId: number, published?: boolean): Promise<PageWithTranslations[]>;
}
