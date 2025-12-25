# 🌐 FRONTEND WEBSITE API DOKÜMANTASYONU

> **Frontend geliştiricileri için eksiksiz public API rehberi**
> Bu dokümantasyon Frontend website'de kullanılacak tüm public API'ları içerir.

---

## 📋 İÇERİK

1. [Giriş](#giriş)
2. [Public Sayfa API'ları](#public-sayfa-apiları)
3. [Public Blog API'ları](#public-blog-apiları)
4. [Public Menü API'ları](#public-menü-apiları)
5. [Public Hizmetler API'ları](#public-hizmetler-apiları)
6. [Public Referanslar/Portfolio API'ları](#public-referanslarportfolio-apiları)
7. [Site Ayarları API'ları](#site-ayarları-apiları)
8. [İletişim Bilgileri API'ları](#iletişim-bilgileri-apiları)
9. [Ekip Üyeleri API'ları](#ekip-üyeleri-apiları)
10. [Medya API'ları](#medya-apiları)
11. [Sosyal Medya & Harita API'ları](#sosyal-medya--harita-apiları)
12. [Banner & Slider API'ları](#banner--slider-apiları)
13. [Analytics & Tracking API'ları](#analytics--tracking-apiları)
14. [SEO API'ları](#seo-apiları)
15. [Hata Kodları](#hata-kodları)

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
  "X-Tenant-Domain": "{tenant-domain}"
}
```

### Özellikler
- **Kimlik doğrulama gerektirmez** (Public API'lar)
- **Multi-language desteği** (tr, en, de)
- **SEO optimize edilmiş** yanıtlar
- **Cache-friendly** headers
- **Rate limiting** koruması

---

## 📄 Public Sayfa API'ları

### 1. Tüm Yayınlanmış Sayfaları Getir
```javascript
GET /pages/public/:language
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /pages/public/tr

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
              },
              {
                "type": "image",
                "data": {
                  "file": {
                    "url": "https://res.cloudinary.com/demo/image/upload/v1/hero-image.jpg"
                  },
                  "caption": "Ana sayfa görseli",
                  "withBorder": false,
                  "withBackground": false,
                  "stretched": true
                }
              },
              {
                "type": "quote",
                "data": {
                  "text": "Müşteri memnuniyeti bizim önceliğimizdir.",
                  "caption": "Demo Şirketi Motto",
                  "alignment": "center"
                }
              }
            ]
          },
          "metaTitle": "Ana Sayfa - Demo Şirketi",
          "metaDescription": "Demo şirketimizin ana sayfası",
          "excerpt": "Demo web sitesinin ana sayfası"
        }
      ]
    },
    {
      "id": 2,
      "tenantId": 1,
      "status": "published",
      "createdAt": "2025-12-07T19:25:02.345Z",
      "updatedAt": "2025-12-07T19:25:02.345Z",
      "translations": [
        {
          "id": 3,
          "pageId": 2,
          "language": "tr",
          "title": "Hakkımızda",
          "slug": "hakkimizda",
          "contentJson": {
            "blocks": [
              {
                "type": "header",
                "data": {
                  "text": "Hakkımızda",
                  "level": 1
                }
              },
              {
                "type": "paragraph",
                "data": {
                  "text": "Bu demo şirketin hakkında bilgiler."
                }
              }
            ]
          },
          "metaTitle": "Hakkımızda - Demo Şirketi",
          "metaDescription": "Demo şirketimiz hakkında bilgiler"
        }
      ]
    }
  ],
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "language": "tr"
}
```

### 2. Belirli Sayfa Detayını Getir
```javascript
GET /pages/public/:language/:slug
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /pages/public/tr/hakkimizda

// Response
{
  "page": {
    "id": 2,
    "tenantId": 1,
    "status": "published",
    "createdAt": "2025-12-07T19:25:02.345Z",
    "updatedAt": "2025-12-07T19:25:02.345Z",
    "translation": {
      "id": 3,
      "pageId": 2,
      "language": "tr",
      "title": "Hakkımızda",
      "slug": "hakkimizda",
      "contentJson": {
        "blocks": [
          {
            "type": "header",
            "data": {
              "text": "Hakkımızda",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Demo Şirketi olarak 2020 yılından bu yana müşterilerimize kaliteli hizmet sunuyoruz."
            }
          },
          {
            "type": "list",
            "data": {
              "style": "unordered",
              "items": [
                "Profesyonel ekip",
                "Kaliteli hizmet",
                "Müşteri odaklı yaklaşım"
              ]
            }
          },
          {
            "type": "table",
            "data": {
              "withHeadings": true,
              "content": [
                ["Özellik", "Açıklama"],
                ["Kuruluş Yılı", "2020"],
                ["Çalışan Sayısı", "25+"],
                ["Müşteri Sayısı", "100+"]
              ]
            }
          }
        ]
      },
      "metaTitle": "Hakkımızda - Demo Şirketi",
      "metaDescription": "Demo şirketimiz hakkında detaylı bilgiler",
      "excerpt": "Demo şirketi hakkında özet bilgiler"
    }
  },
  "seoData": {
    "canonical": "https://demo.softellio.com/hakkimizda",
    "ogTitle": "Hakkımızda - Demo Şirketi",
    "ogDescription": "Demo şirketimiz hakkında detaylı bilgiler",
    "ogImage": "https://demo.softellio.com/images/about-og.jpg",
    "ogType": "website",
    "twitterCard": "summary_large_image"
  },
  "breadcrumbs": [
    {
      "name": "Ana Sayfa",
      "url": "/"
    },
    {
      "name": "Hakkımızda",
      "url": "/hakkimizda"
    }
  ],
  "relatedPages": [
    {
      "id": 3,
      "title": "Hizmetlerimiz",
      "slug": "hizmetlerimiz",
      "excerpt": "Sunduğumuz hizmetler hakkında bilgi"
    }
  ]
}
```

### 3. Sayfa Listesi (Sitemap için)
```javascript
GET /pages/public/:language/list
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /pages/public/tr/list

// Response
{
  "pages": [
    {
      "id": 1,
      "title": "Ana Sayfa",
      "slug": "ana-sayfa",
      "url": "/ana-sayfa",
      "lastModified": "2025-12-07T19:25:02.340Z",
      "priority": 1.0,
      "changeFreq": "weekly"
    },
    {
      "id": 2,
      "title": "Hakkımızda",
      "slug": "hakkimizda",
      "url": "/hakkimizda",
      "lastModified": "2025-12-07T19:25:02.345Z",
      "priority": 0.8,
      "changeFreq": "monthly"
    }
  ],
  "language": "tr",
  "totalPages": 2
}
```

---

## 📝 Public Blog API'ları

### 1. Blog Kategorilerini Getir
```javascript
GET /blog/public/:language/categories
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /blog/public/tr/categories

// Response
{
  "categories": [
    {
      "id": 1,
      "translation": {
        "id": 1,
        "categoryId": 1,
        "language": "tr",
        "name": "Teknoloji",
        "slug": "teknoloji",
        "description": "Teknoloji ile ilgili yazılar"
      },
      "postCount": 8,
      "latestPost": {
        "id": 1,
        "title": "İlk Blog Yazısı",
        "slug": "ilk-blog-yazisi",
        "publishedAt": "2025-12-07T19:25:02.356Z"
      }
    },
    {
      "id": 2,
      "translation": {
        "id": 3,
        "categoryId": 2,
        "language": "tr",
        "name": "Tasarım",
        "slug": "tasarim",
        "description": "Tasarım ve UI/UX ile ilgili yazılar"
      },
      "postCount": 5,
      "latestPost": {
        "id": 3,
        "title": "Modern Tasarım Trendleri",
        "slug": "modern-tasarim-trendleri",
        "publishedAt": "2025-12-06T15:30:00.000Z"
      }
    }
  ],
  "language": "tr",
  "totalCategories": 2
}
```

### 2. Blog Yazılarını Listele
```javascript
GET /blog/public/:language/posts
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=12&categoryId=1&search=teknoloji&sortBy=publishedAt&sortOrder=desc&featured=true

// Örnek: GET /blog/public/tr/posts?page=1&limit=6

// Response
{
  "posts": [
    {
      "id": 1,
      "tenantId": 1,
      "categoryId": 1,
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/blog-1.jpg",
      "publishedAt": "2025-12-07T19:25:02.356Z",
      "translation": {
        "id": 1,
        "postId": 1,
        "language": "tr",
        "title": "İlk Blog Yazısı",
        "slug": "ilk-blog-yazisi",
        "excerpt": "Bu blog yazısında teknoloji dünyasından son gelişmeleri paylaşıyoruz.",
        "readingTime": 5
      },
      "author": {
        "id": 2,
        "name": "Tenant Administrator",
        "bio": "Teknoloji ve inovasyon uzmanı",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/author-avatar.jpg"
      },
      "category": {
        "id": 1,
        "translation": {
          "name": "Teknoloji",
          "slug": "teknoloji"
        }
      },
      "tags": ["teknoloji", "web", "yazılım"],
      "analytics": {
        "viewCount": 245,
        "likeCount": 12,
        "commentCount": 3
      }
    },
    {
      "id": 2,
      "tenantId": 1,
      "categoryId": 2,
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/blog-2.jpg",
      "publishedAt": "2025-12-06T15:30:00.000Z",
      "translation": {
        "id": 4,
        "postId": 2,
        "language": "tr",
        "title": "Modern Tasarım Trendleri",
        "slug": "modern-tasarim-trendleri",
        "excerpt": "2025 yılının en popüler tasarım trendlerini keşfedin.",
        "readingTime": 7
      },
      "author": {
        "id": 3,
        "name": "Tasarım Uzmanı",
        "bio": "UI/UX tasarım uzmanı",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/designer-avatar.jpg"
      },
      "category": {
        "id": 2,
        "translation": {
          "name": "Tasarım",
          "slug": "tasarim"
        }
      },
      "tags": ["tasarım", "ui", "ux", "trend"],
      "analytics": {
        "viewCount": 189,
        "likeCount": 23,
        "commentCount": 8
      }
    }
  ],
  "pagination": {
    "total": 15,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "language": "tr"
}
```

### 3. Blog Yazısı Detayını Getir
```javascript
GET /blog/public/:language/posts/:slug
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /blog/public/tr/posts/ilk-blog-yazisi

// Response
{
  "post": {
    "id": 1,
    "tenantId": 1,
    "categoryId": 1,
    "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/blog-1.jpg",
    "publishedAt": "2025-12-07T19:25:02.356Z",
    "updatedAt": "2025-12-07T19:25:02.356Z",
    "translation": {
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
              "text": "Teknoloji Dünyasında Son Gelişmeler",
              "level": 1
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Teknoloji dünyası hızla gelişiyor ve her gün yeni inovasyonlar karşımıza çıkıyor. Bu yazıda son dönemin en önemli teknoloji trendlerini inceleyeceğiz."
            }
          },
          {
            "type": "header",
            "data": {
              "text": "Yapay Zeka Devrimi",
              "level": 2
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Yapay zeka artık sadece bilim kurgu filmlerinde değil, günlük hayatımızın her alanında karşımıza çıkıyor."
            }
          },
          {
            "type": "image",
            "data": {
              "file": {
                "url": "https://res.cloudinary.com/demo/image/upload/v1/ai-technology.jpg"
              },
              "caption": "Yapay zeka teknolojileri",
              "withBorder": true,
              "withBackground": false,
              "stretched": false
            }
          },
          {
            "type": "list",
            "data": {
              "style": "unordered",
              "items": [
                "Machine Learning algoritmaları",
                "Doğal dil işleme",
                "Bilgisayarlı görü",
                "Robotik sistemler"
              ]
            }
          },
          {
            "type": "code",
            "data": {
              "code": "// Basit bir AI modeli örneği\nconst model = new NeuralNetwork({\n  inputNodes: 784,\n  hiddenNodes: 128,\n  outputNodes: 10\n});\n\nmodel.train(trainingData);",
              "language": "javascript"
            }
          },
          {
            "type": "quote",
            "data": {
              "text": "Yapay zeka, insanlığın yarattığı en büyük devrimlerden biridir.",
              "caption": "Elon Musk",
              "alignment": "center"
            }
          }
        ]
      },
      "excerpt": "Bu blog yazısında teknoloji dünyasından son gelişmeleri paylaşıyoruz.",
      "metaTitle": "İlk Blog Yazısı - Demo Şirketi Blog",
      "metaDescription": "Teknoloji dünyasının son gelişmeleri ve yapay zeka trendleri hakkında detaylı bilgiler.",
      "readingTime": 5
    },
    "author": {
      "id": 2,
      "name": "Tenant Administrator",
      "bio": "Teknoloji ve inovasyon uzmanı",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/author-avatar.jpg",
      "socialMedia": {
        "twitter": "https://twitter.com/tech_expert",
        "linkedin": "https://linkedin.com/in/tech-expert"
      }
    },
    "category": {
      "id": 1,
      "translation": {
        "name": "Teknoloji",
        "slug": "teknoloji",
        "description": "Teknoloji ile ilgili yazılar"
      }
    },
    "tags": ["teknoloji", "web", "yazılım", "yapay-zeka"],
    "analytics": {
      "viewCount": 245,
      "uniqueViews": 189,
      "likeCount": 12,
      "commentCount": 3,
      "shareCount": 8,
      "avgReadingTime": 4.2
    }
  },
  "seoData": {
    "canonical": "https://demo.softellio.com/blog/ilk-blog-yazisi",
    "ogTitle": "İlk Blog Yazısı",
    "ogDescription": "Teknoloji dünyasının son gelişmeleri ve yapay zeka trendleri hakkında detaylı bilgiler.",
    "ogImage": "https://res.cloudinary.com/demo/image/upload/v1/blog-1.jpg",
    "ogType": "article",
    "articleAuthor": "Tenant Administrator",
    "articlePublishedTime": "2025-12-07T19:25:02.356Z",
    "articleModifiedTime": "2025-12-07T19:25:02.356Z",
    "articleSection": "Teknoloji",
    "articleTag": ["teknoloji", "web", "yazılım", "yapay-zeka"],
    "twitterCard": "summary_large_image",
    "twitterCreator": "@tech_expert"
  },
  "breadcrumbs": [
    {
      "name": "Ana Sayfa",
      "url": "/"
    },
    {
      "name": "Blog",
      "url": "/blog"
    },
    {
      "name": "Teknoloji",
      "url": "/blog/kategori/teknoloji"
    },
    {
      "name": "İlk Blog Yazısı",
      "url": "/blog/ilk-blog-yazisi"
    }
  ],
  "relatedPosts": [
    {
      "id": 3,
      "title": "Web Geliştirme Trendleri",
      "slug": "web-gelistirme-trendleri",
      "excerpt": "2025 yılının web geliştirme trendleri",
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/web-trends.jpg",
      "publishedAt": "2025-12-05T10:00:00.000Z",
      "readingTime": 6
    },
    {
      "id": 4,
      "title": "Mobil Uygulama Geliştirme",
      "slug": "mobil-uygulama-gelistirme",
      "excerpt": "Mobil uygulama geliştirme süreçleri",
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/mobile-dev.jpg",
      "publishedAt": "2025-12-04T14:30:00.000Z",
      "readingTime": 8
    }
  ]
}
```

### 4. Kategoriye Göre Blog Yazılarını Getir
```javascript
GET /blog/public/:language/categories/:categorySlug/posts
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=9&sortBy=publishedAt&sortOrder=desc

// Örnek: GET /blog/public/tr/categories/teknoloji/posts?page=1&limit=6

// Response
{
  "category": {
    "id": 1,
    "translation": {
      "name": "Teknoloji",
      "slug": "teknoloji",
      "description": "Teknoloji ile ilgili yazılar"
    },
    "postCount": 8
  },
  "posts": [
    {
      "id": 1,
      "title": "İlk Blog Yazısı",
      "slug": "ilk-blog-yazisi",
      "excerpt": "Bu blog yazısında teknoloji dünyasından son gelişmeleri paylaşıyoruz.",
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/blog-1.jpg",
      "publishedAt": "2025-12-07T19:25:02.356Z",
      "readingTime": 5,
      "author": {
        "name": "Tenant Administrator",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/author-avatar.jpg"
      },
      "analytics": {
        "viewCount": 245,
        "likeCount": 12,
        "commentCount": 3
      }
    }
  ],
  "pagination": {
    "total": 8,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "seoData": {
    "canonical": "https://demo.softellio.com/blog/kategori/teknoloji",
    "ogTitle": "Teknoloji - Demo Şirketi Blog",
    "ogDescription": "Teknoloji ile ilgili yazılar",
    "ogType": "website"
  }
}
```

---

## 🧭 Public Menü API'ları

### 1. Public Menüyü Getir
```javascript
GET /menu/public/:language/:key
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /menu/public/tr/main-menu

// Response
{
  "menu": {
    "id": 1,
    "key": "main-menu",
    "translation": {
      "name": "Ana Menü",
      "description": "Web sitesinin ana menüsü"
    },
    "items": [
      {
        "id": 1,
        "order": 1,
        "type": "page",
        "target": "_self",
        "cssClass": "home-link",
        "icon": "home",
        "translation": {
          "label": "Ana Sayfa",
          "description": null
        },
        "url": "/ana-sayfa",
        "isActive": true,
        "children": []
      },
      {
        "id": 2,
        "order": 2,
        "type": "dropdown",
        "target": "_self",
        "cssClass": "dropdown-menu",
        "icon": "info",
        "translation": {
          "label": "Kurumsal",
          "description": null
        },
        "url": null,
        "isActive": true,
        "children": [
          {
            "id": 3,
            "order": 1,
            "type": "page",
            "target": "_self",
            "translation": {
              "label": "Hakkımızda",
              "description": null
            },
            "url": "/hakkimizda",
            "isActive": true
          },
          {
            "id": 4,
            "order": 2,
            "type": "page",
            "target": "_self",
            "translation": {
              "label": "Misyon & Vizyon",
              "description": null
            },
            "url": "/misyon-vizyon",
            "isActive": true
          }
        ]
      },
      {
        "id": 5,
        "order": 3,
        "type": "page",
        "target": "_self",
        "cssClass": "services-link",
        "icon": "services",
        "translation": {
          "label": "Hizmetlerimiz",
          "description": null
        },
        "url": "/hizmetlerimiz",
        "isActive": true,
        "children": []
      },
      {
        "id": 6,
        "order": 4,
        "type": "page",
        "target": "_self",
        "translation": {
          "label": "Blog",
          "description": null
        },
        "url": "/blog",
        "isActive": true,
        "children": []
      },
      {
        "id": 7,
        "order": 5,
        "type": "external",
        "target": "_blank",
        "cssClass": "external-link",
        "icon": "link",
        "translation": {
          "label": "Portal",
          "description": "Müşteri portalı"
        },
        "url": "https://portal.demo.softellio.com",
        "isActive": true,
        "children": []
      },
      {
        "id": 8,
        "order": 6,
        "type": "page",
        "target": "_self",
        "translation": {
          "label": "İletişim",
          "description": null
        },
        "url": "/iletisim",
        "isActive": true,
        "children": []
      }
    ]
  },
  "language": "tr"
}
```

### 2. Ham Menü Verilerini Getir
```javascript
GET /menu/public/:language/:key/raw
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /menu/public/tr/main-menu/raw

// Response (Flat structure for easier processing)
{
  "menuId": 1,
  "key": "main-menu",
  "menuName": "Ana Menü",
  "items": [
    {
      "id": 1,
      "parentId": null,
      "order": 1,
      "type": "page",
      "label": "Ana Sayfa",
      "url": "/ana-sayfa",
      "target": "_self",
      "cssClass": "home-link",
      "icon": "home",
      "isActive": true,
      "level": 0
    },
    {
      "id": 2,
      "parentId": null,
      "order": 2,
      "type": "dropdown",
      "label": "Kurumsal",
      "url": null,
      "target": "_self",
      "cssClass": "dropdown-menu",
      "icon": "info",
      "isActive": true,
      "level": 0
    },
    {
      "id": 3,
      "parentId": 2,
      "order": 1,
      "type": "page",
      "label": "Hakkımızda",
      "url": "/hakkimizda",
      "target": "_self",
      "cssClass": "",
      "icon": null,
      "isActive": true,
      "level": 1
    },
    {
      "id": 4,
      "parentId": 2,
      "order": 2,
      "type": "page",
      "label": "Misyon & Vizyon",
      "url": "/misyon-vizyon",
      "target": "_self",
      "cssClass": "",
      "icon": null,
      "isActive": true,
      "level": 1
    }
  ],
  "language": "tr"
}
```

---

## 🛠️ Public Hizmetler API'ları

### 1. Tüm Hizmetleri Listele
```javascript
GET /services/public/:language
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=12&category=web-tasarim&featured=true&sortBy=order&sortOrder=asc

// Örnek: GET /services/public/tr?limit=6

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
      "translation": {
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
            },
            {
              "type": "list",
              "data": {
                "style": "unordered",
                "items": [
                  "Responsive tasarım",
                  "SEO optimize edilmiş yapı",
                  "Hızlı yükleme süreleri",
                  "Modern UI/UX tasarım",
                  "Cross-browser uyumluluk"
                ]
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
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/service-web-design-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/service-web-design-2.jpg"
      ],
      "testimonials": [
        {
          "id": 1,
          "clientName": "Ahmet Yılmaz",
          "clientCompany": "ABC Şirketi",
          "content": "Harika bir web sitesi yaptılar, çok memnunuz.",
          "rating": 5,
          "date": "2025-11-15"
        }
      ]
    },
    {
      "id": 2,
      "tenantId": 1,
      "category": "mobil-uygulama",
      "icon": "mobile",
      "color": "#2ecc71",
      "order": 2,
      "isFeatured": true,
      "isActive": true,
      "translation": {
        "id": 2,
        "serviceId": 2,
        "language": "tr",
        "title": "Mobil Uygulama",
        "slug": "mobil-uygulama",
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
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1/service-mobile-1.jpg"
      ],
      "testimonials": []
    }
  ],
  "pagination": {
    "total": 12,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "categories": [
    {
      "name": "web-tasarim",
      "displayName": "Web Tasarım",
      "count": 4
    },
    {
      "name": "mobil-uygulama",
      "displayName": "Mobil Uygulama",
      "count": 3
    },
    {
      "name": "seo",
      "displayName": "SEO Hizmetleri",
      "count": 5
    }
  ],
  "language": "tr"
}
```

### 2. Öne Çıkan Hizmetleri Getir
```javascript
GET /services/public/:language/featured
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /services/public/tr/featured

// Response
{
  "services": [
    {
      "id": 1,
      "title": "Web Tasarım",
      "slug": "web-tasarim",
      "shortDescription": "Modern web tasarım hizmetleri",
      "icon": "code",
      "color": "#3498db",
      "price": "5.000 TL'den başlayan fiyatlarla",
      "duration": "2-4 hafta",
      "features": ["Responsive Design", "SEO Optimizasyonu"],
      "images": ["https://res.cloudinary.com/demo/image/upload/v1/service-web-design-1.jpg"]
    },
    {
      "id": 2,
      "title": "Mobil Uygulama",
      "slug": "mobil-uygulama",
      "shortDescription": "Native mobil uygulama geliştirme",
      "icon": "mobile",
      "color": "#2ecc71",
      "price": "15.000 TL'den başlayan fiyatlarla",
      "duration": "6-12 hafta",
      "features": ["Native iOS & Android", "Performance Optimizasyonu"],
      "images": ["https://res.cloudinary.com/demo/image/upload/v1/service-mobile-1.jpg"]
    }
  ],
  "totalFeatured": 2,
  "language": "tr"
}
```

### 3. Hizmet Detayını Getir
```javascript
GET /services/public/:language/:slug
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /services/public/tr/web-tasarim

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
    "translation": {
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
            "type": "header",
            "data": {
              "text": "Hizmet Detayları",
              "level": 2
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
                "Cross-browser uyumluluk - Tüm tarayıcılarda sorunsuz çalışma",
                "İçerik yönetim sistemi - Kolay güncelleme imkanı",
                "SSL sertifikası - Güvenli bağlantı",
                "Google Analytics entegrasyonu - Detaylı analiz"
              ]
            }
          },
          {
            "type": "header",
            "data": {
              "text": "Süreç",
              "level": 2
            }
          },
          {
            "type": "table",
            "data": {
              "withHeadings": true,
              "content": [
                ["Aşama", "Süre", "Açıklama"],
                ["Analiz & Planlama", "3-5 gün", "İhtiyaç analizi ve proje planlaması"],
                ["Tasarım", "5-10 gün", "UI/UX tasarım ve onay süreci"],
                ["Geliştirme", "10-15 gün", "Kodlama ve entegrasyon"],
                ["Test & Yayın", "2-3 gün", "Test süreçleri ve canlıya alım"]
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
        "İçerik Yönetimi",
        "SSL Sertifikası",
        "Analytics Entegrasyonu",
        "Mobil Uyumluluk"
      ],
      "price": "5.000 TL'den başlayan fiyatlarla",
      "duration": "2-4 hafta",
      "metaTitle": "Web Tasarım Hizmetleri - Demo Şirketi",
      "metaDescription": "Profesyonel web tasarım hizmetleri ile modern ve kullanıcı dostu web siteleri"
    },
    "images": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/service-web-design-1.jpg",
        "alt": "Web tasarım örneği",
        "title": "Modern web sitesi tasarımı"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/service-web-design-2.jpg",
        "alt": "Responsive tasarım",
        "title": "Mobil uyumlu tasarım"
      }
    ],
    "portfolio": [
      {
        "id": 1,
        "title": "ABC Şirketi Web Sitesi",
        "url": "https://www.abcsirketi.com",
        "image": "https://res.cloudinary.com/demo/image/upload/v1/portfolio-abc.jpg",
        "description": "Kurumsal web sitesi projesi"
      },
      {
        "id": 2,
        "title": "XYZ E-ticaret",
        "url": "https://www.xyzstore.com",
        "image": "https://res.cloudinary.com/demo/image/upload/v1/portfolio-xyz.jpg",
        "description": "E-ticaret platformu geliştirme"
      }
    ],
    "testimonials": [
      {
        "id": 1,
        "clientName": "Ahmet Yılmaz",
        "clientCompany": "ABC Şirketi",
        "clientPosition": "Genel Müdür",
        "content": "Demo Şirketi ile çalışmak harika bir deneyimdi. Web sitemiz beklediklerimizin çok üzerinde çıktı. Profesyonel ekip, zamanında teslimat ve mükemmel tasarım. Kesinlikle tavsiye ederim.",
        "rating": 5,
        "date": "2025-11-15T10:00:00.000Z",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/client-avatar-1.jpg"
      },
      {
        "id": 2,
        "clientName": "Fatma Demir",
        "clientCompany": "DEF Girişim",
        "clientPosition": "Kurucu",
        "content": "Startup'ımız için harika bir web sitesi yaptılar. Modern tasarım ve kullanıcı dostu arayüz sayesinde müşteri sayımız %200 arttı.",
        "rating": 5,
        "date": "2025-10-22T14:30:00.000Z",
        "avatar": "https://res.cloudinary.com/demo/image/upload/v1/client-avatar-2.jpg"
      }
    ],
    "faqs": [
      {
        "question": "Web sitesi ne kadar sürede hazırlanır?",
        "answer": "Projenin kapsamına bağlı olarak 2-4 hafta arasında değişmektedir. Basit kurumsal siteler 2 hafta, e-ticaret siteleri ise 4-6 hafta sürebilir."
      },
      {
        "question": "Mobil uyumlu olacak mı?",
        "answer": "Evet, tüm projelerimiz responsive tasarım ile geliştirilir ve mobil cihazlarda mükemmel görünür."
      },
      {
        "question": "SEO optimizasyonu dahil mi?",
        "answer": "Evet, temel SEO optimizasyonu tüm projelerimizde standarttır. İleri düzey SEO hizmetleri ayrıca sunulmaktadır."
      }
    ]
  },
  "seoData": {
    "canonical": "https://demo.softellio.com/hizmetler/web-tasarim",
    "ogTitle": "Web Tasarım Hizmetleri - Demo Şirketi",
    "ogDescription": "Profesyonel web tasarım hizmetleri ile modern ve kullanıcı dostu web siteleri",
    "ogImage": "https://res.cloudinary.com/demo/image/upload/v1/service-web-design-1.jpg",
    "ogType": "service"
  },
  "breadcrumbs": [
    {
      "name": "Ana Sayfa",
      "url": "/"
    },
    {
      "name": "Hizmetler",
      "url": "/hizmetler"
    },
    {
      "name": "Web Tasarım",
      "url": "/hizmetler/web-tasarim"
    }
  ],
  "relatedServices": [
    {
      "id": 3,
      "title": "SEO Hizmetleri",
      "slug": "seo-hizmetleri",
      "shortDescription": "Google'da üst sıralarda yer alma",
      "icon": "search",
      "color": "#e74c3c"
    },
    {
      "id": 4,
      "title": "E-ticaret Geliştirme",
      "slug": "e-ticaret-gelistirme",
      "shortDescription": "Online satış platformları",
      "icon": "shopping-cart",
      "color": "#f39c12"
    }
  ]
}
```

### 4. Hizmetler Sitemap
```javascript
GET /services/public/:language/sitemap
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /services/public/tr/sitemap

