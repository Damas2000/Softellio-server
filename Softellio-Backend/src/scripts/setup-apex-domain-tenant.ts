import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';
import { DomainResolverService } from '../common/services/domain-resolver.service';
import * as bcrypt from 'bcrypt';

/**
 * APEX DOMAIN PRODUCTION SETUP
 *
 * Creates a default tenant for softellio.com (apex domain) to resolve "Site Page Not Found" issue.
 *
 * This implements Option B: Apex domain maps to a showcase/default tenant.
 *
 * Creates:
 * - Default tenant: "Softellio" (slug: "softellio", domain: "softellio.com")
 * - Admin user: platform@softellio.com / ApexAdmin123!
 * - TenantDomain record for proper resolution
 * - Showcase homepage with platform demo content
 * - Published and ready for production
 *
 * Run with: npx ts-node src/scripts/setup-apex-domain-tenant.ts
 */

interface ApexDomainResult {
  success: boolean;
  tenant?: {
    id: number;
    slug: string;
    domain: string;
    name: string;
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
    endpoint: string;
    curlCommand: string;
  };
  error?: string;
}

async function setupApexDomainTenant(): Promise<ApexDomainResult> {
  console.log('🌐 APEX DOMAIN SETUP: Creating default tenant for softellio.com...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);
    const domainResolver = app.get(DomainResolverService);

    // ===========================================
    // STEP 1: Check for existing apex tenant
    // ===========================================
    console.log('📍 STEP 1: Checking for existing apex domain tenant...');

    // Check for existing tenant with apex domain
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: 'softellio.com' },
          { slug: 'softellio' }
        ]
      }
    });

    if (existingTenant) {
      console.log(`⚠️  Apex domain tenant already exists: "${existingTenant.name}" (ID: ${existingTenant.id})`);
      console.log('   - Verifying configuration...');

      // Ensure TenantDomain record exists
      await domainResolver.ensureTenantDomainRecord(existingTenant.id, 'softellio.com', true);

      // Find homepage
      const homepage = await prisma.dynamicPage.findFirst({
        where: {
          tenantId: existingTenant.id,
          slug: '/',
          language: 'tr'
        }
      });

      if (homepage) {
        console.log('✅ Existing apex tenant is properly configured');

        return {
          success: true,
          tenant: {
            id: existingTenant.id,
            slug: existingTenant.slug,
            domain: existingTenant.domain || 'softellio.com',
            name: existingTenant.name
          },
          homepage: {
            id: homepage.id,
            slug: homepage.slug,
            layoutKey: homepage.layoutKey,
            published: homepage.published,
            sectionsCount: 0 // Would need to count sections
          },
          verification: {
            endpoint: 'GET /public/site/pages/by-slug/%2F?lang=tr',
            curlCommand: 'curl -s "https://api.softellio.com/public/site/pages/by-slug/%2F?lang=tr" -H "X-Tenant-Host: softellio.com"'
          }
        };
      }
    }

    // ===========================================
    // STEP 2: Create Apex Domain Tenant
    // ===========================================
    console.log('');
    console.log('📍 STEP 2: Creating apex domain tenant...');

    const apexTenant = await prisma.tenant.create({
      data: {
        name: 'Softellio Platform',
        slug: 'softellio',
        domain: 'softellio.com',
        defaultLanguage: 'tr',
        availableLanguages: ['tr', 'en'],
        isActive: true,
        status: 'active',
      }
    });

    console.log(`✅ Apex tenant created: "${apexTenant.name}" (ID: ${apexTenant.id})`);
    console.log(`   - Slug: "${apexTenant.slug}"`);
    console.log(`   - Domain: "${apexTenant.domain}"`);

    // ===========================================
    // STEP 3: Create TenantDomain Record
    // ===========================================
    console.log('');
    console.log('📍 STEP 3: Creating TenantDomain record for apex domain...');

    await domainResolver.ensureTenantDomainRecord(
      apexTenant.id,
      'softellio.com',
      true // isPrimary
    );

    console.log('✅ TenantDomain record created for softellio.com');

    // ===========================================
    // STEP 4: Create Admin User
    // ===========================================
    console.log('');
    console.log('📍 STEP 4: Creating apex tenant admin...');

    const hashedPassword = await bcrypt.hash('ApexAdmin123!', 10);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Softellio Platform Administrator',
        email: 'platform@softellio.com',
        password: hashedPassword,
        role: 'TENANT_ADMIN',
        tenantId: apexTenant.id,
        isActive: true,
      }
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);
    console.log(`   - Password: ApexAdmin123!`);

    // ===========================================
    // STEP 5: Create Site Configuration
    // ===========================================
    console.log('');
    console.log('📍 STEP 5: Creating apex tenant site configuration...');

    await prisma.tenantSiteConfig.create({
      data: {
        tenantId: apexTenant.id,
        templateKey: 'printing-premium-v1',
        branding: {
          logoUrl: 'https://via.placeholder.com/200x80/1E40AF/FFFFFF?text=SOFTELLIO',
          faviconUrl: 'https://via.placeholder.com/32x32/1E40AF/FFFFFF?text=S',
          primaryColor: '#1E40AF',
          secondaryColor: '#3B82F6',
          fontFamily: 'Inter, sans-serif'
        },
        navigation: [
          {
            label: 'Platform',
            href: '/',
            order: 1,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Features',
            href: '/features',
            order: 2,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Pricing',
            href: '/pricing',
            order: 3,
            isCTA: false,
            isExternal: false
          },
          {
            label: 'Get Started',
            href: '/signup',
            order: 4,
            isCTA: true,
            isExternal: false
          }
        ],
        footer: {
          columns: [
            {
              title: 'Platform',
              links: [
                { label: 'Features', url: '/features' },
                { label: 'Templates', url: '/templates' },
                { label: 'Integrations', url: '/integrations' }
              ]
            },
            {
              title: 'Company',
              links: [
                { label: 'About', url: '/about' },
                { label: 'Contact', url: '/contact' },
                { label: 'Support', url: '/support' }
              ]
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', url: '/privacy' },
                { label: 'Terms of Service', url: '/terms' }
              ]
            }
          ],
          socialLinks: [
            { platform: 'twitter', url: 'https://twitter.com/softellio', label: 'Twitter' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/softellio', label: 'LinkedIn' }
          ],
          copyrightText: '© 2026 Softellio. All rights reserved.'
        },
        seoDefaults: {
          metaTitle: 'Softellio - Multi-Tenant CMS Platform',
          metaDescription: 'Build and manage multiple websites with our powerful multi-tenant CMS platform. Professional templates, custom domains, and enterprise features.',
          ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Softellio+Platform',
          twitterCard: 'summary_large_image'
        }
      }
    });

    console.log('✅ Site configuration created');

    // ===========================================
    // STEP 6: Create Homepage
    // ===========================================
    console.log('');
    console.log('📍 STEP 6: Creating apex domain homepage...');

    const homepage = await prisma.dynamicPage.create({
      data: {
        tenantId: apexTenant.id,
        slug: '/',
        title: 'Softellio Platform',
        layoutKey: 'HOME',
        pageType: 'HOME',
        published: true,
        publishedAt: new Date(),
        language: 'tr',
        seo: {
          metaTitle: 'Softellio - Multi-Tenant CMS Platform',
          metaDescription: 'Build and manage multiple websites with our powerful multi-tenant CMS platform.',
          ogTitle: 'Softellio Platform',
          ogDescription: 'Multi-tenant CMS for professional websites.',
          ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Softellio'
        }
      }
    });

    console.log(`✅ Homepage created: ${homepage.id}`);

    // ===========================================
    // STEP 7: Create Platform Showcase Layout
    // ===========================================
    console.log('');
    console.log('📍 STEP 7: Creating platform showcase layout...');

    // Create the layout
    const layout = await prisma.pageLayout.create({
      data: {
        tenantId: apexTenant.id,
        key: 'HOME',
        language: 'tr',
        status: 'published'
      }
    });

    // Create platform showcase sections
    const sectionsData = [
      {
        type: 'hero',
        variant: 'premium',
        order: 1,
        propsJson: {
          title: 'Softellio Platform',
          subtitle: 'Multi-Tenant CMS for Professional Websites',
          description: 'Build, manage, and scale multiple websites with our powerful multi-tenant CMS platform. Professional templates, custom domains, and enterprise features.',
          buttonText: 'Get Started Free',
          buttonUrl: '/signup',
          backgroundImage: 'https://via.placeholder.com/1920x1080/1E40AF/FFFFFF?text=Softellio+Platform',
          backgroundColor: '#1E40AF'
        }
      },
      {
        type: 'services',
        variant: 'premium',
        order: 2,
        propsJson: {
          title: 'Platform Features',
          subtitle: 'Everything you need to succeed online',
          services: [
            {
              title: 'Multi-Tenant Architecture',
              description: 'Manage multiple websites from a single platform with full isolation.',
              icon: '🏢',
              features: ['Tenant isolation', 'Custom domains', 'Branded experience']
            },
            {
              title: 'Professional Templates',
              description: 'Beautiful, responsive templates for any business type.',
              icon: '🎨',
              features: ['Mobile responsive', 'SEO optimized', 'Customizable']
            },
            {
              title: 'Enterprise Ready',
              description: 'Scalable infrastructure with enterprise-grade security.',
              icon: '🔒',
              features: ['99.9% uptime', 'SSL included', 'Advanced analytics']
            }
          ]
        }
      },
      {
        type: 'testimonials',
        variant: 'premium',
        order: 3,
        propsJson: {
          title: 'What Our Users Say',
          subtitle: 'Trusted by businesses worldwide',
          testimonials: [
            {
              name: 'Sarah Johnson',
              company: 'TechCorp Inc.',
              text: 'Softellio transformed how we manage our client websites. The multi-tenant features are exactly what we needed.',
              rating: 5,
              avatar: 'https://via.placeholder.com/64x64/1E40AF/FFFFFF?text=SJ'
            },
            {
              name: 'Mark Davis',
              company: 'Digital Agency Pro',
              text: 'The template system and custom domains made client onboarding seamless. Highly recommended!',
              rating: 5,
              avatar: 'https://via.placeholder.com/64x64/1E40AF/FFFFFF?text=MD'
            }
          ]
        }
      },
      {
        type: 'cta',
        variant: 'premium',
        order: 4,
        propsJson: {
          title: 'Ready to Get Started?',
          description: 'Join thousands of businesses using Softellio to power their online presence.',
          ctaText: 'Start Free Trial',
          ctaUrl: '/signup',
          features: [
            '14-day free trial',
            'No credit card required',
            'Expert support included',
            'Cancel anytime'
          ],
          backgroundColor: '#1E40AF',
          secondaryCtaText: 'View Pricing',
          secondaryCtaUrl: '/pricing'
        }
      }
    ];

    // Create all sections
    for (const sectionData of sectionsData) {
      await prisma.pageSection.create({
        data: {
          tenantId: apexTenant.id,
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

    console.log(`✅ Created ${sectionsData.length} showcase sections: ${sectionsData.map(s => s.type).join(', ')}`);

    // ===========================================
    // FINAL SUCCESS
    // ===========================================
    console.log('');
    console.log('✅ Apex domain tenant setup completed successfully!');

    return {
      success: true,
      tenant: {
        id: apexTenant.id,
        slug: apexTenant.slug,
        domain: apexTenant.domain || 'softellio.com',
        name: apexTenant.name
      },
      admin: {
        email: adminUser.email,
        password: 'ApexAdmin123!'
      },
      homepage: {
        id: homepage.id,
        slug: homepage.slug,
        layoutKey: homepage.layoutKey,
        published: homepage.published,
        sectionsCount: sectionsData.length
      },
      verification: {
        endpoint: 'GET /public/site/pages/by-slug/%2F?lang=tr',
        curlCommand: 'curl -s "https://api.softellio.com/public/site/pages/by-slug/%2F?lang=tr" -H "X-Tenant-Host: softellio.com"'
      }
    };

  } catch (error) {
    console.error('❌ Apex domain setup failed:', error.message);
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
    const result = await setupApexDomainTenant();

    console.log('');
    console.log('📋 FINAL RESULTS:');
    console.log('='.repeat(60));

    if (result.success) {
      console.log('✅ SUCCESS: Apex domain tenant setup completed!');
      console.log('');

      console.log('🏢 TENANT DETAILS:');
      console.log(`   - Name: ${result.tenant!.name}`);
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
      console.log(`   - Published: ${result.homepage!.published}`);
      console.log(`   - Sections: ${result.homepage!.sectionsCount} (platform showcase)`);
      console.log('');

      console.log('🔍 VERIFICATION:');
      console.log('');
      console.log('1. TEST API ENDPOINT:');
      console.log(`   ${result.verification!.curlCommand}`);
      console.log('');
      console.log('2. TEST BOOTSTRAP:');
      console.log(`   curl -s "https://api.softellio.com/public/site/bootstrap?lang=tr" \\`);
      console.log(`     -H "X-Tenant-Host: softellio.com" | jq`);
      console.log('');
      console.log('3. EXPECTED RESULT:');
      console.log('   - softellio.com should now resolve to platform showcase');
      console.log('   - Should show "Softellio Platform" with 4 sections');
      console.log('   - No more "Site Page Not Found" error');

    } else {
      console.log('❌ FAILED: Apex domain setup failed');
      console.log('');
      console.log(`🚨 Error: ${result.error}`);
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

export { setupApexDomainTenant };