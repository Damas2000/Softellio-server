import { SectionSanitizerUtil } from './section-sanitizer.util';

describe('SectionSanitizerUtil', () => {
  describe('sanitizeSections', () => {
    it('should remove client-only id field while preserving valid fields', () => {
      const sections = [
        {
          id: 'client-123',           // Should be removed
          type: 'hero',               // Should be kept
          variant: 'default',         // Should be kept
          order: 1,                   // Should be kept
          enabled: true,              // Should be kept
          propsJson: {
            title: 'Hello World',
            buttonText: 'Click me'
          }
        }
      ];

      const result = SectionSanitizerUtil.sanitizeSections(sections);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'hero',
        variant: 'default',
        order: 1,
        enabled: true,
        propsJson: {
          title: 'Hello World',
          buttonText: 'Click me'
        }
      });
      expect(result[0]).not.toHaveProperty('id');
    });

    it('should remove multiple client-only fields', () => {
      const sections = [
        {
          _id: 'mongo-456',
          clientId: 'temp-789',
          type: 'features',
          order: 2
        }
      ];

      const result = SectionSanitizerUtil.sanitizeSections(sections);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'features',
        order: 2
      });
      expect(result[0]).not.toHaveProperty('_id');
      expect(result[0]).not.toHaveProperty('clientId');
    });

    it('should handle empty array', () => {
      const result = SectionSanitizerUtil.sanitizeSections([]);
      expect(result).toEqual([]);
    });

    it('should preserve clean sections without forbidden fields', () => {
      const cleanSections = [
        {
          type: 'hero',
          variant: 'default',
          order: 1,
          enabled: true,
          propsJson: {
            title: 'Clean section'
          }
        }
      ];

      const result = SectionSanitizerUtil.sanitizeSections(cleanSections);
      expect(result).toEqual(cleanSections);
    });
  });

  describe('hasForbiddenFields', () => {
    it('should detect id field as forbidden', () => {
      const section = {
        id: 'test-123',
        type: 'hero',
        variant: 'default'
      };

      const result = SectionSanitizerUtil.hasForbiddenFields(section);

      expect(result.hasForbidden).toBe(true);
      expect(result.forbiddenFields).toContain('id');
    });

    it('should return false for clean sections', () => {
      const section = {
        type: 'hero',
        variant: 'default',
        order: 1,
        enabled: true,
        propsJson: { title: 'Clean' }
      };

      const result = SectionSanitizerUtil.hasForbiddenFields(section);

      expect(result.hasForbidden).toBe(false);
      expect(result.forbiddenFields).toEqual([]);
    });
  });
});