// ============================================================================
// PROFESSIONAL ROUTES — professional.routes.js
// ============================================================================

const express                  = require('express');
const professionalController   = require('../controllers/professional.controller');
const auth                     = require('../middlewares/auth');
const roleCheck                = require('../middlewares/roleCheck');

const router = express.Router();
router.use(auth);
router.use(roleCheck('professional'));

// GET /api/professional/my-parents  → parents qui ont invité ce professionnel
router.get('/my-parents',  professionalController.getMyParents);

// GET /api/professional/my-children → enfants des parents inviteurs
router.get('/my-children', professionalController.getMyChildren);

module.exports = router;

