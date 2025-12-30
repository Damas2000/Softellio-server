import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateTemplateDto, TemplateResponseDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active templates
   * Templates are read-only for tenants
   */
  async findAllActive(): Promise<TemplateResponseDto[]> {
    console.log('[TemplatesService] Getting all active templates');

    const templates = await this.prisma.template.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { createdAt: 'asc' }
      ]
    });

    console.log(`[TemplatesService] Found ${templates.length} active templates`);

    return templates.map(template => ({
      key: template.key,
      name: template.name,
      description: template.description,
      version: template.version,
      previewImage: template.previewImage,
      supportedSections: template.supportedSections,
      defaultLayout: template.defaultLayout,
      isActive: template.isActive,
      createdAt: template.createdAt
    }));
  }

  /**
   * Get template by key
   */
  async findByKey(key: string): Promise<TemplateResponseDto> {
    console.log(`[TemplatesService] Getting template: ${key}`);

    const template = await this.prisma.template.findUnique({
      where: {
        key,
        isActive: true
      }
    });

    if (!template) {
      throw new NotFoundException(`Template with key "${key}" not found or not active`);
    }

    return {
      key: template.key,
      name: template.name,
      description: template.description,
      version: template.version,
      previewImage: template.previewImage,
      supportedSections: template.supportedSections,
      defaultLayout: template.defaultLayout,
      isActive: template.isActive,
      createdAt: template.createdAt
    };
  }

  /**
   * Check if template exists and is active
   */
  async exists(key: string): Promise<boolean> {
    const template = await this.prisma.template.findUnique({
      where: {
        key,
        isActive: true
      },
      select: { key: true }
    });

    return !!template;
  }

  /**
   * Get supported sections for a template
   */
  async getSupportedSections(templateKey: string): Promise<string[]> {
    console.log(`[TemplatesService] Getting supported sections for template: ${templateKey}`);

    const template = await this.prisma.template.findUnique({
      where: {
        key: templateKey,
        isActive: true
      },
      select: { supportedSections: true }
    });

    if (!template) {
      throw new NotFoundException(`Template with key "${templateKey}" not found`);
    }

    return template.supportedSections;
  }

  /**
   * Get default layout for a template
   */
  async getDefaultLayout(templateKey: string): Promise<any> {
    console.log(`[TemplatesService] Getting default layout for template: ${templateKey}`);

    const template = await this.prisma.template.findUnique({
      where: {
        key: templateKey,
        isActive: true
      },
      select: { defaultLayout: true }
    });

    if (!template) {
      throw new NotFoundException(`Template with key "${templateKey}" not found`);
    }

    return template.defaultLayout;
  }

  /**
   * Validate section types against template
   */
  async validateSectionTypes(templateKey: string, sectionTypes: string[]): Promise<void> {
    const supportedSections = await this.getSupportedSections(templateKey);

    const unsupportedSections = sectionTypes.filter(type => !supportedSections.includes(type));

    if (unsupportedSections.length > 0) {
      throw new BadRequestException(
        `Template "${templateKey}" does not support section types: ${unsupportedSections.join(', ')}`
      );
    }
  }

  // ==================== ADMIN ONLY METHODS ====================

  /**
   * Create template (Admin only - for seeding/management)
   * This should typically only be used in seeding or by super admins
   */
  async create(createDto: CreateTemplateDto): Promise<TemplateResponseDto> {
    console.log(`[TemplatesService] ADMIN: Creating template: ${createDto.key}`);

    // Check if template key already exists
    const existingTemplate = await this.prisma.template.findUnique({
      where: { key: createDto.key }
    });

    if (existingTemplate) {
      throw new BadRequestException(`Template with key "${createDto.key}" already exists`);
    }

    // Validate default layout structure
    if (!createDto.defaultLayout || typeof createDto.defaultLayout !== 'object') {
      throw new BadRequestException('Default layout must be a valid object');
    }

    // Validate supported sections
    if (!Array.isArray(createDto.supportedSections) || createDto.supportedSections.length === 0) {
      throw new BadRequestException('Supported sections must be a non-empty array');
    }

    const template = await this.prisma.template.create({
      data: {
        key: createDto.key,
        name: createDto.name,
        description: createDto.description,
        version: createDto.version,
        previewImage: createDto.previewImage,
        supportedSections: createDto.supportedSections,
        defaultLayout: createDto.defaultLayout,
        isActive: createDto.isActive ?? true
      }
    });

    console.log(`[TemplatesService] ADMIN: Template created successfully: ${template.key}`);

    return {
      key: template.key,
      name: template.name,
      description: template.description,
      version: template.version,
      previewImage: template.previewImage,
      supportedSections: template.supportedSections,
      defaultLayout: template.defaultLayout,
      isActive: template.isActive,
      createdAt: template.createdAt
    };
  }

  /**
   * Deactivate template (Admin only)
   */
  async deactivate(key: string): Promise<void> {
    console.log(`[TemplatesService] ADMIN: Deactivating template: ${key}`);

    const template = await this.prisma.template.findUnique({
      where: { key }
    });

    if (!template) {
      throw new NotFoundException(`Template with key "${key}" not found`);
    }

    await this.prisma.template.update({
      where: { key },
      data: { isActive: false }
    });

    console.log(`[TemplatesService] ADMIN: Template deactivated: ${key}`);
  }

  /**
   * Get all templates including inactive (Admin only)
   */
  async findAllForAdmin(): Promise<TemplateResponseDto[]> {
    console.log('[TemplatesService] ADMIN: Getting all templates (including inactive)');

    const templates = await this.prisma.template.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return templates.map(template => ({
      key: template.key,
      name: template.name,
      description: template.description,
      version: template.version,
      previewImage: template.previewImage,
      supportedSections: template.supportedSections,
      defaultLayout: template.defaultLayout,
      isActive: template.isActive,
      createdAt: template.createdAt
    }));
  }
}