# 🏢 SUPER ADMIN PANEL API DOKÜMANTASYONU

> **Sistem yöneticileri için eksiksiz API rehberi**
> Bu dokümantasyon Super Admin panelinde kullanılacak tüm API'ları içerir.

---

## 📋 İÇERİK

1. [Giriş](#giriş)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [Tenant Yönetimi](#tenant-yönetimi)
4. [Kullanıcı Yönetimi](#kullanıcı-yönetimi)
5. [Sistem Ayarları](#sistem-ayarları)
6. [Monitoring & Loglama](#monitoring--loglama)
7. [Yedekleme & Güncelleme](#yedekleme--güncelleme)
8. [Hata Kodları](#hata-kodları)

---

## 🚀 Giriş

### Base URL
```
Development: http://localhost:3000
Production: https://api.softellio.com
```

### Gerekli Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {accessToken}",
  "X-Tenant-Domain": "{tenant-domain}"
}
```

### Rol Gereksinimleri
Bu API'lar sadece `SUPER_ADMIN` rolüne sahip kullanıcılar tarafından kullanılabilir.

---

## 🔐 Kimlik Doğrulama

### Super Admin Girişi
```javascript
POST /auth/login
Content-Type: application/json
X-Tenant-Domain: {tenant-subdomain}.softellio.com

{
  "email": "admin@softellio.com",
  "password": "SuperAdmin123!"
}

// Başarılı Yanıt
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@softellio.com",
    "name": "Super Administrator",
    "role": "SUPER_ADMIN",
    "tenantId": null,
    "isActive": true
  }
}
```

### Token Yenileme
```javascript
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Çıkış
```javascript
POST /auth/logout
Authorization: Bearer {accessToken}
```

---

## 🏢 Tenant Yönetimi

### 1. Tüm Tenant'ları Listele
```javascript
GET /super-admin/tenants
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?page=1&limit=10&search=demo&status=active&sortBy=createdAt&sortOrder=desc

// Response
[
  {
    "id": 1,
    "name": "Demo Company",
    "slug": "demo-company",
    "domain": "demo.softellio.com",
    "status": "active",
    "defaultLanguage": "tr",
    "availableLanguages": ["tr", "en"],
    "theme": null,
    "primaryColor": "#3498db",
    "isActive": true,
    "createdAt": "2025-12-07T19:25:02.181Z",
    "updatedAt": "2025-12-07T19:25:02.181Z",
    "_count": {
      "users": 5,
      "pages": 10,
      "blogPosts": 25
    }
  }
]
```

### 2. Yeni Tenant Oluştur
```javascript
POST /super-admin/tenants
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "Yeni Şirket",
  "slug": "yeni-sirket",
  "domain": "yenisirket.softellio.com",
  "defaultLanguage": "tr",
  "availableLanguages": ["tr", "en"],
  "primaryColor": "#2ecc71",
  "adminUser": {
    "name": "Admin Kullanıcısı",
    "email": "admin@yenisirket.com",
    "password": "TempPassword123!"
  }
}

// Response
{
  "id": 2,
  "name": "Yeni Şirket",
  "slug": "yeni-sirket",
  "domain": "yenisirket.softellio.com",
  "status": "active",
  "defaultLanguage": "tr",
  "availableLanguages": ["tr", "en"],
  "primaryColor": "#2ecc71",
  "isActive": true,
  "createdAt": "2025-12-07T20:00:00.000Z",
  "updatedAt": "2025-12-07T20:00:00.000Z"
}
```

### 3. Tenant Detaylarını Getir
```javascript
GET /super-admin/tenants/:id
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "id": 1,
  "name": "Demo Company",
  "slug": "demo-company",
  "domain": "demo.softellio.com",
  "status": "active",
  "defaultLanguage": "tr",
  "availableLanguages": ["tr", "en"],
  "theme": null,
  "primaryColor": "#3498db",
  "isActive": true,
  "createdAt": "2025-12-07T19:25:02.181Z",
  "updatedAt": "2025-12-07T19:25:02.181Z",
  "users": [
    {
      "id": 2,
      "name": "Tenant Administrator",
      "email": "admin@demo.softellio.com",
      "role": "TENANT_ADMIN",
      "isActive": true
    }
  ],
  "tenantDomains": [
    {
      "id": 1,
      "domain": "demo.softellio.com",
      "type": "custom",
      "isPrimary": true,
      "isActive": true,
      "isVerified": true
    }
  ]
}
```

### 4. Tenant Güncelle
```javascript
PATCH /super-admin/tenants/:id
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "Updated Company Name",
  "primaryColor": "#e74c3c",
  "availableLanguages": ["tr", "en", "de"]
}

// Response
{
  "id": 1,
  "name": "Updated Company Name",
  "slug": "demo-company",
  "domain": "demo.softellio.com",
  "status": "active",
  "defaultLanguage": "tr",
  "availableLanguages": ["tr", "en", "de"],
  "primaryColor": "#e74c3c",
  "isActive": true,
  "updatedAt": "2025-12-07T20:30:00.000Z"
}
```

### 5. Tenant Durumunu Değiştir
```javascript
PATCH /super-admin/tenants/:id/toggle-active
Authorization: Bearer {superAdminToken}

// Response
{
  "id": 1,
  "isActive": false,
  "message": "Tenant deactivated successfully"
}
```

### 6. Tenant Sil (Deaktif Et)
```javascript
DELETE /super-admin/tenants/:id
Authorization: Bearer {superAdminToken}

// Response
{
  "message": "Tenant deactivated successfully",
  "deletedAt": "2025-12-07T20:45:00.000Z"
}
```

### 7. Tenant Özelliklerini Getir
```javascript
GET /super-admin/tenants/:id/features
Authorization: Bearer {superAdminToken}

// Response
{
  "tenantId": 1,
  "features": {
    "blog": {
      "enabled": true,
      "maxPosts": 100,
      "allowComments": true
    },
    "ecommerce": {
      "enabled": false,
      "maxProducts": 0
    },
    "analytics": {
      "enabled": true,
      "advancedReporting": false
    },
    "customDomain": {
      "enabled": true,
      "maxDomains": 5
    }
  }
}
```

### 8. Tenant Özellik Güncelle
```javascript
PATCH /super-admin/tenants/:id/features/:module
Authorization: Bearer {superAdminToken}
Content-Type: application/json

// Örnek: Blog özelliğini güncelle
PATCH /super-admin/tenants/1/features/blog

{
  "enabled": true,
  "maxPosts": 200,
  "allowComments": false
}

// Response
{
  "tenantId": 1,
  "module": "blog",
  "features": {
    "enabled": true,
    "maxPosts": 200,
    "allowComments": false
  },
  "updatedAt": "2025-12-07T21:00:00.000Z"
}
```

### 9. Tenant Taklit Etme (Impersonation)
```javascript
POST /super-admin/tenants/:id/impersonate
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "duration": 3600 // Saniye cinsinden (1 saat)
}

// Response
{
  "impersonationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenantId": 1,
  "expiresAt": "2025-12-07T22:00:00.000Z",
  "message": "Impersonation token generated successfully"
}
```

---

## 👥 Kullanıcı Yönetimi

### 1. Tüm Kullanıcıları Listele
```javascript
GET /users
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?page=1&limit=20&search=admin&role=TENANT_ADMIN&tenantId=1&isActive=true&sortBy=createdAt&sortOrder=desc

// Response
[
  {
    "id": 2,
    "tenantId": 1,
    "role": "TENANT_ADMIN",
    "name": "Tenant Administrator",
    "email": "admin@demo.softellio.com",
    "isActive": true,
    "lastLoginAt": "2025-12-07T19:30:00.000Z",
    "createdAt": "2025-12-07T19:25:02.278Z",
    "updatedAt": "2025-12-07T19:25:02.278Z"
  },
  {
    "id": 1,
    "tenantId": null,
    "role": "SUPER_ADMIN",
    "name": "Super Administrator",
    "email": "admin@softellio.com",
    "isActive": true,
    "lastLoginAt": "2025-12-07T20:00:00.000Z",
    "createdAt": "2025-12-07T19:25:02.153Z",
    "updatedAt": "2025-12-07T19:25:02.153Z"
  }
]
```

### 2. Gelişmiş Kullanıcı Arama
```javascript
GET /users/advanced
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?filters[role]=TENANT_ADMIN,EDITOR&filters[tenantId]=1,2&filters[isActive]=true&filters[lastLoginAfter]=2025-12-01&dateRange[start]=2025-12-01&dateRange[end]=2025-12-07&includeTenantInfo=true&includeActivityStats=true

// Response
{
  "users": [
    {
      "id": 2,
      "name": "Tenant Administrator",
      "email": "admin@demo.softellio.com",
      "role": "TENANT_ADMIN",
      "tenantId": 1,
      "tenant": {
        "name": "Demo Company",
        "domain": "demo.softellio.com"
      },
      "isActive": true,
      "lastLoginAt": "2025-12-07T19:30:00.000Z",
      "activityStats": {
        "loginCount": 25,
        "lastActivity": "2025-12-07T19:45:00.000Z",
        "pagesCreated": 10,
        "postsCreated": 5
      }
    }
  ],
  "total": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

### 3. Kullanıcı İstatistikleri
```javascript
GET /users/statistics
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "overview": {
    "totalUsers": 145,
    "activeUsers": 128,
    "newUsersThisMonth": 12,
    "totalTenants": 25
  },
  "byRole": {
    "SUPER_ADMIN": 3,
    "TENANT_ADMIN": 25,
    "EDITOR": 85,
    "VIEWER": 32
  },
  "byTenant": [
    {
      "tenantId": 1,
      "tenantName": "Demo Company",
      "userCount": 15,
      "activeUserCount": 12
    }
  ],
  "activityStats": {
    "dailyActiveUsers": 45,
    "weeklyActiveUsers": 89,
    "monthlyActiveUsers": 128
  }
}
```

### 4. Yeni Kullanıcı Oluştur
```javascript
POST /users
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "Yeni Kullanıcı",
  "email": "yeni@example.com",
  "password": "TempPassword123!",
  "role": "TENANT_ADMIN",
  "tenantId": 1,
  "isActive": true,
  "sendWelcomeEmail": true
}

// Response
{
  "id": 5,
  "name": "Yeni Kullanıcı",
  "email": "yeni@example.com",
  "role": "TENANT_ADMIN",
  "tenantId": 1,
  "isActive": true,
  "createdAt": "2025-12-07T21:00:00.000Z",
  "message": "User created successfully. Welcome email sent."
}
```

### 5. Kullanıcı Davet Et
```javascript
POST /users/invite
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "email": "davet@example.com",
  "role": "EDITOR",
  "tenantId": 1,
  "message": "Sistemimize hoş geldiniz!"
}

// Response
{
  "invitationId": "inv_abc123",
  "email": "davet@example.com",
  "role": "EDITOR",
  "tenantId": 1,
  "invitationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-12-14T21:00:00.000Z",
  "message": "Invitation sent successfully"
}
```

### 6. Toplu İşlemler
```javascript
POST /users/bulk-operation
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "operation": "deactivate", // activate, deactivate, delete, changeRole, changeTenant
  "userIds": [3, 4, 5],
  "parameters": {
    "role": "EDITOR", // changeRole işlemi için
    "tenantId": 2 // changeTenant işlemi için
  }
}

// Response
{
  "operation": "deactivate",
  "affectedUsers": 3,
  "results": [
    {
      "userId": 3,
      "success": true,
      "message": "User deactivated"
    },
    {
      "userId": 4,
      "success": true,
      "message": "User deactivated"
    },
    {
      "userId": 5,
      "success": false,
      "error": "User not found"
    }
  ]
}
```

### 7. Kullanıcı Detaylarını Getir
```javascript
GET /users/:id
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "id": 2,
  "name": "Tenant Administrator",
  "email": "admin@demo.softellio.com",
  "role": "TENANT_ADMIN",
  "tenantId": 1,
  "tenant": {
    "name": "Demo Company",
    "domain": "demo.softellio.com"
  },
  "isActive": true,
  "lastLoginAt": "2025-12-07T19:30:00.000Z",
  "profileImage": null,
  "preferences": {
    "language": "tr",
    "timezone": "Europe/Istanbul",
    "notifications": {
      "email": true,
      "browser": false
    }
  },
  "createdAt": "2025-12-07T19:25:02.278Z",
  "updatedAt": "2025-12-07T19:25:02.278Z"
}
```

### 8. Kullanıcı Güncelle
```javascript
PATCH /users/:id
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "Güncellenmiş İsim",
  "email": "yeni-email@example.com",
  "role": "EDITOR",
  "tenantId": 2,
  "isActive": false
}

// Response
{
  "id": 2,
  "name": "Güncellenmiş İsim",
  "email": "yeni-email@example.com",
  "role": "EDITOR",
  "tenantId": 2,
  "isActive": false,
  "updatedAt": "2025-12-07T21:30:00.000Z",
  "message": "User updated successfully"
}
```

### 9. Kullanıcı Sil (Deaktif Et)
```javascript
DELETE /users/:id
Authorization: Bearer {superAdminToken}

// Response
{
  "id": 2,
  "message": "User deactivated successfully",
  "deactivatedAt": "2025-12-07T21:45:00.000Z"
}
```

### 10. Kullanıcı Aktivitelerini Getir
```javascript
GET /users/:id/activity
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?page=1&limit=20&dateFrom=2025-12-01&dateTo=2025-12-07&activityType=login,page_create,post_update

// Response
{
  "activities": [
    {
      "id": 101,
      "userId": 2,
      "type": "page_create",
      "description": "Created page: Hakkımızda",
      "entityType": "page",
      "entityId": 5,
      "metadata": {
        "pageTitle": "Hakkımızda",
        "language": "tr"
      },
      "createdAt": "2025-12-07T20:00:00.000Z"
    },
    {
      "id": 100,
      "userId": 2,
      "type": "login",
      "description": "User logged in",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-12-07T19:30:00.000Z"
    }
  ],
  "total": 45,
  "totalPages": 3,
  "currentPage": 1
}
```

### 11. Kullanıcı Şifresi Değiştir
```javascript
POST /users/:id/change-password
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "newPassword": "YeniSifre123!",
  "sendNotification": true
}

// Response
{
  "message": "Password changed successfully",
  "passwordChangedAt": "2025-12-07T22:00:00.000Z"
}
```

### 12. Kullanıcı Aktivite Logu
```javascript
GET /users/:id/activity-log
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "user": {
    "id": 2,
    "name": "Tenant Administrator",
    "email": "admin@demo.softellio.com"
  },
  "statistics": {
    "totalActivities": 156,
    "loginCount": 25,
    "lastLogin": "2025-12-07T19:30:00.000Z",
    "pagesCreated": 10,
    "postsCreated": 5,
    "mediaUploaded": 15
  },
  "recentActivities": [
    {
      "type": "page_create",
      "description": "Created page: Hakkımızda",
      "createdAt": "2025-12-07T20:00:00.000Z"
    }
  ]
}
```

### 13. Kullanıcı Aktivite Özeti
```javascript
GET /users/:id/activity-summary
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?period=week // day, week, month, year

