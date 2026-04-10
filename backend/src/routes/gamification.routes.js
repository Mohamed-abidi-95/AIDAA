// ============================================================================
// GAMIFICATION ROUTES — Module D
// ============================================================================

const express = require('express');
const router  = express.Router();
const auth = require('../middlewares/auth');
const { getStats, recordScore, getBadges } = require('../controllers/gamification.controller');

// GET  /api/gamification/:childId/stats
router.get('/:childId/stats',  auth, getStats);

// GET  /api/gamification/:childId/badges
router.get('/:childId/badges', auth, getBadges);

// POST /api/gamification/:childId/score
// Body: { gameId, score, duration_seconds }
router.post('/:childId/score', auth, recordScore);

module.exports = router;
