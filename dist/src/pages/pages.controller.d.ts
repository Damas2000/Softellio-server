import { PagesService } from './pages.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageWithTranslations } from '../common/types';
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    create(createPageDto: CreatePageDto, tenantId: number): Promise<PageWithTranslations>;
    findAllAdmin(tenantId: number, status?: PageStatus, language?: string, page?: number, limit?: number): Promise<{
        pages: PageWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOneAdmin(id: number, tenantId: number): Promise<PageWithTranslations>;
    update(id: number, updatePageDto: UpdatePageDto, tenantId: number): Promise<PageWithTranslations>;
    remove(id: number, tenantId: number): Promise<{
        message: string;
    }>;
    duplicate(id: number, tenantId: number): Promise<PageWithTranslations>;
    bulkDelete(body: {
        ids: number[];
    }, tenantId: number): Promise<{
        deleted: number;
    }>;
    findPublicPages(language: string, tenantId: number, page?: number, limit?: number): Promise<{
        pages: PageWithTranslations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findBySlug(language: string, slug: string, tenantId: number): Promise<PageWithTranslations>;
    getPagesByLanguage(language: string, tenantId: number): Promise<PageWithTranslations[]>;
    previewBySlug(language: string, slug: string, tenantId: number): Promise<PageWithTranslations>;
}
