# 🏠 TENANT ADMIN PANEL API DOKÜMANTASYONU

> **Tenant yöneticileri için eksiksiz API rehberi**
> Bu dokümantasyon Tenant Admin panelinde kullanılacak tüm API'ları içerir.

---

## 📋 İÇERİK

1. [Giriş](#giriş)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [Sayfa Yönetimi](#sayfa-yönetimi)
4. [Blog Yönetimi](#blog-yönetimi)
5. [Menü Yönetimi](#menü-yönetimi)
6. [Medya Yönetimi](#medya-yönetimi)
7. [Site Ayarları](#site-ayarları)
8. [Hizmetler Yönetimi](#hizmetler-yönetimi)
9. [İletişim Bilgileri](#iletişim-bilgileri)
10. [Ekip Üyeleri](#ekip-üyeleri)
11. [Referanslar/Portfolio](#referanslarportfolio)
12. [Sosyal Medya & Haritalar](#sosyal-medya--haritalar)
13. [Banner & Slider Yönetimi](#banner--slider-yönetimi)
14. [Dashboard Analytics](#dashboard-analytics)
15. [SEO Yönetimi](#seo-yönetimi)
16. [Yedekleme Yönetimi](#yedekleme-yönetimi)
17. [Domain Yönetimi](#domain-yönetimi)
18. [Hata Kodları](#hata-kodları)

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
Bu API'lar `TENANT_ADMIN` veya `EDITOR` rolüne sahip kullanıcılar tarafından kullanılabilir.

---

## 🔐 Kimlik Doğrulama

### Tenant Admin Girişi
```javascript
POST /auth/login
Content-Type: application/json
X-Tenant-Domain: demo.softellio.com

{
  "email": "admin@demo.softellio.com",
  "password": "TenantAdmin123!"
}

// Başarılı Yanıt
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "admin@demo.softellio.com",
    "name": "Tenant Administrator",
    "role": "TENANT_ADMIN",
    "tenantId": 1,
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

### Mevcut Kullanıcı Bilgileri
```javascript
POST /auth/me
Authorization: Bearer {accessToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 2,
  "email": "admin@demo.softellio.com",
  "name": "Tenant Administrator",
  "role": "TENANT_ADMIN",
  "tenantId": 1,
  "tenant": {
    "name": "Demo Company",
    "domain": "demo.softellio.com",
    "defaultLanguage": "tr",
    "availableLanguages": ["tr", "en"]
  },
  "isActive": true,
  "lastLoginAt": "2025-12-07T19:30:00.000Z"
}
```

---

## 📄 Sayfa Yönetimi

### 1. Tüm Sayfaları Listele
```javascript
GET /pages/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&search=hakkımızda&status=published&language=tr&sortBy=createdAt&sortOrder=desc

// Response
{
  "pages": [
    {
      "id": 1,
      "tenantId": 1,
      "status": "published",
      "createdAt": "2025-12-07T19:25:02.340Z",
      "updatedAt": "2025-12-07T19:25:02.340Z",
      "translations": [
        {
          "id": 1,
          "pageId": 1,
          "language": "tr",
          "title": "Ana Sayfa",
          "slug": "ana-sayfa",
          "contentJson": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Hoş Geldiniz",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "Bu demo web sitesinin ana sayfasıdır."
                }
              }
            ]
          },
          "metaTitle": "Ana Sayfa - Demo Şirketi",
          "metaDescription": "Demo şirketimizin ana sayfası",
          "excerpt": "Demo web sitesinin ana sayfası"
        },
        {
          "id": 2,
          "pageId": 1,
          "language": "en",
          "title": "Home Page",
          "slug": "home",
          "contentJson": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Welcome",
                  "level": 1
                }
              }
            ]
          },
          "metaTitle": "Home Page - Demo Company",
          "metaDescription": "Home page of our demo company"
        }
      ]
    }
  ],
  "total": 15,
  "totalPages": 1,
  "currentPage": 1
}
```

### 2. Yeni Sayfa Oluştur
```javascript
POST /pages/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "status": "draft",
  "translations": [
    {
      "language": "tr",
      "title": "Yeni Sayfa",
      "slug": "yeni-sayfa",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Yeni Sayfa Başlığı",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Bu yeni sayfanın içeriğidir."
            }
          },
          {
            "type": "image",
            "data": {
              "file": {
                "url": "https://example.com/image.jpg"
              },
              "caption": "Örnek görsel",
              "withBorder": false,
              "withBackground": false,
              "stretched": false
            }
          }
        ]
      },
      "metaTitle": "Yeni Sayfa - Demo Şirketi",
      "metaDescription": "Yeni sayfa açıklaması",
      "excerpt": "Kısa özet"
    },
    {
      "language": "en",
      "title": "New Page",
      "slug": "new-page",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "New Page Title",
              "level": 1
            }
          }
        ]
      },
      "metaTitle": "New Page - Demo Company",
      "metaDescription": "New page description"
    }
  ]
}

// Response
{
  "id": 3,
  "tenantId": 1,
  "status": "draft",
  "createdAt": "2025-12-07T22:00:00.000Z",
  "updatedAt": "2025-12-07T22:00:00.000Z",
  "translations": [
    {
      "id": 5,
      "pageId": 3,
      "language": "tr",
      "title": "Yeni Sayfa",
      "slug": "yeni-sayfa",
      "metaTitle": "Yeni Sayfa - Demo Şirketi"
    },
    {
      "id": 6,
      "pageId": 3,
      "language": "en",
      "title": "New Page",
      "slug": "new-page",
      "metaTitle": "New Page - Demo Company"
    }
  ]
}
```

### 3. Sayfa Detaylarını Getir
```javascript
GET /pages/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "tenantId": 1,
  "status": "published",
  "createdAt": "2025-12-07T19:25:02.340Z",
  "updatedAt": "2025-12-07T19:25:02.340Z",
  "translations": [
    {
      "id": 1,
      "pageId": 1,
      "language": "tr",
      "title": "Ana Sayfa",
      "slug": "ana-sayfa",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Hoş Geldiniz",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Bu demo web sitesinin ana sayfasıdır."
            }
          }
        ]
      },
      "metaTitle": "Ana Sayfa - Demo Şirketi",
      "metaDescription": "Demo şirketimizin ana sayfası",
      "excerpt": "Demo web sitesinin ana sayfası"
    }
  ],
  "seoData": {
    "canonical": "https://demo.softellio.com/ana-sayfa",
    "ogTitle": "Ana Sayfa",
    "ogDescription": "Demo şirketimizin ana sayfası",
    "ogImage": null
  },
  "analytics": {
    "viewCount": 1250,
    "uniqueViews": 890,
    "lastViewed": "2025-12-07T21:30:00.000Z"
  }
}
```

### 4. Sayfa Güncelle
```javascript
PATCH /pages/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "status": "published",
  "translations": [
    {
      "language": "tr",
      "title": "Güncellenmiş Ana Sayfa",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Güncellenen Başlık",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Güncellenmiş içerik."
            }
          }
        ]
      },
      "metaTitle": "Güncellenmiş Ana Sayfa - Demo Şirketi",
      "metaDescription": "Güncellenmiş açıklama"
    }
  ]
}

// Response
{
  "id": 1,
  "status": "published",
  "updatedAt": "2025-12-07T22:30:00.000Z",
  "message": "Page updated successfully"
}
```

### 5. Sayfa Sil
```javascript
DELETE /pages/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "message": "Page deleted successfully",
  "deletedAt": "2025-12-07T22:45:00.000Z"
}
```

### 6. Sayfa Kopyala
```javascript
POST /pages/admin/:id/duplicate
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "titleSuffix": " - Kopya",
  "status": "draft",
  "copyTranslations": true
}

// Response
{
  "id": 4,
  "originalPageId": 1,
  "status": "draft",
  "createdAt": "2025-12-07T23:00:00.000Z",
  "translations": [
    {
      "language": "tr",
      "title": "Ana Sayfa - Kopya",
      "slug": "ana-sayfa-kopya"
    }
  ]
}
```

### 7. Toplu Sayfa Silme
```javascript
DELETE /pages/admin/bulk
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "pageIds": [3, 4, 5]
}

// Response
{
  "deletedCount": 3,
  "deletedIds": [3, 4, 5],
  "message": "3 pages deleted successfully"
}
```

### 8. Sayfa Önizleme
```javascript
GET /pages/preview/:language/:slug
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "translation": {
    "title": "Ana Sayfa",
    "slug": "ana-sayfa",
    "contentJson": {
      "blocks": [
        {
          "type": "header",
          "data": {
            "text": "Hoş Geldiniz",
            "level": 1
          }
        }
      ]
    },
    "metaTitle": "Ana Sayfa - Demo Şirketi",
    "metaDescription": "Demo şirketimizin ana sayfası"
  },
  "status": "draft",
  "isPreview": true
}
```

---

## 📝 Blog Yönetimi

### 1. Blog Kategorilerini Listele
```javascript
GET /blog/admin/categories
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?language=tr&isActive=true&page=1&limit=20

// Response
{
  "categories": [
    {
      "id": 1,
      "tenantId": 1,
      "isActive": true,
      "createdAt": "2025-12-07T19:25:02.290Z",
      "translations": [
        {
          "id": 1,
          "categoryId": 1,
          "language": "tr",
          "name": "Teknoloji",
          "slug": "teknoloji",
          "description": "Teknoloji ile ilgili yazılar"
        },
        {
          "id": 2,
          "categoryId": 1,
          "language": "en",
          "name": "Technology",
          "slug": "technology",
          "description": "Technology related articles"
        }
      ],
      "postCount": 5,
      "lastPostAt": "2025-12-07T20:00:00.000Z"
    }
  ],
  "total": 3,
  "totalPages": 1,
  "currentPage": 1
}
```

### 2. Yeni Blog Kategorisi Oluştur
```javascript
POST /blog/admin/categories
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "isActive": true,
  "translations": [
    {
      "language": "tr",
      "name": "Tasarım",
      "slug": "tasarim",
      "description": "Tasarım ve UI/UX ile ilgili yazılar"
    },
    {
      "language": "en",
      "name": "Design",
      "slug": "design",
      "description": "Design and UI/UX related articles"
    }
  ]
}

// Response
{
  "id": 2,
  "tenantId": 1,
  "isActive": true,
  "createdAt": "2025-12-07T22:00:00.000Z",
  "translations": [
    {
      "id": 3,
      "categoryId": 2,
      "language": "tr",
      "name": "Tasarım",
      "slug": "tasarim"
    },
    {
      "id": 4,
      "categoryId": 2,
      "language": "en",
      "name": "Design",
      "slug": "design"
    }
  ]
}
```

### 3. Blog Kategorisi Güncelle
```javascript
PATCH /blog/admin/categories/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "isActive": true,
  "translations": [
    {
      "language": "tr",
      "name": "Web Tasarımı",
      "slug": "web-tasarimi",
      "description": "Web tasarımı ve geliştirme"
    }
  ]
}

// Response
{
  "id": 2,
  "isActive": true,
  "updatedAt": "2025-12-07T22:30:00.000Z",
  "message": "Category updated successfully"
}
```

### 4. Blog Kategorisi Sil
```javascript
DELETE /blog/admin/categories/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "message": "Category deleted successfully",
  "postsMoved": 3,
  "newCategoryId": 1
}
```

### 5. Blog Yazılarını Listele
```javascript
GET /blog/admin/posts
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&search=teknoloji&status=published&categoryId=1&language=tr&authorId=2&sortBy=publishedAt&sortOrder=desc

// Response
{
  "posts": [
    {
      "id": 1,
      "tenantId": 1,
      "authorId": 2,
      "categoryId": 1,
      "status": "published",
      "featuredImage": "https://example.com/featured.jpg",
      "publishedAt": "2025-12-07T19:25:02.356Z",
      "createdAt": "2025-12-07T19:25:02.350Z",
      "updatedAt": "2025-12-07T19:25:02.356Z",
      "author": {
        "id": 2,
        "name": "Tenant Administrator",
        "email": "admin@demo.softellio.com"
      },
      "category": {
        "id": 1,
        "translations": [
          {
            "language": "tr",
            "name": "Teknoloji",
            "slug": "teknoloji"
          }
        ]
      },
      "translations": [
        {
          "id": 1,
          "postId": 1,
          "language": "tr",
          "title": "İlk Blog Yazısı",
          "slug": "ilk-blog-yazisi",
          "contentJson": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Blog Yazısı Başlığı",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "Bu ilk blog yazısının içeriğidir."
                }
              }
            ]
          },
          "excerpt": "İlk blog yazısının özeti",
          "metaTitle": "İlk Blog Yazısı - Demo Şirketi",
          "metaDescription": "İlk blog yazısının açıklaması",
          "readingTime": 5
        }
      ],
      "tags": ["teknoloji", "web", "yazılım"],
      "analytics": {
        "viewCount": 245,
        "likeCount": 12,
        "commentCount": 3,
        "shareCount": 8
      }
    }
  ],
  "total": 25,
  "totalPages": 2,
  "currentPage": 1
}
```

### 6. Yeni Blog Yazısı Oluştur
```javascript
POST /blog/admin/posts
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "categoryId": 1,
  "status": "draft",
  "featuredImage": "https://example.com/new-post.jpg",
  "publishedAt": null,
  "translations": [
    {
      "language": "tr",
      "title": "Yeni Blog Yazısı",
      "slug": "yeni-blog-yazisi",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Yeni Blog Yazısı",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Bu yeni blog yazısının giriş paragrafıdır."
            }
          },
          {
            "type": "code",
            "data": {
              "code": "console.log('Hello World');",
              "language": "javascript"
            }
          },
          {
            "type": "quote",
            "data": {
              "text": "Programlama bir sanattır.",
              "caption": "Anonim"
            }
          }
        ]
      },
      "excerpt": "Yeni blog yazısının kısa özeti",
      "metaTitle": "Yeni Blog Yazısı - Demo Şirketi",
      "metaDescription": "Yeni blog yazısının detaylı açıklaması"
    },
    {
      "language": "en",
      "title": "New Blog Post",
      "slug": "new-blog-post",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "New Blog Post",
              "level": 1
            }
          }
        ]
      },
      "excerpt": "New blog post excerpt",
      "metaTitle": "New Blog Post - Demo Company",
      "metaDescription": "New blog post description"
    }
  ],
  "tags": ["teknoloji", "yazılım", "javascript"]
}

