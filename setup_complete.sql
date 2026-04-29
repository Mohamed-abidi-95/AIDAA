-- ============================================================================
-- AIDAA setup_complete.sql (VERSION COMPLETE)
-- ============================================================================
-- COMPTES :
--   admin@aidaa.com            / admin123
--   parent@aidaa.com           / parent123
--   sarah.johnson@aidaa.com    / parent123
--   mohamed.trabelsi@aidaa.com / parent123
--   leila.benali@aidaa.com     / parent123
--   karim@aidaa.com            / karim123
--   fatma@aidaa.com            / fatma123
--   mohamed@aidaa.com          / mohamed123
--   professional@aidaa.com     / professional123
--   abderrahman.sbai@aidaa.com / professional123
--   abderrahman@aidaa.com      / abderrahman123
--   fatima.mansour@aidaa.com   / professional123
--   karim.hamdi@aidaa.com      / professional123
--   amina.chaabane@aidaa.com   / professional123
-- ============================================================================

CREATE DATABASE IF NOT EXISTS aidaa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aidaa_db;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  role ENUM('admin','parent','professional') NOT NULL DEFAULT 'parent',
  specialite VARCHAR(100) NULL DEFAULT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT,
  participant_category ENUM('enfant','jeune','adulte') NOT NULL DEFAULT 'enfant',
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

CREATE TABLE IF NOT EXISTS content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type ENUM('video','audio','activity') NOT NULL DEFAULT 'video',
  category VARCHAR(100),
  category_color VARCHAR(20) DEFAULT '#f97316',
  age_group VARCHAR(50),
  level INT DEFAULT 1,
  url TEXT,
  description TEXT,
  emoji VARCHAR(10) DEFAULT NULL,
  duration VARCHAR(20) DEFAULT NULL,
  steps INT DEFAULT NULL,
  minutes INT DEFAULT NULL,
  emoji_color VARCHAR(20) DEFAULT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'fr',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  content_id INT DEFAULT NULL,
  status ENUM('started','completed') DEFAULT 'started',
  action VARCHAR(50) DEFAULT 'content_accessed',
  score INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_activity_logs_child_id ON activity_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_content_id ON activity_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_score ON activity_logs(score);

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professional_id INT NOT NULL,
  child_id INT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_notes_professional_id ON notes(professional_id);
CREATE INDEX IF NOT EXISTS idx_notes_child_id ON notes(child_id);