// Response
{
  "services": [
    {
      "title": "Web Tasarım",
      "slug": "web-tasarim",
      "url": "/hizmetler/web-tasarim",
      "lastModified": "2025-12-07T19:00:00.000Z",
      "priority": 0.8,
      "changeFreq": "monthly"
    },
    {
      "title": "Mobil Uygulama",
      "slug": "mobil-uygulama",
      "url": "/hizmetler/mobil-uygulama",
      "lastModified": "2025-12-06T15:30:00.000Z",
      "priority": 0.8,
      "changeFreq": "monthly"
    }
  ],
  "language": "tr",
  "totalServices": 12
}
```

---

## 🎨 Public Referanslar/Portfolio API'ları

### 1. Tüm Referansları Listele
```javascript
GET /references/public/:language
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?page=1&limit=12&category=web-sitesi&year=2024&featured=true&sortBy=completedAt&sortOrder=desc

// Örnek: GET /references/public/tr?page=1&limit=6

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
      "translation": {
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
      "client": {
        "name": "ABC Şirketi",
        "industry": "Teknoloji",
        "location": "İstanbul",
        "website": "https://www.abcsirketi.com",
        "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-abc-logo.png"
      },
      "images": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
          "alt": "ABC Şirketi ana sayfa",
          "title": "Modern ana sayfa tasarımı",
          "type": "desktop"
        },
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-2.jpg",
          "alt": "ABC Şirketi mobil görünüm",
          "title": "Mobil uyumlu tasarım",
          "type": "mobile"
        }
      ],
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
      "projectDuration": "4 hafta",
      "teamSize": 4,
      "services": ["Web Tasarım", "Frontend Geliştirme", "SEO"],
      "analytics": {
        "viewCount": 156,
        "likeCount": 23
      }
    },
    {
      "id": 2,
      "tenantId": 1,
      "category": "e-ticaret",
      "year": 2024,
      "isFeatured": true,
      "isActive": true,
      "completedAt": "2024-10-20T00:00:00.000Z",
      "order": 2,
      "translation": {
        "id": 2,
        "referenceId": 2,
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
      },
      "client": {
        "name": "XYZ Store",
        "industry": "E-ticaret",
        "location": "Ankara",
        "website": "https://www.xyzstore.com",
        "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-xyz-logo.png"
      },
      "images": [
        {
          "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-xyz-1.jpg",
          "alt": "XYZ Store ana sayfa",
          "title": "E-ticaret ana sayfa",
          "type": "desktop"
        }
      ],
      "technologies": [
        "Vue.js",
        "Nuxt.js",
        "Node.js",
        "MongoDB",
        "Stripe"
      ],
      "features": [
        "Ürün Kataloğu",
        "Sepet Yönetimi",
        "Güvenli Ödeme",
        "Sipariş Takibi",
        "Admin Paneli"
      ],
      "projectDuration": "8 hafta",
      "teamSize": 6,
      "services": ["E-ticaret Geliştirme", "Backend Development", "Payment Integration"],
      "analytics": {
        "viewCount": 134,
        "likeCount": 18
      }
    }
  ],
  "pagination": {
    "total": 25,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "categories": [
    {
      "name": "web-sitesi",
      "displayName": "Web Sitesi",
      "count": 12
    },
    {
      "name": "e-ticaret",
      "displayName": "E-ticaret",
      "count": 8
    },
    {
      "name": "mobil-uygulama",
      "displayName": "Mobil Uygulama",
      "count": 5
    }
  ],
  "years": [2024, 2023, 2022],
  "language": "tr"
}
```

### 2. Öne Çıkan Referansları Getir
```javascript
GET /references/public/:language/featured
X-Tenant-Domain: demo.softellio.com

