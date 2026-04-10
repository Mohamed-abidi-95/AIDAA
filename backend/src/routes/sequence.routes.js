// ============================================================================
// SEQUENCE ROUTES — Module B
// ============================================================================

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getAllSequences, getSequenceWithSteps } = require('../controllers/sequence.controller');

router.get('/',    auth, getAllSequences);
router.get('/:id', auth, getSequenceWithSteps);

module.exports = router;