CREATE TABLE IF NOT EXISTS teleconsultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  professional_id INT NOT NULL,
  date_time DATETIME NOT NULL,
  meeting_link VARCHAR(500),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (professional_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_teleconsultations_parent_id ON teleconsultations(parent_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_professional_id ON teleconsultations(professional_id);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_messages_child_id (child_id),
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_receiver_id (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  thumbnail_url VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_games_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guided_sequences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(20) DEFAULT NULL,
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  duration_minutes INT DEFAULT 15,
  difficulty ENUM('facile','moyen','difficile') DEFAULT 'facile',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sequence_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sequence_id INT NOT NULL,
  step_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(20) DEFAULT NULL,
  duration_seconds INT DEFAULT 60,
  FOREIGN KEY (sequence_id) REFERENCES guided_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aac_symbols (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  emoji VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  color VARCHAR(20) DEFAULT '#3b82f6',
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(20) NOT NULL DEFAULT '*',
  condition_type ENUM('activities','points','games') NOT NULL,
  condition_value INT NOT NULL DEFAULT 1,
  color VARCHAR(20) DEFAULT '#f59e0b',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS child_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_badge (child_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS professional_invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  professional_id INT NOT NULL,
  status ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (parent_id, professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_prof_inv_parent ON professional_invitations(parent_id);
CREATE INDEX IF NOT EXISTS idx_prof_inv_prof ON professional_invitations(professional_id);

CREATE TABLE IF NOT EXISTS chatbot_consent_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  consented TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chatbot_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faq_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  language VARCHAR(10) DEFAULT 'fr'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- DONNEES : Utilisateurs
-- Mots de passe bcryptjs 12 rounds :
--   admin123        : $2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u
--   parent123       : $2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym
--   professional123 : $2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou
--   abderrahman123  : $2a$12$N9Ov9wISL4BbHWzSn/FNsOEHmK/H9A.IzG7tKBHJf5VU0M0Zxn.bq
--   karim123/fatma123/mohamed123 : $2a$12$sJmHuJg6xJzUkgMVSL5LR.UBYNLm4GJ3oAT.I.Xg8MUcaFpxl0iOa
-- ============================================================================

INSERT INTO users (name, email, password, role, specialite, status, is_active) VALUES
('Admin AIDAA',          'admin@aidaa.com',            '$2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u', 'admin',       NULL,               'approved', 1),
('Parent Test',          'parent@aidaa.com',           '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent',       NULL,               'approved', 1),
('Sarah Johnson',        'sarah.johnson@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent',       NULL,               'approved', 1),
('Mohamed Trabelsi',     'mohamed.trabelsi@aidaa.com', '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent',       NULL,               'approved', 1),
('Leila Ben Ali',        'leila.benali@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent',       NULL,               'approved', 1),
('Karim Boulares',       'karim@aidaa.com',            '$2a$12$sJmHuJg6xJzUkgMVSL5LR.UBYNLm4GJ3oAT.I.Xg8MUcaFpxl0iOa', 'parent',       NULL,               'approved', 1),
('Fatma Chaabane',       'fatma@aidaa.com',            '$2a$12$sJmHuJg6xJzUkgMVSL5LR.UBYNLm4GJ3oAT.I.Xg8MUcaFpxl0iOa', 'parent',       NULL,               'approved', 1),
('Mohamed Abidi',        'mohamed@aidaa.com',          '$2a$12$sJmHuJg6xJzUkgMVSL5LR.UBYNLm4GJ3oAT.I.Xg8MUcaFpxl0iOa', 'parent',       NULL,               'approved', 1),
('Dr. Professional',     'professional@aidaa.com',     '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthophonie',      'approved', 1),
('Dr. Abderrahman Sbai', 'abderrahman.sbai@aidaa.com', '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Psychologie',      'approved', 1),
('Dr. Abderrahman Sbai', 'abderrahman@aidaa.com',      '$2a$12$N9Ov9wISL4BbHWzSn/FNsOEHmK/H9A.IzG7tKBHJf5VU0M0Zxn.bq', 'professional', 'Psychologie',      'approved', 1),
('Dr. Fatima Mansour',   'fatima.mansour@aidaa.com',   '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthopedag.',      'approved', 1),
('Dr. Karim Hamdi',      'karim.hamdi@aidaa.com',      '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Neuropsychologie', 'approved', 1),
('Dr. Amina Chaabane',   'amina.chaabane@aidaa.com',   '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Ergotherapie',     'approved', 1)
ON DUPLICATE KEY UPDATE password = VALUES(password), status = 'approved', is_active = 1;

-- ============================================================================
-- DONNEES : Enfants
-- ============================================================================

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Test Child 1', 5, 'enfant' FROM users u WHERE u.email = 'parent@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Test Child 1') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Emma Johnson', 6, 'enfant' FROM users u WHERE u.email = 'sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Emma Johnson') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Lucas Johnson', 9, 'enfant' FROM users u WHERE u.email = 'sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Lucas Johnson') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Youssef Trabelsi', 7, 'enfant' FROM users u WHERE u.email = 'mohamed.trabelsi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Youssef Trabelsi') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Nour Ben Ali', 14, 'jeune' FROM users u WHERE u.email = 'leila.benali@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Nour Ben Ali') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Yassine', 6, 'enfant' FROM users u WHERE u.email = 'karim@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Yassine') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Lina', 8, 'enfant' FROM users u WHERE u.email = 'fatma@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Lina') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Rayan', 5, 'enfant' FROM users u WHERE u.email = 'mohamed@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Rayan') LIMIT 1;

-- ============================================================================
-- DONNEES : Invitations professionnelles (toutes actives)
-- ============================================================================

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'parent@aidaa.com' AND pr.email = 'professional@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'sarah.johnson@aidaa.com' AND pr.email = 'abderrahman.sbai@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'mohamed.trabelsi@aidaa.com' AND pr.email = 'fatima.mansour@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'leila.benali@aidaa.com' AND pr.email = 'karim.hamdi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'karim@aidaa.com' AND pr.email = 'abderrahman@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'fatma@aidaa.com' AND pr.email = 'abderrahman@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p JOIN users pr ON 1=1
WHERE p.email = 'mohamed@aidaa.com' AND pr.email = 'abderrahman@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- ============================================================================
-- DONNEES : Contenu educatif
-- ============================================================================

INSERT INTO content (title, type, category, category_color, duration, url, description, age_group, level, language, participant_category) VALUES
('Apprendre a dire bonjour',    'video',    'Communication', '#f97316', '3 min', 'https://example.com/v1.mp4',  'Apprendre a saluer poliment',           '4-6',  1, 'fr', 'tous'),
('Reconnaitre les emotions',    'video',    'Emotions',      '#f97316', '5 min', 'https://example.com/v2.mp4',  'Identifier les differentes emotions',   '4-6',  1, 'fr', 'tous'),
('Jouer ensemble',              'video',    'Social',        '#f97316', '4 min', 'https://example.com/v3.mp4',  'Les benefices du jeu social',           '4-6',  1, 'fr', 'tous'),
('Preparer mon petit-dejeuner', 'video',    'Autonomie',     '#f97316', '6 min', 'https://example.com/v4.mp4',  'Preparer un petit-dejeuner sain',       '4-6',  1, 'fr', 'tous'),
('Sequence du matin',           'activity', 'Autonomie',     '#f97316', NULL,    'https://example.com/a1',      'Routine matinale structuree',           '4-6',  1, 'fr', 'tous'),
('Creer avec les couleurs',     'activity', 'Creativite',    '#f97316', NULL,    'https://example.com/a2',      'Activite creative et sensorielle',      '4-6',  1, 'fr', 'tous'),
('Ecouter et repeter',          'audio',    'Langage',       '#f97316', '2 min', 'https://example.com/au1.mp3', 'Jeu ecoute et prononciation',           '4-6',  1, 'fr', 'tous'),
('Les chiffres en arabe',       'video',    'Langage',       '#3b82f6', '4 min', 'https://example.com/v5.mp4',  'Apprendre les chiffres 1-10 en arabe', '4-6',  1, 'ar', 'tous'),
('Marhba - Dire bonjour',       'audio',    'Communication', '#10b981', '3 min', 'https://example.com/au2.mp3', 'Saluer en dialecte tunisien',           '4-6',  1, 'tn', 'tous'),
('Gestion du stress',           'video',    'Emotions',      '#8b5cf6', '7 min', 'https://example.com/v6.mp4',  'Techniques de relaxation',              '7-12', 2, 'fr', 'jeune'),
('Autonomie au quotidien',      'activity', 'Autonomie',     '#f97316', NULL,    'https://example.com/a3',      'Developper autonomie au quotidien',     '7-12', 2, 'fr', 'jeune'),
('Memoire - Jeu des paires',    'activity', 'Cognition',     '#6366f1', NULL,    'https://example.com/mem',     'Exercice de memoire visuelle',          '4-10', 1, 'fr', 'tous'),
('Ma routine du soir',          'video',    'Autonomie',     '#f59e0b', '5 min', 'https://example.com/soir',    'Routine du coucher etape par etape',    '4-8',  1, 'fr', 'tous'),
('Chansons tunisiennes',        'audio',    'Langage',       '#10b981', '4 min', 'https://example.com/tn-songs','Chansons educatives en dialecte',       '3-8',  1, 'tn', 'enfant'),
('Vocabulaire arabe quotidien', 'video',    'Langage',       '#3b82f6', '5 min', 'https://example.com/ar-vocab','Mots courants en arabe standard',       '5-10', 1, 'ar', 'tous')
ON DUPLICATE KEY UPDATE id = id;

-- Mise a jour des emojis apres insertion (utilise les codes unicode)
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x97,0xA3) WHERE title = 'Apprendre a dire bonjour' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x98,0x8A) WHERE title = 'Reconnaitre les emotions' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0xA7,0xA9) WHERE title = 'Jouer ensemble' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8D,0x8E) WHERE title = 'Preparer mon petit-dejeuner' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8C,0xB1) WHERE title = 'Sequence du matin' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8E,0xA8) WHERE title = 'Creer avec les couleurs' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8E,0xB5) WHERE title = 'Ecouter et repeter' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x94,0xA2) WHERE title = 'Les chiffres en arabe' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x91,0x8B) WHERE title = 'Marhba - Dire bonjour' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x98,0xA4) WHERE title = 'Gestion du stress' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8F,0xA0) WHERE title = 'Autonomie au quotidien' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0xA7,0xA0) WHERE title = 'Memoire - Jeu des paires' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8C,0x99) WHERE title = 'Ma routine du soir' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x8E,0xB6) WHERE title = 'Chansons tunisiennes' AND emoji IS NULL;
UPDATE content SET emoji = CHAR(0xF0,0x9F,0x93,0x9A) WHERE title = 'Vocabulaire arabe quotidien' AND emoji IS NULL;

