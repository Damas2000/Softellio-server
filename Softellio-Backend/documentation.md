# =€ SOFTELLIO MULTI-TENANT CMS - FRONTEND API REHBER0

> **Frontend geli_tiricileri için eksiksiz API kullan1m k1lavuzu**
> Bu dokümantasyon 3 farkl1 frontend uygulamas1 için haz1rlanm1_t1r:
> - =4 **Super Admin Paneli** - Sistem yöneticileri için
> - =á **Tenant Admin Paneli** - Tenant yöneticileri için
> - =5 **Frontend Website** - Son kullan1c1lar için

---

## =Ë 0ÇER0K

1. [Genel Bilgiler](#genel-bilgiler)
2. [Kimlik Dorulama](#kimlik-dorulama)
3. [Super Admin Panel API'leri](#super-admin-panel-apileri)
4. [Tenant Admin Panel API'leri](#tenant-admin-panel-apileri)
5. [Frontend Website API'leri](#frontend-website-apileri)
6. [Hata Kodlar1](#hata-kodlar1)
7. [Örnekler](#örnekler)

---

## =' Genel Bilgiler

### Base URL
```
Development: http://localhost:3000
Production: https://api.softellio.com
```

### Content-Type Headers
```javascript
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Multi-Tenant Sistem
Bu sistem multi-tenant yap1dad1r. Her tenant'1n kendine ait:
- Domain'i (example.softellio.com veya custom domain)
- Kullan1c1lar1 ve içerii
- Ayarlar1 ve konfigürasyonu

### Dil Destei
Sistem çoklu dil destekler. API'lerde `language` parametresi kullan1n:
- Türkçe: `tr`
- 0ngilizce: `en`
- Almanca: `de`

---

## = Kimlik Dorulama

### 1. Kullan1c1 Giri_i
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

// Ba_ar1l1 Yan1t
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "TENANT_ADMIN",
      "tenantId": 1
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 2. Token Yenileme
```javascript
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Ç1k1_ Yapma
```javascript
POST /auth/logout
Authorization: Bearer {accessToken}
```

### 4. Mevcut Kullan1c1 Bilgileri
```javascript
GET /auth/me
Authorization: Bearer {accessToken}
```

### Frontend Token Management
```javascript
// Token storage örnei
class AuthService {
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }
}
```

---

## =4 Super Admin Panel API'leri

> **Sadece SUPER_ADMIN rolündeki kullan1c1lar eri_ebilir**

### Tenant Yönetimi

#### Tenant Listesi
```javascript
GET /super-admin/tenants
Authorization: Bearer {accessToken}

// Query parameters
?page=1&limit=10&search=company&status=active
```

#### Yeni Tenant Olu_tur
```javascript
POST /super-admin/tenants
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Acme Corporation",
  "domain": "acme.softellio.com",
  "defaultLanguage": "en",
  "availableLanguages": ["en", "tr"],
  "theme": "default",
  "primaryColor": "#1976d2",
  "adminEmail": "admin@acme.com",
  "adminPassword": "securePassword123"
}
```

#### Tenant Güncelle
```javascript
PATCH /super-admin/tenants/{tenantId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Company Name",
  "isActive": true
}
```

#### Tenant Özelliklerini Yönet
```javascript
// Tenant özelliklerini görüntüle
GET /super-admin/tenants/{tenantId}/features
Authorization: Bearer {accessToken}

// Özellik durumunu güncelle
PATCH /super-admin/tenants/{tenantId}/features/{moduleName}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "enabled": true,
  "settings": {
    "maxUsers": 100,
    "storageLimit": "10GB"
  }
}
```

#### Tenant Kimliine Bürünme
```javascript
POST /super-admin/tenants/{tenantId}/impersonate
Authorization: Bearer {accessToken}

// Tenant admin tokeni döndürür
{
  "impersonationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "id": 1,
    "name": "Acme Corp",
    "domain": "acme.softellio.com"
  }
}
```

### Sistem 0zleme ve Monitoring

#### Monitoring Konfigürasyonu
```javascript
// Konfigürasyon görüntüle
GET /monitoring/config
Authorization: Bearer {accessToken}

// Konfigürasyonu güncelle
PATCH /monitoring/config
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "alerts": {
    "enabled": true,
    "email": "alerts@softellio.com"
  },
  "logging": {
    "level": "info",
    "retentionDays": 30
  }
}
```

#### Sistem Metrikleri
```javascript
// Performans metrikleri
GET /monitoring/metrics/performance
Authorization: Bearer {accessToken}

// Özel metrik olu_tur
POST /monitoring/metrics
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "api_response_time",
  "type": "gauge",
  "value": 150,
  "unit": "ms",
  "labels": {
    "endpoint": "/api/users",
    "method": "GET"
  }
}
```

#### Alert Yönetimi
```javascript
// Alert kurallar1 listesi
GET /monitoring/alerts/rules
Authorization: Bearer {accessToken}

// Yeni alert kural1
POST /monitoring/alerts/rules
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "High CPU Usage",
  "condition": "cpu_usage > 80",
  "severity": "critical",
  "enabled": true,
  "notifications": {
    "email": ["admin@softellio.com"],
    "webhook": "https://hooks.slack.com/..."
  }
}
```

### Sistem Güncellemeleri

#### Sistem Güncellemesi Olu_tur
```javascript
POST /backup/updates
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "version": "2.1.0",
  "description": "Security updates and new features",
  "rollbackEnabled": true,
  "scheduledAt": "2024-01-15T02:00:00Z"
}
```

#### Güncelleme 0lerlemesini 0zle
```javascript
GET /backup/updates/{updateId}/progress
Authorization: Bearer {accessToken}

// Real-time progress
{
  "status": "in_progress",
  "progress": 65,
  "currentStep": "Database migration",
  "estimatedTimeRemaining": "5 minutes"
}
```

---

## =á Tenant Admin Panel API'leri

> **TENANT_ADMIN rolündeki kullan1c1lar eri_ebilir**

### Kullan1c1 Yönetimi

#### Kullan1c1 Listesi (Tenant S1n1rl1)
```javascript
GET /users
Authorization: Bearer {accessToken}

// Advanced filtering
GET /users/advanced
Authorization: Bearer {accessToken}
?role=EDITOR&isActive=true&lastLogin=7days
```

#### Kullan1c1 Davet Et
```javascript
POST /users/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "newuser@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EDITOR",
  "permissions": ["content:write", "media:upload"]
}
```

#### Kullan1c1 0statistikleri
```javascript
GET /users/statistics
Authorization: Bearer {accessToken}

{
  "totalUsers": 25,
  "activeUsers": 23,
  "newUsersThisMonth": 3,
  "roleDistribution": {
    "TENANT_ADMIN": 2,
    "EDITOR": 23
  }
}
```

### Domain Yönetimi

#### Domain Listesi
```javascript
GET /domains
Authorization: Bearer {accessToken}

[
  {
    "id": 1,
    "domain": "company.softellio.com",
    "type": "subdomain",
    "isPrimary": true,
    "isActive": true,
    "isVerified": true
  },
  {
    "id": 2,
    "domain": "www.company.com",
    "type": "custom",
    "isPrimary": false,
    "isActive": true,
    "isVerified": false
  }
]
```

#### Özel Domain Ekle
```javascript
POST /domains
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "domain": "www.mycompany.com",
  "isPrimary": false
}
```

#### Domain Sal1k Kontrolü
```javascript
GET /domains/{domainId}/health
Authorization: Bearer {accessToken}

{
  "domain": "www.mycompany.com",
  "isReachable": true,
  "responseTime": 120,
  "sslValid": true,
  "dnsConfigured": true
}
```

### Backup ve Geri Yükleme

#### Database Backup Olu_tur
```javascript
POST /backup/database
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Monthly Backup",
  "description": "Scheduled monthly backup",
  "compressionType": "gzip",
  "retentionDays": 90
}
```

#### Backup Listesi
```javascript
GET /backup/database
Authorization: Bearer {accessToken}
?page=1&limit=10&type=manual

[
  {
    "id": "backup-123",
    "name": "Monthly Backup",
    "size": "150MB",
    "status": "completed",
    "createdAt": "2024-01-01T10:00:00Z",
    "downloadUrl": "/backup/database/backup-123/download"
  }
]
```

#### Backup 0lerlemesini 0zle
```javascript
GET /backup/database/{backupId}/progress
Authorization: Bearer {accessToken}

{
  "status": "in_progress",
  "progress": 45,
  "currentStep": "Compressing files",
  "estimatedTimeRemaining": "3 minutes"
}
```

#### Geri Yükleme 0_lemi
```javascript
POST /backup/restore
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "backupId": "backup-123",
  "restoreType": "full",
  "confirmDataLoss": true
}
```

### Site Ayarlar1

#### Site Ayarlar1 Getir
```javascript
GET /site-settings/admin
Authorization: Bearer {accessToken}

{
  "general": {
    "siteName": "My Company",
    "tagline": "We build amazing products",
    "logo": "https://cdn.company.com/logo.png"
  },
  "contact": {
    "email": "info@company.com",
    "phone": "+90 212 555 0000"
  },
  "social": {
    "facebook": "https://facebook.com/company",
    "twitter": "https://twitter.com/company"
  }
}
```

#### Site Ayarlar1n1 Güncelle
```javascript
PATCH /site-settings/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "general": {
    "siteName": "Updated Company Name",
    "tagline": "New tagline"
  }
}
```

### Sistem Ayarlar1

#### Sistem Ayarlar1 Kategorileri
```javascript
GET /system-settings/categories
Authorization: Bearer {accessToken}

[
  {
    "category": "email",
    "name": "Email Settings",
    "description": "SMTP and email configuration"
  },
  {
    "category": "security",
    "name": "Security Settings",
    "description": "Authentication and security options"
  }
]
```

#### Kategori Ayarlar1n1 Getir
```javascript
GET /system-settings/category/email
Authorization: Bearer {accessToken}

[
  {
    "id": 1,
    "key": "smtp_host",
    "value": "smtp.gmail.com",
    "type": "string",
    "description": "SMTP server hostname"
  },
  {
    "id": 2,
    "key": "smtp_port",
    "value": "587",
    "type": "number",
    "description": "SMTP server port"
  }
]
```

---

## =â Tenant Admin + Editor API'leri

> **TENANT_ADMIN ve EDITOR rolleri eri_ebilir**

### 0çerik Yönetimi

#### Sayfa Yönetimi
```javascript
// Sayfa listesi
GET /pages/admin
Authorization: Bearer {accessToken}
?language=en&status=published&page=1&limit=10

// Yeni sayfa olu_tur
POST /pages/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "About Us",
  "slug": "about-us",
  "content": "<h1>About Our Company</h1><p>We are...</p>",
  "language": "en",
  "status": "draft",
  "seo": {
    "metaTitle": "About Us - Company Name",
    "metaDescription": "Learn more about our company and mission",
    "keywords": ["about", "company", "mission"]
  }
}

// Sayfa güncelle
PATCH /pages/admin/{pageId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}

// Sayfa kopyala
POST /pages/admin/{pageId}/duplicate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Copy of About Us",
  "language": "tr"
}
```

#### Blog Yönetimi
```javascript
// Blog kategorileri
GET /blog/admin/categories
Authorization: Bearer {accessToken}

// Kategori olu_tur
POST /blog/admin/categories
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Technology",
  "slug": "technology",
  "description": "Posts about technology and innovation",
  "language": "en"
}

// Blog yaz1s1 olu_tur
POST /blog/admin/posts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "The Future of AI",
  "slug": "future-of-ai",
  "content": "<h1>AI is changing everything...</h1>",
  "excerpt": "Discover how AI is transforming industries",
  "categoryId": 1,
  "language": "en",
  "featuredImage": "https://cdn.company.com/ai-future.jpg",
  "tags": ["ai", "technology", "future"],
  "status": "published"
}
```

### Menü Yönetimi
```javascript
// Menü listesi
GET /menu/admin
Authorization: Bearer {accessToken}

// Menü olu_tur
POST /menu/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Main Navigation",
  "key": "main-nav",
  "description": "Website main navigation menu"
}

// Menü öesi ekle
POST /menu/admin/items
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "menuId": 1,
  "parentId": null,
  "title": "Home",
  "url": "/",
  "type": "internal",
  "order": 1,
  "isActive": true
}

// Menü öelerini yeniden s1rala
POST /menu/admin/{menuId}/reorder
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "items": [
    {"id": 1, "order": 1},
    {"id": 2, "order": 2},
    {"id": 3, "order": 3}
  ]
}
```

### Medya Yönetimi
```javascript
// Tek dosya yükleme
POST /media/admin/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

FormData {
  file: [File object],
  folder: "images/blog",
  alt: "Blog post featured image",
  title: "AI Future Image"
}

// Çoklu dosya yükleme (max 10)
POST /media/admin/upload/multiple
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

FormData {
  files: [File array],
  folder: "gallery"
}

// Medya listesi
GET /media/admin
Authorization: Bearer {accessToken}
?type=image&folder=blog&page=1&limit=20

// Medya istatistikleri
GET /media/admin/stats
Authorization: Bearer {accessToken}

{
  "totalFiles": 1250,
  "totalSize": "2.5GB",
  "byType": {
    "image": 800,
    "video": 45,
    "document": 405
  },
  "storageUsed": "2.5GB",
  "storageLimit": "10GB"
}

// Optimize edilmi_ resim URL'i
GET /media/admin/{mediaId}/optimized
Authorization: Bearer {accessToken}
?width=800&height=600&quality=85&format=webp

{
  "originalUrl": "https://cdn.company.com/image.jpg",
  "optimizedUrl": "https://cdn.company.com/image_800x600_q85.webp",
  "savings": "65%"
}
```

### SEO Yönetimi

#### Yap1sal Veri (Structured Data)
```javascript
// JSON-LD _emas1 olu_tur
POST /seo/admin/structured-data
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "Organization",
  "name": "Company Name",
  "url": "https://company.com",
  "logo": "https://company.com/logo.png",
  "contactPoint": {
    "telephone": "+90-212-555-0000",
    "contactType": "Customer Service"
  }
}
```

#### Sayfa SEO Ayarlar1
```javascript
// Belirli sayfa için SEO
GET /seo/admin/page-seo/entity/page/123
Authorization: Bearer {accessToken}

// SEO ayarlar1 olu_tur/güncelle
POST /seo/admin/page-seo
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "entityType": "page",
  "entityId": 123,
  "language": "en",
  "metaTitle": "About Us - Company Name",
  "metaDescription": "Learn about our company mission and values",
  "keywords": ["about", "company", "mission"],
  "ogTitle": "About Us",
  "ogDescription": "Company mission and values",
  "ogImage": "https://company.com/og-about.jpg",
  "canonicalUrl": "https://company.com/about"
}
```

#### URL Yönlendirmeleri
```javascript
// Yönlendirme olu_tur
POST /seo/admin/redirects
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fromPath": "/old-page",
  "toPath": "/new-page",
  "type": "301",
  "isActive": true
}

// Yönlendirme listesi
GET /seo/admin/redirects
Authorization: Bearer {accessToken}
```

#### Sitemap Yönetimi
```javascript
// Sitemap konfigürasyonu
GET /seo/admin/sitemap/config
Authorization: Bearer {accessToken}

// Sitemap olu_tur
POST /seo/admin/sitemap/generate
Authorization: Bearer {accessToken}

{
  "success": true,
  "sitemapUrl": "https://company.com/sitemap.xml",
  "lastGenerated": "2024-01-01T10:00:00Z",
  "urlCount": 150
}
```

### Ekip Yönetimi
```javascript
// Ekip üyesi ekle
POST /team-members/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "position": "Senior Developer",
  "department": "Engineering",
  "bio": "Experienced software developer with 5+ years...",
  "email": "john@company.com",
  "phone": "+90 212 555 0001",
  "avatar": "https://cdn.company.com/john-avatar.jpg",
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  },
  "skills": ["React", "Node.js", "Python"],
  "languages": ["en", "tr"],
  "isActive": true,
  "order": 1
}
```

### Hizmet Yönetimi
```javascript
// Hizmet olu_tur
POST /services/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Web Development",
  "slug": "web-development",
  "description": "Professional web development services",
  "content": "<h1>Web Development Services</h1>...",
  "language": "en",
  "featuredImage": "https://cdn.company.com/web-dev.jpg",
  "price": {
    "starting": 5000,
    "currency": "USD"
  },
  "features": [
    "Responsive Design",
    "SEO Optimization",
    "Performance Optimization"
  ],
  "category": "development",
  "isFeatured": true,
  "isActive": true
}
```

### Portfolio/Referans Yönetimi
```javascript
// Referans projesi ekle
POST /references/admin
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "E-Commerce Platform",
  "slug": "ecommerce-platform",
  "description": "Modern e-commerce solution for retail business",
  "content": "<h1>Project Overview</h1>...",
  "language": "en",
  "clientName": "Retail Corp",
  "projectUrl": "https://retailcorp.com",
  "category": "e-commerce",
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "images": [
    "https://cdn.company.com/project1-1.jpg",
    "https://cdn.company.com/project1-2.jpg"
  ],
  "completedAt": "2023-12-15",
  "duration": "6 months",
  "teamSize": 5,
  "isFeatured": true,
  "isActive": true
}
```

### Dashboard Analytics
```javascript
// Dashboard genel bak1_
GET /dashboard-analytics/admin/overview
Authorization: Bearer {accessToken}
?period=30days

{
  "visitors": {
    "total": 15420,
    "unique": 8950,
    "growth": "+12.5%"
  },
  "pageViews": {
    "total": 45280,
    "growth": "+8.3%"
  },
  "topPages": [
    {"path": "/", "views": 8520},
    {"path": "/about", "views": 3240}
  ],
  "trafficSources": {
    "organic": 45,
    "direct": 30,
    "social": 15,
    "referral": 10
  }
}

// Widget olu_tur
POST /dashboard-analytics/admin/widgets
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Monthly Sales",
  "type": "line_chart",
  "dataSource": "analytics",
  "config": {
    "metric": "sales",
    "period": "30days",
    "groupBy": "day"
  }
}
```

---

## =5 Frontend Website API'leri

> **Kimlik dorulama gerektirmeyen public API'ler**

### Site 0çerii

#### Sayfa 0çerii
```javascript
// Dile göre tüm yay1nlanm1_ sayfalar
GET /pages/public/en

[
  {
    "id": 1,
    "title": "About Us",
    "slug": "about-us",
    "excerpt": "Learn about our company...",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]

// Belirli sayfa içerii
GET /pages/public/en/about-us

{
  "id": 1,
  "title": "About Us",
  "content": "<h1>About Our Company</h1>...",
  "seo": {
    "metaTitle": "About Us - Company",
    "metaDescription": "Learn about our mission...",
    "keywords": ["about", "company"]
  },
  "lastModified": "2024-01-01T10:00:00Z"
}

// Navigasyon için sayfa listesi
GET /pages/public/en/list

[
  {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "url": "/"
  },
  {
    "id": 2,
    "title": "About",
    "slug": "about",
    "url": "/about"
  }
]
```

#### Blog 0çerii
```javascript
// Blog kategorileri
GET /blog/public/en/categories

[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "postCount": 15
  }
]

// Blog yaz1lar1
GET /blog/public/en/posts
?page=1&limit=10&category=technology

{
  "data": [
    {
      "id": 1,
      "title": "The Future of AI",
      "slug": "future-of-ai",
      "excerpt": "AI is transforming industries...",
      "featuredImage": "https://cdn.company.com/ai.jpg",
      "author": {
        "name": "John Doe",
        "avatar": "https://cdn.company.com/john.jpg"
      },
      "publishedAt": "2024-01-01T10:00:00Z",
      "readTime": "5 min",
      "tags": ["ai", "technology"]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}

// Belirli blog yaz1s1
GET /blog/public/en/posts/future-of-ai

{
  "id": 1,
  "title": "The Future of AI",
  "content": "<h1>AI is changing everything...</h1>",
  "author": {
    "name": "John Doe",
    "bio": "Senior AI Researcher",
    "avatar": "https://cdn.company.com/john.jpg"
  },
  "publishedAt": "2024-01-01T10:00:00Z",
  "tags": ["ai", "technology"],
  "seo": {
    "metaTitle": "The Future of AI - Company Blog",
    "metaDescription": "Explore how AI is transforming industries"
  },
  "relatedPosts": [
    {
      "id": 2,
      "title": "Machine Learning Basics",
      "slug": "ml-basics"
    }
  ]
}
```

#### Menü Navigasyon
```javascript
// Ana navigasyon menüsü
GET /menu/public/en/main-nav

{
  "id": 1,
  "name": "Main Navigation",
  "items": [
    {
      "id": 1,
      "title": "Home",
      "url": "/",
      "type": "internal",
      "children": []
    },
    {
      "id": 2,
      "title": "Services",
      "url": "/services",
      "type": "internal",
      "children": [
        {
          "id": 3,
          "title": "Web Development",
          "url": "/services/web-development",
          "type": "internal"
        }
      ]
    }
  ]
}
```

### Site Bilgileri

#### Site Ayarlar1
```javascript
// Genel site ayarlar1
GET /site-settings/public

{
  "general": {
    "siteName": "Company Name",
    "tagline": "We build amazing products",
    "logo": "https://cdn.company.com/logo.png",
    "favicon": "https://cdn.company.com/favicon.ico"
  },
  "contact": {
    "email": "info@company.com",
    "phone": "+90 212 555 0000",
    "address": "123 Business St, Istanbul, Turkey"
  },
  "social": {
    "facebook": "https://facebook.com/company",
    "twitter": "https://twitter.com/company",
    "linkedin": "https://linkedin.com/company/company",
    "instagram": "https://instagram.com/company"
  }
}

// Tüm diller için site ayarlar1
GET /site-settings/public/all

{
  "en": {
    "siteName": "Company Name",
    "tagline": "We build amazing products"
  },
  "tr": {
    "siteName": "^irket Ad1",
    "tagline": "Muhte_em ürünler geli_tiriyoruz"
  }
}
```

#### 0leti_im Bilgileri
```javascript
// 0leti_im bilgileri
GET /contact-info/public

{
  "company": {
    "name": "Company Name",
    "email": "info@company.com",
    "phone": "+90 212 555 0000"
  },
  "offices": [
    {
      "id": 1,
      "name": "Istanbul Office",
      "address": "123 Business St, Istanbul",
      "phone": "+90 212 555 0001",
      "coordinates": {
        "lat": 41.0082,
        "lng": 28.9784
      }
    }
  ],
  "workingHours": {
    "weekdays": "9:00 AM - 6:00 PM",
    "weekend": "Closed"
  }
}

// 0leti_im formu gönderimi
POST /contact-info/public/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I would like to discuss a potential partnership...",
  "phone": "+90 212 555 0000",
  "company": "Example Corp"
}

// vCard indirme
GET /contact-info/public/vcard

// Returns vCard file for download
```

### 0_ Portföyü

#### Hizmetler
```javascript
// Hizmet listesi
GET /services/public/en
?featured=true

[
  {
    "id": 1,
    "title": "Web Development",
    "slug": "web-development",
    "description": "Professional web development services",
    "featuredImage": "https://cdn.company.com/web-dev.jpg",
    "price": {
      "starting": 5000,
      "currency": "USD"
    },
    "isFeatured": true
  }
]

// Belirli hizmet
GET /services/public/en/web-development

{
  "id": 1,
  "title": "Web Development",
  "content": "<h1>Professional Web Development</h1>...",
  "features": [
    "Responsive Design",
    "SEO Optimization",
    "Performance Optimization"
  ],
  "pricing": {
    "starting": 5000,
    "currency": "USD",
    "packages": [
      {
        "name": "Basic",
        "price": 5000,
        "features": ["5 Pages", "Responsive Design"]
      }
    ]
  },
  "portfolio": [
    {
      "id": 1,
      "title": "E-Commerce Platform",
      "image": "https://cdn.company.com/project1.jpg"
    }
  ]
}
```

#### Portfolio/Referanslar
```javascript
// Referans projeleri
GET /references/public/en
?featured=true&category=e-commerce

[
  {
    "id": 1,
    "title": "E-Commerce Platform",
    "slug": "ecommerce-platform",
    "description": "Modern e-commerce solution",
    "thumbnail": "https://cdn.company.com/project1-thumb.jpg",
    "category": "e-commerce",
    "technologies": ["React", "Node.js"],
    "completedAt": "2023-12-15",
    "isFeatured": true
  }
]

// Son projeler showcase
GET /references/public/en/showcase/latest

[
  {
    "id": 1,
    "title": "E-Commerce Platform",
    "image": "https://cdn.company.com/project1.jpg",
    "category": "E-Commerce"
  }
]

// Belirli proje detay1
GET /references/public/en/ecommerce-platform

{
  "id": 1,
  "title": "E-Commerce Platform",
  "content": "<h1>Project Overview</h1>...",
  "clientName": "Retail Corp",
  "projectUrl": "https://retailcorp.com",
  "images": [
    "https://cdn.company.com/project1-1.jpg",
    "https://cdn.company.com/project1-2.jpg"
  ],
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "features": [
    "Product Catalog",
    "Payment Processing",
    "Order Management"
  ],
  "completedAt": "2023-12-15",
  "duration": "6 months",
  "teamSize": 5
}
```

#### Ekip
```javascript
// Ekip üyeleri
GET /team-members/public/en

[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "position": "Senior Developer",
    "avatar": "https://cdn.company.com/john.jpg",
    "bio": "Experienced developer...",
    "skills": ["React", "Node.js"],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  }
]

// Liderlik ekibi (ilk 3 ki_i)
GET /team-members/public/en/leadership

// Ekip rehberi
GET /team-members/public/en/directory

// Uzmanl1a göre ekip üyeleri
GET /team-members/public/en/expertise/react

// Ekip üyesi vCard
GET /team-members/public/en/1/vcard
```

### SEO ve Site Araçlar1

#### SEO
```javascript
// Sitemap XML
GET /seo/public/sitemap.xml
// Returns XML sitemap

// robots.txt
GET /seo/public/robots.txt
// Returns robots.txt file
```

### Analytics 0zleme

#### Sayfa 0zleme
```javascript
// Sayfa ziyareti kaydet
POST /dashboard-analytics/public/track/visit
Content-Type: application/json

{
  "path": "/about",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "sessionId": "session-123",
  "timestamp": "2024-01-01T10:00:00Z"
}

// Dönü_üm olay1 kaydet
POST /dashboard-analytics/public/track/conversion
Content-Type: application/json

{
  "goalId": "contact_form_submit",
  "sessionId": "session-123",
  "value": 1,
  "properties": {
    "formType": "contact",
    "source": "homepage"
  }
}
```

#### Banner ve Slider 0zleme
```javascript
// Banner t1klama izle
POST /banners-sliders/public/track/banner/123/click
Content-Type: application/json

{
  "sessionId": "session-123",
  "timestamp": "2024-01-01T10:00:00Z"
}

// Slider t1klama izle
POST /banners-sliders/public/track/slider/456/click
Content-Type: application/json

{
  "slideIndex": 2,
  "sessionId": "session-123"
}
```

---

##   Hata Kodlar1

### HTTP Status Codes
```javascript
200 // OK - Ba_ar1l1
201 // Created - Olu_turuldu
400 // Bad Request - Hatal1 istek
401 // Unauthorized - Kimlik dorulama gerekli
403 // Forbidden - Yetkisiz eri_im
404 // Not Found - Bulunamad1
422 // Unprocessable Entity - Validation hatas1
500 // Internal Server Error - Sunucu hatas1
```

### Error Response Format
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Common Error Codes
```javascript
// Authentication Errors
"INVALID_CREDENTIALS" // Hatal1 kullan1c1 ad1/_ifre
"TOKEN_EXPIRED"       // Token süresi doldu
"INVALID_TOKEN"       // Geçersiz token
"INSUFFICIENT_PERMISSIONS" // Yetkisiz eri_im

// Validation Errors
"VALIDATION_ERROR"    // Form validation hatas1
"REQUIRED_FIELD"     // Zorunlu alan eksik
"INVALID_FORMAT"     // Geçersiz format
"DUPLICATE_ENTRY"    // Tekrarlanan veri

// Resource Errors
"NOT_FOUND"          // Kaynak bulunamad1
"ALREADY_EXISTS"     // Zaten mevcut
"QUOTA_EXCEEDED"     // Kota a_1ld1

// System Errors
"DATABASE_ERROR"     // Veritaban1 hatas1
"FILE_UPLOAD_ERROR" // Dosya yükleme hatas1
"EXTERNAL_API_ERROR" // Harici API hatas1
```

---

## =' Frontend Implementation Examples

### React API Service
```javascript
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.token = localStorage.getItem('accessToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await this.refreshToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return fetch(url, config);
        } else {
          // Redirect to login
          window.location.href = '/login';
          return;
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      this.token = response.data.tokens.accessToken;
    }

    return response;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });

      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        this.token = response.data.accessToken;
        return response.data.accessToken;
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }

  // Content methods
  async getPages(language = 'en') {
    return this.request(`/pages/public/${language}`);
  }

  async getPage(language, slug) {
    return this.request(`/pages/public/${language}/${slug}`);
  }

  async getBlogPosts(language = 'en', params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/blog/public/${language}/posts?${query}`);
  }

  async getBlogPost(language, slug) {
    return this.request(`/blog/public/${language}/posts/${slug}`);
  }

  // Admin methods (require authentication)
  async createPage(pageData) {
    return this.request('/pages/admin', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
  }

  async uploadMedia(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    return this.request('/media/admin/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it
      body: formData
    });
  }
}

// Usage
const api = new ApiService();

// In your components
export const HomePage = () => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    api.getPages('en').then(setPages);
  }, []);

  return (
    <div>
      {pages.map(page => (
        <div key={page.id}>{page.title}</div>
      ))}
    </div>
  );
};
```

### Vue.js API Plugin
```javascript
// api.js
export default {
  install(app, options) {
    const baseURL = options.baseURL || 'http://localhost:3000';

    app.config.globalProperties.$api = {
      async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${baseURL}${endpoint}${query ? `?${query}` : ''}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        return response.json();
      },

      async post(endpoint, data) {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        return response.json();
      }
    };
  }
};

