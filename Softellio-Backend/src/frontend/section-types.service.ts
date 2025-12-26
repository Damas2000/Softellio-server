import { Injectable, BadRequestException } from '@nestjs/common';
import {
  SECTION_TYPES,
  getAvailableSectionTypes,
  getSectionTypeConfig,
  getVariantConfig,
  validateSectionProps,
  getDefaultProps,
  SectionTypeConfig,
  SectionVariant
} from './section-types.config';

@Injectable()
export class SectionTypesService {

  /**
   * Get all available section types
   */
  getAvailableTypes(): SectionTypeConfig[] {
    return getAvailableSectionTypes();
  }

  /**
   * Get section types grouped by category
   */
  getTypesByCategory() {
    const types = getAvailableSectionTypes();
    const categories = ['content', 'layout', 'data', 'media', 'navigation'] as const;

    return categories.reduce((acc, category) => {
      acc[category] = types.filter(type => type.category === category);
      return acc;
    }, {} as { [key: string]: SectionTypeConfig[] });
  }

  /**
   * Get configuration for specific section type
   */
  getTypeConfig(type: string): SectionTypeConfig | null {
    return getSectionTypeConfig(type);
  }

  /**
   * Get all variants for a section type
   */
  getVariants(type: string): SectionVariant[] {
    const config = getSectionTypeConfig(type);
    return config ? config.variants : [];
  }

  /**
   * Get specific variant configuration
   */
  getVariantConfig(type: string, variant: string): SectionVariant | null {
    return getVariantConfig(type, variant);
  }

  /**
   * Validate section props against schema
   */
  validateProps(type: string, variant: string, props: any): { isValid: boolean; errors: string[] } {
    return validateSectionProps(type, variant, props);
  }

  /**
   * Validate and throw if invalid
   */
  validatePropsStrict(type: string, variant: string, props: any): void {
    const validation = this.validateProps(type, variant, props);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid section properties',
        errors: validation.errors,
        type,
        variant
      });
    }
  }

  /**
   * Get default props for section type/variant
   */
  getDefaultProps(type: string, variant?: string): any {
    const config = getSectionTypeConfig(type);
    if (!config) return {};

    const variantName = variant || config.defaultVariant;
    return getDefaultProps(type, variantName);
  }

  /**
   * Validate section type and variant exist
   */
  validateTypeAndVariant(type: string, variant?: string): { type: string; variant: string } {
    const config = getSectionTypeConfig(type);
    if (!config) {
      throw new BadRequestException(`Invalid section type: ${type}`);
    }

    const variantName = variant || config.defaultVariant;
    const variantConfig = getVariantConfig(type, variantName);
    if (!variantConfig) {
      throw new BadRequestException(`Invalid variant ${variantName} for section type ${type}`);
    }

    return { type, variant: variantName };
  }

  /**
   * Merge props with defaults
   */
  mergeWithDefaults(type: string, variant: string, props: any): any {
    const defaults = this.getDefaultProps(type, variant);
    return { ...defaults, ...props };
  }

  /**
   * Get schema information for frontend form generation
   */
  getSchemaForEditor(type: string, variant: string) {
    const variantConfig = getVariantConfig(type, variant);
    if (!variantConfig) {
      throw new BadRequestException(`Invalid section type/variant: ${type}/${variant}`);
    }

    return {
      type,
      variant,
      displayName: variantConfig.displayName,
      description: variantConfig.description,
      schema: variantConfig.propsSchema,
      defaults: this.getDefaultProps(type, variant)
    };
  }

  /**
   * Search section types by keyword
   */
  searchTypes(query: string): SectionTypeConfig[] {
    if (!query || query.trim().length < 2) {
      return this.getAvailableTypes();
    }

    const searchTerm = query.toLowerCase().trim();
    return this.getAvailableTypes().filter(type =>
      type.type.toLowerCase().includes(searchTerm) ||
      type.displayName.toLowerCase().includes(searchTerm) ||
      type.description.toLowerCase().includes(searchTerm) ||
      type.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get section types suitable for specific contexts
   */
  getTypesForContext(context: 'homepage' | 'page' | 'footer' | 'header'): SectionTypeConfig[] {
    const allTypes = this.getAvailableTypes();

    switch (context) {
      case 'homepage':
        return allTypes; // All types available for homepage

      case 'page':
        // Exclude hero sections for inner pages
        return allTypes.filter(type => type.type !== 'hero');

      case 'footer':
        // Only contact and navigation types for footer
        return allTypes.filter(type =>
          ['contactCta', 'teamGrid'].includes(type.type)
        );

      case 'header':
        // Navigation and simple content only
        return allTypes.filter(type =>
          type.category === 'navigation' || type.category === 'content'
        );

      default:
        return allTypes;
    }
  }

  /**
   * Check if section type is available
   */
  isTypeAvailable(type: string): boolean {
    const config = getSectionTypeConfig(type);
    return config ? config.isAvailable : false;
  }

  /**
   * Get type statistics
   */
  getTypeStatistics() {
    const types = this.getAvailableTypes();
    const categories = this.getTypesByCategory();

    return {
      totalTypes: types.length,
      categoryCounts: Object.entries(categories).map(([category, categoryTypes]) => ({
        category,
        count: categoryTypes.length,
        types: categoryTypes.map(t => t.type)
      })),
      mostVariants: types.reduce((max, type) =>
        type.variants.length > max.variants ? { type: type.type, variants: type.variants.length } : max,
        { type: '', variants: 0 }
      )
    };
  }
}