-- ============================================================================
-- DONNEES : Logs d activites
-- ============================================================================

INSERT INTO activity_logs (child_id, content_id, status, action, score, duration_seconds, date)
SELECT c.id, ct.id, v.st, v.ac, v.sc, v.dur, DATE_SUB(NOW(), INTERVAL v.days DAY)
FROM (
  SELECT 'Test Child 1' AS cn,'parent@aidaa.com' AS pe,'Apprendre a dire bonjour' AS tt,'completed' AS st,'content_accessed' AS ac,20 AS sc,180 AS dur,28 AS days UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Reconnaitre les emotions',   'completed','content_accessed',30,300,25 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Jouer ensemble',             'completed','content_accessed',25,240,22 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Sequence du matin',          'completed','activity_done',   35,420,20 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Ecouter et repeter',         'completed','content_accessed',15,120,18 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Apprendre a dire bonjour',   'completed','content_accessed',20,180,15 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Creer avec les couleurs',    'completed','activity_done',   40,600,12 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Reconnaitre les emotions',   'completed','content_accessed',30,300,10 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Preparer mon petit-dejeuner','started',  'content_accessed',10,90, 8  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Jouer ensemble',             'completed','content_accessed',25,240,6  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Ecouter et repeter',         'completed','content_accessed',15,120,5  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Sequence du matin',          'completed','activity_done',   35,420,3  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Creer avec les couleurs',    'completed','activity_done',   40,600,2  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Les chiffres en arabe',      'completed','content_accessed',20,240,1  UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Apprendre a dire bonjour',   'completed','content_accessed',20,180,0  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',20,180,20 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Reconnaitre les emotions','completed','content_accessed',30,300,18 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Jouer ensemble',          'completed','content_accessed',25,240,15 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Ecouter et repeter',      'completed','content_accessed',15,120,12 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Sequence du matin',       'completed','activity_done',   35,420,9  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Creer avec les couleurs', 'completed','activity_done',   40,600,6  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Marhba - Dire bonjour',   'completed','content_accessed',10,180,4  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',20,180,2  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Reconnaitre les emotions','started',  'content_accessed',10,60, 1  UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Jouer ensemble',          'completed','content_accessed',25,240,0  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Jouer ensemble',             'completed','content_accessed',25,240,14 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Sequence du matin',          'completed','activity_done',   35,420,11 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Les chiffres en arabe',      'completed','content_accessed',20,240,8  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Ecouter et repeter',         'completed','content_accessed',15,120,6  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Creer avec les couleurs',    'completed','activity_done',   40,600,4  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Preparer mon petit-dejeuner','completed','content_accessed',25,360,2  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Reconnaitre les emotions',   'completed','content_accessed',30,300,1  UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Apprendre a dire bonjour',   'completed','content_accessed',20,180,0  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Gestion du stress',       'completed','content_accessed',45,420,10 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Autonomie au quotidien',  'completed','activity_done',   50,720,7  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Reconnaitre les emotions','completed','content_accessed',30,300,5  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Jouer ensemble',          'completed','content_accessed',25,240,3  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Gestion du stress',       'completed','content_accessed',45,420,2  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Autonomie au quotidien',  'started',  'activity_done',   20,180,1  UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Ecouter et repeter',      'completed','content_accessed',15,120,0  UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',50,180,29 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Reconnaitre les emotions','completed','content_accessed',55,300,26 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Jouer ensemble',          'completed','content_accessed',60,240,23 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Ecouter et repeter',      'completed','content_accessed',58,120,20 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Sequence du matin',       'completed','activity_done',   65,420,17 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Creer avec les couleurs', 'completed','activity_done',   70,600,14 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Marhba - Dire bonjour',   'completed','content_accessed',52,180,11 UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Jouer ensemble',          'completed','content_accessed',63,240,8  UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',68,180,5  UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Reconnaitre les emotions','completed','content_accessed',72,300,3  UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Sequence du matin',       'completed','activity_done',   75,420,1  UNION ALL
  SELECT 'Rayan','mohamed@aidaa.com','Ecouter et repeter',      'completed','content_accessed',78,120,0  UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',48,180,25 UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Jouer ensemble',          'completed','content_accessed',55,240,20 UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Ecouter et repeter',      'completed','content_accessed',60,120,15 UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Sequence du matin',       'completed','activity_done',   65,420,10 UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Creer avec les couleurs', 'completed','activity_done',   70,600,5  UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Reconnaitre les emotions','completed','content_accessed',75,300,2  UNION ALL
  SELECT 'Yassine','karim@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',80,180,0  UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',52,180,22 UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Reconnaitre les emotions', 'completed','content_accessed',58,300,18 UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Jouer ensemble',           'completed','content_accessed',62,240,14 UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Sequence du matin',        'completed','activity_done',   66,420,10 UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Ecouter et repeter',       'completed','content_accessed',70,120,7  UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Creer avec les couleurs',  'completed','activity_done',   74,600,4  UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Marhba - Dire bonjour',    'completed','content_accessed',55,180,2  UNION ALL
  SELECT 'Lina','fatma@aidaa.com','Reconnaitre les emotions', 'completed','content_accessed',78,300,0
) v
JOIN children c ON c.name = v.cn
JOIN users u ON u.id = c.parent_id AND u.email = v.pe
JOIN content ct ON ct.title = v.tt;

