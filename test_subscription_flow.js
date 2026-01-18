const { PrismaClient } = require('@prisma/client');

async function testSubscriptionFlow() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing Subscription Flow...\n');

    const tenantId = 1; // Demo Company

    // 1. Show current subscription status
    console.log('1. Current subscription status:');
    let tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        subscriptionStatus: true,
        planKey: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      }
    });
    console.log(tenant);

    // 2. Test mock checkout functionality (similar to the billing service)
    console.log('\n2. Simulating mock checkout...');
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'active',
        planKey: 'pro',
        currentPeriodStart: now,
        currentPeriodEnd: oneYearLater,
      },
      select: {
        subscriptionStatus: true,
        planKey: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      }
    });

    console.log('✅ Subscription updated to active:');
    console.log(updatedTenant);

    // Calculate days remaining
    const diffTime = oneYearLater.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(`📅 Days remaining: ${daysRemaining}`);

    console.log('\n3. Subscription is now ACTIVE - admin routes should work!');
    console.log('🎯 Test admin routes now - they should not be blocked by subscription guard');

  } catch (error) {
    console.error('❌ Error testing subscription flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionFlow();