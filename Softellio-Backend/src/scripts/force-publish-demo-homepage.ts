import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';

/**
 * PRODUCTION-SAFE SCRIPT: Force publish demo.softellio.com homepage
 *
 * This script fixes the "Page Not Published" issue on demo.softellio.com by:
 * 1. Finding the demo tenant by domain resolution
 * 2. Locating the homepage (slug="/", layoutKey="HOME") for Turkish language
 * 3. Setting published=true and publishedAt=now
 * 4. Providing before/after verification
 *
 * SAFE TO RUN MULTIPLE TIMES - Idempotent operations only
 *
 * Run with: npx ts-node src/scripts/force-publish-demo-homepage.ts
 */

interface PagePublishResult {
  success: boolean;
  pageId?: string;
  slug?: string;
  layoutKey?: string;
  before?: {
    published: boolean;
    publishedAt: Date | null;
  };
  after?: {
    published: boolean;
    publishedAt: Date | null;
  };
  error?: string;
}

async function forcePublishDemoHomepage(): Promise<PagePublishResult> {
  console.log('🚀 PRODUCTION SCRIPT: Force publishing demo.softellio.com homepage...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);

    // ===========================================
    // STEP 1: Find Demo Tenant
    // ===========================================
    console.log('📍 STEP 1: Resolving demo tenant...');

    let demoTenant;

    // Try multiple resolution methods for robustness
    demoTenant = await prisma.tenant.findFirst({
      where: {
        domain: 'demo.softellio.com',
        isActive: true,
        status: 'active'
      }
    });

    if (!demoTenant) {
      // Fallback: try by slug
      demoTenant = await prisma.tenant.findFirst({
        where: {
          slug: 'demo',
          isActive: true,
          status: 'active'
        }
      });
    }

    if (!demoTenant) {
      // Fallback: try via TenantDomain table
      const tenantDomain = await prisma.tenantDomain.findFirst({
        where: {
          domain: 'demo.softellio.com',
          isActive: true,
          tenant: {
            isActive: true,
            status: 'active'
          }
        },
        include: {
          tenant: true
        }
      });

      if (tenantDomain) {
        demoTenant = tenantDomain.tenant;
      }
    }

    if (!demoTenant) {
      return {
        success: false,
        error: 'Demo tenant not found. Ensure demo.softellio.com tenant exists and is active.'
      };
    }

    console.log(`✅ Demo tenant found: "${demoTenant.name}" (ID: ${demoTenant.id})`);
    console.log(`   - Slug: "${demoTenant.slug}"`);
    console.log(`   - Domain: "${demoTenant.domain}"`);
    console.log(`   - Status: "${demoTenant.status}"`);
    console.log(`   - Active: ${demoTenant.isActive}`);

    // ===========================================
    // STEP 2: Find Homepage DynamicPage Record
    // ===========================================
    console.log('');
    console.log('📍 STEP 2: Finding homepage DynamicPage record...');

    const homepage = await prisma.dynamicPage.findFirst({
      where: {
        tenantId: demoTenant.id,
        language: 'tr',
        OR: [
          { slug: '/' },
          { layoutKey: 'HOME' }
        ]
      }
    });

    if (!homepage) {
      return {
        success: false,
        error: `No homepage found for demo tenant (tenantId: ${demoTenant.id}). Ensure DynamicPage record exists with slug="/" or layoutKey="HOME" for language="tr".`
      };
    }

    console.log(`✅ Homepage found: "${homepage.title}" (ID: ${homepage.id})`);
    console.log(`   - Slug: "${homepage.slug}"`);
    console.log(`   - Layout Key: "${homepage.layoutKey}"`);
    console.log(`   - Language: "${homepage.language}"`);
    console.log(`   - Page Type: "${homepage.pageType}"`);

    // ===========================================
    // STEP 3: Check Current Publish Status
    // ===========================================
    console.log('');
    console.log('📍 STEP 3: Current publish status...');

    const beforeState = {
      published: homepage.published,
      publishedAt: homepage.publishedAt
    };

    console.log(`📊 BEFORE:`, {
      published: beforeState.published,
      publishedAt: beforeState.publishedAt?.toISOString() || 'null',
      needsPublishing: !beforeState.published
    });

    if (beforeState.published) {
      console.log('✅ Homepage is already published! No action needed.');
      return {
        success: true,
        pageId: homepage.id,
        slug: homepage.slug,
        layoutKey: homepage.layoutKey,
        before: beforeState,
        after: beforeState,
      };
    }

    // ===========================================
    // STEP 4: Force Publish Homepage
    // ===========================================
    console.log('');
    console.log('📍 STEP 4: Force publishing homepage...');

    const publishedAt = new Date();
    const updatedHomepage = await prisma.dynamicPage.update({
      where: { id: homepage.id },
      data: {
        published: true,
        publishedAt: publishedAt
      }
    });

    const afterState = {
      published: updatedHomepage.published,
      publishedAt: updatedHomepage.publishedAt
    };

    console.log('');
    console.log('🎉 HOMEPAGE PUBLISHED SUCCESSFULLY!');
    console.log('');
    console.log(`📊 AFTER:`, {
      published: afterState.published,
      publishedAt: afterState.publishedAt?.toISOString(),
      duration: `${Date.now() - publishedAt.getTime()}ms`
    });

    return {
      success: true,
      pageId: homepage.id,
      slug: homepage.slug,
      layoutKey: homepage.layoutKey,
      before: beforeState,
      after: afterState,
    };

  } catch (error) {
    console.error('❌ SCRIPT ERROR:', error.message);
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
    const result = await forcePublishDemoHomepage();

    console.log('');
    console.log('📋 FINAL RESULTS:');
    console.log('='.repeat(50));

    if (result.success) {
      console.log('✅ SUCCESS: Demo homepage publish completed');
      console.log('');
      console.log('🔧 Details:');
      console.log(`   - Page ID: ${result.pageId}`);
      console.log(`   - Slug: ${result.slug}`);
      console.log(`   - Layout Key: ${result.layoutKey}`);
      console.log('');
      console.log('📊 Status Change:');
      console.log(`   - BEFORE: published=${result.before?.published}, publishedAt=${result.before?.publishedAt?.toISOString() || 'null'}`);
      console.log(`   - AFTER:  published=${result.after?.published}, publishedAt=${result.after?.publishedAt?.toISOString() || 'null'}`);
      console.log('');
      console.log('🌐 Next Steps:');
      console.log('   1. Visit https://demo.softellio.com to verify the page loads');
      console.log('   2. Check public API: GET https://api.softellio.com/public/site/pages/by-slug/%2F?lang=tr');
      console.log('   3. Response should show published=true and content sections');
      console.log('');
      console.log('🎯 Expected Result: demo.softellio.com now shows the homepage instead of "Page Not Published"');
    } else {
      console.log('❌ FAILED: Demo homepage publish failed');
      console.log('');
      console.log(`🚨 Error: ${result.error}`);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('   1. Ensure demo tenant exists: SELECT * FROM Tenant WHERE domain = \'demo.softellio.com\' OR slug = \'demo\'');
      console.log('   2. Ensure homepage exists: SELECT * FROM DynamicPage WHERE tenantId = ? AND slug = \'/\' AND language = \'tr\'');
      console.log('   3. Run full seeding if needed: npm run seed');
      console.log('   4. Check tenant and page creation in seeding logs');
    }

    console.log('='.repeat(50));

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

export { forcePublishDemoHomepage };