-- ============================================================================
-- DONNEES : Messages
-- ============================================================================

INSERT INTO messages (child_id, sender_id, receiver_id, content, created_at)
SELECT ch.id, s.id, r.id, v.msg, DATE_SUB(NOW(), INTERVAL v.h HOUR)
FROM (
  SELECT 'parent@aidaa.com' AS se,'professional@aidaa.com' AS re,'Test Child 1' AS ch,'Bonjour Docteur, Test Child 1 a bien progresse cette semaine !' AS msg,48 AS h UNION ALL
  SELECT 'professional@aidaa.com','parent@aidaa.com','Test Child 1','Tres bien ! Continuons sur la communication.',47 UNION ALL
  SELECT 'parent@aidaa.com','professional@aidaa.com','Test Child 1','Il arrive maintenant a dire bonjour en regardant les gens !',46 UNION ALL
  SELECT 'professional@aidaa.com','parent@aidaa.com','Test Child 1','Je recommande les exercices ecoute 2 fois par semaine.',24 UNION ALL
  SELECT 'parent@aidaa.com','professional@aidaa.com','Test Child 1','Merci beaucoup, nous allons le faire !',23 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Bonjour Dr. Sbai, Emma a eu une journee difficile.',36 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','sarah.johnson@aidaa.com','Emma Johnson','Pouvez-vous me decrire ce qui s est passe ?',35 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Un changement de planning imprevu. Elle deteste les surprises.',34 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','sarah.johnson@aidaa.com','Emma Johnson','Utilisez un planning visuel chaque matin.',12 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Merci ! Nous allons essayer.',11 UNION ALL
  SELECT 'mohamed.trabelsi@aidaa.com','fatima.mansour@aidaa.com','Youssef Trabelsi','Salam Dr. Mansour, Youssef a termine toutes ses activites !',20 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','mohamed.trabelsi@aidaa.com','Youssef Trabelsi','Mabrouk ! Son score a augmente de 15 points.',19 UNION ALL
  SELECT 'mohamed.trabelsi@aidaa.com','fatima.mansour@aidaa.com','Youssef Trabelsi','Quelles activites pour le mois prochain ?',5 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','mohamed.trabelsi@aidaa.com','Youssef Trabelsi','Je recommande les activites niveau 2 surtout Autonomie.',4 UNION ALL
  SELECT 'karim@aidaa.com','abderrahman@aidaa.com','Yassine','Bonjour Dr. Abderrahman, Yassine a bien travaille !',72 UNION ALL
  SELECT 'abderrahman@aidaa.com','karim@aidaa.com','Yassine','Tres bien ! Il fait de beaux progres. Continuez !',70 UNION ALL
  SELECT 'fatma@aidaa.com','abderrahman@aidaa.com','Lina','Salam Dr. Abderrahman, Lina est tres motivee !',48 UNION ALL
  SELECT 'abderrahman@aidaa.com','fatma@aidaa.com','Lina','Excellent ! Motivation = progres garantis.',46 UNION ALL
  SELECT 'mohamed@aidaa.com','abderrahman@aidaa.com','Rayan','Bonjour, Rayan a fait 12 activites cette semaine !',36 UNION ALL
  SELECT 'abderrahman@aidaa.com','mohamed@aidaa.com','Rayan','Magnifique progression de Rayan ! Score moyen 65 pts.',34
) v
JOIN users s ON s.email = v.se
JOIN users r ON r.email = v.re
JOIN children ch ON ch.name = v.ch;

