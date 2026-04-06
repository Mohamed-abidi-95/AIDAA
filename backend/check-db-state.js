const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDbState() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'aidaa_db',
  });

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('TABLES:', tables.map((row) => Object.values(row)[0]).join(', '));

    const [contentCols] = await connection.query('SHOW COLUMNS FROM content');
    console.log('CONTENT_COLS:', contentCols.map((c) => c.Field).join(', '));

    const [logCols] = await connection.query('SHOW COLUMNS FROM activity_logs');
    console.log('ACTIVITY_LOG_COLS:', logCols.map((c) => c.Field).join(', '));

    const [messagesTable] = await connection.query("SHOW TABLES LIKE 'messages'");
    console.log('HAS_MESSAGES_TABLE:', messagesTable.length > 0 ? 'yes' : 'no');

    const [gamesTable] = await connection.query("SHOW TABLES LIKE 'games'");
    console.log('HAS_GAMES_TABLE:', gamesTable.length > 0 ? 'yes' : 'no');

    const [contentCount] = await connection.query('SELECT COUNT(*) AS total FROM content');
    console.log('CONTENT_COUNT:', contentCount[0].total);
  } finally {
    await connection.end();
  }
}

checkDbState().catch((err) => {
  console.error('DB check failed:', err.message);
  process.exit(1);
});

