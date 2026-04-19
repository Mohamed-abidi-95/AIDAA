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

// GET /api/professional/my-children → enfants des parents inviteurs (status=active uniquement)
router.get('/my-children', professionalController.getMyChildren);

// PUT /api/professional/invitation/:parentId/accept → accepter une invitation
router.put('/invitation/:parentId/accept', professionalController.acceptInvitation);

// PUT /api/professional/invitation/:parentId/reject → refuser une invitation
router.put('/invitation/:parentId/reject', professionalController.rejectInvitation);

module.exports = router;

