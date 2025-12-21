"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const pages_service_1 = require("./pages.service");
const prisma_service_1 = require("../config/prisma.service");
const create_page_dto_1 = require("./dto/create-page.dto");
const mockPrismaService = {
    page: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
    },
    pageTranslation: {
        findFirst: jest.fn(),
        createMany: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
    },
    $transaction: jest.fn(),
};
const mockPage = {
    id: 1,
    tenantId: 5,
    status: 'draft',
    createdAt: new Date('2025-12-21T10:00:00.000Z'),
    updatedAt: new Date('2025-12-21T12:00:00.000Z'),
    translations: [
        {
            id: 1,
            language: 'tr',
            title: 'Test Sayfa',
            slug: 'test-sayfa',
            contentJson: { blocks: [] },
            metaTitle: 'Test Meta',
            metaDescription: 'Test açıklama',
        },
        {
            id: 2,
            language: 'en',
            title: 'Test Page',
            slug: 'test-page',
            contentJson: { blocks: [] },
            metaTitle: 'Test Meta EN',
            metaDescription: 'Test description',
        },
    ],
};
const mockCreatePageDto = {
    status: create_page_dto_1.PageStatus.DRAFT,
    translations: [
        {
            language: 'tr',
            title: 'Test Sayfa',
            slug: 'test-sayfa',
            contentJson: { blocks: [] },
            metaTitle: 'Test Meta',
            metaDescription: 'Test açıklama',
        },
    ],
};
describe('PagesService', () => {
    let service;
    let prismaService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                pages_service_1.PagesService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(pages_service_1.PagesService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a page with valid translations', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue(null);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                return callback({
                    page: {
                        create: jest.fn().mockResolvedValue({ id: 1, tenantId: 5, status: 'draft' }),
                    },
                    pageTranslation: {
                        createMany: jest.fn().mockResolvedValue({ count: 1 }),
                    },
                });
            });
            mockPrismaService.page.findUnique.mockResolvedValue(mockPage);
            const result = await service.create(mockCreatePageDto, 5);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.tenantId).toBe(5);
            expect(result.translations).toHaveLength(2);
            expect(mockPrismaService.pageTranslation.findFirst).toHaveBeenCalledWith({
                where: {
                    page: { tenantId: 5 },
                    language: 'tr',
                    slug: 'test-sayfa',
                },
            });
        });
        it('should throw BadRequestException for empty translations', async () => {
            const emptyDto = { ...mockCreatePageDto, translations: [] };
            await expect(service.create(emptyDto, 5)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw ConflictException for duplicate slug', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue({
                id: 999,
                pageId: 2,
                language: 'tr',
                slug: 'test-sayfa',
            });
            await expect(service.create(mockCreatePageDto, 5)).rejects.toThrow(common_1.ConflictException);
            await expect(service.create(mockCreatePageDto, 5)).rejects.toThrow("A page with slug 'test-sayfa' already exists in language 'tr'");
        });
        it('should throw BadRequestException for invalid slug format', async () => {
            const invalidSlugDto = {
                ...mockCreatePageDto,
                translations: [
                    {
                        ...mockCreatePageDto.translations[0],
                        slug: 'Invalid Slug With Spaces!',
                    },
                ],
            };
            await expect(service.create(invalidSlugDto, 5)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException for duplicate languages', async () => {
            const duplicateLanguageDto = {
                ...mockCreatePageDto,
                translations: [
                    { ...mockCreatePageDto.translations[0] },
                    { ...mockCreatePageDto.translations[0] },
                ],
            };
            await expect(service.create(duplicateLanguageDto, 5)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should enforce tenant isolation', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue(null);
            await service.create(mockCreatePageDto, 5);
            expect(mockPrismaService.pageTranslation.findFirst).toHaveBeenCalledWith({
                where: {
                    page: { tenantId: 5 },
                    language: 'tr',
                    slug: 'test-sayfa',
                },
            });
        });
    });
    describe('findAll', () => {
        const mockPaginatedResult = {
            pages: [mockPage],
            total: 1,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
        };
        it('should return paginated results', async () => {
            const query = { page: 1, limit: 10 };
            mockPrismaService.page.findMany.mockResolvedValue([mockPage]);
            mockPrismaService.page.count.mockResolvedValue(1);
            const result = await service.findAll(5, query);
            expect(result.pages).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.currentPage).toBe(1);
            expect(result.limit).toBe(10);
        });
        it('should filter by status', async () => {
            const query = { status: create_page_dto_1.PageStatus.PUBLISHED };
            mockPrismaService.page.findMany.mockResolvedValue([]);
            mockPrismaService.page.count.mockResolvedValue(0);
            await service.findAll(5, query);
            expect(mockPrismaService.page.findMany).toHaveBeenCalledWith({
                where: { tenantId: 5, status: 'published' },
                include: { translations: true },
                orderBy: { updatedAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
        it('should filter by language', async () => {
            const query = { language: 'tr' };
            mockPrismaService.page.findMany.mockResolvedValue([]);
            mockPrismaService.page.count.mockResolvedValue(0);
            await service.findAll(5, query);
            expect(mockPrismaService.page.findMany).toHaveBeenCalledWith({
                where: { tenantId: 5 },
                include: { translations: { where: { language: 'tr' } } },
                orderBy: { updatedAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
        it('should search in title and slug', async () => {
            const query = { search: 'test' };
            mockPrismaService.page.findMany.mockResolvedValue([]);
            mockPrismaService.page.count.mockResolvedValue(0);
            await service.findAll(5, query);
            expect(mockPrismaService.page.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 5,
                    translations: {
                        some: {
                            OR: [
                                { title: { contains: 'test', mode: 'insensitive' } },
                                { slug: { contains: 'test', mode: 'insensitive' } },
                            ],
                        },
                    },
                },
                include: { translations: true },
                orderBy: { updatedAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
        it('should handle date range filtering', async () => {
            const query = {
                createdAfter: '2025-01-01T00:00:00.000Z',
                createdBefore: '2025-12-31T23:59:59.999Z',
            };
            mockPrismaService.page.findMany.mockResolvedValue([]);
            mockPrismaService.page.count.mockResolvedValue(0);
            await service.findAll(5, query);
            expect(mockPrismaService.page.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 5,
                    createdAt: {
                        gte: new Date('2025-01-01T00:00:00.000Z'),
                        lte: new Date('2025-12-31T23:59:59.999Z'),
                    },
                },
                include: { translations: true },
                orderBy: { updatedAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
        it('should enforce tenant isolation', async () => {
            const query = {};
            mockPrismaService.page.findMany.mockResolvedValue([]);
            mockPrismaService.page.count.mockResolvedValue(0);
            await service.findAll(5, query);
            expect(mockPrismaService.page.findMany).toHaveBeenCalledWith({
                where: { tenantId: 5 },
                include: { translations: true },
                orderBy: { updatedAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
    });
    describe('findOne', () => {
        it('should return page by ID', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(mockPage);
            const result = await service.findOne(1, 5);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(mockPrismaService.page.findFirst).toHaveBeenCalledWith({
                where: { id: 1, tenantId: 5 },
                include: { translations: true },
            });
        });
        it('should throw NotFoundException for non-existent page', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(null);
            await expect(service.findOne(999, 5)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should enforce tenant isolation', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(null);
            await expect(service.findOne(1, 5)).rejects.toThrow(common_1.NotFoundException);
            expect(mockPrismaService.page.findFirst).toHaveBeenCalledWith({
                where: { id: 1, tenantId: 5 },
                include: { translations: true },
            });
        });
    });
    describe('findBySlug', () => {
        it('should find published page by slug', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue({
                page: mockPage,
            });
            const result = await service.findBySlug('test-sayfa', 'tr', 5, false);
            expect(result).toBeDefined();
            expect(mockPrismaService.pageTranslation.findFirst).toHaveBeenCalledWith({
                where: {
                    page: { tenantId: 5, status: 'published' },
                    language: 'tr',
                    slug: 'test-sayfa',
                },
                include: { page: { include: { translations: true } } },
            });
        });
        it('should include unpublished for admin preview', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue({
                page: mockPage,
            });
            await service.findBySlug('test-sayfa', 'tr', 5, true);
            expect(mockPrismaService.pageTranslation.findFirst).toHaveBeenCalledWith({
                where: {
                    page: { tenantId: 5 },
                    language: 'tr',
                    slug: 'test-sayfa',
                },
                include: { page: { include: { translations: true } } },
            });
        });
        it('should throw NotFoundException for non-existent slug', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue(null);
            await expect(service.findBySlug('non-existent', 'tr', 5, false)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should filter by language correctly', async () => {
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue({
                page: mockPage,
            });
            await service.findBySlug('test-page', 'en', 5, false);
            expect(mockPrismaService.pageTranslation.findFirst).toHaveBeenCalledWith({
                where: {
                    page: { tenantId: 5, status: 'published' },
                    language: 'en',
                    slug: 'test-page',
                },
                include: { page: { include: { translations: true } } },
            });
        });
    });
    describe('update', () => {
        const updateDto = {
            status: create_page_dto_1.PageStatus.PUBLISHED,
            translations: [
                {
                    language: 'tr',
                    title: 'Updated Title',
                    slug: 'updated-slug',
                    metaTitle: 'Updated Meta',
                },
            ],
        };
        it('should update page successfully', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(mockPage);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                return callback({
                    page: {
                        update: jest.fn().mockResolvedValue({ ...mockPage, status: 'published' }),
                        findUnique: jest.fn().mockResolvedValue({ ...mockPage, status: 'published' }),
                    },
                    pageTranslation: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        upsert: jest.fn().mockResolvedValue({}),
                    },
                });
            });
            const result = await service.update(1, updateDto, 5);
            expect(result).toBeDefined();
            expect(mockPrismaService.page.findFirst).toHaveBeenCalledWith({
                where: { id: 1, tenantId: 5 },
                include: { translations: true },
            });
        });
        it('should throw NotFoundException for non-existent page', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(null);
            await expect(service.update(999, updateDto, 5)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should validate slug conflicts during update', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(mockPage);
            const conflictDto = {
                translations: [
                    {
                        language: 'tr',
                        title: 'Title',
                        slug: 'existing-slug',
                    },
                ],
            };
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue({
                id: 999,
                pageId: 2,
                page: { id: 2 },
            });
            await expect(service.update(1, conflictDto, 5)).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('remove', () => {
        it('should delete page successfully', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(mockPage);
            mockPrismaService.page.delete.mockResolvedValue(mockPage);
            const result = await service.remove(1, 5);
            expect(result.message).toBe('Page deleted successfully');
            expect(mockPrismaService.page.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });
        it('should throw NotFoundException for non-existent page', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(null);
            await expect(service.remove(999, 5)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('bulkDelete', () => {
        it('should delete multiple pages', async () => {
            mockPrismaService.page.deleteMany.mockResolvedValue({ count: 2 });
            const result = await service.bulkDelete([1, 2], 5);
            expect(result.deleted).toBe(2);
            expect(mockPrismaService.page.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: [1, 2] }, tenantId: 5 },
            });
        });
        it('should enforce tenant isolation in bulk delete', async () => {
            mockPrismaService.page.deleteMany.mockResolvedValue({ count: 0 });
            await service.bulkDelete([1, 2], 5);
            expect(mockPrismaService.page.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: [1, 2] }, tenantId: 5 },
            });
        });
    });
    describe('duplicate', () => {
        it('should duplicate page with modified slugs', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(mockPage);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                return callback({
                    page: {
                        create: jest.fn().mockResolvedValue({ id: 2, tenantId: 5, status: 'draft' }),
                        findUnique: jest.fn().mockResolvedValue({
                            ...mockPage,
                            id: 2,
                            translations: [
                                { ...mockPage.translations[0], id: 3, pageId: 2, slug: 'test-sayfa-copy' },
                                { ...mockPage.translations[1], id: 4, pageId: 2, slug: 'test-page-copy' },
                            ],
                        }),
                    },
                    pageTranslation: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue({}),
                    },
                });
            });
            const result = await service.duplicate(1, 5);
            expect(result).toBeDefined();
            expect(result.id).toBe(2);
        });
        it('should throw NotFoundException for non-existent page', async () => {
            mockPrismaService.page.findFirst.mockResolvedValue(null);
            await expect(service.duplicate(999, 5)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('validation methods', () => {
        it('should validate slug format correctly', async () => {
            const invalidSlugs = [
                'Invalid Slug',
                'invalid_slug',
                'INVALID-SLUG',
                'invalid--slug',
                '-invalid',
                'invalid-',
                'a'.repeat(101),
            ];
            for (const slug of invalidSlugs) {
                const dto = {
                    ...mockCreatePageDto,
                    translations: [{ ...mockCreatePageDto.translations[0], slug }],
                };
                await expect(service.create(dto, 5)).rejects.toThrow(common_1.BadRequestException);
            }
        });
        it('should accept valid slug formats', async () => {
            const validSlugs = ['valid-slug', 'valid123', 'test-page-2025', 'a'];
            mockPrismaService.pageTranslation.findFirst.mockResolvedValue(null);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                return callback({
                    page: { create: jest.fn().mockResolvedValue({ id: 1 }) },
                    pageTranslation: { createMany: jest.fn() },
                });
            });
            mockPrismaService.page.findUnique.mockResolvedValue(mockPage);
            for (const slug of validSlugs) {
                const dto = {
                    ...mockCreatePageDto,
                    translations: [{ ...mockCreatePageDto.translations[0], slug }],
                };
                await expect(service.create(dto, 5)).resolves.toBeDefined();
                jest.clearAllMocks();
                mockPrismaService.pageTranslation.findFirst.mockResolvedValue(null);
            }
        });
    });
});
//# sourceMappingURL=pages.service.spec.js.map