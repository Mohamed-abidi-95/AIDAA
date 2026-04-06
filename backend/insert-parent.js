// ============================================================================
// INSERT PARENT TEST USER - NODE.JS SCRIPT
// ============================================================================

const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function insertParentUser() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'aidaa_db'
    });

    console.log('✅ Connected to database');

    // Hash password
    const password = 'parent123';
    const hashedPassword = await bcryptjs.hash(password, 12);
    console.log('✅ Password hashed');

    // Insert parent user
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role, is_active) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id
    `;

    const [userResult] = await connection.execute(insertUserQuery, [
      'Parent Test',
      'parent@aidaa.com',
      hashedPassword,
      'parent',
      1
    ]);

    console.log('✅ Parent user inserted/updated');

    // Get parent ID
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['parent@aidaa.com']
    );

    const parentId = users[0].id;
    console.log(`✅ Parent ID: ${parentId}`);

    // Insert test child
    const insertChildQuery = `
      INSERT INTO children (parent_id, name, age)
      VALUES (?, ?, ?)
    `;

    await connection.execute(insertChildQuery, [parentId, 'Test Child 1', 5]);
    console.log('✅ Test child inserted');

    // Display results
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📝 LOGIN CREDENTIALS - PARENT');
    console.log('════════════════════════════════════════════════════════════');
    console.log('Email:    parent@aidaa.com');
    console.log('Password: parent123');
    console.log('Role:     parent');
    console.log('════════════════════════════════════════════════════════════\n');

    // Verify
    const [verifyUsers] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      ['parent@aidaa.com']
    );

    console.log('✅ User verified in database:');
    console.log(verifyUsers[0]);

    const [verifyChildren] = await connection.execute(
      'SELECT c.id, c.name, c.age FROM children c WHERE c.parent_id = ?',
      [parentId]
    );

    console.log('\n✅ Child verified in database:');
    console.log(verifyChildren[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the script
insertParentUser();

