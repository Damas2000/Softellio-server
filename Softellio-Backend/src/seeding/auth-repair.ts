import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../config/prisma.service';
import { Role } from '@prisma/client';

interface RepairResult {
  superAdmin: 'created' | 'updated' | 'already_valid';
  tenantAdmin: 'created' | 'updated' | 'already_valid';
  demoTenant: 'created' | 'updated' | 'already_exists';
}

async function bootstrap() {
  console.log('🔧 Starting Auth Repair Tool...');
  console.log('');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const authService = app.get(AuthService);
    const prismaService = app.get(PrismaService);

    const result: RepairResult = {
      superAdmin: 'already_valid',
      tenantAdmin: 'already_valid',
      demoTenant: 'already_exists'
    };

    // Step 1: Ensure demo tenant exists
    console.log('🏢 Checking demo tenant...');
    const demoTenant = await ensureDemoTenant(prismaService, result);
    console.log(`   ✅ Demo tenant (${demoTenant.domain}) is ready`);
    console.log('');

    // Step 2: Repair Super Admin
    console.log('👤 Checking Super Admin...');
    await repairSuperAdmin(authService, prismaService, result);
    console.log('');

    // Step 3: Repair Tenant Admin
    console.log('👨‍💼 Checking Tenant Admin...');
    await repairTenantAdmin(authService, prismaService, demoTenant.id, result);
    console.log('');

    // Report summary
    console.log('📋 REPAIR SUMMARY');
    console.log('─────────────────');
    console.log(`   Demo Tenant: ${getStatusEmoji(result.demoTenant)} ${result.demoTenant}`);
    console.log(`   Super Admin: ${getStatusEmoji(result.superAdmin)} ${result.superAdmin}`);
    console.log(`   Tenant Admin: ${getStatusEmoji(result.tenantAdmin)} ${result.tenantAdmin}`);
    console.log('');

    console.log('🔑 VERIFIED CREDENTIALS');
    console.log('─────────────────────────');
    console.log('   Super Admin:');
    console.log('     Email: admin@softellio.com');
    console.log('     Password: SuperAdmin123!');
    console.log('     Role: SUPER_ADMIN');
    console.log('     Tenant: None (system-wide access)');
    console.log('');
    console.log('   Tenant Admin:');
    console.log('     Email: admin@demo.softellio.com');
    console.log('     Password: TenantAdmin123!');
    console.log('     Role: TENANT_ADMIN');
    console.log('     Tenant: demo.softellio.com');
    console.log('');

    console.log('✨ Auth repair completed successfully!');
    console.log('🚀 You can now test login with the credentials above.');

  } catch (error) {
    console.error('❌ Auth repair failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function ensureDemoTenant(prisma: PrismaService, result: RepairResult) {
  const targetDomain = 'demo.softellio.com';

  let demoTenant = await prisma.tenant.findUnique({
    where: { domain: targetDomain }
  });

  if (!demoTenant) {
    // Create demo tenant
    console.log('   🆕 Creating demo tenant...');
    demoTenant = await prisma.tenant.create({
      data: {
        name: 'Demo Company',
        domain: targetDomain,
        defaultLanguage: 'tr',
        availableLanguages: ['tr', 'en'],
        isActive: true,
      },
    });
    result.demoTenant = 'created';
    console.log(`   ✅ Created tenant: ${demoTenant.name} (${demoTenant.domain})`);
  } else {
    // Check if tenant is active
    if (!demoTenant.isActive) {
      console.log('   🔄 Activating demo tenant...');
      demoTenant = await prisma.tenant.update({
        where: { id: demoTenant.id },
        data: { isActive: true }
      });
      result.demoTenant = 'updated';
      console.log('   ✅ Tenant activated');
    } else {
      console.log('   ✅ Demo tenant already exists and is active');
    }
  }

  return demoTenant;
}

async function repairSuperAdmin(authService: AuthService, prisma: PrismaService, result: RepairResult) {
  const targetEmail = 'admin@softellio.com';
  const targetPassword = 'SuperAdmin123!';
  const targetRole = Role.SUPER_ADMIN;

  let superAdmin = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  const hashedPassword = await authService.hashPassword(targetPassword);

  if (!superAdmin) {
    // Create super admin
    console.log('   🆕 Creating Super Admin...');
    superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrator',
        email: targetEmail,
        password: hashedPassword,
        role: targetRole,
        tenantId: null, // SUPER_ADMIN has no tenant
        isActive: true,
      },
    });
    result.superAdmin = 'created';
    console.log(`   ✅ Created Super Admin: ${superAdmin.email}`);
  } else {
    // Check if update needed
    const needsUpdate =
      !superAdmin.isActive ||
      superAdmin.role !== targetRole ||
      superAdmin.tenantId !== null ||
      !(await authService.validatePassword(targetPassword, superAdmin.password));

    if (needsUpdate) {
      console.log('   🔄 Updating Super Admin...');
      superAdmin = await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
          password: hashedPassword,
          role: targetRole,
          tenantId: null,
          isActive: true,
        },
      });
      result.superAdmin = 'updated';
      console.log('   ✅ Super Admin updated (password, role, status fixed)');
    } else {
      console.log('   ✅ Super Admin already valid');
    }
  }

  return superAdmin;
}

async function repairTenantAdmin(authService: AuthService, prisma: PrismaService, demoTenantId: number, result: RepairResult) {
  const targetEmail = 'admin@demo.softellio.com';
  const targetPassword = 'TenantAdmin123!';
  const targetRole = Role.TENANT_ADMIN;

  let tenantAdmin = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  const hashedPassword = await authService.hashPassword(targetPassword);

  if (!tenantAdmin) {
    // Create tenant admin
    console.log('   🆕 Creating Tenant Admin...');
    tenantAdmin = await prisma.user.create({
      data: {
        name: 'Tenant Administrator',
        email: targetEmail,
        password: hashedPassword,
        role: targetRole,
        tenantId: demoTenantId,
        isActive: true,
      },
    });
    result.tenantAdmin = 'created';
    console.log(`   ✅ Created Tenant Admin: ${tenantAdmin.email}`);
  } else {
    // Check if update needed
    const needsUpdate =
      !tenantAdmin.isActive ||
      tenantAdmin.role !== targetRole ||
      tenantAdmin.tenantId !== demoTenantId ||
      !(await authService.validatePassword(targetPassword, tenantAdmin.password));

    if (needsUpdate) {
      console.log('   🔄 Updating Tenant Admin...');
      tenantAdmin = await prisma.user.update({
        where: { id: tenantAdmin.id },
        data: {
          password: hashedPassword,
          role: targetRole,
          tenantId: demoTenantId,
          isActive: true,
        },
      });
      result.tenantAdmin = 'updated';
      console.log('   ✅ Tenant Admin updated (password, role, tenant, status fixed)');
    } else {
      console.log('   ✅ Tenant Admin already valid');
    }
  }

  return tenantAdmin;
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'created': return '🆕';
    case 'updated': return '🔄';
    case 'already_valid':
    case 'already_exists': return '✅';
    default: return '❓';
  }
}

// Execute the bootstrap function
bootstrap();