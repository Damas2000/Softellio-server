import { Request } from 'express';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { PageResponseDto, PaginatedPageResponseDto, PageDeleteResponseDto } from './dto/page-response.dto';
import { BulkDeleteDto, BulkDeleteResponseDto as CommonBulkDeleteResponseDto } from '../common/dto/bulk-delete.dto';
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
    bulkDelete(bulkDeleteDto: BulkDeleteDto, tenantId: number, req: Request): Promise<CommonBulkDeleteResponseDto>;
    bulkDeleteDeprecated(body: any): never;
    testBulkDeleteDeprecated(body: any): never;
    findBySlug(language: string, slug: string, tenantId: number): Promise<PageResponseDto>;
    findPublicPages(language: string, tenantId: number, query: PageQueryDto): Promise<PaginatedPageResponseDto>;
    previewBySlug(language: string, slug: string, tenantId: number): Promise<PageResponseDto>;
    debugBulkDelete(body: any, tenantId: number): Promise<{
        message: string;
        tenantId: number;
        bodyReceived: any;
        idsType: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        idsLength: any;
        idsFirstElement: string;
    }>;
}
