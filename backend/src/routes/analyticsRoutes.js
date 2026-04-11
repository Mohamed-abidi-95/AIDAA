// ============================================================================
// ANALYTICS ROUTES
// ============================================================================
// All routes require authentication (JWT via auth middleware)
// Child analytics: accessible by parent + professional
// Doctor analytics: professional (or admin) only

const express = require('express');
const router  = express.Router();
const auth     = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const analyticsController = require('../controllers/analyticsController');

// ── All analytics routes require a valid token ────────────────────────────
router.use(auth);

// ── Child analytics ───────────────────────────────────────────────────────

// GET /api/analytics/child/:childId/overview
router.get('/child/:childId/overview',           analyticsController.getChildOverview);

// GET /api/analytics/child/:childId/sessions-timeline
router.get('/child/:childId/sessions-timeline',  analyticsController.getSessionsTimeline);

// GET /api/analytics/child/:childId/activity-breakdown
router.get('/child/:childId/activity-breakdown', analyticsController.getActivityBreakdown);

// GET /api/analytics/child/:childId/scores-by-category
router.get('/child/:childId/scores-by-category', analyticsController.getScoresByCategory);

// ── Doctor analytics (professional or admin only) ─────────────────────────

// GET /api/analytics/doctor/:doctorId/overview
router.get('/doctor/:doctorId/overview',
  roleCheck('professional', 'admin'),
  analyticsController.getDoctorOverview
);

// GET /api/analytics/doctor/:doctorId/patients-scores
router.get('/doctor/:doctorId/patients-scores',
  roleCheck('professional', 'admin'),
  analyticsController.getDoctorPatientsScores
);

// GET /api/analytics/doctor/:doctorId/patient/:patientId/progression
router.get('/doctor/:doctorId/patient/:patientId/progression',
  roleCheck('professional', 'admin'),
  analyticsController.getPatientProgression
);

// GET /api/analytics/doctor/:doctorId/session-frequency
router.get('/doctor/:doctorId/session-frequency',
  roleCheck('professional', 'admin'),
  analyticsController.getDoctorSessionFrequency
);

// GET /api/analytics/doctor/:doctorId/patients-table
router.get('/doctor/:doctorId/patients-table',
  roleCheck('professional', 'admin'),
  analyticsController.getDoctorPatientsTable
);

module.exports = router;

