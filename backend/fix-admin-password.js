const bcryptjs = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminPassword() {
  console.log('\n=== Fixing Admin Password ===\n');
  console.log('Step 1: Generating hash...');

  try {
    // Generate correct hash for admin123 with bcryptjs
    const password = 'admin123';
    console.log('Hashing password with bcryptjs...');
    const hash = await bcryptjs.hash(password, 12);
    console.log('Hash generated!');

    console.log('Generated bcryptjs hash for "admin123":');
    console.log(hash);
    console.log('\nUpdating database...\n');

    // Connect to database
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aidaa_db'
    });

    // Update admin password
    await conn.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hash, 'admin@aidaa.com']
    );

    console.log('✓ Admin password updated successfully!');

    // Verify
    const [users] = await conn.query(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      ['admin@aidaa.com']
    );

    if (users.length > 0) {
      console.log('\nVerification - Admin user:');
      console.log('  Email:', users[0].email);
      console.log('  New Hash:', users[0].password);
    }

    await conn.end();
    console.log('\n✓ Done!\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();


