// ============================================================================
// USER ROUTES - user.routes.js
// ============================================================================
// Routes for user management operations (admin only)
// All routes require authentication and admin role

// Import Express Router for creating route module
const express = require('express');
// Import user controller functions
const userController = require('../controllers/user.controller');
// Import authentication middleware (verifies JWT token)
const auth = require('../middlewares/auth');
// Import role check middleware (verifies user has admin role)
const roleCheck = require('../middlewares/roleCheck');

// ============================================================================
// CREATE ROUTER INSTANCE
// ============================================================================
// Create a new Router instance for this module
const router = express.Router();

// ============================================================================
// APPLY MIDDLEWARES TO ALL ROUTES
// ============================================================================
// All routes in this file require:
// 1. Valid JWT token (auth middleware)
// 2. Admin role (roleCheck middleware)
router.use(auth);
router.use(roleCheck('admin'));

// ============================================================================
// POST /api/users
// ============================================================================
// Create a new user account
// Access: Admin only (verified by middlewares above)
//
// Request body:
// {
//   "name": "Sara Ben Ali",
//   "email": "sara@example.com",
//   "password": "secret123",
//   "role": "parent"
// }
//
// Response (201 on success):
// {
//   "success": true,
//   "message": "User created successfully",
//   "data": {...user object without password...}
// }
//
// Handler: Maps to userController.createUser
router.post(
  // Route path: /users (relative to mount path /api/users)
  '/',
  // Route handler - calls createUser controller
  userController.createUser
);

// ============================================================================
// GET /api/users
// ============================================================================
// Retrieve all users
// Access: Admin only (verified by middlewares above)
// Query parameters (optional):
//   - role: filter by role ('admin', 'parent', 'professional')
//   - is_active: filter by status (1 for active, 0 for inactive)
//
// Response (200 on success):
// {
//   "success": true,
//   "message": "Users retrieved successfully",
//   "data": [...array of users...]
// }
//
// Handler: Maps to userController.getAllUsers
router.get(
  // Route path: /users (relative to mount path /api/users)
  '/',
  // Route handler - calls getAllUsers controller
  userController.getAllUsers
);

// ============================================================================
// PUT /api/users/:id
// ============================================================================
// Update user information
// Access: Admin only
//
// Request body:
// {
//   "name": "Updated Name",
//   "email": "updated@example.com",
//   "role": "parent",
//   "is_active": 1
// }
//
// Response (200 on success):
// {
//   "success": true,
//   "message": "User updated successfully",
//   "data": {...updated user object...}
// }
router.put(
  // Route path: /users/:id (admin can update any user by ID)
  '/:id',
  // Route handler - calls updateUser controller
  userController.updateUser
);

// ============================================================================
// DELETE /api/users/:id
// ============================================================================
// Delete (deactivate) user account
// Access: Admin only
// Note: This is a soft delete (sets is_active = 0)
//
// Response (200 on success):
// {
//   "success": true,
//   "message": "User deleted successfully"
// }
router.delete(
  // Route path: /users/:id (admin can delete any user by ID)
  '/:id',
  // Route handler - calls deleteUser controller
  userController.deleteUser
);

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export router to be mounted on app
module.exports = router;
