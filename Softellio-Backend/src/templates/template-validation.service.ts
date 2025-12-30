import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TemplatesService } from './templates.service';
import { SiteConfigService } from './site-config.service';

@Injectable()
export class TemplateValidationService {
  private readonly logger = new Logger(TemplateValidationService.name);

  constructor(
    private prisma: PrismaService,
    private templatesService: TemplatesService,
    private siteConfigService: SiteConfigService
  ) {}

  /**
   * 🔴 STRICT: Validate section types against tenant's template constraints
   * Core rule: Tenant CANNOT add section types not supported by their template
   */
  async validateSectionTypes(tenantId: number, sectionTypes: string[]): Promise<void> {
    this.logger.log(`[TEMPLATE_VALIDATION] 🛡️  Validating section types for tenant ${tenantId}: ${sectionTypes.join(', ')}`);

    // Get tenant's site configuration
    const siteConfig = await this.siteConfigService.getForTenant(tenantId);

    if (!siteConfig) {
      this.logger.warn(`[TEMPLATE_VALIDATION] ⚠️  No site config for tenant ${tenantId}, allowing all sections`);
      return; // No template constraints if no config
    }

    // Get template supported sections
    const template = await this.templatesService.findByKey(siteConfig.templateKey);
    const supportedSections = template.supportedSections;

    this.logger.log(`[TEMPLATE_VALIDATION] Template ${template.key} supports: ${supportedSections.join(', ')}`);

    // Find unsupported section types
    const unsupportedSections = sectionTypes.filter(type => !supportedSections.includes(type));

    if (unsupportedSections.length > 0) {
      const errorMessage = `Template "${template.key}" does not support section types: ${unsupportedSections.join(', ')}. ` +
        `Supported types: ${supportedSections.join(', ')}`;

      this.logger.error(`[TEMPLATE_VALIDATION] ❌ ${errorMessage}`);

      throw new BadRequestException({
        message: errorMessage,
        code: 'TEMPLATE_SECTION_TYPE_VIOLATION',
        templateKey: template.key,
        supportedSections,
        rejectedSections: unsupportedSections,
        constraint: 'TEMPLATE_INHERITANCE'
      });
    }

    this.logger.log(`[TEMPLATE_VALIDATION] ✅ All section types valid for template ${template.key}`);
  }

  /**
   * 🔴 STRICT: Validate layout inheritance rules
   * Core rule: Layout structure must follow template core constraints
   */
  async validateLayoutInheritance(tenantId: number, sections: any[]): Promise<void> {
    this.logger.log(`[TEMPLATE_VALIDATION] 🏗️  Validating layout inheritance for tenant ${tenantId}`);

    // Extract section types from layout
    const sectionTypes = sections.map(section => section.type).filter(Boolean);

    if (sectionTypes.length === 0) {
      return; // Empty layouts are allowed
    }

    // Validate section types against template
    await this.validateSectionTypes(tenantId, sectionTypes);

    // Additional inheritance rules
    await this.validateSectionStructure(sections);
    await this.validateSectionOrdering(sections);

    this.logger.log(`[TEMPLATE_VALIDATION] ✅ Layout inheritance validation passed`);
  }

  /**
   * Validate section structure integrity
   */
  private async validateSectionStructure(sections: any[]): Promise<void> {
    sections.forEach((section, index) => {
      // Required fields check
      if (!section.type) {
        throw new BadRequestException({
          message: `Section ${index + 1} missing required 'type' field`,
          code: 'SECTION_STRUCTURE_VIOLATION',
          sectionIndex: index,
          constraint: 'REQUIRED_FIELDS'
        });
      }

      if (typeof section.order !== 'number') {
        throw new BadRequestException({
          message: `Section ${index + 1} (${section.type}) missing or invalid 'order' field`,
          code: 'SECTION_STRUCTURE_VIOLATION',
          sectionIndex: index,
          constraint: 'ORDER_REQUIRED'
        });
      }

      // PropsJson validation
      if (section.propsJson && typeof section.propsJson !== 'object') {
        throw new BadRequestException({
          message: `Section ${index + 1} (${section.type}) propsJson must be an object`,
          code: 'SECTION_STRUCTURE_VIOLATION',
          sectionIndex: index,
          constraint: 'PROPS_JSON_TYPE'
        });
      }

      // Forbidden fields check (from sanitization)
      const forbiddenFields = ['id', 'property'];
      const sectionKeys = Object.keys(section);
      const foundForbiddenFields = sectionKeys.filter(key =>
        forbiddenFields.some(forbidden => key.includes(forbidden))
      );

      if (foundForbiddenFields.length > 0) {
        throw new BadRequestException({
          message: `Section ${index + 1} (${section.type}) contains forbidden fields: ${foundForbiddenFields.join(', ')}`,
          code: 'SECTION_STRUCTURE_VIOLATION',
          sectionIndex: index,
          constraint: 'FORBIDDEN_FIELDS',
          forbiddenFields: foundForbiddenFields
        });
      }
    });
  }

