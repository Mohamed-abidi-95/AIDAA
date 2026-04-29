// ============================================================================
// SERVER STARTUP
// ============================================================================
// Entry point for the application

const app = require('./app');
require('dotenv').config();

// Fallback JWT_SECRET si .env manquant (évite crash en dev)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'aidaa_super_secret_pfe_2026_fallback';
  console.warn('[Config] ⚠️  JWT_SECRET non défini — utilisation du fallback. Créez le fichier .env !');
}
if (!process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = '*';
}

// ============================================================================
// Get port from environment or use default
// ============================================================================
const PORT = process.env.PORT || 5000;

// ============================================================================
// Start server
// ============================================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           AIDAA Backend Server Started                          ║');
  console.log(`║           Running on: http://localhost:${PORT}${' '.repeat(Math.max(0, 30 - PORT.toString().length))}║`);
  console.log('║           Environment: ' + (process.env.NODE_ENV || 'development').toUpperCase() + ' '.repeat(Math.max(0, 37 - (process.env.NODE_ENV || 'development').length)) + '║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
});

// ============================================================================
// Handle uncaught exceptions
// ============================================================================
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
