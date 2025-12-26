# CMS + Theme Builder + Page Builder - Verification Commands

## Phase 2 Implementation Verification

This document provides verification commands for all Phase 2 features including page-specific layouts, section type validation, enhanced frontend aggregator, and footer builder integration.

### Prerequisites
```bash
# Ensure the application is running
npm run start:dev

# Verify database is up and migrations are applied
npx prisma generate
npx prisma db push

# Bootstrap demo data (if needed)
export BOOTSTRAP_DEMO=true
# Application will auto-bootstrap on startup
```

### Environment Setup
```bash
# Required environment variables
DATABASE_URL="postgresql://username:password@localhost:5432/softellio_db"
JWT_SECRET="your-jwt-secret-here"
BOOTSTRAP_DEMO=true  # For demo data creation
NODE_ENV=development
PORT=3000

# Optional for mass bootstrap (use with caution)
# BOOTSTRAP_ALL_TENANTS=true
```

## 1. Theme Settings Verification

### Public Theme Settings
```bash
# Get public theme settings
curl -X GET "http://localhost:3000/theme-settings/public" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

### Admin Theme Settings (requires auth)
```bash
# Get admin theme settings
curl -X GET "http://localhost:3000/theme-settings/admin" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"

# Update theme settings
curl -X PUT "http://localhost:3000/theme-settings/admin" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "#FF6B6B",
    "secondaryColor": "#4ECDC4",
    "backgroundColor": "#FFFFFF",
    "containerMaxWidth": 1200,
    "gridGap": 24
  }'
```

## 2. Section Types Verification

### Public Section Types Discovery
```bash
# Get all available section types
curl -X GET "http://localhost:3000/section-types/available" \
  -H "Accept: application/json"

# Get section types by category
curl -X GET "http://localhost:3000/section-types/by-category" \
  -H "Accept: application/json"

# Search section types
curl -X GET "http://localhost:3000/section-types/search?q=hero" \
  -H "Accept: application/json"

# Get section types for specific context
curl -X GET "http://localhost:3000/section-types/context/homepage" \
  -H "Accept: application/json"

curl -X GET "http://localhost:3000/section-types/context/footer" \
  -H "Accept: application/json"

# Get specific section type configuration
curl -X GET "http://localhost:3000/section-types/hero" \
  -H "Accept: application/json"

# Get variants for section type
curl -X GET "http://localhost:3000/section-types/hero/variants" \
  -H "Accept: application/json"

# Get schema for form generation
curl -X GET "http://localhost:3000/section-types/hero/v1/schema" \
  -H "Accept: application/json"

# Test footer section types
curl -X GET "http://localhost:3000/section-types/footerContact" \
  -H "Accept: application/json"

curl -X GET "http://localhost:3000/section-types/footerSocial/v1/schema" \
  -H "Accept: application/json"
```

### Admin Section Validation (requires auth)
```bash
# Validate section props
curl -X POST "http://localhost:3000/section-types/validate" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "hero",
    "variant": "v1",
    "props": {
      "title": "Welcome to Our Site",
      "subtitle": "Amazing solutions await",
      "buttonText": "Get Started",
      "buttonUrl": "/contact"
    }
  }'

# Get section types statistics
curl -X GET "http://localhost:3000/section-types/admin/statistics" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

## 3. Page Layouts Verification

### Public Layout Access
```bash
# Get HOME layout (enhanced)
curl -X GET "http://localhost:3000/page-layouts/public/HOME?language=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get FOOTER layout
curl -X GET "http://localhost:3000/page-layouts/public/FOOTER?language=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get page-specific layout (if exists)
curl -X GET "http://localhost:3000/page-layouts/public/PAGE:about-us?language=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

### Admin Layout Management (requires auth)
```bash
# Get all layouts for tenant
curl -X GET "http://localhost:3000/page-layouts/admin/layouts?language=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"

# Create a new section in HOME layout
curl -X POST "http://localhost:3000/page-layouts/admin/sections" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": 1,
    "type": "features",
    "variant": "v1",
    "order": 10,
    "propsJson": {
      "title": "Our Features",
      "subtitle": "What makes us different",
      "features": [
        {
          "icon": "star",
          "title": "Quality Service",
          "description": "Top-notch quality in everything we do"
        }
      ]
    }
  }'

# Create page-specific layout
curl -X POST "http://localhost:3000/page-layouts/admin/pages" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageSlug": "about-us",
    "language": "tr",
    "copyFromHome": false,
    "status": "published"
  }'
```

## 4. Enhanced Frontend Aggregator Verification

### Home Page Data
```bash
# Get complete home page data
curl -X GET "http://localhost:3000/frontend/home?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get extended home page data with contact info
curl -X GET "http://localhost:3000/frontend/home/extended?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

### Page-Specific Data
```bash
# Get page data by slug
curl -X GET "http://localhost:3000/frontend/page/about-us?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get extended page data
curl -X GET "http://localhost:3000/frontend/page/about-us/extended?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

### Layout and Navigation
```bash
# Get layout by key
curl -X GET "http://localhost:3000/frontend/layout/HOME?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get all available layouts
curl -X GET "http://localhost:3000/frontend/layouts?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get SEO metadata
curl -X GET "http://localhost:3000/frontend/meta/HOME?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

curl -X GET "http://localhost:3000/frontend/meta/PAGE:about-us?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

## 5. Footer Builder Verification