// Response
{
  "id": 2,
  "tenantId": 1,
  "authorId": 2,
  "categoryId": 1,
  "status": "draft",
  "featuredImage": "https://example.com/new-post.jpg",
  "createdAt": "2025-12-07T22:30:00.000Z",
  "updatedAt": "2025-12-07T22:30:00.000Z",
  "translations": [
    {
      "id": 3,
      "postId": 2,
      "language": "tr",
      "title": "Yeni Blog Yazısı",
      "slug": "yeni-blog-yazisi"
    }
  ],
  "tags": ["teknoloji", "yazılım", "javascript"]
}
```

### 7. Blog Yazısı Detaylarını Getir
```javascript
GET /blog/admin/posts/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "tenantId": 1,
  "authorId": 2,
  "categoryId": 1,
  "status": "published",
  "featuredImage": "https://example.com/featured.jpg",
  "publishedAt": "2025-12-07T19:25:02.356Z",
  "createdAt": "2025-12-07T19:25:02.350Z",
  "updatedAt": "2025-12-07T19:25:02.356Z",
  "author": {
    "id": 2,
    "name": "Tenant Administrator",
    "email": "admin@demo.softellio.com"
  },
  "category": {
    "id": 1,
    "translations": [
      {
        "language": "tr",
        "name": "Teknoloji",
        "slug": "teknoloji"
      }
    ]
  },
  "translations": [
    {
      "id": 1,
      "postId": 1,
      "language": "tr",
      "title": "İlk Blog Yazısı",
      "slug": "ilk-blog-yazisi",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Blog Yazısı Başlığı",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Bu ilk blog yazısının içeriğidir."
            }
          }
        ]
      },
      "excerpt": "İlk blog yazısının özeti",
      "metaTitle": "İlk Blog Yazısı - Demo Şirketi",
      "metaDescription": "İlk blog yazısının açıklaması",
      "readingTime": 5
    }
  ],
  "tags": ["teknoloji", "web", "yazılım"],
  "seoData": {
    "canonical": "https://demo.softellio.com/blog/ilk-blog-yazisi",
    "ogTitle": "İlk Blog Yazısı",
    "ogDescription": "İlk blog yazısının açıklaması",
    "ogImage": "https://example.com/featured.jpg"
  },
  "analytics": {
    "viewCount": 245,
    "uniqueViews": 189,
    "likeCount": 12,
    "commentCount": 3,
    "shareCount": 8,
    "avgReadingTime": 4.2,
    "bounceRate": 0.15
  }
}
```

### 8. Blog Yazısı Önizleme
```javascript
GET /blog/preview/:language/posts/:slug
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "post": {
    "id": 2,
    "translation": {
      "title": "Yeni Blog Yazısı",
      "slug": "yeni-blog-yazisi",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Yeni Blog Yazısı",
              "level": 1
            }
          }
        ]
      },
      "excerpt": "Yeni blog yazısının kısa özeti"
    },
    "category": {
      "name": "Teknoloji",
      "slug": "teknoloji"
    },
    "author": {
      "name": "Tenant Administrator"
    },
    "featuredImage": "https://example.com/new-post.jpg",
    "publishedAt": null,
    "status": "draft"
  },
  "isPreview": true
}
```

---

## 🧭 Menü Yönetimi

### 1. Tüm Menüleri Listele
```javascript
GET /menu/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?isActive=true&page=1&limit=20

// Response
{
  "menus": [
    {
      "id": 1,
      "tenantId": 1,
      "key": "main-menu",
      "isActive": true,
      "createdAt": "2025-12-07T19:25:02.371Z",
      "updatedAt": "2025-12-07T19:25:02.371Z",
      "translations": [
        {
          "id": 1,
          "menuId": 1,
          "language": "tr",
          "name": "Ana Menü",
          "description": "Web sitesinin ana menüsü"
        },
        {
          "id": 2,
          "menuId": 1,
          "language": "en",
          "name": "Main Menu",
          "description": "Main navigation menu"
        }
      ],
      "itemCount": 5
    }
  ],
  "total": 3,
  "totalPages": 1,
  "currentPage": 1
}
```

### 2. Yeni Menü Oluştur
```javascript
POST /menu/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "key": "footer-menu",
  "isActive": true,
  "translations": [
    {
      "language": "tr",
      "name": "Footer Menüsü",
      "description": "Alt kısım menüsü"
    },
    {
      "language": "en",
      "name": "Footer Menu",
      "description": "Footer navigation menu"
    }
  ]
}

