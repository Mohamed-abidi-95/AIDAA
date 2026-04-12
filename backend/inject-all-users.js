// ============================================================================
// AIDAA — inject-all-users.js
// Injecte tous les comptes de test (admin, parent, professionnel + enfant)
// Usage: node inject-all-users.js
// ============================================================================

const mysql    = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function injectAllUsers() {
  let connection;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║         AIDAA — Injection des utilisateurs        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  try {
    // ── Connexion à la base de données ──────────────────────────────────
    connection = await mysql.createConnection({
      host     : process.env.DB_HOST     || 'localhost',
      port     : process.env.DB_PORT     || 3306,
      user     : process.env.DB_USER     || 'root',
      password : process.env.DB_PASSWORD || '',
      database : process.env.DB_DATABASE || 'aidaa_db',
    });
    console.log('✅ Connexion à la base de données réussie\n');

    // ── Hashage des mots de passe ────────────────────────────────────────
    console.log('🔐 Hashage des mots de passe...');
    const [hashAdmin, hashParent, hashPro] = await Promise.all([
      bcryptjs.hash('admin123',        12),
      bcryptjs.hash('parent123',       12),
      bcryptjs.hash('professional123', 12),
    ]);
    console.log('✅ Mots de passe hashés\n');

    // ── Helper : INSERT avec ON DUPLICATE KEY UPDATE ─────────────────────
    const upsertUser = async (name, email, hash, role) => {
      await connection.execute(
        `INSERT INTO users (name, email, password, role, is_active)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           name      = VALUES(name),
           password  = VALUES(password),
           role      = VALUES(role),
           is_active = 1`,
        [name, email, hash, role]
      );
      const [[user]] = await connection.execute(
        'SELECT id, name, email, role FROM users WHERE email = ?',
        [email]
      );
      return user;
    };

    // ── 1. Admin ─────────────────────────────────────────────────────────
    const admin = await upsertUser(
      'Admin Test',
      'admin@aidaa.com',
      hashAdmin,
      'admin'
    );
    console.log(`✅ Admin          → id:${admin.id}  |  admin@aidaa.com  |  admin123`);

    // ── 2. Parent ────────────────────────────────────────────────────────
    const parent = await upsertUser(
      'Parent Test',
      'parent@aidaa.com',
      hashParent,
      'parent'
    );
    console.log(`✅ Parent         → id:${parent.id}  |  parent@aidaa.com  |  parent123`);

    // ── 3. Professionnel ─────────────────────────────────────────────────
    const pro = await upsertUser(
      'Dr. Professional Test',
      'professional@aidaa.com',
      hashPro,
      'professional'
    );
    console.log(`✅ Professionnel  → id:${pro.id}  |  professional@aidaa.com  |  professional123`);

    // ── 4. Enfant de test lié au parent ──────────────────────────────────
    const [[existingChild]] = await connection.execute(
      'SELECT id FROM children WHERE parent_id = ? AND name = ?',
      [parent.id, 'Test Child 1']
    );

    if (!existingChild) {
      await connection.execute(
        'INSERT INTO children (parent_id, name, age, participant_category) VALUES (?, ?, ?, ?)',
        [parent.id, 'Test Child 1', 5, 'enfant']
      );
      console.log(`✅ Enfant         → "Test Child 1" (âge 5) créé pour parent id:${parent.id}`);
    } else {
      console.log(`ℹ️  Enfant         → "Test Child 1" existait déjà (id:${existingChild.id})`);
    }

    // ── Récapitulatif ─────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅  INJECTION TERMINÉE                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Rôle           Email                       Mot de passe        ║');
    console.log('║  ─────────────  ──────────────────────────  ───────────────     ║');
    console.log('║  Admin          admin@aidaa.com             admin123            ║');
    console.log('║  Parent         parent@aidaa.com            parent123           ║');
    console.log('║  Professionnel  professional@aidaa.com      professional123     ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Frontend : http://localhost:5173                               ║');
    console.log('║  Backend  : http://localhost:5000/health                        ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // ── Vérification finale dans la DB ────────────────────────────────────
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, role, is_active FROM users WHERE email IN (?,?,?)',
      ['admin@aidaa.com', 'parent@aidaa.com', 'professional@aidaa.com']
    );
    console.log('📊 Vérification DB :');
    console.table(allUsers);

  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   → MySQL n\'est pas démarré ou le .env est mal configuré');
    }
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.error('   → Les tables n\'existent pas. Importez d\'abord aidaa_schema.sql');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Mauvais mot de passe MySQL. Vérifiez DB_PASSWORD dans .env');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Connexion fermée');
    }
  }
}

injectAllUsers();

