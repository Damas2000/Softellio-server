import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
import { Service } from '@prisma/client';

export interface ServiceWithTranslations extends Service {
  translations: {
    id: number;
    language: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    contentJson: any;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
}

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createServiceDto: CreateServiceDto,
    tenantId: number,
  ): Promise<ServiceWithTranslations> {
    const service = await this.prisma.service.create({
      data: {
        tenantId,
        iconUrl: createServiceDto.iconUrl,
        order: createServiceDto.order,
        isActive: createServiceDto.isActive,
        isFeatured: createServiceDto.isFeatured,
        translations: {
          create: createServiceDto.translations,
        },
      },
      include: {
        translations: true,
      },
    }) as ServiceWithTranslations;

    return service;
  }

  async findAll(
    tenantId: number,
    query: ServiceQueryDto = {},
  ): Promise<{
    services: ServiceWithTranslations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      featured,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

    if (featured !== undefined) {
      whereClause.isFeatured = featured;
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

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where: whereClause,
        include: {
          translations: true,
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.service.count({ where: whereClause }),
    ]);

    return {
      services: services as ServiceWithTranslations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: number, tenantId: number): Promise<ServiceWithTranslations> {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
      },
    }) as ServiceWithTranslations | null;

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findBySlug(
    slug: string,
    language: string,
    tenantId: number,
  ): Promise<ServiceWithTranslations | null> {
    const service = await this.prisma.service.findFirst({
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
      },
    }) as ServiceWithTranslations | null;

    return service;
  }

  async findFeatured(tenantId: number): Promise<ServiceWithTranslations[]> {
    const services = await this.prisma.service.findMany({
      where: {
        tenantId,
        isActive: true,
        isFeatured: true,
      },
      include: {
        translations: true,
      },
      orderBy: {
        order: 'asc',
      },
    }) as ServiceWithTranslations[];

    return services;
  }

  async findPublicServices(
    tenantId: number,
    language: string,
    query: ServiceQueryDto = {},
  ): Promise<{
    services: {
      id: number;
      iconUrl: string | null;
      order: number | null;
      isFeatured: boolean;
      translation: {
        title: string;
        slug: string;
        shortDescription: string | null;
        contentJson: any;
        metaTitle: string | null;
        metaDescription: string | null;
      } | null;
    }[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      featured,
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = {
      tenantId,
      isActive: true,
    };

    if (featured !== undefined) {
      whereClause.isFeatured = featured;
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

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where: whereClause,
        include: {
          translations: {
            where: { language },
            take: 1,
          },
        },
        orderBy: {
          order: 'asc',
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.service.count({ where: whereClause }),
    ]);

    const formattedServices = services.map(service => ({
      id: service.id,
      iconUrl: service.iconUrl,
      order: service.order,
      isFeatured: service.isFeatured,
      translation: service.translations[0] || null,
    }));

    return {
      services: formattedServices,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
    tenantId: number,
  ): Promise<ServiceWithTranslations> {
    // Check if service exists
    await this.findOne(id, tenantId);

    // Update service
    const updateData: any = {};
    if (updateServiceDto.iconUrl !== undefined) updateData.iconUrl = updateServiceDto.iconUrl;
    if (updateServiceDto.order !== undefined) updateData.order = updateServiceDto.order;
    if (updateServiceDto.isActive !== undefined) updateData.isActive = updateServiceDto.isActive;
    if (updateServiceDto.isFeatured !== undefined) updateData.isFeatured = updateServiceDto.isFeatured;

    await this.prisma.service.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
    if (updateServiceDto.translations) {
      // Delete existing translations
      await this.prisma.serviceTranslation.deleteMany({
        where: { serviceId: id },
      });

      // Create new translations
      await this.prisma.serviceTranslation.createMany({
        data: updateServiceDto.translations.map(translation => ({
          serviceId: id,
          ...translation,
        })),
      });
    }

    // Return updated service
    return this.findOne(id, tenantId);
  }

  async remove(id: number, tenantId: number): Promise<void> {
    // Check if service exists
    await this.findOne(id, tenantId);

    await this.prisma.service.delete({
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
        console.error(`Failed to delete service ${id}:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }

  async reorder(
    serviceUpdates: { id: number; order: number }[],
    tenantId: number,
  ): Promise<void> {
    // Verify all services belong to the tenant
    for (const update of serviceUpdates) {
      await this.findOne(update.id, tenantId);
    }

    // Update orders
    for (const update of serviceUpdates) {
      await this.prisma.service.update({
        where: { id: update.id },
        data: { order: update.order },
      });
    }
  }

  async getStats(tenantId: number): Promise<{
    total: number;
    active: number;
    featured: number;
    byLanguage: Record<string, number>;
  }> {
    const [total, active, featured, translationStats] = await Promise.all([
      this.prisma.service.count({ where: { tenantId } }),
      this.prisma.service.count({ where: { tenantId, isActive: true } }),
      this.prisma.service.count({ where: { tenantId, isFeatured: true } }),
      this.prisma.serviceTranslation.groupBy({
        by: ['language'],
        where: {
          service: { tenantId },
        },
        _count: true,
      }),
    ]);

    const byLanguage = translationStats.reduce((acc, item) => {
      acc[item.language] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      featured,
      byLanguage,
    };
  }
}