// Response
{
  "period": "week",
  "dateRange": {
    "start": "2025-12-01T00:00:00.000Z",
    "end": "2025-12-07T23:59:59.000Z"
  },
  "summary": {
    "totalActivities": 45,
    "activeDays": 5,
    "averageActivitiesPerDay": 9,
    "mostActiveDay": "2025-12-05",
    "activityBreakdown": {
      "content": 25,
      "media": 8,
      "settings": 5,
      "login": 7
    }
  }
}
```

### 14. Global Aktivite Özeti
```javascript
GET /users/activity/global-summary
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?period=month&tenantId=1

// Response
{
  "period": "month",
  "totalUsers": 145,
  "activeUsers": 89,
  "totalActivities": 2456,
  "averageActivitiesPerUser": 27.6,
  "activityTrends": [
    {
      "date": "2025-12-01",
      "activities": 89,
      "activeUsers": 34
    }
  ],
  "topActiveUsers": [
    {
      "userId": 2,
      "userName": "Tenant Administrator",
      "activities": 156,
      "rank": 1
    }
  ],
  "activityBreakdown": {
    "content": {
      "total": 1245,
      "percentage": 50.7
    },
    "media": {
      "total": 456,
      "percentage": 18.6
    }
  }
}
```

---

## ⚙️ Sistem Ayarları

### 1. Tüm Sistem Ayarlarını Listele
```javascript
GET /system-settings
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?category=email,security,performance&isActive=true&scope=global&page=1&limit=20

// Response
[
  {
    "id": 1,
    "key": "smtp_host",
    "value": "smtp.gmail.com",
    "type": "string",
    "category": "email",
    "scope": "global",
    "isActive": true,
    "description": "SMTP server hostname",
    "validationRules": {
      "required": true,
      "format": "hostname"
    },
    "createdAt": "2025-12-07T19:25:00.000Z",
    "updatedAt": "2025-12-07T20:00:00.000Z"
  }
]
```

### 2. Kategori Bazlı Ayarları Getir
```javascript
GET /system-settings/category/:category
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Örnek: Email ayarları
GET /system-settings/category/email

// Response
{
  "category": "email",
  "settings": [
    {
      "key": "smtp_host",
      "value": "smtp.gmail.com",
      "type": "string",
      "description": "SMTP server hostname"
    },
    {
      "key": "smtp_port",
      "value": "587",
      "type": "number",
      "description": "SMTP server port"
    },
    {
      "key": "smtp_secure",
      "value": "true",
      "type": "boolean",
      "description": "Use TLS/SSL"
    }
  ]
}
```

### 3. Sistem Ayarları İstatistikleri
```javascript
GET /system-settings/statistics
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "overview": {
    "totalSettings": 45,
    "activeSettings": 42,
    "categories": 8,
    "globalSettings": 25,
    "tenantSpecificSettings": 20
  },
  "byCategory": {
    "email": 8,
    "security": 12,
    "performance": 6,
    "storage": 4,
    "api": 7,
    "ui": 5,
    "backup": 3
  },
  "recentChanges": [
    {
      "key": "max_file_size",
      "oldValue": "10MB",
      "newValue": "25MB",
      "changedAt": "2025-12-07T20:00:00.000Z",
      "changedBy": "admin@softellio.com"
    }
  ]
}
```

### 4. Yeni Sistem Ayarı Oluştur
```javascript
POST /system-settings
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "key": "max_upload_size",
  "value": "50MB",
  "type": "string",
  "category": "storage",
  "scope": "global",
  "description": "Maximum file upload size",
  "validationRules": {
    "required": true,
    "format": "file-size"
  },
  "isActive": true
}

// Response
{
  "id": 46,
  "key": "max_upload_size",
  "value": "50MB",
  "type": "string",
  "category": "storage",
  "scope": "global",
  "description": "Maximum file upload size",
  "isActive": true,
  "createdAt": "2025-12-07T21:00:00.000Z"
}
```

### 5. Sistem Ayarını Güncelle
```javascript
PATCH /system-settings/:id
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "value": "100MB",
  "description": "Updated maximum file upload size",
  "isActive": true
}

// Response
{
  "id": 46,
  "key": "max_upload_size",
  "value": "100MB",
  "type": "string",
  "category": "storage",
  "description": "Updated maximum file upload size",
  "isActive": true,
  "updatedAt": "2025-12-07T21:30:00.000Z"
}
```

### 6. Ayarları Dışa Aktar
```javascript
GET /system-settings/export
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?category=email,security&format=json

