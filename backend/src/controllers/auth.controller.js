// ============================================================================
// AUTH CONTROLLER - auth.controller.js
// ============================================================================
// Handles all authentication workflows: login and first-time password setup
// Uses JWT for token generation and bcryptjs for password hashing
// Main flows:
//   1. Parent/Professional login: email + password → JWT token
//   2. First-time parent setup: email (no password) → user exists with NULL password
//   3. First-time password: userId + new password → hash + store → JWT token

// Import JWT library for token signing
const jwt = require('jsonwebtoken');
// Import bcryptjs for password hashing and comparison
const bcryptjs = require('bcryptjs');
// Import user model for database operations
const userModel = require('../models/user.model');
// Import query helper for direct DB operations
const { query } = require('../config/db');

// ============================================================================
// LOGIN CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/login
// Purpose: Authenticate user with email and password
// Request body: { email, password }
// Response: 
//   Success with token: { success: true, token, user: {...} }
//   First-time password setup: { success: true, mustSetPassword: true, userId }
//   Error: { success: false, message: '...' }
const login = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Destructure email and password from request body
    const { email, password } = req.body;

    // ====================================================================
    // INPUT VALIDATION
    // ====================================================================
    // Check if email was provided
    if (!email) {
      // Return 400 (Bad Request) if email is missing
      return res.status(400).json({
        // Standard response format: success flag
        success: false,
        // User-friendly error message
        message: 'Email is required',
      });
    }

    // Check if password was provided
    if (!password) {
      // Return 400 (Bad Request) if password is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'Password is required',
      });
    }

    // ====================================================================
    // FIND USER IN DATABASE
    // ====================================================================
    // Query database for user with this email
    const user = await userModel.findByEmail(email);
    
    // Check if user exists
    if (!user) {
      // Return 401 (Unauthorized) - user not found
      return res.status(401).json({
        // Standard response format
        success: false,
        // Generic message for security (don't reveal if email exists)
        message: 'Invalid email or password',
      });
    }

    // ====================================================================
    // CHECK IF FIRST-TIME LOGIN (PASSWORD IS EMPTY OR NULL)
    // ====================================================================
    // For parent accounts created by admin, password is initially empty or NULL
    if (!user.password || user.password.trim() === '') {
      // Return 200 (OK) with flag indicating password setup needed
      return res.status(200).json({
        // Standard response format
        success: true,
        // Flag indicating user must set password first
        mustSetPassword: true,
        // User ID needed for setPassword endpoint
        userId: user.id,
        // Additional info for frontend
        message: 'Password not set. Please set your password first.',
      });
    }

    // ====================================================================
    // CHECK IF USER ACCOUNT IS ACTIVE
    // ====================================================================
    // Admin can deactivate accounts (is_active = 0)
    if (!user.is_active) {
      // Check if pending approval
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          pendingApproval: true,
          message: 'Your account is pending admin approval.',
        });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your registration was rejected. Contact an administrator.',
        });
      }
      // Return 403 (Forbidden) - account is disabled
      return res.status(403).json({
        // Standard response format
        success: false,
        // Message explaining account is inactive
        message: 'Account is inactive. Contact administrator.',
      });
    }

    // ====================================================================
    // VERIFY PASSWORD WITH BCRYPT
    // ====================================================================
    // Compare provided password with stored bcrypt hash
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    
    // Check if password matches
    if (!isPasswordValid) {
      // Return 401 (Unauthorized) - password incorrect
      return res.status(401).json({
        // Standard response format
        success: false,
        // Generic message for security
        message: 'Invalid email or password',
      });
    }

    // ====================================================================
    // GENERATE JWT TOKEN
    // ====================================================================
    // Create JWT payload with non-sensitive user information
    // Payload includes: id, name, email, role
    const token = jwt.sign(
      // JWT payload object (stored in token and decoded on verification)
      {
        // User ID for database lookups
        id: user.id,
        // User's full name
        name: user.name,
        // User's email address
        email: user.email,
        // User's role: 'admin', 'parent', or 'professional'
        role: user.role,
      },
      // Secret key for signing (should be strong, from environment)
      process.env.JWT_SECRET,
      // Token expiration time from environment (e.g., '7d')
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================
    // Return 200 (OK) with token and user info
    res.status(200).json({
      // Standard response format
      success: true,
      // Message confirming successful login
      message: 'Login successful',
      // Response data object containing token and user info
      data: {
        // JWT token for Authorization header in future requests
        token,
        // User information for frontend
        user: {
          // User ID
          id: user.id,
          // User's full name
          name: user.name,
          // User's email
          email: user.email,
          // User's role for authorization
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Login error:', error);
    // Return 500 (Internal Server Error) with error details
    res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message
      message: 'Login failed',
      // Error details (only in development)
      error: error.message,
    });
  }
};

// ============================================================================
// SET PASSWORD CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/set-password
// Purpose: Set password for first-time user (parent with NULL password)
// Request body: { userId, password }
// Response: { success: true, token, user: {...} } or error
// Flow: Parent receives email → clicks link → this endpoint → password hashed → JWT returned
const setPassword = async (req, res) => {
  // Wrap entire logic in try-catch for error handling
  try {
    // Destructure userId and password from request body
    const { userId, password } = req.body;

    // ====================================================================
    // INPUT VALIDATION
    // ====================================================================
    // Check if userId was provided
    if (!userId) {
      // Return 400 (Bad Request) if userId is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'User ID is required',
      });
    }

    // Check if password was provided
    if (!password) {
      // Return 400 (Bad Request) if password is missing
      return res.status(400).json({
        // Standard response format
        success: false,
        // User-friendly error message
        message: 'Password is required',
      });
    }

    // ====================================================================
    // VALIDATE PASSWORD STRENGTH
    // ====================================================================
    // Check minimum password length (OWASP recommendation: at least 8)
    // We use 6 as minimum for flexibility, but can be increased
    if (password.length < 6) {
      // Return 400 (Bad Request) if password is too short
      return res.status(400).json({
        // Standard response format
        success: false,
        // Message explaining password requirement
        message: 'Password must be at least 6 characters long',
      });
    }

    // ====================================================================
    // FIND USER IN DATABASE
    // ====================================================================
    // Query database for user with this ID
    const user = await userModel.findById(userId);
    
    // Check if user exists
    if (!user) {
      // Return 404 (Not Found) if user doesn't exist
      return res.status(404).json({
        // Standard response format
        success: false,
        // Message indicating user not found
        message: 'User not found',
      });
    }

    // ====================================================================
    // CHECK IF PASSWORD ALREADY SET
    // ====================================================================
    // Ensure user doesn't already have a password
    // (prevent overwriting existing password without proper verification)
    if (user.password) {
      // Return 400 (Bad Request) if password already set
      return res.status(400).json({
        // Standard response format
        success: false,
        // Message explaining password already exists
        message: 'Password already set. Use login endpoint instead.',
      });
    }

    // ====================================================================
    // HASH PASSWORD WITH BCRYPT
    // ====================================================================
    // Number of salt rounds (iterations) for bcrypt hashing
    // Higher = slower (more secure), lower = faster
    // 12 rounds provides strong security and reasonable performance
    const saltRounds = 12;
    
    // Generate bcrypt hash from plaintext password
    // bcryptjs.hash is async and CPU-intensive (computationally expensive)
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // ====================================================================
    // UPDATE USER PASSWORD IN DATABASE
    // ====================================================================
    // Call model function to store hashed password
    const updateSuccess = await userModel.setUserPassword(userId, hashedPassword);
    
    // Check if password update was successful
    if (!updateSuccess) {
      // Return 500 (Internal Server Error) if update failed
      return res.status(500).json({
        // Standard response format
        success: false,
        // Message indicating database operation failed
        message: 'Failed to set password',
      });
    }

    // ====================================================================
    // ACTIVATE PENDING PROFESSIONAL INVITATIONS
    // ====================================================================
    // If this user is a professional, mark all their pending invitations as
    // 'active' now that their account is fully configured.
    if (user.role === 'professional') {
      try {
        await query(
          `UPDATE professional_invitations
           SET status = 'active'
           WHERE professional_id = ? AND status = 'pending'`,
          [userId]
        );
        console.log(`[auth.controller] ✅ Invitations activées pour le professionnel #${userId}`);
      } catch (invErr) {
        // Non-blocking: log but don't fail the whole request
        console.warn(`[auth.controller] ⚠️  Impossible d'activer les invitations : ${invErr.message}`);
      }
    }

    // ====================================================================
    // GENERATE JWT TOKEN
    // ====================================================================
    // Create JWT payload with non-sensitive user information
    const token = jwt.sign(
      // JWT payload object
      {
        // User ID for database lookups
        id: user.id,
        // User's full name
        name: user.name,
        // User's email address
        email: user.email,
        // User's role: 'admin', 'parent', or 'professional'
        role: user.role,
      },
      // Secret key for signing (from environment)
      process.env.JWT_SECRET,
      // Token expiration time (from environment)
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ====================================================================
    // RETURN SUCCESS RESPONSE
    // ====================================================================
    // Return 200 (OK) with new token and user info
    res.status(200).json({
      // Standard response format
      success: true,
      // Message confirming password was set successfully
      message: 'Password set successfully',
      // Response data object containing token and user info
      data: {
        // JWT token for Authorization header in future requests
        token,
        // User information for frontend
        user: {
          // User ID
          id: user.id,
          // User's full name
          name: user.name,
          // User's email
          email: user.email,
          // User's role for authorization
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Set password error:', error);
    // Return 500 (Internal Server Error) with error details
    res.status(500).json({
      // Standard response format
      success: false,
      // Generic error message
      message: 'Failed to set password',
      // Error details (only in development)
      error: error.message,
    });
  }
};

// ============================================================================
// SIGNUP CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/signup
// Purpose: Create a new parent account with password
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existing = await userModel.findByEmail(email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const createdUser = await userModel.createUserWithPassword({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hashedPassword,
      role: 'parent',
    });

    // Parents go through approval — don't issue token yet
    if (createdUser.status === 'pending') {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: 'Inscription enregistrée. En attente de validation par l\'administrateur.',
        data: {
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            status: createdUser.status,
          },
        },
      });
    }

    const token = jwt.sign(
      {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      data: {
        token,
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message,
    });
  }
};

// ============================================================================
// SIGNUP PROFESSIONAL CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/signup-professional
// Purpose: Create a new professional account with password, pending admin approval
const signupProfessional = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Le nom est requis.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "L'adresse e-mail est requise." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Le mot de passe est requis.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const existing = await userModel.findByEmail(email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Cette adresse e-mail est déjà utilisée.' });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const createdUser = await userModel.createUserWithPassword({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hashedPassword,
      role: 'professional',
      forcePending: true,
    });

    // Professionals self-registering go through admin approval
    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message: "Inscription enregistrée. En attente de validation par l'administrateur.",
      data: {
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          status: createdUser.status,
        },
      },
    });
  } catch (error) {
    console.error('Signup professional error:', error);
    res.status(500).json({ success: false, message: "Inscription échouée.", error: error.message });
  }
};

