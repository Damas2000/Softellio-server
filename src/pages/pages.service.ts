import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import {
  PageResponseDto,
  PageTranslationResponseDto,
  PaginatedPageResponseDto,
  PageDeleteResponseDto,
  BulkDeleteResponseDto
} from './dto/page-response.dto';
import { PageWithTranslations } from '../common/types';
import { Page, PageTranslation } from '@prisma/client';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Transform Prisma PageWithTranslations to PageResponseDto
   */
  private transformToResponseDto(page: PageWithTranslations): PageResponseDto {
    return {
      id: page.id,
      tenantId: page.tenantId,
      status: page.status as PageStatus,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      translations: page.translations.map(translation => ({
        id: translation.id,
        language: translation.language,
        title: translation.title,
        slug: translation.slug,
        contentJson: translation.contentJson,
        metaTitle: translation.metaTitle,
        metaDescription: translation.metaDescription,
      })),
    };
  }

  /**
   * Validate slug format according to business rules
   */
  private validateSlugFormat(slug: string): void {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new BadRequestException(
        `Slug '${slug}' contains invalid characters. Only lowercase letters, numbers, and hyphens are allowed.`
      );
    }

    if (slug.length > 100) {
      throw new BadRequestException(
        `Slug '${slug}' is too long. Maximum 100 characters allowed.`
      );
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
      throw new BadRequestException(
        `Slug '${slug}' cannot start or end with hyphen.`
      );
    }

    if (slug.includes('--')) {
      throw new BadRequestException(
        `Slug '${slug}' cannot contain consecutive hyphens.`
      );
    }
  }

  /**
   * Validate slug uniqueness per language per tenant
   */
  private async validateSlugUniqueness(
    slug: string,
    language: string,
    tenantId: number,
    excludePageId?: number
  ): Promise<void> {
    const existingPage = await this.prisma.pageTranslation.findFirst({
      where: {
        page: { tenantId },
        language,
        slug,
        ...(excludePageId && { NOT: { pageId: excludePageId } }),
      },
      include: {
        page: {
          select: { id: true }
        }
      }
    });

    if (existingPage) {
      throw new ConflictException(
        `A page with slug '${slug}' already exists in language '${language}'. Please choose a different slug.`
      );
    }
  }

  /**
   * Validate page translations for business rules
   */
  private async validateTranslations(
    translations: Array<{ language: string; slug: string }>,
    tenantId: number,
    excludePageId?: number
  ): Promise<void> {
    if (!translations || translations.length === 0) {
      throw new BadRequestException('At least one translation is required');
    }

    // Check for duplicate languages in the same request
    const languages = translations.map(t => t.language);
    const uniqueLanguages = new Set(languages);
    if (languages.length !== uniqueLanguages.size) {
      throw new BadRequestException('Duplicate languages are not allowed in the same page');
    }

    // Validate each translation
    for (const translation of translations) {
      this.validateSlugFormat(translation.slug);
      await this.validateSlugUniqueness(translation.slug, translation.language, tenantId, excludePageId);
    }
  }

  async create(createPageDto: CreatePageDto, tenantId: number): Promise<PageResponseDto> {
    // Use enhanced validation
    await this.validateTranslations(createPageDto.translations, tenantId);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create the page
      const page = await tx.page.create({
        data: {
          tenantId,
          status: createPageDto.status || PageStatus.DRAFT,
        },
      });

      // Create translations
      await tx.pageTranslation.createMany({
        data: createPageDto.translations.map(translation => ({
          pageId: page.id,
          language: translation.language,
          title: translation.title,
          slug: translation.slug,
          contentJson: translation.contentJson || null,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
        })),
      });

      // Return page with translations
      return tx.page.findUnique({
        where: { id: page.id },
        include: { translations: true },
      });
    });

    return this.transformToResponseDto(result as PageWithTranslations);
  }

  async findAll(tenantId: number, query: PageQueryDto): Promise<PaginatedPageResponseDto> {
    const {
      search,
      status,
      language,
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      createdAfter,
      createdBefore
    } = query;

    // Build dynamic where clause with tenant isolation
    const whereClause: any = { tenantId };

    // Status filtering
    if (status) {
      whereClause.status = status;
    }

    // Search in title and slug across all translations
    if (search) {
      whereClause.translations = {
        some: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } }
          ]
        }
      };
    }

    // Date range filtering
    if (createdAfter || createdBefore) {
      whereClause.createdAt = {};
      if (createdAfter) {
        whereClause.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        whereClause.createdAt.lte = new Date(createdBefore);
      }
    }

    // Language filtering for translations
    const includeClause: any = {
      translations: language ? { where: { language } } : true,
    };

    // Dynamic sorting
    const orderByClause: any = {};
    if (sortBy === 'title') {
      // Special handling for title sorting (sort by first translation title)
      orderByClause.translations = {
        _count: 'desc' // Fallback, ideally we'd sort by actual title
      };
    } else {
      orderByClause[sortBy] = sortOrder;
    }

    // Execute queries in parallel for performance
    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.page.count({ where: whereClause }),
    ]);

    // Filter out pages without translations in the requested language
    const filteredPages = language
      ? pages.filter(page => page.translations.length > 0) as unknown as PageWithTranslations[]
      : pages as unknown as PageWithTranslations[];

    // Transform to response DTOs
    const responsePages = filteredPages.map(page => this.transformToResponseDto(page));

    return {
      pages: responsePages,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  async findOne(id: number, tenantId: number): Promise<PageResponseDto> {
    const page = await this.prisma.page.findFirst({
      where: { id, tenantId },
      include: { translations: true },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.transformToResponseDto(page as PageWithTranslations);
  }

  async findBySlug(
    slug: string,
    language: string,
    tenantId: number,
    includeUnpublished = false
  ): Promise<PageResponseDto> {
    const whereClause: any = {
      page: {
        tenantId,
        ...(includeUnpublished ? {} : { status: PageStatus.PUBLISHED })
      },
      language,
      slug,
    };

    const pageTranslation = await this.prisma.pageTranslation.findFirst({
      where: whereClause,
      include: {
        page: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (!pageTranslation) {
      throw new NotFoundException('Page not found');
    }

    return this.transformToResponseDto(pageTranslation.page as PageWithTranslations);
  }

  async update(id: number, updatePageDto: UpdatePageDto, tenantId: number): Promise<PageResponseDto> {
    // Check if page exists (this now returns PageResponseDto)
    await this.findOne(id, tenantId);

    // Validate translations if provided (outside transaction)
    if (updatePageDto.translations) {
      await this.validateTranslations(updatePageDto.translations, tenantId, id);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update page status if provided
      if (updatePageDto.status !== undefined) {
        await tx.page.update({
          where: { id },
          data: { status: updatePageDto.status },
        });
      }

      // Update translations if provided
      if (updatePageDto.translations) {
        for (const translation of updatePageDto.translations) {

          // Upsert translation
          await tx.pageTranslation.upsert({
            where: {
              pageId_language: {
                pageId: id,
                language: translation.language,
              },
            },
            update: {
              title: translation.title,
              slug: translation.slug,
              contentJson: translation.contentJson,
              metaTitle: translation.metaTitle,
              metaDescription: translation.metaDescription,
            },
            create: {
              pageId: id,
              language: translation.language,
              title: translation.title,
              slug: translation.slug,
              contentJson: translation.contentJson,
              metaTitle: translation.metaTitle,
              metaDescription: translation.metaDescription,
            },
          });
        }
      }

      // Return updated page with translations
      return tx.page.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    return this.transformToResponseDto(result as PageWithTranslations);
  }

  async remove(id: number, tenantId: number): Promise<PageDeleteResponseDto> {
    // Check if page exists
    await this.findOne(id, tenantId);

    await this.prisma.page.delete({
      where: { id },
    });

    return { message: 'Page deleted successfully' };
  }

  async duplicate(id: number, tenantId: number): Promise<PageResponseDto> {
    const originalPage = await this.findOne(id, tenantId);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create new page
      const newPage = await tx.page.create({
        data: {
          tenantId,
          status: PageStatus.DRAFT, // Always create draft copies
        },
      });

      // Duplicate translations with modified slugs
      await Promise.all(
        originalPage.translations.map(async (translation) => {
          let newSlug = `${translation.slug}-copy`;

          // Ensure slug uniqueness
          let counter = 1;
          while (await tx.pageTranslation.findFirst({
            where: {
              page: { tenantId },
              language: translation.language,
              slug: newSlug,
            },
          })) {
            newSlug = `${translation.slug}-copy-${counter}`;
            counter++;
          }

          return tx.pageTranslation.create({
            data: {
              pageId: newPage.id,
              language: translation.language,
              title: `${translation.title} (Copy)`,
              slug: newSlug,
              contentJson: translation.contentJson,
              metaTitle: translation.metaTitle,
              metaDescription: translation.metaDescription,
            },
          });
        })
      );

      // Return complete page with translations
      return tx.page.findUnique({
        where: { id: newPage.id },
        include: { translations: true },
      });
    });

    return this.transformToResponseDto(result as PageWithTranslations);
  }

  async bulkDelete(ids: number[], tenantId: number): Promise<BulkDeleteResponseDto> {
    const result = await this.prisma.page.deleteMany({
      where: {
        id: { in: ids },
        tenantId,
      },
    });

    return { deleted: result.count };
  }

  async getPagesByLanguage(language: string, tenantId: number, published = true): Promise<PageResponseDto[]> {
    const whereClause: any = {
      tenantId,
      translations: {
        some: { language },
      },
    };

    if (published) {
      whereClause.status = PageStatus.PUBLISHED;
    }

    const pages = await this.prisma.page.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return pages.map(page => this.transformToResponseDto(page as PageWithTranslations));
  }
}