-- ============================================================================
-- DONNEES : Notes professionnelles
-- ============================================================================

INSERT INTO notes (professional_id, child_id, content, date)
SELECT pr.id, ch.id, v.content, DATE_SUB(NOW(), INTERVAL v.d DAY)
FROM (
  SELECT 'professional@aidaa.com' AS pe,'Test Child 1' AS cn,'Seance du jour : bonne concentration. Contact visuel 3 secondes. Progres notable.' AS content,14 AS d UNION ALL
  SELECT 'professional@aidaa.com','Test Child 1','Score moyen 28/50. Augmenter frequence exercices ecoute.',7 UNION ALL
  SELECT 'professional@aidaa.com','Test Child 1','Bilan mensuel positif. Maitrise des salutations. Prochaine etape : emotions.',1 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Emma Johnson','Emma identifie joie et tristesse a 80%. Continuer cartes emotions.',10 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Emma Johnson','Incident gestion emotionnelle. Recommandation planning visuel.',5 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','Youssef Trabelsi','Youssef realise routine matin independamment 4j/7. Objectif 7/7.',8 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','Youssef Trabelsi','Bilan positif. Score 185 pts. Pret pour activites niveau 2.',2 UNION ALL
  SELECT 'karim.hamdi@aidaa.com','Nour Ben Ali','Nour applique respiration profonde. Bonne progression gestion stress.',6 UNION ALL
  SELECT 'karim.hamdi@aidaa.com','Nour Ben Ali','Score gestion emotions 75/100. Continuer exercices autonomie.',1 UNION ALL
  SELECT 'abderrahman@aidaa.com','Rayan','Rayan tres motive. 12 activites en 1 semaine. Score moyen 65pts.',7 UNION ALL
  SELECT 'abderrahman@aidaa.com','Rayan','Bilan positif. Communication et autonomie en progres rapide.',3 UNION ALL
  SELECT 'abderrahman@aidaa.com','Yassine','Yassine progresse bien en communication. Continuer exercices quotidiens.',5 UNION ALL
  SELECT 'abderrahman@aidaa.com','Lina','Lina tres enthousiaste. Motivation elevee. Introduire niveau 2 bientot.',4
) v
JOIN users pr ON pr.email = v.pe
JOIN children ch ON ch.name = v.cn;