### Complete Footer Data
```bash
# Get complete footer data with layout and collections
curl -X GET "http://localhost:3000/frontend/footer?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get footer layout for builder
curl -X GET "http://localhost:3000/frontend/footer/layout?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Get footer collections (contact info, offices, social links)
curl -X GET "http://localhost:3000/frontend/footer/collections?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

### Footer Section Management (requires auth)
```bash
# Add footer social section to FOOTER layout
curl -X POST "http://localhost:3000/page-layouts/admin/sections" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": 2,
    "type": "footerSocial",
    "variant": "v2",
    "order": 10,
    "propsJson": {
      "showLabels": true,
      "showIcons": true,
      "linkColor": "#6B7280",
      "hoverColor": "#3B82F6",
      "fontSize": "sm"
    }
  }'

# Add footer contact section
curl -X POST "http://localhost:3000/page-layouts/admin/sections" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layoutId": 2,
    "type": "footerContact",
    "variant": "v2",
    "order": 5,
    "propsJson": {
      "showOffices": true,
      "showCompanyInfo": true,
      "columnsPerOffice": 2,
      "backgroundColor": "#1F2937",
      "textColor": "#FFFFFF"
    }
  }'
```

## 6. Multi-Language Testing

### Test Different Languages
```bash
# Turkish (default)
curl -X GET "http://localhost:3000/frontend/home?lang=tr" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# English
curl -X GET "http://localhost:3000/frontend/home?lang=en" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Arabic
curl -X GET "http://localhost:3000/frontend/home?lang=ar" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Footer in different languages
curl -X GET "http://localhost:3000/frontend/footer?lang=en" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"
```

## 7. Database Verification Queries

### Check Created Layouts
```sql
-- Check if layouts were created
SELECT * FROM page_layouts
WHERE key IN ('HOME', 'FOOTER')
AND tenant_id = 1
ORDER BY key, language;

-- Check sections count by layout
SELECT pl.key, pl.language, COUNT(ps.id) as section_count
FROM page_layouts pl
LEFT JOIN page_sections ps ON pl.id = ps.layout_id
WHERE pl.tenant_id = 1
GROUP BY pl.id, pl.key, pl.language
ORDER BY pl.key, pl.language;

-- Check footer section types
SELECT ps.type, ps.variant, ps."order", ps.is_enabled
FROM page_sections ps
JOIN page_layouts pl ON ps.layout_id = pl.id
WHERE pl.key = 'FOOTER' AND pl.tenant_id = 1
ORDER BY ps."order";
```

### Check Section Type Coverage
```sql
-- Available section types in database
SELECT DISTINCT type, variant
FROM page_sections
WHERE tenant_id = 1
ORDER BY type, variant;

-- Footer-specific sections
SELECT type, variant, COUNT(*) as usage_count
FROM page_sections ps
JOIN page_layouts pl ON ps.layout_id = pl.id
WHERE pl.key = 'FOOTER'
GROUP BY type, variant
ORDER BY type, variant;
```

## 8. Production Deployment Checklist

### Environment Variables
```bash
# Production environment setup
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="secure-random-string-min-256-bits"

# Disable bootstrap in production
# BOOTSTRAP_DEMO=false (default)
# BOOTSTRAP_ALL_TENANTS=false (default)

# Optional: Enable specific features
# ENABLE_SWAGGER=false (for production)
```

### Database Setup
```bash
# Apply migrations
npx prisma generate
npx prisma migrate deploy

# Verify database connection
npx prisma db pull --print

# Create initial tenant (manual process)
# Use admin interface or API to create tenants
```

### Health Checks
```bash
# Application health
curl -X GET "http://localhost:3000/health" \
  -H "Accept: application/json"

# Database connectivity
curl -X GET "http://localhost:3000/health/database" \
  -H "Accept: application/json"

# Swagger documentation (if enabled)
curl -X GET "http://localhost:3000/api" \
  -H "Accept: text/html"
```

## 9. Performance Testing

### Load Testing Sample
```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config file (artillery.yml)
cat > artillery.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Frontend Aggregator Test'
    requests:
      - get:
          url: '/frontend/home'
          headers:
            X-Tenant-Host: 'demo.softellio.com'
      - get:
          url: '/frontend/footer'
          headers:
            X-Tenant-Host: 'demo.softellio.com'
EOF

# Run load test
artillery run artillery.yml
```

## 10. Error Testing

### Test Error Handling
```bash
# Test invalid tenant
curl -X GET "http://localhost:3000/frontend/home" \
  -H "X-Tenant-Host: invalid.domain.com" \
  -H "Accept: application/json"

# Test invalid language
curl -X GET "http://localhost:3000/frontend/home?lang=invalid" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Test nonexistent page
curl -X GET "http://localhost:3000/frontend/page/nonexistent" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Accept: application/json"

# Test invalid section validation
curl -X POST "http://localhost:3000/section-types/validate" \
  -H "X-Tenant-Host: demo.softellio.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid-type",
    "variant": "v1",
    "props": {}
  }'
```

## Expected Results

All endpoints should return:
- **200 OK** for successful requests
- **400 Bad Request** for invalid parameters
- **401 Unauthorized** for missing auth on admin endpoints
- **404 Not Found** for nonexistent resources
- **422 Unprocessable Entity** for validation errors

The response should include proper JSON structure with:
- **tenant** information for multi-tenancy
- **theme** settings for styling
- **layout** data with sections
- **meta** information for enhanced layouts
- **collections** data for footer integration
- **proper error messages** for failed requests

## Notes

1. Replace `YOUR_JWT_TOKEN` with actual JWT token from authentication
2. Update `demo.softellio.com` with your actual tenant domain
3. Adjust `tenantId` values based on your database
4. Monitor logs for any bootstrap or validation errors
5. Test with different tenant configurations for multi-tenancy verification