// Response
{
  "references": [
    {
      "id": 1,
      "title": "ABC Şirketi Kurumsal Web Sitesi",
      "slug": "abc-sirketi-web-sitesi",
      "description": "Modern ve kullanıcı dostu kurumsal web sitesi projesi",
      "category": "web-sitesi",
      "year": 2024,
      "completedAt": "2024-11-15T00:00:00.000Z",
      "client": {
        "name": "ABC Şirketi",
        "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-abc-logo.png"
      },
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
      "technologies": ["React.js", "Next.js", "TypeScript"],
      "services": ["Web Tasarım", "Frontend Geliştirme"]
    }
  ],
  "totalFeatured": 1,
  "language": "tr"
}
```

### 3. Kategoriye Göre Referansları Getir
```javascript
GET /references/public/:language/categories/:category
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /references/public/tr/categories/web-sitesi

// Response
{
  "category": {
    "name": "web-sitesi",
    "displayName": "Web Sitesi",
    "description": "Kurumsal ve kişisel web sitesi projeleri",
    "count": 12
  },
  "references": [
    // Reference objects...
  ],
  "pagination": {
    "total": 12,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 6
  }
}
```

### 4. Referans Detayını Getir
```javascript
GET /references/public/:language/:slug
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /references/public/tr/abc-sirketi-web-sitesi

