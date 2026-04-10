// ============================================================================
// ACTIVITY LOG MODEL
// ============================================================================
// Plain async functions for activity log database operations

const { query } = require('../config/db');

// ============================================================================
// Get all activity logs for a child
// ============================================================================
const getByChildId = async (childId) => {
  return await query(
    `SELECT al.*, c.title as content_title, c.type as content_type 
     FROM activity_logs al
     LEFT JOIN content c ON al.content_id = c.id
     WHERE al.child_id = ?
     ORDER BY al.date DESC`,
    [childId]
  );
};

// ============================================================================
// Create new activity log WITH SCORE AND DURATION
// ============================================================================
// Parameters: childId, contentId, score, duration_seconds, action
const create = async (childId, contentId, score = 0, duration_seconds = 0, action = 'content_accessed') => {
  const results = await query(
    `INSERT INTO activity_logs (child_id, content_id, score, duration_seconds, action) 
     VALUES (?, ?, ?, ?, ?)`,
    [childId, contentId, score, duration_seconds, action]
  );
  return results.insertId;
};

// ============================================================================
// Get activity log by ID
// ============================================================================
const getById = async (logId) => {
  const results = await query(
    'SELECT * FROM activity_logs WHERE id = ?',
    [logId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Update activity log with score and duration
// ============================================================================
const update = async (logId, score, duration_seconds) => {
  const results = await query(
    'UPDATE activity_logs SET score = ?, duration_seconds = ?, date = NOW() WHERE id = ?',
    [score, duration_seconds, logId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Update activity log status (e.g., started -> completed)
// ============================================================================
const updateStatus = async (logId, status) => {
  const results = await query(
    'UPDATE activity_logs SET status = ?, date = NOW() WHERE id = ?',
    [status, logId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Get summary statistics for a child
// ============================================================================
const getStats = async (childId) => {
  return await query(
    `SELECT 
       COUNT(*) as total_activities,
       SUM(score) as total_score,
       AVG(score) as avg_score,
       SUM(duration_seconds) as total_time_seconds,
       MAX(date) as last_activity
     FROM activity_logs 
     WHERE child_id = ?`,
    [childId]
  );
};

// ============================================================================
// DELETE ACTIVITY LOG
// ============================================================================
const deleteLog = async (logId) => {
  const results = await query(
    'DELETE FROM activity_logs WHERE id = ?',
    [logId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getByChildId,
  create,
  getById,
  update,
  updateStatus,
  getStats,
  deleteLog,
};
