import { Request } from 'express';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { PageResponseDto, PaginatedPageResponseDto, PageDeleteResponseDto, BulkDeleteResponseDto } from './dto/page-response.dto';
import { BulkPageDeleteDto } from './dto/bulk-page-operation.dto';
export declare class PagesController {
    private readonly pagesService;
    private readonly logger;
    constructor(pagesService: PagesService);
    create(createPageDto: CreatePageDto, tenantId: number, req: Request): Promise<PageResponseDto>;
    findAllAdmin(tenantId: number, query: PageQueryDto, req: Request): Promise<PaginatedPageResponseDto>;
    findOneAdmin(id: number, tenantId: number, req: Request): Promise<PageResponseDto>;
    update(id: number, updatePageDto: UpdatePageDto, tenantId: number, req: Request): Promise<PageResponseDto>;
    remove(id: number, tenantId: number, req: Request): Promise<PageDeleteResponseDto>;
    duplicate(id: number, tenantId: number, req: Request): Promise<PageResponseDto>;
    bulkDelete(bulkDeleteDto: BulkPageDeleteDto, tenantId: number, req: Request): Promise<BulkDeleteResponseDto>;
    findPublicPages(language: string, tenantId: number, query: PageQueryDto): Promise<PaginatedPageResponseDto>;
    findBySlug(language: string, slug: string, tenantId: number): Promise<PageResponseDto>;
    getPagesByLanguage(language: string, tenantId: number): Promise<PageResponseDto[]>;
    previewBySlug(language: string, slug: string, tenantId: number): Promise<PageResponseDto>;
}
