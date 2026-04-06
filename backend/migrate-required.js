const mysql = require('mysql2/promise');
require('dotenv').config();

async function hasColumn(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [process.env.DB_DATABASE || 'aidaa_db', table, column]
  );
  return rows.length > 0;
}

async function hasIndex(connection, table, indexName) {
  const [rows] = await connection.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
    [process.env.DB_DATABASE || 'aidaa_db', table, indexName]
  );
  return rows.length > 0;
}

async function hasTable(connection, table) {
  const [rows] = await connection.query(
    `
SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? LIMIT 1`,
    [process.env.DB_DATABASE || 'aidaa_db', table]
  );
  return rows.length > 0;
}

async function main() {
  const dbName = process.env.DB_DATABASE || 'aidaa_db';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  });

  try {
    console.log('Running required migrations on DB:', dbName);

    // activity_logs columns
    if (!(await hasColumn(connection, 'activity_logs', 'action'))) {
      await connection.query("ALTER TABLE activity_logs ADD COLUMN action VARCHAR(50) DEFAULT 'content_accessed' AFTER status");
      console.log('Added column activity_logs.action');
    } else {
      console.log('Column activity_logs.action already exists');
    }

    if (!(await hasColumn(connection, 'activity_logs', 'score'))) {
      await connection.query('ALTER TABLE activity_logs ADD COLUMN score INT DEFAULT 0');
      console.log('Added column activity_logs.score');
    } else {
      console.log('Column activity_logs.score already exists');
    }

    if (!(await hasColumn(connection, 'activity_logs', 'duration_seconds'))) {
      await connection.query('ALTER TABLE activity_logs ADD COLUMN duration_seconds INT DEFAULT 0');
      console.log('Added column activity_logs.duration_seconds');
    } else {
      console.log('Column activity_logs.duration_seconds already exists');
    }

    if (!(await hasIndex(connection, 'activity_logs', 'idx_activity_logs_score'))) {
      await connection.query('CREATE INDEX idx_activity_logs_score ON activity_logs(score)');
      console.log('Created index idx_activity_logs_score');
    } else {
      console.log('Index idx_activity_logs_score already exists');
    }

    if (!(await hasIndex(connection, 'activity_logs', 'idx_activity_logs_duration'))) {
      await connection.query('CREATE INDEX idx_activity_logs_duration ON activity_logs(duration_seconds)');
      console.log('Created index idx_activity_logs_duration');
    } else {
      console.log('Index idx_activity_logs_duration already exists');
    }

    // messages table
    if (!(await hasTable(connection, 'messages'))) {
      await connection.query(`
        CREATE TABLE messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          child_id INT NOT NULL,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE,
          FOREIGN KEY(sender_id) REFERENCES users(id),
          FOREIGN KEY(receiver_id) REFERENCES users(id),
          INDEX idx_messages_child_id (child_id),
          INDEX idx_messages_sender_id (sender_id),
          INDEX idx_messages_receiver_id (receiver_id),
          INDEX idx_messages_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Created table messages');
    } else {
      console.log('Table messages already exists');
    }

    // games table
    if (!(await hasTable(connection, 'games'))) {
      await connection.query(`
        CREATE TABLE games (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          description TEXT,
          type VARCHAR(50),
          thumbnail_url VARCHAR(255),
          instructions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_games_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Created table games');
    } else {
      console.log('Table games already exists');
    }

    // seed games if empty
    const [gameCountRows] = await connection.query('SELECT COUNT(*) AS total FROM games');
    if (gameCountRows[0].total === 0) {
      await connection.query(
        `INSERT INTO games (title, description, type, instructions) VALUES
         ('Color Match', 'Click the correct color button that matches the word', 'color_match', 'Read the color name displayed and click the matching color button.'),
         ('Memory Game', 'Match pairs of cards in this memory matching game', 'memory', 'Click on cards to reveal them, find matching pairs.'),
         ('Sound Recognition', 'Hear a sound and select the correct image', 'sound_recognition', 'Listen to the sound played and click the matching image.')`
      );
      console.log('Inserted seed games');
    } else {
      console.log('Seed games skipped (table not empty)');
    }

    console.log('Required migrations completed successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

