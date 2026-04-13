// Diagnostic script - check data for mohamed@aidaa.com
const db = require('./src/config/db');
(async () => {
  try {
    const users = await db.query("SELECT id, name, email, role FROM users WHERE email = 'mohamed@aidaa.com'");
    console.log('USER:', JSON.stringify(users));
    if (users.length === 0) { console.log('NO USER FOUND'); process.exit(0); }
    const userId = users[0].id;

    const children = await db.query('SELECT id, name, age, parent_id FROM children WHERE parent_id = ?', [userId]);
    console.log('CHILDREN:', JSON.stringify(children));
    if (children.length === 0) { console.log('NO CHILDREN'); process.exit(0); }

    for (const child of children) {
      console.log(`\n--- Child: ${child.name} (id=${child.id}) ---`);
      const logs = await db.query('SELECT COUNT(*) as cnt, COUNT(content_id) as with_content FROM activity_logs WHERE child_id = ?', [child.id]);
      console.log('LOGS count:', JSON.stringify(logs));

      const joined = await db.query(
        'SELECT al.id, al.content_id, al.score, al.action, c.category FROM activity_logs al LEFT JOIN content c ON al.content_id = c.id WHERE al.child_id = ? LIMIT 10',
        [child.id]
      );
      console.log('LOGS with content:', JSON.stringify(joined));
    }

    const cats = await db.query('SELECT DISTINCT category FROM content WHERE category IS NOT NULL');
    console.log('\nCONTENT categories:', JSON.stringify(cats));

    const contentCount = await db.query('SELECT COUNT(*) as cnt FROM content');
    console.log('TOTAL content:', JSON.stringify(contentCount));

  } catch (e) { console.error(e.message); }
  process.exit(0);
})();

