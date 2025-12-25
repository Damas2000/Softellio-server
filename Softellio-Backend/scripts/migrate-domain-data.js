const { PrismaClient } = require('@prisma/client');

async function migrateDomainData() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Starting domain data migration...');

    // Check what data currently exists
    console.log('📊 Checking existing data...');
    const existingDomains = await prisma.$queryRaw`
      SELECT id, domain, type, "sslStatus", status, "lastCheckedAt", "responseTime", metadata
      FROM tenant_domains
      LIMIT 10
    `;

    console.log(`Found ${existingDomains.length} existing domains:`, existingDomains);

    // Step 1: Update type column values to match new enums
    console.log('📝 Updating type column values...');

    const customUpdateResult = await prisma.$executeRaw`
      UPDATE tenant_domains
      SET type = 'CUSTOM'
      WHERE type = 'custom'
    `;
    console.log(`Updated ${customUpdateResult} 'custom' -> 'CUSTOM'`);

    const systemUpdateResult = await prisma.$executeRaw`
      UPDATE tenant_domains
      SET type = 'SYSTEM'
      WHERE type = 'subdomain' OR type = 'system'
    `;
    console.log(`Updated ${systemUpdateResult} 'subdomain/system' -> 'SYSTEM'`);

    // Step 2: Update sslStatus column values
    console.log('📝 Updating sslStatus column values...');

    const pendingUpdateResult = await prisma.$executeRaw`
      UPDATE tenant_domains
      SET "sslStatus" = 'PENDING'
      WHERE "sslStatus" = 'pending' OR "sslStatus" IS NULL
    `;
    console.log(`Updated ${pendingUpdateResult} 'pending/null' -> 'PENDING'`);

    const activeUpdateResult = await prisma.$executeRaw`
      UPDATE tenant_domains
      SET "sslStatus" = 'ACTIVE'
      WHERE "sslStatus" = 'active'
    `;
    console.log(`Updated ${activeUpdateResult} 'active' -> 'ACTIVE'`);

    const errorUpdateResult = await prisma.$executeRaw`
      UPDATE tenant_domains
      SET "sslStatus" = 'ERROR'
      WHERE "sslStatus" = 'error'
    `;
    console.log(`Updated ${errorUpdateResult} 'error' -> 'ERROR'`);

    // Step 3: Verify the updates
    console.log('✅ Verifying updates...');
    const updatedDomains = await prisma.$queryRaw`
      SELECT id, domain, type, "sslStatus", status
      FROM tenant_domains
    `;
    console.log('Updated domains:', updatedDomains);

    // Check for any invalid values
    const invalidTypes = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM tenant_domains
      WHERE type NOT IN ('CUSTOM', 'SYSTEM')
    `;
    console.log(`Invalid type values remaining: ${invalidTypes[0].count}`);

    const invalidSSL = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM tenant_domains
      WHERE "sslStatus" NOT IN ('PENDING', 'ACTIVE', 'ERROR')
    `;
    console.log(`Invalid sslStatus values remaining: ${invalidSSL[0].count}`);

    console.log('✅ Domain data migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDomainData();