/**
 * Utility functions to sanitize CMS payloads by removing UI-generated id fields
 * that should not be sent to the backend for validation or persistence.
 */

/**
 * Deep removes 'id' fields from objects and arrays recursively.
 * Preserves all other properties while sanitizing nested structures.
 *
 * @param obj - The object to sanitize
 * @param removeFromRoot - Whether to remove 'id' from the root level (default: false)
 * @returns Sanitized object without id fields in nested structures
 */
export function deepRemoveIdFields(obj: any, removeFromRoot: boolean = false): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepRemoveIdFields(item, true));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip 'id' fields based on context:
      // - Always skip in nested objects (removeFromRoot = true)
      // - Skip in root only if explicitly requested (removeFromRoot = true)
      if (key === 'id' && removeFromRoot) {
        console.log(`[PayloadSanitizer] Removed id field from nested object`);
        continue;
      }

      // Recursively sanitize nested objects/arrays
      sanitized[key] = deepRemoveIdFields(value, true);
    }

    return sanitized;
  }

  // Primitive values (string, number, boolean) - return as-is
  return obj;
}

/**
 * Sanitizes a section object by removing id fields from propsJson and nested objects.
 * Preserves section-level id if it exists (needed for updates).
 *
 * @param section - Section object from Portal
 * @returns Sanitized section object
 */
export function sanitizeSectionForSave(section: any): any {
  if (!section || typeof section !== 'object') {
    return section;
  }

  const sanitized = { ...section };

  // Sanitize propsJson deeply - remove all nested id fields
  if (sanitized.propsJson && typeof sanitized.propsJson === 'object') {
    sanitized.propsJson = deepRemoveIdFields(sanitized.propsJson, true);
    console.log(`[PayloadSanitizer] Sanitized propsJson for section type: ${section.type}`);
  }

  // Remove any unexpected 'property' field that might contain ids
  if (sanitized.property) {
    console.log(`[PayloadSanitizer] Removed unexpected 'property' field from section`);
    delete sanitized.property;
  }

  return sanitized;
}

/**
 * Sanitizes a layout payload by cleaning all sections.
 *
 * @param layoutPayload - Layout update payload from Portal
 * @returns Sanitized layout payload
 */
export function sanitizeLayoutForSave(layoutPayload: any): any {
  if (!layoutPayload || typeof layoutPayload !== 'object') {
    return layoutPayload;
  }

  const sanitized = { ...layoutPayload };

  // Sanitize sections array if it exists
  if (sanitized.sections && Array.isArray(sanitized.sections)) {
    sanitized.sections = sanitized.sections.map((section: any) =>
      sanitizeSectionForSave(section)
    );
    console.log(`[PayloadSanitizer] Sanitized ${sanitized.sections.length} sections`);
  }

  return sanitized;
}

/**
 * Counts the number of id fields that would be removed from an object.
 * Useful for logging and debugging purposes.
 *
 * @param obj - Object to analyze
 * @returns Number of id fields that would be removed
 */
export function countIdFields(obj: any): number {
  if (obj === null || obj === undefined) {
    return 0;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countIdFields(item), 0);
  }

  if (typeof obj === 'object') {
    let count = 0;

    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id') {
        count += 1;
      }
      count += countIdFields(value);
    }

    return count;
  }

  return 0;
}