// Response
{
  "exportedAt": "2025-12-07T21:00:00.000Z",
  "categories": ["email", "security"],
  "settings": {
    "email": {
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "smtp_secure": true
    },
    "security": {
      "jwt_expiry": "1h",
      "max_login_attempts": 5,
      "lockout_duration": "15m"
    }
  }
}
```

### 7. Ayarları İçe Aktar
```javascript
POST /system-settings/import
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "settings": {
    "email": {
      "smtp_host": "new-smtp.gmail.com",
      "smtp_port": 465
    }
  },
  "mergeMode": "overwrite", // merge, overwrite, skip-existing
  "validateBeforeImport": true
}

// Response
{
  "importedAt": "2025-12-07T21:30:00.000Z",
  "totalSettings": 12,
  "imported": 10,
  "skipped": 2,
  "errors": 0,
  "results": [
    {
      "key": "smtp_host",
      "action": "updated",
      "oldValue": "smtp.gmail.com",
      "newValue": "new-smtp.gmail.com"
    }
  ]
}
```

### 8. Konfigürasyon Yedeği Oluştur
```javascript
POST /system-settings/backup
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "Pre-maintenance backup",
  "description": "Backup before system maintenance",
  "includeCategories": ["all"], // veya ["email", "security"]
  "includeInactiveSettings": false
}

// Response
{
  "backupId": "backup_abc123",
  "name": "Pre-maintenance backup",
  "description": "Backup before system maintenance",
  "settingsCount": 42,
  "size": "15KB",
  "createdAt": "2025-12-07T21:45:00.000Z"
}
```

### 9. Konfigürasyon Yedeklerini Listele
```javascript
GET /system-settings/backups
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
[
  {
    "backupId": "backup_abc123",
    "name": "Pre-maintenance backup",
    "description": "Backup before system maintenance",
    "settingsCount": 42,
    "size": "15KB",
    "createdAt": "2025-12-07T21:45:00.000Z"
  }
]
```

### 10. Yedekten Geri Yükle
```javascript
POST /system-settings/restore
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "backupId": "backup_abc123",
  "restoreMode": "selective", // full, selective
  "categoriesToRestore": ["email", "security"],
  "confirmOverwrite": true
}

// Response
{
  "restoreId": "restore_def456",
  "backupId": "backup_abc123",
  "restoredAt": "2025-12-07T22:00:00.000Z",
  "settingsRestored": 25,
  "settingsSkipped": 17,
  "results": [
    {
      "key": "smtp_host",
      "action": "restored",
      "previousValue": "new-smtp.gmail.com",
      "restoredValue": "smtp.gmail.com"
    }
  ]
}
```

### 11. Varsayılan Ayarlara Sıfırla
```javascript
POST /system-settings/reset-defaults
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "categories": ["email"], // Belirli kategorileri sıfırla
  "confirmReset": true,
  "backupBeforeReset": true
}

// Response
{
  "resetAt": "2025-12-07T22:15:00.000Z",
  "categories": ["email"],
  "settingsReset": 8,
  "backupCreated": {
    "backupId": "backup_before_reset_789",
    "createdAt": "2025-12-07T22:14:00.000Z"
  }
}
```

### 12. Sistem Sağlık Durumu
```javascript
GET /system-settings/health/status
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "status": "healthy",
  "checkedAt": "2025-12-07T22:00:00.000Z",
  "components": {
    "database": {
      "status": "healthy",
      "latency": "12ms"
    },
    "redis": {
      "status": "healthy",
      "latency": "3ms"
    },
    "email": {
      "status": "warning",
      "message": "SMTP connection slow"
    },
    "storage": {
      "status": "healthy",
      "diskUsage": "45%"
    }
  },
  "criticalSettings": {
    "missingRequired": [],
    "invalidValues": [],
    "deprecatedSettings": ["old_api_key"]
  }
}
```

### 13. Ayar Doğrulama
```javascript
POST /system-settings/validate
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "settings": {
    "smtp_host": "new-server.com",
    "smtp_port": 587,
    "max_file_size": "invalid_size"
  }
}

// Response
{
  "valid": false,
  "validationResults": [
    {
      "key": "smtp_host",
      "valid": true
    },
    {
      "key": "smtp_port",
      "valid": true
    },
    {
      "key": "max_file_size",
      "valid": false,
      "error": "Invalid file size format"
    }
  ]
}
```

---

## 📊 Monitoring & Loglama

### 1. Monitoring Konfigürasyonu
```javascript
GET /monitoring/config
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "logging": {
    "level": "info",
    "enableFileLogging": true,
    "logRotation": "daily",
    "maxLogFiles": 30
  },
  "metrics": {
    "enabled": true,
    "retentionDays": 90,
    "collectSystemMetrics": true,
    "collectCustomMetrics": true
  },
  "alerts": {
    "enabled": true,
    "emailNotifications": true,
    "webhookUrl": "https://hooks.slack.com/...",
    "defaultThresholds": {
      "cpuUsage": 80,
      "memoryUsage": 85,
      "diskUsage": 90
    }
  }
}
```

### 2. Monitoring Konfigürasyonu Güncelle
```javascript
PATCH /monitoring/config
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "logging": {
    "level": "debug",
    "enableFileLogging": true
  },
  "alerts": {
    "emailNotifications": false,
    "webhookUrl": "https://hooks.slack.com/new-webhook"
  }
}

