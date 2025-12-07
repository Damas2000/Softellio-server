const { PrismaClient } = require('@prisma/client');

async function addTenantDomain() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Adding tenant domain...');

    const domain = await prisma.tenantDomain.create({
      data: {
        tenantId: 1,
        domain: 'demo.softellio.com',
        type: 'custom',
        isPrimary: true,
        isActive: true,
        isVerified: true,
        verifiedAt: new Date()
      }
    });

    console.log('✅ Tenant domain added:', domain.domain);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTenantDomain();