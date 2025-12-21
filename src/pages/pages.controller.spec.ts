import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { BulkPageDeleteDto } from './dto/bulk-page-operation.dto';

const mockPagesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  duplicate: jest.fn(),
  bulkDelete: jest.fn(),
  getPagesByLanguage: jest.fn(),
};

const mockPageResponse = {
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
  ],
};

const mockPaginatedResponse = {
  pages: [mockPageResponse],
  total: 1,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
};

const mockCreatePageDto: CreatePageDto = {
  status: PageStatus.DRAFT,
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

const mockRequest = {
  headers: {
    'x-correlation-id': 'test-correlation-123',
  },
} as any;

describe('PagesController', () => {
  let controller: PagesController;
  let pagesService: PagesService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesController],
      providers: [
        {
          provide: PagesService,
          useValue: mockPagesService,
        },
      ],
    }).compile();

    controller = module.get<PagesController>(PagesController);
    pagesService = module.get<PagesService>(PagesService);

    // Mock logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new page successfully', async () => {
      mockPagesService.create.mockResolvedValue(mockPageResponse);

      const result = await controller.create(mockCreatePageDto, 5, mockRequest);

      expect(result).toEqual(mockPageResponse);
      expect(pagesService.create).toHaveBeenCalledWith(mockCreatePageDto, 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Creating page for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          tenantId: 5,
          translationsCount: 1,
          languages: ['tr'],
        })
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Page created successfully with ID 1',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageId: 1,
          tenantId: 5,
        })
      );
    });

    it('should handle creation errors with proper logging', async () => {
      const error = new Error('Validation failed');
      mockPagesService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreatePageDto, 5, mockRequest)).rejects.toThrow('Validation failed');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to create page for tenant 5: Validation failed',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          tenantId: 5,
          error: 'Validation failed',
        })
      );
    });

    it('should generate correlation ID when not provided', async () => {
      const requestWithoutCorrelation = { headers: {} } as any;
      mockPagesService.create.mockResolvedValue(mockPageResponse);

      await controller.create(mockCreatePageDto, 5, requestWithoutCorrelation);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating page for tenant 5'),
        expect.objectContaining({
          correlationId: expect.stringMatching(/^page-create-\d+$/),
        })
      );
    });
  });

  describe('findAllAdmin', () => {
    const mockQuery: PageQueryDto = {
      page: 1,
      limit: 10,
      status: PageStatus.PUBLISHED,
      language: 'tr',
    };

    it('should return paginated pages successfully', async () => {
      mockPagesService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAllAdmin(5, mockQuery, mockRequest);

      expect(result).toEqual(mockPaginatedResponse);
      expect(pagesService.findAll).toHaveBeenCalledWith(5, mockQuery);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Fetching pages for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          tenantId: 5,
          filters: {
            status: 'published',
            language: 'tr',
            search: undefined,
            createdAfter: undefined,
            createdBefore: undefined,
          },
          pagination: { page: 1, limit: 10 },
        })
      );
    });

    it('should handle empty query parameters', async () => {
      const emptyQuery: PageQueryDto = {};
      mockPagesService.findAll.mockResolvedValue(mockPaginatedResponse);

      await controller.findAllAdmin(5, emptyQuery, mockRequest);

      expect(pagesService.findAll).toHaveBeenCalledWith(5, emptyQuery);
    });

    it('should handle service errors with proper logging', async () => {
      const error = new Error('Database connection failed');
      mockPagesService.findAll.mockRejectedValue(error);

      await expect(controller.findAllAdmin(5, mockQuery, mockRequest)).rejects.toThrow('Database connection failed');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to fetch pages for tenant 5: Database connection failed',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          tenantId: 5,
        })
      );
    });
  });

  describe('findOneAdmin', () => {
    it('should return a single page successfully', async () => {
      mockPagesService.findOne.mockResolvedValue(mockPageResponse);

      const result = await controller.findOneAdmin(1, 5, mockRequest);

      expect(result).toEqual(mockPageResponse);
      expect(pagesService.findOne).toHaveBeenCalledWith(1, 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Fetching page 1 for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageId: 1,
          tenantId: 5,
        })
      );
    });

    it('should handle not found errors', async () => {
      const error = new Error('Page not found');
      mockPagesService.findOne.mockRejectedValue(error);

      await expect(controller.findOneAdmin(999, 5, mockRequest)).rejects.toThrow('Page not found');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to fetch page 999 for tenant 5: Page not found',
        expect.objectContaining({
          pageId: 999,
          tenantId: 5,
        })
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdatePageDto = {
      status: PageStatus.PUBLISHED,
      translations: [
        {
          language: 'tr',
          title: 'Updated Title',
          slug: 'updated-slug',
        },
      ],
    };

    it('should update page successfully', async () => {
      const updatedPage = { ...mockPageResponse, status: 'published' };
      mockPagesService.update.mockResolvedValue(updatedPage);

      const result = await controller.update(1, updateDto, 5, mockRequest);

      expect(result).toEqual(updatedPage);
      expect(pagesService.update).toHaveBeenCalledWith(1, updateDto, 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Updating page 1 for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageId: 1,
          tenantId: 5,
          updates: {
            status: 'published',
            translationsProvided: true,
            translationsCount: 1,
          },
        })
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { status: PageStatus.ARCHIVED };
      mockPagesService.update.mockResolvedValue(mockPageResponse);

      await controller.update(1, partialUpdate, 5, mockRequest);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Updating page 1 for tenant 5',
        expect.objectContaining({
          updates: {
            status: 'archived',
            translationsProvided: false,
            translationsCount: 0,
          },
        })
      );
    });

    it('should handle update errors with proper logging', async () => {
      const error = new Error('Slug conflict');
      mockPagesService.update.mockRejectedValue(error);

      await expect(controller.update(1, updateDto, 5, mockRequest)).rejects.toThrow('Slug conflict');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to update page 1 for tenant 5: Slug conflict',
        expect.objectContaining({
          pageId: 1,
          tenantId: 5,
        })
      );
    });
  });

  describe('remove', () => {
    const deleteResponse = { message: 'Page deleted successfully' };

    it('should delete page successfully', async () => {
      mockPagesService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(1, 5, mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(pagesService.remove).toHaveBeenCalledWith(1, 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Deleting page 1 for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageId: 1,
          tenantId: 5,
        })
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Page 1 deleted successfully for tenant 5',
        expect.objectContaining({
          pageId: 1,
          tenantId: 5,
        })
      );
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Page not found');
      mockPagesService.remove.mockRejectedValue(error);

      await expect(controller.remove(999, 5, mockRequest)).rejects.toThrow('Page not found');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to delete page 999 for tenant 5: Page not found',
        expect.objectContaining({
          pageId: 999,
          tenantId: 5,
        })
      );
    });
  });

  describe('duplicate', () => {
    it('should duplicate page successfully', async () => {
      const duplicatedPage = { ...mockPageResponse, id: 2 };
      mockPagesService.duplicate.mockResolvedValue(duplicatedPage);

      const result = await controller.duplicate(1, 5, mockRequest);

      expect(result).toEqual(duplicatedPage);
      expect(pagesService.duplicate).toHaveBeenCalledWith(1, 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Page 1 duplicated successfully for tenant 5, new ID: 2',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          originalPageId: 1,
          newPageId: 2,
          tenantId: 5,
        })
      );
    });

    it('should handle duplication errors', async () => {
      const error = new Error('Original page not found');
      mockPagesService.duplicate.mockRejectedValue(error);

      await expect(controller.duplicate(999, 5, mockRequest)).rejects.toThrow('Original page not found');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to duplicate page 999 for tenant 5: Original page not found',
        expect.objectContaining({
          pageId: 999,
          tenantId: 5,
        })
      );
    });
  });

  describe('bulkDelete', () => {
    const bulkDeleteDto: BulkPageDeleteDto = { ids: [1, 2, 3] };
    const bulkDeleteResponse = { deleted: 3 };

    it('should bulk delete pages successfully', async () => {
      mockPagesService.bulkDelete.mockResolvedValue(bulkDeleteResponse);

      const result = await controller.bulkDelete(bulkDeleteDto, 5, mockRequest);

      expect(result).toEqual(bulkDeleteResponse);
      expect(pagesService.bulkDelete).toHaveBeenCalledWith([1, 2, 3], 5);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Bulk deleting 3 pages for tenant 5',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageIds: [1, 2, 3],
          tenantId: 5,
          count: 3,
        })
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Bulk deleted 3 pages for tenant 5',
        expect.objectContaining({
          tenantId: 5,
          requested: 3,
          deleted: 3,
        })
      );
    });

    it('should handle partial bulk deletion', async () => {
      const partialResponse = { deleted: 2 }; // Only 2 out of 3 deleted
      mockPagesService.bulkDelete.mockResolvedValue(partialResponse);

      const result = await controller.bulkDelete(bulkDeleteDto, 5, mockRequest);

      expect(result).toEqual(partialResponse);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Bulk deleted 2 pages for tenant 5',
        expect.objectContaining({
          requested: 3,
          deleted: 2,
        })
      );
    });

    it('should handle bulk deletion errors', async () => {
      const error = new Error('Database error');
      mockPagesService.bulkDelete.mockRejectedValue(error);

      await expect(controller.bulkDelete(bulkDeleteDto, 5, mockRequest)).rejects.toThrow('Database error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to bulk delete pages for tenant 5: Database error',
        expect.objectContaining({
          tenantId: 5,
          pageIds: [1, 2, 3],
        })
      );
    });
  });

  describe('public routes', () => {
    describe('findPublicPages', () => {
      it('should return published pages for language', async () => {
        const query: PageQueryDto = { page: 1, limit: 10 };
        mockPagesService.findAll.mockResolvedValue(mockPaginatedResponse);

        const result = await controller.findPublicPages('tr', 5, query);

        expect(result).toEqual(mockPaginatedResponse);
        expect(pagesService.findAll).toHaveBeenCalledWith(5, {
          ...query,
          status: PageStatus.PUBLISHED,
          language: 'tr',
        });
      });

      it('should force published status for public route', async () => {
        const query: PageQueryDto = { status: PageStatus.DRAFT }; // Should be overridden
        mockPagesService.findAll.mockResolvedValue(mockPaginatedResponse);

        await controller.findPublicPages('tr', 5, query);

        expect(pagesService.findAll).toHaveBeenCalledWith(5, {
          status: PageStatus.PUBLISHED, // Overridden
          language: 'tr',
        });
      });
    });

    describe('findBySlug', () => {
      it('should return published page by slug', async () => {
        mockPagesService.findBySlug.mockResolvedValue(mockPageResponse);

        const result = await controller.findBySlug('tr', 'test-sayfa', 5);

        expect(result).toEqual(mockPageResponse);
        expect(pagesService.findBySlug).toHaveBeenCalledWith('test-sayfa', 'tr', 5, false);
      });
    });

    describe('getPagesByLanguage', () => {
      it('should return all published pages for language', async () => {
        mockPagesService.getPagesByLanguage.mockResolvedValue([mockPageResponse]);

        const result = await controller.getPagesByLanguage('tr', 5);

        expect(result).toEqual([mockPageResponse]);
        expect(pagesService.getPagesByLanguage).toHaveBeenCalledWith('tr', 5, true);
      });
    });
  });

  describe('preview routes', () => {
    describe('previewBySlug', () => {
      it('should return page including unpublished for preview', async () => {
        mockPagesService.findBySlug.mockResolvedValue(mockPageResponse);

        const result = await controller.previewBySlug('tr', 'test-sayfa', 5);

        expect(result).toEqual(mockPageResponse);
        expect(pagesService.findBySlug).toHaveBeenCalledWith('test-sayfa', 'tr', 5, true);
      });
    });
  });

  describe('logging functionality', () => {
    it('should log all successful operations', async () => {
      mockPagesService.findOne.mockResolvedValue(mockPageResponse);

      await controller.findOneAdmin(1, 5, mockRequest);

      expect(loggerSpy).toHaveBeenCalledTimes(2); // Start and success log
      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'Fetching page 1 for tenant 5',
        expect.objectContaining({ correlationId: 'test-correlation-123' })
      );
      expect(loggerSpy).toHaveBeenNthCalledWith(
        2,
        'Retrieved page 1 for tenant 5',
        expect.objectContaining({ correlationId: 'test-correlation-123' })
      );
    });

    it('should log all error operations', async () => {
      const error = new Error('Test error');
      mockPagesService.findOne.mockRejectedValue(error);

      await expect(controller.findOneAdmin(1, 5, mockRequest)).rejects.toThrow('Test error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to fetch page 1 for tenant 5: Test error',
        expect.objectContaining({
          correlationId: 'test-correlation-123',
          pageId: 1,
          tenantId: 5,
          error: 'Test error',
        })
      );
    });

    it('should include correlation ID in all logs', async () => {
      mockPagesService.create.mockResolvedValue(mockPageResponse);

      await controller.create(mockCreatePageDto, 5, mockRequest);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ correlationId: 'test-correlation-123' })
      );
    });
  });

  describe('request handling', () => {
    it('should handle requests without correlation ID', async () => {
      const requestWithoutId = { headers: {} } as any;
      mockPagesService.findOne.mockResolvedValue(mockPageResponse);

      await controller.findOneAdmin(1, 5, requestWithoutId);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          correlationId: expect.stringMatching(/^page-get-\d+$/),
        })
      );
    });

    it('should preserve original correlation ID when provided', async () => {
      const customCorrelationId = 'custom-correlation-id-123';
      const customRequest = {
        headers: { 'x-correlation-id': customCorrelationId },
      } as any;
      mockPagesService.findOne.mockResolvedValue(mockPageResponse);

      await controller.findOneAdmin(1, 5, customRequest);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ correlationId: customCorrelationId })
      );
    });
  });

  describe('tenant isolation enforcement', () => {
    it('should pass tenantId to all service methods', async () => {
      const testTenantId = 42;

      // Test create
      mockPagesService.create.mockResolvedValue(mockPageResponse);
      await controller.create(mockCreatePageDto, testTenantId, mockRequest);
      expect(pagesService.create).toHaveBeenCalledWith(mockCreatePageDto, testTenantId);

      // Test findAll
      mockPagesService.findAll.mockResolvedValue(mockPaginatedResponse);
      await controller.findAllAdmin(testTenantId, {}, mockRequest);
      expect(pagesService.findAll).toHaveBeenCalledWith(testTenantId, {});

      // Test findOne
      mockPagesService.findOne.mockResolvedValue(mockPageResponse);
      await controller.findOneAdmin(1, testTenantId, mockRequest);
      expect(pagesService.findOne).toHaveBeenCalledWith(1, testTenantId);

      // Test update
      mockPagesService.update.mockResolvedValue(mockPageResponse);
      await controller.update(1, {}, testTenantId, mockRequest);
      expect(pagesService.update).toHaveBeenCalledWith(1, {}, testTenantId);

      // Test delete
      mockPagesService.remove.mockResolvedValue({ message: 'Deleted' });
      await controller.remove(1, testTenantId, mockRequest);
      expect(pagesService.remove).toHaveBeenCalledWith(1, testTenantId);

      // Test bulk delete
      mockPagesService.bulkDelete.mockResolvedValue({ deleted: 1 });
      await controller.bulkDelete({ ids: [1] }, testTenantId, mockRequest);
      expect(pagesService.bulkDelete).toHaveBeenCalledWith([1], testTenantId);
    });
  });
});