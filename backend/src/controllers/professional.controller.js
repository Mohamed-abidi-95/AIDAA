// ============================================================================
// PROFESSIONAL CONTROLLER — professional.controller.js
// ============================================================================

const { query } = require('../config/db');

// ============================================================================
// GET /api/professional/my-parents
// Retourne la liste des parents qui ont invité ce professionnel (status != revoked)
// avec le nombre d'enfants de chaque parent.
// ============================================================================
const getMyParents = async (req, res) => {
  try {
    const profId = req.user.id;

    const rows = await query(
      `SELECT u.id, u.name, u.email,
              pi.status AS invite_status,
              pi.invited_at,
              COUNT(c.id) AS child_count
       FROM   professional_invitations pi
       JOIN   users u ON u.id = pi.parent_id
       LEFT   JOIN children c ON c.parent_id = u.id
       WHERE  pi.professional_id = ?
         AND  pi.status != 'revoked'
       GROUP  BY u.id, u.name, u.email, pi.status, pi.invited_at
       ORDER  BY pi.invited_at DESC`,
      [profId]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[professional.controller] getMyParents:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des parents.' });
  }
};

// ============================================================================
// GET /api/professional/my-children
// Retourne les enfants appartenant aux parents qui ont invité ce professionnel
// ============================================================================
const getMyChildren = async (req, res) => {
  try {
    const profId = req.user.id;

    const rows = await query(
      `SELECT c.id, c.name, c.age, c.participant_category, c.parent_id,
              u.name AS parent_name
       FROM   professional_invitations pi
       JOIN   children c ON c.parent_id = pi.parent_id
       JOIN   users    u ON u.id        = pi.parent_id
       WHERE  pi.professional_id = ?
         AND  pi.status != 'revoked'
       ORDER  BY u.name, c.name`,
      [profId]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[professional.controller] getMyChildren:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des patients.' });
  }
};

module.exports = { getMyParents, getMyChildren };

