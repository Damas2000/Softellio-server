const bcrypt = require('bcrypt');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

async function generateSuperAdminToken() {
  const client = new Client({
    connectionString: 'postgresql://postgres:paIvAuMFwAEqMENtLISHZQKDmMdViJcL@gondola.proxy.rlwy.net:20241/railway?sslmode=require'
  });

  try {
    await client.connect();

    // Find the super admin user
    const result = await client.query(`
      SELECT id, email, role FROM users WHERE role = 'SUPER_ADMIN' AND "isActive" = true LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('No active super admin found');
      return;
    }

    const user = result.rows[0];
    console.log('Found super admin:', user);

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: null
    };

    const token = jwt.sign(payload, 'super-secret-jwt-key', { expiresIn: '1h' });
    console.log('Generated token:', token);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

generateSuperAdminToken();
