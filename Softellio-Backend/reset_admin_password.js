const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  const prisma = new PrismaClient();

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Update the super admin password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@softellio.com' },
      data: { password: hashedPassword }
    });

    console.log('Password updated for:', updatedUser.email);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();