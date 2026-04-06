// ============================================================================
// INSERT PROFESSIONAL TEST USER - NODE.JS SCRIPT
// ============================================================================

const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function insertProfessionalUser() {
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
    const password = 'professional123';
    const hashedPassword = await bcryptjs.hash(password, 12);
    console.log('✅ Password hashed');

    // Insert professional user
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role, is_active) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id
    `;

    await connection.execute(insertUserQuery, [
      'Dr. Professional Test',
      'professional@aidaa.com',
      hashedPassword,
      'professional',
      1
    ]);

    console.log('✅ Professional user inserted/updated');

    // Get professional ID
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['professional@aidaa.com']
    );

    const professionalId = users[0].id;
    console.log(`✅ Professional ID: ${professionalId}`);

    // Display results
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📝 LOGIN CREDENTIALS - PROFESSIONAL/DOCTOR');
    console.log('════════════════════════════════════════════════════════════');
    console.log('Email:    professional@aidaa.com');
    console.log('Password: professional123');
    console.log('Role:     professional');
    console.log('════════════════════════════════════════════════════════════\n');

    // Verify
    const [verifyUsers] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      ['professional@aidaa.com']
    );

    console.log('✅ Professional user verified in database:');
    console.log(verifyUsers[0]);

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
insertProfessionalUser();

