import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreatePageDto, PageStatus } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageWithTranslations } from '../common/types';
import { Page, PageTranslation } from '@prisma/client';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPageDto: CreatePageDto, tenantId: number): Promise<PageWithTranslations> {
    // Validate translations
    if (!createPageDto.translations || createPageDto.translations.length === 0) {
      throw new BadRequestException('At least one translation is required');
    }

    // Check for slug uniqueness per language per tenant
    for (const translation of createPageDto.translations) {
      const existingPage = await this.prisma.pageTranslation.findFirst({
        where: {
          page: { tenantId },
          language: translation.language,
          slug: translation.slug,
        },
      });

      if (existingPage) {
        throw new ConflictException(
          `Page with slug '${translation.slug}' already exists in language '${translation.language}'`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
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
  }

  async findAll(
    tenantId: number,
    options: {
      status?: PageStatus;
      language?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    pages: PageWithTranslations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { status, language, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {
      tenantId,
    };

    if (status) {
      whereClause.status = status;
    }

    // If language filter is specified, only include pages that have translations in that language
    const includeClause: any = {
      translations: language ? {
        where: { language }
      } : true,
    };

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.page.count({ where: whereClause }),
    ]);

    // Filter out pages that don't have translations in the requested language
    const filteredPages = language
      ? pages.filter(page => page.translations.length > 0) as unknown as PageWithTranslations[]
      : pages as unknown as PageWithTranslations[];

    return {
      pages: filteredPages,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: number, tenantId: number): Promise<PageWithTranslations> {
    const page = await this.prisma.page.findFirst({
      where: { id, tenantId },
      include: { translations: true },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async findBySlug(
    slug: string,
    language: string,
    tenantId: number,
    includeUnpublished = false
  ): Promise<PageWithTranslations> {
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

    return pageTranslation.page;
  }

  async update(id: number, updatePageDto: UpdatePageDto, tenantId: number): Promise<PageWithTranslations> {
    // Check if page exists
    const existingPage = await this.findOne(id, tenantId);

    return this.prisma.$transaction(async (tx) => {
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
          // Check for slug conflicts (exclude current page)
          const existingTranslation = await tx.pageTranslation.findFirst({
            where: {
              page: { tenantId },
              language: translation.language,
              slug: translation.slug,
              NOT: { pageId: id },
            },
          });

          if (existingTranslation) {
            throw new ConflictException(
              `Page with slug '${translation.slug}' already exists in language '${translation.language}'`
            );
          }

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
  }

  async remove(id: number, tenantId: number): Promise<{ message: string }> {
    // Check if page exists
    await this.findOne(id, tenantId);

    await this.prisma.page.delete({
      where: { id },
    });

    return { message: 'Page deleted successfully' };
  }

  async duplicate(id: number, tenantId: number): Promise<PageWithTranslations> {
    const originalPage = await this.findOne(id, tenantId);

    return this.prisma.$transaction(async (tx) => {
      // Create new page
      const newPage = await tx.page.create({
        data: {
          tenantId,
          status: PageStatus.DRAFT, // Always create draft copies
        },
      });

      // Duplicate translations with modified slugs
      const newTranslations = await Promise.all(
        originalPage.translations.map(async (translation, index) => {
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

      return {
        ...newPage,
        translations: newTranslations,
      };
    });
  }

  async bulkDelete(ids: number[], tenantId: number): Promise<{ deleted: number }> {
    const result = await this.prisma.page.deleteMany({
      where: {
        id: { in: ids },
        tenantId,
      },
    });

    return { deleted: result.count };
  }

  async getPagesByLanguage(language: string, tenantId: number, published = true): Promise<PageWithTranslations[]> {
    const whereClause: any = {
      tenantId,
      translations: {
        some: { language },
      },
    };

    if (published) {
      whereClause.status = PageStatus.PUBLISHED;
    }

    return this.prisma.page.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}