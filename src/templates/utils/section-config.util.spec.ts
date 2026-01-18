/**
 * Section Configuration Utility Tests
 * Tests section normalization and validation for templates
 */
import { SectionConfigUtil, SectionTypeConfig } from './section-config.util';

describe('SectionConfigUtil', () => {
  describe('Section Normalization for printing-premium-v1', () => {
    const printingPremiumConfig: SectionTypeConfig[] = SectionConfigUtil.getPrintingPremiumV1Config();

    it('should normalize section with variant "default" to "premium"', () => {
      const sections = [
        { type: 'hero', variant: 'default', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(true);
      expect(result.normalizedSections).toBeDefined();
      expect(result.normalizedSections![0].variant).toBe('premium');
      expect(result.normalizedSections![0].type).toBe('hero');
    });

    it('should normalize section with missing variant to "premium"', () => {
      const sections = [
        { type: 'hero', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(true);
      expect(result.normalizedSections).toBeDefined();
      expect(result.normalizedSections![0].variant).toBe('premium');
      expect(result.normalizedSections![0].type).toBe('hero');
    });

    it('should normalize section with empty variant to "premium"', () => {
      const sections = [
        { type: 'services', variant: '', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(true);
      expect(result.normalizedSections).toBeDefined();
      expect(result.normalizedSections![0].variant).toBe('premium');
      expect(result.normalizedSections![0].type).toBe('services');
    });

    it('should accept valid section with explicit premium variant', () => {
      const sections = [
        { type: 'testimonials', variant: 'premium', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(true);
      expect(result.normalizedSections).toBeDefined();
      expect(result.normalizedSections![0].variant).toBe('premium');
      expect(result.normalizedSections![0].type).toBe('testimonials');
    });

    it('should reject section with unknown variant', () => {
      const sections = [
        { type: 'hero', variant: 'gold', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe('SECTION_VARIANT_INVALID');
      expect(result.errors![0].message).toContain('Invalid variant "gold"');
      expect(result.errors![0].allowedVariants).toEqual(['premium']);
    });

    it('should reject section with unknown type', () => {
      const sections = [
        { type: 'unknown', variant: 'premium', order: 1, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe('SECTION_TYPE_UNKNOWN');
      expect(result.errors![0].message).toContain('Unknown type "unknown"');
      expect(result.errors![0].supportedTypes).toEqual([
        'hero', 'services', 'portfolio', 'process', 'testimonials', 'cta'
      ]);
    });

    it('should handle multiple sections with mixed normalization needs', () => {
      const sections = [
        { type: 'hero', variant: 'default', order: 1, propsJson: {} },
        { type: 'services', order: 2, propsJson: {} },
        { type: 'testimonials', variant: 'premium', order: 3, propsJson: {} }
      ];

      const result = SectionConfigUtil.normalizeSections(sections, printingPremiumConfig);

      expect(result.isValid).toBe(true);
      expect(result.normalizedSections).toBeDefined();
      expect(result.normalizedSections!).toHaveLength(3);

      // All should have explicit premium variants
      result.normalizedSections!.forEach(section => {
        expect(section.variant).toBe('premium');
      });

      expect(result.normalizedSections![0].type).toBe('hero');
      expect(result.normalizedSections![1].type).toBe('services');
      expect(result.normalizedSections![2].type).toBe('testimonials');
    });
  });

  describe('Legacy Format Parsing', () => {
    it('should parse legacy format correctly', () => {
      const legacyStrings = [
        'hero:premium',
        'services:premium',
        'portfolio:premium',
        'testimonials:premium'
      ];

      const config = SectionConfigUtil.parseTypeVariantStrings(legacyStrings);

      expect(config).toHaveLength(4);
      expect(config[0]).toEqual({
        type: 'hero',
        variants: ['premium'],
        defaultVariant: 'premium'
      });
      expect(config[1]).toEqual({
        type: 'services',
        variants: ['premium'],
        defaultVariant: 'premium'
      });
    });

    it('should get canonical config for printing-premium-v1', () => {
      const config = SectionConfigUtil.getTemplateConfig(
        ['hero:premium', 'services:premium'],
        'printing-premium-v1'
      );

      // Should return canonical config, not parsed legacy
      expect(config).toEqual(expect.arrayContaining([
        { type: 'hero', variants: ['premium'], defaultVariant: 'premium' },
        { type: 'services', variants: ['premium'], defaultVariant: 'premium' }
      ]));
      expect(config).toHaveLength(6); // All 6 printing premium types
    });
  });

  describe('Error Formatting', () => {
    it('should format validation errors clearly', () => {
      const errors = [
        {
          message: 'Section 1: Invalid variant "gold"',
          code: 'SECTION_VARIANT_INVALID',
          allowedVariants: ['premium']
        },
        {
          message: 'Section 2: Unknown type "unknown"',
          code: 'SECTION_TYPE_UNKNOWN',
          supportedTypes: ['hero', 'services']
        }
      ];

      const formatted = SectionConfigUtil.formatValidationErrors(errors);

      expect(formatted).toContain('Invalid variant "gold" (allowed: premium)');
      expect(formatted).toContain('Unknown type "unknown" (supported types: hero, services)');
    });
  });
});