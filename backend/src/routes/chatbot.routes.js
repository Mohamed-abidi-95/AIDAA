// ============================================================================
// CHATBOT ROUTES — chatbot.routes.js
// ============================================================================
// Toutes les routes du module IA chatbot (réservées aux parents authentifiés).
//
// Prérequis : JWT valide + rôle 'parent'
//
// Endpoints :
//   POST   /api/chatbot/consent                 → Donner le consentement RGPD
//   GET    /api/chatbot/consent/status           → Vérifier son consentement
//   POST   /api/chatbot/session                  → Démarrer une session
//   POST   /api/chatbot/message                  → Envoyer un message
//   GET    /api/chatbot/session/:id/history      → Historique (anonymisé)
//   DELETE /api/chatbot/session/:id              → Clôturer la session
//   GET    /api/chatbot/faq/categories           → Catégories FAQ
//   GET    /api/chatbot/recommend/:childId       → Recommandations directes
// ============================================================================

const express            = require('express');
const chatbotController  = require('../controllers/chatbot.controller');
const auth               = require('../middlewares/auth');
const roleCheck          = require('../middlewares/roleCheck');

const router = express.Router();

// Toutes les routes nécessitent un JWT valide + rôle parent
router.use(auth);
router.use(roleCheck('parent'));

// ── Consentement RGPD ──────────────────────────────────────────────────────
// POST /api/chatbot/consent
router.post('/consent', chatbotController.giveConsent);

// GET /api/chatbot/consent/status
router.get('/consent/status', chatbotController.getConsentStatus);

// ── Sessions ───────────────────────────────────────────────────────────────
// POST /api/chatbot/session
// Body: { child_id? }
router.post('/session', chatbotController.startSession);

// GET /api/chatbot/session/:sessionId/history
router.get('/session/:sessionId/history', chatbotController.getHistory);

// DELETE /api/chatbot/session/:sessionId
router.delete('/session/:sessionId', chatbotController.endSession);

// ── Messagerie ─────────────────────────────────────────────────────────────
// POST /api/chatbot/message
// Body: { sessionId, message, lang? }
router.post('/message', chatbotController.sendMessage);

// ── FAQ ────────────────────────────────────────────────────────────────────
// GET /api/chatbot/faq/categories
router.get('/faq/categories', chatbotController.getFaqCategories);

// ── Recommandations ────────────────────────────────────────────────────────
// GET /api/chatbot/recommend/:childId?limit=5
router.get('/recommend/:childId', chatbotController.getRecommendations);

module.exports = router;

