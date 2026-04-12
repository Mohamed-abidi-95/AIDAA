// ============================================================================
// AIDAA — analyticsSeeder.js
// ============================================================================
// Génère des données réalistes pour les analytiques professionnelles
// Usage : npm run seed:analytics  (depuis backend/)
//         node src/seeders/analyticsSeeder.js
// ============================================================================

const mysql    = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// ── Helpers ────────────────────────────────────────────────────────────────────
const randomPastDate = (maxDaysBack = 60) => {
  const ms = Math.floor(Math.random() * maxDaysBack * 24 * 60 * 60 * 1000);
  return new Date(Date.now() - ms);
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick    = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ACTIVITIES = ['Memoire', 'Couleurs', 'Sequences', 'AAC', 'Lecture'];

// ── Ajoute les colonnes manquantes si le serveur n'a pas encore tourné ─────────
async function ensureColumns(conn) {
  const alters = [
    "ALTER TABLE users ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'",
    "ALTER TABLE users ADD COLUMN specialite VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL",
    "ALTER TABLE activity_logs ADD COLUMN score INT DEFAULT 0",
    "ALTER TABLE activity_logs ADD COLUMN duration_seconds INT DEFAULT 0",
    "ALTER TABLE activity_logs ADD COLUMN action VARCHAR(50) DEFAULT 'content_accessed'",
    "ALTER TABLE activity_logs MODIFY COLUMN content_id INT DEFAULT NULL",
  ];
  for (const sql of alters) {
    try { await conn.execute(sql); } catch (_) { /* colonne deja presente - OK */ }
  }
  console.log('  Colonnes verifiees\n');
}

// ── Upsert user ────────────────────────────────────────────────────────────────
async function upsertUser(conn, { name, email, password, role }) {
  await conn.execute(
    `INSERT INTO users (name, email, password, role, is_active, status)
     VALUES (?, ?, ?, ?, 1, 'approved')
     ON DUPLICATE KEY UPDATE
       name      = VALUES(name),
       password  = VALUES(password),
       role      = VALUES(role),
       is_active = 1,
       status    = 'approved'`,
    [name, email, password, role]
  );
  const [[user]] = await conn.execute(
    'SELECT id, name, email, role FROM users WHERE email = ?', [email]
  );
  return user;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
  let conn;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      AIDAA — Seeder Analytics  (noms arabes)               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    conn = await mysql.createConnection({
      host    : process.env.DB_HOST     || 'localhost',
      port    : process.env.DB_PORT     || 3306,
      user    : process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'aidaa_db',
    });
    console.log('✅ Connexion DB réussie\n');

    // ── Vérification des colonnes manquantes ───────────────────────────────────
    await ensureColumns(conn);

    // ── 1. Hash passwords ────────────────────────────────────────────────────
    console.log('🔐 Hashage des mots de passe...');
    const [hAbderrahman, hKarim, hFatma, hMohamed] = await Promise.all([
      bcryptjs.hash('abderrahman123', 12),
      bcryptjs.hash('karim123',       12),
      bcryptjs.hash('fatma123',       12),
      bcryptjs.hash('mohamed123',     12),
    ]);
    console.log('✅ Mots de passe hashés\n');

    // ── 2. Professionnel : Dr. Abderrahman Sbai ──────────────────────────────
    console.log('👨‍⚕️  Création du professionnel...');
    const abderrahman = await upsertUser(conn, {
      name    : 'Dr. Abderrahman Sbai',
      email   : 'abderrahman@aidaa.com',
      password: hAbderrahman,
      role    : 'professional',
    });
    console.log(`  ✅ Dr. Abderrahman Sbai  → id:${abderrahman.id}  |  abderrahman@aidaa.com / abderrahman123\n`);

    // ── 3. Parents ───────────────────────────────────────────────────────────
    console.log('👪 Création des parents...');
    const karim   = await upsertUser(conn, { name: 'Karim Boulares',    email: 'karim@aidaa.com',   password: hKarim,   role: 'parent' });
    const fatma   = await upsertUser(conn, { name: 'Fatma Chaabane',    email: 'fatma@aidaa.com',   password: hFatma,   role: 'parent' });
    const mohamed = await upsertUser(conn, { name: 'Mohamed Trabelsi',  email: 'mohamed@aidaa.com', password: hMohamed, role: 'parent' });
    console.log(`  ✅ Karim Boulares    → id:${karim.id}   | karim@aidaa.com / karim123`);
    console.log(`  ✅ Fatma Chaabane    → id:${fatma.id}   | fatma@aidaa.com / fatma123`);
    console.log(`  ✅ Mohamed Trabelsi  → id:${mohamed.id}  | mohamed@aidaa.com / mohamed123\n`);

    // ── 4. Enfants (un par parent) ───────────────────────────────────────────
    console.log('👶 Création des enfants...');
    const ensureChild = async (parentId, name, age) => {
      const [[ex]] = await conn.execute(
        'SELECT id FROM children WHERE parent_id = ? AND name = ? LIMIT 1',
        [parentId, name]
      );
      if (ex) return ex;
      await conn.execute(
        'INSERT INTO children (parent_id, name, age, participant_category) VALUES (?,?,?,?)',
        [parentId, name, age, 'enfant']
      );
      const [[child]] = await conn.execute(
        'SELECT id FROM children WHERE parent_id = ? AND name = ? LIMIT 1',
        [parentId, name]
      );
      return child;
    };

    const yassine = await ensureChild(karim.id,   'Yassine',  6);
    const lina    = await ensureChild(fatma.id,   'Lina',     8);
    const rayan   = await ensureChild(mohamed.id, 'Rayan',    5);
    console.log(`  ✅ Yassine  (parent: Karim)    → id:${yassine.id}`);
    console.log(`  ✅ Lina     (parent: Fatma)    → id:${lina.id}`);
    console.log(`  ✅ Rayan    (parent: Mohamed)  → id:${rayan.id}\n`);

    // ── 5. Invitations actives (parent → professionnel) ──────────────────────
    console.log('🔗 Liaison parents ↔ Dr. Abderrahman (status = active)...');
    for (const parentId of [karim.id, fatma.id, mohamed.id]) {
      await conn.execute(
        `INSERT INTO professional_invitations (parent_id, professional_id, status)
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [parentId, abderrahman.id]
      );
    }
    console.log(`  ✅ 3 parents liés à Dr. Abderrahman Sbai (id:${abderrahman.id})\n`);

    // ── 6. Logs d'activités — 30 par enfant sur 60 jours ─────────────────────
    console.log("📊 Génération des logs d'activités (30 × 3 enfants = 90 entrées)...");
    const children = [
      { id: yassine.id, name: 'Yassine' },
      { id: lina.id,    name: 'Lina'    },
      { id: rayan.id,   name: 'Rayan'   },
    ];

    let totalLogs = 0;
    for (const child of children) {
      const [[{ cnt }]] = await conn.execute(
        'SELECT COUNT(*) AS cnt FROM activity_logs WHERE child_id = ? AND action IN (?,?,?,?,?)',
        [child.id, ...ACTIVITIES]
      );

      const toInsert = 30 - Number(cnt);
      if (toInsert <= 0) {
        console.log(`  ⏭️  ${child.name} : ${cnt} logs déjà présents — skip`);
        continue;
      }

      for (let i = 0; i < toInsert; i++) {
        // Score progressif : commence bas, monte sur la période (simulation réaliste)
        const progression = i / 29;
        const score = Math.min(95,
          randInt(45, 65) + Math.round(progression * 30) + randInt(-5, 5)
        );
        await conn.execute(
          `INSERT INTO activity_logs
             (child_id, content_id, status, action, score, duration_seconds, date)
           VALUES (?, NULL, 'completed', ?, ?, ?, ?)`,
          [child.id, pick(ACTIVITIES), score, randInt(120, 900), randomPastDate(60)]
        );
        totalLogs++;
      }
      console.log(`  ✅ ${child.name} : ${toInsert} log(s) insérés`);
    }

    // ── Récapitulatif ─────────────────────────────────────────────────────────
    const [[{ totalAL }]] = await conn.execute(
      'SELECT COUNT(*) AS totalAL FROM activity_logs WHERE child_id IN (?,?,?)',
      [yassine.id, lina.id, rayan.id]
    );
    const [[{ totalInv }]] = await conn.execute(
      "SELECT COUNT(*) AS totalInv FROM professional_invitations WHERE professional_id = ? AND status = 'active'",
      [abderrahman.id]
    );

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                     ✅  SEED TERMINÉ                           ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║  ${String(totalLogs).padEnd(2)} log(s) insérés  |  ${totalAL} total  |  ${totalInv} invitations actives    ║`);
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║  Rôle           Email                        Mot de passe      ║');
    console.log('║  ─────────────  ───────────────────────────  ───────────────   ║');
    console.log('║  Professionnel  abderrahman@aidaa.com         abderrahman123    ║');
    console.log('║  Parent 1       karim@aidaa.com               karim123          ║');
    console.log('║  Parent 2       fatma@aidaa.com               fatma123          ║');
    console.log('║  Parent 3       mohamed@aidaa.com             mohamed123        ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║  → Connectez-vous avec abderrahman@aidaa.com → Analytiques     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

  } catch (err) {
    console.error('\n❌ Erreur fatale :', err.message);
    if (err.code === 'ECONNREFUSED')           console.error("   → MySQL non démarré ou .env mal configuré");
    if (err.code === 'ER_NO_SUCH_TABLE')       console.error("   → Importez d'abord setup_complete.sql dans phpMyAdmin");
    if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error("   → Mauvais mot de passe MySQL dans .env");
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
      console.log('✅ Connexion fermée');
    }
  }
}

seed();