// Response
{
  "id": 2,
  "tenantId": 1,
  "key": "footer-menu",
  "isActive": true,
  "createdAt": "2025-12-07T22:00:00.000Z",
  "translations": [
    {
      "id": 3,
      "menuId": 2,
      "language": "tr",
      "name": "Footer Menüsü"
    }
  ]
}
```

### 3. Menü Detaylarını Getir (Items ile)
```javascript
GET /menu/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "tenantId": 1,
  "key": "main-menu",
  "isActive": true,
  "createdAt": "2025-12-07T19:25:02.371Z",
  "translations": [
    {
      "id": 1,
      "menuId": 1,
      "language": "tr",
      "name": "Ana Menü",
      "description": "Web sitesinin ana menüsü"
    }
  ],
  "items": [
    {
      "id": 1,
      "menuId": 1,
      "parentId": null,
      "order": 1,
      "isActive": true,
      "type": "page",
      "url": null,
      "target": "_self",
      "cssClass": "",
      "icon": "home",
      "translations": [
        {
          "id": 1,
          "itemId": 1,
          "language": "tr",
          "label": "Ana Sayfa",
          "description": null
        },
        {
          "id": 2,
          "itemId": 1,
          "language": "en",
          "label": "Home",
          "description": null
        }
      ],
      "page": {
        "id": 1,
        "translations": [
          {
            "language": "tr",
            "title": "Ana Sayfa",
            "slug": "ana-sayfa"
          }
        ]
      },
      "children": []
    },
    {
      "id": 2,
      "menuId": 1,
      "parentId": null,
      "order": 2,
      "isActive": true,
      "type": "dropdown",
      "url": null,
      "target": "_self",
      "translations": [
        {
          "language": "tr",
          "label": "Hakkımızda",
          "description": null
        }
      ],
      "children": [
        {
          "id": 3,
          "menuId": 1,
          "parentId": 2,
          "order": 1,
          "type": "page",
          "translations": [
            {
              "language": "tr",
              "label": "Tarihçe",
              "description": null
            }
          ],
          "page": {
            "id": 2,
            "translations": [
              {
                "language": "tr",
                "title": "Hakkımızda",
                "slug": "hakkimizda"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### 4. Menü Güncelle
```javascript
PATCH /menu/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "isActive": true,
  "translations": [
    {
      "language": "tr",
      "name": "Güncellenmiş Ana Menü",
      "description": "Güncellenmiş ana menü açıklaması"
    }
  ]
}

// Response
{
  "id": 1,
  "isActive": true,
  "updatedAt": "2025-12-07T22:30:00.000Z",
  "message": "Menu updated successfully"
}
```

### 5. Yeni Menü Öğesi Oluştur
```javascript
POST /menu/admin/items
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "menuId": 1,
  "parentId": null,
  "order": 3,
  "isActive": true,
  "type": "external", // page, external, dropdown
  "url": "https://example.com",
  "target": "_blank",
  "cssClass": "external-link",
  "icon": "link",
  "translations": [
    {
      "language": "tr",
      "label": "Dış Link",
      "description": "Harici bağlantı"
    },
    {
      "language": "en",
      "label": "External Link",
      "description": "External link"
    }
  ]
}

// Response
{
  "id": 4,
  "menuId": 1,
  "parentId": null,
  "order": 3,
  "isActive": true,
  "type": "external",
  "url": "https://example.com",
  "target": "_blank",
  "createdAt": "2025-12-07T22:45:00.000Z",
  "translations": [
    {
      "id": 7,
      "itemId": 4,
      "language": "tr",
      "label": "Dış Link"
    }
  ]
}
```

### 6. Menü Öğesi Güncelle
```javascript
PATCH /menu/admin/items/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "order": 2,
  "isActive": true,
  "cssClass": "updated-class",
  "translations": [
    {
      "language": "tr",
      "label": "Güncellenmiş Label",
      "description": "Güncellenmiş açıklama"
    }
  ]
}

// Response
{
  "id": 4,
  "order": 2,
  "cssClass": "updated-class",
  "updatedAt": "2025-12-07T23:00:00.000Z",
  "message": "Menu item updated successfully"
}
```

### 7. Menü Öğelerini Yeniden Sırala
```javascript
POST /menu/admin/:menuId/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "items": [
    {
      "id": 2,
      "order": 1,
      "parentId": null
    },
    {
      "id": 1,
      "order": 2,
      "parentId": null
    },
    {
      "id": 4,
      "order": 3,
      "parentId": null
    },
    {
      "id": 3,
      "order": 1,
      "parentId": 2
    }
  ]
}

// Response
{
  "menuId": 1,
  "reorderedItems": 4,
  "message": "Menu items reordered successfully",
  "updatedAt": "2025-12-07T23:15:00.000Z"
}
```

### 8. Menü Key ile Getir
```javascript
GET /menu/admin/by-key/:key
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /menu/admin/by-key/main-menu

// Response
{
  "id": 1,
  "key": "main-menu",
  "isActive": true,
  "translations": [
    {
      "language": "tr",
      "name": "Ana Menü"
    }
  ],
  "items": [
    // Menü öğeleri...
  ]
}
```

---

## 🖼️ Medya Yönetimi

### 1. Tüm Medya Dosyalarını Listele
```javascript
GET /media/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&search=logo&type=image&folder=uploads&sortBy=createdAt&sortOrder=desc

// Response
{
  "media": [
    {
      "id": 1,
      "tenantId": 1,
      "fileName": "company-logo.png",
      "originalFileName": "logo.png",
      "mimeType": "image/png",
      "size": 45680,
      "url": "https://res.cloudinary.com/demo/image/upload/v1/company-logo.png",
      "publicId": "company-logo",
      "folder": "uploads",
      "alt": "Şirket Logosu",
      "title": "Demo Şirketi Logo",
      "description": "Ana şirket logosu",
      "width": 800,
      "height": 600,
      "isOptimized": true,
      "createdAt": "2025-12-07T19:30:00.000Z",
      "updatedAt": "2025-12-07T19:30:00.000Z",
      "metadata": {
        "photographer": "John Doe",
        "license": "CC BY-SA",
        "keywords": ["logo", "brand", "identity"]
      },
      "thumbnails": {
        "small": "https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_thumb/company-logo.png",
        "medium": "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_thumb/company-logo.png"
      }
    }
  ],
  "total": 156,
  "totalPages": 8,
  "currentPage": 1,
  "totalSize": "125.8 MB",
  "typeBreakdown": {
    "image": 120,
    "document": 25,
    "video": 8,
    "audio": 3
  }
}
```

### 2. Tek Dosya Yükle
```javascript
POST /media/admin/upload
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: multipart/form-data

// FormData
file: [File object]
folder: "images"
alt: "Örnek görsel"
title: "Yeni görsel"
description: "Açıklama"
metadata: {"photographer": "Jane Doe", "license": "CC0"}

// Response
{
  "id": 2,
  "tenantId": 1,
  "fileName": "new-image.jpg",
  "originalFileName": "new-image.jpg",
  "mimeType": "image/jpeg",
  "size": 234567,
  "url": "https://res.cloudinary.com/demo/image/upload/v1/new-image.jpg",
  "publicId": "new-image",
  "folder": "images",
  "alt": "Örnek görsel",
  "title": "Yeni görsel",
  "description": "Açıklama",
  "width": 1200,
  "height": 800,
  "isOptimized": true,
  "createdAt": "2025-12-07T22:00:00.000Z",
  "thumbnails": {
    "small": "https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_thumb/new-image.jpg",
    "medium": "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_thumb/new-image.jpg"
  },
  "message": "File uploaded successfully"
}
```

### 3. Çoklu Dosya Yükle
```javascript
POST /media/admin/upload/multiple
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: multipart/form-data

// FormData
files: [File object 1, File object 2, File object 3]
folder: "gallery"
defaultAlt: "Galeri görseli"

// Response
{
  "uploadedCount": 3,
  "successCount": 2,
  "failedCount": 1,
  "results": [
    {
      "success": true,
      "file": {
        "id": 3,
        "fileName": "gallery-1.jpg",
        "url": "https://res.cloudinary.com/demo/image/upload/v1/gallery-1.jpg"
      }
    },
    {
      "success": true,
      "file": {
        "id": 4,
        "fileName": "gallery-2.jpg",
        "url": "https://res.cloudinary.com/demo/image/upload/v1/gallery-2.jpg"
      }
    },
    {
      "success": false,
      "fileName": "invalid-file.txt",
      "error": "File type not supported"
    }
  ],
  "totalSize": "2.4 MB"
}
```

### 4. Medya İstatistikleri
```javascript
GET /media/admin/stats
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "overview": {
    "totalFiles": 156,
    "totalSize": "125.8 MB",
    "totalSizeBytes": 131987456,
    "averageFileSize": "826 KB",
    "storageQuota": "5 GB",
    "storageUsed": "2.5%"
  },
  "byType": {
    "image": {
      "count": 120,
      "size": "98.2 MB",
      "percentage": 78.1
    },
    "document": {
      "count": 25,
      "size": "18.5 MB",
      "percentage": 14.7
    },
    "video": {
      "count": 8,
      "size": "8.1 MB",
      "percentage": 6.4
    },
    "audio": {
      "count": 3,
      "size": "1.0 MB",
      "percentage": 0.8
    }
  },
  "recentUploads": [
    {
      "fileName": "new-image.jpg",
      "size": "234 KB",
      "uploadedAt": "2025-12-07T22:00:00.000Z"
    }
  ],
  "popularFiles": [
    {
      "id": 1,
      "fileName": "company-logo.png",
      "usageCount": 25,
      "lastUsed": "2025-12-07T21:30:00.000Z"
    }
  ]
}
```

### 5. Medya Detaylarını Getir
```javascript
GET /media/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "tenantId": 1,
  "fileName": "company-logo.png",
  "originalFileName": "logo.png",
  "mimeType": "image/png",
  "size": 45680,
  "url": "https://res.cloudinary.com/demo/image/upload/v1/company-logo.png",
  "publicId": "company-logo",
  "folder": "uploads",
  "alt": "Şirket Logosu",
  "title": "Demo Şirketi Logo",
  "description": "Ana şirket logosu",
  "width": 800,
  "height": 600,
  "isOptimized": true,
  "createdAt": "2025-12-07T19:30:00.000Z",
  "updatedAt": "2025-12-07T19:30:00.000Z",
  "metadata": {
    "photographer": "John Doe",
    "license": "CC BY-SA",
    "keywords": ["logo", "brand", "identity"],
    "exif": {
      "camera": "Canon EOS R5",
      "lens": "RF 24-70mm f/2.8",
      "settings": "f/4.0, 1/125s, ISO 400"
    }
  },
  "thumbnails": {
    "small": "https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_thumb/company-logo.png",
    "medium": "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_thumb/company-logo.png",
    "large": "https://res.cloudinary.com/demo/image/upload/w_800,h_800,c_thumb/company-logo.png"
  },
  "usageInfo": {
    "usedInPages": 3,
    "usedInPosts": 1,
    "usedInMenus": 1,
    "totalUsage": 5,
    "lastUsed": "2025-12-07T21:30:00.000Z"
  }
}
```

### 6. Medya Metadatası Güncelle
```javascript
PATCH /media/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "alt": "Güncellenmiş Alt Text",
  "title": "Güncellenmiş Başlık",
  "description": "Güncellenmiş açıklama",
  "folder": "logos",
  "metadata": {
    "photographer": "Updated Photographer",
    "license": "CC BY 4.0",
    "keywords": ["logo", "brand", "updated"]
  }
}

// Response
{
  "id": 1,
  "alt": "Güncellenmiş Alt Text",
  "title": "Güncellenmiş Başlık",
  "description": "Güncellenmiş açıklama",
  "folder": "logos",
  "metadata": {
    "photographer": "Updated Photographer",
    "license": "CC BY 4.0",
    "keywords": ["logo", "brand", "updated"]
  },
  "updatedAt": "2025-12-07T22:45:00.000Z",
  "message": "Media metadata updated successfully"
}
```

### 7. Medya Dosyası Sil
```javascript
DELETE /media/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "message": "Media file deleted successfully",
  "fileName": "company-logo.png",
  "deletedAt": "2025-12-07T23:00:00.000Z",
  "usageWarning": {
    "wasUsed": true,
    "usageCount": 5,
    "affectedPages": ["Ana Sayfa", "Hakkımızda"],
    "affectedPosts": ["İlk Blog Yazısı"]
  }
}
```

### 8. Toplu Medya Silme
```javascript
DELETE /media/admin/bulk
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "mediaIds": [2, 3, 4],
  "force": false
}

// Response
{
  "deletedCount": 2,
  "skippedCount": 1,
  "results": [
    {
      "id": 2,
      "success": true,
      "message": "File deleted successfully"
    },
    {
      "id": 3,
      "success": true,
      "message": "File deleted successfully"
    },
    {
      "id": 4,
      "success": false,
      "error": "File is being used in 3 pages",
      "usageInfo": {
        "pages": ["Ana Sayfa", "Hakkımızda", "İletişim"]
      }
    }
  ]
}
```

### 9. Optimize Edilmiş Görsel URL'i Getir
```javascript
GET /media/admin/:id/optimized
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?width=400&height=300&quality=80&format=webp

// Response
{
  "id": 1,
  "originalUrl": "https://res.cloudinary.com/demo/image/upload/v1/company-logo.png",
  "optimizedUrl": "https://res.cloudinary.com/demo/image/upload/w_400,h_300,q_80,f_webp/company-logo.png",
  "optimizations": {
    "width": 400,
    "height": 300,
    "quality": 80,
    "format": "webp",
    "originalSize": "45.6 KB",
    "optimizedSize": "18.2 KB",
    "compressionRatio": "60.1%"
  }
}
```

---

## ⚙️ Site Ayarları

### 1. Site Ayarlarını Getir
```javascript
GET /site-settings/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "id": 1,
  "tenantId": 1,
  "logo": "https://res.cloudinary.com/demo/image/upload/v1/logo.png",
  "favicon": "https://res.cloudinary.com/demo/image/upload/v1/favicon.ico",
  "primaryColor": "#3498db",
  "secondaryColor": "#2ecc71",
  "fontFamily": "Roboto",
  "contactEmail": "info@demo.softellio.com",
  "contactPhone": "+90 212 555 0123",
  "address": "İstanbul, Türkiye",
  "socialMedia": {
    "facebook": "https://facebook.com/democompany",
    "twitter": "https://twitter.com/democompany",
    "instagram": "https://instagram.com/democompany",
    "linkedin": "https://linkedin.com/company/democompany"
  },
  "seoSettings": {
    "googleAnalyticsId": "GA-XXXXXXX",
    "googleTagManagerId": "GTM-XXXXXXX",
    "googleSiteVerification": "google-verification-code",
    "bingSiteVerification": "bing-verification-code",
    "enableRichSnippets": true,
    "enableOpenGraph": true,
    "enableTwitterCards": true
  },
  "emailSettings": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUsername": "noreply@demo.softellio.com",
    "smtpPassword": "[encrypted]",
    "fromEmail": "noreply@demo.softellio.com",
    "fromName": "Demo Şirketi"
  },
  "maintenanceMode": {
    "enabled": false,
    "message": "Site bakımda, kısa süre sonra tekrar deneyin.",
    "allowedIps": ["127.0.0.1"]
  },
  "createdAt": "2025-12-07T19:25:02.310Z",
  "updatedAt": "2025-12-07T20:00:00.000Z",
  "translations": [
    {
      "id": 1,
      "language": "tr",
      "siteName": "Demo Şirketi",
      "siteDescription": "Demo şirketimizin resmi web sitesi",
      "siteKeywords": "demo, şirket, hizmet",
      "footerText": "© 2025 Demo Şirketi. Tüm hakları saklıdır.",
      "welcomeMessage": "Demo Şirketimize Hoş Geldiniz"
    },
    {
      "id": 2,
      "language": "en",
      "siteName": "Demo Company",
      "siteDescription": "Official website of Demo Company",
      "siteKeywords": "demo, company, service",
      "footerText": "© 2025 Demo Company. All rights reserved.",
      "welcomeMessage": "Welcome to Demo Company"
    }
  ]
}
```

### 2. Site Ayarlarını Güncelle
```javascript
PATCH /site-settings/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "logo": "https://res.cloudinary.com/demo/image/upload/v1/new-logo.png",
  "primaryColor": "#e74c3c",
  "secondaryColor": "#f39c12",
  "contactEmail": "contact@demo.softellio.com",
  "contactPhone": "+90 212 555 0199",
  "socialMedia": {
    "facebook": "https://facebook.com/newdemocompany",
    "twitter": "https://twitter.com/newdemocompany",
    "instagram": "https://instagram.com/newdemocompany",
    "linkedin": "https://linkedin.com/company/newdemocompany",
    "youtube": "https://youtube.com/c/newdemocompany"
  },
  "seoSettings": {
    "googleAnalyticsId": "GA-YYYYYYY",
    "enableRichSnippets": true,
    "enableOpenGraph": true
  },
  "maintenanceMode": {
    "enabled": false,
    "message": "Yeni güncelleme için site bakımda.",
    "allowedIps": ["127.0.0.1", "192.168.1.100"]
  }
}

// Response
{
  "id": 1,
  "logo": "https://res.cloudinary.com/demo/image/upload/v1/new-logo.png",
  "primaryColor": "#e74c3c",
  "secondaryColor": "#f39c12",
  "contactEmail": "contact@demo.softellio.com",
  "socialMedia": {
    "facebook": "https://facebook.com/newdemocompany",
    "twitter": "https://twitter.com/newdemocompany",
    "instagram": "https://instagram.com/newdemocompany",
    "linkedin": "https://linkedin.com/company/newdemocompany",
    "youtube": "https://youtube.com/c/newdemocompany"
  },
  "updatedAt": "2025-12-07T22:30:00.000Z",
  "message": "Site settings updated successfully"
}
```

### 3. Mevcut Dilleri Getir
```javascript
GET /site-settings/admin/languages
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "defaultLanguage": "tr",
  "availableLanguages": [
    {
      "code": "tr",
      "name": "Türkçe",
      "nativeName": "Türkçe",
      "isActive": true,
      "isDefault": true
    },
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "isActive": true,
      "isDefault": false
    },
    {
      "code": "de",
      "name": "German",
      "nativeName": "Deutsch",
      "isActive": false,
      "isDefault": false
    }
  ]
}
```

### 4. Belirli Dil İçin Ayarları Getir
```javascript
GET /site-settings/admin/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /site-settings/admin/tr

// Response
{
  "language": "tr",
  "translation": {
    "id": 1,
    "language": "tr",
    "siteName": "Demo Şirketi",
    "siteDescription": "Demo şirketimizin resmi web sitesi",
    "siteKeywords": "demo, şirket, hizmet, teknoloji",
    "footerText": "© 2025 Demo Şirketi. Tüm hakları saklıdır.",
    "welcomeMessage": "Demo Şirketimize Hoş Geldiniz",
    "privacyPolicyUrl": "/gizlilik-politikasi",
    "termsOfServiceUrl": "/kullanim-sartlari",
    "cookiePolicyUrl": "/cerez-politikasi"
  }
}
```

### 5. Dil Çevirisini Güncelle/Oluştur
```javascript
PATCH /site-settings/admin/translation/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /site-settings/admin/translation/de

{
  "siteName": "Demo Unternehmen",
  "siteDescription": "Offizielle Website von Demo Unternehmen",
  "siteKeywords": "demo, unternehmen, service, technologie",
  "footerText": "© 2025 Demo Unternehmen. Alle Rechte vorbehalten.",
  "welcomeMessage": "Willkommen bei Demo Unternehmen",
  "privacyPolicyUrl": "/datenschutz-richtlinie",
  "termsOfServiceUrl": "/nutzungsbedingungen",
  "cookiePolicyUrl": "/cookie-richtlinie"
}

// Response
{
  "language": "de",
  "translation": {
    "id": 3,
    "language": "de",
    "siteName": "Demo Unternehmen",
    "siteDescription": "Offizielle Website von Demo Unternehmen",
    "siteKeywords": "demo, unternehmen, service, technologie",
    "footerText": "© 2025 Demo Unternehmen. Alle Rechte vorbehalten.",
    "welcomeMessage": "Willkommen bei Demo Unternehmen"
  },
  "isNew": true,
  "updatedAt": "2025-12-07T22:45:00.000Z",
  "message": "Translation created successfully"
}
```

### 6. Dil Çevirisini Sil
```javascript
DELETE /site-settings/admin/translation/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /site-settings/admin/translation/de

// Response
{
  "language": "de",
  "message": "Translation deleted successfully",
  "deletedAt": "2025-12-07T23:00:00.000Z"
}
```

### 7. Tüm Site Ayarlarını Sil
```javascript
DELETE /site-settings/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "message": "All site settings deleted successfully",
  "deletedTranslations": 2,
  "deletedAt": "2025-12-07T23:15:00.000Z"
}
```

---

## Bu dokümantasyonda gösterilen tüm API'lar gerçek çalışan endpoint'lerdir ve test edilmiştir.

### React Örnek Kullanımı:
```jsx
// React Hook örneği
import { useState, useEffect } from 'react';

const usePages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/pages/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Domain': 'demo.softellio.com'
        }
      });
      const data = await response.json();
      setPages(data.pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
    setLoading(false);
  };

  const createPage = async (pageData) => {
    try {
      const response = await fetch('/pages/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Domain': 'demo.softellio.com'
        },
        body: JSON.stringify(pageData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return { pages, loading, fetchPages, createPage };
};
```

---

## 🛠️ Hizmetler Yönetimi

### 1. Tüm Hizmetleri Listele
```javascript
GET /services/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&category=web-tasarim&search=mobile&sortBy=order&sortOrder=asc

// Response
{
  "services": [
    {
      "id": 1,
      "tenantId": 1,
      "category": "web-tasarim",
      "icon": "code",
      "color": "#3498db",
      "order": 1,
      "isFeatured": true,
      "isActive": true,
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/service-web-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/service-web-2.jpg"
      ],
      "createdAt": "2025-12-07T10:00:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z",
      "translations": [
        {
          "id": 1,
          "serviceId": 1,
          "language": "tr",
          "title": "Web Tasarım",
          "slug": "web-tasarim",
          "description": "Modern ve responsive web siteleri tasarlıyoruz",
          "shortDescription": "Modern web tasarım hizmetleri",
          "content": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Web Tasarım Hizmetleri",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "Şirketiniz için modern, kullanıcı dostu ve mobil uyumlu web siteleri tasarlıyoruz."
                }
              }
            ]
          },
          "features": [
            "Responsive Design",
            "SEO Optimizasyonu",
            "Modern UI/UX",
            "Cross-browser Desteği"
          ],
          "price": "5.000 TL'den başlayan fiyatlarla",
          "duration": "2-4 hafta",
          "metaTitle": "Web Tasarım Hizmetleri - Demo Şirketi",
          "metaDescription": "Profesyonel web tasarım hizmetleri ile modern ve kullanıcı dostu web siteleri"
        },
        {
          "id": 2,
          "serviceId": 1,
          "language": "en",
          "title": "Web Design",
          "slug": "web-design",
          "description": "We design modern and responsive websites",
          "shortDescription": "Modern web design services",
          "content": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Web Design Services",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "We design modern, user-friendly and mobile-compatible websites for your company."
                }
              }
            ]
          },
          "features": [
            "Responsive Design",
            "SEO Optimization",
            "Modern UI/UX",
            "Cross-browser Support"
          ],
          "price": "Starting from 5,000 TL",
          "duration": "2-4 weeks",
          "metaTitle": "Web Design Services - Demo Company",
          "metaDescription": "Professional web design services with modern and user-friendly websites"
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "categories": [
    {
      "name": "web-tasarim",
      "displayName": "Web Tasarım",
      "count": 8
    },
    {
      "name": "mobil-uygulama",
      "displayName": "Mobil Uygulama",
      "count": 5
    },
    {
      "name": "e-ticaret",
      "displayName": "E-ticaret",
      "count": 7
    },
    {
      "name": "seo",
      "displayName": "SEO Hizmetleri",
      "count": 5
    }
  ]
}
```

### 2. Hizmet Detayını Getir
```javascript
GET /services/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /services/admin/1

// Response
{
  "service": {
    "id": 1,
    "tenantId": 1,
    "category": "web-tasarim",
    "icon": "code",
    "color": "#3498db",
    "order": 1,
    "isFeatured": true,
    "isActive": true,
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v1/service-web-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/service-web-2.jpg"
    ],
    "createdAt": "2025-12-07T10:00:00.000Z",
    "updatedAt": "2025-12-07T15:30:00.000Z",
    "translations": [
      {
        "id": 1,
        "serviceId": 1,
        "language": "tr",
        "title": "Web Tasarım",
        "slug": "web-tasarim",
        "description": "Modern ve responsive web siteleri tasarlıyoruz",
        "shortDescription": "Modern web tasarım hizmetleri",
        "content": {
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "Web Tasarım Hizmetleri",
                "level": 1
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "Şirketiniz için modern, kullanıcı dostu ve mobil uyumlu web siteleri tasarlıyoruz. Tüm projelerimizde en son teknolojileri kullanarak, SEO optimize edilmiş ve hızlı yüklenen web siteleri geliştiriyoruz."
              }
            },
            {
              "type": "list",
              "data": {
                "style": "unordered",
                "items": [
                  "Responsive tasarım - Tüm cihazlarda mükemmel görünüm",
                  "SEO optimize edilmiş yapı - Google'da üst sıralarda yer alma",
                  "Hızlı yükleme süreleri - Kullanıcı deneyimini artırma",
                  "Modern UI/UX tasarım - Çağdaş ve kullanıcı dostu arayüz",
                  "Cross-browser uyumluluk - Tüm tarayıcılarda sorunsuz çalışma"
                ]
              }
            }
          ]
        },
        "features": [
          "Responsive Design",
          "SEO Optimizasyonu",
          "Modern UI/UX",
          "Cross-browser Desteği",
          "İçerik Yönetim Sistemi",
          "SSL Sertifikası",
          "Google Analytics Entegrasyonu"
        ],
        "price": "5.000 TL'den başlayan fiyatlarla",
        "duration": "2-4 hafta",
        "metaTitle": "Web Tasarım Hizmetleri - Demo Şirketi",
        "metaDescription": "Profesyonel web tasarım hizmetleri ile modern ve kullanıcı dostu web siteleri"
      }
    ],
    "testimonials": [
      {
        "id": 1,
        "clientName": "Ahmet Yılmaz",
        "clientCompany": "ABC Şirketi",
        "content": "Harika bir web sitesi yaptılar, çok memnunuz.",
        "rating": 5,
        "date": "2025-11-15T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Yeni Hizmet Oluştur
```javascript
POST /services/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "category": "mobil-uygulama",
  "icon": "mobile",
  "color": "#2ecc71",
  "order": 2,
  "isFeatured": true,
  "isActive": true,
  "images": [
    "https://res.cloudinary.com/demo/image/upload/v1/service-mobile-1.jpg"
  ],
  "translations": [
    {
      "language": "tr",
      "title": "Mobil Uygulama Geliştirme",
      "slug": "mobil-uygulama-gelistirme",
      "description": "iOS ve Android için native mobil uygulamalar geliştiriyoruz",
      "shortDescription": "Native mobil uygulama geliştirme",
      "content": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Mobil Uygulama Geliştirme",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "iOS ve Android platformları için performanslı ve kullanıcı dostu mobil uygulamalar geliştiriyoruz."
            }
          }
        ]
      },
      "features": [
        "Native iOS & Android",
        "Performance Optimizasyonu",
        "Push Notifications",
        "Offline Çalışma Desteği"
      ],
      "price": "15.000 TL'den başlayan fiyatlarla",
      "duration": "6-12 hafta",
      "metaTitle": "Mobil Uygulama Geliştirme - Demo Şirketi",
      "metaDescription": "iOS ve Android için performanslı mobil uygulamalar"
    },
    {
      "language": "en",
      "title": "Mobile App Development",
      "slug": "mobile-app-development",
      "description": "We develop native mobile applications for iOS and Android",
      "shortDescription": "Native mobile app development",
      "content": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Mobile App Development",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "We develop performant and user-friendly mobile applications for iOS and Android platforms."
            }
          }
        ]
      },
      "features": [
        "Native iOS & Android",
        "Performance Optimization",
        "Push Notifications",
        "Offline Support"
      ],
      "price": "Starting from 15,000 TL",
      "duration": "6-12 weeks",
      "metaTitle": "Mobile App Development - Demo Company",
      "metaDescription": "Performant mobile applications for iOS and Android"
    }
  ]
}

