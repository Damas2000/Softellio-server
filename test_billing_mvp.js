const { PrismaClient } = require('@prisma/client');

async function testBillingMVP() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing Billing MVP...\n');

    // 1. Check if subscription fields exist in Tenant model
    console.log('1. Testing Tenant model subscription fields...');

    // Find a tenant or create one for testing
    let tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.log('Creating a test tenant...');
      tenant = await prisma.tenant.create({
        data: {
          name: 'Test Tenant',
          slug: 'test-tenant',
          domain: 'test.example.com',
          subscriptionStatus: 'trial', // Test the new field
          planKey: 'basic',            // Test the new field
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      });
      console.log('✅ Test tenant created with subscription fields');
    } else {
      console.log('Found existing tenant:', tenant.name);
      console.log('Current subscription status:', tenant.subscriptionStatus);
      console.log('Current plan:', tenant.planKey);
    }

    // 2. Test subscription status updates
    console.log('\n2. Testing subscription status updates...');

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'active',
        planKey: 'pro',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      }
    });

    console.log('✅ Subscription updated to:', updatedTenant.subscriptionStatus);
    console.log('✅ Plan updated to:', updatedTenant.planKey);

    // 3. Test querying subscription data
    console.log('\n3. Testing subscription queries...');

    const subscriptionData = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        planKey: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      }
    });

    console.log('✅ Subscription data retrieved:', subscriptionData);

    // 4. Test enum values
    console.log('\n4. Testing enum values...');

    const validStatuses = ['trial', 'active', 'expired', 'canceled', 'past_due'];
    const validPlans = ['basic', 'pro', 'custom'];

    for (const status of validStatuses) {
      try {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { subscriptionStatus: status }
        });
        console.log(`✅ Status '${status}' is valid`);
      } catch (error) {
        console.log(`❌ Status '${status}' is invalid:`, error.message);
      }
    }

    for (const plan of validPlans) {
      try {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { planKey: plan }
        });
        console.log(`✅ Plan '${plan}' is valid`);
      } catch (error) {
        console.log(`❌ Plan '${plan}' is invalid:`, error.message);
      }
    }

    console.log('\n🎉 Billing MVP database tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing billing MVP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBillingMVP();