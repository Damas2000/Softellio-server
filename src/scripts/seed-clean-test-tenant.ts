import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';
import { DomainResolverService } from '../common/services/domain-resolver.service';
import * as bcrypt from 'bcrypt';

/**
 * CLEAN TEST TENANT SEEDING SCRIPT
 *
 * Creates a fresh, deterministic test tenant to validate portal+site alignment.
 * Avoids any data corruption issues from the demo tenant.
 *
 * Creates:
 * - Tenant: testprint (slug: testprint)
 * - Domain: testprint.localhost.com (dev) + testprint.softellio.com (optional)
 * - Admin User: admin@testprint.com / ChangeMe123!
 * - Homepage with exactly 4 sections: hero, services, testimonials, cta
 * - Published and ready for testing
 *
 * Run with: npx ts-node src/scripts/seed-clean-test-tenant.ts
 */

interface CleanTenantResult {
  success: boolean;
  tenant?: {
    id: number;
    slug: string;
    domain: string;
  };
  admin?: {
    email: string;
    password: string;
  };
  homepage?: {
    id: string;
    slug: string;
    layoutKey: string;
    published: boolean;
    sectionsCount: number;
  };
  verification?: {
    localUrl: string;
    prodUrl?: string;
    apiEndpoint: string;
  };
  error?: string;
}

async function createCleanTestTenant(): Promise<CleanTenantResult> {
  console.log('🧪 CLEAN TEST TENANT: Creating fresh tenant for portal+site testing...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);
    const domainResolver = app.get(DomainResolverService);

    // ===========================================
    // STEP 1: Clean existing test tenant (if any)
    // ===========================================
    console.log('📍 STEP 1: Cleaning existing test tenant...');

    // Check if test tenant already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: 'testprint' },
          { domain: 'testprint.localhost.com' }
        ]
      }
    });

    if (existingTenant) {
      console.log(`⚠️  Test tenant already exists (ID: ${existingTenant.id}), cleaning up...`);

      // Clean up existing data
      await prisma.$transaction(async (tx) => {
        // Delete sections first (foreign key constraints)
        await tx.pageSection.deleteMany({
          where: { layout: { tenantId: existingTenant.id } }
        });

        // Delete layouts
        await tx.pageLayout.deleteMany({
          where: { tenantId: existingTenant.id }
        });

        // Delete pages
        await tx.dynamicPage.deleteMany({
          where: { tenantId: existingTenant.id }
        });

        // Delete site config
        await tx.tenantSiteConfig.deleteMany({
          where: { tenantId: existingTenant.id }
        });

        // Delete tenant domains
        await tx.tenantDomain.deleteMany({
          where: { tenantId: existingTenant.id }
        });

        // Delete users
        await tx.user.deleteMany({
          where: { tenantId: existingTenant.id }
        });

        // Finally delete tenant
        await tx.tenant.delete({
          where: { id: existingTenant.id }
        });
      });

      console.log('✅ Existing test tenant cleaned up');
    }

    // ===========================================
    // STEP 2: Create Clean Test Tenant
    // ===========================================
    console.log('');
    console.log('📍 STEP 2: Creating clean test tenant...');

    const testTenant = await prisma.tenant.create({
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

    console.log(`✅ Test tenant created: "${testTenant.name}" (ID: ${testTenant.id})`);
    console.log(`   - Slug: "${testTenant.slug}"`);
    console.log(`   - Domain: "${testTenant.domain}"`);

    // ===========================================
    // STEP 3: Create TenantDomain Records
    // ===========================================
    console.log('');
    console.log('📍 STEP 3: Creating TenantDomain records...');

    // Development domain
    await domainResolver.ensureTenantDomainRecord(
      testTenant.id,
      'testprint.localhost.com',
      true // isPrimary
    );

    // Production domain (optional)
    await domainResolver.ensureTenantDomainRecord(
      testTenant.id,
      'testprint.softellio.com',
      false
    );

    console.log('✅ TenantDomain records created');
    console.log('   - Primary: testprint.localhost.com');
    console.log('   - Optional: testprint.softellio.com');

    // ===========================================
    // STEP 4: Create Admin User
    // ===========================================
    console.log('');
    console.log('📍 STEP 4: Creating tenant admin user...');

    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

    const adminUser = await prisma.user.create({
      data: {
        name: 'TestPrint Administrator',
        email: 'admin@testprint.com',
        password: hashedPassword,
        role: 'TENANT_ADMIN',
        tenantId: testTenant.id,
        isActive: true,
      }
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);
    console.log(`   - Password: ChangeMe123!`);
    console.log(`   - Role: TENANT_ADMIN`);

    // ===========================================
    // STEP 5: Create Site Configuration
    // ===========================================
    console.log('');
    console.log('📍 STEP 5: Creating site configuration...');

    await prisma.tenantSiteConfig.create({
      data: {
        tenantId: testTenant.id,
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
            label: 'Referanslar',
            href: '/testimonials',
            order: 3,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'İletişim',
            href: '/contact',
            order: 4,
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
                { label: 'Ofset Baskı', url: '/services/ofset' },
                { label: 'Tasarım', url: '/services/tasarim' }
              ]
            },
            {
              title: 'Kurumsal',
              links: [
                { label: 'Hakkımızda', url: '/about' },
                { label: 'İletişim', url: '/contact' }
              ]
            }
          ],
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/testprint', label: 'Facebook' },
            { platform: 'instagram', url: 'https://instagram.com/testprint', label: 'Instagram' }
          ],
          copyrightText: '© 2026 TestPrint Solutions. Tüm hakları saklıdır.'
        },
        seoDefaults: {
          metaTitle: 'TestPrint Solutions - Dijital Baskı Çözümleri',
          metaDescription: 'Kaliteli dijital baskı hizmetleri ile işinizi büyütün.',
          ogImage: 'https://via.placeholder.com/1200x630/059669/FFFFFF?text=TestPrint',
          twitterCard: 'summary_large_image'
        }
      }
    });

    console.log('✅ Site configuration created');

    // ===========================================
    // STEP 6: Create Homepage DynamicPage
    // ===========================================
    console.log('');
    console.log('📍 STEP 6: Creating homepage DynamicPage...');

    const homepage = await prisma.dynamicPage.create({
      data: {
        tenantId: testTenant.id,
        slug: '/',
        title: 'Ana Sayfa',
        layoutKey: 'HOME',
        pageType: 'HOME',
        published: true,
        publishedAt: new Date(),
        language: 'tr',
        seo: {
          metaTitle: 'TestPrint Solutions - Ana Sayfa',
          metaDescription: 'TestPrint Solutions ile kaliteli dijital baskı hizmetleri.',
          ogTitle: 'TestPrint Solutions',
          ogDescription: 'Dijital baskı konusunda uzman çözümler.',
          ogImage: 'https://via.placeholder.com/1200x630/059669/FFFFFF?text=TestPrint'
        }
      }
    });

    console.log(`✅ Homepage DynamicPage created: ${homepage.id}`);

    // ===========================================
    // STEP 7: Create Deterministic Layout & Sections
    // ===========================================
    console.log('');
    console.log('📍 STEP 7: Creating deterministic layout with 4 sections...');

    // Create the layout first
    const layout = await prisma.pageLayout.create({
      data: {
        tenantId: testTenant.id,
        key: 'HOME',
        language: 'tr',
        status: 'published'
      }
    });

    // Define exactly 4 sections as requested
    const sectionsData = [
      {
        type: 'hero',
        variant: 'premium',
        order: 1,
        isEnabled: true,
        propsJson: {
          title: 'TestPrint Solutions',
          subtitle: 'Dijital baskı konusunda güvenilir çözüm ortağınız',
          description: 'Kaliteli baskı hizmetleri ile işinizi büyütün. Modern teknoloji, hızlı teslimat.',
          buttonText: 'Hemen Başlayın',
          buttonUrl: '/contact',
          backgroundImage: 'https://via.placeholder.com/1920x1080/059669/FFFFFF?text=TestPrint+Hero',
          backgroundColor: '#059669'
        }
      },
      {
        type: 'services',
        variant: 'premium',
        order: 2,
        isEnabled: true,
        propsJson: {
          title: 'Hizmetlerimiz',
          subtitle: 'Profesyonel baskı çözümleri',
          services: [
            {
              title: 'Dijital Baskı',
              description: 'Hızlı ve kaliteli dijital baskı hizmetleri',
              icon: '🖨️',
              features: ['Hızlı teslimat', 'Yüksek kalite', 'Uygun fiyat']
            },
            {
              title: 'Tasarım',
              description: 'Kreatif tasarım çözümleri',
              icon: '🎨',
              features: ['Özel tasarım', 'Marka kimliği', 'Görsel iletişim']
            },
            {
              title: 'Ofset Baskı',
              description: 'Büyük tirajlar için ofset baskı',
              icon: '📰',
              features: ['Büyük tiraj', 'Ekonomik', 'Kaliteli']
            }
          ]
        }
      },
      {
        type: 'testimonials',
        variant: 'premium',
        order: 3,
        isEnabled: true,
        propsJson: {
          title: 'Müşteri Yorumları',
          subtitle: 'Müşterilerimizin deneyimleri',
          testimonials: [
            {
              name: 'Ahmet Yılmaz',
              company: 'ABC Şirketi',
              text: 'TestPrint ile çalışmak harika bir deneyim. Kaliteli hizmet ve zamanında teslimat.',
              rating: 5,
              avatar: 'https://via.placeholder.com/64x64/059669/FFFFFF?text=AY'
            },
            {
              name: 'Elif Demir',
              company: 'XYZ Ltd.',
              text: 'Tasarım konusundaki uzmanlıkları ve hızlı çözümleri için teşekkürler.',
              rating: 5,
              avatar: 'https://via.placeholder.com/64x64/059669/FFFFFF?text=ED'
            },
            {
              name: 'Mehmet Kaya',
              company: 'Test AŞ',
              text: 'Baskı kalitesi ve müşteri hizmetleri mükemmel. Kesinlikle tavsiye ederim.',
              rating: 5,
              avatar: 'https://via.placeholder.com/64x64/059669/FFFFFF?text=MK'
            }
          ]
        }
      },
      {
        type: 'cta',
        variant: 'premium',
        order: 4,
        isEnabled: true,
        propsJson: {
          title: 'Projenizi Hayata Geçirin',
          description: 'Uzman ekibimiz ile tanışın ve projeniz için en uygun çözümü bulun.',
          ctaText: 'Ücretsiz Teklif Alın',
          ctaUrl: '/contact',
          features: [
            'Ücretsiz konsültasyon',
            'Hızlı teklif',
            'Kaliteli hizmet',
            'Zamanında teslimat'
          ],
          backgroundColor: '#059669',
          secondaryCtaText: 'İletişime Geç',
          secondaryCtaUrl: 'tel:+905551234567'
        }
      }
    ];

    // Create all 4 sections
    for (const sectionData of sectionsData) {
      await prisma.pageSection.create({
        data: {
          tenantId: testTenant.id,
          layoutId: layout.id,
          type: sectionData.type,
          variant: sectionData.variant,
          order: sectionData.order,
          isEnabled: sectionData.isEnabled,
          status: 'published',
          propsJson: sectionData.propsJson
        }
      });
    }

    console.log(`✅ Created ${sectionsData.length} sections: ${sectionsData.map(s => s.type).join(', ')}`);

    // ===========================================
    // STEP 8: Verification
    // ===========================================
    console.log('');
    console.log('📍 STEP 8: Verification setup...');

    const verification = {
      localUrl: 'http://testprint.localhost.com:3000',
      prodUrl: 'https://testprint.softellio.com',
      apiEndpoint: 'GET /public/site/pages/by-slug/%2F?lang=tr'
    };

    console.log('✅ Test tenant created successfully!');

    return {
      success: true,
      tenant: {
        id: testTenant.id,
        slug: testTenant.slug,
        domain: testTenant.domain
      },
      admin: {
        email: adminUser.email,
        password: 'ChangeMe123!'
      },
      homepage: {
        id: homepage.id,
        slug: homepage.slug,
        layoutKey: homepage.layoutKey,
        published: homepage.published,
        sectionsCount: sectionsData.length
      },
      verification
    };

  } catch (error) {
    console.error('❌ Clean tenant creation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await app.close();
  }
}