// Response
{
  "reference": {
    "id": 1,
    "tenantId": 1,
    "category": "web-sitesi",
    "year": 2024,
    "isFeatured": true,
    "completedAt": "2024-11-15T00:00:00.000Z",
    "order": 1,
    "translation": {
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
              "text": "ABC Şirketi için geliştirdiğimiz kurumsal web sitesi projesi, şirketin dijital dönüşümünde önemli bir adımdır. Modern tasarım anlayışı ve kullanıcı deneyimi odaklı yaklaşımımızla, şirketin marka değerini dijital ortamda en iyi şekilde yansıtan bir platform oluşturduk."
            }
          },
          {
            "type": "header",
            "data": {
              "text": "Proje Detayları",
              "level": 2
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "Proje kapsamında responsive web tasarım, SEO optimizasyonu, içerik yönetim sistemi ve multi-language desteği gibi modern web standartlarının tümü uygulandı."
            }
          },
          {
            "type": "image",
            "data": {
              "file": {
                "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-process.jpg"
              },
              "caption": "Proje geliştirme süreci",
              "withBorder": true,
              "withBackground": false,
              "stretched": false
            }
          }
        ]
      },
      "challenge": "ABC Şirketi'nin mevcut web sitesi 2018 yılından kalma eski bir yapıya sahipti. Site mobil uyumlu değildi, yükleme süreleri çok uzundu ve SEO performansı oldukça düşüktü. Ayrıca içerik güncellemesi yapmak teknik bilgi gerektiriyordu.",
      "solution": "Şirket için tamamen yeni bir dijital deneyim tasarladık. Modern React.js teknolojisi kullanarak hızlı ve responsive bir web sitesi geliştirdik. SEO optimize edilmiş yapı, kullanıcı dostu admin paneli ve çok dilli destek ekledik.",
      "result": "Yeni web sitesi lansmanından sonra mobil trafik %150 arttı, organik arama trafiği %200 yükseldi. Sayfa yükleme hızları 3 saniyeden 1 saniyeye düştü. İletişim formu doldurma oranları %180 arttı.",
      "metaTitle": "ABC Şirketi Web Sitesi Projesi - Demo Şirketi Portfolio",
      "metaDescription": "ABC Şirketi için geliştirdiğimiz modern kurumsal web sitesi projesi detayları ve başarı hikayeleri"
    },
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
    "images": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
        "alt": "ABC Şirketi ana sayfa tasarımı",
        "title": "Modern ana sayfa tasarımı",
        "type": "desktop",
        "description": "Responsive ana sayfa tasarımı"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-2.jpg",
        "alt": "ABC Şirketi mobil görünüm",
        "title": "Mobil uyumlu tasarım",
        "type": "mobile",
        "description": "Mobil cihazlarda optimize edilmiş görünüm"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-3.jpg",
        "alt": "ABC Şirketi hizmetler sayfası",
        "title": "Hizmetler sayfası",
        "type": "desktop",
        "description": "Detaylı hizmet tanıtım sayfası"
      }
    ],
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
      },
      {
        "name": "Tailwind CSS",
        "category": "Styling",
        "description": "Utility-first CSS framework"
      },
      {
        "name": "Strapi CMS",
        "category": "CMS",
        "description": "Headless içerik yönetimi"
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
      },
      {
        "name": "İçerik Yönetim Sistemi",
        "description": "Kolay içerik güncellemesi"
      },
      {
        "name": "Çok Dilli Destek",
        "description": "Türkçe ve İngilizce dil seçenekleri"
      },
      {
        "name": "Analytics Entegrasyonu",
        "description": "Google Analytics ve Tag Manager"
      },
      {
        "name": "Hızlı Yükleme",
        "description": "Optimize edilmiş performans"
      }
    ],
    "projectDuration": "4 hafta",
    "teamSize": 4,
    "budget": "15.000 - 25.000 TL",
    "services": [
      {
        "name": "Web Tasarım",
        "description": "UI/UX tasarım süreci"
      },
      {
        "name": "Frontend Geliştirme",
        "description": "React.js ile geliştirme"
      },
      {
        "name": "SEO Optimizasyonu",
        "description": "Teknik ve içerik SEO"
      },
      {
        "name": "İçerik Migrasyonu",
        "description": "Eski siteden veri taşıma"
      }
    ],
    "timeline": [
      {
        "phase": "Analiz & Planlama",
        "duration": "5 gün",
        "description": "İhtiyaç analizi ve proje planlaması",
        "deliverables": ["İhtiyaç analizi raporu", "Teknik mimari dokümanı", "Proje zaman çizelgesi"]
      },
      {
        "phase": "Tasarım",
        "duration": "8 gün",
        "description": "UI/UX tasarım süreçleri",
        "deliverables": ["Wireframe tasarımları", "Görsel tasarım mockup'ları", "Style guide"]
      },
      {
        "phase": "Geliştirme",
        "duration": "12 gün",
        "description": "Frontend ve backend geliştirme",
        "deliverables": ["Responsive web sitesi", "Admin paneli", "İçerik yönetim sistemi"]
      },
      {
        "phase": "Test & Yayın",
        "duration": "3 gün",
        "description": "Test süreçleri ve canlıya alım",
        "deliverables": ["Test raporu", "Performans analizi", "Canlı sistem"]
      }
    ],
    "testimonial": {
      "content": "Demo Şirketi ile çalışmak harika bir deneyimdi. Profesyonel ekip, zamanında teslimat ve beklentilerimizin çok üzerinde bir sonuç. Yeni web sitemiz sayesinde dijital varlığımız güçlendi ve müşteri sayımız arttı.",
      "author": "Ahmet Yılmaz",
      "position": "Genel Müdür",
      "company": "ABC Şirketi",
      "rating": 5,
      "date": "2024-12-01T00:00:00.000Z",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/testimonial-ahmet.jpg"
    },
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
      },
      {
        "metric": "Sayfa Hızı",
        "improvement": "3s → 1s",
        "description": "Performans optimizasyonu ile hız artışı"
      },
      {
        "metric": "Dönüşüm Oranı",
        "improvement": "+180%",
        "description": "İletişim formu doldurma oranı artışı"
      }
    ]
  },
  "seoData": {
    "canonical": "https://demo.softellio.com/portfolio/abc-sirketi-web-sitesi",
    "ogTitle": "ABC Şirketi Web Sitesi Projesi - Demo Şirketi Portfolio",
    "ogDescription": "ABC Şirketi için geliştirdiğimiz modern kurumsal web sitesi projesi detayları ve başarı hikayeleri",
    "ogImage": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
    "ogType": "article"
  },
  "breadcrumbs": [
    {
      "name": "Ana Sayfa",
      "url": "/"
    },
    {
      "name": "Portfolio",
      "url": "/portfolio"
    },
    {
      "name": "Web Sitesi",
      "url": "/portfolio/kategori/web-sitesi"
    },
    {
      "name": "ABC Şirketi Web Sitesi",
      "url": "/portfolio/abc-sirketi-web-sitesi"
    }
  ],
  "relatedReferences": [
    {
      "id": 2,
      "title": "XYZ Store E-ticaret Platformu",
      "slug": "xyz-store-e-ticaret",
      "category": "e-ticaret",
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/reference-xyz-1.jpg",
      "client": {
        "name": "XYZ Store"
      }
    }
  ]
}
```

### 5. Portfolio Grid Görünüm
```javascript
GET /references/public/:language/portfolio/grid
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?categories=web-sitesi,e-ticaret&limit=12

// Response
{
  "references": [
    {
      "id": 1,
      "title": "ABC Şirketi Kurumsal Web Sitesi",
      "slug": "abc-sirketi-web-sitesi",
      "category": "web-sitesi",
      "featuredImage": "https://res.cloudinary.com/demo/image/upload/v1/reference-abc-1.jpg",
      "client": {
        "name": "ABC Şirketi",
        "logo": "https://res.cloudinary.com/demo/image/upload/v1/client-abc-logo.png"
      },
      "technologies": ["React.js", "Next.js"],
      "year": 2024
    }
  ],
  "gridLayout": "masonry", // masonry, grid
  "totalVisible": 12
}
```

---

## ⚙️ Site Ayarları API'ları

### 1. Genel Site Ayarlarını Getir
```javascript
GET /site-settings/public/:language
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /site-settings/public/tr

