import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';

/**
 * SIMPLE APEX HOMEPAGE FIX
 *
 * Creates the missing homepage for the existing apex tenant (ID: 4, softellio.com)
 * to resolve "Site Page Not Found" issue.
 *
 * Run with: npx ts-node src/scripts/fix-apex-homepage.ts
 */

async function fixApexHomepage() {
  console.log('🔧 APEX HOMEPAGE FIX: Adding missing homepage for softellio.com...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);

    const APEX_TENANT_ID = 4; // From database check

    // ===========================================
    // STEP 1: Verify tenant exists
    // ===========================================
    console.log('📍 STEP 1: Verifying apex tenant...');

    const apexTenant = await prisma.tenant.findUnique({
      where: { id: APEX_TENANT_ID }
    });

    if (!apexTenant) {
      throw new Error(`Apex tenant with ID ${APEX_TENANT_ID} not found`);
    }

    console.log(`✅ Apex tenant found: "${apexTenant.name}" (${apexTenant.domain})`);

    // ===========================================
    // STEP 2: Create missing homepage
    // ===========================================
    console.log('');
    console.log('📍 STEP 2: Creating missing homepage...');

    // Check if homepage already exists
    const existingHomepage = await prisma.dynamicPage.findFirst({
      where: {
        tenantId: APEX_TENANT_ID,
        slug: '/',
        language: 'tr'
      }
    });

    if (existingHomepage) {
      console.log('⚠️  Homepage already exists, skipping creation');
    } else {
      const homepage = await prisma.dynamicPage.create({
        data: {
          tenantId: APEX_TENANT_ID,
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
    }

    // ===========================================
    // STEP 3: Create missing layout & sections
    // ===========================================
    console.log('');
    console.log('📍 STEP 3: Creating platform layout...');

    // Check if layout exists
    const existingLayout = await prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId: APEX_TENANT_ID,
          key: 'HOME',
          language: 'tr'
        }
      },
      include: { sections: true }
    });

    if (existingLayout && existingLayout.sections.length > 0) {
      console.log(`⚠️  Layout already exists with ${existingLayout.sections.length} sections`);
    } else {
      // Create or update layout
      let layout = existingLayout;
      if (!layout) {
        layout = await prisma.pageLayout.create({
          data: {
            tenantId: APEX_TENANT_ID,
            key: 'HOME',
            language: 'tr',
            status: 'published'
          },
          include: { sections: true }
        });
      }

      // Create platform showcase sections
      const sectionsData = [
        {
          type: 'hero',
          variant: 'premium',
          order: 1,
          propsJson: {
            title: 'Softellio Platform',
            subtitle: 'Multi-Tenant CMS for Professional Websites',
            description: 'Build, manage, and scale multiple websites with our powerful platform. Professional templates, custom domains, and enterprise features.',
            buttonText: 'Get Started',
            buttonUrl: '/signup',
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
                description: 'Manage multiple websites from one platform.',
                icon: '🏢',
                features: ['Tenant isolation', 'Custom domains', 'Branded experience']
              },
              {
                title: 'Professional Templates',
                description: 'Beautiful, responsive templates.',
                icon: '🎨',
                features: ['Mobile responsive', 'SEO optimized', 'Customizable']
              },
              {
                title: 'Enterprise Ready',
                description: 'Scalable with enterprise security.',
                icon: '🔒',
                features: ['99.9% uptime', 'SSL included', 'Analytics']
              }
            ]
          }
        },
        {
          type: 'cta',
          variant: 'premium',
          order: 3,
          propsJson: {
            title: 'Ready to Get Started?',
            description: 'Join businesses using Softellio to power their online presence.',
            ctaText: 'Start Free Trial',
            ctaUrl: '/signup',
            features: ['14-day free trial', 'No credit card required', 'Expert support', 'Cancel anytime'],
            backgroundColor: '#1E40AF'
          }
        }
      ];

      // Create sections
      for (const sectionData of sectionsData) {
        await prisma.pageSection.create({
          data: {
            tenantId: APEX_TENANT_ID,
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

      console.log(`✅ Created ${sectionsData.length} sections: ${sectionsData.map(s => s.type).join(', ')}`);
    }

    // ===========================================
    // STEP 4: Test verification
    // ===========================================
    console.log('');
    console.log('📍 STEP 4: Verification...');

    const finalHomepage = await prisma.dynamicPage.findFirst({
      where: {
        tenantId: APEX_TENANT_ID,
        slug: '/',
        language: 'tr'
      }
    });

    const finalLayout = await prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId: APEX_TENANT_ID,
          key: 'HOME',
          language: 'tr'
        }
      },
      include: { sections: true }
    });

    console.log('✅ VERIFICATION RESULTS:');
    console.log(`   - Homepage exists: ${!!finalHomepage} (Published: ${finalHomepage?.published})`);
    console.log(`   - Layout exists: ${!!finalLayout} (Sections: ${finalLayout?.sections.length || 0})`);
    console.log('');
    console.log('🔍 TEST COMMAND:');
    console.log('   curl -s "https://api.softellio.com/public/site/pages/by-slug/%2F?lang=tr" \\');
    console.log('     -H "X-Tenant-Host: softellio.com" | jq');
    console.log('');
    console.log('✅ Expected: 200 response with platform content');
    console.log('✅ softellio.com should now work!');

    return {
      success: true,
      homepage: finalHomepage,
      layout: finalLayout,
      sectionsCount: finalLayout?.sections.length || 0
    };

  } catch (error) {
    console.error('❌ Apex homepage fix failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    await app.close();
  }
}

// Execute
if (require.main === module) {
  fixApexHomepage()
    .then(result => {
      console.log('');
      if (result.success) {
        console.log('🎉 SUCCESS: Apex homepage fixed!');
        process.exit(0);
      } else {
        console.log('💥 FAILED:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 FATAL ERROR:', error);
      process.exit(1);
    });
}

export { fixApexHomepage };