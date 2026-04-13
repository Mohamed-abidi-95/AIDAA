// ============================================================================
// ANALYTICS CONTROLLER
// ============================================================================
// Exposes aggregated analytics data for children and doctors
// Uses raw SQL via the project's query() wrapper (mysql2/promise pool)

const { query } = require('../config/db');
const activityLogModel = require('../models/activityLog.model');

// ── Streak helper ─────────────────────────────────────────────────────────────
// days = [{ day: 'YYYY-MM-DD' }, ...] sorted DESC (from DB)
function calcStreak(days) {
  if (!days || days.length === 0) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const actualStr   = String(days[i].day).split('T')[0];    // handle Date or string
    if (actualStr === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ============================================================================
// CHILD ENDPOINTS
// ============================================================================

// GET /api/analytics/child/:childId/overview
// → { totalSessions, totalMinutes, avgScore, streakDays }
exports.getChildOverview = async (req, res) => {
  try {
    const { childId } = req.params;
    const [statsRows, dayRows] = await Promise.all([
      activityLogModel.getStats(childId),
      query(
        'SELECT DISTINCT DATE(date) as day FROM activity_logs WHERE child_id = ? ORDER BY day DESC',
        [childId]
      ),
    ]);
    const s = statsRows[0] || {};
    res.status(200).json({
      success: true,
      data: {
        totalSessions: Number(s.total_activities)    || 0,
        totalMinutes:  Math.round((Number(s.total_time_seconds) || 0) / 60),
        avgScore:      Math.round(Number(s.avg_score) || 0),
        streakDays:    calcStreak(dayRows),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/child/:childId/sessions-timeline
// → [{ date, minutes }]
exports.getSessionsTimeline = async (req, res) => {
  try {
    const { childId } = req.params;
    const rows = await query(
      `SELECT DATE(date) as date, ROUND(SUM(duration_seconds)/60, 1) as minutes
       FROM activity_logs
       WHERE child_id = ?
       GROUP BY DATE(date)
       ORDER BY DATE(date) ASC`,
      [childId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/child/:childId/activity-breakdown
// → [{ category, count, pct }]
exports.getActivityBreakdown = async (req, res) => {
  try {
    const { childId } = req.params;
    // Use content.category when linked, otherwise fallback to action column
    const rows = await query(
      `SELECT COALESCE(c.category, al.action) as category, COUNT(*) as count
       FROM activity_logs al
       LEFT JOIN content c ON al.content_id = c.id
       WHERE al.child_id = ? AND COALESCE(c.category, al.action) IS NOT NULL
       GROUP BY COALESCE(c.category, al.action)
       ORDER BY count DESC`,
      [childId]
    );
    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const data  = rows.map(r => ({
      category: r.category,
      count: Number(r.count),
      pct:   total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/child/:childId/scores-by-category
// → [{ category, avgScore }]
exports.getScoresByCategory = async (req, res) => {
  try {
    const { childId } = req.params;
    // Use content.category when linked, otherwise fallback to action column
    const rows = await query(
      `SELECT COALESCE(c.category, al.action) as category, ROUND(AVG(al.score), 1) as avgScore
       FROM activity_logs al
       LEFT JOIN content c ON al.content_id = c.id
       WHERE al.child_id = ? AND COALESCE(c.category, al.action) IS NOT NULL
       GROUP BY COALESCE(c.category, al.action)
       ORDER BY avgScore DESC`,
      [childId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================================
// DOCTOR ENDPOINTS
// ============================================================================

// GET /api/analytics/doctor/:doctorId/overview
// → { totalPatients, totalSessions, avgScore, totalHours }
exports.getDoctorOverview = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const rows = await query(
      `SELECT
         COUNT(DISTINCT c.id)                      as totalPatients,
         COUNT(al.id)                              as totalSessions,
         ROUND(AVG(al.score), 1)                   as avgScore,
         ROUND(SUM(al.duration_seconds) / 3600, 1) as totalHours
       FROM professional_invitations pi
       JOIN children c ON c.parent_id = pi.parent_id
       LEFT JOIN activity_logs al ON al.child_id = c.id
       WHERE pi.professional_id = ? AND pi.status = 'active'`,
      [doctorId]
    );
    const r = rows[0] || {};
    res.status(200).json({
      success: true,
      data: {
        totalPatients: Number(r.totalPatients) || 0,
        totalSessions: Number(r.totalSessions) || 0,
        avgScore:      Number(r.avgScore)       || 0,
        totalHours:    Number(r.totalHours)     || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/doctor/:doctorId/patients-scores
// → [{ name, avgScore }]
exports.getDoctorPatientsScores = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const rows = await query(
      `SELECT c.name, ROUND(AVG(al.score), 1) as avgScore
       FROM professional_invitations pi
       JOIN children c ON c.parent_id = pi.parent_id
       LEFT JOIN activity_logs al ON al.child_id = c.id
       WHERE pi.professional_id = ? AND pi.status = 'active'
       GROUP BY c.id, c.name
       ORDER BY avgScore DESC`,
      [doctorId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/doctor/:doctorId/patient/:patientId/progression
// → [{ date, score }]
exports.getPatientProgression = async (req, res) => {
  try {
    const { patientId } = req.params;
    const rows = await query(
      `SELECT DATE(date) as date, ROUND(AVG(score), 1) as score
       FROM activity_logs
       WHERE child_id = ?
       GROUP BY DATE(date)
       ORDER BY date ASC`,
      [patientId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/doctor/:doctorId/session-frequency
// → [{ week, sessions }] last 12 weeks
exports.getDoctorSessionFrequency = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const rows = await query(
      `SELECT YEARWEEK(al.date, 1) as week, COUNT(*) as sessions
       FROM professional_invitations pi
       JOIN children c ON c.parent_id = pi.parent_id
       JOIN activity_logs al ON al.child_id = c.id
       WHERE pi.professional_id = ? AND pi.status = 'active'
       GROUP BY YEARWEEK(al.date, 1)
       ORDER BY week ASC
       LIMIT 12`,
      [doctorId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/doctor/:doctorId/patients-table
// → [{ name, totalSessions, avgScore, lastSession, trend }]
exports.getDoctorPatientsTable = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Main table data
    const tableRows = await query(
      `SELECT
         c.id,
         c.name,
         COUNT(al.id)            as totalSessions,
         ROUND(AVG(al.score), 1) as avgScore,
         MAX(al.date)            as lastSession
       FROM professional_invitations pi
       JOIN children c ON c.parent_id = pi.parent_id
       LEFT JOIN activity_logs al ON al.child_id = c.id
       WHERE pi.professional_id = ? AND pi.status = 'active'
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
      [doctorId]
    );

    if (tableRows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Retrieve last 2 scores per child to compute trend
    // Build placeholders manually (execute() does not expand arrays in IN clauses)
    const childIds    = tableRows.map(r => r.id);
    const placeholders = childIds.map(() => '?').join(',');
    const scoreRows   = await query(
      `SELECT child_id, score
       FROM activity_logs
       WHERE child_id IN (${placeholders})
       ORDER BY child_id ASC, date DESC`,
      childIds
    );

    // Group: childId → [last score, prev score]
    const scoreMap = {};
    for (const row of scoreRows) {
      if (!scoreMap[row.child_id]) scoreMap[row.child_id] = [];
      if (scoreMap[row.child_id].length < 2) scoreMap[row.child_id].push(Number(row.score));
    }

    const data = tableRows.map(r => {
      const scores = scoreMap[r.id] || [];
      let trend = 'flat';
      if (scores.length >= 2) {
        const diff = scores[0] - scores[1]; // most_recent - previous
        if (diff >= 5)  trend = 'up';
        else if (diff <= -5) trend = 'down';
      }
      return {
        name:          r.name,
        totalSessions: Number(r.totalSessions) || 0,
        avgScore:      Number(r.avgScore)       || 0,
        lastSession:   r.lastSession || null,
        trend,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