// Response
{
  "settings": {
    "id": 1,
    "tenantId": 1,
    "translation": {
      "id": 1,
      "settingsId": 1,
      "language": "tr",
      "siteName": "Demo Şirketi",
      "siteDescription": "Teknoloji çözümleri ve danışmanlık hizmetleri",
      "siteTagline": "İnovasyon ile Gelişen Teknoloji",
      "welcomeMessage": "Demo Şirketi'ne hoş geldiniz",
      "metaKeywords": "teknoloji, yazılım, danışmanlık, web tasarım"
    },
    "logo": "https://res.cloudinary.com/demo/image/upload/v1/logo.png",
    "favicon": "https://res.cloudinary.com/demo/image/upload/v1/favicon.ico",
    "email": "info@demo.softellio.com",
    "phone": "+90 212 555 0123",
    "address": "Maslak Mahallesi, Büyükdere Cd. No: 123, 34398 Şişli/İstanbul",
    "workingHours": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-18:00",
      "saturday": "Kapalı",
      "sunday": "Kapalı"
    },
    "socialMedia": {
      "facebook": "https://facebook.com/demosirketi",
      "twitter": "https://twitter.com/demosirketi",
      "instagram": "https://instagram.com/demosirketi",
      "linkedin": "https://linkedin.com/company/demosirketi",
      "youtube": "https://youtube.com/demosirketi"
    },
    "colors": {
      "primary": "#3498db",
      "secondary": "#2ecc71",
      "accent": "#e74c3c",
      "background": "#ffffff",
      "text": "#2c3e50"
    },
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans"
    },
    "timezone": "Europe/Istanbul",
    "currency": "TRY",
    "language": "tr",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "HH:mm",
    "isMaintenanceMode": false,
    "maintenanceMessage": "",
    "googleAnalyticsId": "GA_MEASUREMENT_ID",
    "googleTagManagerId": "GTM-XXXXXXX",
    "facebookPixelId": "123456789012345"
  },
  "seoSettings": {
    "defaultMetaTitle": "Demo Şirketi - Teknoloji Çözümleri",
    "defaultMetaDescription": "Demo şirketi olarak teknoloji danışmanlığı ve yazılım çözümleri sunuyoruz",
    "ogImage": "https://res.cloudinary.com/demo/image/upload/v1/og-default.jpg",
    "twitterHandle": "@demosirketi",
    "googleSiteVerification": "google-site-verification-code",
    "bingSiteVerification": "bing-site-verification-code"
  },
  "contactSettings": {
    "showContactInfo": true,
    "showMap": true,
    "showWorkingHours": true,
    "allowContactForm": true,
    "contactFormRecipient": "contact@demo.softellio.com"
  }
}
```

### 2. Hızlı Site Bilgilerini Getir
```javascript
GET /site-settings/public/:language/basic
X-Tenant-Domain: demo.softellio.com

// Response
{
  "siteName": "Demo Şirketi",
  "siteDescription": "Teknoloji çözümleri ve danışmanlık hizmetleri",
  "logo": "https://res.cloudinary.com/demo/image/upload/v1/logo.png",
  "favicon": "https://res.cloudinary.com/demo/image/upload/v1/favicon.ico",
  "email": "info@demo.softellio.com",
  "phone": "+90 212 555 0123",
  "socialMedia": {
    "facebook": "https://facebook.com/demosirketi",
    "twitter": "https://twitter.com/demosirketi",
    "linkedin": "https://linkedin.com/company/demosirketi"
  },
  "colors": {
    "primary": "#3498db",
    "secondary": "#2ecc71"
  }
}
```

---

## 📞 İletişim Bilgileri API'ları

### 1. İletişim Bilgilerini Getir
```javascript
GET /contact-info/public/:language
X-Tenant-Domain: demo.softellio.com

// Response
{
  "contactInfo": [
    {
      "id": 1,
      "type": "headquarters",
      "translation": {
        "title": "Genel Merkez",
        "address": "Maslak Mahallesi, Büyükdere Cd. No: 123, 34398 Şişli/İstanbul",
        "description": "Ana ofisimiz"
      },
      "phone": "+90 212 555 0123",
      "fax": "+90 212 555 0124",
      "email": "info@demo.softellio.com",
      "coordinates": {
        "lat": 41.1086,
        "lng": 29.0219
      },
      "workingHours": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "Kapalı",
        "sunday": "Kapalı"
      },
      "isPrimary": true,
      "isActive": true
    },
    {
      "id": 2,
      "type": "branch",
      "translation": {
        "title": "Ankara Şubesi",
        "address": "Çankaya Mahallesi, Atatürk Blv. No: 456, 06690 Çankaya/Ankara",
        "description": "Ankara bölge ofisi"
      },
      "phone": "+90 312 555 0123",
      "email": "ankara@demo.softellio.com",
      "coordinates": {
        "lat": 39.9208,
        "lng": 32.8541
      },
      "workingHours": {
        "monday": "09:00-17:00",
        "tuesday": "09:00-17:00",
        "wednesday": "09:00-17:00",
        "thursday": "09:00-17:00",
        "friday": "09:00-17:00",
        "saturday": "Kapalı",
        "sunday": "Kapalı"
      },
      "isPrimary": false,
      "isActive": true
    }
  ],
  "emergencyContact": {
    "phone": "+90 212 555 9999",
    "email": "emergency@demo.softellio.com",
    "description": "7/24 acil destek hattı"
  },
  "salesContact": {
    "phone": "+90 212 555 0100",
    "email": "sales@demo.softellio.com",
    "description": "Satış ekibi iletişim"
  },
  "supportContact": {
    "phone": "+90 212 555 0200",
    "email": "support@demo.softellio.com",
    "description": "Teknik destek hattı"
  }
}
```

### 2. İletişim Formu Gönder
```javascript
POST /contact-info/public/contact-form
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet.yilmaz@example.com",
  "phone": "+90 555 123 4567",
  "company": "ABC Şirketi",
  "subject": "Web Tasarım Hizmeti",
  "message": "Şirketimiz için yeni bir web sitesi tasarımına ihtiyacımız var. Detaylı bilgi alabilir miyim?",
  "service": "web-tasarim", // optional
  "budget": "10000-20000", // optional
  "timeline": "1-2 ay", // optional
  "preferredContactMethod": "email", // email, phone
  "consent": true, // KVKK onayı
  "recaptcha": "03AGdBq26..." // reCAPTCHA token
}

// Response
{
  "success": true,
  "message": "Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız.",
  "referenceId": "CF202512070001",
  "estimatedResponseTime": "24 saat"
}
```

### 3. Hızlı Bilgi Talep Formu
```javascript
POST /contact-info/public/quick-info
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "name": "Fatma Demir",
  "email": "fatma.demir@example.com",
  "phone": "+90 555 987 6543",
  "service": "mobil-uygulama",
  "message": "Mobil uygulama geliştirme hizmetiniz hakkında bilgi almak istiyorum."
}

// Response
{
  "success": true,
  "message": "Bilgi talebiniz alındı. Kısa sürede size ulaşacağız.",
  "referenceId": "QI202512070002",
  "autoResponse": {
    "subject": "Mobil Uygulama Geliştirme Hakkında",
    "content": "Merhaba Fatma Hanım, mobil uygulama geliştirme hizmetlerimiz hakkında detaylı bilgi için ekibimiz size ulaşacak."
  }
}
```

---

## 👥 Ekip Üyeleri API'ları

### 1. Tüm Ekip Üyelerini Getir
```javascript
GET /team-members/public/:language
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?department=teknoloji&featured=true&limit=8

// Response
{
  "teamMembers": [
    {
      "id": 1,
      "department": "yonetim",
      "position": "Genel Müdür",
      "order": 1,
      "isFeatured": true,
      "isActive": true,
      "joinedAt": "2020-01-15T00:00:00.000Z",
      "translation": {
        "id": 1,
        "memberId": 1,
        "language": "tr",
        "name": "Ahmet Yılmaz",
        "title": "Genel Müdür",
        "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından biridir.",
        "description": "Teknoloji ve inovasyon konularında uzman, sektörde tanınmış isimlerden biri."
      },
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-ahmet.jpg",
      "email": "ahmet.yilmaz@demo.softellio.com",
      "phone": "+90 212 555 0101",
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/ahmetyilmaz",
        "twitter": "https://twitter.com/ahmetyilmaz"
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
      "languages": ["Türkçe", "İngilizce", "Almanca"]
    },
    {
      "id": 2,
      "department": "teknoloji",
      "position": "Teknik Direktör",
      "order": 2,
      "isFeatured": true,
      "isActive": true,
      "joinedAt": "2020-03-01T00:00:00.000Z",
      "translation": {
        "id": 2,
        "memberId": 2,
        "language": "tr",
        "name": "Fatma Demir",
        "title": "Teknik Direktör",
        "bio": "Full-stack geliştirici olarak kariyerine başlayan Fatma Hanım, şu anda teknik ekibimizin başında.",
        "description": "Modern web teknolojileri ve yazılım mimarisi konularında uzman."
      },
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-fatma.jpg",
      "email": "fatma.demir@demo.softellio.com",
      "phone": "+90 212 555 0102",
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/fatmademir",
        "github": "https://github.com/fatmademir"
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
      "languages": ["Türkçe", "İngilizce"]
    }
  ],
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
  ],
  "totalMembers": 18,
  "language": "tr"
}
```

### 2. Öne Çıkan Ekip Üyelerini Getir
```javascript
GET /team-members/public/:language/featured
X-Tenant-Domain: demo.softellio.com

// Response
{
  "featuredMembers": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "title": "Genel Müdür",
      "department": "yonetim",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-ahmet.jpg",
      "bio": "15 yıllık teknoloji sektörü deneyimi olan Ahmet Bey, şirketimizin kurucu ortaklarından biridir.",
      "skills": ["Liderlik", "Strateji Geliştirme"],
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/ahmetyilmaz"
      }
    },
    {
      "id": 2,
      "name": "Fatma Demir",
      "title": "Teknik Direktör",
      "department": "teknoloji",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-fatma.jpg",
      "bio": "Full-stack geliştirici olarak kariyerine başlayan Fatma Hanım, şu anda teknik ekibimizin başında.",
      "skills": ["React.js", "Node.js"],
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/fatmademir",
        "github": "https://github.com/fatmademir"
      }
    }
  ],
  "totalFeatured": 2,
  "language": "tr"
}
```

### 3. Departmana Göre Ekip Üyelerini Getir
```javascript
GET /team-members/public/:language/departments/:department
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /team-members/public/tr/departments/teknoloji

// Response
{
  "department": {
    "key": "teknoloji",
    "name": "Teknoloji",
    "description": "Yazılım geliştirme ve teknik altyapı ekibi",
    "head": {
      "name": "Fatma Demir",
      "title": "Teknik Direktör"
    },
    "memberCount": 8,
    "establishedDate": "2020-01-15"
  },
  "members": [
    {
      "id": 2,
      "name": "Fatma Demir",
      "title": "Teknik Direktör",
      "position": "Teknik Direktör",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-fatma.jpg",
      "skills": ["React.js", "Node.js", "Python"],
      "joinedAt": "2020-03-01T00:00:00.000Z"
    },
    {
      "id": 5,
      "name": "Mehmet Kaya",
      "title": "Senior Frontend Developer",
      "position": "Kıdemli Frontend Geliştirici",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/team-mehmet.jpg",
      "skills": ["Vue.js", "TypeScript", "CSS"],
      "joinedAt": "2021-06-15T00:00:00.000Z"
    }
  ],
  "language": "tr"
}
```

---

## 🖼️ Medya API'ları

### 1. Medya Galerisi Getir
```javascript
GET /media/public/:language
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?type=image&category=gallery&page=1&limit=20

