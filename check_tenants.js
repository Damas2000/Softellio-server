const { PrismaClient } = require('@prisma/client');

async function checkTenants() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking tenants...');
    const tenants = await prisma.tenant.findMany({
      include: {
        tenantDomains: true
      }
    });

    console.log(`Found ${tenants.length} tenants:`);
    tenants.forEach(tenant => {
      console.log(`- ID: ${tenant.id}, Name: ${tenant.name}, Slug: ${tenant.slug}`);
      console.log(`  Domains: ${tenant.tenantDomains?.map(d => d.domain).join(', ') || 'none'}`);
    });

    console.log('\n🔍 Checking tenant domains...');
    const domains = await prisma.tenantDomain.findMany();
    console.log(`Found ${domains.length} tenant domains:`);
    domains.forEach(domain => {
      console.log(`- Domain: ${domain.domain}, Tenant ID: ${domain.tenantId}, Active: ${domain.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();