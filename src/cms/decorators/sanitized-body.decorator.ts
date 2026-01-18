import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { sanitizeLayoutForSave, countIdFields } from '../utils/payload-sanitizer.util';

/**
 * Custom decorator that sanitizes request body by removing id fields
 * from nested objects before validation occurs.
 *
 * This prevents "property id should not exist" validation errors
 * when Portal sends UI-generated id fields in section properties.
 */
export const SanitizedBody = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const originalBody = request.body;

    // Enhanced logging for debugging
    console.log(`[SanitizedBody] CALLED for ${request.method} ${request.url}`);
    console.log(`[SanitizedBody] User-Agent:`, request.headers['user-agent']);
    console.log(`[SanitizedBody] Content-Type:`, request.headers['content-type']);

    if (!originalBody) {
      console.log(`[SanitizedBody] No body found in request`);
      return originalBody;
    }

    // Count id fields before sanitization for logging
    const idFieldCount = countIdFields(originalBody);

    // Log original payload structure for debugging
    console.log(`[SanitizedBody] Original body structure:`, {
      keys: Object.keys(originalBody),
      sectionsCount: originalBody.sections?.length || 0,
      hasPropertyFields: originalBody.sections?.some((s: any) => s.property) || false,
      idFieldCount
    });

    // Check for problematic property fields in sections
    if (originalBody.sections) {
      originalBody.sections.forEach((section: any, index: number) => {
        if (section.property) {
          console.log(`[SanitizedBody] ⚠️  Section ${index} has 'property' field:`, Object.keys(section.property));
          if (section.property.id) {
            console.log(`[SanitizedBody] ❌ Section ${index}.property contains id: ${section.property.id}`);
          }
        }
        if (section.propsJson && typeof section.propsJson === 'object') {
          const propsStr = JSON.stringify(section.propsJson);
          if (propsStr.includes('"id":')) {
            console.log(`[SanitizedBody] ⚠️  Section ${index}.propsJson contains id fields`);
          }
        }
      });
    }

    // Sanitize the request body
    const sanitizedBody = sanitizeLayoutForSave(originalBody);
    const idFieldsAfter = countIdFields(sanitizedBody);

    // Enhanced logging of sanitization results
    console.log(`[SanitizedBody] ✅ Sanitization complete: removed ${idFieldCount - idFieldsAfter} id fields`);
    console.log(`[SanitizedBody] Sanitized body structure:`, {
      keys: Object.keys(sanitizedBody),
      sectionsCount: sanitizedBody.sections?.length || 0,
      hasPropertyFields: sanitizedBody.sections?.some((s: any) => s.property) || false,
      idFieldCount: idFieldsAfter
    });

    // Replace the request body with sanitized version
    // This ensures downstream validation and processing use clean data
    request.body = sanitizedBody;

    return sanitizedBody;
  },
);