// Response
{
  "mediaItems": [
    {
      "id": 1,
      "tenantId": 1,
      "type": "image",
      "category": "gallery",
      "filename": "office-1.jpg",
      "originalName": "office-building.jpg",
      "mimeType": "image/jpeg",
      "size": 2048576,
      "url": "https://res.cloudinary.com/demo/image/upload/v1/gallery/office-1.jpg",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1/gallery/thumb_office-1.jpg",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "uploadedAt": "2025-11-15T10:00:00.000Z",
      "translation": {
        "id": 1,
        "mediaId": 1,
        "language": "tr",
        "title": "Ofis Binası",
        "description": "İstanbul Maslak'taki ofis binamız",
        "altText": "Demo Şirketi ofis binası dış görünüm"
      },
      "metadata": {
        "photographer": "Ahmet Fotoğrafçı",
        "camera": "Canon EOS R5",
        "location": "İstanbul, Maslak",
        "tags": ["ofis", "bina", "istanbul", "maslak"]
      },
      "isPublic": true,
      "isActive": true
    },
    {
      "id": 2,
      "tenantId": 1,
      "type": "image",
      "category": "team",
      "filename": "team-meeting-1.jpg",
      "url": "https://res.cloudinary.com/demo/image/upload/v1/gallery/team-meeting-1.jpg",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1/gallery/thumb_team-meeting-1.jpg",
      "dimensions": {
        "width": 1600,
        "height": 1200
      },
      "translation": {
        "title": "Ekip Toplantısı",
        "description": "Haftalık ekip toplantımızdan bir kare",
        "altText": "Demo Şirketi ekibi toplantı salonunda"
      },
      "metadata": {
        "tags": ["ekip", "toplantı", "ofis", "çalışma"]
      },
      "isPublic": true,
      "isActive": true
    }
  ],
  "categories": [
    {
      "key": "gallery",
      "name": "Galeri",
      "description": "Genel fotoğraf galerisi",
      "itemCount": 45
    },
    {
      "key": "team",
      "name": "Ekip",
      "description": "Ekip fotoğrafları",
      "itemCount": 23
    },
    {
      "key": "office",
      "name": "Ofis",
      "description": "Ofis alanları",
      "itemCount": 18
    },
    {
      "key": "events",
      "name": "Etkinlikler",
      "description": "Şirket etkinlikleri",
      "itemCount": 12
    }
  ],
  "pagination": {
    "total": 98,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "language": "tr"
}
```

### 2. Kategoriye Göre Medya Getir
```javascript
GET /media/public/:language/categories/:category
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /media/public/tr/categories/team

// Response
{
  "category": {
    "key": "team",
    "name": "Ekip",
    "description": "Ekip fotoğrafları ve aktiviteleri",
    "itemCount": 23,
    "coverImage": "https://res.cloudinary.com/demo/image/upload/v1/gallery/team-cover.jpg"
  },
  "mediaItems": [
    {
      "id": 2,
      "title": "Ekip Toplantısı",
      "url": "https://res.cloudinary.com/demo/image/upload/v1/gallery/team-meeting-1.jpg",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1/gallery/thumb_team-meeting-1.jpg",
      "description": "Haftalık ekip toplantımızdan bir kare",
      "altText": "Demo Şirketi ekibi toplantı salonunda",
      "uploadedAt": "2025-11-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 23,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 12
  }
}
```

### 3. Video Galerisi
```javascript
GET /media/public/:language/videos
X-Tenant-Domain: demo.softellio.com

// Response
{
  "videos": [
    {
      "id": 15,
      "type": "video",
      "category": "promotional",
      "url": "https://vimeo.com/123456789",
      "thumbnailUrl": "https://res.cloudinary.com/demo/video/upload/v1/promo-thumb.jpg",
      "duration": 120, // seconds
      "translation": {
        "title": "Şirket Tanıtım Videosu",
        "description": "Demo Şirketi'ni tanıtan kurumsal video",
        "altText": "Demo Şirketi tanıtım videosu"
      },
      "metadata": {
        "producer": "Video Prodüksiyon",
        "director": "Yönetmen Adı",
        "year": 2024,
        "tags": ["tanıtım", "kurumsal", "şirket"]
      },
      "uploadedAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "totalVideos": 8
}
```

---

## 📱 Sosyal Medya & Harita API'ları

### 1. Sosyal Medya Bağlantılarını Getir
```javascript
GET /social-media/public/:language
X-Tenant-Domain: demo.softellio.com

// Response
{
  "socialMediaAccounts": [
    {
      "id": 1,
      "platform": "facebook",
      "url": "https://facebook.com/demosirketi",
      "username": "@demosirketi",
      "isActive": true,
      "followerCount": 5420,
      "translation": {
        "displayName": "Facebook",
        "description": "Güncel haberlerimizi takip edin"
      },
      "icon": "fab fa-facebook-f",
      "color": "#1877F2",
      "order": 1
    },
    {
      "id": 2,
      "platform": "twitter",
      "url": "https://twitter.com/demosirketi",
      "username": "@demosirketi",
      "isActive": true,
      "followerCount": 2150,
      "translation": {
        "displayName": "Twitter",
        "description": "Anlık güncellemeler ve haberler"
      },
      "icon": "fab fa-twitter",
      "color": "#1DA1F2",
      "order": 2
    },
    {
      "id": 3,
      "platform": "instagram",
      "url": "https://instagram.com/demosirketi",
      "username": "@demosirketi",
      "isActive": true,
      "followerCount": 3280,
      "translation": {
        "displayName": "Instagram",
        "description": "Ofis hayatımız ve projelerimiz"
      },
      "icon": "fab fa-instagram",
      "color": "#E4405F",
      "order": 3
    },
    {
      "id": 4,
      "platform": "linkedin",
      "url": "https://linkedin.com/company/demosirketi",
      "username": "demosirketi",
      "isActive": true,
      "followerCount": 1890,
      "translation": {
        "displayName": "LinkedIn",
        "description": "Profesyonel ağımız ve iş fırsatları"
      },
      "icon": "fab fa-linkedin-in",
      "color": "#0A66C2",
      "order": 4
    },
    {
      "id": 5,
      "platform": "youtube",
      "url": "https://youtube.com/demosirketi",
      "username": "demosirketi",
      "isActive": true,
      "followerCount": 890,
      "translation": {
        "displayName": "YouTube",
        "description": "Eğitim videoları ve tanıtımlar"
      },
      "icon": "fab fa-youtube",
      "color": "#FF0000",
      "order": 5
    }
  ],
  "totalFollowers": 13630,
  "lastUpdated": "2025-12-07T12:00:00.000Z"
}
```

### 2. Son Sosyal Medya Gönderilerini Getir
```javascript
GET /social-media/public/:language/recent-posts
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?platforms=instagram,twitter&limit=6

// Response
{
  "recentPosts": [
    {
      "id": "instagram_123456789",
      "platform": "instagram",
      "postId": "123456789",
      "url": "https://instagram.com/p/ABC123/",
      "content": "Yeni ofisimizin açılışından kareler 🎉 #yeniofis #teknoloji #demo",
      "image": "https://scontent.cdninstagram.com/v/image.jpg",
      "publishedAt": "2025-12-06T15:30:00.000Z",
      "likes": 245,
      "comments": 18,
      "shares": 12,
      "engagement": 275
    },
    {
      "id": "twitter_987654321",
      "platform": "twitter",
      "postId": "987654321",
      "url": "https://twitter.com/demosirketi/status/987654321",
      "content": "Bu hafta yeni projelerimizi açıklayacağız! Takipte kalın 🚀 #teknoloji #inovasyon",
      "publishedAt": "2025-12-07T09:15:00.000Z",
      "likes": 89,
      "retweets": 23,
      "comments": 7,
      "engagement": 119
    }
  ],
  "totalPosts": 2,
  "lastSync": "2025-12-07T12:00:00.000Z"
}
```

### 3. Harita ve Konum Bilgileri
```javascript
GET /maps/public/:language
X-Tenant-Domain: demo.softellio.com

// Response
{
  "locations": [
    {
      "id": 1,
      "type": "headquarters",
      "translation": {
        "name": "Genel Merkez",
        "address": "Maslak Mahallesi, Büyükdere Cd. No: 123, 34398 Şişli/İstanbul",
        "description": "Ana ofisimiz ve genel merkezimiz"
      },
      "coordinates": {
        "lat": 41.1086,
        "lng": 29.0219
      },
      "phone": "+90 212 555 0123",
      "email": "info@demo.softellio.com",
      "workingHours": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "Kapalı",
        "sunday": "Kapalı"
      },
      "parkingAvailable": true,
      "publicTransport": [
        "Metro M2 Hattı - Maslak İstasyonu (5 dk yürüme)",
        "Otobüs 42, 42T, 40, 40T"
      ],
      "isPrimary": true,
      "isActive": true
    },
    {
      "id": 2,
      "type": "branch",
      "translation": {
        "name": "Ankara Şubesi",
        "address": "Çankaya Mahallesi, Atatürk Blv. No: 456, 06690 Çankaya/Ankara",
        "description": "Ankara bölge ofisi"
      },
      "coordinates": {
        "lat": 39.9208,
        "lng": 32.8541
      },
      "phone": "+90 312 555 0123",
      "email": "ankara@demo.softellio.com",
      "workingHours": {
        "monday": "09:00-17:00",
        "tuesday": "09:00-17:00",
        "wednesday": "09:00-17:00",
        "thursday": "09:00-17:00",
        "friday": "09:00-17:00",
        "saturday": "Kapalı",
        "sunday": "Kapalı"
      },
      "parkingAvailable": false,
      "publicTransport": [
        "Metro M1 Hattı - Kızılay İstasyonu (10 dk yürüme)",
        "Otobüs 405, 411"
      ],
      "isPrimary": false,
      "isActive": true
    }
  ],
  "mapSettings": {
    "defaultCenter": {
      "lat": 41.1086,
      "lng": 29.0219
    },
    "defaultZoom": 15,
    "mapStyle": "roadmap", // roadmap, satellite, hybrid, terrain
    "showTraffic": false,
    "showTransit": true,
    "markerStyle": {
      "color": "#3498db",
      "icon": "custom-marker.png"
    }
  },
  "totalLocations": 2
}
```

### 4. Yol Tarifi Bilgileri
```javascript
GET /maps/public/:language/:locationId/directions
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /maps/public/tr/1/directions

// Response
{
  "location": {
    "id": 1,
    "name": "Genel Merkez",
    "address": "Maslak Mahallesi, Büyükdere Cd. No: 123, 34398 Şişli/İstanbul",
    "coordinates": {
      "lat": 41.1086,
      "lng": 29.0219
    }
  },
  "directions": {
    "byCarFromAirport": {
      "origin": "İstanbul Havalimanı",
      "duration": "45-60 dakika",
      "distance": "52 km",
      "instructions": "Havalimanından E-5 karayolunu takip ederek Maslak çıkışından inebilirsiniz.",
      "estimatedCost": "150-200 TL (taksi)"
    },
    "byPublicTransport": {
      "options": [
        {
          "type": "metro",
          "route": "M2 Metro Hattı",
          "instructions": "Vezneciler/Şişhane'den M2 hattına binip Maslak istasyonunda inin. 5 dakika yürüyerek ofise ulaşabilirsiniz.",
          "duration": "25-35 dakika",
          "cost": "15 TL"
        },
        {
          "type": "bus",
          "route": "42, 42T, 40, 40T",
          "instructions": "Taksim'den 42 numaralı otobüse binip Maslak durağında inin.",
          "duration": "30-45 dakika",
          "cost": "15 TL"
        }
      ]
    },
    "landmarks": [
      "Istinye Park AVM (2 km)",
      "Vadistanbul AVM (3 km)",
      "Belgrad Ormanı (5 km)"
    ]
  }
}
```

---

## 🎨 Banner & Slider API'ları

### 1. Ana Sayfa Banner'larını Getir
```javascript
GET /banners/public/:language/homepage
X-Tenant-Domain: demo.softellio.com

// Response
{
  "banners": [
    {
      "id": 1,
      "type": "hero",
      "position": "homepage-hero",
      "order": 1,
      "isActive": true,
      "translation": {
        "id": 1,
        "bannerId": 1,
        "language": "tr",
        "title": "Teknolojinin Geleceğini Birlikte Şekillendirelim",
        "subtitle": "İnovatif çözümler ve deneyimli ekibimizle projelerinizi hayata geçirin",
        "description": "15 yıllık deneyimimizle web tasarımından mobil uygulamalara, e-ticaretten yazılım geliştirmeye kadar geniş hizmet yelpazesi sunuyoruz.",
        "buttonText": "Hizmetlerimizi Keşfedin",
        "buttonUrl": "/hizmetlerimiz"
      },
      "backgroundImage": {
        "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banners/hero-bg-desktop.jpg",
        "tablet": "https://res.cloudinary.com/demo/image/upload/v1/banners/hero-bg-tablet.jpg",
        "mobile": "https://res.cloudinary.com/demo/image/upload/v1/banners/hero-bg-mobile.jpg"
      },
      "foregroundImage": "https://res.cloudinary.com/demo/image/upload/v1/banners/hero-illustration.png",
      "videoUrl": null,
      "backgroundColor": "#f8f9fa",
      "textColor": "#2c3e50",
      "buttonColor": "#3498db",
      "overlayOpacity": 0.3,
      "textAlign": "left",
      "animation": "fade-in-up",
      "displayDuration": 8000, // milliseconds
      "autoPlay": true,
      "showDots": true,
      "showArrows": true
    },
    {
      "id": 2,
      "type": "hero",
      "position": "homepage-hero",
      "order": 2,
      "isActive": true,
      "translation": {
        "id": 2,
        "bannerId": 2,
        "language": "tr",
        "title": "Dijital Dönüşümde Güvenilir Partneriniz",
        "subtitle": "Modern teknolojiler kullanarak işletmenizi geleceğe taşıyoruz",
        "description": "Cloud mimarisi, mikroservis yaklaşımı ve agile metodoloji ile scalable çözümler geliştiriyoruz.",
        "buttonText": "Portfolio'muzu İnceleyin",
        "buttonUrl": "/portfolio"
      },
      "backgroundImage": {
        "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banners/digital-bg-desktop.jpg",
        "tablet": "https://res.cloudinary.com/demo/image/upload/v1/banners/digital-bg-tablet.jpg",
        "mobile": "https://res.cloudinary.com/demo/image/upload/v1/banners/digital-bg-mobile.jpg"
      },
      "foregroundImage": "https://res.cloudinary.com/demo/image/upload/v1/banners/digital-illustration.png",
      "backgroundColor": "#2c3e50",
      "textColor": "#ffffff",
      "buttonColor": "#e74c3c",
      "overlayOpacity": 0.5,
      "textAlign": "center",
      "animation": "slide-in-right",
      "displayDuration": 8000,
      "autoPlay": true,
      "showDots": true,
      "showArrows": true
    }
  ],
  "sliderSettings": {
    "autoPlay": true,
    "speed": 500,
    "autoPlaySpeed": 8000,
    "infinite": true,
    "fade": false,
    "dots": true,
    "arrows": true,
    "pauseOnHover": true,
    "pauseOnFocus": true,
    "swipe": true,
    "touchMove": true,
    "accessibility": true
  },
  "totalBanners": 2,
  "language": "tr"
}
```

### 2. Belirli Pozisyondaki Banner'ları Getir
```javascript
GET /banners/public/:language/position/:position
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /banners/public/tr/position/services-cta

// Response
{
  "position": "services-cta",
  "banners": [
    {
      "id": 5,
      "type": "cta",
      "position": "services-cta",
      "order": 1,
      "isActive": true,
      "translation": {
        "title": "Projeleriniz İçin Ücretsiz Danışmanlık",
        "subtitle": "Uzman ekibimiz ile projelerinizi değerlendirin",
        "description": "15 dakikalık ücretsiz danışmanlık seansında projenizin tüm detaylarını konuşalım ve size en uygun çözümü belirleyelim.",
        "buttonText": "Ücretsiz Danışmanlık Al",
        "buttonUrl": "/iletisim?service=consultancy"
      },
      "backgroundImage": {
        "desktop": "https://res.cloudinary.com/demo/image/upload/v1/banners/cta-bg.jpg"
      },
      "backgroundColor": "#3498db",
      "textColor": "#ffffff",
      "buttonColor": "#e74c3c",
      "textAlign": "center",
      "animation": "fade-in",
      "showTimer": false,
      "isCountdown": false
    }
  ],
  "totalBanners": 1
}
```

### 3. Promosyon Banner'larını Getir
```javascript
GET /banners/public/:language/promotions
X-Tenant-Domain: demo.softellio.com

// Response
{
  "promotions": [
    {
      "id": 8,
      "type": "promotion",
      "position": "floating-promo",
      "isActive": true,
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "translation": {
        "title": "Yılsonuna Özel %25 İndirim",
        "subtitle": "Tüm web tasarım paketlerinde",
        "description": "31 Aralık'a kadar geçerli fırsatı kaçırmayın!",
        "buttonText": "Fırsatı Yakala",
        "buttonUrl": "/kampanya/yilsonu-2025",
        "couponCode": "YILSONU25"
      },
      "style": {
        "backgroundColor": "#e74c3c",
        "textColor": "#ffffff",
        "borderColor": "#c0392b",
        "position": "bottom-right",
        "animation": "bounce",
        "closable": true
      },
      "targeting": {
        "showOnPages": ["homepage", "services", "contact"],
        "showToNewVisitors": true,
        "showFrequency": "once-per-day"
      }
    }
  ],
  "totalPromotions": 1
}
```

### 4. Testimoni Slider'ı
```javascript
GET /banners/public/:language/testimonials
X-Tenant-Domain: demo.softellio.com

// Response
{
  "testimonials": [
    {
      "id": 1,
      "clientName": "Ahmet Yılmaz",
      "clientCompany": "ABC Şirketi",
      "clientPosition": "Genel Müdür",
      "content": "Demo Şirketi ile çalışmak harika bir deneyimdi. Profesyonel ekip, zamanında teslimat ve beklentilerimizin çok üzerinde bir sonuç elde ettik.",
      "rating": 5,
      "date": "2025-11-15T00:00:00.000Z",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/testimonials/ahmet-yilmaz.jpg",
      "projectType": "Web Tasarım",
      "isActive": true,
      "isFeatured": true,
      "order": 1
    },
    {
      "id": 2,
      "clientName": "Fatma Demir",
      "clientCompany": "XYZ Girişim",
      "clientPosition": "Kurucu",
      "content": "Mobil uygulamamızı geliştirirken gösterdikleri özveri ve teknik yetkinlik gerçekten takdire şayan. Kesinlikle tavsiye ederim.",
      "rating": 5,
      "date": "2025-10-22T00:00:00.000Z",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/testimonials/fatma-demir.jpg",
      "projectType": "Mobil Uygulama",
      "isActive": true,
      "isFeatured": true,
      "order": 2
    }
  ],
  "sliderSettings": {
    "autoPlay": true,
    "speed": 500,
    "autoPlaySpeed": 6000,
    "infinite": true,
    "slidesToShow": 2,
    "slidesToScroll": 1,
    "responsive": [
      {
        "breakpoint": 768,
        "settings": {
          "slidesToShow": 1
        }
      }
    ]
  },
  "totalTestimonials": 8
}
```

---

## 📊 Analytics & Tracking API'ları

### 1. Sayfa Görüntülenme Kaydet
```javascript
POST /analytics/public/pageview
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "page": "/hizmetlerimiz",
  "title": "Hizmetlerimiz - Demo Şirketi",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "language": "tr",
  "screenResolution": "1920x1080",
  "sessionId": "sess_123456789",
  "userId": null, // anonymous
  "utm": {
    "source": "google",
    "medium": "organic",
    "campaign": null,
    "term": "web tasarım istanbul",
    "content": null
  },
  "timestamp": "2025-12-07T15:30:00.000Z"
}

// Response
{
  "success": true,
  "eventId": "pv_202512071530001",
  "sessionId": "sess_123456789",
  "isNewSession": false,
  "isNewVisitor": true
}
```

### 2. Özel Olay Kaydet
```javascript
POST /analytics/public/event
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "category": "engagement",
  "action": "contact_form_submit",
  "label": "services_page",
  "value": null,
  "page": "/hizmetlerimiz",
  "sessionId": "sess_123456789",
  "metadata": {
    "formType": "quick_contact",
    "service": "web-tasarim",
    "timeOnPage": 120 // seconds
  },
  "timestamp": "2025-12-07T15:35:00.000Z"
}

// Response
{
  "success": true,
  "eventId": "evt_202512071535001"
}
```

### 3. Blog Yazısı Etkileşim
```javascript
POST /analytics/public/blog-interaction
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "action": "view", // view, like, share, comment
  "postId": 1,
  "postSlug": "ilk-blog-yazisi",
  "sessionId": "sess_123456789",
  "readingTime": 245, // seconds spent reading
  "scrollDepth": 85, // percentage
  "source": "direct",
  "timestamp": "2025-12-07T15:40:00.000Z"
}

