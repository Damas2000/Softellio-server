# Template System & Dynamic Page Builder

## 🎯 Overview

This module provides a complete template system and dynamic page builder for the multi-tenant SaaS CMS. It enables:

- **Master Templates**: Global templates that serve as the foundation for tenant sites
- **Dynamic Site Configuration**: Per-tenant branding, navigation, and footer customization
- **Dynamic Page Management**: Unlimited custom pages with CMS-driven layouts
- **Public Site APIs**: Host-based tenant resolution for public site rendering

## 🧱 Architecture

### Core Models

```typescript
// Global template definitions (read-only)
Template {
  key: 'printing-premium-v1'
  name: 'Premium Printing Template'
  version: '1.0.0'
  supportedSections: string[]
  defaultLayout: PageLayoutSnapshot
}

// Per-tenant site configuration
TenantSiteConfig {
  tenantId: number
  templateKey: string
  branding: { logoUrl, colors, fonts }
  navigation: NavItem[]
  footer: FooterConfig
}

// Dynamic pages
DynamicPage {
  tenantId: number
  slug: '/services'
  layoutKey: 'SERVICES'
  seo: SeoConfig
  published: boolean
}
```

### Request Flow

```
1. Tenant customizes site → TenantSiteConfig
2. Tenant creates pages → DynamicPage + PageLayout
3. Public site requests → Host-based tenant resolution
4. CMS edits sections → Existing sanitized system
```

## 📡 API Endpoints

### Template Management (Tenant Admin)

```typescript
GET /templates                    // List available templates
GET /templates/:key               // Get template details
GET /templates/:key/supported-sections  // Get supported section types
```

### Site Configuration

```typescript
GET /templates/site/config        // Get current site config
POST /templates/site/config       // Create/update site config
POST /templates/site/initialize/:templateKey  // Initialize from template
DELETE /templates/site/config     // Reset site config
```

### Page Management

```typescript
GET /templates/pages              // List all pages
GET /templates/pages/:id          // Get page details
POST /templates/pages             // Create new page
PUT /templates/pages/:id          // Update page
PUT /templates/pages/:id/publish  // Publish page
DELETE /templates/pages/:id       // Delete page
```

### Public Site API (No Auth)

```typescript
GET /public/site/config           // Site branding & navigation
GET /public/site/pages            // Published pages list
GET /public/site/pages/by-slug/:slug  // Page content + layout
GET /public/site/navigation       // Navigation structure
```

## 🛡 Validation & Security

### Strict DTO Validation

```typescript
// All DTOs use class-validator with forbidNonWhitelisted: true
export class BrandingConfigDto {
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class NavItemDto {
  @IsString()
  label: string;

  @IsString()
  href: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @ValidateNested({ each: true })
  children?: NavItemDto[];
}
```

### CMS Integration

The template system integrates seamlessly with the existing CMS:

- Uses existing `@SanitizedBody()` decorator for layout updates
- Leverages `PageLayoutsService` for section management
- Maintains strict validation with `forbidNonWhitelisted: true`
- No `id` or `property` fields allowed in requests

## 🌱 Seeding & Initialization

### Default Templates

The system includes two default templates:

1. **Printing Premium** (`printing-premium-v1`)
   - Sections: hero, services, testimonials, contact
   - Turkish content optimized for printing companies
   - Includes branda, tabela, afiş services

2. **Business Professional** (`business-professional-v1`)
   - Sections: hero, services, stats, contact
   - General business template
   - English content suitable for any business

### Template Seeding

```typescript
// Automatic seeding during bootstrap
await templateSeederService.seed();
```

## 🎨 Frontend Integration

### Portal CMS Usage

```typescript
// 1. Get available templates
const templates = await api.get('/templates');

// 2. Initialize site config from template
await api.post('/templates/site/initialize/printing-premium-v1');

// 3. Create custom pages
await api.post('/templates/pages', {
  slug: '/custom-services',
  title: 'Custom Services',
  pageType: 'CUSTOM'
});

// 4. Edit page sections (existing CMS system)
await api.put('/cms/layouts/CUSTOM_CUSTOM_SERVICES', {
  sections: sanitizedSections
});
```