// main.js
import { createApp } from 'vue';
import ApiPlugin from './api.js';

const app = createApp(App);
app.use(ApiPlugin, { baseURL: 'http://localhost:3000' });

// In components
export default {
  data() {
    return {
      pages: []
    };
  },
  async mounted() {
    this.pages = await this.$api.get('/pages/public/en');
  }
};
```

### Next.js API Routes Integration
```javascript
// lib/api.js
export class ApiClient {
  constructor(baseURL = process.env.NEXT_PUBLIC_API_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from cookies or session
    const token = options.token || await this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }

  // SSR-compatible methods
  async getStaticProps(endpoint) {
    return this.request(endpoint);
  }

  async getServerSideProps(endpoint, context) {
    // Access token from cookies in SSR
    const token = context.req.cookies.accessToken;
    return this.request(endpoint, { token });
  }
}

// pages/blog/[slug].js
export async function getStaticProps({ params }) {
  const api = new ApiClient();
  const post = await api.getStaticProps(`/blog/public/en/posts/${params.slug}`);

  return {
    props: { post },
    revalidate: 60 // ISR
  };
}

export async function getStaticPaths() {
  const api = new ApiClient();
  const posts = await api.getStaticProps('/blog/public/en/posts');

  const paths = posts.data.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: 'blocking'
  };
}
```

---

## <¯ Best Practices

### 1. Error Handling
```javascript
// Always wrap API calls in try-catch
try {
  const data = await api.getPages();
  setPages(data);
} catch (error) {
  setError(error.message);
  // Log error for debugging
  console.error('Failed to load pages:', error);
}
```

### 2. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    const data = await api.getData();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 3. Caching
```javascript
// Simple cache implementation
const cache = new Map();

