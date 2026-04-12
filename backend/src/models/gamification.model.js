// ============================================================================
// GAMIFICATION MODEL — Module D: Gamification
// ============================================================================

const { query } = require('../config/db');

// Get points & activity count for a child
const getChildPoints = async (childId) => {
  const results = await query(
    `SELECT 
       COALESCE(SUM(score), 0)  AS total_points,
       COUNT(*)                  AS total_activities
     FROM activity_logs WHERE child_id = ?`,
    [childId]
  );
  const row = results[0];
  return {
    total_points:      Number(row.total_points),
    total_activities:  Number(row.total_activities),
  };
};

// Get badges earned by a child
const getChildBadges = async (childId) => {
  return await query(
    `SELECT b.*, cb.earned_at
     FROM badges b
     JOIN child_badges cb ON b.id = cb.badge_id
     WHERE cb.child_id = ?
     ORDER BY cb.earned_at DESC`,
    [childId]
  );
};

// Get all defined badges
const getAllBadges = async () => {
  return await query('SELECT * FROM badges ORDER BY id ASC', []);
};

// Award a badge to a child (idempotent)
const awardBadge = async (childId, badgeId) => {
  try {
    await query(
      'INSERT IGNORE INTO child_badges (child_id, badge_id) VALUES (?, ?)',
      [childId, badgeId]
    );
    return true;
  } catch {
    return false;
  }
};

// Check conditions and auto-award badges
const checkAndAwardBadges = async (childId) => {
  const stats = await getChildPoints(childId);
  const badges = await getAllBadges();
  const existing = await getChildBadges(childId);
  const existingIds = new Set(existing.map((b) => b.id));
  const awarded = [];

  for (const badge of badges) {
    if (existingIds.has(badge.id)) continue;
    let earned = false;
    if (badge.condition_type === 'activities' && stats.total_activities >= badge.condition_value) earned = true;
    if (badge.condition_type === 'points' && stats.total_points >= badge.condition_value) earned = true;
    if (earned) {
      await awardBadge(childId, badge.id);
      awarded.push(badge);
    }
  }
  return awarded;
};

module.exports = {
  getChildPoints,
  getChildBadges,
  getAllBadges,
  awardBadge,
  checkAndAwardBadges,
};