  /**
   * Validate section ordering rules
   */
  private async validateSectionOrdering(sections: any[]): Promise<void> {
    const orders = sections.map(section => section.order);

    // Check for duplicate orders
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new BadRequestException({
        message: 'Sections must have unique order values',
        code: 'SECTION_ORDERING_VIOLATION',
        constraint: 'UNIQUE_ORDERS',
        orders
      });
    }

    // Check for non-positive orders
    const invalidOrders = orders.filter(order => order < 1);
    if (invalidOrders.length > 0) {
      throw new BadRequestException({
        message: 'Section orders must be positive integers starting from 1',
        code: 'SECTION_ORDERING_VIOLATION',
        constraint: 'POSITIVE_ORDERS',
        invalidOrders
      });
    }
  }

  /**
   * Get template constraints for tenant
   */
  async getTenantConstraints(tenantId: number): Promise<any> {
    const siteConfig = await this.siteConfigService.getForTenant(tenantId);

    if (!siteConfig) {
      return {
        hasTemplate: false,
        supportedSections: [],
        templateKey: null
      };
    }

    const template = await this.templatesService.findByKey(siteConfig.templateKey);

    return {
      hasTemplate: true,
      templateKey: template.key,
      templateName: template.name,
      templateVersion: template.version,
      supportedSections: template.supportedSections,
      defaultLayout: template.defaultLayout,
      constraints: {
        sectionTypes: template.supportedSections,
        inheritance: 'TEMPLATE_CORE_PROTECTED',
        allowedChanges: ['variant', 'content', 'order', 'enabled']
      }
    };
  }

  /**
   * Validate single section type
   */
  async validateSingleSectionType(tenantId: number, sectionType: string): Promise<boolean> {
    try {
      await this.validateSectionTypes(tenantId, [sectionType]);
      return true;
    } catch (error) {
      this.logger.warn(`[TEMPLATE_VALIDATION] Section type ${sectionType} rejected for tenant ${tenantId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get validation summary for debugging
   */
  async getValidationSummary(tenantId: number, sections: any[]): Promise<any> {
    const constraints = await this.getTenantConstraints(tenantId);
    const sectionTypes = sections.map(s => s.type).filter(Boolean);

    const validationResults = {
      tenantId,
      constraints,
      sections: {
        count: sections.length,
        types: sectionTypes,
        orders: sections.map(s => s.order)
      },
      validation: {
        sectionTypesValid: true,
        structureValid: true,
        orderingValid: true,
        isValid: true,
        errors: []
      }
    };

    // Test each validation layer
    try {
      await this.validateSectionTypes(tenantId, sectionTypes);
    } catch (error) {
      validationResults.validation.sectionTypesValid = false;
      validationResults.validation.errors.push(error.message);
    }

    try {
      await this.validateSectionStructure(sections);
    } catch (error) {
      validationResults.validation.structureValid = false;
      validationResults.validation.errors.push(error.message);
    }

    try {
      await this.validateSectionOrdering(sections);
    } catch (error) {
      validationResults.validation.orderingValid = false;
      validationResults.validation.errors.push(error.message);
    }

    validationResults.validation.isValid =
      validationResults.validation.sectionTypesValid &&
      validationResults.validation.structureValid &&
      validationResults.validation.orderingValid;

    return validationResults;
  }
}