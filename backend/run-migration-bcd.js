// run-migration-bcd.js — Migration robuste step-by-step
const { query } = require('./src/config/db');

async function sq(sql, label, params) {
  try {
    await query(sql, params);
    console.log('[OK]', label);
    return true;
  } catch (e) {
    const skip = ['already exists','Duplicate column','Duplicate entry',"Can't DROP",'Multiple primary key'];
    if (skip.some((s) => e.message.includes(s))) {
      console.log('[SKIP]', label);
      return true;
    }
    console.error('[FAIL]', label, '->', e.message.split('\n')[0].substring(0,100));
    return false;
  }
}

async function run() {
  let fails = 0;

  // 1. Fix content_id nullable
  await sq('SET FOREIGN_KEY_CHECKS = 0', 'FK off');
  if (!await sq('ALTER TABLE activity_logs MODIFY COLUMN content_id INT DEFAULT NULL', 'content_id nullable')) fails++;
  await sq('SET FOREIGN_KEY_CHECKS = 1', 'FK on');

  // 2. participant_category on content
  if (!await sq("ALTER TABLE content ADD COLUMN participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous'", 'content.participant_category')) fails++;

  // 3. guided_sequences
  if (!await sq(`CREATE TABLE IF NOT EXISTS guided_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    emoji VARCHAR(20) DEFAULT '?',
    participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
    duration_minutes INT DEFAULT 15,
    difficulty ENUM('facile','moyen','difficile') DEFAULT 'facile',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, 'guided_sequences table')) fails++;

  // 4. sequence_steps
  if (!await sq(`CREATE TABLE IF NOT EXISTS sequence_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sequence_id INT NOT NULL,
    step_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    emoji VARCHAR(20) DEFAULT '?',
    duration_seconds INT DEFAULT 60,
    FOREIGN KEY (sequence_id) REFERENCES guided_sequences(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, 'sequence_steps table')) fails++;

  // 5. aac_symbols
  if (!await sq(`CREATE TABLE IF NOT EXISTS aac_symbols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    emoji VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
    color VARCHAR(20) DEFAULT '#3b82f6',
    sort_order INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, 'aac_symbols table')) fails++;

  // 6. badges
  if (!await sq(`CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(20) NOT NULL DEFAULT '?',
    condition_type ENUM('activities','points','games') NOT NULL,
    condition_value INT NOT NULL DEFAULT 1,
    color VARCHAR(20) DEFAULT '#f59e0b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, 'badges table')) fails++;

  // 7. child_badges
  if (!await sq(`CREATE TABLE IF NOT EXISTS child_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_badge (child_id, badge_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, 'child_badges table')) fails++;

  // 8. Insert sample sequences (parameterized to avoid encoding issues)
  const seqRows = [
    ['Routine du matin',         'Apprendre la routine du matin etape par etape', '🌅', 'enfant', 10, 'facile'],
    ['Lavage des mains',         'Comment bien se laver les mains',               '🧼', 'tous',   5,  'facile'],
    ['Preparation repas simple', 'Preparer un sandwich ou une collation',          '🥪', 'jeune',  20, 'moyen'],
    ['Prise des transports',     'Utiliser les transports en commun',              '🚌', 'adulte', 30, 'moyen'],
    ['Gestion des emotions',     'Reconnaitre et exprimer ses emotions',           '😊', 'tous',   15, 'facile'],
  ];
  for (const r of seqRows) {
    await sq(
      'INSERT INTO guided_sequences (title, description, emoji, participant_category, duration_minutes, difficulty) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id=id',
      `Seq: ${r[0]}`, r
    );
  }

  // 9. Sequence steps
  const stepsData = {
    'Routine du matin': [
      [1,'Se reveiller','Ouvrir les yeux et s etirer','☀️',30],
      [2,'Se lever','Mettre les pieds par terre','🛏️',30],
      [3,'Se laver','Aller a la salle de bain','🚿',120],
      [4,'S habiller','Choisir et mettre ses vetements','👕',180],
      [5,'Petit dejeuner','Manger et boire','🥛',600],
    ],
    'Lavage des mains': [
      [1,'Ouvrir robinet','Tourner le robinet','🚰',10],
      [2,'Mouiller','Mettre les mains sous l eau','💧',10],
      [3,'Savonner','Prendre du savon et frotter','🧴',20],
      [4,'Rincer','Enlever tout le savon','💧',15],
      [5,'Secher','Utiliser une serviette','🧻',10],
    ],
    'Gestion des emotions': [
      [1,'Identifier','Comment est-ce que je me sens','🤔',30],
      [2,'Respirer','Prendre 3 grandes inspirations','💨',30],
      [3,'Exprimer','Dire ce que l on ressent','💬',60],
      [4,'Chercher solution','Que puis-je faire','💡',60],
      [5,'Demander aide','Parler a quelqu un','🤝',30],
    ],
  };
  for (const [seqTitle, stepList] of Object.entries(stepsData)) {
    try {
      const rows = await query('SELECT id FROM guided_sequences WHERE title = ? LIMIT 1', [seqTitle]);
      if (!rows.length) { console.log('[SKIP] Seq not found:', seqTitle); continue; }
      const seqId = rows[0].id;
      const existing = await query('SELECT COUNT(*) AS cnt FROM sequence_steps WHERE sequence_id = ?', [seqId]);
      if (existing[0].cnt > 0) { console.log('[SKIP] Steps exist:', seqTitle); continue; }
      for (const [num, title, desc, emoji, dur] of stepList) {
        await query('INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds) VALUES (?,?,?,?,?,?)', [seqId, num, title, desc, emoji, dur]);
      }
      console.log('[OK] Steps for:', seqTitle);
    } catch(e) { console.error('[FAIL] Steps for', seqTitle, e.message.substring(0,60)); fails++; }
  }

  // 10. AAC symbols
  const aacData = [
    ["J'ai faim",'🍽️','Besoins','tous','#ef4444',1],
    ["J'ai soif",'💧','Besoins','tous','#3b82f6',2],
    ['Je veux dormir','😴','Besoins','tous','#8b5cf6',3],
    ["J'ai mal",'🤕','Besoins','tous','#f97316',4],
    ['Toilettes','🚻','Besoins','tous','#6b7280',5],
    ["J'ai froid",'🥶','Besoins','tous','#60a5fa',6],
    ["J'ai chaud",'🥵','Besoins','tous','#f87171',7],
    ['Je veux jouer','🎮','Besoins','tous','#10b981',8],
    ["Je veux de l aide",'🙋','Besoins','tous','#f59e0b',9],
    ['Je suis heureux','😊','Emotions','tous','#f59e0b',1],
    ['Je suis triste','😢','Emotions','tous','#60a5fa',2],
    ['Je suis en colere','😠','Emotions','tous','#ef4444',3],
    ["J'ai peur",'😨','Emotions','tous','#8b5cf6',4],
    ['Je suis fatigue','😴','Emotions','tous','#94a3b8',5],
    ['Je suis calme','😌','Emotions','tous','#34d399',6],
    ["J'aime ca",'❤️','Emotions','tous','#f43f5e',7],
    ['Je ne veux pas','🙅','Emotions','tous','#f97316',8],
    ['Arreter','✋','Actions','tous','#ef4444',1],
    ['Venir','👋','Actions','tous','#3b82f6',2],
    ['Aider','🤝','Actions','tous','#10b981',3],
    ['Montrer','👉','Actions','tous','#f59e0b',4],
    ['Donner','🎁','Actions','tous','#8b5cf6',5],
    ['Attendre','⏳','Actions','tous','#6b7280',6],
    ['Recommencer','🔄','Actions','tous','#06b6d4',7],
    ['Eau','💧','Aliments','tous','#3b82f6',1],
    ['Pain','🍞','Aliments','tous','#f59e0b',2],
    ['Fruit','🍎','Aliments','tous','#ef4444',3],
    ['Legumes','🥦','Aliments','tous','#10b981',4],
    ['Lait','🥛','Aliments','enfant','#e2e8f0',5],
    ['Gateau','🎂','Aliments','enfant','#ec4899',6],
  ];
  try {
    const cnt = await query('SELECT COUNT(*) AS c FROM aac_symbols');
    if (cnt[0].c > 0) { console.log('[SKIP] AAC symbols exist:', cnt[0].c); }
    else {
      for (const r of aacData) {
        await query('INSERT INTO aac_symbols (label, emoji, category, participant_category, color, sort_order) VALUES (?,?,?,?,?,?)', r);
      }
      console.log('[OK] AAC symbols:', aacData.length);
    }
  } catch(e) { console.error('[FAIL] AAC:', e.message.substring(0,80)); fails++; }

  // 11. Badges
  const badgeData = [
    ['Premier pas',   'Premiere activite realisee', '🌟','activities',1,  '#f59e0b'],
    ['Explorateur',   '5 activites completees',     '🧭','activities',5,  '#3b82f6'],
    ['Etoile',        '10 activites completees',    '⭐','activities',10, '#8b5cf6'],
    ['Champion',      '50 points gagnes',           '🏆','points',    50, '#ef4444'],
    ['Super joueur',  '100 points gagnes',          '💎','points',   100, '#06b6d4'],
    ['Grand champion','250 points gagnes',          '👑','points',   250, '#f97316'],
  ];
  try {
    const cnt = await query('SELECT COUNT(*) AS c FROM badges');
    if (cnt[0].c > 0) { console.log('[SKIP] Badges exist:', cnt[0].c); }
    else {
      for (const r of badgeData) {
        await query('INSERT INTO badges (name, description, emoji, condition_type, condition_value, color) VALUES (?,?,?,?,?,?)', r);
      }
      console.log('[OK] Badges:', badgeData.length);
    }
  } catch(e) { console.error('[FAIL] Badges:', e.message.substring(0,80)); fails++; }

  console.log('\n=== Done. Failures:', fails, '===');
  process.exit(fails > 0 ? 1 : 0);
}
run().catch((e) => { console.error('Fatal:', e); process.exit(1); });