### Public Site Usage

```typescript
// Host-based tenant resolution
const config = await fetch('/public/site/config', {
  headers: { 'X-Tenant-Host': 'demo.softellio.com' }
});

const page = await fetch('/public/site/pages/by-slug/services', {
  headers: { 'X-Tenant-Host': 'demo.softellio.com' }
});

// Returns: { page, layout: { sections } }
```

## 🧪 Testing Examples

### Acceptance Criteria

#### 1. Template Selection
```typescript
// Tenant can browse and select templates
const templates = await GET('/templates');
expect(templates).toContain('printing-premium-v1');
```

#### 2. Site Configuration
```typescript
// Tenant can customize branding
await POST('/templates/site/config', {
  templateKey: 'printing-premium-v1',
  branding: { primaryColor: '#FF0000' },
  navigation: [...]
});
```

#### 3. Page Creation
```typescript
// Tenant can create unlimited custom pages
const page = await POST('/templates/pages', {
  slug: '/portfolio',
  title: 'Our Portfolio',
  pageType: 'CUSTOM'
});

// Page gets its own layout key for section editing
expect(page.layoutKey).toBe('CUSTOM_PORTFOLIO');
```

#### 4. CMS Integration
```typescript
// Tenant can edit page sections using existing CMS
await PUT('/cms/layouts/CUSTOM_PORTFOLIO', {
  sections: [
    {
      type: 'hero',
      variant: 'default',
      order: 1,
      enabled: true,
      propsJson: { title: 'Our Work' }
      // ✅ No id or property fields
    }
  ]
});
```

#### 5. Public Site
```typescript
// Public site resolves tenant by domain
const siteData = await GET('/public/site/pages/by-slug/portfolio', {
  headers: { 'X-Tenant-Host': 'demo.softellio.com' }
});

expect(siteData.page.published).toBe(true);
expect(siteData.layout.sections).toBeDefined();
```

## 📈 Scalability Features

- **Template Versioning**: Templates include version field for future upgrades
- **Section Type Validation**: Only template-supported sections allowed
- **Tenant Isolation**: All data properly scoped to tenants
- **Caching Ready**: Public APIs optimized for CDN caching
- **Host-based Routing**: Supports unlimited domains per tenant

## 🔧 Configuration

### Environment Variables

```bash
# Existing database connection
DATABASE_URL="postgresql://..."

# Existing tenant resolution
# No additional env vars required
```

### Database Migration

```bash
# Run migration to add template system tables
npx prisma migrate dev --name "add-template-system"
npx prisma generate
```

## 🚀 Deployment Checklist

1. ✅ **Models**: Prisma models added for Template, TenantSiteConfig, DynamicPage
2. ✅ **DTOs**: Strict validation with class-validator
3. ✅ **Services**: Templates, SiteConfig, DynamicPages services
4. ✅ **Controllers**: Admin and public API controllers
5. ✅ **Module**: TemplatesModule integrated with AppModule
6. ✅ **Seeding**: Default templates ready for bootstrap
7. ✅ **CMS Integration**: Works with existing sanitization system
8. ✅ **Public APIs**: Host-based tenant resolution
9. ⏳ **Testing**: Acceptance criteria validation
10. ⏳ **Migration**: Database schema update

## 💻 Usage Examples

See individual service files for detailed method documentation and examples:

- `templates.service.ts` - Template management
- `site-config.service.ts` - Site configuration
- `dynamic-pages.service.ts` - Page management
- `templates.controller.ts` - Admin API endpoints
- `templates-public.controller.ts` - Public site API

---

**Ready for Production**: This template system is designed to be scalable, secure, and maintainable while providing maximum flexibility for tenant customization.