// ===========================================
// MAIN EXECUTION
// ===========================================
async function main() {
  try {
    const result = await createCleanTestTenant();

    console.log('');
    console.log('📋 FINAL RESULTS:');
    console.log('='.repeat(60));

    if (result.success) {
      console.log('✅ SUCCESS: Clean test tenant created and ready for testing!');
      console.log('');

      console.log('🏢 TENANT DETAILS:');
      console.log(`   - ID: ${result.tenant!.id}`);
      console.log(`   - Slug: ${result.tenant!.slug}`);
      console.log(`   - Domain: ${result.tenant!.domain}`);
      console.log('');

      console.log('👤 ADMIN CREDENTIALS:');
      console.log(`   - Email: ${result.admin!.email}`);
      console.log(`   - Password: ${result.admin!.password}`);
      console.log('');

      console.log('📄 HOMEPAGE:');
      console.log(`   - ID: ${result.homepage!.id}`);
      console.log(`   - Slug: ${result.homepage!.slug}`);
      console.log(`   - Layout Key: ${result.homepage!.layoutKey}`);
      console.log(`   - Published: ${result.homepage!.published}`);
      console.log(`   - Sections: ${result.homepage!.sectionsCount} (hero, services, testimonials, cta)`);
      console.log('');

      console.log('🔍 VERIFICATION COMMANDS:');
      console.log('');
      console.log('1. TEST API ENDPOINT:');
      console.log(`   curl -s "https://api.softellio.com/public/site/pages/by-slug/%2F?lang=tr" \\`);
      console.log(`     -H "X-Tenant-Host: testprint.localhost.com" | jq`);
      console.log('');
      console.log('2. TEST BOOTSTRAP ENDPOINT:');
      console.log(`   curl -s "https://api.softellio.com/public/site/bootstrap?lang=tr" \\`);
      console.log(`     -H "X-Tenant-Host: testprint.localhost.com" | jq`);
      console.log('');
      console.log('3. ACCESS PORTAL (after login):');
      console.log('   - URL: https://portal.softellio.com');
      console.log(`   - Login: ${result.admin!.email} / ${result.admin!.password}`);
      console.log('   - Edit: CMS > Layouts > HOME');
      console.log('');
      console.log('4. ACCESS SITE (if domains configured):');
      console.log(`   - Local: ${result.verification!.localUrl} (requires DNS/hosts entry)`);
      console.log(`   - Prod: ${result.verification!.prodUrl} (if configured)`);
      console.log('');

      console.log('✅ EXPECTED RESULTS:');
      console.log('   - API returns exactly 4 sections with published=true');
      console.log('   - Portal CMS shows same 4 sections');
      console.log('   - Site renders the same content');
      console.log('   - Save/publish flow works consistently');

    } else {
      console.log('❌ FAILED: Clean test tenant creation failed');
      console.log('');
      console.log(`🚨 Error: ${result.error}`);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('   1. Check database connection and permissions');
      console.log('   2. Ensure prisma schema is up to date');
      console.log('   3. Check for any running transactions or locks');
      console.log('   4. Review the error message above for specific issues');
    }

    console.log('='.repeat(60));

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { createCleanTestTenant };