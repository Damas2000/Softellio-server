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
      console.log('⚠️  Demo tenant already exists, skipping...');
      return existingTenant;
    }

    // Create demo tenant
    const demoTenant = await this.prisma.tenant.create({
      data: {
        name: 'Demo Company',
        domain: 'demo.softellio.com',
        defaultLanguage: 'tr',
        availableLanguages: ['tr', 'en'],
        isActive: true,
      },
    });

    console.log(`✅ Demo tenant created: ${demoTenant.name}`);

    // Create tenant admin for demo tenant
    await this.createTenantAdmin(demoTenant.id);

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
    await this.prisma.user.deleteMany();
    await this.prisma.tenant.deleteMany();

    console.log('✅ Database cleared');
  }
}