// ============================================================================
// GAME ROUTES
// ============================================================================
// Routes for game management

const express = require('express');
const gameController = require('../controllers/game.controller');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

// ============================================================================
// GET /api/games
// ============================================================================
// Get all games (public, no auth required)
router.get('/', gameController.getAll);

// ============================================================================
// GET /api/games/type/:type
// ============================================================================
// Get games by type (public, no auth required)
router.get('/type/:type', gameController.getByType);

// ============================================================================
// GET /api/games/:id
// ============================================================================
// Get game by ID (public, no auth required)
router.get('/:id', gameController.getById);

// ============================================================================
// All routes below require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// POST /api/games
// ============================================================================
// Create new game (admin only)
router.post('/', roleCheck('admin'), gameController.create);

// ============================================================================
// PUT /api/games/:id
// ============================================================================
// Update game (admin only)
router.put('/:id', roleCheck('admin'), gameController.update);

// ============================================================================
// DELETE /api/games/:id
// ============================================================================
// Delete game (admin only)
router.delete('/:id', roleCheck('admin'), gameController.deleteGame);

module.exports = router;

