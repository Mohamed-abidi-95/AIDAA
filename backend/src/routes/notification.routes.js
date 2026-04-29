// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================
const express = require('express');
const router  = express.Router();
const { query } = require('../config/db');
const auth = require('../middlewares/auth');

// GET /api/notifications — mes notifications (max 30)
router.get('/', auth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    const unread = rows.filter(r => !r.is_read).length;
    res.json({ success: true, data: rows, unreadCount: unread });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/notifications/read-all — tout marquer comme lu
router.put('/read-all', auth, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/notifications/:id/read — marquer une notification comme lue
router.put('/:id/read', auth, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/notifications/:id — supprimer une notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