// Response
{
  "success": true,
  "eventId": "blog_202512071540001",
  "totalViews": 246,
  "totalLikes": 12,
  "avgReadingTime": 4.3 // minutes
}
```

### 4. Hizmet İlgi Kaydet
```javascript
POST /analytics/public/service-interest
X-Tenant-Domain: demo.softellio.com
Content-Type: application/json

// Request
{
  "serviceId": 1,
  "serviceSlug": "web-tasarim",
  "action": "view", // view, inquiry, quote_request
  "sessionId": "sess_123456789",
  "source": "homepage_featured",
  "timeSpent": 180, // seconds
  "interactionData": {
    "viewedGallery": true,
    "viewedTestimonials": true,
    "viewedPricing": false,
    "clickedCTA": false
  },
  "timestamp": "2025-12-07T15:45:00.000Z"
}

// Response
{
  "success": true,
  "eventId": "svc_202512071545001"
}
```

### 5. Popüler İçerik İstatistikleri
```javascript
GET /analytics/public/:language/popular-content
X-Tenant-Domain: demo.softellio.com

// Query Parameters
?timeframe=7d&type=pages&limit=10

// Response
{
  "timeframe": "7d",
  "type": "pages",
  "popularContent": [
    {
      "id": 1,
      "type": "page",
      "title": "Ana Sayfa",
      "url": "/",
      "slug": "ana-sayfa",
      "views": 1245,
      "uniqueViews": 987,
      "avgTimeOnPage": 125, // seconds
      "bounceRate": 0.32,
      "conversionRate": 0.08,
      "trend": "+15%" // compared to previous period
    },
    {
      "id": 2,
      "type": "page",
      "title": "Hizmetlerimiz",
      "url": "/hizmetlerimiz",
      "slug": "hizmetlerimiz",
      "views": 892,
      "uniqueViews": 743,
      "avgTimeOnPage": 185,
      "bounceRate": 0.28,
      "conversionRate": 0.12,
      "trend": "+8%"
    },
    {
      "id": 15,
      "type": "blog",
      "title": "İlk Blog Yazısı",
      "url": "/blog/ilk-blog-yazisi",
      "slug": "ilk-blog-yazisi",
      "views": 567,
      "uniqueViews": 445,
      "avgTimeOnPage": 245,
      "bounceRate": 0.22,
      "conversionRate": 0.05,
      "trend": "+25%"
    }
  ],
  "totalViews": 4892,
  "totalUniqueViews": 3567,
  "averageTimeOnSite": 156,
  "overallBounceRate": 0.29,
  "language": "tr"
}
```

### 6. Arama Trendleri
```javascript
GET /analytics/public/:language/search-trends
X-Tenant-Domain: demo.softellio.com

