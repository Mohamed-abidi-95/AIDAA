// ============================================================================
// CONTENT ROUTES
// ============================================================================
// Routes for content management

const express = require('express');
const contentController = require('../controllers/content.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

const router = express.Router();

// ============================================================================
// GET /content
// ============================================================================
// Get all content (public, no auth required)
// Query params: type, category, age_group, level
router.get('/', contentController.getAll);

// ============================================================================
// GET /content/:id
// ============================================================================
// Get content by ID (public, no auth required)
router.get('/:id', contentController.getById);

// ============================================================================
// All routes below require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// POST /content/upload
// ============================================================================
// Upload content file (video, audio, image)
// Admin only
router.post('/upload', roleCheck('admin'), upload.single('file'), contentController.uploadContent);

// ============================================================================
// POST /content
// ============================================================================
// Create new content (admin only)
router.post('/', roleCheck('admin'), contentController.create);

// ============================================================================
// PUT /content/:id
// ============================================================================
// Update content (admin only)
router.put('/:id', roleCheck('admin'), contentController.update);

// ============================================================================
// DELETE /content/:id
// ============================================================================
// Delete content (admin only)
router.delete('/:id', roleCheck('admin'), contentController.deleteContent);

module.exports = router;
