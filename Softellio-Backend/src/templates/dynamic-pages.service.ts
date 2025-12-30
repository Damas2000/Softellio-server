import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PageLayoutsService } from '../frontend/page-layouts.service';
import { TemplatesService } from './templates.service';
import { PageCmsIntegrationService } from './page-cms-integration.service';
import {
  CreateDynamicPageDto,
  UpdateDynamicPageDto,
  DynamicPageResponseDto,
  PageListItemDto,
  PageType
} from './dto/dynamic-page.dto';

@Injectable()
export class DynamicPagesService {
  constructor(
    private prisma: PrismaService,
    private pageLayoutsService: PageLayoutsService,
    private templatesService: TemplatesService,
    private pageCmsIntegrationService: PageCmsIntegrationService
  ) {}

  /**
   * Create a new dynamic page with integrated CMS layout
   */
  async create(tenantId: number, createDto: CreateDynamicPageDto): Promise<DynamicPageResponseDto> {
    console.log(`[DynamicPagesService] Creating page for tenant ${tenantId}: ${createDto.slug}`);

    // Validate slug uniqueness for tenant
    await this.validateSlugUniqueness(tenantId, createDto.slug, createDto.language || 'tr');

    // Use integrated service to create page with CMS layout
    const page = await this.pageCmsIntegrationService.createPageWithCmsLayout(tenantId, createDto);

    console.log(`[DynamicPagesService] Page created successfully with CMS integration: ${page.id} (${page.slug})`);

    return this.mapToResponseDto(page);
  }

  /**
   * Update an existing dynamic page
   */
  async update(tenantId: number, pageId: string, updateDto: UpdateDynamicPageDto): Promise<DynamicPageResponseDto> {
    console.log(`[DynamicPagesService] Updating page: ${pageId} for tenant: ${tenantId}`);

    // Find existing page
    const existingPage = await this.prisma.dynamicPage.findUnique({
      where: { id: pageId }
    });

    if (!existingPage || existingPage.tenantId !== tenantId) {
      throw new NotFoundException('Page not found or access denied');
    }

    // Validate slug uniqueness if slug is being changed
    if (updateDto.slug && updateDto.slug !== existingPage.slug) {
      await this.validateSlugUniqueness(tenantId, updateDto.slug, existingPage.language, pageId);
    }

    // Prepare update data
    const updateData: any = {};

    if (updateDto.slug !== undefined) updateData.slug = updateDto.slug;
    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.pageType !== undefined) updateData.pageType = updateDto.pageType;
    if (updateDto.seo !== undefined) updateData.seo = updateDto.seo as any;

    // Handle publication status
    if (updateDto.published !== undefined) {
      updateData.published = updateDto.published;

      // Set publishedAt when publishing for the first time
      if (updateDto.published && !existingPage.publishedAt) {
        updateData.publishedAt = new Date();
      }

      // Clear publishedAt when unpublishing
      if (!updateDto.published) {
        updateData.publishedAt = null;
      }
    }

    // Update the page
    const updatedPage = await this.prisma.dynamicPage.update({
      where: { id: pageId },
      data: updateData
    });

    console.log(`[DynamicPagesService] Page updated successfully: ${pageId}`);