-- ============================================================================
-- DONNEES : Jeux
-- ============================================================================

INSERT INTO games (title, description, type, instructions) VALUES
('Color Match',        'Cliquer la couleur qui correspond au mot affiche', 'color_match',       'Lisez le nom de la couleur et cliquez sur le bon bouton.'),
('Memory Game',        'Retrouver les paires de cartes identiques',        'memory',            'Cliquez sur les cartes pour les retourner et trouver les paires.'),
('Sound Recognition',  'Ecouter un son et selectionner la bonne image',    'sound_recognition', 'Ecoutez le son joue et cliquez sur l image correspondante.'),
('Sequences Visuelles','Reproduire une sequence de symboles',              'sequence',          'Regardez la sequence puis reproduisez-la dans le bon ordre.'),
('Vocabulaire Images', 'Associer un mot a une image',                      'vocabulary',        'Cliquez sur l image qui correspond au mot affiche.')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNEES : Sequences guidees
-- ============================================================================

INSERT INTO guided_sequences (title, description, participant_category, duration_minutes, difficulty) VALUES
('Routine du matin',         'Apprendre la routine du matin etape par etape', 'enfant', 10, 'facile'),
('Lavage des mains',         'Comment bien se laver les mains',               'tous',    5, 'facile'),
('Preparation repas simple', 'Preparer un sandwich ou une collation',          'jeune',  20, 'moyen'),
('Prise des transports',     'Utiliser les transports en commun',              'adulte', 30, 'moyen'),
('Gestion des emotions',     'Reconnaitre et exprimer ses emotions',           'tous',   15, 'facile')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO sequence_steps (sequence_id, step_number, title, description, duration_seconds)
SELECT s.id, v.n, v.t, v.d, v.dur FROM guided_sequences s
JOIN (
  SELECT 1 AS n,'Se reveiller'       AS t,'Ouvrir les yeux et s etirer'   AS d,30  AS dur UNION ALL
  SELECT 2,'Se lever',                    'Mettre les pieds par terre',      30  UNION ALL
  SELECT 3,'Se laver le visage',          'Aller a la salle de bain',        120 UNION ALL
  SELECT 4,'S habiller',                  'Choisir et mettre ses vetements', 180 UNION ALL
  SELECT 5,'Petit dejeuner',              'Manger et boire',                 600
) v ON 1=1
WHERE s.title = 'Routine du matin'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

