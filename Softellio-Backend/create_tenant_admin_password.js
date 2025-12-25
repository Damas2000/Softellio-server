const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createTenantAdminPassword() {
  const prisma = new PrismaClient();

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Update the tenant admin password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@demo.softellio.com' },
      data: { password: hashedPassword }
    });

    console.log('Password updated for:', updatedUser.email);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTenantAdminPassword();