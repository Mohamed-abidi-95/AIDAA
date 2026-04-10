// ============================================================================
// GAMIFICATION CONTROLLER — Module D: Gamification
// ============================================================================

const gamificationModel = require('../models/gamification.model');
const activityLogModel  = require('../models/activityLog.model');

// GET /api/gamification/:childId/stats
const getStats = async (req, res) => {
  try {
    const { childId } = req.params;
    const points = await gamificationModel.getChildPoints(childId);
    const badges = await gamificationModel.getChildBadges(childId);
    res.json({ success: true, data: { ...points, badges } });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/gamification/:childId/score
// Body: { gameId, score, duration_seconds }
// Logs the game score and auto-awards badges
const recordScore = async (req, res) => {
  try {
    const { childId } = req.params;
    const { gameId, score = 0, duration_seconds = 0 } = req.body;

    // Use a special content_id = 0 sentinel for games (no FK since no matching content row)
    // We log without content FK by using raw query approach via activityLog model
    await activityLogModel.create(childId, null, score, duration_seconds, `game:${gameId}`);

    // Check & award badges
    const newBadges = await gamificationModel.checkAndAwardBadges(childId);

    res.json({ success: true, message: 'Score enregistré', newBadges });
  } catch (error) {
    console.error('recordScore error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/gamification/:childId/badges
const getBadges = async (req, res) => {
  try {
    const { childId } = req.params;
    const badges = await gamificationModel.getChildBadges(childId);
    res.json({ success: true, data: badges });
  } catch (error) {
    console.error('getBadges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, recordScore, getBadges };

