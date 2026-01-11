import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';

/**
 * PRODUCTION-SAFE SCRIPT: Fix demo tenant slug for domain resolution
 *
 * This script fixes the root cause of demo.softellio.com showing "Temporary Site Issue"
 * by ensuring the demo tenant has the correct slug for domain resolution Step 3.
 *
 * Run with: npm run ts-node src/seeding/fix-demo-tenant-slug.ts
 */
async function fixDemoTenantSlug() {
  console.log('🔧 Fixing demo tenant slug for domain resolution...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prismaService = app.get(PrismaService);

    // Find demo tenant by domain
    const demoTenant = await prismaService.tenant.findFirst({
      where: {
        domain: 'demo.softellio.com'
      }
    });

    if (!demoTenant) {
      console.log('❌ Demo tenant not found. Please run the full seeding script first.');
      console.log('   Run: npm run seed');
      process.exit(1);
    }

    console.log(`📍 Found demo tenant: ${demoTenant.name} (ID: ${demoTenant.id})`);
    console.log(`📍 Current slug: "${demoTenant.slug}"`);
    console.log(`📍 Current status: "${demoTenant.status}"`);
    console.log(`📍 Current isActive: ${demoTenant.isActive}`);

    // Check if fix is needed
    const needsSlugFix = demoTenant.slug !== 'demo';
    const needsStatusFix = demoTenant.status !== 'active';
    const needsActiveFix = !demoTenant.isActive;

    if (!needsSlugFix && !needsStatusFix && !needsActiveFix) {
      console.log('✅ Demo tenant is already correctly configured. No fix needed.');
      return;
    }

    console.log('');
    console.log('🚨 Issues detected:');
    if (needsSlugFix) console.log(`   - Slug should be "demo" but is "${demoTenant.slug}"`);
    if (needsStatusFix) console.log(`   - Status should be "active" but is "${demoTenant.status}"`);
    if (needsActiveFix) console.log(`   - isActive should be true but is ${demoTenant.isActive}`);
    console.log('');

    // Apply fix
    const updateData: any = {};
    if (needsSlugFix) updateData.slug = 'demo';
    if (needsStatusFix) updateData.status = 'active';
    if (needsActiveFix) updateData.isActive = true;

    console.log('🔧 Applying fix...');
    const updatedTenant = await prismaService.tenant.update({
      where: { id: demoTenant.id },
      data: updateData
    });

    console.log('');
    console.log('✅ Demo tenant successfully fixed!');
    console.log(`   - New slug: "${updatedTenant.slug}"`);
    console.log(`   - New status: "${updatedTenant.status}"`);
    console.log(`   - New isActive: ${updatedTenant.isActive}`);
    console.log('');
    console.log('🌐 demo.softellio.com should now work correctly.');
    console.log('');
    console.log('💡 To test the fix:');
    console.log('   1. Set DEBUG_TENANT_RESOLUTION=true in your .env');
    console.log('   2. Restart the server: npm run start:dev');
    console.log('   3. Check logs when demo.softellio.com makes requests');
    console.log('   4. Remove DEBUG_TENANT_RESOLUTION from .env when satisfied');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the fix
fixDemoTenantSlug();