async function getCachedData(key, fetcher, ttl = 300000) {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Usage
const pages = await getCachedData('pages-en', () => api.getPages('en'));
```

### 4. Pagination
```javascript
const usePagination = (endpoint, params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await api.get(endpoint, { ...params, page, limit: 10 });
      setData(prev => [...prev, ...response.data]);
      setHasMore(response.pagination.hasNextPage);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, hasMore, loadMore };
};
```

---

## =€ Quick Start Checklist

### Frontend Developer Checklist:

#### 1. Super Admin Panel
- [ ] Authentication system
- [ ] Tenant management dashboard
- [ ] User management with role-based access
- [ ] System monitoring dashboard
- [ ] Backup & restore interface
- [ ] System settings configuration

#### 2. Tenant Admin Panel
- [ ] Admin authentication
- [ ] Domain management interface
- [ ] Content management (pages, blog, menu)
- [ ] Media library with upload
- [ ] SEO management tools
- [ ] Analytics dashboard
- [ ] Team & services management

#### 3. Frontend Website
- [ ] Dynamic page rendering
- [ ] Blog with categories and tags
- [ ] Navigation menu system
- [ ] Contact forms
- [ ] Portfolio/references showcase
- [ ] Team member profiles
- [ ] SEO optimization
- [ ] Analytics tracking

### API Integration Steps:
1. Set up API service/client
2. Implement authentication flow
3. Add error handling & loading states
4. Implement caching strategy
5. Add pagination for lists
6. Set up form validation
7. Test all CRUD operations
8. Implement real-time features (if needed)

---

**Bu dokümantasyon ile frontend geli_tiricileri tüm API'leri doru _ekilde kullanabilir ve Softellio CMS'in tüm özelliklerini frontend'e entegre edebilir.**

=Þ **Destek için:** development@softellio.com