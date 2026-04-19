// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================
// Main application configuration, middleware setup, and route mounting

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// ============================================================================
// Import routes
// ============================================================================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const childRoutes = require('./routes/child.routes');
const contentRoutes = require('./routes/content.routes');
const activityLogRoutes = require('./routes/activityLog.routes');
const noteRoutes = require('./routes/note.routes');
const messageRoutes = require('./routes/message.routes');
const gameRoutes         = require('./routes/game.routes');
const teleconsultRoutes  = require('./routes/teleconsult.routes');
const adminRoutes        = require('./routes/admin.routes');
const parentRoutes       = require('./routes/parent.routes');
const professionalRoutes = require('./routes/professional.routes');
const sequenceRoutes     = require('./routes/sequence.routes');
const aacRoutes          = require('./routes/aac.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const chatbotRoutes      = require('./routes/chatbot.routes');

// ============================================================================
// Import middlewares
// ============================================================================
const errorHandler = require('./middlewares/errorHandler');
const { query: dbQuery } = require('./config/db');

// ============================================================================
// AUTO-MIGRATION : create / alter missing tables and columns on startup
// ============================================================================
const autoMigrate = async () => {
  const run = async (label, sql) => {
    try {
      await dbQuery(sql);
      console.log(`[DB] ✅ ${label}`);
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('Duplicate column')) {
        console.warn(`[DB] ⚠️  ${label}: ${e.message}`);
      }
    }
  };

  // ── professional_invitations ──────────────────────────────────────────────
  await run('professional_invitations table', `
    CREATE TABLE IF NOT EXISTS professional_invitations (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      parent_id       INT NOT NULL,
      professional_id INT NOT NULL,
      status          ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
      invited_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id)       REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_assignment  (parent_id, professional_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── children — colonne manquante (cause de l'erreur de création) ──────────
  await run('children.participant_category', `
    ALTER TABLE children
    ADD COLUMN participant_category ENUM('enfant','jeune','adulte') NOT NULL DEFAULT 'enfant'
  `);

  // ── users — colonnes ajoutées post-schéma initial ─────────────────────────
  await run('users.status',              `ALTER TABLE users ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'`);
  await run('users.reset_token',         `ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`);
  await run('users.reset_token_expires', `ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`);
  await run('users.specialite',          `ALTER TABLE users ADD COLUMN specialite VARCHAR(100) DEFAULT NULL`);

  // ── activity_logs — colonnes analytics ───────────────────────────────────
  await run('activity_logs.score',            `ALTER TABLE activity_logs ADD COLUMN score INT DEFAULT 0`);
  await run('activity_logs.duration_seconds', `ALTER TABLE activity_logs ADD COLUMN duration_seconds INT DEFAULT 0`);
  await run('activity_logs.action',           `ALTER TABLE activity_logs ADD COLUMN action VARCHAR(50) DEFAULT 'content_accessed'`);
  await run('activity_logs.content_id nullable', `ALTER TABLE activity_logs MODIFY COLUMN content_id INT DEFAULT NULL`);

  // ── content — colonnes étendues ───────────────────────────────────────────
  await run('content.category_color',       `ALTER TABLE content ADD COLUMN category_color VARCHAR(20) DEFAULT '#64748b'`);
  await run('content.emoji',                `ALTER TABLE content ADD COLUMN emoji VARCHAR(10) DEFAULT '📄'`);
  await run('content.duration',             `ALTER TABLE content ADD COLUMN duration VARCHAR(20) DEFAULT NULL`);
  await run('content.steps',                `ALTER TABLE content ADD COLUMN steps INT DEFAULT NULL`);
  await run('content.minutes',              `ALTER TABLE content ADD COLUMN minutes INT DEFAULT NULL`);
  await run('content.emoji_color',          `ALTER TABLE content ADD COLUMN emoji_color VARCHAR(20) DEFAULT NULL`);
  await run('content.participant_category', `ALTER TABLE content ADD COLUMN participant_category ENUM('enfant','jeune','adulte') DEFAULT 'enfant'`);

  // ── tables optionnelles ───────────────────────────────────────────────────
  await run('messages table', `CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY, child_id INT NOT NULL,
    sender_id INT NOT NULL, receiver_id INT NOT NULL, content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id), FOREIGN KEY (receiver_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('games table', `CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(100) NOT NULL,
    description TEXT, type VARCHAR(50), thumbnail_url VARCHAR(255),
    instructions TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('guided_sequences table', `CREATE TABLE IF NOT EXISTS guided_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT,
    emoji VARCHAR(10) DEFAULT '🔵', duration_minutes INT DEFAULT 5,
    difficulty VARCHAR(50) DEFAULT 'facile',
    participant_category ENUM('enfant','jeune','adulte') DEFAULT 'enfant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('sequence_steps table', `CREATE TABLE IF NOT EXISTS sequence_steps (
    id INT AUTO_INCREMENT PRIMARY KEY, sequence_id INT NOT NULL,
    step_number INT NOT NULL, title VARCHAR(200) NOT NULL, description TEXT,
    emoji VARCHAR(10) DEFAULT '▶️', duration_seconds INT DEFAULT 60,
    FOREIGN KEY (sequence_id) REFERENCES guided_sequences(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('aac_symbols table', `CREATE TABLE IF NOT EXISTS aac_symbols (
    id INT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🔵', category VARCHAR(100) DEFAULT 'Général',
    color VARCHAR(20) DEFAULT '#64748b',
    participant_category ENUM('enfant','jeune','adulte') DEFAULT 'enfant',
    sort_order INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('badges table', `CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🏅', color VARCHAR(20) DEFAULT '#f59e0b',
    condition_type VARCHAR(50) DEFAULT 'activities', condition_value INT DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('child_badges table', `CREATE TABLE IF NOT EXISTS child_badges (
    child_id INT NOT NULL, badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id, badge_id),
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await run('teleconsultations.created_at', `ALTER TABLE teleconsultations ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  await run('teleconsultations.status', `ALTER TABLE teleconsultations ADD COLUMN status ENUM('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled'`);
  await run('teleconsultations.room_id', `ALTER TABLE teleconsultations ADD COLUMN room_id VARCHAR(120) NULL`);
  await run('teleconsultations.reminder_sent', `ALTER TABLE teleconsultations ADD COLUMN reminder_sent TINYINT NOT NULL DEFAULT 0`);

  // ── messages — colonne is_read pour le compteur de non-lus ───────────────
  await run('messages.is_read', `ALTER TABLE messages ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0`);

  // ── Module Chatbot IA ─────────────────────────────────────────────────────
  await run('chatbot_consent_log table', `
    CREATE TABLE IF NOT EXISTS chatbot_consent_log (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      parent_id    INT NOT NULL,
      consent_given TINYINT(1) NOT NULL DEFAULT 1,
      ip_address   VARCHAR(45) DEFAULT NULL,
      user_agent   TEXT DEFAULT NULL,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run('chatbot_sessions table', `
    CREATE TABLE IF NOT EXISTS chatbot_sessions (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      parent_id        INT NOT NULL,
      child_id         INT DEFAULT NULL,
      consent_verified TINYINT(1) NOT NULL DEFAULT 0,
      started_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at         TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id)  REFERENCES children(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run('chatbot_messages table', `
    CREATE TABLE IF NOT EXISTS chatbot_messages (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      session_id   INT NOT NULL,
      sender       ENUM('user','bot') NOT NULL,
      message_text TEXT NOT NULL,
      intent       ENUM('faq','recommendation','emergency','greeting','unknown') NOT NULL DEFAULT 'unknown',
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chatbot_sessions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await run('faq_entries table', `
    CREATE TABLE IF NOT EXISTS faq_entries (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      category     VARCHAR(100) NOT NULL,
      question_fr  TEXT NOT NULL,
      question_ar  TEXT DEFAULT NULL,
      answer_fr    TEXT NOT NULL,
      answer_ar    TEXT DEFAULT NULL,
      keywords_json JSON DEFAULT NULL,
      is_active    TINYINT(1) NOT NULL DEFAULT 1,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('[DB] ✅ Auto-migration complète');
};
autoMigrate();

// ============================================================================
// Create Express app
// ============================================================================
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS middleware
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;

const corsOriginMatcher = (origin, callback) => {
  // Allow non-browser clients/tools without Origin header
  if (!origin) return callback(null, true);

  // Explicit wildcard support from .env (CORS_ORIGIN=*)
  if (corsOrigins.includes('*')) return callback(null, true);

  // Accept configured explicit origins
  if (corsOrigins.includes(origin)) return callback(null, true);

  // Helpful for Vite dev servers started on dynamic localhost ports (e.g. 5174)
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Not allowed by CORS: ${origin}`));
};

app.use(cors({
  origin: corsOriginMatcher,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ============================================================================
// SECURITY HEADERS (Helmet)
// ============================================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads serving
}));

// ============================================================================
// RATE LIMITING — protect against brute-force & DDoS
// ============================================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // max 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard.' },
});
app.use('/api', apiLimiter);

// Stricter limit for auth endpoints (login / signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, veuillez réessayer dans 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// JSON middleware
app.use(express.json());

// ============================================================================
// SERVE STATIC FILES (UPLOADS)
// ============================================================================
// Serve uploaded files from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/child', childRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/note', noteRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/teleconsult', teleconsultRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/parent',         parentRoutes);
app.use('/api/professional',   professionalRoutes);
app.use('/api/sequences',      sequenceRoutes);
app.use('/api/aac',            aacRoutes);
app.use('/api/gamification',   gamificationRoutes);
app.use('/api/analytics',      analyticsRoutes);
app.use('/api/chatbot',        chatbotRoutes);

// ============================================================================
// 404 Error Handler
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================================================
// Global Error Handler (MUST be last middleware)
// ============================================================================
app.use(errorHandler);

module.exports = app;
