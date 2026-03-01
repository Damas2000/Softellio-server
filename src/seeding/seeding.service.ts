import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedingService {
  constructor(private prisma: PrismaService) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...');

    try {
      // Create templates first (global)
      await this.createTemplates();

      // Create super admin user
      await this.createSuperAdmin();

      // Create demo tenant
      await this.createDemoTenant();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Create clean test tenant for development/testing
   * Can be called independently for testing purposes
   */
  async createTestTenant() {
    console.log('🧪 Creating clean test tenant...');

    try {
      // Check if test tenant already exists
      const existingTenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: 'testprint' },
            { domain: 'testprint.localhost.com' }
          ]
        }
      });

      if (existingTenant) {
        console.log('⚠️  Test tenant already exists, skipping creation');
        return existingTenant;
      }

      // Create test tenant
      const testTenant = await this.prisma.tenant.create({
        data: {
          name: 'TestPrint Solutions',
          slug: 'testprint',
          domain: 'testprint.localhost.com',
          defaultLanguage: 'tr',
          availableLanguages: ['tr', 'en'],
          isActive: true,
          status: 'active',
        }
      });

      console.log(`✅ Test tenant created: ${testTenant.slug}`);

      // Create TenantDomain records
      await this.ensureTenantDomainRecord(testTenant);

      // Create tenant admin
      await this.createTestTenantAdmin(testTenant.id);

      // Initialize test template
      await this.initializeTestTemplate(testTenant.id);

      console.log('✅ Test tenant setup completed successfully!');
      return testTenant;
    } catch (error) {
      console.error('❌ Test tenant creation failed:', error);
      throw error;
    }
  }

  private async createTestTenantAdmin(tenantId: number) {
    console.log('👨‍💼 Creating test tenant admin...');

    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

    const tenantAdmin = await this.prisma.user.create({
      data: {
        name: 'TestPrint Administrator',
        email: 'admin@testprint.com',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId,
        isActive: true,
      },
    });

    console.log(`✅ Test tenant admin created: ${tenantAdmin.email}`);
    return tenantAdmin;
  }

  private async initializeTestTemplate(tenantId: number) {
    console.log('🎨 Initializing test template configuration...');

    // Create TenantSiteConfig
    const siteConfig = await this.prisma.tenantSiteConfig.create({
      data: {
        tenantId,
        templateKey: 'printing-premium-v1',
        branding: {
          logoUrl: 'https://via.placeholder.com/200x80/059669/FFFFFF?text=TESTPRINT',
          faviconUrl: 'https://via.placeholder.com/32x32/059669/FFFFFF?text=T',
          primaryColor: '#059669',
          secondaryColor: '#10B981',
          fontFamily: 'Inter, sans-serif'
        },
        navigation: [
          {
            label: 'Ana Sayfa',
            href: '/',
            order: 1,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Hizmetler',
            href: '/services',
            order: 2,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'İletişim',
            href: '/contact',
            order: 3,
            isCTA: true,
            isExternal: false
          }
        ],
        footer: {
          columns: [
            {
              title: 'Hizmetler',
              links: [
                { label: 'Dijital Baskı', url: '/services/dijital' },
                { label: 'Tasarım', url: '/services/tasarim' }
              ]
            }
          ],
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/testprint', label: 'Facebook' }
          ],
          copyrightText: '© 2026 TestPrint Solutions. Tüm hakları saklıdır.'
        },
        seoDefaults: {
          metaTitle: 'TestPrint Solutions - Test Baskı Sitesi',
          metaDescription: 'Test amaçlı baskı sitesi.',
          ogImage: 'https://via.placeholder.com/1200x630/059669/FFFFFF?text=TestPrint',
          twitterCard: 'summary_large_image'
        }
      }
    });

    // Create HOME DynamicPage
    const homepage = await this.prisma.dynamicPage.create({
      data: {
        tenantId,
        slug: '/',
        title: 'Ana Sayfa',
        layoutKey: 'HOME',
        pageType: 'HOME',
        published: true,
        publishedAt: new Date(),
        language: 'tr',
        seo: {
          metaTitle: 'TestPrint Solutions - Ana Sayfa',
          metaDescription: 'Test baskı sitesi ana sayfa.',
          ogTitle: 'TestPrint Solutions',
          ogDescription: 'Test amaçlı site.',
          ogImage: 'https://via.placeholder.com/1200x630/059669/FFFFFF?text=TestPrint'
        }
      }
    });

    console.log('✅ Test homepage DynamicPage created');

    // Initialize CMS layout for test homepage with deterministic sections
    await this.initializeTestCmsLayout(tenantId);

    return siteConfig;
  }

  private async initializeTestCmsLayout(tenantId: number) {
    console.log('🎨 Initializing test CMS layout with 4 deterministic sections...');

    // Create the layout
    const layout = await this.prisma.pageLayout.create({
      data: {
        tenantId,
        key: 'HOME',
        language: 'tr',
        status: 'published'
      }
    });

    // Create exactly 4 sections as specified
    const sectionsData = [
      {
        type: 'hero',
        variant: 'premium',
        order: 1,
        propsJson: {
          title: 'TestPrint Solutions',
          subtitle: 'Test amaçlı baskı sitesi',
          description: 'Portal ve site uyumluluğunu test etmek için oluşturulan temiz test ortamı.',
          buttonText: 'Test Et',
          buttonUrl: '/contact',
          backgroundColor: '#059669'
        }
      },
      {
        type: 'services',
        variant: 'premium',
        order: 2,
        propsJson: {
          title: 'Test Hizmetleri',
          subtitle: 'Test amaçlı hizmet listesi',
          services: [
            { title: 'Test Service 1', description: 'İlk test hizmeti', icon: '🔧' },
            { title: 'Test Service 2', description: 'İkinci test hizmeti', icon: '⚙️' }
          ]
        }
      },
      {
        type: 'testimonials',
        variant: 'premium',
        order: 3,
        propsJson: {
          title: 'Test Yorumları',
          subtitle: 'Test müşteri yorumları',
          testimonials: [
            {
              name: 'Test Kullanıcı 1',
              company: 'Test Şirketi',
              text: 'Test amaçlı yorum metni.',
              rating: 5
            }
          ]
        }
      },
      {
        type: 'cta',
        variant: 'premium',
        order: 4,
        propsJson: {
          title: 'Test CTA',
          description: 'Test amaçlı çağrı-eylem bölümü.',
          ctaText: 'Test Başlat',
          ctaUrl: '/contact',
          backgroundColor: '#059669'
        }
      }
    ];

    // Create all sections
    for (const sectionData of sectionsData) {
      await this.prisma.pageSection.create({
        data: {
          tenantId,
          layoutId: layout.id,
          type: sectionData.type,
          variant: sectionData.variant,
          order: sectionData.order,
          isEnabled: true,
          status: 'published',
          propsJson: sectionData.propsJson
        }
      });
    }

    console.log(`✅ Created ${sectionsData.length} test sections: ${sectionsData.map(s => s.type).join(', ')}`);
    return layout;
  }

  private async createSuperAdmin() {
    console.log('👤 Creating super admin user...');

    // Check if super admin already exists
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: Role.SUPER_ADMIN },
    });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists, skipping...');
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = await this.prisma.user.create({
      data: {
        name: 'Super Administrator',
        email: 'admin@softellio.com',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log(`✅ Super admin created: ${superAdmin.email}`);
    return superAdmin;
  }

  private async createDemoTenant() {
    console.log('🏢 Creating demo tenant...');

    // Check if demo tenant already exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { domain: 'demo.softellio.com' },
    });

    if (existingTenant) {
      console.log('⚠️  Demo tenant already exists, ensuring production-correct configuration...');

      // PRODUCTION FIX: Ensure existing tenant has correct slug and TenantDomain record
      let needsUpdate = false;
      const updateData: any = {};

      if (existingTenant.slug !== 'demo') {
        console.log('🔧  Updating tenant slug to "demo" for domain resolution...');
        updateData.slug = 'demo';
        needsUpdate = true;
      }

      if (existingTenant.status !== 'active') {
        console.log('🔧  Updating tenant status to "active"...');
        updateData.status = 'active';
        needsUpdate = true;
      }

      if (!existingTenant.isActive) {
        console.log('🔧  Activating tenant...');
        updateData.isActive = true;
        needsUpdate = true;
      }

      let tenant = existingTenant;
      if (needsUpdate) {
        tenant = await this.prisma.tenant.update({
          where: { id: existingTenant.id },
          data: updateData
        });
        console.log('✅  Demo tenant configuration updated successfully');
      }

      // PRODUCTION-CRITICAL: Ensure TenantDomain record exists for reliable resolution
      await this.ensureTenantDomainRecord(tenant);

      return tenant;
    }

    // Create demo tenant
    const demoTenant = await this.prisma.tenant.create({
      data: {
        name: 'Demo Company',
        slug: 'demo', // CRITICAL: Explicit slug for domain resolution Step 3
        domain: 'demo.softellio.com',
        defaultLanguage: 'tr',
        availableLanguages: ['tr', 'en'],
        isActive: true,
        status: 'active', // Explicit status for domain resolution queries
      },
    });

    console.log(`✅ Demo tenant created: ${demoTenant.name} (slug: ${demoTenant.slug})`);

    // PRODUCTION-CRITICAL: Create TenantDomain record for reliable domain resolution
    await this.ensureTenantDomainRecord(demoTenant);

    // Create tenant admin for demo tenant
    await this.createTenantAdmin(demoTenant.id);

    // Initialize template for demo tenant
    await this.initializeDemoTemplate(demoTenant.id);

    // Create demo content for tenant
    await this.createDemoContent(demoTenant.id);

    return demoTenant;
  }

  private async createTenantAdmin(tenantId: number) {
    console.log('👨‍💼 Creating tenant admin...');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    const tenantAdmin = await this.prisma.user.create({
      data: {
        name: 'Tenant Administrator',
        email: 'demo@softellio.com',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId,
        isActive: true,
      },
    });

    console.log(`✅ Tenant admin created: ${tenantAdmin.email}`);
    return tenantAdmin;
  }

  private async initializeDemoTemplate(tenantId: number) {
    console.log('🎨 Initializing demo template configuration...');

    // Check if site config already exists
    const existingConfig = await this.prisma.tenantSiteConfig.findUnique({
      where: { tenantId },
    });

    if (existingConfig) {
      console.log('⚠️  Template site config already exists, skipping...');
      return existingConfig;
    }

    // Create TenantSiteConfig
    const siteConfig = await this.prisma.tenantSiteConfig.create({
      data: {
        tenantId,
        templateKey: 'printing-premium-v1',
        branding: {
          logoUrl: 'https://via.placeholder.com/200x80/1E40AF/FFFFFF?text=DEMO+LOGO',
          faviconUrl: 'https://via.placeholder.com/32x32/1E40AF/FFFFFF?text=D',
          primaryColor: '#1E40AF',
          secondaryColor: '#3B82F6',
          fontFamily: 'Inter, sans-serif'
        },
        navigation: [
          {
            label: 'Ana Sayfa',
            href: '/',
            order: 1,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Hizmetlerimiz',
            href: '/services',
            order: 2,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Portföy',
            href: '/portfolio',
            order: 3,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Hakkımızda',
            href: '/about',
            order: 4,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'İletişim',
            href: '/contact',
            order: 5,
            isCTA: true,
            isExternal: false
          }
        ],
        footer: {
          columns: [
            {
              title: 'Hizmetlerimiz',
              links: [
                { label: 'Branda & Afiş', url: '/services/branda-afis' },
                { label: 'Tabela Sistemleri', url: '/services/tabela' },
                { label: 'Araç Giydirme', url: '/services/arac-giydirme' },
                { label: 'Dijital Baskı', url: '/services/dijital-baski' }
              ]
            },
            {
              title: 'Kurumsal',
              links: [
                { label: 'Hakkımızda', url: '/about' },
                { label: 'Referanslar', url: '/portfolio' },
                { label: 'Kalite Politikası', url: '/quality' },
                { label: 'İletişim', url: '/contact' }
              ]
            },
            {
              title: 'Destek',
              links: [
                { label: 'Sıkça Sorulan Sorular', url: '/faq' },
                { label: 'Garanti Koşulları', url: '/warranty' },
                { label: 'Kargo & Teslimat', url: '/shipping' },
                { label: 'İade Şartları', url: '/returns' }
              ]
            }
          ],
          socialLinks: [
            {
              platform: 'facebook',
              url: 'https://facebook.com/demo-company',
              label: 'Facebook\'ta takip edin'
            },
            {
              platform: 'instagram',
              url: 'https://instagram.com/demo-company',
              label: 'Instagram\'da takip edin'
            },
            {
              platform: 'linkedin',
              url: 'https://linkedin.com/company/demo-company',
              label: 'LinkedIn\'de takip edin'
            }
          ],
          copyrightText: '© 2024 Demo Baskı Şirketi. Tüm hakları saklıdır.'
        },
        seoDefaults: {
          metaTitle: 'Demo Baskı Şirketi - Profesyonel Baskı Çözümleri',
          metaDescription: 'Branda, afiş, tabela ve dijital baskı alanında profesyonel çözümler sunan Demo Baskı Şirketi ile tanışın.',
          ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Demo+Baski+Sirketi',
          twitterCard: 'summary_large_image'
        }
      }
    });

    // Create HOME DynamicPage
    const existingHomePage = await this.prisma.dynamicPage.findFirst({
      where: { tenantId, slug: '/' },
    });

    if (!existingHomePage) {
      await this.prisma.dynamicPage.create({
        data: {
          tenantId,
          slug: '/',
          title: 'Ana Sayfa',
          layoutKey: 'HOME',
          pageType: 'HOME',
          published: true,
          publishedAt: new Date(),
          language: 'tr',
          seo: {
            metaTitle: 'Demo Baskı Şirketi - Branda, Afiş, Tabela',
            metaDescription: 'Profesyonel baskı çözümleri ile işinizi büyütün. Branda, afiş, tabela ve dijital baskı hizmetlerimiz ile tanışın.',
            ogTitle: 'Demo Baskı Şirketi - Ana Sayfa',
            ogDescription: 'Profesyonel baskı çözümleri ile işinizi büyütün.',
            ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Ana+Sayfa'
          }
        }
      });

      console.log('✅ Homepage DynamicPage created');

      // Initialize CMS layout for homepage with template sections
      await this.initializeCmsLayoutForHomepage(tenantId, 'printing-premium-v1');
    }

    console.log('✅ Demo template initialized');
    return siteConfig;
  }

  private async createDemoContent(tenantId: number) {
    console.log('📄 Creating demo content...');

    // Create site settings
    await this.createDemoSiteSettings(tenantId);

    // Create demo pages
    await this.createDemoPages(tenantId);

    // Create demo blog categories
    await this.createDemoBlogCategories(tenantId);

    // Create demo blog posts
    await this.createDemoBlogPosts(tenantId);

    // Create demo menu
    await this.createDemoMenu(tenantId);
  }

  private async createDemoSiteSettings(tenantId: number) {
    const existingSettings = await this.prisma.siteSetting.findUnique({
      where: { tenantId },
    });

    if (existingSettings) {
      console.log('⚠️  Site settings already exist, skipping...');
      return;
    }

    const siteSettings = await this.prisma.siteSetting.create({
      data: {
        tenantId,
        translations: {
          create: [
            {
              language: 'tr',
              siteName: 'Demo Şirketi',
              siteDescription: 'Bu bir demo web sitesidir',
              seoMetaTitle: 'Demo Şirketi - Ana Sayfa',
              seoMetaDescription: 'Demo şirketimizin resmi web sitesine hoş geldiniz',
            },
            {
              language: 'en',
              siteName: 'Demo Company',
              siteDescription: 'This is a demo website',
              seoMetaTitle: 'Demo Company - Home Page',
              seoMetaDescription: 'Welcome to our demo company official website',
            },
          ],
        },
      },
    });

    console.log('✅ Demo site settings created');
    return siteSettings;
  }

  private async createDemoPages(tenantId: number) {
    const pages = [
      {
        status: 'published',
        translations: [
          {
            language: 'tr',
            title: 'Ana Sayfa',
            slug: 'ana-sayfa',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'Hoş Geldiniz', level: 1 } },
                { type: 'paragraph', data: { text: 'Bu demo web sitesinin ana sayfasıdır.' } }
              ]
            },
            metaTitle: 'Ana Sayfa - Demo Şirketi',
            metaDescription: 'Demo şirketimizin ana sayfası',
          },
          {
            language: 'en',
            title: 'Home Page',
            slug: 'home',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'Welcome', level: 1 } },
                { type: 'paragraph', data: { text: 'This is the home page of the demo website.' } }
              ]
            },
            metaTitle: 'Home Page - Demo Company',
            metaDescription: 'Home page of our demo company',
          },
        ],
      },
      {
        status: 'published',
        translations: [
          {
            language: 'tr',
            title: 'Hakkımızda',
            slug: 'hakkimizda',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'Hakkımızda', level: 1 } },
                { type: 'paragraph', data: { text: 'Bu demo şirketin hakkında bilgiler.' } }
              ]
            },
            metaTitle: 'Hakkımızda - Demo Şirketi',
            metaDescription: 'Demo şirketimiz hakkında bilgiler',
          },
          {
            language: 'en',
            title: 'About Us',
            slug: 'about',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'About Us', level: 1 } },
                { type: 'paragraph', data: { text: 'Information about this demo company.' } }
              ]
            },
            metaTitle: 'About Us - Demo Company',
            metaDescription: 'Information about our demo company',
          },
        ],
      },
    ];

    for (const pageData of pages) {
      // Check if a page with this translation already exists
      const existingPage = await this.prisma.page.findFirst({
        where: {
          tenantId,
          translations: {
            some: {
              slug: pageData.translations[0].slug
            }
          }
        },
      });

      if (!existingPage) {
        await this.prisma.page.create({
          data: {
            tenantId,
            status: pageData.status,
            translations: {
              create: pageData.translations,
            },
          },
        });
      }
    }

    console.log('✅ Demo pages created');
  }

  private async createDemoBlogCategories(tenantId: number) {
    const categories = [
      {
        translations: [
          {
            language: 'tr',
            name: 'Teknoloji',
            slug: 'teknoloji',
          },
          {
            language: 'en',
            name: 'Technology',
            slug: 'technology',
          },
        ],
      },
      {
        translations: [
          {
            language: 'tr',
            name: 'İş Dünyası',
            slug: 'is-dunyasi',
          },
          {
            language: 'en',
            name: 'Business',
            slug: 'business',
          },
        ],
      },
    ];

    for (const categoryData of categories) {
      const existingCategory = await this.prisma.blogCategory.findFirst({
        where: {
          tenantId,
          translations: {
            some: {
              slug: categoryData.translations[0].slug
            }
          }
        },
      });

      if (!existingCategory) {
        await this.prisma.blogCategory.create({
          data: {
            tenantId,
            translations: {
              create: categoryData.translations,
            },
          },
        });
      }
    }

    console.log('✅ Demo blog categories created');
  }

  private async createDemoBlogPosts(tenantId: number) {
    // Get the technology category
    const techCategory = await this.prisma.blogCategory.findFirst({
      where: {
        tenantId,
        translations: {
          some: {
            slug: 'teknoloji'
          }
        }
      },
    });

    if (!techCategory) return;

    const posts = [
      {
        isPublished: true,
        categoryId: techCategory.id,
        translations: [
          {
            language: 'tr',
            title: 'Yapay Zekanın Geleceği',
            slug: 'yapay-zeka-gelecegi',
            summary: 'Yapay zeka teknolojisinin gelecekte neler getireceğini keşfedin.',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'Yapay Zekanın Geleceği', level: 1 } },
                { type: 'paragraph', data: { text: 'Yapay zeka teknolojisi hızla gelişiyor ve günlük yaşamımızda daha fazla yer alıyor. Gelecekte bizi neler bekliyor?' } },
                { type: 'paragraph', data: { text: 'Bu yazıda yapay zekanın potansiyel uygulamalarını ve etkilerini inceliyoruz.' } }
              ]
            },
            metaTitle: 'Yapay Zekanın Geleceği',
            metaDescription: 'Yapay zeka teknolojisinin gelecekteki potansiyeli',
          },
          {
            language: 'en',
            title: 'The Future of Artificial Intelligence',
            slug: 'future-of-ai',
            summary: 'Discover what artificial intelligence technology will bring in the future.',
            contentJson: {
              blocks: [
                { type: 'header', data: { text: 'The Future of Artificial Intelligence', level: 1 } },
                { type: 'paragraph', data: { text: 'AI technology is rapidly evolving and taking a bigger role in our daily lives. What awaits us in the future?' } },
                { type: 'paragraph', data: { text: 'In this article, we explore the potential applications and impacts of artificial intelligence.' } }
              ]
            },
            metaTitle: 'The Future of Artificial Intelligence',
            metaDescription: 'The future potential of artificial intelligence technology',
          },
        ],
      },
    ];

    for (const postData of posts) {
      const existingPost = await this.prisma.blogPost.findFirst({
        where: {
          tenantId,
          translations: {
            some: {
              slug: postData.translations[0].slug
            }
          }
        },
      });

      if (!existingPost) {
        await this.prisma.blogPost.create({
          data: {
            tenantId,
            isPublished: postData.isPublished,
            categoryId: postData.categoryId,
            publishedAt: postData.isPublished ? new Date() : null,
            translations: {
              create: postData.translations,
            },
          },
        });
      }
    }

    console.log('✅ Demo blog posts created');
  }

  private async createDemoMenu(tenantId: number) {
    // First, create or get the main menu
    let mainMenu = await this.prisma.menu.findFirst({
      where: { tenantId, key: 'main-menu' },
    });

    if (!mainMenu) {
      mainMenu = await this.prisma.menu.create({
        data: {
          tenantId,
          key: 'main-menu',
        },
      });
    }

    const menuItems = [
      {
        externalUrl: '/',
        order: 1,
        translations: [
          { language: 'tr', label: 'Ana Sayfa' },
          { language: 'en', label: 'Home' },
        ],
      },
      {
        externalUrl: '/hakkimizda',
        order: 2,
        translations: [
          { language: 'tr', label: 'Hakkımızda' },
          { language: 'en', label: 'About Us' },
        ],
      },
      {
        externalUrl: '/blog',
        order: 3,
        translations: [
          { language: 'tr', label: 'Blog' },
          { language: 'en', label: 'Blog' },
        ],
      },
    ];

    for (const itemData of menuItems) {
      const existingItem = await this.prisma.menuItem.findFirst({
        where: {
          tenantId,
          menuId: mainMenu.id,
          externalUrl: itemData.externalUrl,
        },
      });

      if (!existingItem) {
        await this.prisma.menuItem.create({
          data: {
            tenantId,
            menuId: mainMenu.id,
            externalUrl: itemData.externalUrl,
            order: itemData.order,
            translations: {
              create: itemData.translations,
            },
          },
        });
      }
    }

    console.log('✅ Demo menu created');
  }

  private async createTemplates() {
    console.log('🎨 Creating templates...');

    // Check if printing template already exists
    const existingTemplate = await this.prisma.template.findUnique({
      where: { key: 'printing-premium-v1' },
    });

    if (existingTemplate) {
      console.log('⚠️  Template printing-premium-v1 already exists, skipping...');
      return existingTemplate;
    }

    // Create printing-premium-v1 template
    const printingTemplate = await this.prisma.template.create({
      data: {
        key: 'printing-premium-v1',
        name: 'Premium Printing Template',
        description: 'Modern template for printing companies with hero, services, portfolio, testimonials and contact sections',
        version: '1.0.0',
        previewImage: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Printing+Premium',
        // Legacy format - kept for backward compatibility
        // New structured format would be:
        // [
        //   { type: 'hero', variants: ['premium'], defaultVariant: 'premium' },
        //   { type: 'services', variants: ['premium'], defaultVariant: 'premium' },
        //   // ... etc
        // ]
        supportedSections: [
          'hero:premium',
          'services:premium',
          'portfolio:premium',
          'process:premium',
          'testimonials:premium',
          'cta:premium'
        ],
        defaultLayout: {
          sections: [
            {
              type: 'hero',
              variant: 'premium',
              order: 1,
              enabled: true,
              propsJson: {
                title: 'Branda • Afiş • Tabela',
                subtitle: 'Profesyonel baskı çözümleri ile işinizi büyütün',
                description: 'Modern teknoloji ve kaliteli malzemelerle, sizin için en iyi baskı ürünlerini üretiyoruz.',
                ctaText: 'Hemen Teklif Alın',
                ctaUrl: '/contact',
                backgroundImage: 'https://via.placeholder.com/1920x1080/1E40AF/FFFFFF?text=Hero+Background',
                features: [
                  'Hızlı Teslimat',
                  'Kaliteli Malzeme',
                  '7/24 Destek'
                ]
              }
            },
            {
              type: 'services',
              variant: 'premium',
              order: 2,
              enabled: true,
              propsJson: {
                title: 'Hizmetlerimiz',
                subtitle: 'Geniş ürün yelpazemiz ile tüm ihtiyaçlarınıza cevap veriyoruz',
                services: [
                  {
                    title: 'Branda & Afiş',
                    description: 'Dayanıklı ve kaliteli branda, afiş çözümleri',
                    icon: '📢',
                    features: ['Dijital Baskı', 'UV Dayanımlı', '2 Yıl Garanti']
                  },
                  {
                    title: 'Tabela Sistemleri',
                    description: 'LED, neon ve klasik tabela çeşitleri',
                    icon: '💡',
                    features: ['LED Aydınlatma', 'Şık Tasarım', 'Uzun Ömürlü']
                  },
                  {
                    title: 'Promosyon Ürünleri',
                    description: 'Katalog, broşür, kartvizit ve daha fazlası',
                    icon: '📋',
                    features: ['Özel Tasarım', 'Hızlı Üretim', 'Uygun Fiyat']
                  },
                  {
                    title: 'Araç Giydirme',
                    description: 'Araç reklam kaplama ve folyo uygulamaları',
                    icon: '🚗',
                    features: ['3M Folyo', 'Profesyonel Uygulama', '5 Yıl Garanti']
                  },
                  {
                    title: 'Dijital Baskı',
                    description: 'Yüksek çözünürlükte dijital baskı hizmetleri',
                    icon: '🖨️',
                    features: ['4K Kalite', '24 Saat Üretim', 'Geniş Format']
                  },
                  {
                    title: 'Özel Projeler',
                    description: 'İhtiyaçlarınıza özel tasarım ve üretim',
                    icon: '⭐',
                    features: ['Özel Tasarım', 'Danışmanlık', 'Kurulum Hizmeti']
                  }
                ]
              }
            },
            {
              type: 'testimonials',
              variant: 'premium',
              order: 3,
              enabled: true,
              propsJson: {
                title: 'Müşterilerimiz Ne Diyor?',
                subtitle: 'Kaliteli hizmetimizden memnun olan müşterilerimizin değerlendirmeleri',
                testimonials: [
                  {
                    name: 'Ahmet Yılmaz',
                    title: 'Restaurant Sahibi',
                    content: 'Restoranum için yaptırdığım tabela harika oldu. Hem kaliteli hem de çok şık. Kesinlikle tavsiye ederim.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=AY'
                  },
                  {
                    name: 'Fatma Kaya',
                    title: 'Mağaza Sahibi',
                    content: 'Mağazam için yaptırdığım branda ve afiş çok dayanıklı çıktı. 2 yıldır hiç problemi yok.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=FK'
                  },
                  {
                    name: 'Mehmet Demir',
                    title: 'Şirket Sahibi',
                    content: 'Araç giydirme işlemini çok profesyonel şekilde yaptılar. Fiyat performans olarak mükemmel.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=MD'
                  },
                  {
                    name: 'Ayşe Çelik',
                    title: 'Kuaför Sahibi',
                    content: 'LED tabela sayesinde müşteri sayım arttı. Çok beğeniyorlar ve dikkat çekiyor.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=AÇ'
                  },
                  {
                    name: 'Can Özkan',
                    title: 'Emlak Uzmanı',
                    content: 'Kartvizit ve broşürlerim çok kaliteli çıktı. Tasarım desteği de harikaydy.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=CÖ'
                  },
                  {
                    name: 'Sevil Yıldız',
                    title: 'Cafe Sahibi',
                    content: 'Cafe\'m için yaptırdığım tüm baskı ürünleri çok başarılı. Fiyatlar da çok uygun.',
                    rating: 5,
                    image: 'https://via.placeholder.com/150x150/06B6D4/FFFFFF?text=SY'
                  }
                ]
              }
            },
            {
              type: 'cta',
              variant: 'premium',
              order: 4,
              enabled: true,
              propsJson: {
                title: 'Projeniz İçin Hemen Teklif Alın',
                description: 'Uzman ekibimiz projeniz için en uygun çözümü sunmaya hazır. Ücretsiz keşif ve detaylı teklif için hemen iletişime geçin.',
                ctaText: 'Ücretsiz Teklif Al',
                ctaUrl: '/contact',
                secondaryCtaText: 'WhatsApp ile İletişim',
                secondaryCtaUrl: 'https://wa.me/905551234567',
                features: [
                  'Ücretsiz keşif ve ölçüm',
                  'Detaylı teklif raporu',
                  '24 saat içinde geri dönüş',
                  'Profesyonel tasarım desteği'
                ],
                backgroundColor: '#1E40AF'
              }
            }
          ]
        },
        isActive: true
      }
    });

    console.log(`✅ Template created: ${printingTemplate.name}`);
    return printingTemplate;
  }

  /**
   * Initialize CMS layout for homepage with template sections
   */
  private async initializeCmsLayoutForHomepage(tenantId: number, templateKey: string) {
    console.log('🎨 Initializing CMS layout for homepage...');

    // Check if homepage layout already exists
    const existingLayout = await this.prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'HOME',
          language: 'tr'
        }
      },
      include: {
        sections: true
      }
    });

    if (existingLayout && existingLayout.sections.length > 0) {
      console.log('⚠️  Homepage layout with sections already exists, skipping...');
      return existingLayout;
    }

    // Get template with default layout
    const template = await this.prisma.template.findUnique({
      where: { key: templateKey },
      select: { defaultLayout: true }
    });

    if (!template || !template.defaultLayout || !(template.defaultLayout as any).sections) {
      console.warn(`⚠️  No template default layout found for ${templateKey}`);
      return;
    }

    const defaultSections = (template.defaultLayout as any).sections;

    // Create or get homepage layout
    const layout = await this.prisma.pageLayout.upsert({
      where: {
        tenantId_key_language: {
          tenantId,
          key: 'HOME',
          language: 'tr'
        }
      },
      update: {},
      create: {
        tenantId,
        key: 'HOME',
        language: 'tr',
        status: 'published'
      }
    });

    // Create sections from template
    const sectionsToCreate = defaultSections.map((section: any, index: number) => ({
      tenantId,
      layoutId: layout.id,
      type: section.type,
      variant: section.variant,
      order: section.order || (index + 1),
      isEnabled: section.enabled ?? true,
      propsJson: section.propsJson || {},
      status: 'published'
    }));

    // Delete existing sections if any
    await this.prisma.pageSection.deleteMany({
      where: { layoutId: layout.id }
    });

    // Create new sections
    await this.prisma.pageSection.createMany({
      data: sectionsToCreate
    });

    console.log(`✅ Created ${sectionsToCreate.length} sections for homepage layout`);
    return layout;
  }

  async clearDatabase() {
    console.log('🗑️  Clearing database...');

    // Delete in reverse order of dependencies
    await this.prisma.menuItemTranslation.deleteMany();
    await this.prisma.menuItem.deleteMany();
    await this.prisma.blogPostTranslation.deleteMany();
    await this.prisma.blogPost.deleteMany();
    await this.prisma.blogCategoryTranslation.deleteMany();
    await this.prisma.blogCategory.deleteMany();
    await this.prisma.pageTranslation.deleteMany();
    await this.prisma.page.deleteMany();
    await this.prisma.siteSettingTranslation.deleteMany();
    await this.prisma.siteSetting.deleteMany();
    await this.prisma.media.deleteMany();

    // Template system tables
    await this.prisma.pageSection.deleteMany();
    await this.prisma.pageLayout.deleteMany();
    await this.prisma.dynamicPage.deleteMany();
    await this.prisma.tenantSiteConfig.deleteMany();

    await this.prisma.user.deleteMany();
    await this.prisma.tenant.deleteMany();

    // Global templates (last)
    await this.prisma.template.deleteMany();

    console.log('✅ Database cleared');
  }

  /**
   * PRODUCTION-CRITICAL: Ensure TenantDomain record exists for reliable domain resolution
   * This is the SINGLE SOURCE OF TRUTH for production tenant resolution
   */
  private async ensureTenantDomainRecord(tenant: any) {
    console.log('🌐 Ensuring TenantDomain record for production-reliable resolution...');

    // Determine the correct domain based on environment
    const domain = process.env.NODE_ENV === 'production'
      ? tenant.domain  // e.g., "demo.softellio.com"
      : tenant.domain; // Keep same for dev/staging consistency

    // Check if TenantDomain record already exists
    const existingDomain = await this.prisma.tenantDomain.findFirst({
      where: {
        domain: domain,
        tenantId: tenant.id
      }
    });

    if (existingDomain) {
      console.log(`✅ TenantDomain record already exists: ${domain} -> tenant ${tenant.slug} (${tenant.id})`);

      // Ensure it's configured correctly
      if (!existingDomain.isActive || !existingDomain.isPrimary) {
        console.log('🔧 Updating TenantDomain record configuration...');
        await this.prisma.tenantDomain.update({
          where: { id: existingDomain.id },
          data: {
            isActive: true,
            isPrimary: true, // Make it the primary domain for reliable resolution
            isVerified: true // Skip verification in demo/dev
          }
        });
        console.log('✅ TenantDomain record updated');
      }

      return existingDomain;
    }

    // Create new TenantDomain record for production-reliable resolution
    console.log(`🔧 Creating TenantDomain record: ${domain} -> tenant ${tenant.slug} (${tenant.id})`);

    const tenantDomain = await this.prisma.tenantDomain.create({
      data: {
        tenantId: tenant.id,
        domain: domain,
        type: 'CUSTOM', // or 'SUBDOMAIN' - both work
        isPrimary: true, // CRITICAL: Make this the primary domain
        isActive: true,
        isVerified: true, // Skip verification for demo/internal domains
        verificationToken: `softellio-demo-${Date.now()}`,
        verifiedAt: new Date(),
        sslStatus: 'ACTIVE' // Assume SSL is handled by platform
      }
    });

    console.log(`✅ TenantDomain record created: ${domain} -> tenant ${tenant.slug} (${tenant.id})`);
    console.log('🎯 Production domain resolution will now work reliably via TenantDomain table');

    return tenantDomain;
  }
}