    return this.mapToResponseDto(updatedPage);
  }

  /**
   * Get page by ID
   */
  async findById(tenantId: number, pageId: string): Promise<DynamicPageResponseDto> {
    console.log(`[DynamicPagesService] Getting page: ${pageId} for tenant: ${tenantId}`);

    const page = await this.prisma.dynamicPage.findUnique({
      where: { id: pageId }
    });

    if (!page || page.tenantId !== tenantId) {
      throw new NotFoundException('Page not found or access denied');
    }

    return this.mapToResponseDto(page);
  }

  /**
   * Get page by slug
   */
  async findBySlug(tenantId: number, slug: string, language: string = 'tr'): Promise<DynamicPageResponseDto> {
    console.log(`[DynamicPagesService] Getting page by slug: ${slug} (${language}) for tenant: ${tenantId}`);

    const page = await this.prisma.dynamicPage.findUnique({
      where: {
        tenantId_slug_language: {
          tenantId,
          slug,
          language
        }
      }
    });

    if (!page) {
      throw new NotFoundException(`Page not found: ${slug}`);
    }

    return this.mapToResponseDto(page);
  }

  /**
   * Get all pages for tenant
   */
  async findAllForTenant(tenantId: number, language: string = 'tr'): Promise<PageListItemDto[]> {
    console.log(`[DynamicPagesService] Getting all pages for tenant: ${tenantId} (${language})`);

    const pages = await this.prisma.dynamicPage.findMany({
      where: {
        tenantId,
        language
      },
      orderBy: [
        { pageType: 'asc' },
        { slug: 'asc' }
      ]
    });

    return pages.map(page => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      pageType: page.pageType as PageType,
      published: page.published,
      updatedAt: page.updatedAt
    }));
  }

  /**
   * Get all published pages for tenant (public access)
   */
  async findPublishedForTenant(tenantId: number, language: string = 'tr'): Promise<PageListItemDto[]> {
    console.log(`[DynamicPagesService] Getting published pages for tenant: ${tenantId} (${language})`);

    const pages = await this.prisma.dynamicPage.findMany({
      where: {
        tenantId,
        language,
        published: true
      },
      orderBy: [
        { pageType: 'asc' },
        { slug: 'asc' }
      ]
    });

    return pages.map(page => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      pageType: page.pageType as PageType,
      published: page.published,
      updatedAt: page.updatedAt
    }));
  }

  /**
   * Delete page
   */
  async delete(tenantId: number, pageId: string): Promise<void> {
    console.log(`[DynamicPagesService] Deleting page: ${pageId} for tenant: ${tenantId}`);

    const page = await this.prisma.dynamicPage.findUnique({
      where: { id: pageId }
    });

    if (!page || page.tenantId !== tenantId) {
      throw new NotFoundException('Page not found or access denied');
    }

    // Prevent deletion of homepage
    if (page.pageType === PageType.HOME || page.slug === '/') {
      throw new BadRequestException('Cannot delete homepage');
    }

    // Delete the page and associated layout
    await this.prisma.$transaction(async (tx) => {
      // Delete page record
      await tx.dynamicPage.delete({
        where: { id: pageId }
      });

      // Delete associated page layout and sections
      await this.pageLayoutsService.deleteLayout(tenantId, page.layoutKey, page.language);
    });

    console.log(`[DynamicPagesService] Page deleted successfully: ${pageId}`);
  }

  /**
   * Publish/unpublish page
   */
  async setPublishStatus(tenantId: number, pageId: string, published: boolean): Promise<DynamicPageResponseDto> {
    console.log(`[DynamicPagesService] Setting publish status for page ${pageId}: ${published}`);

    const page = await this.prisma.dynamicPage.findUnique({
      where: { id: pageId }
    });

    if (!page || page.tenantId !== tenantId) {
      throw new NotFoundException('Page not found or access denied');
    }

    const updatedPage = await this.prisma.dynamicPage.update({
      where: { id: pageId },
      data: {
        published,
        publishedAt: published ? (page.publishedAt || new Date()) : null
      }
    });

    return this.mapToResponseDto(updatedPage);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate layout key for page
   */
  private generateLayoutKey(pageType: PageType, slug: string): string {
    switch (pageType) {
      case PageType.HOME:
        return 'HOME';
      case PageType.SERVICES:
        return 'SERVICES';
      case PageType.CONTACT:
        return 'CONTACT';
      case PageType.ABOUT:
        return 'ABOUT';
      case PageType.CUSTOM:
        // Generate unique key for custom pages
        return `CUSTOM_${slug.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
      default:
        return `PAGE_${slug.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
    }
  }


  /**
   * Validate slug uniqueness
   */
  private async validateSlugUniqueness(tenantId: number, slug: string, language: string, excludePageId?: string): Promise<void> {
    const existingPage = await this.prisma.dynamicPage.findUnique({
      where: {
        tenantId_slug_language: {
          tenantId,
          slug,
          language
        }
      }
    });

    if (existingPage && (!excludePageId || existingPage.id !== excludePageId)) {
      throw new ConflictException(`Page with slug "${slug}" already exists for language "${language}"`);
    }
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponseDto(page: any): DynamicPageResponseDto {
    return {
      id: page.id,
      tenantId: page.tenantId,
      slug: page.slug,
      title: page.title,
      layoutKey: page.layoutKey,
      seo: page.seo,
      published: page.published,
      publishedAt: page.publishedAt,
      pageType: page.pageType,
      language: page.language,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    };
  }
}