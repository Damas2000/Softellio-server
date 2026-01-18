import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
  TenantQueryDto,
  PaginatedTenantResponseDto,
} from './dto/tenant.dto';
import {
  CreatePageDto,
  UpdatePageDto,
  PageResponseDto,
  PageQueryDto,
  PaginatedPageResponseDto,
  PublishPageDto,
} from './dto/page.dto';
import {
  CreateLayoutDto,
  UpdateLayoutDto,
  LayoutResponseDto,
  LayoutQueryDto,
  PaginatedLayoutResponseDto,
  CreateSectionDto,
  UpdateSectionDto,
  SectionResponseDto,
  ReorderSectionsDto,
} from './dto/layout.dto';
import { Tenant, DynamicPage, PageLayout, PageSection, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ================== TENANT MANAGEMENT ==================

  /**
   * Create a new tenant
   */
  async createTenant(createTenantDto: CreateTenantDto, createdByUserId: number): Promise<TenantResponseDto> {
    const correlationId = `create-tenant-${Date.now()}`;

    this.logger.log('Creating new tenant', {
      correlationId,
      domain: createTenantDto.domain,
      createdBy: createdByUserId,
    });

    try {
      // Check if domain already exists
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { domain: createTenantDto.domain },
      });

      if (existingTenant) {
        throw new ConflictException(`Domain ${createTenantDto.domain} already exists`);
      }

      const tenant = await this.prisma.tenant.create({
        data: {
          name: createTenantDto.name,
          domain: createTenantDto.domain,
          defaultLanguage: createTenantDto.defaultLanguage || 'tr',
          availableLanguages: createTenantDto.availableLanguages || ['tr'],
          theme: createTenantDto.theme,
          primaryColor: createTenantDto.primaryColor,
          subscriptionStatus: createTenantDto.subscriptionStatus || 'trial',
          planKey: createTenantDto.planKey || 'basic',
          isActive: createTenantDto.isActive ?? true,
        },
      });

      this.logger.log('Tenant created successfully', {
        correlationId,
        tenantId: tenant.id,
        domain: tenant.domain,
      });

      return this.transformTenantToDto(tenant);
    } catch (error) {
      this.logger.error('Failed to create tenant', {
        correlationId,
        domain: createTenantDto.domain,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all tenants with filtering and pagination
   */
  async getAllTenants(query: TenantQueryDto): Promise<PaginatedTenantResponseDto> {
    const { search, subscriptionStatus, isActive, page = 1, limit = 20 } = query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subscriptionStatus) {
      whereClause.subscriptionStatus = subscriptionStatus;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tenant.count({ where: whereClause }),
    ]);

    return {
      tenants: tenants.map(tenant => this.transformTenantToDto(tenant)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: number): Promise<TenantResponseDto> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return this.transformTenantToDto(tenant);
  }

  /**
   * Update tenant
   */
  async updateTenant(id: number, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const correlationId = `update-tenant-${Date.now()}`;

    this.logger.log('Updating tenant', {
      correlationId,
      tenantId: id,
    });

    try {
      // Check if tenant exists
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { id },
      });

      if (!existingTenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      // Check if domain already exists (if changing domain)
      if (updateTenantDto.domain && updateTenantDto.domain !== existingTenant.domain) {
        const domainExists = await this.prisma.tenant.findUnique({
          where: { domain: updateTenantDto.domain },
        });

        if (domainExists) {
          throw new ConflictException(`Domain ${updateTenantDto.domain} already exists`);
        }
      }

      const tenant = await this.prisma.tenant.update({
        where: { id },
        data: updateTenantDto,
      });

      this.logger.log('Tenant updated successfully', {
        correlationId,
        tenantId: id,
      });

      return this.transformTenantToDto(tenant);
    } catch (error) {
      this.logger.error('Failed to update tenant', {
        correlationId,
        tenantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete tenant
   */
  async deleteTenant(id: number): Promise<{ message: string }> {
    const correlationId = `delete-tenant-${Date.now()}`;

    this.logger.log('Deleting tenant', {
      correlationId,
      tenantId: id,
    });

    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      // Use transaction to delete tenant and all related data
      await this.prisma.$transaction(async (tx) => {
        await tx.tenant.delete({ where: { id } });
      });

      this.logger.log('Tenant deleted successfully', {
        correlationId,
        tenantId: id,
      });

      return { message: `Tenant ${tenant.name} deleted successfully` };
    } catch (error) {
      this.logger.error('Failed to delete tenant', {
        correlationId,
        tenantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  // ================== PAGE MANAGEMENT ==================

  /**
   * Get all pages for a tenant
   */
  async getTenantPages(tenantId: number, query: PageQueryDto): Promise<PaginatedPageResponseDto> {
    this.logger.log('Getting tenant pages', { tenantId, query });

    const { search, published, pageType, language, page = 1, limit = 20 } = query;

    const whereClause: any = { tenantId };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (published !== undefined) {
      whereClause.published = published;
    }

    if (pageType) {
      whereClause.pageType = pageType;
    }

    if (language) {
      whereClause.language = language;
    }

    const [pages, total] = await Promise.all([
      this.prisma.dynamicPage.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dynamicPage.count({ where: whereClause }),
    ]);

    return {
      pages: pages.map(page => this.transformPageToDto(page)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  /**
   * Create a new page for a tenant
   */
  async createTenantPage(tenantId: number, createPageDto: CreatePageDto): Promise<PageResponseDto> {
    const correlationId = `create-page-${Date.now()}`;

    this.logger.log('Creating new page', {
      correlationId,
      tenantId,
      slug: createPageDto.slug,
    });

    try {
      // Check if slug already exists for this tenant and language
      const existingPage = await this.prisma.dynamicPage.findFirst({
        where: {
          tenantId,
          slug: createPageDto.slug,
          language: createPageDto.language || 'tr',
        },
      });

      if (existingPage) {
        throw new ConflictException(
          `Page with slug ${createPageDto.slug} already exists for language ${createPageDto.language || 'tr'}`
        );
      }

      const page = await this.prisma.dynamicPage.create({
        data: {
          tenantId,
          slug: createPageDto.slug,
          title: createPageDto.title,
          layoutKey: createPageDto.layoutKey || 'CUSTOM',
          seo: createPageDto.seo || {},
          pageType: createPageDto.pageType || 'CUSTOM',
          language: createPageDto.language || 'tr',
          published: createPageDto.published || false,
          publishedAt: createPageDto.published ? new Date() : null,
        },
      });

      this.logger.log('Page created successfully', {
        correlationId,
        pageId: page.id,
        tenantId,
      });

      return this.transformPageToDto(page);
    } catch (error) {
      this.logger.error('Failed to create page', {
        correlationId,
        tenantId,
        slug: createPageDto.slug,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get page by ID
   */
  async getTenantPageById(tenantId: number, pageId: string): Promise<PageResponseDto> {
    const page = await this.prisma.dynamicPage.findFirst({
      where: {
        id: pageId,
        tenantId,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found for tenant ${tenantId}`);
    }

    return this.transformPageToDto(page);
  }

  /**
   * Update page
   */
  async updateTenantPage(
    tenantId: number,
    pageId: string,
    updatePageDto: UpdatePageDto,
  ): Promise<PageResponseDto> {
    const correlationId = `update-page-${Date.now()}`;

    this.logger.log('Updating page', {
      correlationId,
      tenantId,
      pageId,
    });

    try {
      const existingPage = await this.prisma.dynamicPage.findFirst({
        where: { id: pageId, tenantId },
      });

      if (!existingPage) {
        throw new NotFoundException(`Page with ID ${pageId} not found for tenant ${tenantId}`);
      }

      // Check slug uniqueness if changing slug
      if (updatePageDto.slug && updatePageDto.slug !== existingPage.slug) {
        const slugExists = await this.prisma.dynamicPage.findFirst({
          where: {
            tenantId,
            slug: updatePageDto.slug,
            language: updatePageDto.language || existingPage.language,
            id: { not: pageId },
          },
        });

        if (slugExists) {
          throw new ConflictException(
            `Page with slug ${updatePageDto.slug} already exists for language ${
              updatePageDto.language || existingPage.language
            }`
          );
        }
      }

      const page = await this.prisma.dynamicPage.update({
        where: { id: pageId },
        data: updatePageDto,
      });

      this.logger.log('Page updated successfully', {
        correlationId,
        pageId,
        tenantId,
      });

      return this.transformPageToDto(page);
    } catch (error) {
      this.logger.error('Failed to update page', {
        correlationId,
        tenantId,
        pageId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete page
   */
  async deleteTenantPage(tenantId: number, pageId: string): Promise<{ message: string }> {
    const correlationId = `delete-page-${Date.now()}`;

    this.logger.log('Deleting page', {
      correlationId,
      tenantId,
      pageId,
    });

    try {
      const page = await this.prisma.dynamicPage.findFirst({
        where: { id: pageId, tenantId },
      });

      if (!page) {
        throw new NotFoundException(`Page with ID ${pageId} not found for tenant ${tenantId}`);
      }

      await this.prisma.dynamicPage.delete({
        where: { id: pageId },
      });

      this.logger.log('Page deleted successfully', {
        correlationId,
        pageId,
        tenantId,
      });

      return { message: `Page ${page.title} deleted successfully` };
    } catch (error) {
      this.logger.error('Failed to delete page', {
        correlationId,
        tenantId,
        pageId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Publish page
   */
  async publishTenantPage(
    tenantId: number,
    pageId: string,
    publishDto: PublishPageDto,
  ): Promise<PageResponseDto> {
    const page = await this.prisma.dynamicPage.findFirst({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found for tenant ${tenantId}`);
    }

    const updatedPage = await this.prisma.dynamicPage.update({
      where: { id: pageId },
      data: {
        published: true,
        publishedAt: publishDto.publishedAt ? new Date(publishDto.publishedAt) : new Date(),
      },
    });

    return this.transformPageToDto(updatedPage);
  }

  /**
   * Unpublish page
   */
  async unpublishTenantPage(tenantId: number, pageId: string): Promise<PageResponseDto> {
    const page = await this.prisma.dynamicPage.findFirst({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found for tenant ${tenantId}`);
    }

    const updatedPage = await this.prisma.dynamicPage.update({
      where: { id: pageId },
      data: {
        published: false,
        publishedAt: null,
      },
    });

    return this.transformPageToDto(updatedPage);
  }

  // ================== LAYOUT MANAGEMENT ==================

  /**
   * Get all layouts for a tenant
   */
  async getTenantLayouts(tenantId: number, query: LayoutQueryDto): Promise<PaginatedLayoutResponseDto> {
    const { search, language, status, page = 1, limit = 20 } = query;

    const whereClause: any = { tenantId };

    if (search) {
      whereClause.key = { contains: search, mode: 'insensitive' };
    }

    if (language) {
      whereClause.language = language;
    }

    if (status) {
      whereClause.status = status;
    }

    const [layouts, total] = await Promise.all([
      this.prisma.pageLayout.findMany({
        where: whereClause,
        include: { sections: { orderBy: { order: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pageLayout.count({ where: whereClause }),
    ]);

    return {
      layouts: layouts.map(layout => this.transformLayoutToDto(layout)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  /**
   * Create a new layout
   */
  async createTenantLayout(tenantId: number, createLayoutDto: CreateLayoutDto): Promise<LayoutResponseDto> {
    const correlationId = `create-layout-${Date.now()}`;

    this.logger.log('Creating new layout', {
      correlationId,
      tenantId,
      key: createLayoutDto.key,
    });

    try {
      // Check if layout key already exists for this tenant and language
      const existingLayout = await this.prisma.pageLayout.findFirst({
        where: {
          tenantId,
          key: createLayoutDto.key,
          language: createLayoutDto.language || 'tr',
        },
      });

      if (existingLayout) {
        throw new ConflictException(
          `Layout with key ${createLayoutDto.key} already exists for language ${createLayoutDto.language || 'tr'}`
        );
      }

      const layout = await this.prisma.pageLayout.create({
        data: {
          tenantId,
          key: createLayoutDto.key,
          language: createLayoutDto.language || 'tr',
          status: createLayoutDto.status || 'published',
        },
        include: { sections: { orderBy: { order: 'asc' } } },
      });

      this.logger.log('Layout created successfully', {
        correlationId,
        layoutId: layout.id,
        tenantId,
      });

      return this.transformLayoutToDto(layout);
    } catch (error) {
      this.logger.error('Failed to create layout', {
        correlationId,
        tenantId,
        key: createLayoutDto.key,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get layout by ID
   */
  async getTenantLayoutById(tenantId: number, layoutId: number): Promise<LayoutResponseDto> {
    const layout = await this.prisma.pageLayout.findFirst({
      where: {
        id: layoutId,
        tenantId,
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!layout) {
      throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
    }

    return this.transformLayoutToDto(layout);
  }

  /**
   * Update layout
   */
  async updateTenantLayout(
    tenantId: number,
    layoutId: number,
    updateLayoutDto: UpdateLayoutDto,
  ): Promise<LayoutResponseDto> {
    const correlationId = `update-layout-${Date.now()}`;

    this.logger.log('Updating layout', {
      correlationId,
      tenantId,
      layoutId,
    });

    try {
      const existingLayout = await this.prisma.pageLayout.findFirst({
        where: { id: layoutId, tenantId },
      });

      if (!existingLayout) {
        throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
      }

      // Check key uniqueness if changing key
      if (updateLayoutDto.key && updateLayoutDto.key !== existingLayout.key) {
        const keyExists = await this.prisma.pageLayout.findFirst({
          where: {
            tenantId,
            key: updateLayoutDto.key,
            language: updateLayoutDto.language || existingLayout.language,
            id: { not: layoutId },
          },
        });

        if (keyExists) {
          throw new ConflictException(
            `Layout with key ${updateLayoutDto.key} already exists for language ${
              updateLayoutDto.language || existingLayout.language
            }`
          );
        }
      }

      const layout = await this.prisma.pageLayout.update({
        where: { id: layoutId },
        data: updateLayoutDto,
        include: { sections: { orderBy: { order: 'asc' } } },
      });

      this.logger.log('Layout updated successfully', {
        correlationId,
        layoutId,
        tenantId,
      });

      return this.transformLayoutToDto(layout);
    } catch (error) {
      this.logger.error('Failed to update layout', {
        correlationId,
        tenantId,
        layoutId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete layout
   */
  async deleteTenantLayout(tenantId: number, layoutId: number): Promise<{ message: string }> {
    const correlationId = `delete-layout-${Date.now()}`;

    this.logger.log('Deleting layout', {
      correlationId,
      tenantId,
      layoutId,
    });

    try {
      const layout = await this.prisma.pageLayout.findFirst({
        where: { id: layoutId, tenantId },
      });

      if (!layout) {
        throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
      }

      // Use transaction to delete layout and all sections
      await this.prisma.$transaction(async (tx) => {
        await tx.pageLayout.delete({ where: { id: layoutId } });
      });

      this.logger.log('Layout deleted successfully', {
        correlationId,
        layoutId,
        tenantId,
      });

      return { message: `Layout ${layout.key} deleted successfully` };
    } catch (error) {
      this.logger.error('Failed to delete layout', {
        correlationId,
        tenantId,
        layoutId,
        error: error.message,
      });
      throw error;
    }
  }

  // ================== SECTION MANAGEMENT ==================

  /**
   * Get all sections for a layout
   */
  async getLayoutSections(tenantId: number, layoutId: number): Promise<SectionResponseDto[]> {
    // Verify layout belongs to tenant
    const layout = await this.prisma.pageLayout.findFirst({
      where: { id: layoutId, tenantId },
    });

    if (!layout) {
      throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
    }

    const sections = await this.prisma.pageSection.findMany({
      where: { layoutId, tenantId },
      orderBy: { order: 'asc' },
    });

    return sections.map(section => this.transformSectionToDto(section));
  }

  /**
   * Create a new section
   */
  async createLayoutSection(
    tenantId: number,
    layoutId: number,
    createSectionDto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    const correlationId = `create-section-${Date.now()}`;

    this.logger.log('Creating new section', {
      correlationId,
      tenantId,
      layoutId,
      type: createSectionDto.type,
    });

    try {
      // Verify layout belongs to tenant
      const layout = await this.prisma.pageLayout.findFirst({
        where: { id: layoutId, tenantId },
      });

      if (!layout) {
        throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
      }

      // Check if order is already taken
      const existingSection = await this.prisma.pageSection.findFirst({
        where: {
          layoutId,
          order: createSectionDto.order,
        },
      });

      if (existingSection) {
        // Shift existing sections down
        await this.prisma.pageSection.updateMany({
          where: {
            layoutId,
            order: { gte: createSectionDto.order },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }

      const section = await this.prisma.pageSection.create({
        data: {
          tenantId,
          layoutId,
          type: createSectionDto.type,
          variant: createSectionDto.variant,
          order: createSectionDto.order,
          isEnabled: createSectionDto.isEnabled ?? true,
          status: createSectionDto.status || 'published',
          propsJson: createSectionDto.propsJson,
        },
      });

      this.logger.log('Section created successfully', {
        correlationId,
        sectionId: section.id,
        tenantId,
        layoutId,
      });

      return this.transformSectionToDto(section);
    } catch (error) {
      this.logger.error('Failed to create section', {
        correlationId,
        tenantId,
        layoutId,
        type: createSectionDto.type,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update section
   */
  async updateLayoutSection(
    tenantId: number,
    layoutId: number,
    sectionId: number,
    updateSectionDto: UpdateSectionDto,
  ): Promise<SectionResponseDto> {
    const correlationId = `update-section-${Date.now()}`;

    this.logger.log('Updating section', {
      correlationId,
      tenantId,
      layoutId,
      sectionId,
    });

    try {
      const existingSection = await this.prisma.pageSection.findFirst({
        where: { id: sectionId, layoutId, tenantId },
      });

      if (!existingSection) {
        throw new NotFoundException(
          `Section with ID ${sectionId} not found for layout ${layoutId} in tenant ${tenantId}`
        );
      }

      // Handle order change
      if (updateSectionDto.order !== undefined && updateSectionDto.order !== existingSection.order) {
        await this.handleSectionOrderChange(layoutId, sectionId, existingSection.order, updateSectionDto.order);
      }

      const section = await this.prisma.pageSection.update({
        where: { id: sectionId },
        data: updateSectionDto,
      });

      this.logger.log('Section updated successfully', {
        correlationId,
        sectionId,
        tenantId,
        layoutId,
      });

      return this.transformSectionToDto(section);
    } catch (error) {
      this.logger.error('Failed to update section', {
        correlationId,
        tenantId,
        layoutId,
        sectionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete section
   */
  async deleteLayoutSection(tenantId: number, layoutId: number, sectionId: number): Promise<{ message: string }> {
    const correlationId = `delete-section-${Date.now()}`;

    this.logger.log('Deleting section', {
      correlationId,
      tenantId,
      layoutId,
      sectionId,
    });

    try {
      const section = await this.prisma.pageSection.findFirst({
        where: { id: sectionId, layoutId, tenantId },
      });

      if (!section) {
        throw new NotFoundException(
          `Section with ID ${sectionId} not found for layout ${layoutId} in tenant ${tenantId}`
        );
      }

      await this.prisma.$transaction(async (tx) => {
        // Delete the section
        await tx.pageSection.delete({ where: { id: sectionId } });

        // Shift remaining sections up
        await tx.pageSection.updateMany({
          where: {
            layoutId,
            order: { gt: section.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      });

      this.logger.log('Section deleted successfully', {
        correlationId,
        sectionId,
        tenantId,
        layoutId,
      });

      return { message: `Section ${section.type} deleted successfully` };
    } catch (error) {
      this.logger.error('Failed to delete section', {
        correlationId,
        tenantId,
        layoutId,
        sectionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Reorder sections in a layout
   */
  async reorderLayoutSections(
    tenantId: number,
    layoutId: number,
    reorderDto: ReorderSectionsDto,
  ): Promise<SectionResponseDto[]> {
    const correlationId = `reorder-sections-${Date.now()}`;

    this.logger.log('Reordering sections', {
      correlationId,
      tenantId,
      layoutId,
      sections: reorderDto.sections.length,
    });

    try {
      // Verify layout belongs to tenant
      const layout = await this.prisma.pageLayout.findFirst({
        where: { id: layoutId, tenantId },
      });

      if (!layout) {
        throw new NotFoundException(`Layout with ID ${layoutId} not found for tenant ${tenantId}`);
      }

      // Verify all sections belong to this layout
      const sectionIds = reorderDto.sections.map(s => s.sectionId);
      const existingSections = await this.prisma.pageSection.findMany({
        where: {
          id: { in: sectionIds },
          layoutId,
          tenantId,
        },
      });

      if (existingSections.length !== sectionIds.length) {
        throw new BadRequestException('Some sections do not belong to this layout');
      }

      // Update sections in transaction
      await this.prisma.$transaction(async (tx) => {
        for (const { sectionId, newOrder } of reorderDto.sections) {
          await tx.pageSection.update({
            where: { id: sectionId },
            data: { order: newOrder },
          });
        }
      });

      // Return updated sections
      const updatedSections = await this.prisma.pageSection.findMany({
        where: { layoutId, tenantId },
        orderBy: { order: 'asc' },
      });

      this.logger.log('Sections reordered successfully', {
        correlationId,
        tenantId,
        layoutId,
      });

      return updatedSections.map(section => this.transformSectionToDto(section));
    } catch (error) {
      this.logger.error('Failed to reorder sections', {
        correlationId,
        tenantId,
        layoutId,
        error: error.message,
      });
      throw error;
    }
  }

  // ================== HELPER METHODS ==================

  /**
   * Handle section order change with proper shifting
   */
  private async handleSectionOrderChange(
    layoutId: number,
    sectionId: number,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) return;

    await this.prisma.$transaction(async (tx) => {
      if (newOrder > oldOrder) {
        // Moving down - shift sections up
        await tx.pageSection.updateMany({
          where: {
            layoutId,
            order: {
              gt: oldOrder,
              lte: newOrder,
            },
            id: { not: sectionId },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      } else {
        // Moving up - shift sections down
        await tx.pageSection.updateMany({
          where: {
            layoutId,
            order: {
              gte: newOrder,
              lt: oldOrder,
            },
            id: { not: sectionId },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }
    });
  }

  /**
   * Transform Tenant entity to DTO
   */
  private transformTenantToDto(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      status: tenant.status,
      defaultLanguage: tenant.defaultLanguage,
      availableLanguages: tenant.availableLanguages,
      theme: tenant.theme || undefined,
      primaryColor: tenant.primaryColor || undefined,
      isActive: tenant.isActive,
      subscriptionStatus: tenant.subscriptionStatus,
      planKey: tenant.planKey,
      currentPeriodStart: tenant.currentPeriodStart || undefined,
      currentPeriodEnd: tenant.currentPeriodEnd || undefined,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  /**
   * Transform DynamicPage entity to DTO
   */
  private transformPageToDto(page: DynamicPage): PageResponseDto {
    return {
      id: page.id,
      tenantId: page.tenantId,
      slug: page.slug,
      title: page.title,
      layoutKey: page.layoutKey,
      seo: (page.seo as object) || undefined,
      published: page.published,
      publishedAt: page.publishedAt || undefined,
      pageType: page.pageType,
      language: page.language,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  /**
   * Transform PageLayout entity to DTO
   */
  private transformLayoutToDto(layout: PageLayout & { sections?: PageSection[] }): LayoutResponseDto {
    return {
      id: layout.id,
      tenantId: layout.tenantId,
      key: layout.key,
      language: layout.language || undefined,
      status: layout.status,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
      sections: layout.sections ? layout.sections.map(s => this.transformSectionToDto(s)) : undefined,
    };
  }

  /**
   * Transform PageSection entity to DTO
   */
  private transformSectionToDto(section: PageSection): SectionResponseDto {
    return {
      id: section.id,
      tenantId: section.tenantId,
      layoutId: section.layoutId,
      type: section.type,
      variant: section.variant || undefined,
      order: section.order,
      isEnabled: section.isEnabled,
      status: section.status,
      propsJson: section.propsJson as object,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    };
  }
}