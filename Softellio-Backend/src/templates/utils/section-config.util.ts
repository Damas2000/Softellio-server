/**
 * Section Configuration Utility
 * Handles structured template section definitions and normalization
 */

export interface SectionTypeConfig {
  type: string;
  variants: string[];
  defaultVariant?: string;
}

export interface SectionValidationResult {
  isValid: boolean;
  normalizedSection?: any;
  error?: {
    message: string;
    code: string;
    sectionIndex?: number;
    allowedVariants?: string[];
    supportedTypes?: string[];
  };
}

export class SectionConfigUtil {
  /**
   * Convert legacy "type:variant" strings to structured format
   * For printing-premium-v1: ["hero:premium", "services:premium"]
   * => [{ type: "hero", variants: ["premium"], defaultVariant: "premium" }, ...]
   */
  static parseTypeVariantStrings(legacyStrings: string[]): SectionTypeConfig[] {
    const typeMap = new Map<string, Set<string>>();

    // Parse all type:variant strings
    for (const typeVariant of legacyStrings) {
      if (!typeVariant.includes(':')) {
        // Plain type without variant - assume single variant named after template
        typeMap.set(typeVariant, new Set(['default']));
        continue;
      }

      const [type, variant] = typeVariant.split(':');
      if (!typeMap.has(type)) {
        typeMap.set(type, new Set());
      }
      typeMap.get(type)!.add(variant);
    }

    // Convert to structured format
    return Array.from(typeMap.entries()).map(([type, variantSet]) => {
      const variants = Array.from(variantSet);
      return {
        type,
        variants,
        defaultVariant: variants.length === 1 ? variants[0] : undefined
      };
    });
  }

  /**
   * Get canonical section configuration for printing-premium-v1
   * This is our reference implementation
   */
  static getPrintingPremiumV1Config(): SectionTypeConfig[] {
    return [
      { type: 'hero', variants: ['premium'], defaultVariant: 'premium' },
      { type: 'services', variants: ['premium'], defaultVariant: 'premium' },
      { type: 'portfolio', variants: ['premium'], defaultVariant: 'premium' },
      { type: 'process', variants: ['premium'], defaultVariant: 'premium' },
      { type: 'testimonials', variants: ['premium'], defaultVariant: 'premium' },
      { type: 'cta', variants: ['premium'], defaultVariant: 'premium' }
    ];
  }

  /**
   * Normalize incoming section before validation
   * Handles missing/default variants by applying template rules
   */
  static normalizeSection(
    section: any,
    sectionIndex: number,
    templateConfig: SectionTypeConfig[]
  ): SectionValidationResult {
    if (!section || !section.type) {
      return {
        isValid: false,
        error: {
          message: `Section ${sectionIndex + 1} missing required 'type' field`,
          code: 'SECTION_TYPE_MISSING',
          sectionIndex
        }
      };
    }

    const { type } = section;
    let { variant } = section;

    // Find type configuration
    const typeConfig = templateConfig.find(config => config.type === type);
    if (!typeConfig) {
      return {
        isValid: false,
        error: {
          message: `Section ${sectionIndex + 1}: Unknown type "${type}"`,
          code: 'SECTION_TYPE_UNKNOWN',
          sectionIndex,
          supportedTypes: templateConfig.map(c => c.type)
        }
      };
    }

    // Handle missing or "default" variant
    if (!variant || variant === '' || variant === 'default') {
      if (typeConfig.variants.length === 1) {
        // Auto-assign single variant
        variant = typeConfig.variants[0];
      } else if (typeConfig.defaultVariant) {
        // Use default variant
        variant = typeConfig.defaultVariant;
      } else {
        // Multiple variants, no default - require explicit choice
        return {
          isValid: false,
          error: {
            message: `Section ${sectionIndex + 1} (${type}): Variant required. Available variants: ${typeConfig.variants.join(', ')}`,
            code: 'SECTION_VARIANT_REQUIRED',
            sectionIndex,
            allowedVariants: typeConfig.variants
          }
        };
      }
    }

    // Validate variant
    if (!typeConfig.variants.includes(variant)) {
      return {
        isValid: false,
        error: {
          message: `Section ${sectionIndex + 1} (${type}): Invalid variant "${variant}". Available variants: ${typeConfig.variants.join(', ')}`,
          code: 'SECTION_VARIANT_INVALID',
          sectionIndex,
          allowedVariants: typeConfig.variants
        }
      };
    }

    // Return normalized section
    return {
      isValid: true,
      normalizedSection: {
        ...section,
        type,
        variant
      }
    };
  }

  /**
   * Normalize all sections in a layout
   */
  static normalizeSections(
    sections: any[],
    templateConfig: SectionTypeConfig[]
  ): {
    isValid: boolean;
    normalizedSections?: any[];
    errors?: any[]
  } {
    const normalizedSections: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < sections.length; i++) {
      const result = this.normalizeSection(sections[i], i, templateConfig);

      if (result.isValid && result.normalizedSection) {
        normalizedSections.push(result.normalizedSection);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, normalizedSections };
  }

  /**
   * Convert structured config back to legacy format for backward compatibility
   */
  static toLegacyFormat(configs: SectionTypeConfig[]): string[] {
    const legacyStrings: string[] = [];

    for (const config of configs) {
      for (const variant of config.variants) {
        legacyStrings.push(`${config.type}:${variant}`);
      }
    }

    return legacyStrings;
  }

  /**
   * Get template configuration from either legacy or structured format
   */
  static getTemplateConfig(
    supportedSections: string[] | SectionTypeConfig[],
    templateKey?: string
  ): SectionTypeConfig[] {
    // If already structured, return as-is
    if (supportedSections.length > 0 && typeof supportedSections[0] === 'object') {
      return supportedSections as SectionTypeConfig[];
    }

    // Handle known templates with canonical configs
    if (templateKey === 'printing-premium-v1') {
      return this.getPrintingPremiumV1Config();
    }

    // Parse legacy format
    return this.parseTypeVariantStrings(supportedSections as string[]);
  }

  /**
   * Generate detailed error message for validation failures
   */
  static formatValidationErrors(errors: any[]): string {
    if (errors.length === 0) return '';

    const errorMessages = errors.map(error => {
      let message = error.message;

      if (error.allowedVariants && error.allowedVariants.length > 0) {
        message += ` (allowed: ${error.allowedVariants.join(', ')})`;
      }

      if (error.supportedTypes && error.supportedTypes.length > 0) {
        message += ` (supported types: ${error.supportedTypes.join(', ')})`;
      }

      return message;
    });

    return errorMessages.join('; ');
  }
}