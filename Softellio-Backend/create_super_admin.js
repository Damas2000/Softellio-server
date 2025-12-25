const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  const prisma = new PrismaClient();

  try {
    // Check if super admin already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@softellio.com' }
    });

    if (existingUser) {
      console.log('Super admin already exists:', existingUser.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@softellio.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Admin',
        isActive: true,
        tenantId: null // Super admin is not associated with any tenant
      }
    });

    console.log('Super admin created:', superAdmin.email);
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();