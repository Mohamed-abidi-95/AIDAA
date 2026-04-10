// ============================================================================
// AUTH ROUTES - auth.routes.js
// ============================================================================
// Authentication endpoints for login and password setup
// Routes:
//   POST /login          - User login with email + password
//   POST /set-password   - First-time password setup for new accounts
//   POST /signup         - Parent self-signup

// Import Express Router for creating route module
const express = require('express');
// Import authentication controller functions
const authController = require('../controllers/auth.controller');

// ============================================================================
// CREATE ROUTER INSTANCE
// ============================================================================
// Create a new Router instance for this module
// Router allows creating routes that can be mounted on app
// Example: app.use('/api/auth', router)
const router = express.Router();

// ============================================================================
// POST /api/auth/login
// ============================================================================
// Authenticate user with email and password
// Request body: { email, password }
// Response (password exists):
//   { success: true, token: "jwt", user: { id, name, email, role } }
// Response (first-time, password is NULL):
//   { success: true, mustSetPassword: true, userId: 1 }
// Response (error):
//   { success: false, message: "..." }
// Handler: Maps to authController.login
router.post(
  // Route path relative to mounted path
  '/login',
  // Route handler - calls login controller
  authController.login
);

router.post('/signup', authController.signup);
router.post('/signup-professional', authController.signupProfessional);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ============================================================================
// POST /api/auth/set-password
// ============================================================================
// Set password for first-time user (parents with NULL password)
// Request body: { userId, password }
// Response (success):
//   { success: true, token: "jwt", user: { id, name, email, role } }
// Response (error):
//   { success: false, message: "..." }
// Handler: Maps to authController.setPassword
router.post(
  // Route path: /set-password
  '/set-password',
  // Route handler - calls setPassword controller
  authController.setPassword
);

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export router so it can be mounted on main app
// Usage in app.js: app.use('/api/auth', authRoutes)
// This makes routes available at /api/auth/login and /api/auth/set-password
module.exports = router;
