// ============================================================================
// ADMIN ROUTES
// ============================================================================
// Routes for admin operations

const express = require('express');
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

// ============================================================================
// All admin routes require authentication and admin role
// ============================================================================
router.use(auth);
router.use(roleCheck('admin'));

// ============================================================================
// GET /admin/stats
// ============================================================================
// Get dashboard statistics
router.get('/stats', adminController.getStats);

// ============================================================================
// GET /admin/users
// ============================================================================
// List all users with optional filters
// Query params: role, is_active
router.get('/users', adminController.listUsers);

// ============================================================================
// POST /admin/create-parent
// ============================================================================
// Create new parent user
router.post('/create-parent', adminController.createParent);

// ============================================================================
// POST /admin/create-professional
// ============================================================================
// Create new professional user
router.post('/create-professional', adminController.createProfessional);

// ============================================================================
// PUT /admin/toggle-active/:id
// ============================================================================
// Toggle user active/inactive status
router.put('/toggle-active/:id', adminController.toggleUserActive);

// ============================================================================
// GET /admin/notification-count
// ============================================================================
router.get('/notification-count', adminController.getNotificationCount);

// ============================================================================
// GET /admin/pending-registrations
// ============================================================================
router.get('/pending-registrations', adminController.getPendingRegistrations);

// ============================================================================
// POST /admin/approve-registration/:id
// ============================================================================
router.post('/approve-registration/:id', adminController.approveRegistration);

// ============================================================================
// POST /admin/reject-registration/:id
// ============================================================================
router.post('/reject-registration/:id', adminController.rejectRegistration);

module.exports = router;
