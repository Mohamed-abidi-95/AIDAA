// ============================================================================
// AAC ROUTES — Module C: Communication alternative
// ============================================================================

const express = require('express');
const router  = express.Router();
const auth = require('../middlewares/auth');
const { getSymbols, getCategories } = require('../controllers/aac.controller');

// GET /api/aac/categories
router.get('/categories', auth, getCategories);

// GET /api/aac/symbols?category=Besoins&participant_category=enfant
router.get('/symbols',    auth, getSymbols);

module.exports = router;
