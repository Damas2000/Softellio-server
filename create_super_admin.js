const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createSuperAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:paIvAuMFwAEqMENtLISHZQKDmMdViJcL@gondola.proxy.rlwy.net:20241/railway?sslmode=require'
  });

  try {
    await client.connect();

    // Hash the password
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);

    // Create the super admin user
    const result = await client.query(`
      INSERT INTO users (email, password, name, role, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, name, role
    `, [
      'admin@softellio.com',
      hashedPassword,
      'Super Admin',
      'SUPER_ADMIN',
      true
    ]);

    console.log('✅ Super Admin user created successfully:');
    console.log(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️ Super Admin user already exists');
    } else {
      console.error('❌ Error creating Super Admin:', error.message);
    }
  } finally {
    await client.end();
  }
}

createSuperAdmin();