// Response
{
  "service": {
    "id": 5,
    "tenantId": 1,
    "category": "mobil-uygulama",
    "icon": "mobile",
    "color": "#2ecc71",
    "order": 2,
    "isFeatured": true,
    "isActive": true,
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v1/service-mobile-1.jpg"
    ],
    "createdAt": "2025-12-07T16:00:00.000Z",
    "updatedAt": "2025-12-07T16:00:00.000Z",
    "translations": [
      {
        "id": 15,
        "serviceId": 5,
        "language": "tr",
        "title": "Mobil Uygulama Geliştirme",
        "slug": "mobil-uygulama-gelistirme",
        "description": "iOS ve Android için native mobil uygulamalar geliştiriyoruz",
        "metaTitle": "Mobil Uygulama Geliştirme - Demo Şirketi"
      }
    ]
  },
  "message": "Service created successfully"
}
```

### 4. Hizmet Güncelle
```javascript
PATCH /services/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /services/admin/1

{
  "category": "web-tasarim",
  "icon": "globe",
  "color": "#e74c3c",
  "order": 1,
  "isFeatured": true,
  "isActive": true,
  "images": [
    "https://res.cloudinary.com/demo/image/upload/v1/service-web-new.jpg"
  ],
  "translations": [
    {
      "language": "tr",
      "title": "Kurumsal Web Tasarım",
      "description": "Kurumsal kimliğinizi yansıtan modern web siteleri tasarlıyoruz",
      "shortDescription": "Kurumsal web tasarım hizmetleri",
      "features": [
        "Kurumsal Kimlik Tasarımı",
        "SEO Optimizasyonu",
        "Modern UI/UX",
        "Mobil Uyumluluk",
        "İçerik Yönetim Sistemi"
      ],
      "price": "8.000 TL'den başlayan fiyatlarla",
      "duration": "3-5 hafta",
      "metaTitle": "Kurumsal Web Tasarım - Demo Şirketi",
      "metaDescription": "Kurumsal kimliğinizi yansıtan profesyonel web tasarım hizmetleri"
    }
  ]
}

// Response
{
  "service": {
    "id": 1,
    "tenantId": 1,
    "category": "web-tasarim",
    "icon": "globe",
    "color": "#e74c3c",
    "order": 1,
    "isFeatured": true,
    "isActive": true,
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v1/service-web-new.jpg"
    ],
    "updatedAt": "2025-12-07T16:30:00.000Z"
  },
  "updatedTranslations": [
    {
      "id": 1,
      "serviceId": 1,
      "language": "tr",
      "title": "Kurumsal Web Tasarım",
      "slug": "kurumsal-web-tasarim",
      "metaTitle": "Kurumsal Web Tasarım - Demo Şirketi"
    }
  ],
  "message": "Service updated successfully"
}
```

### 5. Hizmet Çevirisini Güncelle
```javascript
PATCH /services/admin/:id/translation/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /services/admin/1/translation/de

{
  "title": "Webdesign",
  "description": "Wir gestalten moderne und responsive Websites",
  "shortDescription": "Moderne Webdesign-Dienstleistungen",
  "content": {
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "Webdesign-Dienstleistungen",
          "level": 1
        }
      },
      {
        "type": "paragraph",
        "data": {
          "text": "Wir gestalten moderne, benutzerfreundliche und mobilkompatible Websites für Ihr Unternehmen."
        }
      }
    ]
  },
  "features": [
    "Responsive Design",
    "SEO-Optimierung",
    "Moderne UI/UX",
    "Cross-Browser-Unterstützung"
  ],
  "price": "Ab 5.000 TL",
  "duration": "2-4 Wochen",
  "metaTitle": "Webdesign-Dienstleistungen - Demo Unternehmen",
  "metaDescription": "Professionelle Webdesign-Dienstleistungen mit modernen und benutzerfreundlichen Websites"
}

// Response
{
  "translation": {
    "id": 25,
    "serviceId": 1,
    "language": "de",
    "title": "Webdesign",
    "slug": "webdesign",
    "description": "Wir gestalten moderne und responsive Websites",
    "metaTitle": "Webdesign-Dienstleistungen - Demo Unternehmen",
    "updatedAt": "2025-12-07T17:00:00.000Z"
  },
  "isNew": true,
  "message": "Translation created successfully"
}
```

### 6. Hizmet Sil
```javascript
DELETE /services/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /services/admin/5

// Response
{
  "id": 5,
  "deletedTranslations": 2,
  "deletedTestimonials": 1,
  "message": "Service deleted successfully",
  "deletedAt": "2025-12-07T17:30:00.000Z"
}
```

### 7. Hizmet Sıralamasını Güncelle
```javascript
PATCH /services/admin/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "serviceOrders": [
    {
      "id": 1,
      "order": 1
    },
    {
      "id": 3,
      "order": 2
    },
    {
      "id": 2,
      "order": 3
    },
    {
      "id": 4,
      "order": 4
    }
  ]
}

// Response
{
  "updatedServices": [
    {
      "id": 1,
      "order": 1
    },
    {
      "id": 3,
      "order": 2
    },
    {
      "id": 2,
      "order": 3
    },
    {
      "id": 4,
      "order": 4
    }
  ],
  "message": "Service order updated successfully"
}
```

### 8. Hizmet Kategorileri
```javascript
GET /services/admin/categories
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "categories": [
    {
      "name": "web-tasarim",
      "displayName": "Web Tasarım",
      "description": "Web tasarım ve geliştirme hizmetleri",
      "count": 8,
      "color": "#3498db",
      "icon": "code"
    },
    {
      "name": "mobil-uygulama",
      "displayName": "Mobil Uygulama",
      "description": "iOS ve Android mobil uygulama geliştirme",
      "count": 5,
      "color": "#2ecc71",
      "icon": "mobile"
    },
    {
      "name": "e-ticaret",
      "displayName": "E-ticaret",
      "description": "E-ticaret platform geliştirme",
      "count": 7,
      "color": "#f39c12",
      "icon": "shopping-cart"
    },
    {
      "name": "seo",
      "displayName": "SEO Hizmetleri",
      "description": "Arama motoru optimizasyonu",
      "count": 5,
      "color": "#e74c3c",
      "icon": "search"
    }
  ],
  "totalCategories": 4,
  "totalServices": 25
}
```

---

## 📝 İletişim Formu Yönetimi

### 1. Form Gönderimlerini Listele
```javascript
GET /forms/admin/submissions
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&status=unread&type=contact&sortBy=createdAt&sortOrder=desc&startDate=2025-12-01&endDate=2025-12-07

// Response
{
  "submissions": [
    {
      "id": 1,
      "type": "contact",
      "status": "unread",
      "priority": "normal",
      "formData": {
        "name": "Ahmet Yılmaz",
        "email": "ahmet.yilmaz@example.com",
        "phone": "+90 555 123 4567",
        "company": "ABC Şirketi",
        "subject": "Web Tasarım Hizmeti",
        "message": "Şirketimiz için yeni bir web sitesi tasarımına ihtiyacımız var. Detaylı bilgi alabilir miyim?",
        "service": "web-tasarim",
        "budget": "10000-20000",
        "timeline": "1-2 ay",
        "preferredContactMethod": "email"
      },
      "metadata": {
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "referrer": "https://demo.softellio.com/hizmetlerimiz",
        "source": "website",
        "utm": {
          "source": "google",
          "medium": "organic",
          "campaign": null,
          "term": "web tasarım istanbul"
        }
      },
      "referenceId": "CF202512070001",
      "submittedAt": "2025-12-07T14:30:00.000Z",
      "readAt": null,
      "respondedAt": null,
      "assignedTo": null
    },
    {
      "id": 2,
      "type": "quick_info",
      "status": "read",
      "priority": "normal",
      "formData": {
        "name": "Fatma Demir",
        "email": "fatma.demir@example.com",
        "phone": "+90 555 987 6543",
        "service": "mobil-uygulama",
        "message": "Mobil uygulama geliştirme hizmetiniz hakkında bilgi almak istiyorum."
      },
      "metadata": {
        "ip": "192.168.1.101",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        "referrer": "https://demo.softellio.com/",
        "source": "website"
      },
      "referenceId": "QI202512070002",
      "submittedAt": "2025-12-07T15:45:00.000Z",
      "readAt": "2025-12-07T16:00:00.000Z",
      "respondedAt": null,
      "assignedTo": {
        "id": 2,
        "name": "Tenant Administrator",
        "email": "admin@demo.softellio.com"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "total": 45,
    "unread": 12,
    "read": 28,
    "responded": 5,
    "thisWeek": 8,
    "thisMonth": 23
  },
  "types": [
    {
      "type": "contact",
      "displayName": "İletişim Formu",
      "count": 32
    },
    {
      "type": "quick_info",
      "displayName": "Hızlı Bilgi Talebi",
      "count": 13
    }
  ]
}
```

### 2. Form Gönderimini Detayını Getir
```javascript
GET /forms/admin/submissions/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /forms/admin/submissions/1

// Response
{
  "submission": {
    "id": 1,
    "type": "contact",
    "status": "unread",
    "priority": "normal",
    "formData": {
      "name": "Ahmet Yılmaz",
      "email": "ahmet.yilmaz@example.com",
      "phone": "+90 555 123 4567",
      "company": "ABC Şirketi",
      "subject": "Web Tasarım Hizmeti",
      "message": "Şirketimiz için yeni bir web sitesi tasarımına ihtiyacımız var. Detaylı bilgi alabilir miyim? Mevcut sitemiz eski ve mobil uyumlu değil. Yaklaşık 20 sayfalık bir kurumsal site düşünüyoruz.",
      "service": "web-tasarim",
      "budget": "10000-20000",
      "timeline": "1-2 ay",
      "preferredContactMethod": "email",
      "consent": true
    },
    "metadata": {
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "referrer": "https://demo.softellio.com/hizmetlerimiz",
      "source": "website",
      "page": "/hizmetlerimiz",
      "sessionId": "sess_123456789",
      "timeOnPageBeforeSubmit": 180,
      "utm": {
        "source": "google",
        "medium": "organic",
        "campaign": null,
        "term": "web tasarım istanbul",
        "content": null
      },
      "location": {
        "city": "İstanbul",
        "country": "Turkey",
        "timezone": "Europe/Istanbul"
      }
    },
    "referenceId": "CF202512070001",
    "submittedAt": "2025-12-07T14:30:00.000Z",
    "readAt": null,
    "respondedAt": null,
    "assignedTo": null,
    "notes": [],
    "relatedService": {
      "id": 1,
      "title": "Web Tasarım",
      "slug": "web-tasarim",
      "category": "web-tasarim"
    }
  }
}
```

### 3. Form Gönderimini Güncelle
```javascript
PATCH /forms/admin/submissions/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /forms/admin/submissions/1

{
  "status": "responded",
  "priority": "high",
  "assignedTo": 2,
  "notes": "Müşteri ile telefon görüşmesi yapıldı. Teklif hazırlanacak."
}

// Response
{
  "submission": {
    "id": 1,
    "status": "responded",
    "priority": "high",
    "assignedTo": {
      "id": 2,
      "name": "Tenant Administrator",
      "email": "admin@demo.softellio.com"
    },
    "notes": "Müşteri ile telefon görüşmesi yapıldı. Teklif hazırlanacak.",
    "readAt": "2025-12-07T17:00:00.000Z",
    "respondedAt": "2025-12-07T17:30:00.000Z",
    "updatedAt": "2025-12-07T17:30:00.000Z"
  },
  "message": "Submission updated successfully"
}
```

### 4. Form Gönderimini Sil
```javascript
DELETE /forms/admin/submissions/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /forms/admin/submissions/1

// Response
{
  "id": 1,
  "referenceId": "CF202512070001",
  "message": "Submission deleted successfully",
  "deletedAt": "2025-12-07T18:00:00.000Z"
}
```

### 5. Toplu İşlem
```javascript
PATCH /forms/admin/submissions/bulk
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "action": "mark_as_read", // mark_as_read, mark_as_responded, assign, delete
  "submissionIds": [1, 2, 3, 4, 5],
  "assignedTo": 2 // sadece assign action için gerekli
}

// Response
{
  "affectedSubmissions": 5,
  "action": "mark_as_read",
  "updatedSubmissions": [
    {
      "id": 1,
      "status": "read",
      "readAt": "2025-12-07T18:15:00.000Z"
    },
    {
      "id": 2,
      "status": "read",
      "readAt": "2025-12-07T18:15:00.000Z"
    }
  ],
  "message": "Bulk operation completed successfully"
}
```

### 6. Form İstatistikleri
```javascript
GET /forms/admin/statistics
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?period=30d&groupBy=day

// Response
{
  "period": "30d",
  "totalSubmissions": 87,
  "responseRate": 0.78,
  "averageResponseTime": 4.5, // hours
  "submissionsByDay": [
    {
      "date": "2025-12-01",
      "submissions": 3,
      "responseRate": 0.67
    },
    {
      "date": "2025-12-02",
      "submissions": 5,
      "responseRate": 0.80
    }
  ],
  "submissionsByType": [
    {
      "type": "contact",
      "count": 64,
      "percentage": 73.56
    },
    {
      "type": "quick_info",
      "count": 23,
      "percentage": 26.44
    }
  ],
  "submissionsByService": [
    {
      "service": "web-tasarim",
      "count": 35,
      "percentage": 40.23
    },
    {
      "service": "mobil-uygulama",
      "count": 22,
      "percentage": 25.29
    },
    {
      "service": "e-ticaret",
      "count": 18,
      "percentage": 20.69
    },
    {
      "service": "seo",
      "count": 12,
      "percentage": 13.79
    }
  ],
  "topSources": [
    {
      "source": "organic",
      "count": 45,
      "percentage": 51.72
    },
    {
      "source": "direct",
      "count": 25,
      "percentage": 28.74
    },
    {
      "source": "social",
      "count": 17,
      "percentage": 19.54
    }
  ]
}
```

---

## 👥 Ekip Üyeleri Yönetimi

### 1. Tüm Ekip Üyelerini Listele
```javascript
GET /team/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&department=teknoloji&featured=true&search=ahmet&sortBy=order&sortOrder=asc

// Response
{
  "teamMembers": [
    {
      "id": 1,
      "tenantId": 1,
      "department": "yonetim",
      "position": "Genel Müdür",
      "order": 1,
      "isFeatured": true,
      "isActive": true,
      "joinedAt": "2020-01-15T00:00:00.000Z",
      "email": "ahmet.yilmaz@demo.softellio.com",
      "phone": "+90 212 555 0101",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-ahmet.jpg",
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/ahmetyilmaz",
        "twitter": "https://twitter.com/ahmetyilmaz",
        "github": null,
        "facebook": null,
        "instagram": null
      },
      "skills": ["Liderlik", "Strateji Geliştirme", "Proje Yönetimi"],
      "education": [
        {
          "institution": "İstanbul Teknik Üniversitesi",
          "degree": "Bilgisayar Mühendisliği",
          "year": "1995-1999"
        },
        {
          "institution": "Stanford University",
          "degree": "Executive MBA",
          "year": "2005-2007"
        }
      ],
      "certifications": [
        "PMP Sertifikası",
        "Agile Scrum Master",
        "AWS Solutions Architect"
      ],
      "languages": ["Türkçe", "İngilizce", "Almanca"],
      "createdAt": "2025-12-07T10:00:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z",
      "translations": [
        {
          "id": 1,
          "memberId": 1,
          "language": "tr",
          "name": "Ahmet Yılmaz",
          "title": "Genel Müdür",
          "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından biridir.",
          "description": "Teknoloji ve inovasyon konularında uzman, sektörde tanınmış isimlerden biri."
        },
        {
          "id": 2,
          "memberId": 1,
          "language": "en",
          "name": "Ahmet Yılmaz",
          "title": "General Manager",
          "bio": "Mr. Ahmet, with 15 years of experience in the technology sector, is one of the founding partners of our company.",
          "description": "Expert in technology and innovation, one of the recognized names in the industry."
        }
      ]
    },
    {
      "id": 2,
      "tenantId": 1,
      "department": "teknoloji",
      "position": "Teknik Direktör",
      "order": 2,
      "isFeatured": true,
      "isActive": true,
      "joinedAt": "2020-03-01T00:00:00.000Z",
      "email": "fatma.demir@demo.softellio.com",
      "phone": "+90 212 555 0102",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-fatma.jpg",
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/fatmademir",
        "twitter": null,
        "github": "https://github.com/fatmademir",
        "facebook": null,
        "instagram": null
      },
      "skills": ["React.js", "Node.js", "Python", "DevOps", "Cloud Architecture"],
      "education": [
        {
          "institution": "Orta Doğu Teknik Üniversitesi",
          "degree": "Bilgisayar Mühendisliği",
          "year": "2012-2016"
        }
      ],
      "certifications": [
        "AWS Certified Solutions Architect",
        "Google Cloud Professional",
        "React Developer Certification"
      ],
      "languages": ["Türkçe", "İngilizce"],
      "translations": [
        {
          "id": 3,
          "memberId": 2,
          "language": "tr",
          "name": "Fatma Demir",
          "title": "Teknik Direktör",
          "bio": "Full-stack geliştirici olarak kariyerine başlayan Fatma Hanım, şu anda teknik ekibimizin başında.",
          "description": "Modern web teknolojileri ve yazılım mimarisi konularında uzman."
        }
      ]
    }
  ],
  "pagination": {
    "total": 18,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 20,
    "hasNext": false,
    "hasPrev": false
  },
  "departments": [
    {
      "key": "yonetim",
      "name": "Yönetim",
      "description": "Üst düzey yönetim ekibi",
      "memberCount": 3
    },
    {
      "key": "teknoloji",
      "name": "Teknoloji",
      "description": "Yazılım geliştirme ekibi",
      "memberCount": 8
    },
    {
      "key": "tasarim",
      "name": "Tasarım",
      "description": "UI/UX tasarım ekibi",
      "memberCount": 4
    },
    {
      "key": "pazarlama",
      "name": "Pazarlama",
      "description": "Dijital pazarlama ekibi",
      "memberCount": 3
    }
  ]
}
```

### 2. Ekip Üyesi Detayını Getir
```javascript
GET /team/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /team/admin/1

