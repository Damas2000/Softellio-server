# Backend-Frontend API Contract Documentation

## Overview

This document defines the official API contract between the Softellio backend and frontend applications. It specifies the exact request/response structures, headers, and behaviors that frontend developers must implement to integrate with the Softellio SaaS platform.

**Version**: 1.0.0
**Last Updated**: January 2026
**Compatibility**: Frontend contracts in `Softellio-site/src/renderer/contracts.ts`

## Table of Contents

- [Authentication & Tenant Resolution](#authentication--tenant-resolution)
- [Core API Endpoints](#core-api-endpoints)
- [Data Structures](#data-structures)
- [Error Handling](#error-handling)
- [Request/Response Examples](#requestresponse-examples)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Versioning & Changes](#versioning--changes)

## Authentication & Tenant Resolution

### Tenant Resolution

The Softellio platform is multi-tenant. Tenant resolution is handled via the `X-Tenant-Host` header in all API requests.

**Header Format**:
```
X-Tenant-Host: demo.softellio.com
```

**Resolution Logic**:
1. Backend extracts domain from `X-Tenant-Host` header
2. Looks up tenant by domain in database
3. All subsequent data is filtered by tenant

**Frontend Implementation**:
```typescript
const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Host': tenantHost, // e.g., 'demo.softellio.com'
};
```

### No Authentication Required

The public site APIs do not require authentication. They serve published content based on tenant resolution only.

## Core API Endpoints

### 1. Bootstrap API

**Endpoint**: `GET /public/site/bootstrap`

**Purpose**: Fetch tenant configuration, branding, navigation, and metadata needed to bootstrap the site

**Query Parameters**:
- `lang` (optional): Language code (default: tenant's default language)
  - Example: `?lang=tr`

**Response Structure**:
```typescript
{
  tenant: {
    id: number;
    slug: string;
    name: string;
    domain: string;
    locale: string;
    templateKey: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  navigation: Array<{
    label: string;
    href: string;
    order: number;
    isCTA: boolean;
    isExternal: boolean;
  }>;
  footer: {
    columns: Array<{
      title: string;
      links: Array<{
        url: string;
        label: string;
      }>;
    }>;
    socialLinks: Array<{
      url: string;
      label: string;
      platform: string;
    }>;
    copyrightText: string;
  };
  pages: Array<{
    slug: string;
    title: string;
    pageType: string;
  }>;
  home: {
    layoutKey: string;
    sections: Array<SectionData>; // See SectionData structure below
  };
  seoDefaults: {
    ogImage: string;
    metaTitle: string;
    twitterCard: string;
    metaDescription: string;
  };
  customCSS: string | null;
  meta: {
    templateKey: string;
    supportedSections: string[];
    cacheTimestamp: string;
    version: string;
  };
}
```

### 2. Page API

**Endpoint**: `GET /public/site/pages/by-slug/{slug}`

**Purpose**: Fetch specific page content and layout

**Parameters**:
- `slug` (path): URL slug of the page (URL-encoded)
  - Example: `/` for homepage, `/about` for about page

**Query Parameters**:
- `lang` (optional): Language code

**Response Structure**:
```typescript
{
  page: {
    id: string;
    slug: string;
    title: string;
    seo: {
      ogImage: string;
      ogTitle: string;
      metaTitle: string;
      ogDescription: string;
      metaDescription: string;
    };
    pageType: string;
    publishedAt: string;
    language: string;
  };
  layout: {
    key: string;
    language: string;
    sections: Array<SectionData>; // Ordered by section.order
  };
  _debug: {
    tenantId: number;
    tenantSlug: string;
    resolvedBy: string;
    requestedLang: string;
    langUsed: string;
    layoutKey: string;
    sectionCount: number;
    sectionTypes: string[];
    requestId: string;
    timestamp: string;
  };
}
```

## Data Structures

### SectionData Structure

This is the core contract for all section data. Every section follows this exact structure:

```typescript
interface SectionData {
  /** Unique section identifier */
  id: number;

  /** Section type (hero, services, testimonials, cta, etc.) */
  type: string;

  /** Section variant (premium, default, minimal, etc.) */
  variant: string;

  /** Display order on the page (1-based) */
  order: number;

  /** Whether the section is enabled/visible */
  enabled: boolean;

  /**
   * Section-specific configuration as JSON object
   * Contents vary by section type - see Section Props Contracts below
   */
  propsJson: Record<string, any>;
}
```

### Section Props Contracts

The `propsJson` field contains section-specific data. Here are the contracts for each section type:

#### Hero Section (`type: "hero"`)

```typescript
{
  title: string;              // Required
  subtitle: string;           // Optional
  description: string;        // Optional
  buttonText: string;         // Optional
  buttonUrl: string;          // Optional
  textAlign: 'left' | 'center' | 'right'; // Default: 'center'
  backgroundImage: string;    // Optional - URL to background image
  backgroundColor: string;    // Optional - hex color (e.g., "#1E40AF")
  overlayColor: string;       // Optional - rgba color for image overlay
}
```

#### Services Section (`type: "services"`)

```typescript
{
  title: string;              // Required
  subtitle: string;           // Optional
  columns: number;            // Default: 2, range: 1-4
  services: Array<{           // Required
    icon: string;             // Emoji or icon identifier
    title: string;            // Service name
    description: string;      // Service description
    features: string[];       // List of service features
  }>;
  showIcons: boolean;         // Default: true
  showDescriptions: boolean;  // Default: true
  displayMode: 'static' | 'carousel'; // Default: 'static'
}
```

#### Testimonials Section (`type: "testimonials"`)

```typescript
{
  title: string;              // Required
  subtitle: string;           // Optional
  layout: 'grid' | 'carousel'; // Default: 'carousel'
  autoPlay: boolean;          // Default: true (for carousel)
  showRatings: boolean;       // Default: true
  displayMode: 'static' | 'carousel'; // Default: 'static'
  testimonials: Array<{       // Required
    name: string;             // Customer name
    text: string;             // Testimonial text
    avatar: string;           // URL to customer photo
    rating: number;           // 1-5 star rating
    company: string;          // Customer company
  }>;
}
```

#### CTA Section (`type: "cta"`)

```typescript
{
  title: string;              // Required
  description: string;        // Optional
  ctaText: string;            // Required - primary button text
  ctaUrl: string;             // Required - primary button URL
  secondaryCtaText: string;   // Optional - secondary button text
  secondaryCtaUrl: string;    // Optional - secondary button URL
  features: string[];         // Optional - bullet points to display
  backgroundType: 'solid' | 'gradient'; // Default: 'solid'
  backgroundColor: string;    // hex color (e.g., "#059669")
}
```

### Branding Structure

```typescript
{
  logoUrl: string;            // URL to tenant logo
  faviconUrl: string;         // URL to favicon
  primaryColor: string;       // Hex color (e.g., "#1E40AF")
  secondaryColor: string;     // Hex color (e.g., "#3B82F6")
  fontFamily: string;         // CSS font-family (e.g., "Inter, sans-serif")
}
```

### Navigation Structure

```typescript
{
  label: string;              // Display text for navigation item
  href: string;               // Link URL (relative or absolute)
  order: number;              // Sort order (1-based)
  isCTA: boolean;             // Whether to style as call-to-action button
  isExternal: boolean;        // Whether link opens in new window/tab
}
```

## Error Handling

### Error Response Format

All errors follow this structure:

```typescript
{
  error: string;              // Human-readable error message
  code?: string;              // Machine-readable error code
  details?: any;              // Additional error context (debug mode only)
}
```

### HTTP Status Codes

- **200 OK**: Successful response
- **404 Not Found**: Tenant not found, page not found
- **400 Bad Request**: Invalid request parameters
- **500 Internal Server Error**: Backend processing error

### Common Error Scenarios

#### Tenant Not Found

**Status**: 404
**Response**:
```json
{
  "error": "Tenant not found for domain: invalid.softellio.com",
  "code": "TENANT_NOT_FOUND"
}
```

#### Page Not Found

**Status**: 404
**Response**:
```json
{
  "error": "Page not found: /nonexistent-page",
  "code": "PAGE_NOT_FOUND"
}
```

#### Invalid Language

**Status**: 400
**Response**:
```json
{
  "error": "Unsupported language: xx",
  "code": "UNSUPPORTED_LANGUAGE"
}
```

## Request/Response Examples

### Bootstrap API Example

**Request**:
```bash
GET /public/site/bootstrap?lang=tr
Headers:
  X-Tenant-Host: demo.softellio.com
  Accept: application/json
```

**Response** (200 OK):
```json
{
  "tenant": {
    "id": 1,
    "slug": "cmk08iao80002jf15f9ydn824",
    "name": "Demo Company",
    "domain": "demo.softellio.com",
    "locale": "tr",
    "templateKey": "printing-premium-v1"
  },
  "branding": {
    "logoUrl": "https://via.placeholder.com/200x80/1E40AF/FFFFFF?text=DEMO+LOGO",
    "faviconUrl": "https://via.placeholder.com/32x32/1E40AF/FFFFFF?text=D",
    "primaryColor": "#1E40AF",
    "secondaryColor": "#3B82F6",
    "fontFamily": "Inter, sans-serif"
  },
  "navigation": [
    {
      "label": "Ana Sayfa",
      "href": "/",
      "order": 1,
      "isCTA": false,
      "isExternal": false
    },
    {
      "label": "Hizmetlerimiz",
      "href": "/services",
      "order": 2,
      "isCTA": false,
      "isExternal": false
    },
    {
      "label": "İletişim",
      "href": "/contact",
      "order": 5,
      "isCTA": true,
      "isExternal": false
    }
  ],
  "footer": {
    "columns": [
      {
        "title": "Hizmetlerimiz",
        "links": [
          {
            "url": "/services/branda-afis",
            "label": "Branda & Afiş"
          },
          {
            "url": "/services/tabela",
            "label": "Tabela Sistemleri"
          }
        ]
      }
    ],
    "socialLinks": [
      {
        "url": "https://facebook.com/demo-company",
        "label": "Facebook'ta takip edin",
        "platform": "facebook"
      }
    ],
    "copyrightText": "© 2024 Demo Baskı Şirketi. Tüm hakları saklıdır."
  },
  "pages": [
    {
      "slug": "/",
      "title": "Ana Sayfa",
      "pageType": "HOME"
    }
  ],
  "home": {
    "layoutKey": "HOME",
    "sections": [
      {
        "id": 34,
        "type": "hero",
        "variant": "premium",
        "order": 1,
        "enabled": true,
        "propsJson": {
          "title": "Softellio Demo Sitesi",
          "subtitle": "Profesyonel Web Çözümleri Demo Platformu",
          "buttonUrl": "/about",
          "textAlign": "center",
          "buttonText": "Demo İncele",
          "description": "Modern web teknolojileri ile hazırlanmış demo site. Responsive tasarım, hızlı performans ve kullanıcı dostu arayüz.",
          "overlayColor": "rgba(30, 64, 175, 0.8)",
          "backgroundColor": "#1E40AF",
          "backgroundImage": "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
      }
    ]
  },
  "seoDefaults": {
    "ogImage": "https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Demo+Baski+Sirketi",
    "metaTitle": "Demo Baskı Şirketi - Profesyonel Baskı Çözümleri",
    "twitterCard": "summary_large_image",
    "metaDescription": "Branda, afiş, tabela ve dijital baskı alanında profesyonel çözümler sunan Demo Baskı Şirketi ile tanışın."
  },
  "customCSS": null,
  "meta": {
    "templateKey": "printing-premium-v1",
    "supportedSections": [
      "hero:premium",
      "services:premium",
      "portfolio:premium",
      "process:premium",
      "testimonials:premium",
      "cta:premium"
    ],
    "cacheTimestamp": "2026-01-18T21:39:01.945Z",
    "version": "1.0.0"
  }
}
```

### Page API Example

**Request**:
```bash
GET /public/site/pages/by-slug/%2F?lang=tr
Headers:
  X-Tenant-Host: demo.softellio.com
  Accept: application/json
```

**Response** (200 OK):
```json
{
  "page": {
    "id": "cmk08ibai0004jf15j3u7s40l",
    "slug": "/",
    "title": "Ana Sayfa",
    "seo": {
      "ogImage": "https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Ana+Sayfa",
      "ogTitle": "Demo Baskı Şirketi - Ana Sayfa",
      "metaTitle": "Demo Baskı Şirketi - Branda, Afiş, Tabela",
      "ogDescription": "Profesyonel baskı çözümleri ile işinizi büyütün.",
      "metaDescription": "Profesyonel baskı çözümleri ile işinizi büyütün. Branda, afiş, tabela ve dijital baskı hizmetlerimiz ile tanışın."
    },
    "pageType": "HOME",
    "publishedAt": "2026-01-04T21:19:08.201Z",
    "language": "tr"
  },
  "layout": {
    "key": "HOME",
    "language": "tr",
    "sections": [
      {
        "id": 34,
        "type": "hero",
        "variant": "premium",
        "order": 1,
        "propsJson": {
          "title": "Softellio Demo Sitesi",
          "subtitle": "Profesyonel Web Çözümleri Demo Platformu",
          "description": "Modern web teknolojileri ile hazırlanmış demo site."
        }
      },
      {
        "id": 35,
        "type": "services",
        "variant": "premium",
        "order": 2,
        "propsJson": {
          "title": "Demo Hizmetlerimiz",
          "columns": 2,
          "services": [
            {
              "icon": "🎨",
              "title": "Web Tasarım Demo",
              "features": ["Responsive Tasarım", "SEO Optimizasyonu"],
              "description": "Modern, responsive ve kullanıcı dostu web tasarım örnekleri."
            }
          ]
        }
      }
    ]
  },
  "_debug": {
    "tenantId": 1,
    "tenantSlug": "cmk08iao80002jf15f9ydn824",
    "resolvedBy": "X-Tenant-Host",
    "requestedLang": "tr",
    "langUsed": "tr",
    "layoutKey": "HOME",
    "sectionCount": 4,
    "sectionTypes": ["hero", "services", "testimonials", "cta"],
    "requestId": "pub_1768772343131_14",
    "timestamp": "2026-01-18T21:39:03.532Z"
  }
}
```

## Frontend Integration Guide

### 1. HTTP Client Setup

```typescript
// lib/api.ts
class ApiClient {
  private baseURL: string;
  private tenantHost: string;

  constructor(baseURL: string, tenantHost: string) {
    this.baseURL = baseURL;
    this.tenantHost = tenantHost;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-Host': this.tenantHost,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  }

  async getBootstrap(lang?: string): Promise<BootstrapResponse> {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return this.makeRequest<BootstrapResponse>(`/public/site/bootstrap${query}`);
  }

  async getPage(slug: string, lang?: string): Promise<PageResponse> {
    const encodedSlug = encodeURIComponent(slug);
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return this.makeRequest<PageResponse>(`/public/site/pages/by-slug/${encodedSlug}${query}`);
  }
}
```

### 2. Tenant Resolution

```typescript
// lib/tenant.ts
export async function getTenantHost(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0];

  if (!cleanHost || cleanHost === 'localhost') {
    return process.env.NEXT_PUBLIC_DEV_TENANT_HOST || 'demo.softellio.com';
  }

  return cleanHost;
}

export function createApiClient(): ApiClient {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const tenantHost = getTenantHost();

  return new ApiClient(baseURL, tenantHost);
}
```

### 3. Page Rendering

```typescript
// app/page.tsx
export default async function HomePage() {
  try {
    const apiClient = createApiClient();
    const [bootstrap, pageData] = await Promise.all([
      apiClient.getBootstrap('tr'),
      apiClient.getPage('/'),
    ]);

    return (
      <SiteRenderer
        templateKey={bootstrap.tenant.templateKey}
        branding={bootstrap.branding}
        navigation={bootstrap.navigation}
        page={pageData.page}
        layout={pageData.layout}
      />
    );
  } catch (error) {
    return <ErrorPage error={error} />;
  }
}
```

### 4. Error Handling

```typescript
// components/ErrorPages.tsx
export function TenantNotFoundError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Domain Not Found
        </h1>
        <p className="text-gray-600">
          This domain is not configured for Softellio.
        </p>
      </div>
    </div>
  );
}

export function PageNotFoundError({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600">
          The page "{slug}" could not be found.
        </p>
      </div>
    </div>
  );
}
```

## Versioning & Changes

### Current Version: 1.0.0

**Stable APIs**:
- Bootstrap API structure
- Page API structure
- SectionData contract
- Core section props (hero, services, testimonials, cta)

### Breaking Change Policy

Breaking changes to this contract will result in a major version bump and will be announced with at least 30 days notice. Breaking changes include:

- Removing required fields from API responses
- Changing field types (e.g., string to number)
- Changing HTTP status codes for existing scenarios
- Removing entire endpoints

### Non-Breaking Changes

These changes are considered non-breaking and may be made without version bumps:

- Adding new optional fields to responses
- Adding new section types
- Adding new API endpoints
- Adding new optional query parameters

### Change Log

#### Version 1.0.0 (January 2026)
- Initial API contract definition
- Bootstrap and Page APIs stabilized
- Core section contracts defined (hero, services, testimonials, cta)

---

## Summary

This contract ensures reliable integration between the Softellio backend and any frontend implementation. By following these specifications, frontend developers can build robust, multi-tenant websites that consume dynamic content from the Softellio platform.

**Key Points**:
1. Always include `X-Tenant-Host` header for tenant resolution
2. Handle all defined error scenarios gracefully
3. Follow the exact `SectionData` structure for section rendering
4. Implement type-safe interfaces using the provided contracts
5. Test with real backend data during development

For questions about this contract or to report discrepancies, please create an issue in the project repository.

**Related Documentation**:
- Frontend contracts: `Softellio-site/src/renderer/contracts.ts`
- Template development: `Softellio-site/docs/TEMPLATE_DEVELOPER_GUIDE.md`