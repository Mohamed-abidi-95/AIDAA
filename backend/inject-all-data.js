// ============================================================================
// inject-all-data.js — Injecte children, logs, messages, notes pour tous les parents
// ============================================================================
const { query } = require('./src/config/db');

async function main() {
  console.log('🚀 Injection des données complètes...\n');

  // ── 1. Récupérer tous les parents ─────────────────────────────────────────
  const parents = await query(`SELECT id, name, email FROM users WHERE role='parent' ORDER BY id`);
  const professionals = await query(`SELECT id, name, email FROM users WHERE role='professional' ORDER BY id`);
  const contents = await query(`SELECT id, title, type, category FROM content ORDER BY id`);

  console.log(`👥 ${parents.length} parents, ${professionals.length} professionnels, ${contents.length} contenus`);

  // ── 2. Créer des enfants pour chaque parent qui n'en a pas encore ─────────
  const childNames = [
    ['Adam', 6, 'enfant'],    ['Sara', 8, 'enfant'],
    ['Khalil', 5, 'enfant'],  ['Nadia', 12, 'jeune'],
    ['Youssef', 7, 'enfant'], ['Mariem', 9, 'enfant'],
    ['Ines', 14, 'jeune'],    ['Sami', 4, 'enfant'],
    ['Leila', 10, 'enfant'],  ['Omar', 6, 'enfant'],
    ['Farah', 11, 'jeune'],   ['Anis', 5, 'enfant'],
    ['Rim', 8, 'enfant'],     ['Tarek', 13, 'jeune'],
  ];

  const allChildren = [];

  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    // Vérifier les enfants existants
    const existing = await query(`SELECT id, name FROM children WHERE parent_id = ?`, [parent.id]);

    if (existing.length === 0) {
      // Ajouter 1-2 enfants
      const child1 = childNames[(i * 2) % childNames.length];
      const child2 = childNames[(i * 2 + 1) % childNames.length];

      await query(
        `INSERT IGNORE INTO children (parent_id, name, age, participant_category) VALUES (?, ?, ?, ?)`,
        [parent.id, child1[0], child1[1], child1[2]]
      );
      await query(
        `INSERT IGNORE INTO children (parent_id, name, age, participant_category) VALUES (?, ?, ?, ?)`,
        [parent.id, child2[0], child2[1], child2[2]]
      );
      console.log(`  ✅ Enfants créés pour ${parent.email}: ${child1[0]}, ${child2[0]}`);
    } else {
      console.log(`  ℹ️  ${parent.email} a déjà ${existing.length} enfant(s): ${existing.map(c=>c.name).join(', ')}`);
    }

    const children = await query(`SELECT id, name FROM children WHERE parent_id = ?`, [parent.id]);
    children.forEach(c => allChildren.push({ ...c, parent_id: parent.id, parent_email: parent.email }));
  }

  console.log(`\n👶 Total enfants: ${allChildren.length}`);

  // ── 3. Invitations professionnelles ───────────────────────────────────────
  console.log('\n📨 Création des invitations...');
  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    const prof = professionals[i % professionals.length];

    const existing = await query(
      `SELECT id FROM professional_invitations WHERE parent_id=? AND professional_id=?`,
      [parent.id, prof.id]
    );
    if (existing.length === 0) {
      await query(
        `INSERT IGNORE INTO professional_invitations (parent_id, professional_id, status) VALUES (?, ?, 'active')`,
        [parent.id, prof.id]
      );
      console.log(`  ✅ ${parent.email} ↔ ${prof.email}`);
    }
  }

  // ── 4. Logs d'activités pour chaque enfant ────────────────────────────────
  console.log('\n📊 Injection des logs d\'activités...');
  const actions = ['content_accessed', 'activity_done'];
  const statuses = ['completed', 'completed', 'completed', 'started'];

  for (const child of allChildren) {
    const existingLogs = await query(`SELECT COUNT(*) as cnt FROM activity_logs WHERE child_id = ?`, [child.id]);
    if (existingLogs[0].cnt > 5) {
      console.log(`  ℹ️  ${child.name} a déjà ${existingLogs[0].cnt} logs`);
      continue;
    }

    // 10-15 logs sur 30 jours
    const numLogs = 10 + Math.floor(Math.random() * 6);
    for (let j = 0; j < numLogs; j++) {
      const content = contents[j % contents.length];
      const daysAgo = Math.floor(Math.random() * 30);
      const score = 20 + Math.floor(Math.random() * 60);
      const duration = 60 + Math.floor(Math.random() * 540);
      const status = statuses[j % statuses.length];
      const action = actions[j % actions.length];

      await query(
        `INSERT INTO activity_logs (child_id, content_id, status, action, score, duration_seconds, date)
         VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [child.id, content.id, status, action, score, duration, daysAgo]
      );
    }
    console.log(`  ✅ ${numLogs} logs pour ${child.name}`);
  }

  // ── 5. Messages entre parents et professionnels ───────────────────────────
  console.log('\n💬 Injection des messages...');
  const msgTemplates = [
    ['parent', 'Bonjour Docteur, comment va la progression de mon enfant ?'],
    ['professional', 'Bonjour ! La progression est très encourageante cette semaine.'],
    ['parent', 'Il a du mal à rester concentré pendant les activités. Des conseils ?'],
    ['professional', 'Essayez des sessions courtes de 10-15 minutes avec des pauses régulières.'],
    ['parent', 'Merci pour le conseil ! On va essayer dès demain.'],
    ['professional', 'N\'hésitez pas si vous avez d\'autres questions. Bonne continuation !'],
    ['parent', 'Il a complété toutes ses activités de la semaine, on est très contents !'],
    ['professional', 'Excellent ! C\'est un très bon signe. Continuez ainsi !'],
  ];

  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    const prof = professionals[i % professionals.length];

    // Vérifier s'il y a déjà des messages
    const parentChildren = allChildren.filter(c => c.parent_id === parent.id);
    if (parentChildren.length === 0) continue;
    const child = parentChildren[0];

    const existingMsgs = await query(
      `SELECT COUNT(*) as cnt FROM messages WHERE sender_id=? OR receiver_id=?`,
      [parent.id, parent.id]
    );
    if (existingMsgs[0].cnt > 0) {
      console.log(`  ℹ️  ${parent.email} a déjà des messages`);
      continue;
    }

    for (let j = 0; j < msgTemplates.length; j++) {
      const [senderRole, content] = msgTemplates[j];
      const senderId = senderRole === 'parent' ? parent.id : prof.id;
      const receiverId = senderRole === 'parent' ? prof.id : parent.id;
      const hoursAgo = (msgTemplates.length - j) * 3;

      await query(
        `INSERT INTO messages (child_id, sender_id, receiver_id, content, created_at)
         VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR))`,
        [child.id, senderId, receiverId, content, hoursAgo]
      );
    }
    console.log(`  ✅ ${msgTemplates.length} messages pour ${parent.email} ↔ ${prof.email} (${child.name})`);
  }

  // ── 6. Notes professionnelles pour chaque enfant ──────────────────────────
  console.log('\n📝 Injection des notes professionnelles...');
  const noteTemplates = [
    'Séance productive. Bonne concentration maintenue pendant 15 minutes. Progrès notable.',
    'L\'enfant montre des améliorations dans la communication non-verbale. Continuer les exercices AAC.',
    'Bilan mensuel positif. Score moyen en hausse de 20%. Recommandation : activités niveau 2.',
    'Bonne interaction sociale ce jour. Contact visuel maintenu lors des échanges.',
    'Revue des activités de la semaine. Recommandation : augmenter la fréquence quotidienne.',
    'L\'enfant a bien répondu aux nouvelles techniques. Prochaine étape : autonomie au quotidien.',
  ];

  for (let i = 0; i < allChildren.length; i++) {
    const child = allChildren[i];
    const prof = professionals[i % professionals.length];

    const existingNotes = await query(
      `SELECT COUNT(*) as cnt FROM notes WHERE child_id = ?`, [child.id]
    );
    if (existingNotes[0].cnt > 0) {
      console.log(`  ℹ️  ${child.name} a déjà des notes`);
      continue;
    }

    const numNotes = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numNotes; j++) {
      const note = noteTemplates[j % noteTemplates.length];
      const daysAgo = (numNotes - j) * 7;
      await query(
        `INSERT INTO notes (professional_id, child_id, content, date)
         VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [prof.id, child.id, note, daysAgo]
      );
    }
    console.log(`  ✅ ${numNotes} notes pour ${child.name} par ${prof.email}`);
  }

  // ── 7. Résumé final ────────────────────────────────────────────────────────
  console.log('\n📈 RÉSUMÉ FINAL:');
  const [{ cnt: totalChildren }] = await query(`SELECT COUNT(*) as cnt FROM children`);
  const [{ cnt: totalLogs }] = await query(`SELECT COUNT(*) as cnt FROM activity_logs`);
  const [{ cnt: totalMsgs }] = await query(`SELECT COUNT(*) as cnt FROM messages`);
  const [{ cnt: totalNotes }] = await query(`SELECT COUNT(*) as cnt FROM notes`);
  const [{ cnt: totalInvit }] = await query(`SELECT COUNT(*) as cnt FROM professional_invitations`);

  console.log(`  👶 Enfants     : ${totalChildren}`);
  console.log(`  📊 Logs        : ${totalLogs}`);
  console.log(`  💬 Messages    : ${totalMsgs}`);
  console.log(`  📝 Notes       : ${totalNotes}`);
  console.log(`  📨 Invitations : ${totalInvit}`);
  console.log('\n✅ Injection terminée !');
  process.exit(0);
}

main().catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); });