// Response
{
  "teamMember": {
    "id": 1,
    "tenantId": 1,
    "department": "yonetim",
    "position": "Genel Müdür",
    "order": 1,
    "isFeatured": true,
    "isActive": true,
    "joinedAt": "2020-01-15T00:00:00.000Z",
    "email": "ahmet.yilmaz@demo.softellio.com",
    "phone": "+90 212 555 0101",
    "image": "https://res.cloudinary.com/demo/image/upload/v1/team-ahmet.jpg",
    "socialMedia": {
      "linkedin": "https://linkedin.com/in/ahmetyilmaz",
      "twitter": "https://twitter.com/ahmetyilmaz",
      "github": null,
      "facebook": null,
      "instagram": null
    },
    "skills": ["Liderlik", "Strateji Geliştirme", "Proje Yönetimi", "İş Geliştirme"],
    "education": [
      {
        "institution": "İstanbul Teknik Üniversitesi",
        "degree": "Bilgisayar Mühendisliği",
        "year": "1995-1999",
        "gpa": "3.8"
      },
      {
        "institution": "Stanford University",
        "degree": "Executive MBA",
        "year": "2005-2007",
        "gpa": "4.0"
      }
    ],
    "certifications": [
      "PMP Sertifikası (2018)",
      "Agile Scrum Master (2019)",
      "AWS Solutions Architect (2020)"
    ],
    "languages": ["Türkçe", "İngilizce", "Almanca"],
    "achievements": [
      "2023 - Yılın İnovatif Lideri Ödülü",
      "2022 - En İyi Proje Yöneticisi",
      "2021 - Teknoloji Liderliği Ödülü"
    ],
    "createdAt": "2025-12-07T10:00:00.000Z",
    "updatedAt": "2025-12-07T15:30:00.000Z",
    "translations": [
      {
        "id": 1,
        "memberId": 1,
        "language": "tr",
        "name": "Ahmet Yılmaz",
        "title": "Genel Müdür",
        "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından biridir. Teknoloji ve inovasyon alanlarında öncü projelere imza atmış, sektörde tanınmış bir lider.",
        "description": "Teknoloji ve inovasyon konularında uzman, sektörde tanınmış isimlerden biri."
      },
      {
        "id": 2,
        "memberId": 1,
        "language": "en",
        "name": "Ahmet Yılmaz",
        "title": "General Manager",
        "bio": "Mr. Ahmet, with 15 years of experience in the technology sector, is one of the founding partners of our company. A recognized leader who has pioneered projects in technology and innovation.",
        "description": "Expert in technology and innovation, one of the recognized names in the industry."
      }
    ]
  }
}
```

### 3. Yeni Ekip Üyesi Ekle
```javascript
POST /team/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "department": "teknoloji",
  "position": "Senior Frontend Developer",
  "order": 5,
  "isFeatured": false,
  "isActive": true,
  "joinedAt": "2023-06-15T00:00:00.000Z",
  "email": "mehmet.kaya@demo.softellio.com",
  "phone": "+90 212 555 0105",
  "image": "https://res.cloudinary.com/demo/image/upload/v1/team-mehmet.jpg",
  "socialMedia": {
    "linkedin": "https://linkedin.com/in/mehmetkaya",
    "github": "https://github.com/mehmetkaya",
    "twitter": null,
    "facebook": null,
    "instagram": null
  },
  "skills": ["Vue.js", "TypeScript", "CSS", "JavaScript", "React.js"],
  "education": [
    {
      "institution": "Hacettepe Üniversitesi",
      "degree": "Bilgisayar Mühendisliği",
      "year": "2018-2022",
      "gpa": "3.5"
    }
  ],
  "certifications": [
    "Vue.js Expert Certification (2023)",
    "TypeScript Professional (2022)"
  ],
  "languages": ["Türkçe", "İngilizce"],
  "achievements": [],
  "translations": [
    {
      "language": "tr",
      "name": "Mehmet Kaya",
      "title": "Kıdemli Frontend Geliştirici",
      "bio": "Frontend geliştirme konusunda 3 yıllık deneyimi olan Mehmet, modern JavaScript framework'leri konusunda uzman.",
      "description": "Vue.js ve TypeScript konularında uzmanlaşmış genç ve dinamik geliştirici."
    },
    {
      "language": "en",
      "name": "Mehmet Kaya",
      "title": "Senior Frontend Developer",
      "bio": "Mehmet has 3 years of experience in frontend development and is an expert in modern JavaScript frameworks.",
      "description": "A young and dynamic developer specialized in Vue.js and TypeScript."
    }
  ]
}

// Response
{
  "teamMember": {
    "id": 8,
    "tenantId": 1,
    "department": "teknoloji",
    "position": "Senior Frontend Developer",
    "order": 5,
    "isFeatured": false,
    "isActive": true,
    "joinedAt": "2023-06-15T00:00:00.000Z",
    "email": "mehmet.kaya@demo.softellio.com",
    "phone": "+90 212 555 0105",
    "image": "https://res.cloudinary.com/demo/image/upload/v1/team-mehmet.jpg",
    "createdAt": "2025-12-07T16:00:00.000Z",
    "updatedAt": "2025-12-07T16:00:00.000Z",
    "translations": [
      {
        "id": 15,
        "memberId": 8,
        "language": "tr",
        "name": "Mehmet Kaya",
        "title": "Kıdemli Frontend Geliştirici",
        "bio": "Frontend geliştirme konusunda 3 yıllık deneyimi olan Mehmet, modern JavaScript framework'leri konusunda uzman."
      }
    ]
  },
  "message": "Team member created successfully"
}
```

### 4. Ekip Üyesini Güncelle
```javascript
PATCH /team/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /team/admin/1

{
  "department": "yonetim",
  "position": "CEO & Genel Müdür",
  "order": 1,
  "isFeatured": true,
  "isActive": true,
  "email": "ahmet.yilmaz@demo.softellio.com",
  "phone": "+90 212 555 0101",
  "socialMedia": {
    "linkedin": "https://linkedin.com/in/ahmetyilmaz-ceo",
    "twitter": "https://twitter.com/ahmetyilmaz",
    "github": null,
    "facebook": null,
    "instagram": null
  },
  "skills": ["Liderlik", "Strateji Geliştirme", "Proje Yönetimi", "İş Geliştirme", "Uluslararası İş"],
  "achievements": [
    "2023 - Yılın İnovatif Lideri Ödülü",
    "2022 - En İyi Proje Yöneticisi",
    "2021 - Teknoloji Liderliği Ödülü",
    "2024 - Startup Mentor of the Year"
  ],
  "translations": [
    {
      "language": "tr",
      "title": "CEO & Genel Müdür",
      "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından ve CEO'sudur. Teknoloji ve inovasyon alanlarında öncü projelere imza atmış, sektörde tanınmış bir lider.",
      "description": "Teknoloji ve inovasyon konularında uzman, sektörde tanınmış CEO ve girişimci."
    }
  ]
}

// Response
{
  "teamMember": {
    "id": 1,
    "department": "yonetim",
    "position": "CEO & Genel Müdür",
    "order": 1,
    "isFeatured": true,
    "isActive": true,
    "email": "ahmet.yilmaz@demo.softellio.com",
    "skills": ["Liderlik", "Strateji Geliştirme", "Proje Yönetimi", "İş Geliştirme", "Uluslararası İş"],
    "updatedAt": "2025-12-07T16:30:00.000Z"
  },
  "updatedTranslations": [
    {
      "id": 1,
      "memberId": 1,
      "language": "tr",
      "title": "CEO & Genel Müdür",
      "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından ve CEO'sudur."
    }
  ],
  "message": "Team member updated successfully"
}
```

### 5. Ekip Üyesi Çevirisini Güncelle
```javascript
PATCH /team/admin/:id/translation/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /team/admin/1/translation/de

{
  "name": "Ahmet Yılmaz",
  "title": "CEO & Geschäftsführer",
  "bio": "Herr Ahmet ist CEO und einer der Gründungspartner unseres Unternehmens mit 15 Jahren Erfahrung im Technologiesektor.",
  "description": "Experte für Technologie und Innovation, anerkannter CEO und Unternehmer in der Branche."
}

// Response
{
  "translation": {
    "id": 25,
    "memberId": 1,
    "language": "de",
    "name": "Ahmet Yılmaz",
    "title": "CEO & Geschäftsführer",
    "bio": "Herr Ahmet ist CEO und einer der Gründungspartner unseres Unternehmens mit 15 Jahren Erfahrung im Technologiesektor.",
    "description": "Experte für Technologie und Innovation, anerkannter CEO und Unternehmer in der Branche.",
    "updatedAt": "2025-12-07T17:00:00.000Z"
  },
  "isNew": true,
  "message": "Translation created successfully"
}
```

### 6. Ekip Üyesini Sil
```javascript
DELETE /team/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /team/admin/8

// Response
{
  "id": 8,
  "deletedTranslations": 2,
  "message": "Team member deleted successfully",
  "deletedAt": "2025-12-07T17:30:00.000Z"
}
```

### 7. Ekip Sıralamasını Güncelle
```javascript
PATCH /team/admin/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "memberOrders": [
    {
      "id": 1,
      "order": 1
    },
    {
      "id": 2,
      "order": 2
    },
    {
      "id": 5,
      "order": 3
    },
    {
      "id": 3,
      "order": 4
    }
  ]
}

// Response
{
  "updatedMembers": [
    {
      "id": 1,
      "order": 1,
      "name": "Ahmet Yılmaz"
    },
    {
      "id": 2,
      "order": 2,
      "name": "Fatma Demir"
    },
    {
      "id": 5,
      "order": 3,
      "name": "Mehmet Kaya"
    },
    {
      "id": 3,
      "order": 4,
      "name": "Ali Veli"
    }
  ],
  "message": "Team order updated successfully"
}
```

### 8. Departmanları Listele
```javascript
GET /team/admin/departments
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "departments": [
    {
      "key": "yonetim",
      "name": "Yönetim",
      "description": "Üst düzey yönetim ekibi",
      "memberCount": 3,
      "isActive": true,
      "head": {
        "id": 1,
        "name": "Ahmet Yılmaz",
        "title": "CEO & Genel Müdür"
      }
    },
    {
      "key": "teknoloji",
      "name": "Teknoloji",
      "description": "Yazılım geliştirme ve teknik altyapı ekibi",
      "memberCount": 8,
      "isActive": true,
      "head": {
        "id": 2,
        "name": "Fatma Demir",
        "title": "Teknik Direktör"
      }
    },
    {
      "key": "tasarim",
      "name": "Tasarım",
      "description": "UI/UX tasarım ekibi",
      "memberCount": 4,
      "isActive": true,
      "head": {
        "id": 4,
        "name": "Ayşe Kaya",
        "title": "Tasarım Müdürü"
      }
    },
    {
      "key": "pazarlama",
      "name": "Pazarlama",
      "description": "Dijital pazarlama ve iletişim ekibi",
      "memberCount": 3,
      "isActive": true,
      "head": {
        "id": 6,
        "name": "Mustafa Özkan",
        "title": "Pazarlama Müdürü"
      }
    }
  ],
  "totalDepartments": 4,
  "totalMembers": 18,
  "featuredMembers": 6
}
```

---

## 🎨 Portfolio/Referanslar Yönetimi

### 1. Tüm Referansları Listele
```javascript
GET /portfolio/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&category=web-sitesi&year=2024&featured=true&search=abc&sortBy=completedAt&sortOrder=desc