// ============================================================================
// FORGOT PASSWORD CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/forgot-password
// Génère un token unique, le sauvegarde en BDD et envoie un email avec le lien
const crypto = require('crypto');
const { sendResetEmail } = require('../config/mailer');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "L'adresse e-mail est requise." });
    }

    const user = await userModel.findByEmail(email.trim().toLowerCase());

    // Réponse générique même si l'email n'existe pas (sécurité)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si cette adresse est associée à un compte, un e-mail de réinitialisation a été envoyé.',
      });
    }

    // Générer un token sécurisé de 32 octets (hex = 64 chars)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 heure

    // Sauvegarder le token en BDD
    await userModel.setResetToken(user.id, token, expiresAt);

    // Construire le lien de réinitialisation
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Envoyer l'email et récupérer le previewUrl (mode Ethereal)
    const { previewUrl } = await sendResetEmail(user.email, user.name, resetLink);

    return res.status(200).json({
      success: true,
      message: 'Un e-mail de réinitialisation a été envoyé à votre adresse.',
      // En mode démo (Ethereal), on retourne le lien de prévisualisation
      ...(previewUrl && { previewUrl, demoMode: true }),
    });
  } catch (error) {
    console.error('[auth.controller] forgotPassword error:', error);
    // Si c'est une erreur SMTP, on informe sans exposer les détails
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Impossible d\'envoyer l\'e-mail. Vérifiez la configuration SMTP.',
      });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
};

// ============================================================================
// RESET PASSWORD CONTROLLER
// ============================================================================
// Endpoint: POST /api/auth/reset-password
// Valide le token, hache le nouveau mot de passe et le sauvegarde
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token manquant.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères.',
      });
    }

    // Trouver l'utilisateur par token (vérifie aussi l'expiration)
    const user = await userModel.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.',
      });
    }

    // Hacher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcryptjs.hash(password, 12);
    await userModel.setUserPassword(user.id, hashedPassword);

    // Invalider le token (usage unique)
    await userModel.clearResetToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    });
  } catch (error) {
    console.error('[auth.controller] resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
};

// ============================================================================
// Export authentication controller functions
module.exports = {
  login,
  setPassword,
  signup,
  signupProfessional,
  forgotPassword,
  resetPassword,
};