// Response
{
  "message": "Monitoring configuration updated successfully",
  "updatedAt": "2025-12-07T22:00:00.000Z"
}
```

### 3. Log Kayıtlarını Sorgula
```javascript
GET /monitoring/logs
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?level=error&context=auth&startDate=2025-12-07T00:00:00.000Z&endDate=2025-12-07T23:59:59.999Z&limit=100&search=login

// Response
{
  "logs": [
    {
      "id": "log_123456",
      "timestamp": "2025-12-07T22:15:30.123Z",
      "level": "error",
      "context": "auth",
      "message": "Login failed for user: admin@example.com",
      "metadata": {
        "userId": null,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "attempt": 3
      },
      "tenantId": 1
    }
  ],
  "total": 245,
  "totalPages": 3,
  "currentPage": 1
}
```

### 4. Mevcut Log Kontekstleri
```javascript
GET /monitoring/logs/contexts
Authorization: Bearer {superAdminToken}

// Response
{
  "contexts": [
    {
      "name": "auth",
      "description": "Authentication and authorization logs",
      "logCount": 1250
    },
    {
      "name": "api",
      "description": "API request and response logs",
      "logCount": 5420
    },
    {
      "name": "database",
      "description": "Database operation logs",
      "logCount": 890
    },
    {
      "name": "email",
      "description": "Email sending logs",
      "logCount": 340
    }
  ]
}
```

### 5. Logları Dışa Aktar
```javascript
GET /monitoring/logs/export
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?format=csv&startDate=2025-12-07T00:00:00.000Z&endDate=2025-12-07T23:59:59.999Z&level=error,warn&context=auth,api

// Response (CSV Content)
Content-Type: application/csv
Content-Disposition: attachment; filename="logs_2025-12-07.csv"

"timestamp","level","context","message","userId","tenantId","ipAddress"
"2025-12-07T22:15:30.123Z","error","auth","Login failed","null","1","192.168.1.100"
```

### 6. Özel Metrik Oluştur
```javascript
POST /monitoring/metrics
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "api_response_time",
  "type": "gauge",
  "value": 245.5,
  "unit": "ms",
  "labels": {
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": "200"
  },
  "tenantId": 1,
  "source": "api_gateway"
}

// Response
{
  "id": "metric_789123",
  "name": "api_response_time",
  "type": "gauge",
  "value": 245.5,
  "unit": "ms",
  "recordedAt": "2025-12-07T22:30:00.000Z",
  "message": "Metric recorded successfully"
}
```

### 7. Metrikleri Sorgula
```javascript
GET /monitoring/metrics
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?name=cpu_usage,memory_usage&startTime=2025-12-07T20:00:00.000Z&endTime=2025-12-07T22:00:00.000Z&tenantId=1&aggregation=avg&interval=5m

// Response
{
  "metrics": [
    {
      "name": "cpu_usage",
      "type": "gauge",
      "unit": "percent",
      "dataPoints": [
        {
          "timestamp": "2025-12-07T20:00:00.000Z",
          "value": 45.2,
          "labels": {
            "server": "web-1"
          }
        },
        {
          "timestamp": "2025-12-07T20:05:00.000Z",
          "value": 52.8,
          "labels": {
            "server": "web-1"
          }
        }
      ]
    }
  ],
  "timeRange": {
    "start": "2025-12-07T20:00:00.000Z",
    "end": "2025-12-07T22:00:00.000Z"
  }
}
```

### 8. Performans Metrikleri
```javascript
GET /monitoring/metrics/performance
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?period=1h&includeBreakdown=true

// Response
{
  "period": "1h",
  "system": {
    "cpu": {
      "average": 45.2,
      "peak": 78.5,
      "current": 52.1
    },
    "memory": {
      "used": "2.4GB",
      "total": "8GB",
      "percentage": 30
    },
    "disk": {
      "used": "145GB",
      "total": "500GB",
      "percentage": 29
    }
  },
  "application": {
    "requestCount": 12450,
    "avgResponseTime": 185,
    "errorRate": 0.5,
    "activeConnections": 234
  },
  "database": {
    "activeConnections": 12,
    "maxConnections": 100,
    "avgQueryTime": 25,
    "slowQueries": 3
  }
}
```

### 9. Alert Kuralı Oluştur
```javascript
POST /monitoring/alerts/rules
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "High CPU Usage",
  "description": "Alert when CPU usage exceeds 80%",
  "metricName": "cpu_usage",
  "condition": "greater_than",
  "threshold": 80,
  "duration": "5m",
  "severity": "warning",
  "enabled": true,
  "notificationChannels": ["email", "slack"],
  "labels": {
    "team": "devops",
    "service": "api"
  }
}