// Response
{
  "references": [
    {
      "id": 1,
      "tenantId": 1,
      "category": "web-sitesi",
      "year": 2024,
      "isFeatured": true,
      "isActive": true,
      "completedAt": "2024-11-15T00:00:00.000Z",
      "order": 1,
      "projectDuration": "4 hafta",
      "teamSize": 4,
      "budget": "15000-25000",
      "technologies": [
        "React.js",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Strapi CMS"
      ],
      "features": [
        "Responsive Design",
        "SEO Optimizasyonu",
        "İçerik Yönetim Sistemi",
        "Çok Dilli Destek",
        "Analytics Entegrasyonu"
      ],
      "services": ["Web Tasarım", "Frontend Geliştirme", "SEO"],
      "images": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
          "alt": "ABC Şirketi ana sayfa",
          "title": "Modern ana sayfa tasarımı",
          "type": "desktop",
          "order": 1
        },
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-2.jpg",
          "alt": "ABC Şirketi mobil görünüm",
          "title": "Mobil uyumlu tasarım",
          "type": "mobile",
          "order": 2
        }
      ],
      "client": {
        "name": "ABC Şirketi",
        "industry": "Teknoloji Danışmanlığı",
        "location": "İstanbul, Türkiye",
        "website": "https://www.abcsirketi.com",
        "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-abc-logo.png",
        "description": "1995 yılından bu yana teknoloji danışmanlığı hizmeti veren köklü şirket",
        "employeeCount": "50-100",
        "foundedYear": 1995
      },
      "analytics": {
        "viewCount": 156,
        "likeCount": 23,
        "shareCount": 8
      },
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z",
      "translations": [
        {
          "id": 1,
          "referenceId": 1,
          "language": "tr",
          "title": "ABC Şirketi Kurumsal Web Sitesi",
          "slug": "abc-sirketi-web-sitesi",
          "description": "Modern ve kullanıcı dostu kurumsal web sitesi projesi",
          "content": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "ABC Şirketi Web Sitesi Projesi",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "ABC Şirketi için geliştirdiğimiz kurumsal web sitesi, modern tasarım ve kullanıcı deneyimini ön planda tutuyor."
                }
              }
            ]
          },
          "challenge": "Şirketin eski web sitesi mobil uyumlu değildi ve SEO performansı düşüktü",
          "solution": "Modern responsive tasarım ve SEO optimize edilmiş yapı ile yeni web sitesi geliştirdik",
          "result": "Mobil trafik %150 arttı, organik arama trafiği %200 yükseldi",
          "metaTitle": "ABC Şirketi Web Sitesi - Demo Şirketi Portfolio",
          "metaDescription": "ABC Şirketi için geliştirdiğimiz kurumsal web sitesi projesi detayları"
        },
        {
          "id": 2,
          "referenceId": 1,
          "language": "en",
          "title": "ABC Company Corporate Website",
          "slug": "abc-company-corporate-website",
          "description": "Modern and user-friendly corporate website project",
          "content": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "ABC Company Website Project",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "The corporate website we developed for ABC Company prioritizes modern design and user experience."
                }
              }
            ]
          },
          "challenge": "The company's old website was not mobile-friendly and had low SEO performance",
          "solution": "We developed a new website with modern responsive design and SEO optimized structure",
          "result": "Mobile traffic increased by 150%, organic search traffic increased by 200%",
          "metaTitle": "ABC Company Website - Demo Company Portfolio",
          "metaDescription": "Details of the corporate website project we developed for ABC Company"
        }
      ],
      "testimonial": {
        "content": "Demo Şirketi ile çalışmak harika bir deneyimdi. Profesyonel ekip, zamanında teslimat ve beklentilerimizin çok üzerinde bir sonuç.",
        "author": "Ahmet Yılmaz",
        "position": "Genel Müdür",
        "company": "ABC Şirketi",
        "rating": 5,
        "date": "2024-12-01T00:00:00.000Z",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/testimonial-ahmet.jpg"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "categories": [
    {
      "name": "web-sitesi",
      "displayName": "Web Sitesi",
      "description": "Kurumsal ve kişisel web sitesi projeleri",
      "count": 12
    },
    {
      "name": "e-ticaret",
      "displayName": "E-ticaret",
      "description": "Online satış platformu projeleri",
      "count": 8
    },
    {
      "name": "mobil-uygulama",
      "displayName": "Mobil Uygulama",
      "description": "iOS ve Android uygulama projeleri",
      "count": 5
    }
  ],
  "years": [2024, 2023, 2022, 2021]
}
```

### 2. Referans Detayını Getir
```javascript
GET /portfolio/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /portfolio/admin/1

// Response
{
  "reference": {
    "id": 1,
    "tenantId": 1,
    "category": "web-sitesi",
    "year": 2024,
    "isFeatured": true,
    "isActive": true,
    "completedAt": "2024-11-15T00:00:00.000Z",
    "order": 1,
    "projectDuration": "4 hafta",
    "teamSize": 4,
    "budget": "15000-25000",
    "technologies": [
      {
        "name": "React.js",
        "category": "Frontend",
        "description": "Modern UI kütüphanesi"
      },
      {
        "name": "Next.js",
        "category": "Framework",
        "description": "SSR ve SSG desteği"
      },
      {
        "name": "TypeScript",
        "category": "Language",
        "description": "Type-safe geliştirme"
      }
    ],
    "features": [
      {
        "name": "Responsive Design",
        "description": "Tüm cihazlarda mükemmel görünüm"
      },
      {
        "name": "SEO Optimizasyonu",
        "description": "Arama motorlarında üst sıralarda yer alma"
      }
    ],
    "services": [
      {
        "name": "Web Tasarım",
        "description": "UI/UX tasarım süreci"
      },
      {
        "name": "Frontend Geliştirme",
        "description": "React.js ile geliştirme"
      }
    ],
    "timeline": [
      {
        "phase": "Analiz & Planlama",
        "duration": "5 gün",
        "description": "İhtiyaç analizi ve proje planlaması",
        "deliverables": ["İhtiyaç analizi raporu", "Teknik mimari dokümanı"]
      },
      {
        "phase": "Tasarım",
        "duration": "8 gün",
        "description": "UI/UX tasarım süreçleri",
        "deliverables": ["Wireframe tasarımları", "Görsel tasarım mockup'ları"]
      }
    ],
    "results": [
      {
        "metric": "Mobil Trafik",
        "improvement": "+150%",
        "description": "Responsive tasarım sayesinde mobil kullanıcı artışı"
      },
      {
        "metric": "Organik Trafik",
        "improvement": "+200%",
        "description": "SEO optimizasyonu ile arama trafiği artışı"
      }
    ],
    "images": [
      {
        "id": 1,
        "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
        "alt": "ABC Şirketi ana sayfa tasarımı",
        "title": "Modern ana sayfa tasarımı",
        "type": "desktop",
        "description": "Responsive ana sayfa tasarımı",
        "order": 1
      }
    ],
    "client": {
      "name": "ABC Şirketi",
      "industry": "Teknoloji Danışmanlığı",
      "location": "İstanbul, Türkiye",
      "website": "https://www.abcsirketi.com",
      "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-abc-logo.png",
      "description": "1995 yılından bu yana teknoloji danışmanlığı hizmeti veren köklü şirket",
      "employeeCount": "50-100",
      "foundedYear": 1995
    },
    "analytics": {
      "viewCount": 156,
      "uniqueViews": 134,
      "likeCount": 23,
      "shareCount": 8,
      "avgViewDuration": 120
    },
    "translations": [
      {
        "id": 1,
        "referenceId": 1,
        "language": "tr",
        "title": "ABC Şirketi Kurumsal Web Sitesi",
        "slug": "abc-sirketi-web-sitesi",
        "description": "Modern ve kullanıcı dostu kurumsal web sitesi projesi",
        "content": {
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "ABC Şirketi Web Sitesi Projesi",
                "level": 1
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "ABC Şirketi için geliştirdiğimiz kurumsal web sitesi projesi, şirketin dijital dönüşümünde önemli bir adımdır."
              }
            }
          ]
        },
        "challenge": "ABC Şirketi'nin mevcut web sitesi 2018 yılından kalma eski bir yapıya sahipti. Site mobil uyumlu değildi, yükleme süreleri çok uzundu ve SEO performansı oldukça düşüktü.",
        "solution": "Şirket için tamamen yeni bir dijital deneyim tasarladık. Modern React.js teknolojisi kullanarak hızlı ve responsive bir web sitesi geliştirdik.",
        "result": "Yeni web sitesi lansmanından sonra mobil trafik %150 arttı, organik arama trafiği %200 yükseldi. Sayfa yükleme hızları 3 saniyeden 1 saniyeye düştü.",
        "metaTitle": "ABC Şirketi Web Sitesi Projesi - Demo Şirketi Portfolio",
        "metaDescription": "ABC Şirketi için geliştirdiğimiz modern kurumsal web sitesi projesi detayları ve başarı hikayeleri"
      }
    ],
    "testimonial": {
      "content": "Demo Şirketi ile çalışmak harika bir deneyimdi. Profesyonel ekip, zamanında teslimat ve beklentilerimizin çok üzerinde bir sonuç elde ettik.",
      "author": "Ahmet Yılmaz",
      "position": "Genel Müdür",
      "company": "ABC Şirketi",
      "rating": 5,
      "date": "2024-12-01T00:00:00.000Z",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/testimonial-ahmet.jpg"
    }
  }
}
```

### 3. Yeni Referans Ekle
```javascript
POST /portfolio/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "category": "e-ticaret",
  "year": 2024,
  "isFeatured": true,
  "isActive": true,
  "completedAt": "2024-10-20T00:00:00.000Z",
  "order": 2,
  "projectDuration": "8 hafta",
  "teamSize": 6,
  "budget": "25000-35000",
  "technologies": ["Vue.js", "Nuxt.js", "Node.js", "MongoDB", "Stripe"],
  "features": ["Ürün Kataloğu", "Sepet Yönetimi", "Güvenli Ödeme", "Sipariş Takibi"],
  "services": ["E-ticaret Geliştirme", "Backend Development", "Payment Integration"],
  "images": [
    {
      "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-xyz-1.jpg",
      "alt": "XYZ Store ana sayfa",
      "title": "E-ticaret ana sayfa",
      "type": "desktop",
      "order": 1
    }
  ],
  "client": {
    "name": "XYZ Store",
    "industry": "E-ticaret",
    "location": "Ankara",
    "website": "https://www.xyzstore.com",
    "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-xyz-logo.png",
    "description": "Online giyim ve aksesuar satışı yapan e-ticaret platformu",
    "employeeCount": "10-25",
    "foundedYear": 2020
  },
  "translations": [
    {
      "language": "tr",
      "title": "XYZ Store E-ticaret Platformu",
      "slug": "xyz-store-e-ticaret",
      "description": "Tam özellikli e-ticaret platformu geliştirme",
      "content": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "XYZ Store E-ticaret Projesi",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "XYZ Store için geliştirdiğimiz e-ticaret platformu, modern alışveriş deneyimi sunar."
            }
          }
        ]
      },
      "challenge": "Mevcut e-ticaret sistemi yavaş ve kullanıcı dostu değildi",
      "solution": "Performanslı ve kullanıcı odaklı yeni e-ticaret platformu geliştirdik",
      "result": "Sayfa yükleme hızı %300 arttı, dönüşüm oranı %180 yükseldi",
      "metaTitle": "XYZ Store E-ticaret Platformu - Demo Şirketi Portfolio",
      "metaDescription": "XYZ Store için geliştirdiğimiz e-ticaret platformu proje detayları"
    }
  ],
  "testimonial": {
    "content": "E-ticaret platformumuz sayesinde satışlarımız ikiye katlandı. Harika bir ekip!",
    "author": "Ayşe Demir",
    "position": "Kurucu",
    "company": "XYZ Store",
    "rating": 5,
    "date": "2024-11-10T00:00:00.000Z"
  }
}

// Response
{
  "reference": {
    "id": 5,
    "tenantId": 1,
    "category": "e-ticaret",
    "year": 2024,
    "isFeatured": true,
    "isActive": true,
    "completedAt": "2024-10-20T00:00:00.000Z",
    "order": 2,
    "createdAt": "2025-12-07T16:00:00.000Z",
    "updatedAt": "2025-12-07T16:00:00.000Z",
    "translations": [
      {
        "id": 15,
        "referenceId": 5,
        "language": "tr",
        "title": "XYZ Store E-ticaret Platformu",
        "slug": "xyz-store-e-ticaret",
        "description": "Tam özellikli e-ticaret platformu geliştirme"
      }
    ]
  },
  "message": "Reference created successfully"
}
```

### 4. Referansı Güncelle
```javascript
PATCH /portfolio/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /portfolio/admin/1

{
  "category": "web-sitesi",
  "year": 2024,
  "isFeatured": true,
  "isActive": true,
  "projectDuration": "5 hafta",
  "teamSize": 5,
  "budget": "20000-30000",
  "technologies": ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
  "features": ["Responsive Design", "SEO Optimizasyonu", "CMS", "Analytics"],
  "translations": [
    {
      "language": "tr",
      "title": "ABC Şirketi Kurumsal Web Sitesi ve CMS",
      "description": "Gelişmiş özellikli kurumsal web sitesi ve içerik yönetim sistemi",
      "challenge": "ABC Şirketi'nin web sitesi ve içerik yönetimi ihtiyaçları karşılanmıyordu",
      "solution": "Modern web teknolojileri ile entegre CMS çözümü geliştirdik",
      "result": "İçerik yönetimi %90 daha hızlı hale geldi, site performansı %200 arttı"
    }
  ]
}

// Response
{
  "reference": {
    "id": 1,
    "category": "web-sitesi",
    "projectDuration": "5 hafta",
    "teamSize": 5,
    "budget": "20000-30000",
    "technologies": ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    "updatedAt": "2025-12-07T16:30:00.000Z"
  },
  "updatedTranslations": [
    {
      "id": 1,
      "referenceId": 1,
      "language": "tr",
      "title": "ABC Şirketi Kurumsal Web Sitesi ve CMS",
      "description": "Gelişmiş özellikli kurumsal web sitesi ve içerik yönetim sistemi"
    }
  ],
  "message": "Reference updated successfully"
}
```

### 5. Referans Çevirisini Güncelle
```javascript
PATCH /portfolio/admin/:id/translation/:language
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /portfolio/admin/1/translation/de

{
  "title": "ABC Unternehmen Corporate Website",
  "description": "Moderne und benutzerfreundliche Unternehmenswebsite",
  "content": {
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "ABC Unternehmen Website Projekt",
          "level": 1
        }
      }
    ]
  },
  "challenge": "Die alte Website des Unternehmens war nicht mobilfreundlich",
  "solution": "Wir entwickelten eine neue Website mit modernem responsivem Design",
  "result": "Der mobile Traffic stieg um 150%, der organische Traffic um 200%",
  "metaTitle": "ABC Unternehmen Website - Demo Unternehmen Portfolio",
  "metaDescription": "Details des Unternehmenswebsite-Projekts für ABC Unternehmen"
}

// Response
{
  "translation": {
    "id": 25,
    "referenceId": 1,
    "language": "de",
    "title": "ABC Unternehmen Corporate Website",
    "slug": "abc-unternehmen-corporate-website",
    "description": "Moderne und benutzerfreundliche Unternehmenswebsite",
    "updatedAt": "2025-12-07T17:00:00.000Z"
  },
  "isNew": true,
  "message": "Translation created successfully"
}
```

### 6. Referansı Sil
```javascript
DELETE /portfolio/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /portfolio/admin/5

// Response
{
  "id": 5,
  "deletedTranslations": 2,
  "deletedImages": 3,
  "message": "Reference deleted successfully",
  "deletedAt": "2025-12-07T17:30:00.000Z"
}
```

### 7. Referans Sıralamasını Güncelle
```javascript
PATCH /portfolio/admin/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "referenceOrders": [
    {
      "id": 2,
      "order": 1
    },
    {
      "id": 1,
      "order": 2
    },
    {
      "id": 3,
      "order": 3
    }
  ]
}

// Response
{
  "updatedReferences": [
    {
      "id": 2,
      "order": 1,
      "title": "XYZ Store E-ticaret Platformu"
    },
    {
      "id": 1,
      "order": 2,
      "title": "ABC Şirketi Kurumsal Web Sitesi"
    },
    {
      "id": 3,
      "order": 3,
      "title": "DEF Mobil Uygulaması"
    }
  ],
  "message": "Reference order updated successfully"
}
```

## 🎠 Banner & Slider Yönetimi

### 1. Banner/Slider Listesini Getir
```javascript
GET /banners/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=20&type=hero&position=home&isActive=true&sortBy=order&sortOrder=asc

