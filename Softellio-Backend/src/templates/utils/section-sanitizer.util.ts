import { Logger } from '@nestjs/common';

/**
 * Section Sanitization Utility
 *
 * Safely removes client-side fields that should not be persisted on the server.
 * This prevents "forbidden fields" validation errors while maintaining security.
 */
export class SectionSanitizerUtil {
  private static readonly logger = new Logger(SectionSanitizerUtil.name);

  /**
   * Client-side fields that should be stripped before server processing.
   * These are typically used for frontend state management but not persisted.
   */
  private static readonly CLIENT_ONLY_FIELDS = [
    'id',           // Frontend component IDs
    '_id',          // Alternative ID fields
    'clientId',     // Client-side identifiers
    'tempId',       // Temporary IDs
    'key',          // React keys or similar
    '__typename',   // GraphQL typename
    '__proto__',    // Prototype pollution protection
    'constructor',  // Constructor pollution protection
  ];

  /**
   * Dangerous fields that should never be present (security protection)
   */
  private static readonly DANGEROUS_FIELDS = [
    '__proto__',
    'constructor',
    'prototype',
    'eval',
    'function',
  ];

  /**
   * Sanitize an array of sections by removing client-only and dangerous fields
   */
  static sanitizeSections(sections: any[]): any[] {
    if (!Array.isArray(sections)) {
      return [];
    }

    const sanitizedSections = sections.map((section, index) =>
      this.sanitizeSection(section, index)
    ).filter(Boolean); // Remove any null results

    if (process.env.NODE_ENV === 'development' && sanitizedSections.length !== sections.length) {
      this.logger.debug(`Sanitized ${sections.length - sanitizedSections.length} invalid sections`);
    }

    return sanitizedSections;
  }

  /**
   * Sanitize a single section object
   */
  static sanitizeSection(section: any, index?: number): any | null {
    if (!section || typeof section !== 'object') {
      this.logger.warn(`Section ${index ?? '?'} is not a valid object, skipping`);
      return null;
    }

    const sanitized = { ...section };
    let removedFields: string[] = [];

    // Remove client-only fields
    for (const field of this.CLIENT_ONLY_FIELDS) {
      if (field in sanitized) {
        delete sanitized[field];
        removedFields.push(field);
      }
    }

    // Security: Check for dangerous fields (these should never be present)
    for (const field of this.DANGEROUS_FIELDS) {
      if (field in sanitized) {
        delete sanitized[field];
        removedFields.push(`${field} (SECURITY)`);
        this.logger.warn(`Removed dangerous field "${field}" from section ${index ?? '?'}`);
      }
    }

    // Recursively sanitize propsJson if it's an object
    if (sanitized.propsJson && typeof sanitized.propsJson === 'object') {
      sanitized.propsJson = this.sanitizeObject(sanitized.propsJson);
    }

    // Log removal in development/debug mode
    if (removedFields.length > 0) {
      const shouldLog = process.env.NODE_ENV === 'development' || process.env.DEBUG_SECTION_SANITIZATION === 'true';
      if (shouldLog) {
        this.logger.debug(`Sanitized section ${index ?? '?'} (${section.type}): removed [${removedFields.join(', ')}]`);
      }
    }

    return sanitized;
  }

  /**
   * Recursively sanitize nested objects (like propsJson)
   */
  private static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    const sanitized = { ...obj };

    // Remove dangerous fields from nested objects
    for (const field of this.DANGEROUS_FIELDS) {
      if (field in sanitized) {
        delete sanitized[field];
        this.logger.warn(`Removed dangerous field "${field}" from nested object`);
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      }
    }

    return sanitized;
  }

  /**
   * Check if a section contains any forbidden fields without removing them
   * Useful for validation or testing
   */
  static hasForbiddenFields(section: any): { hasForbidden: boolean; forbiddenFields: string[] } {
    if (!section || typeof section !== 'object') {
      return { hasForbidden: false, forbiddenFields: [] };
    }

    const sectionKeys = Object.keys(section);
    const allForbiddenFields = [...this.CLIENT_ONLY_FIELDS, ...this.DANGEROUS_FIELDS];

    const foundForbidden = sectionKeys.filter(key =>
      allForbiddenFields.some(forbidden => key.includes(forbidden))
    );

    return {
      hasForbidden: foundForbidden.length > 0,
      forbiddenFields: foundForbidden
    };
  }

  /**
   * Get sanitization statistics for monitoring/debugging
   */
  static getSanitizationStats(originalSections: any[]): {
    originalCount: number;
    sanitizedCount: number;
    fieldsRemoved: number;
    sectionsModified: number;
  } {
    if (!Array.isArray(originalSections)) {
      return { originalCount: 0, sanitizedCount: 0, fieldsRemoved: 0, sectionsModified: 0 };
    }

    let fieldsRemoved = 0;
    let sectionsModified = 0;

    for (const section of originalSections) {
      const check = this.hasForbiddenFields(section);
      if (check.hasForbidden) {
        sectionsModified++;
        fieldsRemoved += check.forbiddenFields.length;
      }
    }

    return {
      originalCount: originalSections.length,
      sanitizedCount: originalSections.length, // We don't remove entire sections, just fields
      fieldsRemoved,
      sectionsModified
    };
  }
}