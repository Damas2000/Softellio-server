import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TemplatesService } from './templates.service';
import { SiteConfigService } from './site-config.service';
import { SectionConfigUtil, SectionTypeConfig } from './utils/section-config.util';
import { SectionSanitizerUtil } from './utils/section-sanitizer.util';

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
   * 🔴 STRICT: Validate layout inheritance rules with normalization
   * Core rule: Layout structure must follow template core constraints
   */
  async validateLayoutInheritance(tenantId: number, sections: any[]): Promise<any[]> {
    this.logger.log(`[TEMPLATE_VALIDATION] 🏗️  Validating layout inheritance for tenant ${tenantId}`);

    if (sections.length === 0) {
      return []; // Empty layouts are allowed
    }

    // 🧹 SANITIZE: Remove client-only fields before validation (prevents "forbidden fields" errors)
    const sanitizedSections = SectionSanitizerUtil.sanitizeSections(sections);

    if (sanitizedSections.length !== sections.length) {
      this.logger.warn(`[TEMPLATE_VALIDATION] ⚠️  Removed ${sections.length - sanitizedSections.length} invalid sections during sanitization`);
    }

    // Log sanitization stats in debug mode
    const shouldLogDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_SECTION_SANITIZATION === 'true';
    if (shouldLogDebug) {
      const stats = SectionSanitizerUtil.getSanitizationStats(sections);
      if (stats.fieldsRemoved > 0) {
        this.logger.debug(`[TEMPLATE_VALIDATION] 🧹 Sanitization stats: ${stats.sectionsModified} sections modified, ${stats.fieldsRemoved} fields removed`);
      }
    }

    // Get template configuration
    const templateConfig = await this.getTemplateConfig(tenantId);
    if (!templateConfig) {
      this.logger.warn(`[TEMPLATE_VALIDATION] ⚠️  No template config for tenant ${tenantId}, skipping validation`);
      return sanitizedSections; // Return sanitized sections even without template constraints
    }

    // 🔧 NORMALIZE: Apply template rules to fix missing/default variants
    const normalizedSections = await this.normalizeSections(sanitizedSections, templateConfig, tenantId);

    // Validate normalized sections
    await this.validateSectionStructure(normalizedSections);
    await this.validateSectionOrdering(normalizedSections);

    this.logger.log(`[TEMPLATE_VALIDATION] ✅ Layout inheritance validation passed`);
    return normalizedSections;
  }

  /**
   * 🔧 NORMALIZE: Apply template rules to incoming sections
   * Handles missing/default variants according to template configuration
   */
  async normalizeSections(sections: any[], templateConfig: SectionTypeConfig[], tenantId: number): Promise<any[]> {
    this.logger.log(`[TEMPLATE_VALIDATION] 🔧 Normalizing ${sections.length} sections for tenant ${tenantId}`);

    const result = SectionConfigUtil.normalizeSections(sections, templateConfig);

    if (!result.isValid && result.errors) {
      const errorMessage = SectionConfigUtil.formatValidationErrors(result.errors);

      this.logger.error(`[TEMPLATE_VALIDATION] ❌ Section normalization failed: ${errorMessage}`);

      throw new BadRequestException({
        message: `Section validation failed: ${errorMessage}`,
        code: 'SECTION_NORMALIZATION_FAILED',
        errors: result.errors,
        supportedTypes: templateConfig.map(c => ({
          type: c.type,
          variants: c.variants,
          defaultVariant: c.defaultVariant
        })),
        constraint: 'TEMPLATE_SECTION_VALIDATION'
      });
    }

    const normalizedSections = result.normalizedSections!;

    this.logger.log(`[TEMPLATE_VALIDATION] 🔧 Normalized ${normalizedSections.length} sections successfully`);

    // Log normalization details
    sections.forEach((original, index) => {
      const normalized = normalizedSections[index];
      if (original.variant !== normalized.variant) {
        this.logger.log(
          `[TEMPLATE_VALIDATION] 🔧 Section ${index + 1} (${original.type}): ` +
          `variant "${original.variant || 'undefined'}" → "${normalized.variant}"`
        );
      }
    });

    return normalizedSections;
  }

  /**
   * Get template configuration for tenant
   */
  async getTemplateConfig(tenantId: number): Promise<SectionTypeConfig[] | null> {
    const siteConfig = await this.siteConfigService.getForTenant(tenantId);
    if (!siteConfig) {
      return null;
    }

    const template = await this.templatesService.findByKey(siteConfig.templateKey);
    return SectionConfigUtil.getTemplateConfig(template.supportedSections, template.key);
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

      // Security check: Dangerous fields that should never be present after sanitization
      const dangerousFields = ['__proto__', 'constructor', 'prototype', 'eval', 'function'];
      const sectionKeys = Object.keys(section);
      const foundDangerousFields = sectionKeys.filter(key =>
        dangerousFields.some(dangerous => key.includes(dangerous))
      );

      if (foundDangerousFields.length > 0) {
        this.logger.error(`[TEMPLATE_VALIDATION] 🚨 SECURITY: Dangerous fields found after sanitization in section ${index + 1}: ${foundDangerousFields.join(', ')}`);
        throw new BadRequestException({
          message: `Section ${index + 1} (${section.type}) contains dangerous fields: ${foundDangerousFields.join(', ')}`,
          code: 'SECTION_SECURITY_VIOLATION',
          sectionIndex: index,
          constraint: 'DANGEROUS_FIELDS',
          dangerousFields: foundDangerousFields
        });
      }

      // Note: Client-side fields like 'id' are now handled by sanitization before this validation
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