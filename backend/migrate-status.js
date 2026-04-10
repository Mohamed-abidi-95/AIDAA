const { query } = require('./src/config/db');

async function migrate() {
  try {
    // Add status column to users
    await query(
      "ALTER TABLE users ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'"
    );
    console.log('Column status added successfully');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('Column status already exists');
    } else {
      console.error('Error:', e.message);
      process.exit(1);
    }
  }

  try {
    // All existing users are approved
    await query("UPDATE users SET status = 'approved' WHERE status = 'approved'");
    console.log('Existing users set to approved');
    process.exit(0);
  } catch (e) {
    console.error('Error updating users:', e.message);
    process.exit(1);
  }
}

migrate();