INSERT INTO sequence_steps (sequence_id, step_number, title, description, duration_seconds)
SELECT s.id, v.n, v.t, v.d, v.dur FROM guided_sequences s
JOIN (
  SELECT 1 AS n,'Ouvrir le robinet' AS t,'Tourner le robinet'           AS d,10 AS dur UNION ALL
  SELECT 2,'Mouiller',                  'Mettre les mains sous l eau',    10 UNION ALL
  SELECT 3,'Savonner',                  'Prendre du savon et frotter',    20 UNION ALL
  SELECT 4,'Rincer',                    'Enlever tout le savon',          15 UNION ALL
  SELECT 5,'Secher',                    'Utiliser une serviette propre',  10
) v ON 1=1
WHERE s.title = 'Lavage des mains'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

INSERT INTO sequence_steps (sequence_id, step_number, title, description, duration_seconds)
SELECT s.id, v.n, v.t, v.d, v.dur FROM guided_sequences s
JOIN (
  SELECT 1 AS n,'Reconnaitre la situation' AS t,'Identifier l emotion ressentie'    AS d,30  AS dur UNION ALL
  SELECT 2,'Respirer profondement',             'Inspirer 4s retenir 4s expirer 4s', 60  UNION ALL
  SELECT 3,'Nommer l emotion',                  'Dire ou ecrire ce que l on ressent', 30  UNION ALL
  SELECT 4,'Choisir une strategie',             'Calme dessin marche...',             60  UNION ALL
  SELECT 5,'Se calmer',                         'Appliquer la strategie choisie',     120
) v ON 1=1
WHERE s.title = 'Gestion des emotions'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