// Response
{
  "id": "alert_rule_456",
  "name": "High CPU Usage",
  "description": "Alert when CPU usage exceeds 80%",
  "metricName": "cpu_usage",
  "condition": "greater_than",
  "threshold": 80,
  "enabled": true,
  "createdAt": "2025-12-07T22:45:00.000Z"
}
```

### 10. Alert Kurallarını Listele
```javascript
GET /monitoring/alerts/rules
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?enabled=true&severity=warning,critical&page=1&limit=20

// Response
{
  "rules": [
    {
      "id": "alert_rule_456",
      "name": "High CPU Usage",
      "description": "Alert when CPU usage exceeds 80%",
      "metricName": "cpu_usage",
      "condition": "greater_than",
      "threshold": 80,
      "severity": "warning",
      "enabled": true,
      "lastTriggered": "2025-12-07T21:30:00.000Z",
      "triggerCount": 5
    }
  ],
  "total": 12,
  "totalPages": 1,
  "currentPage": 1
}
```

### 11. Aktif Alertleri Sorgula
```javascript
GET /monitoring/alerts
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?status=active,acknowledged&severity=critical&startDate=2025-12-07&page=1&limit=20

// Response
{
  "alerts": [
    {
      "id": "alert_789",
      "ruleId": "alert_rule_456",
      "ruleName": "High CPU Usage",
      "status": "active",
      "severity": "warning",
      "message": "CPU usage is 85.2% (threshold: 80%)",
      "triggeredAt": "2025-12-07T22:30:00.000Z",
      "acknowledgedAt": null,
      "resolvedAt": null,
      "metadata": {
        "currentValue": 85.2,
        "threshold": 80,
        "duration": "5m"
      }
    }
  ],
  "total": 3,
  "totalPages": 1,
  "currentPage": 1
}
```

### 12. Alert'i Onayla
```javascript
POST /monitoring/alerts/:id/acknowledge
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "message": "Investigating high CPU usage"
}

// Response
{
  "id": "alert_789",
  "status": "acknowledged",
  "acknowledgedAt": "2025-12-07T22:45:00.000Z",
  "acknowledgedBy": "admin@softellio.com",
  "message": "Investigating high CPU usage"
}
```

### 13. Alert'i Çöz
```javascript
POST /monitoring/alerts/:id/resolve
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "resolution": "CPU usage returned to normal after optimization"
}

// Response
{
  "id": "alert_789",
  "status": "resolved",
  "resolvedAt": "2025-12-07T23:00:00.000Z",
  "resolvedBy": "admin@softellio.com",
  "resolution": "CPU usage returned to normal after optimization"
}
```

### 14. Sistem Sağlık Durumu
```javascript
GET /monitoring/health
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "status": "healthy",
  "checkedAt": "2025-12-07T23:00:00.000Z",
  "version": "1.0.0",
  "uptime": "5d 12h 30m",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2
    },
    "email": {
      "status": "warning",
      "responseTime": 1250,
      "message": "SMTP server responding slowly"
    }
  },
  "metrics": {
    "cpu": 52.1,
    "memory": 30,
    "disk": 29,
    "activeUsers": 45,
    "requestsPerMinute": 1250
  }
}
```

### 15. Real-time Monitoring Stream
```javascript
// Server-Sent Events (SSE)
GET /monitoring/events
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}
Accept: text/event-stream

// Response (Stream)
data: {"type":"metric","name":"cpu_usage","value":52.1,"timestamp":"2025-12-07T23:01:00.000Z"}

data: {"type":"alert","id":"alert_890","severity":"critical","message":"High memory usage detected"}

data: {"type":"log","level":"error","context":"api","message":"Database connection failed"}
```

---

## 💾 Yedekleme & Güncelleme

### 1. Sistem Güncellemesi Oluştur
```javascript
POST /backup/updates
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "name": "v1.2.0 Security Update",
  "version": "1.2.0",
  "description": "Critical security patches and performance improvements",
  "type": "security",
  "priority": "high",
  "affectedModules": ["auth", "api", "database"],
  "scheduledAt": "2025-12-08T02:00:00.000Z",
  "estimatedDuration": "30m",
  "requiresDowntime": true,
  "rollbackPlan": {
    "enabled": true,
    "automaticRollback": true,
    "rollbackConditions": ["high_error_rate", "service_unavailable"]
  },
  "preUpdateTasks": [
    "create_database_backup",
    "verify_disk_space",
    "notify_users"
  ]
}

// Response
{
  "updateId": "update_abc123",
  "name": "v1.2.0 Security Update",
  "version": "1.2.0",
  "status": "scheduled",
  "scheduledAt": "2025-12-08T02:00:00.000Z",
  "createdAt": "2025-12-07T23:15:00.000Z"
}
```

### 2. Sistem Güncellemelerini Listele
```javascript
GET /backup/updates
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Query Parameters
?status=scheduled,in_progress,completed&type=security&priority=high&page=1&limit=10

