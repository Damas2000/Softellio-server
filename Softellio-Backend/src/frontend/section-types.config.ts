/**
 * Section Types Configuration and Validation Schemas
 * Defines all available section types, their variants, and required props
 */

export interface SectionTypeConfig {
  type: string;
  displayName: string;
  description: string;
  category: 'content' | 'layout' | 'data' | 'media' | 'navigation';
  variants: SectionVariant[];
  defaultVariant: string;
  icon: string;
  isAvailable: boolean;
}

export interface SectionVariant {
  variant: string;
  displayName: string;
  description: string;
  propsSchema: PropSchema;
  previewUrl?: string;
}

export interface PropSchema {
  required: string[];
  properties: { [key: string]: PropDefinition };
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'url' | 'color' | 'image';
  description: string;
  default?: any;
  enum?: string[];
  min?: number;
  max?: number;
  items?: PropDefinition; // For array types
  properties?: { [key: string]: PropDefinition }; // For object types
  validation?: string; // Regex or custom validation
}

/**
 * All available section types with their configurations
 */
export const SECTION_TYPES: { [key: string]: SectionTypeConfig } = {
  hero: {
    type: 'hero',
    displayName: 'Hero Section',
    description: 'Main banner/hero section with title, subtitle, and CTA',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: 'Centered Hero',
        description: 'Centered text with background image',
        propsSchema: {
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Main heading text',
              validation: '^.{1,200}$'
            },
            subtitle: {
              type: 'string',
              description: 'Subtitle text',
              validation: '^.{0,300}$'
            },
            buttonText: {
              type: 'string',
              description: 'CTA button text'
            },
            buttonUrl: {
              type: 'url',
              description: 'CTA button URL'
            },
            backgroundImage: {
              type: 'image',
              description: 'Background image URL'
            },
            textAlign: {
              type: 'string',
              description: 'Text alignment',
              enum: ['left', 'center', 'right'],
              default: 'center'
            },
            overlayColor: {
              type: 'color',
              description: 'Background overlay color (rgba)',
              default: 'rgba(0,0,0,0.4)'
            }
          }
        }
      },
      {
        variant: 'v2',
        displayName: 'Split Hero',
        description: 'Text on left, image on right',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Main heading text' },
            subtitle: { type: 'string', description: 'Subtitle text' },
            buttonText: { type: 'string', description: 'CTA button text' },
            buttonUrl: { type: 'url', description: 'CTA button URL' },
            image: { type: 'image', description: 'Right side image' },
            reversed: { type: 'boolean', description: 'Reverse layout (image left)', default: false }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'star',
    isAvailable: true
  },

  features: {
    type: 'features',
    displayName: 'Features Grid',
    description: 'Grid of features with icons and descriptions',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: '3-Column Grid',
        description: 'Features in 3-column grid layout',
        propsSchema: {
          required: ['title', 'features'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            subtitle: { type: 'string', description: 'Section subtitle' },
            features: {
              type: 'array',
              description: 'Array of features',
              items: {
                type: 'object',
                description: 'Feature item',
                properties: {
                  icon: { type: 'string', description: 'Feature icon name' },
                  title: { type: 'string', description: 'Feature title' },
                  description: { type: 'string', description: 'Feature description' }
                }
              }
            }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'grid',
    isAvailable: true
  },

  servicesGrid: {
    type: 'servicesGrid',
    displayName: 'Services Grid',
    description: 'Dynamic grid of services from database',
    category: 'data',
    variants: [
      {
        variant: 'v1',
        displayName: 'Card Grid',
        description: 'Services displayed as cards',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            subtitle: { type: 'string', description: 'Section subtitle' },
            displayMode: {
              type: 'string',
              description: 'Data source mode',
              enum: ['dynamic', 'static'],
              default: 'dynamic'
            },
            serviceIds: {
              type: 'array',
              description: 'Specific service IDs to show (if dynamic)',
              items: { type: 'number', description: 'Service ID' }
            },
            columns: {
              type: 'number',
              description: 'Number of columns',
              min: 1,
              max: 6,
              default: 3
            },
            showIcons: { type: 'boolean', description: 'Show service icons', default: true },
            showDescriptions: { type: 'boolean', description: 'Show descriptions', default: true }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'briefcase',
    isAvailable: true
  },

  testimonials: {
    type: 'testimonials',
    displayName: 'Testimonials',
    description: 'Customer testimonials and reviews',
    category: 'data',
    variants: [
      {
        variant: 'v1',
        displayName: 'Carousel',
        description: 'Testimonials in carousel format',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            displayMode: {
              type: 'string',
              description: 'Data source mode',
              enum: ['dynamic', 'static'],
              default: 'dynamic'
            },
            testimonialIds: {
              type: 'array',
              description: 'Specific testimonial IDs (if dynamic)',
              items: { type: 'number', description: 'Testimonial ID' }
            },
            layout: {
              type: 'string',
              description: 'Layout type',
              enum: ['carousel', 'grid', 'masonry'],
              default: 'carousel'
            },
            autoPlay: { type: 'boolean', description: 'Auto-play carousel', default: true },
            showRatings: { type: 'boolean', description: 'Show star ratings', default: true }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'message-square',
    isAvailable: true
  },

  blogGrid: {
    type: 'blogGrid',
    displayName: 'Blog Grid',
    description: 'Latest blog posts in grid layout',
    category: 'data',
    variants: [
      {
        variant: 'v1',
        displayName: 'Recent Posts',
        description: 'Latest blog posts with excerpts',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            subtitle: { type: 'string', description: 'Section subtitle' },
            limit: {
              type: 'number',
              description: 'Number of posts to show',
              min: 1,
              max: 12,
              default: 6
            },
            categoryId: {
              type: 'number',
              description: 'Filter by category ID (optional)'
            },
            showExcerpts: { type: 'boolean', description: 'Show post excerpts', default: true },
            showDates: { type: 'boolean', description: 'Show publish dates', default: true },
            showAuthors: { type: 'boolean', description: 'Show author names', default: false }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'file-text',
    isAvailable: true
  },

  teamGrid: {
    type: 'teamGrid',
    displayName: 'Team Grid',
    description: 'Team members showcase',
    category: 'data',
    variants: [
      {
        variant: 'v1',
        displayName: 'Photo Cards',
        description: 'Team members with photos and roles',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            subtitle: { type: 'string', description: 'Section subtitle' },
            teamMemberIds: {
              type: 'array',
              description: 'Specific team member IDs',
              items: { type: 'number', description: 'Team member ID' }
            },
            showBios: { type: 'boolean', description: 'Show member bios', default: false },
            showSocialLinks: { type: 'boolean', description: 'Show social links', default: true }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'users',
    isAvailable: true
  },

  contactCta: {
    type: 'contactCta',
    displayName: 'Contact CTA',
    description: 'Call-to-action section for contact',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: 'Centered CTA',
        description: 'Centered call-to-action with buttons',
        propsSchema: {
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'CTA title' },
            subtitle: { type: 'string', description: 'CTA subtitle' },
            primaryButtonText: { type: 'string', description: 'Primary button text' },
            primaryButtonUrl: { type: 'url', description: 'Primary button URL' },
            secondaryButtonText: { type: 'string', description: 'Secondary button text' },
            secondaryButtonUrl: { type: 'url', description: 'Secondary button URL' },
            backgroundType: {
              type: 'string',
              description: 'Background type',
              enum: ['solid', 'gradient', 'image'],
              default: 'gradient'
            },
            backgroundColor: { type: 'color', description: 'Background color or gradient' }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'phone',
    isAvailable: true
  },

  stats: {
    type: 'stats',
    displayName: 'Statistics',
    description: 'Key statistics and numbers',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: 'Number Counter',
        description: 'Animated number counters',
        propsSchema: {
          required: ['title', 'stats'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            stats: {
              type: 'array',
              description: 'Statistics array',
              items: {
                type: 'object',
                description: 'Stat item',
                properties: {
                  number: { type: 'string', description: 'Statistic number (e.g., "500+")' },
                  label: { type: 'string', description: 'Statistic label' },
                  icon: { type: 'string', description: 'Icon name' }
                }
              }
            }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'bar-chart',
    isAvailable: true
  },

  faq: {
    type: 'faq',
    displayName: 'FAQ Section',
    description: 'Frequently Asked Questions',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: 'Accordion',
        description: 'Questions in collapsible accordion',
        propsSchema: {
          required: ['title', 'questions'],
          properties: {
            title: { type: 'string', description: 'Section title' },
            subtitle: { type: 'string', description: 'Section subtitle' },
            questions: {
              type: 'array',
              description: 'FAQ questions array',
              items: {
                type: 'object',
                description: 'FAQ item',
                properties: {
                  question: { type: 'string', description: 'Question text' },
                  answer: { type: 'string', description: 'Answer text' }
                }
              }
            },
            allowMultiple: { type: 'boolean', description: 'Allow multiple open at once', default: false }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'help-circle',
    isAvailable: true
  },

  // Footer-specific section types
  footerContact: {
    type: 'footerContact',
    displayName: 'Footer Contact',
    description: 'Footer contact information section with company details',
    category: 'navigation',
    variants: [
      {
        variant: 'v1',
        displayName: 'Standard Contact Footer',
        description: 'Company name, address, phone, email in footer layout',
        propsSchema: {
          required: ['showCompanyName'],
          properties: {
            showCompanyName: { type: 'boolean', description: 'Show company name', default: true },
            showTagline: { type: 'boolean', description: 'Show company tagline', default: true },
            showDescription: { type: 'boolean', description: 'Show company description', default: false },
            showWorkingHours: { type: 'boolean', description: 'Show working hours', default: false },
            showPrimaryOffice: { type: 'boolean', description: 'Show primary office contact', default: true },
            showAllOffices: { type: 'boolean', description: 'Show all office locations', default: false },
            backgroundColor: { type: 'color', description: 'Background color', default: '#1F2937' },
            textColor: { type: 'color', description: 'Text color', default: '#FFFFFF' }
          }
        }
      },
      {
        variant: 'v2',
        displayName: 'Multi-Office Footer',
        description: 'All office locations with contact details',
        propsSchema: {
          required: ['showOffices'],
          properties: {
            showOffices: { type: 'boolean', description: 'Show office listings', default: true },
            showCompanyInfo: { type: 'boolean', description: 'Show company info section', default: true },
            columnsPerOffice: { type: 'number', description: 'Columns per office', default: 1, min: 1, max: 3 },
            backgroundColor: { type: 'color', description: 'Background color', default: '#1F2937' },
            textColor: { type: 'color', description: 'Text color', default: '#FFFFFF' }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'building',
    isAvailable: true
  },

  footerSocial: {
    type: 'footerSocial',
    displayName: 'Footer Social Links',
    description: 'Social media links section for footer',
    category: 'navigation',
    variants: [
      {
        variant: 'v1',
        displayName: 'Horizontal Social Icons',
        description: 'Social media icons in horizontal layout',
        propsSchema: {
          required: ['showIcons'],
          properties: {
            showIcons: { type: 'boolean', description: 'Show social media icons', default: true },
            showLabels: { type: 'boolean', description: 'Show platform labels', default: false },
            iconSize: { type: 'number', description: 'Icon size in pixels', default: 24, min: 16, max: 48 },
            iconColor: { type: 'color', description: 'Icon color', default: '#6B7280' },
            hoverColor: { type: 'color', description: 'Icon hover color', default: '#3B82F6' },
            alignment: { type: 'string', description: 'Icon alignment', default: 'center', enum: ['left', 'center', 'right'] }
          }
        }
      },
      {
        variant: 'v2',
        displayName: 'Vertical Social List',
        description: 'Social media links as vertical list with labels',
        propsSchema: {
          required: ['showLabels'],
          properties: {
            showLabels: { type: 'boolean', description: 'Show platform labels', default: true },
            showIcons: { type: 'boolean', description: 'Show platform icons', default: true },
            linkColor: { type: 'color', description: 'Link color', default: '#6B7280' },
            hoverColor: { type: 'color', description: 'Link hover color', default: '#3B82F6' },
            fontSize: { type: 'string', description: 'Font size', default: 'sm', enum: ['xs', 'sm', 'base', 'lg'] }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'share',
    isAvailable: true
  },

  footerNavigation: {
    type: 'footerNavigation',
    displayName: 'Footer Navigation',
    description: 'Footer navigation menu with multiple columns',
    category: 'navigation',
    variants: [
      {
        variant: 'v1',
        displayName: 'Multi-Column Navigation',
        description: 'Footer menu in multiple columns with categories',
        propsSchema: {
          required: ['menuKey'],
          properties: {
            menuKey: { type: 'string', description: 'Menu key to display', default: 'footer' },
            columns: { type: 'number', description: 'Number of columns', default: 3, min: 1, max: 6 },
            showHeadings: { type: 'boolean', description: 'Show category headings', default: true },
            linkColor: { type: 'color', description: 'Link color', default: '#6B7280' },
            headingColor: { type: 'color', description: 'Heading color', default: '#FFFFFF' },
            hoverColor: { type: 'color', description: 'Link hover color', default: '#3B82F6' }
          }
        }
      },
      {
        variant: 'v2',
        displayName: 'Simple Footer Links',
        description: 'Simple horizontal footer links',
        propsSchema: {
          required: ['menuKey'],
          properties: {
            menuKey: { type: 'string', description: 'Menu key to display', default: 'footer' },
            separator: { type: 'string', description: 'Link separator', default: '|' },
            alignment: { type: 'string', description: 'Link alignment', default: 'center', enum: ['left', 'center', 'right'] },
            linkColor: { type: 'color', description: 'Link color', default: '#6B7280' },
            hoverColor: { type: 'color', description: 'Link hover color', default: '#3B82F6' }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'menu',
    isAvailable: true
  },

  footerCopyright: {
    type: 'footerCopyright',
    displayName: 'Footer Copyright',
    description: 'Copyright notice and legal information',
    category: 'content',
    variants: [
      {
        variant: 'v1',
        displayName: 'Simple Copyright',
        description: 'Basic copyright notice with year and company name',
        propsSchema: {
          required: ['copyrightText'],
          properties: {
            copyrightText: { type: 'string', description: 'Copyright text template', default: '© {year} {companyName}. All rights reserved.' },
            showYear: { type: 'boolean', description: 'Show current year', default: true },
            showCompanyName: { type: 'boolean', description: 'Show company name', default: true },
            textAlign: { type: 'string', description: 'Text alignment', default: 'center', enum: ['left', 'center', 'right'] },
            textColor: { type: 'color', description: 'Text color', default: '#6B7280' },
            fontSize: { type: 'string', description: 'Font size', default: 'sm', enum: ['xs', 'sm', 'base'] }
          }
        }
      },
      {
        variant: 'v2',
        displayName: 'Extended Copyright',
        description: 'Copyright with additional legal links',
        propsSchema: {
          required: ['copyrightText'],
          properties: {
            copyrightText: { type: 'string', description: 'Copyright text template', default: '© {year} {companyName}. All rights reserved.' },
            showLegalLinks: { type: 'boolean', description: 'Show legal links (privacy, terms)', default: true },
            legalLinks: {
              type: 'array',
              description: 'Legal links to display',
              items: {
                type: 'object',
                description: 'Legal link item',
                properties: {
                  label: { type: 'string', description: 'Link label' },
                  url: { type: 'url', description: 'Link URL' }
                }
              },
              default: [
                { label: 'Privacy Policy', url: '/privacy' },
                { label: 'Terms of Service', url: '/terms' }
              ]
            },
            textColor: { type: 'color', description: 'Text color', default: '#6B7280' },
            linkColor: { type: 'color', description: 'Link color', default: '#3B82F6' }
          }
        }
      }
    ],
    defaultVariant: 'v1',
    icon: 'shield',
    isAvailable: true
  }
};

/**
 * Get all available section types
 */
export function getAvailableSectionTypes(): SectionTypeConfig[] {
  return Object.values(SECTION_TYPES).filter(type => type.isAvailable);
}

/**
 * Get section type configuration
 */
export function getSectionTypeConfig(type: string): SectionTypeConfig | null {
  return SECTION_TYPES[type] || null;
}

/**
 * Get variant configuration for section type
 */
export function getVariantConfig(type: string, variant: string): SectionVariant | null {
  const typeConfig = getSectionTypeConfig(type);
  if (!typeConfig) return null;

  return typeConfig.variants.find(v => v.variant === variant) || null;
}

/**
 * Validate section props against schema
 */
export function validateSectionProps(type: string, variant: string, props: any): { isValid: boolean; errors: string[] } {
  const variantConfig = getVariantConfig(type, variant);
  if (!variantConfig) {
    return { isValid: false, errors: [`Invalid section type/variant: ${type}/${variant}`] };
  }

  const errors: string[] = [];
  const schema = variantConfig.propsSchema;

  // Check required properties
  for (const requiredProp of schema.required) {
    if (!props.hasOwnProperty(requiredProp) || props[requiredProp] === null || props[requiredProp] === undefined) {
      errors.push(`Missing required property: ${requiredProp}`);
    }
  }

  // Validate property types and constraints
  for (const [propName, propDef] of Object.entries(schema.properties)) {
    if (props.hasOwnProperty(propName) && props[propName] !== null && props[propName] !== undefined) {
      const value = props[propName];
      const validationResult = validatePropValue(value, propDef, propName);
      errors.push(...validationResult);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate individual property value
 */
function validatePropValue(value: any, propDef: PropDefinition, propName: string): string[] {
  const errors: string[] = [];

  // Type validation
  switch (propDef.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${propName} must be a string`);
      } else if (propDef.validation) {
        const regex = new RegExp(propDef.validation);
        if (!regex.test(value)) {
          errors.push(`${propName} format is invalid`);
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number') {
        errors.push(`${propName} must be a number`);
      } else {
        if (propDef.min !== undefined && value < propDef.min) {
          errors.push(`${propName} must be at least ${propDef.min}`);
        }
        if (propDef.max !== undefined && value > propDef.max) {
          errors.push(`${propName} must be at most ${propDef.max}`);
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${propName} must be a boolean`);
      }
      break;

    case 'url':
      if (typeof value !== 'string') {
        errors.push(`${propName} must be a string (URL)`);
      } else {
        try {
          new URL(value);
        } catch {
          // Allow relative URLs
          if (!value.startsWith('/') && !value.startsWith('#')) {
            errors.push(`${propName} must be a valid URL`);
          }
        }
      }
      break;

    case 'color':
      if (typeof value !== 'string') {
        errors.push(`${propName} must be a string (color)`);
      } else {
        // Basic color validation (hex, rgb, rgba)
        const colorRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(.*\)|rgba\(.*\))$/;
        if (!colorRegex.test(value)) {
          errors.push(`${propName} must be a valid color (hex, rgb, or rgba)`);
        }
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${propName} must be an array`);
      } else if (propDef.items) {
        // Validate array items
        value.forEach((item, index) => {
          const itemErrors = validatePropValue(item, propDef.items!, `${propName}[${index}]`);
          errors.push(...itemErrors);
        });
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${propName} must be an object`);
      }
      break;
  }

  // Enum validation
  if (propDef.enum && !propDef.enum.includes(value)) {
    errors.push(`${propName} must be one of: ${propDef.enum.join(', ')}`);
  }

  return errors;
}

/**
 * Get default props for section type/variant
 */
export function getDefaultProps(type: string, variant: string): any {
  const variantConfig = getVariantConfig(type, variant);
  if (!variantConfig) return {};

  const defaults: any = {};
  for (const [propName, propDef] of Object.entries(variantConfig.propsSchema.properties)) {
    if (propDef.default !== undefined) {
      defaults[propName] = propDef.default;
    }
  }

  return defaults;
}