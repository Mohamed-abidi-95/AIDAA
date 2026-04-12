// ============================================================================
// CHATBOT MODEL — chatbot.model.js
// ============================================================================
// Opérations DB pour le module chatbot IA parent.
// Tables : chatbot_consent_log, chatbot_sessions, chatbot_messages, faq_entries
// ============================================================================

const { query } = require('../config/db');

// ── Consentement RGPD ─────────────────────────────────────────────────────

/**
 * Enregistre le consentement parental.
 * @param {number} parentId
 * @param {string} ip
 * @param {string} userAgent
 * @returns {number} insertId
 */
const saveConsent = async (parentId, ip, userAgent) => {
  const result = await query(
    `INSERT INTO chatbot_consent_log
       (parent_id, consent_given, ip_address, user_agent)
     VALUES (?, 1, ?, ?)`,
    [parentId, ip || null, userAgent || null]
  );
  return result.insertId;
};

/**
 * Vérifie si le parent a déjà donné son consentement.
 * @param {number} parentId
 * @returns {boolean}
 */
const hasConsent = async (parentId) => {
  const rows = await query(
    `SELECT id FROM chatbot_consent_log
     WHERE parent_id = ? AND consent_given = 1
     LIMIT 1`,
    [parentId]
  );
  return rows.length > 0;
};

// ── Sessions ──────────────────────────────────────────────────────────────

/**
 * Crée une nouvelle session de chatbot.
 * @param {number} parentId
 * @param {number|null} childId
 * @returns {number} sessionId
 */
const createSession = async (parentId, childId = null) => {
  const result = await query(
    `INSERT INTO chatbot_sessions
       (parent_id, child_id, consent_verified)
     VALUES (?, ?, 1)`,
    [parentId, childId]
  );
  return result.insertId;
};

/**
 * Clôture une session (marque ended_at).
 * @param {number} sessionId
 */
const closeSession = async (sessionId) => {
  await query(
    `UPDATE chatbot_sessions SET ended_at = NOW() WHERE id = ?`,
    [sessionId]
  );
};

/**
 * Vérifie qu'une session appartient à un parent donné.
 * @param {number} sessionId
 * @param {number} parentId
 * @returns {object|null}
 */
const getSession = async (sessionId, parentId) => {
  const rows = await query(
    `SELECT cs.*, c.participant_category, c.age, c.name AS child_name
     FROM chatbot_sessions cs
     LEFT JOIN children c ON c.id = cs.child_id
     WHERE cs.id = ? AND cs.parent_id = ?
     LIMIT 1`,
    [sessionId, parentId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// ── Messages ──────────────────────────────────────────────────────────────

/**
 * Sauvegarde un message (user ou bot) dans la session.
 * @param {number} sessionId
 * @param {'user'|'bot'} sender
 * @param {string} text
 * @param {'faq'|'recommendation'|'emergency'|'greeting'|'unknown'} intent
 * @returns {number} insertId
 */
const saveMessage = async (sessionId, sender, text, intent = 'unknown') => {
  const result = await query(
    `INSERT INTO chatbot_messages
       (session_id, sender, message_text, intent)
     VALUES (?, ?, ?, ?)`,
    [sessionId, sender, text, intent]
  );
  return result.insertId;
};

/**
 * Récupère l'historique des messages d'une session (anonymisé : pas de child_id).
 * @param {number} sessionId
 * @returns {Array}
 */
const getSessionHistory = async (sessionId) => {
  return await query(
    `SELECT id, sender, message_text, intent, created_at
     FROM chatbot_messages
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId]
  );
};

// ── FAQ ───────────────────────────────────────────────────────────────────

/**
 * Recherche dans la FAQ par correspondance de mots-clés (score = nb de matches).
 * @param {string[]} tokens - mots normalisés du message utilisateur
 * @param {string} lang - 'fr' | 'ar'
 * @returns {object|null} meilleure entrée FAQ ou null
 */
const searchFaq = async (tokens, _lang = 'fr') => {
  const rows = await query(
    `SELECT id, category, question_fr, question_ar,
            answer_fr, answer_ar, keywords_json
     FROM faq_entries
     WHERE is_active = 1`,
    []
  );

  if (!rows.length) return null;

  let best = null;
  let bestScore = 0;

  for (const row of rows) {
    let keywords = [];
    try {
      keywords = typeof row.keywords_json === 'string'
        ? JSON.parse(row.keywords_json)
        : (row.keywords_json || []);
    } catch (_) {
      keywords = [];
    }

    // Score = nombre de tokens utilisateur présents dans les keywords FAQ
    const score = tokens.reduce((acc, token) => {
      const found = keywords.some((kw) =>
        kw.toLowerCase().includes(token) || token.includes(kw.toLowerCase())
      );
      return found ? acc + 1 : acc;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      best = { ...row, score };
    }
  }

  return bestScore > 0 ? best : null;
};

/**
 * Récupère toutes les catégories FAQ disponibles.
 * @returns {string[]}
 */
const getAllFaqCategories = async () => {
  const rows = await query(
    `SELECT DISTINCT category FROM faq_entries WHERE is_active = 1 ORDER BY category ASC`,
    []
  );
  return rows.map((r) => r.category);
};

// ── Recommandations contenu ───────────────────────────────────────────────

/**
 * Recommande des contenus pour un enfant en excluant ceux déjà consultés.
 * @param {number} childId
 * @param {string} participantCategory - 'enfant' | 'jeune' | 'adulte'
 * @param {number} limit
 * @returns {Array}
 */
const getContentForChild = async (childId, participantCategory = 'enfant', limit = 3) => {
  // 1er essai : contenus non encore consultés
  const params = [participantCategory];
  let excludeClause = '';

  if (childId) {
    excludeClause = `
      AND c.id NOT IN (
        SELECT DISTINCT content_id FROM activity_logs
        WHERE child_id = ? AND content_id IS NOT NULL
      )`;
    params.push(childId);
  }

  params.push(limit);

  const rows = await query(
    `SELECT c.id, c.title, c.type, c.category, c.emoji,
            c.description, c.url, c.level, c.duration, c.minutes
     FROM content c
     WHERE (c.participant_category = ? OR c.participant_category = 'tous')
     ${excludeClause}
     ORDER BY c.level ASC, c.created_at DESC
     LIMIT ?`,
    params
  );

  // Fallback : si tout a été consulté, on retourne les top contenus sans filtre
  if (rows.length === 0) {
    return await query(
      `SELECT c.id, c.title, c.type, c.category, c.emoji,
              c.description, c.url, c.level, c.duration, c.minutes
       FROM content c
       WHERE (c.participant_category = ? OR c.participant_category = 'tous')
       ORDER BY c.level ASC, c.created_at DESC
       LIMIT ?`,
      [participantCategory, limit]
    );
  }

  return rows;
};

module.exports = {
  saveConsent,
  hasConsent,
  createSession,
  closeSession,
  getSession,
  saveMessage,
  getSessionHistory,
  searchFaq,
  getAllFaqCategories,
  getContentForChild,
};

