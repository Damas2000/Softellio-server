import { PrismaService } from '../config/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { PageResponseDto, PaginatedPageResponseDto, PageDeleteResponseDto, BulkDeleteResponseDto } from './dto/page-response.dto';
export declare class PagesService {
    private prisma;
    constructor(prisma: PrismaService);
    private transformToResponseDto;
    private validateSlugFormat;
    private validateSlugUniqueness;
    private validateTranslations;
    create(createPageDto: CreatePageDto, tenantId: number): Promise<PageResponseDto>;
    findAll(tenantId: number, query: PageQueryDto): Promise<PaginatedPageResponseDto>;
    findOne(id: number, tenantId: number): Promise<PageResponseDto>;
    findBySlug(slug: string, language: string, tenantId: number, includeUnpublished?: boolean): Promise<PageResponseDto>;
    update(id: number, updatePageDto: UpdatePageDto, tenantId: number): Promise<PageResponseDto>;
    remove(id: number, tenantId: number): Promise<PageDeleteResponseDto>;
    duplicate(id: number, tenantId: number): Promise<PageResponseDto>;
    bulkDelete(ids: number[], tenantId: number): Promise<BulkDeleteResponseDto>;
    getPagesByLanguage(language: string, tenantId: number, published?: boolean): Promise<PageResponseDto[]>;
}
