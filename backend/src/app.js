// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================
// Main application configuration, middleware setup, and route mounting

const express = require('express');
const cors = require('cors');
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

// ============================================================================
// Import middlewares
// ============================================================================
const errorHandler = require('./middlewares/errorHandler');
const { query: dbQuery } = require('./config/db');

// ============================================================================
// AUTO-MIGRATION : create missing tables on startup
// ============================================================================
const autoMigrate = async () => {
  try {
    await dbQuery(`
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
    console.log('[DB] ✅ professional_invitations table ready');
  } catch (e) {
    // Table may already exist or minor constraint issue — not fatal
    if (!e.message.includes('already exists')) {
      console.warn('[DB] auto-migrate warning:', e.message);
    }
  }
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
