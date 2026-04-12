// ============================================================================
// PARENT ROUTES — parent.routes.js
// ============================================================================
// Routes réservées aux parents authentifiés.
//
//   POST /api/parent/invite-professional
//     → Inviter un professionnel à rejoindre AIDAA pour suivre les enfants

const express          = require('express');
const parentController = require('../controllers/parent.controller');
const auth             = require('../middlewares/auth');
const roleCheck        = require('../middlewares/roleCheck');

const router = express.Router();

// Toutes les routes nécessitent un JWT valide + rôle parent
router.use(auth);
router.use(roleCheck('parent'));

// ── POST /api/parent/invite-professional ──────────────────────────────────
// Body: { name: string, email: string }
router.post('/invite-professional', parentController.inviteProfessional);

// ── GET /api/parent/my-professionals ──────────────────────────────────────
router.get('/my-professionals', parentController.getMyProfessionals);

// ── DELETE /api/parent/invitation/:id ─────────────────────────────────────
router.delete('/invitation/:professionalId', parentController.revokeInvitation);

// ── DELETE /api/parent/invitation/:professionalId/delete — suppression définitive ──
router.delete('/invitation/:professionalId/delete', parentController.deleteInvitation);

// ── POST /api/parent/resend-invitation/:id ─────────────────────────────────
router.post('/resend-invitation/:professionalId', parentController.resendInvitation);

module.exports = router;