// Response
{
  "searchTrends": [
    {
      "term": "web tasarım",
      "count": 156,
      "trend": "+12%",
      "relatedPages": [
        "/hizmetlerimiz/web-tasarim",
        "/portfolio/kategori/web-sitesi"
      ]
    },
    {
      "term": "mobil uygulama",
      "count": 89,
      "trend": "+5%",
      "relatedPages": [
        "/hizmetlerimiz/mobil-uygulama"
      ]
    },
    {
      "term": "fiyat listesi",
      "count": 67,
      "trend": "-3%",
      "relatedPages": [
        "/hizmetlerimiz",
        "/iletisim"
      ]
    }
  ],
  "totalSearches": 423,
  "timeframe": "30d",
  "language": "tr"
}
```

---

## 🔍 SEO API'ları

### 1. Sitemap XML
```javascript
GET /seo/public/sitemap.xml
X-Tenant-Domain: demo.softellio.com

// Response (XML format)
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://demo.softellio.com/</loc>
    <lastmod>2025-12-07T19:25:02.340Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="https://demo.softellio.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://demo.softellio.com/en/" />
  </url>
  <url>
    <loc>https://demo.softellio.com/hakkimizda</loc>
    <lastmod>2025-12-07T19:25:02.345Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="https://demo.softellio.com/hakkimizda" />
    <xhtml:link rel="alternate" hreflang="en" href="https://demo.softellio.com/en/about-us" />
  </url>
  <url>
    <loc>https://demo.softellio.com/blog/ilk-blog-yazisi</loc>
    <lastmod>2025-12-07T19:25:02.356Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="https://demo.softellio.com/blog/ilk-blog-yazisi" />
  </url>
</urlset>
```

### 2. Sitemap İndeksi
```javascript
GET /seo/public/sitemapindex.xml
X-Tenant-Domain: demo.softellio.com

// Response (XML format)
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://demo.softellio.com/seo/public/sitemap-pages.xml</loc>
    <lastmod>2025-12-07T19:25:02.340Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://demo.softellio.com/seo/public/sitemap-blog.xml</loc>
    <lastmod>2025-12-07T19:25:02.356Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://demo.softellio.com/seo/public/sitemap-services.xml</loc>
    <lastmod>2025-12-06T15:30:00.000Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://demo.softellio.com/seo/public/sitemap-portfolio.xml</loc>
    <lastmod>2025-11-15T10:00:00.000Z</lastmod>
  </sitemap>
</sitemapindex>
```

### 3. Robots.txt
```javascript
GET /seo/public/robots.txt
X-Tenant-Domain: demo.softellio.com

// Response (Plain text)
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://demo.softellio.com/seo/public/sitemap.xml
Sitemap: https://demo.softellio.com/seo/public/sitemapindex.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
Disallow: /temp/
Disallow: /cache/

# Allow specific resources
Allow: /api/public/
Allow: /assets/
Allow: /images/
Allow: /css/
Allow: /js/

# Crawl-delay
Crawl-delay: 1
```

### 4. Yapılandırılmış Veri (Schema.org)
```javascript
GET /seo/public/:language/structured-data
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /seo/public/tr/structured-data

// Response
{
  "organization": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Demo Şirketi",
    "url": "https://demo.softellio.com",
    "logo": "https://res.cloudinary.com/demo/image/upload/v1/logo.png",
    "description": "Teknoloji çözümleri ve danışmanlık hizmetleri",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Maslak Mahallesi, Büyükdere Cd. No: 123",
      "addressLocality": "Şişli",
      "addressRegion": "İstanbul",
      "postalCode": "34398",
      "addressCountry": "TR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-212-555-0123",
      "contactType": "customer service",
      "email": "info@demo.softellio.com",
      "availableLanguage": ["Turkish", "English"]
    },
    "sameAs": [
      "https://facebook.com/demosirketi",
      "https://twitter.com/demosirketi",
      "https://linkedin.com/company/demosirketi",
      "https://instagram.com/demosirketi"
    ],
    "foundingDate": "2020-01-15",
    "numberOfEmployees": "25",
    "industry": "Information Technology"
  },
  "services": [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Web Tasarım",
      "description": "Modern ve responsive web siteleri tasarlıyoruz",
      "provider": {
        "@type": "Organization",
        "name": "Demo Şirketi"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Turkey"
      },
      "serviceType": "Web Design"
    }
  ],
  "breadcrumbs": {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://demo.softellio.com"
      }
    ]
  }
}
```

### 5. Meta Etiketleri Getir
```javascript
GET /seo/public/:language/meta/:slug
X-Tenant-Domain: demo.softellio.com

// Örnek: GET /seo/public/tr/meta/hakkimizda

// Response
{
  "meta": {
    "title": "Hakkımızda - Demo Şirketi",
    "description": "Demo şirketimiz hakkında detaylı bilgiler",
    "keywords": "demo şirketi, hakkımızda, teknoloji, danışmanlık",
    "author": "Demo Şirketi",
    "robots": "index, follow",
    "canonical": "https://demo.softellio.com/hakkimizda",
    "hreflang": [
      {
        "lang": "tr",
        "url": "https://demo.softellio.com/hakkimizda"
      },
      {
        "lang": "en",
        "url": "https://demo.softellio.com/en/about-us"
      },
      {
        "lang": "x-default",
        "url": "https://demo.softellio.com/hakkimizda"
      }
    ],
    "openGraph": {
      "title": "Hakkımızda - Demo Şirketi",
      "description": "Demo şirketimiz hakkında detaylı bilgiler",
      "image": "https://demo.softellio.com/images/about-og.jpg",
      "url": "https://demo.softellio.com/hakkimizda",
      "type": "website",
      "siteName": "Demo Şirketi",
      "locale": "tr_TR"
    },
    "twitter": {
      "card": "summary_large_image",
      "site": "@demosirketi",
      "title": "Hakkımızda - Demo Şirketi",
      "description": "Demo şirketimiz hakkında detaylı bilgiler",
      "image": "https://demo.softellio.com/images/about-og.jpg"
    },
    "jsonLd": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Hakkımızda",
      "description": "Demo şirketimiz hakkında detaylı bilgiler",
      "mainEntity": {
        "@type": "Organization",
        "name": "Demo Şirketi"
      }
    }
  },
  "lastModified": "2025-12-07T19:25:02.345Z"
}
```

### 6. Search Console Verification
```javascript
GET /seo/public/google-site-verification
X-Tenant-Domain: demo.softellio.com

// Response (HTML)
google-site-verification: google123456789abcdef.html
```

---

## ⚠️ Hata Kodları

### HTTP Status Codes

| Kod | Açıklama | Kullanım Durumu |
|-----|----------|-----------------|
| `200` | OK | İstek başarılı |
| `400` | Bad Request | Geçersiz istek parametreleri |
| `401` | Unauthorized | Kimlik doğrulama gerekli (normalde public API'larda olmaz) |
| `403` | Forbidden | Erişim yasaklı |
| `404` | Not Found | Kaynak bulunamadı |
| `422` | Unprocessable Entity | Geçersiz veri formatı |
| `429` | Too Many Requests | Rate limit aşıldı |
| `500` | Internal Server Error | Sunucu hatası |
| `503` | Service Unavailable | Servis geçici olarak kullanılamıyor |

### Özel Hata Kodları

```javascript
// Error Response Format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Gönderilen veriler geçersiz",
    "details": [
      {
        "field": "email",
        "message": "Geçerli bir e-posta adresi giriniz"
      }
    ],
    "timestamp": "2025-12-07T15:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

#### Yaygın Hata Kodları:

**VALIDATION_ERROR**
- Form validasyon hataları
- Geçersiz parametre değerleri
- Eksik zorunlu alanlar

**RESOURCE_NOT_FOUND**
- Sayfa bulunamadı
- Blog yazısı bulunamadı
- Hizmet bulunamadı

**RATE_LIMIT_EXCEEDED**
- API çağrı limiti aşıldı
- İletişim formu spam koruması

**CONTENT_NOT_AVAILABLE**
- İçerik yayınlanmamış
- İçerik belirtilen dilde mevcut değil

**MAINTENANCE_MODE**
- Site bakım modunda
- Geçici servis kesintisi

### Rate Limiting

```javascript
// Rate Limit Headers
{
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
  "X-RateLimit-Reset": "1625097600",
  "X-RateLimit-Window": "3600"
}

// Rate Limit Exceeded Response
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API çağrı limitini aştınız. Lütfen bir süre bekleyip tekrar deneyin.",
    "retryAfter": 3600
  }
}
```

### CORS Headers

```javascript
// Preflight Response
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Tenant-Domain",
  "Access-Control-Max-Age": "86400"
}
```

---

## 🎯 Sonuç

Bu dokümantasyon Frontend Website geliştirmesi için gerekli tüm public API endpoint'lerini kapsamaktadır. Tüm API'lar:

✅ **Kimlik doğrulama gerektirmez** (Public erişim)
✅ **Multi-language desteği** (tr, en, de)
✅ **SEO optimize edilmiş** yanıt yapıları
✅ **Modern web standartları** ile uyumlu
✅ **Performance odaklı** cache-friendly headers
✅ **Responsive tasarım** destekli medya içerikleri
✅ **Analytics tracking** desteği
✅ **Error handling** ile güvenilir yanıtlar

### 🔗 İlgili Dokümantasyonlar:
1. [Super Admin Panel API'ları](1-super-admin-panel-api.md)
2. [Tenant Admin Panel API'ları](2-tenant-admin-panel-api.md)
3. **[Frontend Website API'ları](3-frontend-website-api.md)** ← Bu doküman

### 📞 Destek:
- **Email**: technical@demo.softellio.com
- **Documentation**: Sürekli güncellenmektedir
- **Last Updated**: 2025-12-07

**NOT**: Bu API dokümantasyonu Demo Şirketi'nin CMS sistemine özeldir ve gerçek proje verilerine dayanmaktadır.