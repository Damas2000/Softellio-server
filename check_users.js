const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
        tenant: {
          select: {
            name: true,
            domain: true,
          }
        }
      }
    });

    console.log('Users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, TenantID: ${user.tenantId}, Active: ${user.isActive}`);
      if (user.tenant) {
        console.log(`  -> Tenant: ${user.tenant.name} (${user.tenant.domain})`);
      }
    });

    // Also check tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        subscriptionStatus: true,
        planKey: true,
      }
    });

    console.log('\nTenants in database:');
    tenants.forEach(tenant => {
      console.log(`ID: ${tenant.id}, Name: ${tenant.name}, Domain: ${tenant.domain}, Status: ${tenant.subscriptionStatus}, Plan: ${tenant.planKey}`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();