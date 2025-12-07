import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateReferenceDto, UpdateReferenceDto, ReferenceQueryDto } from './dto/reference.dto';
import { Reference } from '@prisma/client';

export interface ReferenceWithRelations extends Reference {
  translations: {
    id: number;
    language: string;
    title: string;
    slug: string;
    description: string | null;
    contentJson: any;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
  gallery: {
    id: number;
    imageUrl: string;
    caption: string | null;
    order: number | null;
  }[];
}

@Injectable()
export class ReferencesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createReferenceDto: CreateReferenceDto,
    tenantId: number,
  ): Promise<ReferenceWithRelations> {
    const reference = await this.prisma.reference.create({
      data: {
        tenantId,
        imageUrl: createReferenceDto.imageUrl,
        projectUrl: createReferenceDto.projectUrl,
        clientName: createReferenceDto.clientName,
        projectDate: createReferenceDto.projectDate ? new Date(createReferenceDto.projectDate) : null,
        category: createReferenceDto.category,
        order: createReferenceDto.order,
        isActive: createReferenceDto.isActive,
        isFeatured: createReferenceDto.isFeatured,
        translations: {
          create: createReferenceDto.translations,
        },
        gallery: createReferenceDto.gallery ? {
          create: createReferenceDto.gallery,
        } : undefined,
      },
      include: {
        translations: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
    }) as ReferenceWithRelations;

    return reference;
  }

  async findAll(
    tenantId: number,
    query: ReferenceQueryDto = {},
  ): Promise<{
    references: ReferenceWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      featured,
      client,
      year,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (featured !== undefined) {
      whereClause.isFeatured = featured;
    }

    if (category) {
      whereClause.category = category;
    }

    if (client) {
      whereClause.clientName = {
        contains: client,
        mode: 'insensitive',
      };
    }

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      whereClause.projectDate = {
        gte: startOfYear,
        lte: endOfYear,
      };
    }

    if (search) {
      whereClause.translations = {
        some: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      };
    }

    let orderBy: any = {};
    if (sortBy === 'title') {
      // For sorting by title, we need to join with translations
      orderBy = {
        translations: {
          _count: sortOrder,
        },
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [references, total] = await Promise.all([
      this.prisma.reference.findMany({
        where: whereClause,
        include: {
          translations: true,
          gallery: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.reference.count({ where: whereClause }),
    ]);

    return {
      references: references as ReferenceWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: number, tenantId: number): Promise<ReferenceWithRelations> {
    const reference = await this.prisma.reference.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
    }) as ReferenceWithRelations | null;

    if (!reference) {
      throw new NotFoundException('Reference not found');
    }

    return reference;
  }

  async findBySlug(
    slug: string,
    language: string,
    tenantId: number,
  ): Promise<ReferenceWithRelations | null> {
    const reference = await this.prisma.reference.findFirst({
      where: {
        tenantId,
        translations: {
          some: {
            slug,
            language,
          },
        },
      },
      include: {
        translations: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
    }) as ReferenceWithRelations | null;

    return reference;
  }

  async findFeatured(tenantId: number): Promise<ReferenceWithRelations[]> {
    const references = await this.prisma.reference.findMany({
      where: {
        tenantId,
        isActive: true,
        isFeatured: true,
      },
      include: {
        translations: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        order: 'asc',
      },
    }) as ReferenceWithRelations[];

    return references;
  }

  async findByCategory(
    category: string,
    tenantId: number,
    language?: string,
  ): Promise<ReferenceWithRelations[]> {
    const references = await this.prisma.reference.findMany({
      where: {
        tenantId,
        isActive: true,
        category,
      },
      include: {
        translations: language ? {
          where: { language },
        } : true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        order: 'asc',
      },
    }) as ReferenceWithRelations[];

    return references;
  }

  async findPublicReferences(
    tenantId: number,
    language: string,
    query: ReferenceQueryDto = {},
  ): Promise<{
    references: {
      id: number;
      imageUrl: string | null;
      projectUrl: string | null;
      clientName: string | null;
      projectDate: Date | null;
      category: string | null;
      order: number | null;
      isFeatured: boolean;
      translation: {
        title: string;
        slug: string;
        description: string | null;
        contentJson: any;
        metaTitle: string | null;
        metaDescription: string | null;
      } | null;
      gallery: {
        imageUrl: string;
        caption: string | null;
        order: number | null;
      }[];
    }[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      featured,
      client,
      year,
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = {
      tenantId,
      isActive: true,
    };

    if (featured !== undefined) {
      whereClause.isFeatured = featured;
    }

    if (category) {
      whereClause.category = category;
    }

    if (client) {
      whereClause.clientName = {
        contains: client,
        mode: 'insensitive',
      };
    }

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      whereClause.projectDate = {
        gte: startOfYear,
        lte: endOfYear,
      };
    }

    if (search) {
      whereClause.translations = {
        some: {
          AND: [
            { language },
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      };
    }

    const [references, total] = await Promise.all([
      this.prisma.reference.findMany({
        where: whereClause,
        include: {
          translations: {
            where: { language },
            take: 1,
          },
          gallery: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: {
          order: 'asc',
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.reference.count({ where: whereClause }),
    ]);

    const formattedReferences = references.map(reference => ({
      id: reference.id,
      imageUrl: reference.imageUrl,
      projectUrl: reference.projectUrl,
      clientName: reference.clientName,
      projectDate: reference.projectDate,
      category: reference.category,
      order: reference.order,
      isFeatured: reference.isFeatured,
      translation: reference.translations[0] || null,
      gallery: reference.gallery,
    })).filter(reference => reference.translation); // Only include references with translation in the requested language

    return {
      references: formattedReferences,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async update(
    id: number,
    updateReferenceDto: UpdateReferenceDto,
    tenantId: number,
  ): Promise<ReferenceWithRelations> {
    // Check if reference exists
    await this.findOne(id, tenantId);

    // Update reference basic info
    const updateData: any = {};
    if (updateReferenceDto.imageUrl !== undefined) updateData.imageUrl = updateReferenceDto.imageUrl;
    if (updateReferenceDto.projectUrl !== undefined) updateData.projectUrl = updateReferenceDto.projectUrl;
    if (updateReferenceDto.clientName !== undefined) updateData.clientName = updateReferenceDto.clientName;
    if (updateReferenceDto.projectDate !== undefined) {
      updateData.projectDate = updateReferenceDto.projectDate ? new Date(updateReferenceDto.projectDate) : null;
    }
    if (updateReferenceDto.category !== undefined) updateData.category = updateReferenceDto.category;
    if (updateReferenceDto.order !== undefined) updateData.order = updateReferenceDto.order;
    if (updateReferenceDto.isActive !== undefined) updateData.isActive = updateReferenceDto.isActive;
    if (updateReferenceDto.isFeatured !== undefined) updateData.isFeatured = updateReferenceDto.isFeatured;

    await this.prisma.reference.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
    if (updateReferenceDto.translations) {
      await this.prisma.referenceTranslation.deleteMany({
        where: { referenceId: id },
      });

      await this.prisma.referenceTranslation.createMany({
        data: updateReferenceDto.translations.map(translation => ({
          referenceId: id,
          ...translation,
        })),
      });
    }

    // Update gallery if provided
    if (updateReferenceDto.gallery) {
      await this.prisma.referenceGallery.deleteMany({
        where: { referenceId: id },
      });

      if (updateReferenceDto.gallery.length > 0) {
        await this.prisma.referenceGallery.createMany({
          data: updateReferenceDto.gallery.map(image => ({
            referenceId: id,
            ...image,
          })),
        });
      }
    }

    // Return updated reference
    return this.findOne(id, tenantId);
  }

  async remove(id: number, tenantId: number): Promise<void> {
    // Check if reference exists
    await this.findOne(id, tenantId);

    await this.prisma.reference.delete({
      where: { id },
    });
  }

  async bulkDelete(ids: number[], tenantId: number): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.remove(id, tenantId);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete reference ${id}:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }

  async reorder(
    referenceUpdates: { id: number; order: number }[],
    tenantId: number,
  ): Promise<void> {
    // Verify all references belong to the tenant
    for (const update of referenceUpdates) {
      await this.findOne(update.id, tenantId);
    }

    // Update orders
    for (const update of referenceUpdates) {
      await this.prisma.reference.update({
        where: { id: update.id },
        data: { order: update.order },
      });
    }
  }

  async getStats(tenantId: number): Promise<{
    total: number;
    active: number;
    featured: number;
    byCategory: Record<string, number>;
    byYear: Record<string, number>;
    byLanguage: Record<string, number>;
  }> {
    const [total, active, featured, categoryStats, yearStats, translationStats] = await Promise.all([
      this.prisma.reference.count({ where: { tenantId } }),
      this.prisma.reference.count({ where: { tenantId, isActive: true } }),
      this.prisma.reference.count({ where: { tenantId, isFeatured: true } }),
      this.prisma.reference.groupBy({
        by: ['category'],
        where: { tenantId, category: { not: null } },
        _count: true,
      }),
      this.prisma.reference.groupBy({
        by: ['projectDate'],
        where: { tenantId, projectDate: { not: null } },
        _count: true,
      }),
      this.prisma.referenceTranslation.groupBy({
        by: ['language'],
        where: {
          reference: { tenantId },
        },
        _count: true,
      }),
    ]);

    const byCategory = categoryStats.reduce((acc, item) => {
      acc[item.category || 'uncategorized'] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const byYear = yearStats.reduce((acc, item) => {
      const year = item.projectDate ? new Date(item.projectDate).getFullYear().toString() : 'unknown';
      if (!acc[year]) acc[year] = 0;
      acc[year] += item._count;
      return acc;
    }, {} as Record<string, number>);

    const byLanguage = translationStats.reduce((acc, item) => {
      acc[item.language] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      featured,
      byCategory,
      byYear,
      byLanguage,
    };
  }

  async getCategories(tenantId: number): Promise<string[]> {
    const categories = await this.prisma.reference.findMany({
      where: {
        tenantId,
        isActive: true,
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map(c => c.category).filter(Boolean) as string[];
  }

  async getYears(tenantId: number): Promise<number[]> {
    const references = await this.prisma.reference.findMany({
      where: {
        tenantId,
        isActive: true,
        projectDate: { not: null },
      },
      select: {
        projectDate: true,
      },
    });

    const years = references
      .map(r => r.projectDate ? new Date(r.projectDate).getFullYear() : null)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index) as number[];

    return years.sort((a, b) => b - a); // Most recent first
  }
}