// Response
{
  "updates": [
    {
      "updateId": "update_abc123",
      "name": "v1.2.0 Security Update",
      "version": "1.2.0",
      "status": "scheduled",
      "type": "security",
      "priority": "high",
      "scheduledAt": "2025-12-08T02:00:00.000Z",
      "estimatedDuration": "30m",
      "requiresDowntime": true,
      "createdAt": "2025-12-07T23:15:00.000Z"
    }
  ],
  "total": 15,
  "totalPages": 2,
  "currentPage": 1
}
```

### 3. Güncelleme Detaylarını Getir
```javascript
GET /backup/updates/:updateId
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "updateId": "update_abc123",
  "name": "v1.2.0 Security Update",
  "version": "1.2.0",
  "description": "Critical security patches and performance improvements",
  "status": "in_progress",
  "type": "security",
  "priority": "high",
  "affectedModules": ["auth", "api", "database"],
  "scheduledAt": "2025-12-08T02:00:00.000Z",
  "startedAt": "2025-12-08T02:00:15.000Z",
  "estimatedDuration": "30m",
  "progress": {
    "percentage": 45,
    "currentTask": "updating_database_schema",
    "completedTasks": ["backup_created", "services_stopped"],
    "remainingTasks": ["apply_patches", "restart_services", "verify_health"]
  },
  "rollbackPlan": {
    "enabled": true,
    "automaticRollback": true,
    "rollbackConditions": ["high_error_rate", "service_unavailable"]
  }
}
```

### 4. Güncelleme İlerlemesini Takip Et
```javascript
GET /backup/updates/:updateId/progress
Authorization: Bearer {superAdminToken}
X-Tenant-Domain: {domain}

// Response
{
  "updateId": "update_abc123",
  "status": "in_progress",
  "progress": {
    "percentage": 75,
    "currentTask": "restarting_services",
    "taskProgress": 50,
    "estimatedTimeRemaining": "8m"
  },
  "logs": [
    {
      "timestamp": "2025-12-08T02:00:15.000Z",
      "level": "info",
      "message": "Update process started"
    },
    {
      "timestamp": "2025-12-08T02:05:30.000Z",
      "level": "info",
      "message": "Database backup completed successfully"
    },
    {
      "timestamp": "2025-12-08T02:15:45.000Z",
      "level": "info",
      "message": "Security patches applied"
    }
  ]
}
```

### 5. Sistem Güncellemesi Güncelle
```javascript
PATCH /backup/updates/:updateId
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "scheduledAt": "2025-12-08T03:00:00.000Z",
  "priority": "critical",
  "requiresDowntime": false
}

// Response
{
  "updateId": "update_abc123",
  "scheduledAt": "2025-12-08T03:00:00.000Z",
  "priority": "critical",
  "requiresDowntime": false,
  "updatedAt": "2025-12-07T23:45:00.000Z"
}
```

### 6. Sistem Güncelleme Rollback
```javascript
POST /backup/updates/:updateId/rollback
Authorization: Bearer {superAdminToken}
Content-Type: application/json

{
  "reason": "High error rate detected after update",
  "force": false
}

// Response
{
  "rollbackId": "rollback_def456",
  "updateId": "update_abc123",
  "status": "rollback_initiated",
  "reason": "High error rate detected after update",
  "initiatedAt": "2025-12-08T02:45:00.000Z",
  "estimatedDuration": "15m"
}
```

---

## ❌ Hata Kodları

### HTTP Durum Kodları

| Kod | Açıklama | Örnek Durumlar |
|-----|----------|----------------|
| 200 | OK | Başarılı işlem |
| 201 | Created | Kaynak oluşturuldu |
| 400 | Bad Request | Geçersiz parametre |
| 401 | Unauthorized | Token geçersiz/yok |
| 403 | Forbidden | Yetki yok |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Çakışma (duplicate) |
| 422 | Validation Error | Doğrulama hatası |
| 500 | Internal Server Error | Sunucu hatası |

### Hata Yanıt Formatı

```javascript
{
  "error": "Unauthorized",
  "message": "Invalid token",
  "statusCode": 401,
  "timestamp": "2025-12-07T23:00:00.000Z",
  "path": "/super-admin/tenants",
  "details": {
    "code": "TOKEN_INVALID",
    "tokenExpired": true
  }
}
```

### Doğrulama Hataları

```javascript
{
  "error": "Validation Error",
  "message": "Input validation failed",
  "statusCode": 422,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "value": "123"
    }
  ]
}
```

---

## 📝 Notlar

### Güvenlik
- Tüm API'lar SUPER_ADMIN rolü gerektirir
- Bearer token her istekte gönderilmelidir
- HTTPS kullanılması zorunludur (production'da)

### Rate Limiting
- Dakikada maksimum 100 istek
- Aşıldığında 429 Too Many Requests döner

### Pagination
- Varsayılan sayfa boyutu: 10
- Maksimum sayfa boyutu: 100
- `page` ve `limit` parametreleri kullanılır

### Sıralama
- `sortBy` parametresi ile alan adı
- `sortOrder` parametresi ile `asc` veya `desc`

---

Bu dokümantasyon Super Admin paneli için tüm API'ları kapsar. Her endpoint için gerçek örnekler ve detaylı açıklamalar mevcuttur.