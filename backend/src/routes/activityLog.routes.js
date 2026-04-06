// ============================================================================
// ACTIVITY LOG ROUTES
// ============================================================================
// Routes for activity tracking

const express = require('express');
const activityLogController = require('../controllers/activityLog.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

// ============================================================================
// All activity log routes require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// GET /activity-log/child/:childId
// ============================================================================
// Get all activity logs for a child
router.get('/child/:childId', activityLogController.getByChildId);

// ============================================================================
// POST /activity-log
// ============================================================================
// Create new activity log
router.post('/', activityLogController.create);

// ============================================================================
// PUT /activity-log/:id
// ============================================================================
// Update activity log status
router.put('/:id', activityLogController.updateStatus);

// ============================================================================
// DELETE /activity-log/:id (ADMIN ONLY)
// ============================================================================
// Delete activity log
router.delete('/:id', roleCheck('admin'), activityLogController.deleteLog);

module.exports = router;
