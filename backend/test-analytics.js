// Quick test for analytics endpoints
const db = require('./src/config/db');
(async () => {
  try {
    const childId = 11; // Rayan

    // Test activity-breakdown query
    const breakdown = await db.query(
      `SELECT COALESCE(c.category, al.action) as category, COUNT(*) as count
       FROM activity_logs al
       LEFT JOIN content c ON al.content_id = c.id
       WHERE al.child_id = ? AND COALESCE(c.category, al.action) IS NOT NULL
       GROUP BY COALESCE(c.category, al.action)
       ORDER BY count DESC`,
      [childId]
    );
    console.log('BREAKDOWN:', JSON.stringify(breakdown, null, 2));

    // Test scores-by-category query
    const scores = await db.query(
      `SELECT COALESCE(c.category, al.action) as category, ROUND(AVG(al.score), 1) as avgScore
       FROM activity_logs al
       LEFT JOIN content c ON al.content_id = c.id
       WHERE al.child_id = ? AND COALESCE(c.category, al.action) IS NOT NULL
       GROUP BY COALESCE(c.category, al.action)
       ORDER BY avgScore DESC`,
      [childId]
    );
    console.log('SCORES:', JSON.stringify(scores, null, 2));
  } catch (e) { console.error(e.message); }
  process.exit(0);
})();