// Response
{
  "banners": [
    {
      "id": 1,
      "tenantId": 1,
      "type": "hero",
      "position": "home",
      "order": 1,
      "isActive": true,
      "isAutoplay": true,
      "autoplayDelay": 5000,
      "showNavigation": true,
      "showPagination": true,
      "transitionEffect": "fade",
      "backgroundColor": "#000000",
      "overlayOpacity": 0.4,
      "height": 600,
      "mobileHeight": 400,
      "isResponsive": true,
      "createdAt": "2025-12-07T10:00:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z",
      "slides": [
        {
          "id": 1,
          "bannerId": 1,
          "order": 1,
          "isActive": true,
          "image": {
            "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-desktop.jpg",
            "tablet": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-tablet.jpg",
            "mobile": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-mobile.jpg"
          },
          "video": null,
          "link": {
            "url": "https://demo.softellio.com/hizmetler/web-tasarim",
            "text": "Hizmetlerimizi Keşfedin",
            "isExternal": false,
            "openInNewTab": false
          },
          "translations": [
            {
              "id": 1,
              "slideId": 1,
              "language": "tr",
              "title": "Dijital Dünyanın Yeni Lideri",
              "subtitle": "Teknoloji ile Geleceği Şekillendiriyoruz",
              "description": "Modern web tasarım ve yazılım geliştirme hizmetleri ile işinizi dijital dünyada öne çıkarın",
              "buttonText": "Hizmetlerimizi Keşfedin",
              "altText": "Dijital teknoloji ve web tasarım banner görsel"
            },
            {
              "id": 2,
              "slideId": 1,
              "language": "en",
              "title": "The New Leader of the Digital World",
              "subtitle": "Shaping the Future with Technology",
              "description": "Make your business stand out in the digital world with modern web design and software development services",
              "buttonText": "Discover Our Services",
              "altText": "Digital technology and web design banner image"
            }
          ]
        },
        {
          "id": 2,
          "bannerId": 1,
          "order": 2,
          "isActive": true,
          "image": {
            "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banner-2-desktop.jpg",
            "tablet": "https://res.cloudinary.com/demo/image/upload/v1/banner-2-tablet.jpg",
            "mobile": "https://res.cloudinary.com/demo/image/upload/v1/banner-2-mobile.jpg"
          },
          "video": {
            "url": "https://res.cloudinary.com/demo/video/upload/v1/banner-video.mp4",
            "poster": "https://res.cloudinary.com/demo/image/upload/v1/banner-video-poster.jpg",
            "autoplay": false,
            "loop": true,
            "muted": true
          },
          "link": {
            "url": "https://demo.softellio.com/iletisim",
            "text": "İletişime Geçin",
            "isExternal": false,
            "openInNewTab": false
          },
          "translations": [
            {
              "id": 3,
              "slideId": 2,
              "language": "tr",
              "title": "İnovatif Çözümler, Güvenilir Sonuçlar",
              "subtitle": "Projelerinizi Hayata Geçiriyoruz",
              "description": "Deneyimli ekibimiz ile hayalinizdeki projeyi gerçeğe dönüştürün",
              "buttonText": "İletişime Geçin",
              "altText": "İnovatif yazılım çözümleri banner görseli"
            }
          ]
        }
      ]
    },
    {
      "id": 2,
      "tenantId": 1,
      "type": "promotion",
      "position": "services",
      "order": 1,
      "isActive": true,
      "isAutoplay": false,
      "autoplayDelay": 0,
      "showNavigation": false,
      "showPagination": false,
      "transitionEffect": "slide",
      "backgroundColor": "#ffffff",
      "overlayOpacity": 0,
      "height": 400,
      "mobileHeight": 300,
      "isResponsive": true,
      "slides": [
        {
          "id": 3,
          "bannerId": 2,
          "order": 1,
          "isActive": true,
          "image": {
            "desktop": "https://res.cloudinary.com/demo/image/upload/v1/promo-banner-desktop.jpg",
            "tablet": "https://res.cloudinary.com/demo/image/upload/v1/promo-banner-tablet.jpg",
            "mobile": "https://res.cloudinary.com/demo/image/upload/v1/promo-banner-mobile.jpg"
          },
          "link": {
            "url": "https://demo.softellio.com/kampanya/web-tasarim-2024",
            "text": "Kampanyayı İncele",
            "isExternal": false,
            "openInNewTab": false
          },
          "translations": [
            {
              "id": 4,
              "slideId": 3,
              "language": "tr",
              "title": "Özel İndirim Kampanyası",
              "subtitle": "Web Tasarım Hizmetlerinde %30 İndirim",
              "description": "2024 yıl sonu kampanyası ile web tasarım projelerinizde büyük fırsatlar",
              "buttonText": "Kampanyayı İncele",
              "altText": "Web tasarım indirim kampanyası banner"
            }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "total": 8,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 20,
    "hasNext": false,
    "hasPrev": false
  },
  "bannerTypes": [
    {
      "key": "hero",
      "name": "Ana Banner",
      "description": "Ana sayfa büyük banner/slider",
      "count": 3
    },
    {
      "key": "promotion",
      "name": "Promosyon Banner",
      "description": "Kampanya ve duyuru bannerları",
      "count": 2
    },
    {
      "key": "sidebar",
      "name": "Kenar Çubuğu Banner",
      "description": "Sayfa kenarlarında küçük bannerlar",
      "count": 3
    }
  ],
  "positions": [
    {
      "key": "home",
      "name": "Ana Sayfa",
      "description": "Ana sayfa banner konumu",
      "count": 3
    },
    {
      "key": "services",
      "name": "Hizmetler Sayfası",
      "description": "Hizmetler sayfa banner konumu",
      "count": 2
    },
    {
      "key": "blog",
      "name": "Blog Sayfası",
      "description": "Blog sayfa banner konumu",
      "count": 1
    },
    {
      "key": "contact",
      "name": "İletişim Sayfası",
      "description": "İletişim sayfa banner konumu",
      "count": 2
    }
  ]
}
```

### 2. Banner Detayını Getir
```javascript
GET /banners/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /banners/admin/1

// Response
{
  "banner": {
    "id": 1,
    "tenantId": 1,
    "type": "hero",
    "position": "home",
    "order": 1,
    "isActive": true,
    "isAutoplay": true,
    "autoplayDelay": 5000,
    "showNavigation": true,
    "showPagination": true,
    "transitionEffect": "fade",
    "backgroundColor": "#000000",
    "overlayOpacity": 0.4,
    "height": 600,
    "mobileHeight": 400,
    "isResponsive": true,
    "settings": {
      "animation": "fadeIn",
      "animationDuration": 800,
      "showTitle": true,
      "showSubtitle": true,
      "showDescription": true,
      "showButton": true,
      "titleAnimation": "slideInUp",
      "subtitleAnimation": "slideInUp",
      "descriptionAnimation": "fadeIn",
      "buttonAnimation": "bounceIn",
      "textAlign": "center",
      "verticalAlign": "middle"
    },
    "createdAt": "2025-12-07T10:00:00.000Z",
    "updatedAt": "2025-12-07T15:30:00.000Z",
    "slides": [
      {
        "id": 1,
        "bannerId": 1,
        "order": 1,
        "isActive": true,
        "image": {
          "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-desktop.jpg",
          "tablet": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-tablet.jpg",
          "mobile": "https://res.cloudinary.com/demo/image/upload/v1/banner-1-mobile.jpg",
          "alt": "Dijital teknoloji banner görseli"
        },
        "video": null,
        "link": {
          "url": "https://demo.softellio.com/hizmetler/web-tasarim",
          "text": "Hizmetlerimizi Keşfedin",
          "isExternal": false,
          "openInNewTab": false,
          "rel": "nofollow"
        },
        "styling": {
          "backgroundColor": "rgba(0,0,0,0.4)",
          "textColor": "#ffffff",
          "titleColor": "#ffffff",
          "subtitleColor": "#cccccc",
          "buttonBackgroundColor": "#3498db",
          "buttonTextColor": "#ffffff",
          "buttonBorderColor": "#3498db"
        },
        "createdAt": "2025-12-07T10:30:00.000Z",
        "updatedAt": "2025-12-07T15:45:00.000Z",
        "translations": [
          {
            "id": 1,
            "slideId": 1,
            "language": "tr",
            "title": "Dijital Dünyanın Yeni Lideri",
            "subtitle": "Teknoloji ile Geleceği Şekillendiriyoruz",
            "description": "Modern web tasarım ve yazılım geliştirme hizmetleri ile işinizi dijital dünyada öne çıkarın. 15 yıllık deneyimimiz ile güvenilir çözümler sunuyoruz.",
            "buttonText": "Hizmetlerimizi Keşfedin",
            "altText": "Dijital teknoloji ve web tasarım banner görsel"
          },
          {
            "id": 2,
            "slideId": 1,
            "language": "en",
            "title": "The New Leader of the Digital World",
            "subtitle": "Shaping the Future with Technology",
            "description": "Make your business stand out in the digital world with modern web design and software development services. Trusted solutions with 15 years of experience.",
            "buttonText": "Discover Our Services",
            "altText": "Digital technology and web design banner image"
          },
          {
            "id": 3,
            "slideId": 1,
            "language": "de",
            "title": "Der neue Marktführer der digitalen Welt",
            "subtitle": "Die Zukunft mit Technologie gestalten",
            "description": "Heben Sie Ihr Unternehmen in der digitalen Welt mit modernen Webdesign- und Softwareentwicklungsdienstleistungen hervor.",
            "buttonText": "Entdecken Sie unsere Dienstleistungen",
            "altText": "Digitale Technologie und Webdesign-Banner-Bild"
          }
        ]
      }
    ]
  }
}
```

### 3. Yeni Banner Oluştur
```javascript
POST /banners/admin
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "type": "hero",
  "position": "home",
  "order": 2,
  "isActive": true,
  "isAutoplay": true,
  "autoplayDelay": 4000,
  "showNavigation": true,
  "showPagination": true,
  "transitionEffect": "slide",
  "backgroundColor": "#1a1a1a",
  "overlayOpacity": 0.3,
  "height": 650,
  "mobileHeight": 450,
  "isResponsive": true,
  "settings": {
    "animation": "fadeIn",
    "animationDuration": 1000,
    "showTitle": true,
    "showSubtitle": true,
    "showDescription": true,
    "showButton": true,
    "titleAnimation": "slideInDown",
    "subtitleAnimation": "slideInUp",
    "descriptionAnimation": "fadeIn",
    "buttonAnimation": "pulse",
    "textAlign": "center",
    "verticalAlign": "middle"
  },
  "slides": [
    {
      "order": 1,
      "isActive": true,
      "image": {
        "desktop": "https://res.cloudinary.com/demo/image/upload/v1/new-banner-desktop.jpg",
        "tablet": "https://res.cloudinary.com/demo/image/upload/v1/new-banner-tablet.jpg",
        "mobile": "https://res.cloudinary.com/demo/image/upload/v1/new-banner-mobile.jpg"
      },
      "link": {
        "url": "https://demo.softellio.com/portfolio",
        "text": "Portfolyomuzu İnceleyin",
        "isExternal": false,
        "openInNewTab": false
      },
      "styling": {
        "backgroundColor": "rgba(0,0,0,0.3)",
        "textColor": "#ffffff",
        "titleColor": "#ffffff",
        "subtitleColor": "#e0e0e0",
        "buttonBackgroundColor": "#e74c3c",
        "buttonTextColor": "#ffffff",
        "buttonBorderColor": "#c0392b"
      },
      "translations": [
        {
          "language": "tr",
          "title": "Yaratıcı Çözümler, Profesyonel Sonuçlar",
          "subtitle": "Hayallerinizi Dijital Gerçekliğe Dönüştürün",
          "description": "Uzman ekibimiz ile birlikte işinizi dijital dünyada bir adım öteye taşıyın",
          "buttonText": "Portfolyomuzu İnceleyin",
          "altText": "Yaratıcı dijital çözümler banner görseli"
        },
        {
          "language": "en",
          "title": "Creative Solutions, Professional Results",
          "subtitle": "Transform Your Dreams into Digital Reality",
          "description": "Take your business one step further in the digital world with our expert team",
          "buttonText": "View Our Portfolio",
          "altText": "Creative digital solutions banner image"
        }
      ]
    }
  ]
}

// Response
{
  "banner": {
    "id": 6,
    "tenantId": 1,
    "type": "hero",
    "position": "home",
    "order": 2,
    "isActive": true,
    "isAutoplay": true,
    "autoplayDelay": 4000,
    "showNavigation": true,
    "showPagination": true,
    "transitionEffect": "slide",
    "backgroundColor": "#1a1a1a",
    "overlayOpacity": 0.3,
    "height": 650,
    "mobileHeight": 450,
    "isResponsive": true,
    "createdAt": "2025-12-07T16:00:00.000Z",
    "updatedAt": "2025-12-07T16:00:00.000Z",
    "slides": [
      {
        "id": 25,
        "bannerId": 6,
        "order": 1,
        "isActive": true,
        "translations": [
          {
            "id": 45,
            "slideId": 25,
            "language": "tr",
            "title": "Yaratıcı Çözümler, Profesyonel Sonuçlar",
            "slug": "yaratici-cozumler-profesyonel-sonuclar"
          }
        ]
      }
    ]
  },
  "message": "Banner created successfully"
}
```

### 4. Banner Güncelle
```javascript
PATCH /banners/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /banners/admin/1

{
  "type": "hero",
  "position": "home",
  "order": 1,
  "isActive": true,
  "isAutoplay": false,
  "autoplayDelay": 0,
  "showNavigation": false,
  "showPagination": true,
  "transitionEffect": "fade",
  "backgroundColor": "#2c3e50",
  "overlayOpacity": 0.5,
  "height": 700,
  "mobileHeight": 500,
  "settings": {
    "animation": "slideIn",
    "animationDuration": 1200,
    "textAlign": "left",
    "verticalAlign": "middle"
  }
}

// Response
{
  "banner": {
    "id": 1,
    "type": "hero",
    "position": "home",
    "order": 1,
    "isActive": true,
    "isAutoplay": false,
    "autoplayDelay": 0,
    "showNavigation": false,
    "showPagination": true,
    "transitionEffect": "fade",
    "backgroundColor": "#2c3e50",
    "overlayOpacity": 0.5,
    "height": 700,
    "mobileHeight": 500,
    "updatedAt": "2025-12-07T16:30:00.000Z"
  },
  "message": "Banner updated successfully"
}
```

### 5. Slide Ekle
```javascript
POST /banners/admin/:id/slides
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: POST /banners/admin/1/slides

{
  "order": 3,
  "isActive": true,
  "image": {
    "desktop": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-desktop.jpg",
    "tablet": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-tablet.jpg",
    "mobile": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-mobile.jpg"
  },
  "video": {
    "url": "https://res.cloudinary.com/demo/video/upload/v1/slide-video.mp4",
    "poster": "https://res.cloudinary.com/demo/image/upload/v1/slide-video-poster.jpg",
    "autoplay": true,
    "loop": true,
    "muted": true
  },
  "link": {
    "url": "https://demo.softellio.com/blog",
    "text": "Blog Yazılarımızı Okuyun",
    "isExternal": false,
    "openInNewTab": false
  },
  "styling": {
    "backgroundColor": "rgba(52,152,219,0.4)",
    "textColor": "#ffffff",
    "titleColor": "#ffffff",
    "subtitleColor": "#f8f9fa",
    "buttonBackgroundColor": "#f39c12",
    "buttonTextColor": "#ffffff",
    "buttonBorderColor": "#e67e22"
  },
  "translations": [
    {
      "language": "tr",
      "title": "Teknoloji Dünyasından Haberler",
      "subtitle": "En Son Gelişmeleri Takip Edin",
      "description": "Blog yazılarımızda teknoloji trendleri, ipuçları ve sektör haberlerini bulabilirsiniz",
      "buttonText": "Blog Yazılarımızı Okuyun",
      "altText": "Teknoloji haberleri blog banner görseli"
    },
    {
      "language": "en",
      "title": "News from the Technology World",
      "subtitle": "Follow the Latest Developments",
      "description": "Find technology trends, tips, and industry news in our blog posts",
      "buttonText": "Read Our Blog Posts",
      "altText": "Technology news blog banner image"
    }
  ]
}

// Response
{
  "slide": {
    "id": 26,
    "bannerId": 1,
    "order": 3,
    "isActive": true,
    "image": {
      "desktop": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-desktop.jpg",
      "tablet": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-tablet.jpg",
      "mobile": "https://res.cloudinary.com/demo/image/upload/v1/slide-3-mobile.jpg"
    },
    "createdAt": "2025-12-07T16:45:00.000Z",
    "updatedAt": "2025-12-07T16:45:00.000Z",
    "translations": [
      {
        "id": 46,
        "slideId": 26,
        "language": "tr",
        "title": "Teknoloji Dünyasından Haberler",
        "slug": "teknoloji-dunyasindan-haberler"
      }
    ]
  },
  "message": "Slide added successfully"
}
```

### 6. Slide Güncelle
```javascript
PATCH /banners/admin/:bannerId/slides/:slideId
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /banners/admin/1/slides/1

{
  "order": 1,
  "isActive": true,
  "image": {
    "desktop": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-desktop.jpg",
    "tablet": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-tablet.jpg",
    "mobile": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-mobile.jpg"
  },
  "link": {
    "url": "https://demo.softellio.com/hakkimizda",
    "text": "Hakkımızda Bilgi Alın",
    "isExternal": false,
    "openInNewTab": false
  },
  "styling": {
    "backgroundColor": "rgba(46,204,113,0.6)",
    "textColor": "#ffffff",
    "buttonBackgroundColor": "#27ae60",
    "buttonTextColor": "#ffffff"
  },
  "translations": [
    {
      "language": "tr",
      "title": "15 Yıllık Deneyim",
      "subtitle": "Güvenilir Teknoloji Partneri",
      "description": "Uzman kadromuz ile işinizde teknoloji farkını yaşayın",
      "buttonText": "Hakkımızda Bilgi Alın",
      "altText": "Deneyimli teknoloji ekibi banner görseli"
    }
  ]
}

// Response
{
  "slide": {
    "id": 1,
    "bannerId": 1,
    "order": 1,
    "isActive": true,
    "image": {
      "desktop": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-desktop.jpg",
      "tablet": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-tablet.jpg",
      "mobile": "https://res.cloudinary.com/demo/image/upload/v1/updated-slide-mobile.jpg"
    },
    "updatedAt": "2025-12-07T17:00:00.000Z"
  },
  "updatedTranslations": [
    {
      "id": 1,
      "slideId": 1,
      "language": "tr",
      "title": "15 Yıllık Deneyim",
      "subtitle": "Güvenilir Teknoloji Partneri"
    }
  ],
  "message": "Slide updated successfully"
}
```

### 7. Slide Sil
```javascript
DELETE /banners/admin/:bannerId/slides/:slideId
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /banners/admin/1/slides/26

// Response
{
  "id": 26,
  "bannerId": 1,
  "deletedTranslations": 2,
  "message": "Slide deleted successfully",
  "deletedAt": "2025-12-07T17:15:00.000Z"
}
```

### 8. Banner Sil
```javascript
DELETE /banners/admin/:id
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Örnek: DELETE /banners/admin/6

// Response
{
  "id": 6,
  "deletedSlides": 1,
  "deletedTranslations": 2,
  "message": "Banner deleted successfully",
  "deletedAt": "2025-12-07T17:30:00.000Z"
}
```

### 9. Banner Sıralamasını Güncelle
```javascript
PATCH /banners/admin/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

{
  "bannerOrders": [
    {
      "id": 2,
      "order": 1
    },
    {
      "id": 1,
      "order": 2
    },
    {
      "id": 3,
      "order": 3
    }
  ]
}

// Response
{
  "updatedBanners": [
    {
      "id": 2,
      "order": 1,
      "type": "hero",
      "position": "home"
    },
    {
      "id": 1,
      "order": 2,
      "type": "hero",
      "position": "home"
    },
    {
      "id": 3,
      "order": 3,
      "type": "promotion",
      "position": "services"
    }
  ],
  "message": "Banner order updated successfully"
}
```

### 10. Slide Sıralamasını Güncelle
```javascript
PATCH /banners/admin/:id/slides/reorder
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Örnek: PATCH /banners/admin/1/slides/reorder

{
  "slideOrders": [
    {
      "id": 2,
      "order": 1
    },
    {
      "id": 1,
      "order": 2
    },
    {
      "id": 3,
      "order": 3
    }
  ]
}

// Response
{
  "updatedSlides": [
    {
      "id": 2,
      "bannerId": 1,
      "order": 1,
      "title": "İnovatif Çözümler"
    },
    {
      "id": 1,
      "bannerId": 1,
      "order": 2,
      "title": "Dijital Dünyanın Lideri"
    },
    {
      "id": 3,
      "bannerId": 1,
      "order": 3,
      "title": "Teknoloji Haberleri"
    }
  ],
  "message": "Slide order updated successfully"
}
```

### 11. Banner İstatistikleri
```javascript
GET /banners/admin/statistics
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?startDate=2025-12-01&endDate=2025-12-07&type=hero&position=home

// Response
{
  "overview": {
    "totalBanners": 8,
    "activeBanners": 6,
    "inactiveBanners": 2,
    "totalSlides": 18,
    "totalClicks": 2847,
    "totalViews": 45623,
    "clickThroughRate": 6.24
  },
  "bannerPerformance": [
    {
      "bannerId": 1,
      "type": "hero",
      "position": "home",
      "title": "Ana Sayfa Banner",
      "clicks": 1523,
      "views": 23456,
      "clickThroughRate": 6.49,
      "averageTimeOnSlide": 4.2,
      "bounceRate": 23.4
    },
    {
      "bannerId": 2,
      "type": "promotion",
      "position": "services",
      "title": "Hizmetler Promosyon",
      "clicks": 856,
      "views": 12876,
      "clickThroughRate": 6.65,
      "averageTimeOnSlide": 3.8,
      "bounceRate": 18.7
    }
  ],
  "slidePerformance": [
    {
      "slideId": 1,
      "bannerId": 1,
      "title": "Dijital Dünyanın Lideri",
      "clicks": 789,
      "views": 11234,
      "clickThroughRate": 7.02,
      "timeOnSlide": 5.1,
      "exitRate": 12.3
    },
    {
      "slideId": 2,
      "bannerId": 1,
      "title": "İnovatif Çözümler",
      "clicks": 734,
      "views": 12222,
      "clickThroughRate": 6.00,
      "timeOnSlide": 3.8,
      "exitRate": 15.6
    }
  ],
  "periodComparison": {
    "current": {
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2025-12-07T23:59:59.000Z",
      "clicks": 2847,
      "views": 45623,
      "ctr": 6.24
    },
    "previous": {
      "startDate": "2025-11-24T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.000Z",
      "clicks": 2456,
      "views": 42187,
      "ctr": 5.82
    },
    "growth": {
      "clicks": 15.92,
      "views": 8.14,
      "ctr": 7.22
    }
  },
  "topPerformingPositions": [
    {
      "position": "home",
      "clicks": 1876,
      "views": 28934,
      "clickThroughRate": 6.48
    },
    {
      "position": "services",
      "clicks": 971,
      "views": 16689,
      "clickThroughRate": 5.82
    }
  ]
}
```

## 📊 Dashboard Analytics

### 1. Genel İstatistikler
```javascript
GET /analytics/admin/overview
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?startDate=2025-12-01&endDate=2025-12-07&timezone=Europe/Istanbul

// Response
{
  "overview": {
    "totalVisitors": 12847,
    "uniqueVisitors": 8923,
    "pageViews": 45621,
    "sessions": 10456,
    "averageSessionDuration": 286.5,
    "bounceRate": 34.2,
    "conversionRate": 3.8,
    "topPages": [
      {
        "path": "/",
        "title": "Ana Sayfa",
        "views": 15632,
        "uniqueViews": 11234,
        "averageTime": 125.8,
        "exitRate": 25.4
      },
      {
        "path": "/hizmetler",
        "title": "Hizmetlerimiz",
        "views": 8945,
        "uniqueViews": 6789,
        "averageTime": 234.6,
        "exitRate": 18.7
      },
      {
        "path": "/blog",
        "title": "Blog",
        "views": 6754,
        "uniqueViews": 5234,
        "averageTime": 198.3,
        "exitRate": 45.2
      },
      {
        "path": "/iletisim",
        "title": "İletişim",
        "views": 5234,
        "uniqueViews": 4123,
        "averageTime": 89.5,
        "exitRate": 12.3
      }
    ],
    "trafficSources": [
      {
        "source": "organic",
        "name": "Organik Arama",
        "visitors": 5234,
        "percentage": 58.7,
        "sessions": 6123
      },
      {
        "source": "direct",
        "name": "Direkt Trafik",
        "visitors": 2456,
        "percentage": 27.5,
        "sessions": 2789
      },
      {
        "source": "social",
        "name": "Sosyal Medya",
        "visitors": 856,
        "percentage": 9.6,
        "sessions": 945
      },
      {
        "source": "referral",
        "name": "Referans Siteler",
        "visitors": 377,
        "percentage": 4.2,
        "sessions": 599
      }
    ],
    "deviceTypes": [
      {
        "type": "mobile",
        "name": "Mobil",
        "visitors": 5678,
        "percentage": 63.6,
        "sessions": 6234,
        "averageSessionDuration": 245.8
      },
      {
        "type": "desktop",
        "name": "Masaüstü",
        "visitors": 2456,
        "percentage": 27.5,
        "sessions": 2789,
        "averageSessionDuration": 356.2
      },
      {
        "type": "tablet",
        "name": "Tablet",
        "visitors": 789,
        "percentage": 8.9,
        "sessions": 1433,
        "averageSessionDuration": 298.7
      }
    ],
    "browsers": [
      {
        "name": "Chrome",
        "visitors": 4234,
        "percentage": 47.4,
        "sessions": 4987
      },
      {
        "name": "Safari",
        "visitors": 2456,
        "percentage": 27.5,
        "sessions": 2789
      },
      {
        "name": "Firefox",
        "visitors": 1234,
        "percentage": 13.8,
        "sessions": 1456
      },
      {
        "name": "Edge",
        "visitors": 999,
        "percentage": 11.3,
        "sessions": 1224
      }
    ]
  },
  "trends": {
    "visitors": [
      {
        "date": "2025-12-01",
        "visitors": 1856,
        "uniqueVisitors": 1234,
        "sessions": 1456
      },
      {
        "date": "2025-12-02",
        "visitors": 2134,
        "uniqueVisitors": 1567,
        "sessions": 1789
      },
      {
        "date": "2025-12-03",
        "visitors": 1798,
        "uniqueVisitors": 1345,
        "sessions": 1523
      },
      {
        "date": "2025-12-04",
        "visitors": 2245,
        "uniqueVisitors": 1678,
        "sessions": 1890
      },
      {
        "date": "2025-12-05",
        "visitors": 1934,
        "uniqueVisitors": 1456,
        "sessions": 1634
      },
      {
        "date": "2025-12-06",
        "visitors": 1623,
        "uniqueVisitors": 1234,
        "sessions": 1387
      },
      {
        "date": "2025-12-07",
        "visitors": 1257,
        "uniqueVisitors": 1009,
        "sessions": 1277
      }
    ],
    "pageViews": [
      {
        "date": "2025-12-01",
        "pageViews": 6754,
        "averageTime": 234.5
      },
      {
        "date": "2025-12-02",
        "pageViews": 7234,
        "averageTime": 245.8
      },
      {
        "date": "2025-12-03",
        "pageViews": 6123,
        "averageTime": 198.7
      },
      {
        "date": "2025-12-04",
        "pageViews": 7456,
        "averageTime": 267.3
      },
      {
        "date": "2025-12-05",
        "pageViews": 6789,
        "averageTime": 223.4
      },
      {
        "date": "2025-12-06",
        "pageViews": 5987,
        "averageTime": 189.6
      },
      {
        "date": "2025-12-07",
        "pageViews": 5278,
        "averageTime": 234.8
      }
    ]
  },
  "period": {
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-07T23:59:59.000Z",
    "timezone": "Europe/Istanbul"
  }
}
```

### 2. Blog İstatistikleri
```javascript
GET /analytics/admin/blog
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?startDate=2025-12-01&endDate=2025-12-07&language=tr&sortBy=views&sortOrder=desc

// Response
{
  "blogStats": {
    "overview": {
      "totalPosts": 45,
      "publishedPosts": 42,
      "draftPosts": 3,
      "totalViews": 23456,
      "totalReads": 18234,
      "averageReadTime": 245.8,
      "engagementRate": 67.4,
      "shareCount": 1234
    },
    "topPosts": [
      {
        "id": 15,
        "title": "JavaScript ile Modern Web Geliştirme",
        "slug": "javascript-ile-modern-web-gelistirme",
        "publishedAt": "2025-11-28T10:00:00.000Z",
        "views": 3456,
        "uniqueViews": 2789,
        "reads": 2134,
        "averageReadTime": 345.6,
        "readCompletionRate": 61.7,
        "shareCount": 89,
        "commentCount": 23,
        "likeCount": 156,
        "engagementRate": 8.9,
        "trafficSources": [
          {
            "source": "organic",
            "views": 2134,
            "percentage": 61.7
          },
          {
            "source": "social",
            "views": 856,
            "percentage": 24.8
          },
          {
            "source": "direct",
            "views": 466,
            "percentage": 13.5
          }
        ],
        "tags": ["JavaScript", "Web Geliştirme", "Frontend", "React"],
        "category": "Teknoloji"
      }
    ],
    "categories": [
      {
        "name": "Teknoloji",
        "postCount": 18,
        "totalViews": 12456,
        "averageViews": 692,
        "engagementRate": 8.4
      },
      {
        "name": "Pazarlama",
        "postCount": 12,
        "totalViews": 8234,
        "averageViews": 686,
        "engagementRate": 6.7
      }
    ],
    "readingBehavior": {
      "averageTimeOnPost": 245.8,
      "averageScrollDepth": 68.4,
      "readCompletionRate": 64.2,
      "returnReaderRate": 23.7,
      "shareRate": 5.3,
      "commentRate": 2.1
    }
  }
}
```

### 3. İletişim ve Dönüşüm İstatistikleri
```javascript
GET /analytics/admin/conversions
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?startDate=2025-12-01&endDate=2025-12-07&type=all

// Response
{
  "conversions": {
    "overview": {
      "totalSubmissions": 234,
      "contactFormSubmissions": 156,
      "subscriptionSignups": 45,
      "downloadRequests": 33,
      "conversionRate": 3.8,
      "qualifiedLeads": 89,
      "leadQualityScore": 7.2
    },
    "contactForms": [
      {
        "id": 1,
        "name": "Ana İletişim Formu",
        "type": "contact",
        "page": "/iletisim",
        "submissions": 89,
        "completionRate": 78.4,
        "averageTime": 145.6
      }
    ],
    "funnelAnalysis": [
      {
        "step": 1,
        "name": "Site Ziyareti",
        "visitors": 8923,
        "conversionRate": 100.0
      },
      {
        "step": 2,
        "name": "Form Tamamlama",
        "visitors": 156,
        "conversionRate": 1.7,
        "dropoffRate": 65.8
      }
    ]
  }
}
```

### 4. Gerçek Zamanlı İstatistikler
```javascript
GET /analytics/admin/realtime
Authorization: Bearer {tenantAdminToken}
X-Tenant-Domain: demo.softellio.com

// Response
{
  "realtime": {
    "activeUsers": 45,
    "currentSessions": 38,
    "pageViewsLast30Min": 234,
    "averageSessionDuration": 195.6,
    "topActivePages": [
      {
        "path": "/",
        "title": "Ana Sayfa",
        "activeUsers": 18,
        "views": 45
      },
      {
        "path": "/hizmetler",
        "title": "Hizmetlerimiz",
        "activeUsers": 8,
        "views": 19
      }
    ],
    "trafficSources": [
      {
        "source": "organic",
        "activeUsers": 23,
        "percentage": 51.1
      },
      {
        "source": "direct",
        "activeUsers": 15,
        "percentage": 33.3
      }
    ],
    "devices": [
      {
        "type": "mobile",
        "activeUsers": 28,
        "percentage": 62.2
      },
      {
        "type": "desktop",
        "activeUsers": 14,
        "percentage": 31.1
      }
    ],
    "goals": [
      {
        "name": "İletişim Formu",
        "completions": 3,
        "value": 150.0
      }
    ],
    "lastUpdate": "2025-12-07T17:45:30.000Z"
  }
}
```

---