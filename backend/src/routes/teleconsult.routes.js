// ============================================================================
// TELECONSULTATION ROUTES
// ============================================================================
// Routes for virtual consultation scheduling

const express = require('express');
const teleconsultController = require('../controllers/teleconsult.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

// ============================================================================
// All teleconsult routes require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// GET /teleconsult/my
// ============================================================================
// Get all consultations for authenticated user
router.get('/my', teleconsultController.getMyConsultations);

// ============================================================================
// GET /teleconsult/room/:roomId
// ============================================================================
// Get consultation details by room ID
router.get('/room/:roomId', teleconsultController.getRoomDetails);

// ============================================================================
// GET /teleconsult/:id
// ============================================================================
// Get consultation by ID
router.get('/:id', teleconsultController.getById);

// ============================================================================
// POST /teleconsult
// ============================================================================
// Create new consultation
router.post('/', teleconsultController.create);

// ============================================================================
// PUT /teleconsult/:id/status
// ============================================================================
// Update consultation status
router.put('/:id/status', teleconsultController.updateStatus);

// ============================================================================
// PUT /teleconsult/:id
// ============================================================================
// Update consultation
router.put('/:id', teleconsultController.update);

// ============================================================================
// DELETE /teleconsult/:id
// ============================================================================
// Delete consultation
router.delete('/:id', teleconsultController.deleteConsultation);

module.exports = router;
