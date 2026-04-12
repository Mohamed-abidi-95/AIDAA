// ============================================================================
// ANALYTICS ROUTES
// ============================================================================
// All routes require authentication (JWT via auth middleware)
// Child analytics: accessible by parent + professional (scoped by ownership/link)
// Doctor analytics: professional (own data only) or admin

const express = require('express');
const router  = express.Router();
const auth      = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const analyticsController = require('../controllers/analyticsController');
const { query } = require('../config/db');

// ── All analytics routes require a valid token ────────────────────────────
router.use(auth);

// ── Middleware: verify child analytics access ─────────────────────────────
// Parent: must own child | Professional: must be linked to child's parent | Admin: unrestricted
const verifyChildAccess = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const children = await query('SELECT * FROM children WHERE id = ?', [childId]);
    if (children.length === 0) return res.status(404).json({ success: false, message: 'Child not found' });
    const child = children[0];

    if (req.user.role === 'admin') return next();

    if (req.user.role === 'parent') {
      if (child.parent_id !== req.user.id)
        return res.status(403).json({ success: false, message: 'Access denied' });
    } else if (req.user.role === 'professional') {
      const link = await query(
        `SELECT 1 FROM professional_invitations
         WHERE professional_id = ? AND parent_id = ? AND status != 'revoked'`,
        [req.user.id, child.parent_id]
      );
      if (link.length === 0)
        return res.status(403).json({ success: false, message: 'Accès refusé: vous n\'êtes pas lié au parent de cet enfant' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Middleware: doctor analytics — professional can only see their own data ──
const verifyDoctorAccess = (req, res, next) => {
  if (req.user.role === 'professional' && req.user.id !== parseInt(req.params.doctorId)) {
    return res.status(403).json({ success: false, message: 'Accès refusé: vous ne pouvez consulter que vos propres analytiques' });
  }
  next();
};

// ── Child analytics ───────────────────────────────────────────────────────

// GET /api/analytics/child/:childId/overview
router.get('/child/:childId/overview',           verifyChildAccess, analyticsController.getChildOverview);

// GET /api/analytics/child/:childId/sessions-timeline
router.get('/child/:childId/sessions-timeline',  verifyChildAccess, analyticsController.getSessionsTimeline);

// GET /api/analytics/child/:childId/activity-breakdown
router.get('/child/:childId/activity-breakdown', verifyChildAccess, analyticsController.getActivityBreakdown);

// GET /api/analytics/child/:childId/scores-by-category
router.get('/child/:childId/scores-by-category', verifyChildAccess, analyticsController.getScoresByCategory);

// ── Doctor analytics (professional: own data only; admin: unrestricted) ───

// GET /api/analytics/doctor/:doctorId/overview
router.get('/doctor/:doctorId/overview',
  roleCheck('professional', 'admin'), verifyDoctorAccess, analyticsController.getDoctorOverview
);

// GET /api/analytics/doctor/:doctorId/patients-scores
router.get('/doctor/:doctorId/patients-scores',
  roleCheck('professional', 'admin'), verifyDoctorAccess, analyticsController.getDoctorPatientsScores
);

// GET /api/analytics/doctor/:doctorId/patient/:patientId/progression
router.get('/doctor/:doctorId/patient/:patientId/progression',
  roleCheck('professional', 'admin'), verifyDoctorAccess, analyticsController.getPatientProgression
);

// GET /api/analytics/doctor/:doctorId/session-frequency
router.get('/doctor/:doctorId/session-frequency',
  roleCheck('professional', 'admin'), verifyDoctorAccess, analyticsController.getDoctorSessionFrequency
);

// GET /api/analytics/doctor/:doctorId/patients-table
router.get('/doctor/:doctorId/patients-table',
  roleCheck('professional', 'admin'), verifyDoctorAccess, analyticsController.getDoctorPatientsTable
);

module.exports = router;
