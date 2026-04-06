// ============================================================================
// CHILD ROUTES
// ============================================================================
// Routes for child management (parents only)

const express = require('express');
const childController = require('../controllers/child.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

// ============================================================================
// All child routes require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// GET /child/mychildren
// ============================================================================
// Get all children of logged-in parent
router.get('/mychildren', roleCheck('parent'), childController.getMyChildren);

// ============================================================================
// GET /child/all
// ============================================================================
// Get all children for professionals/admins
router.get('/all', roleCheck('professional', 'admin'), childController.getAllChildren);

// ============================================================================
// GET /child/:id
// ============================================================================
// Get specific child by ID
router.get('/:id', childController.getChild);

// ============================================================================
// POST /child
// ============================================================================
// Create new child
router.post('/', roleCheck('parent'), childController.createChild);

// ============================================================================
// PUT /child/:id
// ============================================================================
// Update child information
router.put('/:id', roleCheck('parent'), childController.updateChild);

// ============================================================================
// DELETE /child/:id
// ============================================================================
// Delete child
router.delete('/:id', roleCheck('parent'), childController.deleteChild);

module.exports = router;
