import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';

/**
 * PRODUCTION-SAFE SCRIPT: Fix demo.softellio.com tenant resolution
 *
 * This script implements the COMPLETE solution for demo.softellio.com showing "Temporary Site Issue"
 * by ensuring production-correct tenant resolution via TenantDomain table.
 *
 * WHAT IT FIXES:
 * 1. Ensures demo tenant has slug = "demo" for Step 3 fallback
 * 2. Ensures demo tenant has status = "active" and isActive = true
 * 3. MOST CRITICAL: Creates TenantDomain record for Step 1 resolution (production-reliable)
 *
 * SAFE TO RUN MULTIPLE TIMES - Idempotent operations only
 *
 * Run with: npx ts-node src/seeding/production-tenant-resolution-fix.ts
 */
async function fixDemoTenantResolution() {
  console.log('🔧 PRODUCTION FIX: Ensuring demo.softellio.com reliable tenant resolution...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);

    // ===========================================
    // STEP 1: Find/Fix Demo Tenant Configuration
    // ===========================================
    console.log('📍 STEP 1: Checking demo tenant configuration...');

    const demoTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: 'demo.softellio.com' },
          { slug: 'demo' }
        ]
      }
    });

    if (!demoTenant) {
      console.log('❌ CRITICAL: No demo tenant found. Please run full seeding first:');
      console.log('   npm run seed');
      console.log('');
      process.exit(1);
    }

    console.log(`✅ Found demo tenant: "${demoTenant.name}" (ID: ${demoTenant.id})`);
    console.log(`   - Current domain: "${demoTenant.domain}"`);
    console.log(`   - Current slug: "${demoTenant.slug}"`);
    console.log(`   - Current status: "${demoTenant.status}"`);
    console.log(`   - Current isActive: ${demoTenant.isActive}`);

    // Check what needs fixing
    const needsSlugFix = demoTenant.slug !== 'demo';
    const needsDomainFix = demoTenant.domain !== 'demo.softellio.com';
    const needsStatusFix = demoTenant.status !== 'active';
    const needsActiveFix = !demoTenant.isActive;

    if (needsSlugFix || needsDomainFix || needsStatusFix || needsActiveFix) {
      console.log('');
      console.log('🚨 TENANT CONFIGURATION ISSUES DETECTED:');
      if (needsDomainFix) console.log(`   ❌ Domain should be "demo.softellio.com" but is "${demoTenant.domain}"`);
      if (needsSlugFix) console.log(`   ❌ Slug should be "demo" but is "${demoTenant.slug}"`);
      if (needsStatusFix) console.log(`   ❌ Status should be "active" but is "${demoTenant.status}"`);
      if (needsActiveFix) console.log(`   ❌ isActive should be true but is ${demoTenant.isActive}`);
      console.log('');

      console.log('🔧 Applying tenant configuration fixes...');
      const updateData: any = {};
      if (needsDomainFix) updateData.domain = 'demo.softellio.com';
      if (needsSlugFix) updateData.slug = 'demo';
      if (needsStatusFix) updateData.status = 'active';
      if (needsActiveFix) updateData.isActive = true;

      const updatedTenant = await prisma.tenant.update({
        where: { id: demoTenant.id },
        data: updateData
      });

      console.log('✅ Tenant configuration fixed:');
      console.log(`   ✅ Domain: "${updatedTenant.domain}"`);
      console.log(`   ✅ Slug: "${updatedTenant.slug}"`);
      console.log(`   ✅ Status: "${updatedTenant.status}"`);
      console.log(`   ✅ Active: ${updatedTenant.isActive}`);
    } else {
      console.log('✅ Tenant configuration is correct');
    }

    // ==============================================
    // STEP 2: Ensure TenantDomain Record (CRITICAL)
    // ==============================================
    console.log('');
    console.log('📍 STEP 2: Checking TenantDomain record (PRODUCTION-CRITICAL)...');

    const existingTenantDomain = await prisma.tenantDomain.findFirst({
      where: {
        domain: 'demo.softellio.com',
        tenantId: demoTenant.id
      }
    });

    if (existingTenantDomain) {
      console.log('✅ TenantDomain record found:');
      console.log(`   - Domain: "${existingTenantDomain.domain}"`);
      console.log(`   - Type: "${existingTenantDomain.type}"`);
      console.log(`   - isPrimary: ${existingTenantDomain.isPrimary}`);
      console.log(`   - isActive: ${existingTenantDomain.isActive}`);
      console.log(`   - isVerified: ${existingTenantDomain.isVerified}`);

      // Check if TenantDomain needs fixing
      const needsPrimaryFix = !existingTenantDomain.isPrimary;
      const needsActiveDomainFix = !existingTenantDomain.isActive;
      const needsVerifiedFix = !existingTenantDomain.isVerified;

      if (needsPrimaryFix || needsActiveDomainFix || needsVerifiedFix) {
        console.log('');
        console.log('🚨 TENANTDOMAIN RECORD ISSUES:');
        if (needsPrimaryFix) console.log('   ❌ isPrimary should be true for reliable resolution');
        if (needsActiveDomainFix) console.log('   ❌ isActive should be true');
        if (needsVerifiedFix) console.log('   ❌ isVerified should be true for production');

        console.log('🔧 Fixing TenantDomain record...');
        await prisma.tenantDomain.update({
          where: { id: existingTenantDomain.id },
          data: {
            isPrimary: true,
            isActive: true,
            isVerified: true,
            verifiedAt: new Date(),
            sslStatus: 'ACTIVE'
          }
        });
        console.log('✅ TenantDomain record configuration updated');
      } else {
        console.log('✅ TenantDomain record is correctly configured');
      }
    } else {
      console.log('❌ CRITICAL: No TenantDomain record found for demo.softellio.com');
      console.log('🔧 Creating TenantDomain record for production-reliable resolution...');

      const tenantDomain = await prisma.tenantDomain.create({
        data: {
          tenantId: demoTenant.id,
          domain: 'demo.softellio.com',
          type: 'SUBDOMAIN',
          isPrimary: true,
          isActive: true,
          isVerified: true,
          verificationToken: `demo-fix-${Date.now()}`,
          verifiedAt: new Date(),
          sslStatus: 'ACTIVE'
        }
      });

      console.log('✅ TenantDomain record created:');
      console.log(`   - ID: ${tenantDomain.id}`);
      console.log(`   - Domain: "${tenantDomain.domain}"`);
      console.log(`   - isPrimary: ${tenantDomain.isPrimary}`);
      console.log(`   - isActive: ${tenantDomain.isActive}`);
    }

    // ===========================================
    // STEP 3: Verification and Next Steps
    // ===========================================
    console.log('');
    console.log('🎯 VERIFICATION: Testing domain resolution...');

    // Verify the tenant can be found by all resolution methods
    const testResults = {
      byTenantDomain: false,
      byDirectDomain: false,
      bySlug: false
    };

    // Test TenantDomain lookup (Step 1 - should work now)
    const tenantDomainResult = await prisma.tenantDomain.findFirst({
      where: {
        domain: 'demo.softellio.com',
        isActive: true,
        tenant: { isActive: true, status: 'active' }
      },
      include: { tenant: true }
    });
    testResults.byTenantDomain = !!tenantDomainResult;

    // Test direct domain lookup (Step 2)
    const directResult = await prisma.tenant.findFirst({
      where: {
        domain: 'demo.softellio.com',
        isActive: true,
        status: 'active'
      }
    });
    testResults.byDirectDomain = !!directResult;

    // Test slug lookup (Step 3)
    const slugResult = await prisma.tenant.findFirst({
      where: {
        slug: 'demo',
        isActive: true,
        status: 'active'
      }
    });
    testResults.bySlug = !!slugResult;

    console.log('');
    console.log('📊 RESOLUTION TEST RESULTS:');
    console.log(`   ${testResults.byTenantDomain ? '✅' : '❌'} Step 1: TenantDomain lookup (PRIMARY)`);
    console.log(`   ${testResults.byDirectDomain ? '✅' : '❌'} Step 2: Direct domain lookup (LEGACY)`);
    console.log(`   ${testResults.bySlug ? '✅' : '❌'} Step 3: Slug extraction (FALLBACK)`);

    if (testResults.byTenantDomain) {
      console.log('');
      console.log('🎉 SUCCESS! Production-reliable tenant resolution is now configured!');
      console.log('');
      console.log('🌐 demo.softellio.com should now work correctly.');
      console.log('');
      console.log('📋 NEXT STEPS:');
      console.log('');
      console.log('1. 🔍 OPTIONAL: Enable debug logging to verify fix:');
      console.log('   echo "DEBUG_TENANT_RESOLUTION=true" >> .env');
      console.log('');
      console.log('2. 🔄 Restart your backend server:');
      console.log('   npm run start:dev');
      console.log('');
      console.log('3. 🧪 Test demo.softellio.com in browser');
      console.log('   - Should load the demo tenant website');
      console.log('   - No more "Temporary Site Issue"');
      console.log('');
      console.log('4. ✅ Check logs for successful resolution:');
      console.log('   Look for: "Step 1 SUCCESS: Found tenant demo via TenantDomain record"');
      console.log('');
      console.log('5. 🧹 OPTIONAL: Remove debug logging when satisfied:');
      console.log('   # Remove DEBUG_TENANT_RESOLUTION from .env');
      console.log('');
      console.log('🎯 The fix ensures demo.softellio.com uses TenantDomain table (Step 1) for');
      console.log('   production-reliable resolution instead of relying on slug extraction (Step 3).');
    } else {
      console.log('');
      console.log('❌ ISSUE: TenantDomain resolution test failed');
      console.log('   This indicates a database connectivity or constraint issue.');
      console.log('   Please check database logs and retry.');
    }

    console.log('');
    console.log('🏁 Production fix completed!');

  } catch (error) {
    console.error('❌ Production fix failed:', {
      message: error.message,
      stack: error.stack
    });
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('1. Check database connectivity');
    console.log('2. Ensure Prisma schema is up to date: npm run prisma:generate');
    console.log('3. Check for database constraint violations');
    console.log('4. Re-run this script: npx ts-node src/seeding/production-tenant-resolution-fix.ts');
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the production fix
fixDemoTenantResolution();