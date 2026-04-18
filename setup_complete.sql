-- ============================================================================
-- AIDAA — setup_complete.sql
-- ============================================================================
-- FICHIER UNIQUE : schéma complet + toutes les migrations + toutes les données
-- Importer directement dans phpMyAdmin (ou : mysql -u root < setup_complete.sql)
-- ============================================================================
-- Comptes créés :
--   admin@aidaa.com          / admin123
--   parent@aidaa.com         / parent123
--   professional@aidaa.com   / professional123
-- ============================================================================

CREATE DATABASE IF NOT EXISTS aidaa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aidaa_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TABLE : users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  DEFAULT NULL,
  role       ENUM('admin','parent','professional') NOT NULL DEFAULT 'parent',
  specialite VARCHAR(100)  NULL DEFAULT NULL,
  is_active  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : children
-- ============================================================================
CREATE TABLE IF NOT EXISTS children (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  parent_id            INT NOT NULL,
  name                 VARCHAR(100) NOT NULL,
  age                  INT,
  participant_category ENUM('enfant','jeune','adulte') NOT NULL DEFAULT 'enfant',
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

-- ============================================================================
-- TABLE : content
-- ============================================================================
CREATE TABLE IF NOT EXISTS content (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(200) NOT NULL,
  type                 ENUM('video','audio','activity') NOT NULL DEFAULT 'video',
  category             VARCHAR(100),
  category_color       VARCHAR(20)  DEFAULT '#f97316',
  age_group            VARCHAR(50),
  level                INT          DEFAULT 1,
  url                  TEXT,
  description          TEXT,
  emoji                VARCHAR(10)  DEFAULT NULL,
  duration             VARCHAR(20)  DEFAULT NULL,
  steps                INT          DEFAULT NULL,
  minutes              INT          DEFAULT NULL,
  emoji_color          VARCHAR(20)  DEFAULT NULL,
  language             VARCHAR(10)  NOT NULL DEFAULT 'fr',  -- fr | ar | tn
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration : ajout colonne language si la table existe déjà
ALTER TABLE content
  MODIFY COLUMN type ENUM('video','audio','activity') NOT NULL DEFAULT 'video';
ALTER TABLE content
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'fr' AFTER emoji_color;

-- ============================================================================
-- TABLE : activity_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  child_id         INT NOT NULL,
  content_id       INT DEFAULT NULL,
  status           ENUM('started','completed') DEFAULT 'started',
  action           VARCHAR(50)  DEFAULT 'content_accessed',
  score            INT          DEFAULT 0,
  duration_seconds INT          DEFAULT 0,
  date             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id)   REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_activity_logs_child_id   ON activity_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_content_id ON activity_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_score      ON activity_logs(score);
CREATE INDEX IF NOT EXISTS idx_activity_logs_duration   ON activity_logs(duration_seconds);

-- ============================================================================
-- TABLE : notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  professional_id INT NOT NULL,
  child_id        INT NOT NULL,
  content         TEXT NOT NULL,
  date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES users(id),
  FOREIGN KEY (child_id)        REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_notes_professional_id ON notes(professional_id);
CREATE INDEX IF NOT EXISTS idx_notes_child_id        ON notes(child_id);

-- ============================================================================
-- TABLE : teleconsultations
-- ============================================================================
CREATE TABLE IF NOT EXISTS teleconsultations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  parent_id       INT NOT NULL,
  professional_id INT NOT NULL,
  date_time       DATETIME NOT NULL,
  meeting_link    VARCHAR(500),
  notes           TEXT,
  FOREIGN KEY (parent_id)       REFERENCES users(id),
  FOREIGN KEY (professional_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_teleconsultations_parent_id       ON teleconsultations(parent_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_professional_id ON teleconsultations(professional_id);

-- ============================================================================
-- TABLE : messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  child_id    INT NOT NULL,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id)    REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_messages_child_id    (child_id),
  INDEX idx_messages_sender_id   (sender_id),
  INDEX idx_messages_receiver_id (receiver_id),
  INDEX idx_messages_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : games
-- ============================================================================
CREATE TABLE IF NOT EXISTS games (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  description   TEXT,
  type          VARCHAR(50),
  thumbnail_url VARCHAR(255),
  instructions  TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_games_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : guided_sequences
-- ============================================================================
CREATE TABLE IF NOT EXISTS guided_sequences (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(200) NOT NULL,
  description          TEXT,
  emoji                VARCHAR(20)  DEFAULT '📋',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  duration_minutes     INT          DEFAULT 15,
  difficulty           ENUM('facile','moyen','difficile') DEFAULT 'facile',
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : sequence_steps
-- ============================================================================
CREATE TABLE IF NOT EXISTS sequence_steps (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  sequence_id      INT NOT NULL,
  step_number      INT NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  emoji            VARCHAR(20)  DEFAULT '▶️',
  duration_seconds INT          DEFAULT 60,
  FOREIGN KEY (sequence_id) REFERENCES guided_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : aac_symbols
-- ============================================================================
CREATE TABLE IF NOT EXISTS aac_symbols (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  label                VARCHAR(100) NOT NULL,
  emoji                VARCHAR(20)  NOT NULL,
  category             VARCHAR(50)  NOT NULL DEFAULT 'Général',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  color                VARCHAR(20)  DEFAULT '#3b82f6',
  sort_order           INT          DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  emoji           VARCHAR(20)  NOT NULL DEFAULT '🏅',
  condition_type  ENUM('activities','points','games') NOT NULL,
  condition_value INT          NOT NULL DEFAULT 1,
  color           VARCHAR(20)  DEFAULT '#f59e0b',
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : child_badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS child_badges (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  child_id  INT NOT NULL,
  badge_id  INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id)   ON DELETE CASCADE,
  UNIQUE KEY unique_badge (child_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE : professional_invitations
-- ============================================================================
CREATE TABLE IF NOT EXISTS professional_invitations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  parent_id       INT NOT NULL,
  professional_id INT NOT NULL,
  status          ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
  invited_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id)       REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (parent_id, professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_prof_inv_parent ON professional_invitations(parent_id);
CREATE INDEX IF NOT EXISTS idx_prof_inv_prof   ON professional_invitations(professional_id);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- DONNÉES : Utilisateurs (mots de passe hashés avec bcryptjs 12 rounds)
-- ============================================================================
-- Mots de passe :
--   admin123        → $2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u
--   parent123       → $2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym
--   professional123 → $2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou
-- ============================================================================

-- ── ADMIN ────────────────────────────────────────────────────────────────────
INSERT INTO users (name, email, password, role, specialite, is_active) VALUES
('Admin AIDAA', 'admin@aidaa.com',
 '$2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u',
 'admin', NULL, 1)
ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = 1;

-- ── PARENTS (mot de passe : parent123) ───────────────────────────────────────
INSERT INTO users (name, email, password, role, specialite, is_active) VALUES
('Parent Test',      'parent@aidaa.com',
 '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1),
('Sarah Johnson',    'sarah.johnson@aidaa.com',
 '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1),
('Mohamed Trabelsi', 'mohamed.trabelsi@aidaa.com',
 '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1),
('Leila Ben Ali',    'leila.benali@aidaa.com',
 '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1)
ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = 1;

-- ── PROFESSIONNELS (mot de passe : professional123) ──────────────────────────
INSERT INTO users (name, email, password, role, specialite, is_active) VALUES
('Dr. Professional Test', 'professional@aidaa.com',
 '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthophonie',      1),
('Dr. Abderrahman Sbai',  'abderrahman.sbai@aidaa.com',
 '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Psychologie',      1),
('Dr. Fatima Mansour',    'fatima.mansour@aidaa.com',
 '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthopédagogie',   1),
('Dr. Karim Hamdi',       'karim.hamdi@aidaa.com',
 '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Neuropsychologie', 1),
('Dr. Amina Chaabane',    'amina.chaabane@aidaa.com',
 '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Ergothérapie',     1)
ON DUPLICATE KEY UPDATE password = VALUES(password), specialite = VALUES(specialite), is_active = 1;

-- ============================================================================
-- DONNÉES : Participants / Enfants (liés aux parents)
-- ============================================================================

-- Parent Test → Test Child 1 (enfant, 5 ans)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Test Child 1', 5, 'enfant' FROM users u
WHERE u.email = 'parent@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Test Child 1')
LIMIT 1;

-- Sarah Johnson → Emma (enfant, 6 ans) + Lucas (enfant, 9 ans)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Emma Johnson', 6, 'enfant' FROM users u
WHERE u.email = 'sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Emma Johnson')
LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Lucas Johnson', 9, 'enfant' FROM users u
WHERE u.email = 'sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Lucas Johnson')
LIMIT 1;

-- Mohamed Trabelsi → Youssef (enfant, 7 ans)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Youssef Trabelsi', 7, 'enfant' FROM users u
WHERE u.email = 'mohamed.trabelsi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Youssef Trabelsi')
LIMIT 1;

-- Leila Ben Ali → Nour (jeune, 14 ans)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, 'Nour Ben Ali', 14, 'jeune' FROM users u
WHERE u.email = 'leila.benali@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = 'Nour Ben Ali')
LIMIT 1;

-- ============================================================================
-- DONNÉES : Invitations professionnelles (parents ↔ professionnels)
-- ============================================================================

-- Parent Test ↔ Dr. Professional Test
INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p, users pr
WHERE p.email = 'parent@aidaa.com' AND pr.email = 'professional@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- Sarah Johnson ↔ Dr. Abderrahman Sbai
INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p, users pr
WHERE p.email = 'sarah.johnson@aidaa.com' AND pr.email = 'abderrahman.sbai@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- Mohamed Trabelsi ↔ Dr. Fatima Mansour
INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p, users pr
WHERE p.email = 'mohamed.trabelsi@aidaa.com' AND pr.email = 'fatima.mansour@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- Leila Ben Ali ↔ Dr. Karim Hamdi
INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active' FROM users p, users pr
WHERE p.email = 'leila.benali@aidaa.com' AND pr.email = 'karim.hamdi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- ============================================================================
-- DONNÉES : Contenu (vidéos + audio + activités)
-- ============================================================================

-- ============================================================================
-- DONNÉES : Contenu (vidéos + audio + activités)
-- ============================================================================
INSERT INTO content (title, type, category, category_color, emoji, duration, url, description, age_group, level, language, participant_category) VALUES
('Apprendre à dire bonjour',   'video',    'Communication', '#f97316', '🗣️', '3 min', 'https://example.com/video1.mp4', 'Apprenez à dire bonjour poliment et avec des gestes amicaux',               '4-6', 1, 'fr', 'tous'),
('Reconnaître les émotions',   'video',    'Émotions',      '#f97316', '😊', '5 min', 'https://example.com/video2.mp4', 'Identifiez les différentes émotions : joie, tristesse, colère, peur',       '4-6', 1, 'fr', 'tous'),
('Jouer ensemble',             'video',    'Social',        '#f97316', '🧩', '4 min', 'https://example.com/video3.mp4', 'Les bénéfices du jeu social et comment jouer avec les autres',               '4-6', 1, 'fr', 'tous'),
('Préparer mon petit-déjeuner','video',    'Autonomie',     '#f97316', '🍎', '6 min', 'https://example.com/video4.mp4', 'Étapes pour préparer un petit-déjeuner sain',                               '4-6', 1, 'fr', 'tous'),
('Séquence du matin',          'activity', 'Autonomie',     '#f97316', '🌱', NULL,    'https://example.com/activity1',  'Routine matinale structurée avec étapes visuelles',                         '4-6', 1, 'fr', 'tous'),
('Créer avec les couleurs',    'activity', 'Créativité',    '#f97316', '🎨', NULL,    'https://example.com/activity2',  'Activité créative et sensorielle avec différentes couleurs',                 '4-6', 1, 'fr', 'tous'),
('Écouter et répéter',         'audio',    'Langage',       '#f97316', '🎵', '2 min', 'https://example.com/audio1.mp3', 'Jeu d\'écoute et prononciation pour développer le langage',                  '4-6', 1, 'fr', 'tous'),
('Les chiffres en arabe',      'video',    'Langage',       '#3b82f6', '🔢', '4 min', 'https://example.com/video5.mp4', 'Apprendre les chiffres de 1 à 10 en arabe',                                 '4-6', 1, 'ar', 'tous'),
('Marhba — Dire bonjour',      'audio',    'Communication', '#10b981', '👋', '3 min', 'https://example.com/audio2.mp3', 'Apprendre à saluer en dialecte tunisien',                                   '4-6', 1, 'tn', 'tous'),
('Gestion du stress',          'video',    'Émotions',      '#8b5cf6', '😤', '7 min', 'https://example.com/video6.mp4', 'Techniques de relaxation et gestion des émotions difficiles',               '7-12', 2, 'fr', 'jeune'),
('Autonomie au quotidien',     'activity', 'Autonomie',     '#f97316', '🏠', NULL,    'https://example.com/activity3',  'Activités pour développer l\'autonomie au quotidien',                       '7-12', 2, 'fr', 'jeune')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNÉES : Logs d'activités (pour que les analytics soient remplis)
-- ============================================================================
INSERT INTO activity_logs (child_id, content_id, status, action, score, duration_seconds, date)
SELECT
  c.id AS child_id,
  ct.id AS content_id,
  v.status, v.action, v.score, v.duration_seconds,
  DATE_SUB(NOW(), INTERVAL v.days_ago DAY) AS date
FROM children c
JOIN users u ON c.parent_id = u.id
JOIN content ct ON ct.title = v.content_title
JOIN (
  -- Test Child 1 (parent@aidaa.com) — 15 logs sur 30 jours
  SELECT 'Test Child 1' AS child_name, 'parent@aidaa.com' AS parent_email, 'Apprendre à dire bonjour'    AS content_title, 'completed' AS status, 'content_accessed' AS action, 20 AS score, 180  AS duration_seconds, 28 AS days_ago UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Reconnaître les émotions',    'completed', 'content_accessed', 30, 300,  25 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Jouer ensemble',              'completed', 'content_accessed', 25, 240,  22 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Séquence du matin',           'completed', 'activity_done',    35, 420,  20 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Écouter et répéter',          'completed', 'content_accessed', 15, 120,  18 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Apprendre à dire bonjour',    'completed', 'content_accessed', 20, 180,  15 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Créer avec les couleurs',     'completed', 'activity_done',    40, 600,  12 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Reconnaître les émotions',    'completed', 'content_accessed', 30, 300,  10 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Préparer mon petit-déjeuner', 'started',   'content_accessed', 10, 90,    8 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Jouer ensemble',              'completed', 'content_accessed', 25, 240,   6 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Écouter et répéter',          'completed', 'content_accessed', 15, 120,   5 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Séquence du matin',           'completed', 'activity_done',    35, 420,   3 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Créer avec les couleurs',     'completed', 'activity_done',    40, 600,   2 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Les chiffres en arabe',       'completed', 'content_accessed', 20, 240,   1 UNION ALL
  SELECT 'Test Child 1', 'parent@aidaa.com', 'Apprendre à dire bonjour',    'completed', 'content_accessed', 20, 180,   0 UNION ALL
  -- Emma Johnson (sarah.johnson@aidaa.com) — 10 logs
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Apprendre à dire bonjour', 'completed', 'content_accessed', 20, 180, 20 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Reconnaître les émotions', 'completed', 'content_accessed', 30, 300, 18 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Jouer ensemble',           'completed', 'content_accessed', 25, 240, 15 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Écouter et répéter',       'completed', 'content_accessed', 15, 120, 12 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Séquence du matin',        'completed', 'activity_done',    35, 420,  9 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Créer avec les couleurs',  'completed', 'activity_done',    40, 600,  6 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Marhba — Dire bonjour',    'completed', 'content_accessed', 10, 180,  4 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Apprendre à dire bonjour', 'completed', 'content_accessed', 20, 180,  2 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Reconnaître les émotions', 'started',   'content_accessed', 10, 60,   1 UNION ALL
  SELECT 'Emma Johnson', 'sarah.johnson@aidaa.com', 'Jouer ensemble',           'completed', 'content_accessed', 25, 240,  0 UNION ALL
  -- Youssef Trabelsi (mohamed.trabelsi@aidaa.com) — 8 logs
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Jouer ensemble',              'completed', 'content_accessed', 25, 240, 14 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Séquence du matin',           'completed', 'activity_done',    35, 420, 11 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Les chiffres en arabe',       'completed', 'content_accessed', 20, 240,  8 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Écouter et répéter',          'completed', 'content_accessed', 15, 120,  6 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Créer avec les couleurs',     'completed', 'activity_done',    40, 600,  4 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Préparer mon petit-déjeuner', 'completed', 'content_accessed', 25, 360,  2 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Reconnaître les émotions',    'completed', 'content_accessed', 30, 300,  1 UNION ALL
  SELECT 'Youssef Trabelsi', 'mohamed.trabelsi@aidaa.com', 'Apprendre à dire bonjour',    'completed', 'content_accessed', 20, 180,  0 UNION ALL
  -- Nour Ben Ali (leila.benali@aidaa.com) — 7 logs
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Gestion du stress',      'completed', 'content_accessed', 45, 420, 10 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Autonomie au quotidien', 'completed', 'activity_done',    50, 720,  7 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Reconnaître les émotions','completed','content_accessed', 30, 300,  5 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Jouer ensemble',         'completed', 'content_accessed', 25, 240,  3 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Gestion du stress',      'completed', 'content_accessed', 45, 420,  2 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Autonomie au quotidien', 'started',   'activity_done',    20, 180,  1 UNION ALL
  SELECT 'Nour Ben Ali', 'leila.benali@aidaa.com', 'Écouter et répéter',     'completed', 'content_accessed', 15, 120,  0
) v ON c.name = v.child_name AND u.email = v.parent_email;

-- ============================================================================
-- DONNÉES : Messages (conversations entre parents et professionnels)
-- ============================================================================
INSERT INTO messages (child_id, sender_id, receiver_id, content, created_at)
SELECT
  ch.id AS child_id,
  s.id  AS sender_id,
  r.id  AS receiver_id,
  v.content,
  DATE_SUB(NOW(), INTERVAL v.hours_ago HOUR) AS created_at
FROM users s
JOIN users r     ON r.email = v.receiver_email
JOIN children ch ON ch.name = v.child_name
JOIN users pu    ON pu.id = ch.parent_id
JOIN (
  -- Conversation : Parent Test ↔ Dr. Professional Test (sujet: Test Child 1)
  SELECT 'parent@aidaa.com'       AS sender_email, 'professional@aidaa.com' AS receiver_email, 'Test Child 1' AS child_name,
         'Bonjour Dr. Professional, je voulais vous informer que Test Child 1 a bien progressé cette semaine !' AS content, 48 AS hours_ago UNION ALL
  SELECT 'professional@aidaa.com', 'parent@aidaa.com', 'Test Child 1',
         'Bonjour ! Très bien, j\'ai vu ses dernières activités. Il faut continuer à travailler sur la communication.', 47 UNION ALL
  SELECT 'parent@aidaa.com', 'professional@aidaa.com', 'Test Child 1',
         'Oui, nous pratiquons tous les jours. Il arrive maintenant à dire bonjour en regardant les gens !', 46 UNION ALL
  SELECT 'professional@aidaa.com', 'parent@aidaa.com', 'Test Child 1',
         'Excellent progrès ! Je recommande aussi les exercices d\'écoute et répétition au moins 2 fois par semaine.', 24 UNION ALL
  SELECT 'parent@aidaa.com', 'professional@aidaa.com', 'Test Child 1',
         'D\'accord, nous allons intégrer ça dans sa routine. Merci beaucoup !', 23 UNION ALL
  SELECT 'professional@aidaa.com', 'parent@aidaa.com', 'Test Child 1',
         'De rien ! N\'hésitez pas si vous avez des questions. À bientôt.', 22 UNION ALL
  -- Conversation : Sarah Johnson ↔ Dr. Abderrahman Sbai (sujet: Emma Johnson)
  SELECT 'sarah.johnson@aidaa.com', 'abderrahman.sbai@aidaa.com', 'Emma Johnson',
         'Bonjour Dr. Sbai, Emma a eu une journée difficile à l\'école aujourd\'hui. Elle s\'est mise en colère.', 36 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com', 'sarah.johnson@aidaa.com', 'Emma Johnson',
         'Bonjour Mme Johnson. Pouvez-vous me décrire ce qui s\'est passé exactement ?', 35 UNION ALL
  SELECT 'sarah.johnson@aidaa.com', 'abderrahman.sbai@aidaa.com', 'Emma Johnson',
         'Elle a eu du mal avec un changement de planning imprévu. Elle n\'aime pas les surprises.', 34 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com', 'sarah.johnson@aidaa.com', 'Emma Johnson',
         'C\'est tout à fait normal pour les enfants TSA. Je vous conseille d\'utiliser un planning visuel chaque matin.', 12 UNION ALL
  SELECT 'sarah.johnson@aidaa.com', 'abderrahman.sbai@aidaa.com', 'Emma Johnson',
         'Merci pour le conseil ! Nous allons essayer dès demain.', 11 UNION ALL
  -- Conversation : Mohamed Trabelsi ↔ Dr. Fatima Mansour (sujet: Youssef Trabelsi)
  SELECT 'mohamed.trabelsi@aidaa.com', 'fatima.mansour@aidaa.com', 'Youssef Trabelsi',
         'Salam Dr. Mansour, Youssef a terminé toutes ses activités cette semaine, Hamdellah !', 20 UNION ALL
  SELECT 'fatima.mansour@aidaa.com', 'mohamed.trabelsi@aidaa.com', 'Youssef Trabelsi',
         'Mabrouk ! C\'est un excellent résultat. Son score moyen a augmenté de 15 points ce mois-ci.', 19 UNION ALL
  SELECT 'mohamed.trabelsi@aidaa.com', 'fatima.mansour@aidaa.com', 'Youssef Trabelsi',
         'On est très contents. Quelles activités recommandez-vous pour le mois prochain ?', 5 UNION ALL
  SELECT 'fatima.mansour@aidaa.com', 'mohamed.trabelsi@aidaa.com', 'Youssef Trabelsi',
         'Je recommande de commencer les activités de niveau 2, surtout "Autonomie au quotidien". Il est prêt !', 4
) v ON s.email = v.sender_email;

-- ============================================================================
-- DONNÉES : Notes professionnelles (observations cliniques)
-- ============================================================================
INSERT INTO notes (professional_id, child_id, content, date)
SELECT pr.id, ch.id, v.content, DATE_SUB(NOW(), INTERVAL v.days_ago DAY)
FROM users pr
JOIN children ch ON ch.name = v.child_name
JOIN users pu    ON pu.id = ch.parent_id
JOIN (
  -- Dr. Professional Test → Test Child 1
  SELECT 'professional@aidaa.com' AS pro_email, 'Test Child 1' AS child_name,
         'Séance du jour : très bonne concentration pendant l\'activité de communication. L\'enfant a maintenu le contact visuel pendant 3 secondes. Progrès notable par rapport à la semaine dernière.', 14 AS days_ago UNION ALL
  SELECT 'professional@aidaa.com', 'Test Child 1',
         'Revue des activités réalisées cette semaine. Score moyen de 28/50. Recommandation : augmenter la fréquence des exercices d\'écoute et répétition.', 7 UNION ALL
  SELECT 'professional@aidaa.com', 'Test Child 1',
         'Bilan mensuel positif. L\'enfant maîtrise maintenant les salutations de base. Prochaine étape : expressions d\'émotions simples.', 1 UNION ALL
  -- Dr. Abderrahman Sbai → Emma Johnson
  SELECT 'abderrahman.sbai@aidaa.com', 'Emma Johnson',
         'Emma montre des progrès significatifs dans la reconnaissance des émotions. Elle identifie correctement joie et tristesse à 80%. Continuer les exercices avec les cartes émotions.', 10 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com', 'Emma Johnson',
         'Incident de gestion émotionnelle signalé par la mère. Recommandation d\'un planning visuel quotidien pour prévenir les crises liées aux imprévus.', 5 UNION ALL
  -- Dr. Fatima Mansour → Youssef Trabelsi
  SELECT 'fatima.mansour@aidaa.com', 'Youssef Trabelsi',
         'Youssef progresse bien en autonomie. Il réalise sa routine du matin de façon indépendante 4 jours sur 7. Objectif : atteindre 7/7 le mois prochain.', 8 UNION ALL
  SELECT 'fatima.mansour@aidaa.com', 'Youssef Trabelsi',
         'Bilan positif ce mois-ci. Score total : 185 points. Prêt pour les activités de niveau 2. Famille très impliquée, ce qui favorise les progrès.', 2 UNION ALL
  -- Dr. Karim Hamdi → Nour Ben Ali
  SELECT 'karim.hamdi@aidaa.com', 'Nour Ben Ali',
         'Nour travaille bien sur les techniques de gestion du stress. Elle applique la respiration profonde lors des situations difficiles. Très bonne progression.', 6 UNION ALL
  SELECT 'karim.hamdi@aidaa.com', 'Nour Ben Ali',
         'Séance d\'évaluation : Nour gère mieux ses transitions entre activités. Score de gestion des émotions : 75/100. Continuer les exercices d\'autonomie.', 1
) v ON pr.email = v.pro_email;

-- ============================================================================
-- DONNÉES : Jeux
-- ============================================================================
INSERT INTO games (title, description, type, instructions) VALUES
('Color Match',       'Cliquer la couleur qui correspond au mot affiché',  'color_match',       'Lisez le nom de la couleur et cliquez sur le bon bouton.'),
('Memory Game',       'Retrouver les paires de cartes identiques',          'memory',            'Cliquez sur les cartes pour les retourner et trouver les paires.'),
('Sound Recognition', 'Écouter un son et sélectionner la bonne image',      'sound_recognition', 'Écoutez le son joué et cliquez sur l\'image correspondante.')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNÉES : Séquences guidées
-- ============================================================================
INSERT INTO guided_sequences (title, description, emoji, participant_category, duration_minutes, difficulty) VALUES
('Routine du matin',          'Apprendre la routine du matin étape par étape', '🌅', 'enfant', 10, 'facile'),
('Lavage des mains',          'Comment bien se laver les mains',               '🧼', 'tous',    5, 'facile'),
('Préparation repas simple',  'Préparer un sandwich ou une collation',          '🥪', 'jeune',  20, 'moyen'),
('Prise des transports',      'Utiliser les transports en commun',              '🚌', 'adulte', 30, 'moyen'),
('Gestion des émotions',      'Reconnaître et exprimer ses émotions',           '😊', 'tous',   15, 'facile')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNÉES : Étapes des séquences
-- ============================================================================

-- Routine du matin
INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.step_number, v.title, v.description, v.emoji, v.duration_seconds
FROM guided_sequences s
JOIN (
  SELECT 1 AS step_number, 'Se réveiller'      AS title, 'Ouvrir les yeux et s\'étirer'     AS description, '☀️' AS emoji, 30  AS duration_seconds UNION ALL
  SELECT 2, 'Se lever',          'Mettre les pieds par terre',              '🛏️', 30  UNION ALL
  SELECT 3, 'Se laver le visage','Aller à la salle de bain',               '🚿', 120 UNION ALL
  SELECT 4, 'S\'habiller',       'Choisir et mettre ses vêtements',         '👕', 180 UNION ALL
  SELECT 5, 'Petit déjeuner',    'Manger et boire',                         '🥛', 600
) v ON 1=1
WHERE s.title = 'Routine du matin'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

-- Lavage des mains
INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.step_number, v.title, v.description, v.emoji, v.duration_seconds
FROM guided_sequences s
JOIN (
  SELECT 1 AS step_number, 'Ouvrir le robinet' AS title, 'Tourner le robinet'              AS description, '🚰' AS emoji, 10 AS duration_seconds UNION ALL
  SELECT 2, 'Mouiller',          'Mettre les mains sous l\'eau',            '💧', 10 UNION ALL
  SELECT 3, 'Savonner',          'Prendre du savon et frotter',             '🧴', 20 UNION ALL
  SELECT 4, 'Rincer',            'Enlever tout le savon',                   '💧', 15 UNION ALL
  SELECT 5, 'Sécher',            'Utiliser une serviette propre',           '🧻', 10
) v ON 1=1
WHERE s.title = 'Lavage des mains'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

-- Gestion des émotions
INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.step_number, v.title, v.description, v.emoji, v.duration_seconds
FROM guided_sequences s
JOIN (
  SELECT 1 AS step_number, 'Identifier'         AS title, 'Comment est-ce que je me sens ?' AS description, '🤔' AS emoji, 30 AS duration_seconds UNION ALL
  SELECT 2, 'Respirer',          'Prendre 3 grandes inspirations',          '💨', 30 UNION ALL
  SELECT 3, 'Exprimer',          'Dire ce que l\'on ressent',               '💬', 60 UNION ALL
  SELECT 4, 'Chercher solution', 'Que puis-je faire ?',                     '💡', 60 UNION ALL
  SELECT 5, 'Demander aide',     'Parler à quelqu\'un de confiance',        '🤝', 30
) v ON 1=1
WHERE s.title = 'Gestion des émotions'
  AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

-- ============================================================================
-- DONNÉES : Symboles AAC
-- ============================================================================
INSERT INTO aac_symbols (label, emoji, category, participant_category, color, sort_order)
SELECT * FROM (
  -- Besoins
  SELECT 'J\'ai faim'         AS label,'🍽️' AS emoji,'Besoins'  AS category,'tous'   AS participant_category,'#ef4444' AS color, 1 AS sort_order UNION ALL
  SELECT 'J\'ai soif',              '💧','Besoins',  'tous',   '#3b82f6', 2 UNION ALL
  SELECT 'Je veux dormir',          '😴','Besoins',  'tous',   '#8b5cf6', 3 UNION ALL
  SELECT 'J\'ai mal',               '🤕','Besoins',  'tous',   '#f97316', 4 UNION ALL
  SELECT 'Toilettes',               '🚻','Besoins',  'tous',   '#6b7280', 5 UNION ALL
  SELECT 'J\'ai froid',             '🥶','Besoins',  'tous',   '#60a5fa', 6 UNION ALL
  SELECT 'J\'ai chaud',             '🥵','Besoins',  'tous',   '#f87171', 7 UNION ALL
  SELECT 'Je veux jouer',           '🎮','Besoins',  'tous',   '#10b981', 8 UNION ALL
  SELECT 'Je veux de l\'aide',      '🙋','Besoins',  'tous',   '#f59e0b', 9 UNION ALL
  -- Émotions
  SELECT 'Je suis heureux',         '😊','Émotions', 'tous',   '#f59e0b', 1 UNION ALL
  SELECT 'Je suis triste',          '😢','Émotions', 'tous',   '#60a5fa', 2 UNION ALL
  SELECT 'Je suis en colère',       '😠','Émotions', 'tous',   '#ef4444', 3 UNION ALL
  SELECT 'J\'ai peur',              '😨','Émotions', 'tous',   '#8b5cf6', 4 UNION ALL
  SELECT 'Je suis fatigué',         '😴','Émotions', 'tous',   '#94a3b8', 5 UNION ALL
  SELECT 'Je suis calme',           '😌','Émotions', 'tous',   '#34d399', 6 UNION ALL
  SELECT 'J\'aime ça',              '❤️','Émotions', 'tous',   '#f43f5e', 7 UNION ALL
  SELECT 'Je ne veux pas',          '🙅','Émotions', 'tous',   '#f97316', 8 UNION ALL
  -- Actions
  SELECT 'Arrêter',                 '✋','Actions',  'tous',   '#ef4444', 1 UNION ALL
  SELECT 'Venir',                   '👋','Actions',  'tous',   '#3b82f6', 2 UNION ALL
  SELECT 'Aider',                   '🤝','Actions',  'tous',   '#10b981', 3 UNION ALL
  SELECT 'Montrer',                 '👉','Actions',  'tous',   '#f59e0b', 4 UNION ALL
  SELECT 'Donner',                  '🎁','Actions',  'tous',   '#8b5cf6', 5 UNION ALL
  SELECT 'Attendre',                '⏳','Actions',  'tous',   '#6b7280', 6 UNION ALL
  SELECT 'Recommencer',             '🔄','Actions',  'tous',   '#06b6d4', 7 UNION ALL
  -- Aliments
  SELECT 'Eau',                     '💧','Aliments', 'tous',   '#3b82f6', 1 UNION ALL
  SELECT 'Pain',                    '🍞','Aliments', 'tous',   '#f59e0b', 2 UNION ALL
  SELECT 'Fruit',                   '🍎','Aliments', 'tous',   '#ef4444', 3 UNION ALL
  SELECT 'Légumes',                 '🥦','Aliments', 'tous',   '#10b981', 4 UNION ALL
  SELECT 'Lait',                    '🥛','Aliments', 'enfant', '#e2e8f0', 5 UNION ALL
  SELECT 'Gâteau',                  '🎂','Aliments', 'enfant', '#ec4899', 6
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM aac_symbols LIMIT 1);

-- ============================================================================
-- DONNÉES : Badges
-- ============================================================================
INSERT INTO badges (name, description, emoji, condition_type, condition_value, color)
SELECT * FROM (
  SELECT 'Premier pas'    AS name,'Première activité réalisée !' AS description,'🌟' AS emoji,'activities' AS condition_type, 1   AS condition_value,'#f59e0b' AS color UNION ALL
  SELECT 'Explorateur',        '5 activités complétées',         '🧭','activities',  5,  '#3b82f6' UNION ALL
  SELECT 'Étoile montante',    '10 activités complétées',        '⭐','activities', 10,  '#8b5cf6' UNION ALL
  SELECT 'Champion',           '50 points gagnés',               '🏆','points',     50,  '#ef4444' UNION ALL
  SELECT 'Super joueur',       '100 points gagnés',              '💎','points',    100,  '#06b6d4' UNION ALL
  SELECT 'Grand champion',     '250 points gagnés',              '👑','points',    250,  '#f97316'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================
SELECT '✅ SETUP TERMINÉ' AS statut;
SELECT CONCAT('👤 Utilisateurs      : ', COUNT(*)) AS info FROM users;
SELECT CONCAT('👨‍👩‍👧 Parents           : ', COUNT(*)) AS info FROM users WHERE role = 'parent';
SELECT CONCAT('🩺 Professionnels    : ', COUNT(*)) AS info FROM users WHERE role = 'professional';
SELECT CONCAT('👶 Participants      : ', COUNT(*)) AS info FROM children;
SELECT CONCAT('🤝 Invitations       : ', COUNT(*)) AS info FROM professional_invitations;
SELECT CONCAT('🎬 Contenus         : ', COUNT(*)) AS info FROM content;
SELECT CONCAT('🎮 Jeux             : ', COUNT(*)) AS info FROM games;
SELECT CONCAT('🗣️  AAC              : ', COUNT(*)) AS info FROM aac_symbols;
SELECT CONCAT('📋 Séquences        : ', COUNT(*)) AS info FROM guided_sequences;
SELECT CONCAT('🏅 Badges           : ', COUNT(*)) AS info FROM badges;

-- ============================================================================
-- RÉCAPITULATIF COMPTES
-- ============================================================================
-- ┌──────────────────┬──────────────────────────────────────┬──────────────────┐
-- │ Rôle             │ Email                                │ Mot de passe     │
-- ├──────────────────┼──────────────────────────────────────┼──────────────────┤
-- │ Admin            │ admin@aidaa.com                      │ admin123         │
-- ├──────────────────┼──────────────────────────────────────┼──────────────────┤
-- │ Parent           │ parent@aidaa.com                     │ parent123        │
-- │ Parent           │ sarah.johnson@aidaa.com              │ parent123        │
-- │ Parent           │ mohamed.trabelsi@aidaa.com           │ parent123        │
-- │ Parent           │ leila.benali@aidaa.com               │ parent123        │
-- ├──────────────────┼──────────────────────────────────────┼──────────────────┤
-- │ Professionnel    │ professional@aidaa.com               │ professional123  │
-- │ Professionnel    │ abderrahman.sbai@aidaa.com           │ professional123  │
-- │ Professionnel    │ fatima.mansour@aidaa.com             │ professional123  │
-- │ Professionnel    │ karim.hamdi@aidaa.com                │ professional123  │
-- │ Professionnel    │ amina.chaabane@aidaa.com             │ professional123  │
-- └──────────────────┴──────────────────────────────────────┴──────────────────┘
-- Frontend : http://localhost:5173
-- Backend  : http://localhost:5000/health
-- ============================================================================