-- ============================================================================
-- DONNEES : Symboles AAC
-- ============================================================================

INSERT INTO aac_symbols (label, emoji, category, participant_category, color, sort_order) VALUES
('Manger',    'manger',    'Besoins',       'tous',   '#ef4444', 1),
('Boire',     'boire',     'Besoins',       'tous',   '#3b82f6', 2),
('Toilettes', 'toilettes', 'Besoins',       'tous',   '#8b5cf6', 3),
('Dormir',    'dormir',    'Besoins',       'tous',   '#6366f1', 4),
('Aide',      'aide',      'Communication', 'tous',   '#f59e0b', 5),
('Oui',       'oui',       'Communication', 'tous',   '#22c55e', 6),
('Non',       'non',       'Communication', 'tous',   '#ef4444', 7),
('Content',   'content',   'Emotions',      'tous',   '#eab308', 8),
('Triste',    'triste',    'Emotions',      'tous',   '#3b82f6', 9),
('En colere', 'colere',    'Emotions',      'tous',   '#ef4444', 10),
('Peur',      'peur',      'Emotions',      'tous',   '#8b5cf6', 11),
('Jouer',     'jouer',     'Activites',     'enfant', '#f97316', 12),
('Ecole',     'ecole',     'Activites',     'enfant', '#0ea5e9', 13),
('Maison',    'maison',    'Lieux',         'tous',   '#84cc16', 14),
('Bus',       'bus',       'Transports',    'jeune',  '#f59e0b', 15),
('Medecin',   'medecin',   'Lieux',         'tous',   '#06b6d4', 16),
('Musique',   'musique',   'Activites',     'tous',   '#a855f7', 17),
('Repos',     'repos',     'Besoins',       'adulte', '#6b7280', 18),
('Travail',   'travail',   'Activites',     'adulte', '#78716c', 19),
('Voiture',   'voiture',   'Transports',    'tous',   '#64748b', 20)
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNEES : Badges
-- ============================================================================

INSERT INTO badges (name, description, emoji, condition_type, condition_value, color) VALUES
('Premier pas',    'Completez votre 1ere activite', '*',  'activities', 1,   '#f59e0b'),
('En route !',     'Completez 5 activites',          '**', 'activities', 5,   '#3b82f6'),
('Regulier',       'Completez 10 activites',         '**', 'activities', 10,  '#22c55e'),
('Champion',       'Completez 25 activites',         '**', 'activities', 25,  '#ef4444'),
('Super champion', 'Completez 50 activites',         '**', 'activities', 50,  '#a855f7'),
('100 points',     'Atteignez 100 points au total',  '**', 'points',     100, '#f97316'),
('500 points',     'Atteignez 500 points au total',  '**', 'points',     500, '#eab308'),
('Premier jeu',    'Jouez a votre 1er jeu',          '**', 'games',      1,   '#06b6d4'),
('Joueur assidu',  'Jouez a 5 jeux',                 '**', 'games',      5,   '#8b5cf6'),
('Grand joueur',   'Jouez a 10 jeux',                '**', 'games',      10,  '#ec4899')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- FIN DU FICHIER
-- Verifier : SELECT email, role FROM users ORDER BY role;
-- ============================================================================

