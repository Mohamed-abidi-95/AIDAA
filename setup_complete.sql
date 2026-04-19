-- ============================================================================
-- AIDAA — setup_complete.sql
-- ============================================================================
-- FICHIER UNIQUE : schema complet + migrations + toutes les donnees de demo
-- Importer dans phpMyAdmin ou : mysql -u root < setup_complete.sql
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
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(100)  NOT NULL,
  email                VARCHAR(150)  NOT NULL UNIQUE,
  password             VARCHAR(255)  DEFAULT NULL,
  role                 ENUM('admin','parent','professional') NOT NULL DEFAULT 'parent',
  specialite           VARCHAR(100)  NULL DEFAULT NULL,
  is_active            TINYINT(1)    NOT NULL DEFAULT 1,
  status               VARCHAR(20)   NOT NULL DEFAULT 'approved',
  reset_token          VARCHAR(255)  DEFAULT NULL,
  reset_token_expires  DATETIME      DEFAULT NULL,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration : ajout colonnes manquantes si la table existe deja
ALTER TABLE users ADD COLUMN IF NOT EXISTS status              VARCHAR(20)  NOT NULL DEFAULT 'approved' AFTER is_active;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token         VARCHAR(255) DEFAULT NULL AFTER status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME     DEFAULT NULL AFTER reset_token;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialite          VARCHAR(100) NULL DEFAULT NULL AFTER role;

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
  language             VARCHAR(10)  NOT NULL DEFAULT 'fr',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE content MODIFY COLUMN type ENUM('video','audio','activity') NOT NULL DEFAULT 'video';
ALTER TABLE content ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'fr' AFTER emoji_color;

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
  FOREIGN KEY (content_id) REFERENCES content(id)  ON DELETE SET NULL
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
  emoji            VARCHAR(20)  DEFAULT '▶',
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
  category             VARCHAR(50)  NOT NULL DEFAULT 'General',
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
-- DONNEES : Utilisateurs
-- admin123        = $2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u
-- parent123       = $2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym
-- professional123 = $2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou
-- ============================================================================

INSERT INTO users (name, email, password, role, specialite, is_active, status) VALUES
('Admin AIDAA', 'admin@aidaa.com', '$2a$12$oOIeHCX1szjy2IP/rbJjseJFOQXuVVSHCmlcZS1AJJXYP3wxVtH4u', 'admin', NULL, 1, 'approved')
ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = 1, status = 'approved';

INSERT INTO users (name, email, password, role, specialite, is_active, status) VALUES
('Parent Test',      'parent@aidaa.com',           '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Sarah Johnson',    'sarah.johnson@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Mohamed Trabelsi', 'mohamed.trabelsi@aidaa.com', '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Leila Ben Ali',    'leila.benali@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved')
ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = 1, status = 'approved';

INSERT INTO users (name, email, password, role, specialite, is_active, status) VALUES
('Dr. Professional Test', 'professional@aidaa.com',      '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthophonie',      1, 'approved'),
('Dr. Abderrahman Sbai',  'abderrahman.sbai@aidaa.com',  '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Psychologie',      1, 'approved'),
('Dr. Fatima Mansour',    'fatima.mansour@aidaa.com',    '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Orthopedagogie',   1, 'approved'),
('Dr. Karim Hamdi',       'karim.hamdi@aidaa.com',       '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Neuropsychologie', 1, 'approved'),
('Dr. Amina Chaabane',    'amina.chaabane@aidaa.com',    '$2a$12$bdVfrJZynYQriFyUC8wcMe/iMIBzgNml4dfcfCeQbCR8/8gQPyeou', 'professional', 'Ergotherapie',     1, 'approved')
ON DUPLICATE KEY UPDATE password = VALUES(password), specialite = VALUES(specialite), is_active = 1, status = 'approved';

-- ============================================================================
-- DONNEES : Enfants
-- ============================================================================

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id,'Test Child 1',5,'enfant' FROM users u WHERE u.email='parent@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id=u.id AND c.name='Test Child 1') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id,'Emma Johnson',6,'enfant' FROM users u WHERE u.email='sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id=u.id AND c.name='Emma Johnson') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id,'Lucas Johnson',9,'enfant' FROM users u WHERE u.email='sarah.johnson@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id=u.id AND c.name='Lucas Johnson') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id,'Youssef Trabelsi',7,'enfant' FROM users u WHERE u.email='mohamed.trabelsi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id=u.id AND c.name='Youssef Trabelsi') LIMIT 1;

INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id,'Nour Ben Ali',14,'jeune' FROM users u WHERE u.email='leila.benali@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id=u.id AND c.name='Nour Ben Ali') LIMIT 1;

-- ============================================================================
-- DONNEES : Invitations professionnelles
-- ============================================================================

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id,pr.id,'active' FROM users p, users pr WHERE p.email='parent@aidaa.com' AND pr.email='professional@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id=p.id AND pi.professional_id=pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id,pr.id,'active' FROM users p, users pr WHERE p.email='sarah.johnson@aidaa.com' AND pr.email='abderrahman.sbai@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id=p.id AND pi.professional_id=pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id,pr.id,'active' FROM users p, users pr WHERE p.email='mohamed.trabelsi@aidaa.com' AND pr.email='fatima.mansour@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id=p.id AND pi.professional_id=pr.id);

INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id,pr.id,'active' FROM users p, users pr WHERE p.email='leila.benali@aidaa.com' AND pr.email='karim.hamdi@aidaa.com'
  AND NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id=p.id AND pi.professional_id=pr.id);

-- ============================================================================
-- DONNEES : Contenu (sans accents pour eviter erreurs d encodage)
-- ============================================================================
INSERT INTO content (title, type, category, category_color, emoji, duration, url, description, age_group, level, language, participant_category) VALUES
('Apprendre a dire bonjour',   'video',    'Communication', '#f97316', '🗣', '3 min', 'https://example.com/video1.mp4',  'Apprenez a dire bonjour poliment',             '4-6',  1, 'fr', 'tous'),
('Reconnaitre les emotions',   'video',    'Emotions',      '#f97316', '😊', '5 min', 'https://example.com/video2.mp4',  'Identifiez joie, tristesse, colere, peur',    '4-6',  1, 'fr', 'tous'),
('Jouer ensemble',             'video',    'Social',        '#f97316', '🧩', '4 min', 'https://example.com/video3.mp4',  'Les benefices du jeu social',                  '4-6',  1, 'fr', 'tous'),
('Preparer mon petit-dejeuner','video',    'Autonomie',     '#f97316', '🍎', '6 min', 'https://example.com/video4.mp4',  'Etapes pour preparer un petit-dejeuner sain', '4-6',  1, 'fr', 'tous'),
('Sequence du matin',          'activity', 'Autonomie',     '#f97316', '🌱', NULL,    'https://example.com/activity1',   'Routine matinale avec etapes visuelles',       '4-6',  1, 'fr', 'tous'),
('Creer avec les couleurs',    'activity', 'Creativite',    '#f97316', '🎨', NULL,    'https://example.com/activity2',   'Activite creative et sensorielle',             '4-6',  1, 'fr', 'tous'),
('Ecouter et repeter',         'audio',    'Langage',       '#f97316', '🎵', '2 min', 'https://example.com/audio1.mp3',  'Jeu ecoute et prononciation',                  '4-6',  1, 'fr', 'tous'),
('Les chiffres en arabe',      'video',    'Langage',       '#3b82f6', '🔢', '4 min', 'https://example.com/video5.mp4',  'Apprendre les chiffres de 1 a 10 en arabe',   '4-6',  1, 'ar', 'tous'),
('Marhba - Dire bonjour',      'audio',    'Communication', '#10b981', '👋', '3 min', 'https://example.com/audio2.mp3',  'Apprendre a saluer en dialecte tunisien',      '4-6',  1, 'tn', 'tous'),
('Gestion du stress',          'video',    'Emotions',      '#8b5cf6', '😤', '7 min', 'https://example.com/video6.mp4',  'Techniques relaxation et gestion emotions',    '7-12', 2, 'fr', 'jeune'),
('Autonomie au quotidien',     'activity', 'Autonomie',     '#f97316', '🏠', NULL,    'https://example.com/activity3',   'Activites pour developper l autonomie',        '7-12', 2, 'fr', 'jeune')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNEES : Jeux
-- ============================================================================
INSERT INTO games (title, description, type, instructions) VALUES
('Color Match',       'Cliquer la couleur qui correspond au mot',  'color_match',       'Lisez le nom de la couleur et cliquez sur le bon bouton.'),
('Memory Game',       'Retrouver les paires de cartes identiques', 'memory',            'Cliquez sur les cartes pour trouver les paires.'),
('Sound Recognition', 'Ecouter un son et selectionner une image',  'sound_recognition', 'Ecoutez le son et cliquez sur l image correspondante.')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNEES : Sequences guidees
-- ============================================================================
INSERT INTO guided_sequences (title, description, emoji, participant_category, duration_minutes, difficulty) VALUES
('Routine du matin',         'Apprendre la routine du matin etape par etape', '🌅', 'enfant', 10, 'facile'),
('Lavage des mains',         'Comment bien se laver les mains',               '🧼', 'tous',    5, 'facile'),
('Preparation repas simple', 'Preparer un sandwich ou une collation',         '🥪', 'jeune',  20, 'moyen'),
('Prise des transports',     'Utiliser les transports en commun',             '🚌', 'adulte', 30, 'moyen'),
('Gestion des emotions',     'Reconnaitre et exprimer ses emotions',          '😊', 'tous',   15, 'facile')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- DONNEES : Etapes sequences
-- ============================================================================
INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.sn, v.t, v.d, v.e, v.ds FROM guided_sequences s
JOIN (
  SELECT 1 sn,'Se reveiller' t,'Ouvrir les yeux' d,'☀' e,30 ds UNION ALL
  SELECT 2,'Se lever','Mettre les pieds par terre','🛏',30 UNION ALL
  SELECT 3,'Se laver le visage','Aller a la salle de bain','🚿',120 UNION ALL
  SELECT 4,'S habiller','Choisir et mettre ses vetements','👕',180 UNION ALL
  SELECT 5,'Petit dejeuner','Manger et boire','🥛',600
) v ON 1=1
WHERE s.title='Routine du matin' AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id=s.id);

INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.sn, v.t, v.d, v.e, v.ds FROM guided_sequences s
JOIN (
  SELECT 1 sn,'Ouvrir le robinet' t,'Tourner le robinet' d,'🚰' e,10 ds UNION ALL
  SELECT 2,'Mouiller','Mettre les mains sous l eau','💧',10 UNION ALL
  SELECT 3,'Savonner','Prendre du savon et frotter','🧴',20 UNION ALL
  SELECT 4,'Rincer','Enlever tout le savon','💧',15 UNION ALL
  SELECT 5,'Secher','Utiliser une serviette propre','🧻',10
) v ON 1=1
WHERE s.title='Lavage des mains' AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id=s.id);

INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.sn, v.t, v.d, v.e, v.ds FROM guided_sequences s
JOIN (
  SELECT 1 sn,'Identifier' t,'Comment est-ce que je me sens ?' d,'🤔' e,30 ds UNION ALL
  SELECT 2,'Respirer','Prendre 3 grandes inspirations','💨',30 UNION ALL
  SELECT 3,'Exprimer','Dire ce que l on ressent','💬',60 UNION ALL
  SELECT 4,'Chercher solution','Que puis-je faire ?','💡',60 UNION ALL
  SELECT 5,'Demander aide','Parler a quelqu un de confiance','🤝',30
) v ON 1=1
WHERE s.title='Gestion des emotions' AND NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id=s.id);

-- ============================================================================
-- DONNEES : Logs d activites (analytics)
-- SYNTAXE CORRECTE : sous-table v en premier dans FROM, puis JOIN sur les vraies tables
-- ============================================================================
INSERT INTO activity_logs (child_id, content_id, status, action, score, duration_seconds, date)
SELECT c.id, ct.id, v.st, v.ac, v.sc, v.ds, DATE_SUB(NOW(), INTERVAL v.da DAY)
FROM (
  SELECT 'Test Child 1' cn,'parent@aidaa.com' pe,'Apprendre a dire bonjour' ct,'completed' st,'content_accessed' ac,20 sc,180 ds,28 da UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Reconnaitre les emotions',    'completed','content_accessed',30,300,25 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Jouer ensemble',               'completed','content_accessed',25,240,22 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Sequence du matin',            'completed','activity_done',   35,420,20 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Ecouter et repeter',           'completed','content_accessed',15,120,18 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Apprendre a dire bonjour',     'completed','content_accessed',20,180,15 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Creer avec les couleurs',      'completed','activity_done',   40,600,12 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Reconnaitre les emotions',     'completed','content_accessed',30,300,10 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Preparer mon petit-dejeuner',  'started',  'content_accessed',10,90, 8 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Jouer ensemble',               'completed','content_accessed',25,240, 6 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Ecouter et repeter',           'completed','content_accessed',15,120, 5 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Sequence du matin',            'completed','activity_done',   35,420, 3 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Creer avec les couleurs',      'completed','activity_done',   40,600, 2 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Les chiffres en arabe',        'completed','content_accessed',20,240, 1 UNION ALL
  SELECT 'Test Child 1','parent@aidaa.com','Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Apprendre a dire bonjour','completed','content_accessed',20,180,20 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Reconnaitre les emotions', 'completed','content_accessed',30,300,18 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Jouer ensemble',            'completed','content_accessed',25,240,15 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Ecouter et repeter',        'completed','content_accessed',15,120,12 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Sequence du matin',         'completed','activity_done',   35,420, 9 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Creer avec les couleurs',   'completed','activity_done',   40,600, 6 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Marhba - Dire bonjour',     'completed','content_accessed',10,180, 4 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Apprendre a dire bonjour',  'completed','content_accessed',20,180, 2 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Reconnaitre les emotions',  'started',  'content_accessed',10,60,  1 UNION ALL
  SELECT 'Emma Johnson','sarah.johnson@aidaa.com','Jouer ensemble',            'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Jouer ensemble',              'completed','content_accessed',25,240,14 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Sequence du matin',           'completed','activity_done',   35,420,11 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Les chiffres en arabe',       'completed','content_accessed',20,240, 8 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Ecouter et repeter',          'completed','content_accessed',15,120, 6 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Creer avec les couleurs',     'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Preparer mon petit-dejeuner', 'completed','content_accessed',25,360, 2 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Reconnaitre les emotions',    'completed','content_accessed',30,300, 1 UNION ALL
  SELECT 'Youssef Trabelsi','mohamed.trabelsi@aidaa.com','Apprendre a dire bonjour',    'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Gestion du stress',       'completed','content_accessed',45,420,10 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Autonomie au quotidien',  'completed','activity_done',   50,720, 7 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Reconnaitre les emotions','completed','content_accessed',30,300, 5 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Jouer ensemble',          'completed','content_accessed',25,240, 3 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Gestion du stress',       'completed','content_accessed',45,420, 2 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Autonomie au quotidien',  'started',  'activity_done',   20,180, 1 UNION ALL
  SELECT 'Nour Ben Ali','leila.benali@aidaa.com','Ecouter et repeter',      'completed','content_accessed',15,120, 0
) v
JOIN children c  ON c.name    = v.cn
JOIN users    u  ON u.id      = c.parent_id AND u.email = v.pe
JOIN content  ct ON ct.title  = v.ct;

-- ============================================================================
-- DONNEES : Messages
-- SYNTAXE CORRECTE : sous-table v en premier dans FROM
-- ============================================================================
INSERT INTO messages (child_id, sender_id, receiver_id, content, created_at)
SELECT ch.id, s.id, r.id, v.msg, DATE_SUB(NOW(), INTERVAL v.ha HOUR)
FROM (
  SELECT 'parent@aidaa.com' se,'professional@aidaa.com' re,'Test Child 1' cn,'Bonjour Dr. Professional, Test Child 1 a bien progresse cette semaine !' msg,48 ha UNION ALL
  SELECT 'professional@aidaa.com','parent@aidaa.com','Test Child 1','Bonjour ! Il faut continuer a travailler sur la communication.',47 UNION ALL
  SELECT 'parent@aidaa.com','professional@aidaa.com','Test Child 1','Il arrive maintenant a dire bonjour en regardant les gens !',46 UNION ALL
  SELECT 'professional@aidaa.com','parent@aidaa.com','Test Child 1','Excellent ! Je recommande les exercices d ecoute 2 fois par semaine.',24 UNION ALL
  SELECT 'parent@aidaa.com','professional@aidaa.com','Test Child 1','D accord, nous allons integrer ca dans sa routine. Merci !',23 UNION ALL
  SELECT 'professional@aidaa.com','parent@aidaa.com','Test Child 1','De rien ! N hesitez pas si vous avez des questions.',22 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Bonjour Dr. Sbai, Emma a eu une journee difficile. Elle s est mise en colere.',36 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','sarah.johnson@aidaa.com','Emma Johnson','Bonjour. Pouvez-vous me decrire ce qui s est passe ?',35 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Elle a eu du mal avec un changement de planning imprevu.',34 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','sarah.johnson@aidaa.com','Emma Johnson','Normal pour TSA. Je conseille un planning visuel chaque matin.',12 UNION ALL
  SELECT 'sarah.johnson@aidaa.com','abderrahman.sbai@aidaa.com','Emma Johnson','Merci ! Nous allons essayer des demain.',11 UNION ALL
  SELECT 'mohamed.trabelsi@aidaa.com','fatima.mansour@aidaa.com','Youssef Trabelsi','Salam Dr. Mansour, Youssef a termine toutes ses activites cette semaine !',20 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','mohamed.trabelsi@aidaa.com','Youssef Trabelsi','Mabrouk ! Son score moyen a augmente de 15 points ce mois-ci.',19 UNION ALL
  SELECT 'mohamed.trabelsi@aidaa.com','fatima.mansour@aidaa.com','Youssef Trabelsi','Quelles activites recommandez-vous pour le mois prochain ?',5 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','mohamed.trabelsi@aidaa.com','Youssef Trabelsi','Je recommande les activites de niveau 2, surtout Autonomie au quotidien. Il est pret !',4
) v
JOIN users    s  ON s.email = v.se
JOIN users    r  ON r.email = v.re
JOIN children ch ON ch.name = v.cn;

-- ============================================================================
-- DONNEES : Notes professionnelles
-- SYNTAXE CORRECTE : sous-table v en premier dans FROM
-- ============================================================================
INSERT INTO notes (professional_id, child_id, content, date)
SELECT pr.id, ch.id, v.msg, DATE_SUB(NOW(), INTERVAL v.da DAY)
FROM (
  SELECT 'professional@aidaa.com' pe,'Test Child 1' cn,'Seance : bonne concentration. Contact visuel 3 secondes. Progres notable.' msg,14 da UNION ALL
  SELECT 'professional@aidaa.com','Test Child 1','Score moyen 28/50. Recommandation : augmenter la frequence des exercices ecoute.',7 UNION ALL
  SELECT 'professional@aidaa.com','Test Child 1','Bilan mensuel positif. Maitrise des salutations. Prochaine etape : expressions emotions.',1 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Emma Johnson','Emma identifie joie et tristesse a 80%. Continuer les exercices cartes emotions.',10 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Emma Johnson','Incident emotionnel signale. Recommandation : planning visuel quotidien.',5 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','Youssef Trabelsi','Youssef realise sa routine du matin de facon independante 4 jours sur 7. Objectif 7/7.',8 UNION ALL
  SELECT 'fatima.mansour@aidaa.com','Youssef Trabelsi','Bilan positif. Score total : 185 points. Pret pour activites niveau 2.',2 UNION ALL
  SELECT 'karim.hamdi@aidaa.com','Nour Ben Ali','Nour applique la respiration profonde. Tres bonne progression sur gestion du stress.',6 UNION ALL
  SELECT 'karim.hamdi@aidaa.com','Nour Ben Ali','Score gestion emotions : 75/100. Continuer les exercices d autonomie.',1
) v
JOIN users    pr ON pr.email = v.pe
JOIN children ch ON ch.name  = v.cn;

-- ============================================================================
-- DONNEES : Symboles AAC
-- ============================================================================
INSERT INTO aac_symbols (label, emoji, category, participant_category, color, sort_order)
SELECT * FROM (
  SELECT 'J ai faim'        lbl,'🍽' ej,'Besoins'  cat,'tous'   pc,'#ef4444' col,1 so UNION ALL
  SELECT 'J ai soif',           '💧','Besoins',  'tous',  '#3b82f6',2 UNION ALL
  SELECT 'Je veux dormir',      '😴','Besoins',  'tous',  '#8b5cf6',3 UNION ALL
  SELECT 'J ai mal',            '🤕','Besoins',  'tous',  '#f97316',4 UNION ALL
  SELECT 'Toilettes',           '🚻','Besoins',  'tous',  '#6b7280',5 UNION ALL
  SELECT 'J ai froid',          '🥶','Besoins',  'tous',  '#60a5fa',6 UNION ALL
  SELECT 'J ai chaud',          '🥵','Besoins',  'tous',  '#f87171',7 UNION ALL
  SELECT 'Je veux jouer',       '🎮','Besoins',  'tous',  '#10b981',8 UNION ALL
  SELECT 'Je veux de l aide',   '🙋','Besoins',  'tous',  '#f59e0b',9 UNION ALL
  SELECT 'Je suis heureux',     '😊','Emotions', 'tous',  '#f59e0b',1 UNION ALL
  SELECT 'Je suis triste',      '😢','Emotions', 'tous',  '#60a5fa',2 UNION ALL
  SELECT 'Je suis en colere',   '😠','Emotions', 'tous',  '#ef4444',3 UNION ALL
  SELECT 'J ai peur',           '😨','Emotions', 'tous',  '#8b5cf6',4 UNION ALL
  SELECT 'Je suis fatigue',     '😴','Emotions', 'tous',  '#94a3b8',5 UNION ALL
  SELECT 'Je suis calme',       '😌','Emotions', 'tous',  '#34d399',6 UNION ALL
  SELECT 'J aime ca',           '❤','Emotions', 'tous',  '#f43f5e',7 UNION ALL
  SELECT 'Je ne veux pas',      '🙅','Emotions', 'tous',  '#f97316',8 UNION ALL
  SELECT 'Arreter',             '✋','Actions',  'tous',  '#ef4444',1 UNION ALL
  SELECT 'Venir',               '👋','Actions',  'tous',  '#3b82f6',2 UNION ALL
  SELECT 'Aider',               '🤝','Actions',  'tous',  '#10b981',3 UNION ALL
  SELECT 'Montrer',             '👉','Actions',  'tous',  '#f59e0b',4 UNION ALL
  SELECT 'Donner',              '🎁','Actions',  'tous',  '#8b5cf6',5 UNION ALL
  SELECT 'Attendre',            '⏳','Actions',  'tous',  '#6b7280',6 UNION ALL
  SELECT 'Recommencer',         '🔄','Actions',  'tous',  '#06b6d4',7 UNION ALL
  SELECT 'Eau',                 '💧','Aliments', 'tous',  '#3b82f6',1 UNION ALL
  SELECT 'Pain',                '🍞','Aliments', 'tous',  '#f59e0b',2 UNION ALL
  SELECT 'Fruit',               '🍎','Aliments', 'tous',  '#ef4444',3 UNION ALL
  SELECT 'Legumes',             '🥦','Aliments', 'tous',  '#10b981',4 UNION ALL
  SELECT 'Lait',                '🥛','Aliments', 'enfant','#e2e8f0',5 UNION ALL
  SELECT 'Gateau',              '🎂','Aliments', 'enfant','#ec4899',6
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM aac_symbols LIMIT 1);

-- ============================================================================
-- DONNEES : Badges
-- ============================================================================
INSERT INTO badges (name, description, emoji, condition_type, condition_value, color)
SELECT * FROM (
  SELECT 'Premier pas'    nm,'Premiere activite realisee !' dsc,'🌟' ej,'activities' ct,1   cv,'#f59e0b' col UNION ALL
  SELECT 'Explorateur',     '5 activites completees',      '🧭','activities',  5, '#3b82f6' UNION ALL
  SELECT 'Etoile montante', '10 activites completees',     '⭐','activities', 10, '#8b5cf6' UNION ALL
  SELECT 'Champion',        '50 points gagnes',            '🏆','points',     50, '#ef4444' UNION ALL
  SELECT 'Super joueur',    '100 points gagnes',           '💎','points',    100, '#06b6d4' UNION ALL
  SELECT 'Grand champion',  '250 points gagnes',           '👑','points',    250, '#f97316'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);

-- ============================================================================
-- VERIFICATION FINALE
-- ============================================================================
-- DONNEES SUPPLEMENTAIRES : 7 enfants par professionnel (analytics riches)
-- ============================================================================

-- Nouveaux parents (mot de passe : parent123)
INSERT INTO users (name, email, password, role, specialite, is_active, status) VALUES
('Amine Bouazizi',    'amine.bouazizi@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Fatma Jebali',      'fatma.jebali@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Karim Zouari',      'karim.zouari@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Sana Maaref',       'sana.maaref@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Nabil Ferchichi',   'nabil.ferchichi@aidaa.com',   '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Rania Mhiri',       'rania.mhiri@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Sofiane Khelifi',   'sofiane.khelifi@aidaa.com',   '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Amira Sassi',       'amira.sassi@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Bilel Gharbi',      'bilel.gharbi@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Olfa Belhaj',       'olfa.belhaj@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Tarek Haddad',      'tarek.haddad@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Mouna Dridi',       'mouna.dridi@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Yassine Chebbi',    'yassine.chebbi@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Rim Nasri',         'rim.nasri@aidaa.com',         '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Khaled Rejeb',      'khaled.rejeb@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Sonia Hammami',     'sonia.hammami@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Adel Bouslama',     'adel.bouslama@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Hajer Khalfallah',  'hajer.khalfallah@aidaa.com',  '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Walid Chaouch',     'walid.chaouch@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Ines Tlili',        'ines.tlili@aidaa.com',        '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Omar Baccar',       'omar.baccar@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Salma Ouertani',    'salma.ouertani@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Fares Boughanmi',   'fares.boughanmi@aidaa.com',   '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Nadya Oueslati',    'nadya.oueslati@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Bassem Letaief',    'bassem.letaief@aidaa.com',    '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Dorsaf Ayari',      'dorsaf.ayari@aidaa.com',      '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Mourad Karray',     'mourad.karray@aidaa.com',     '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Hela Ghannouchi',   'hela.ghannouchi@aidaa.com',   '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Zied Labidi',       'zied.labidi@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved'),
('Nadia Sfaxi',       'nadia.sfaxi@aidaa.com',       '$2a$12$yFhFPRrEI1AwTzcrTqpFvOTZHI6TRLI5ZN621wMq2UX.HCu2eF/ym', 'parent', NULL, 1, 'approved')
ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = 1, status = 'approved';

-- ============================================================================
-- Enfants supplementaires (6 par professionnel existant + 7 pour Amina Chaabane)
-- ============================================================================

-- Dr. Professional Test (professional@aidaa.com) — 6 enfants de plus (total 7)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, v.cn, v.ag, v.pc FROM users u
JOIN (
  SELECT 'amine.bouazizi@aidaa.com' pe, 'Adam Bouazizi'     cn, 6  ag, 'enfant' pc UNION ALL
  SELECT 'fatma.jebali@aidaa.com',       'Lina Jebali',          5, 'enfant' UNION ALL
  SELECT 'karim.zouari@aidaa.com',       'Hamza Zouari',          8, 'enfant' UNION ALL
  SELECT 'sana.maaref@aidaa.com',        'Yasmine Maaref',        7, 'enfant' UNION ALL
  SELECT 'nabil.ferchichi@aidaa.com',    'Sami Ferchichi',        4, 'enfant' UNION ALL
  SELECT 'rania.mhiri@aidaa.com',        'Dina Mhiri',           10, 'enfant'
) v ON u.email = v.pe
WHERE NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = v.cn);

-- Dr. Abderrahman Sbai (abderrahman.sbai@aidaa.com) — 5 enfants de plus (total 7 avec Emma+Lucas)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, v.cn, v.ag, v.pc FROM users u
JOIN (
  SELECT 'sofiane.khelifi@aidaa.com' pe, 'Mehdi Khelifi'   cn, 9  ag, 'enfant' pc UNION ALL
  SELECT 'amira.sassi@aidaa.com',        'Rym Sassi',            6, 'enfant' UNION ALL
  SELECT 'bilel.gharbi@aidaa.com',       'Karim Gharbi',         7, 'enfant' UNION ALL
  SELECT 'olfa.belhaj@aidaa.com',        'Sara Belhaj',          5, 'enfant' UNION ALL
  SELECT 'tarek.haddad@aidaa.com',       'Anas Haddad',          8, 'enfant'
) v ON u.email = v.pe
WHERE NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = v.cn);

-- Dr. Fatima Mansour (fatima.mansour@aidaa.com) — 6 enfants de plus (total 7 avec Youssef)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, v.cn, v.ag, v.pc FROM users u
JOIN (
  SELECT 'mouna.dridi@aidaa.com' pe,  'Amir Dridi'        cn, 6  ag, 'enfant' pc UNION ALL
  SELECT 'yassine.chebbi@aidaa.com',   'Ghofrane Chebbi',      9, 'enfant' UNION ALL
  SELECT 'rim.nasri@aidaa.com',        'Ziad Nasri',           5, 'enfant' UNION ALL
  SELECT 'khaled.rejeb@aidaa.com',     'Farah Rejeb',          7, 'enfant' UNION ALL
  SELECT 'sonia.hammami@aidaa.com',    'Wassim Hammami',       8, 'enfant' UNION ALL
  SELECT 'adel.bouslama@aidaa.com',    'Nour Bouslama',       11, 'jeune'
) v ON u.email = v.pe
WHERE NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = v.cn);

-- Dr. Karim Hamdi (karim.hamdi@aidaa.com) — 6 enfants de plus (total 7 avec Nour Ben Ali)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, v.cn, v.ag, v.pc FROM users u
JOIN (
  SELECT 'hajer.khalfallah@aidaa.com' pe, 'Malek Khalfallah' cn, 13 ag, 'jeune' pc UNION ALL
  SELECT 'walid.chaouch@aidaa.com',        'Islem Chaouch',       12, 'jeune' UNION ALL
  SELECT 'ines.tlili@aidaa.com',           'Cyrine Tlili',        15, 'jeune' UNION ALL
  SELECT 'omar.baccar@aidaa.com',          'Rami Baccar',         10, 'enfant' UNION ALL
  SELECT 'salma.ouertani@aidaa.com',       'Ghada Ouertani',       9, 'enfant' UNION ALL
  SELECT 'fares.boughanmi@aidaa.com',      'Seif Boughanmi',      14, 'jeune'
) v ON u.email = v.pe
WHERE NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = v.cn);

-- Dr. Amina Chaabane (amina.chaabane@aidaa.com) — 7 enfants (nouveau professionnel)
INSERT INTO children (parent_id, name, age, participant_category)
SELECT u.id, v.cn, v.ag, v.pc FROM users u
JOIN (
  SELECT 'nadya.oueslati@aidaa.com' pe,  'Lara Oueslati'     cn, 6  ag, 'enfant' pc UNION ALL
  SELECT 'bassem.letaief@aidaa.com',      'Imed Letaief',          8, 'enfant' UNION ALL
  SELECT 'dorsaf.ayari@aidaa.com',        'Malak Ayari',           5, 'enfant' UNION ALL
  SELECT 'mourad.karray@aidaa.com',       'Skander Karray',        7, 'enfant' UNION ALL
  SELECT 'hela.ghannouchi@aidaa.com',     'Alia Ghannouchi',      10, 'enfant' UNION ALL
  SELECT 'zied.labidi@aidaa.com',         'Chaima Labidi',        13, 'jeune'  UNION ALL
  SELECT 'nadia.sfaxi@aidaa.com',         'Tarek Sfaxi',           9, 'enfant'
) v ON u.email = v.pe
WHERE NOT EXISTS (SELECT 1 FROM children c WHERE c.parent_id = u.id AND c.name = v.cn);

-- ============================================================================
-- Invitations : nouveaux parents ↔ leurs professionnels
-- ============================================================================
INSERT INTO professional_invitations (parent_id, professional_id, status)
SELECT p.id, pr.id, 'active'
FROM (
  SELECT 'amine.bouazizi@aidaa.com'   pe, 'professional@aidaa.com'      pre UNION ALL
  SELECT 'fatma.jebali@aidaa.com',        'professional@aidaa.com'      UNION ALL
  SELECT 'karim.zouari@aidaa.com',        'professional@aidaa.com'      UNION ALL
  SELECT 'sana.maaref@aidaa.com',         'professional@aidaa.com'      UNION ALL
  SELECT 'nabil.ferchichi@aidaa.com',     'professional@aidaa.com'      UNION ALL
  SELECT 'rania.mhiri@aidaa.com',         'professional@aidaa.com'      UNION ALL
  SELECT 'sofiane.khelifi@aidaa.com',     'abderrahman.sbai@aidaa.com'  UNION ALL
  SELECT 'amira.sassi@aidaa.com',         'abderrahman.sbai@aidaa.com'  UNION ALL
  SELECT 'bilel.gharbi@aidaa.com',        'abderrahman.sbai@aidaa.com'  UNION ALL
  SELECT 'olfa.belhaj@aidaa.com',         'abderrahman.sbai@aidaa.com'  UNION ALL
  SELECT 'tarek.haddad@aidaa.com',        'abderrahman.sbai@aidaa.com'  UNION ALL
  SELECT 'mouna.dridi@aidaa.com',         'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'yassine.chebbi@aidaa.com',      'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'rim.nasri@aidaa.com',           'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'khaled.rejeb@aidaa.com',        'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'sonia.hammami@aidaa.com',       'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'adel.bouslama@aidaa.com',       'fatima.mansour@aidaa.com'    UNION ALL
  SELECT 'hajer.khalfallah@aidaa.com',    'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'walid.chaouch@aidaa.com',       'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'ines.tlili@aidaa.com',          'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'omar.baccar@aidaa.com',         'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'salma.ouertani@aidaa.com',      'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'fares.boughanmi@aidaa.com',     'karim.hamdi@aidaa.com'       UNION ALL
  SELECT 'nadya.oueslati@aidaa.com',      'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'bassem.letaief@aidaa.com',      'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'dorsaf.ayari@aidaa.com',        'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'mourad.karray@aidaa.com',       'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'hela.ghannouchi@aidaa.com',     'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'zied.labidi@aidaa.com',         'amina.chaabane@aidaa.com'    UNION ALL
  SELECT 'nadia.sfaxi@aidaa.com',         'amina.chaabane@aidaa.com'
) inv
JOIN users p  ON p.email  = inv.pe
JOIN users pr ON pr.email = inv.pre
WHERE NOT EXISTS (SELECT 1 FROM professional_invitations pi WHERE pi.parent_id = p.id AND pi.professional_id = pr.id);

-- ============================================================================
-- Logs d activites pour les nouveaux enfants
-- ============================================================================
INSERT INTO activity_logs (child_id, content_id, status, action, score, duration_seconds, date)
SELECT c.id, ct.id, v.st, v.ac, v.sc, v.ds, DATE_SUB(NOW(), INTERVAL v.da DAY)
FROM (
  -- Enfants de Dr. Professional Test
  SELECT 'Adam Bouazizi'    cn,'amine.bouazizi@aidaa.com'  pe,'Apprendre a dire bonjour' ct,'completed' st,'content_accessed' ac,25 sc,180 ds,20 da UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Reconnaitre les emotions',    'completed','content_accessed',30,300,17 UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',20,240,14 UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Sequence du matin',            'completed','activity_done',   35,420,10 UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Ecouter et repeter',           'completed','content_accessed',15,120, 7 UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Adam Bouazizi',   'amine.bouazizi@aidaa.com',   'Apprendre a dire bonjour',     'completed','content_accessed',25,180, 1 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180,19 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120,15 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Sequence du matin',            'completed','activity_done',   30,420,12 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',20,240, 9 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',25,300, 6 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   35,600, 3 UNION ALL
  SELECT 'Lina Jebali',     'fatma.jebali@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',30,240,18 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Les chiffres en arabe',        'completed','content_accessed',20,240,15 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Sequence du matin',            'completed','activity_done',   40,420,11 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',30,300, 8 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120, 5 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   40,600, 2 UNION ALL
  SELECT 'Hamza Zouari',    'karim.zouari@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',30,240, 0 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180,22 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',35,300,18 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Marhba - Dire bonjour',        'completed','content_accessed',10,180,14 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Sequence du matin',            'completed','activity_done',   35,420,10 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',15,120, 6 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 3 UNION ALL
  SELECT 'Yasmine Maaref',  'sana.maaref@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   40,600, 0 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Ecouter et repeter',           'completed','content_accessed',15,120,16 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Apprendre a dire bonjour',     'completed','content_accessed',20,180,13 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Jouer ensemble',               'started',  'content_accessed',10,60, 10 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Sequence du matin',            'completed','activity_done',   30,420, 7 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Reconnaitre les emotions',     'completed','content_accessed',25,300, 4 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Creer avec les couleurs',      'completed','activity_done',   35,600, 2 UNION ALL
  SELECT 'Sami Ferchichi',  'nabil.ferchichi@aidaa.com',  'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',30,300,21 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180,17 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Sequence du matin',            'completed','activity_done',   35,420,13 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 9 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',15,120, 5 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   40,600, 2 UNION ALL
  SELECT 'Dina Mhiri',      'rania.mhiri@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',30,300, 0 UNION ALL
  -- Enfants de Dr. Abderrahman Sbai
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Jouer ensemble',               'completed','content_accessed',30,240,20 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Reconnaitre les emotions',     'completed','content_accessed',35,300,16 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Sequence du matin',            'completed','activity_done',   40,420,12 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Creer avec les couleurs',      'completed','activity_done',   45,600, 8 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Apprendre a dire bonjour',     'completed','content_accessed',25,180, 5 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Ecouter et repeter',           'completed','content_accessed',20,120, 2 UNION ALL
  SELECT 'Mehdi Khelifi',   'sofiane.khelifi@aidaa.com',  'Jouer ensemble',               'completed','content_accessed',30,240, 0 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180,19 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',15,120,15 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',30,300,11 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Sequence du matin',            'completed','activity_done',   35,420, 7 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 2 UNION ALL
  SELECT 'Rym Sassi',       'amira.sassi@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',25,240,18 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Les chiffres en arabe',        'completed','content_accessed',20,240,14 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Sequence du matin',            'completed','activity_done',   35,420,10 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',30,300, 7 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120, 1 UNION ALL
  SELECT 'Karim Gharbi',    'bilel.gharbi@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180,17 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Marhba - Dire bonjour',        'completed','content_accessed',10,180,13 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Sequence du matin',            'completed','activity_done',   30,420, 9 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',25,300, 6 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',20,240, 3 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   35,600, 1 UNION ALL
  SELECT 'Sara Belhaj',     'olfa.belhaj@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',30,300,16 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',25,240,12 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Sequence du matin',            'completed','activity_done',   35,420, 8 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120, 5 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   40,600, 3 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 1 UNION ALL
  SELECT 'Anas Haddad',     'tarek.haddad@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  -- Enfants de Dr. Fatima Mansour
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Sequence du matin',            'completed','activity_done',   40,420,19 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',30,240,15 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   45,600,11 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',35,300, 8 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',25,180, 5 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',20,120, 2 UNION ALL
  SELECT 'Amir Dridi',      'mouna.dridi@aidaa.com',      'Sequence du matin',            'completed','activity_done',   40,420, 0 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Apprendre a dire bonjour',     'completed','content_accessed',20,180,22 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Reconnaitre les emotions',     'completed','content_accessed',30,300,18 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Sequence du matin',            'completed','activity_done',   35,420,14 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Les chiffres en arabe',        'completed','content_accessed',20,240,10 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Creer avec les couleurs',      'completed','activity_done',   40,600, 6 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Ecouter et repeter',           'completed','content_accessed',15,120, 3 UNION ALL
  SELECT 'Ghofrane Chebbi', 'yassine.chebbi@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Jouer ensemble',               'completed','content_accessed',25,240,20 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Ecouter et repeter',           'completed','content_accessed',15,120,16 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Reconnaitre les emotions',     'completed','content_accessed',30,300,12 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Sequence du matin',            'completed','activity_done',   35,420, 8 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Apprendre a dire bonjour',     'started',  'content_accessed',10,60,  5 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Creer avec les couleurs',      'completed','activity_done',   35,600, 2 UNION ALL
  SELECT 'Ziad Nasri',      'rim.nasri@aidaa.com',        'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180,18 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Sequence du matin',            'completed','activity_done',   35,420,14 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',30,300,10 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Jouer ensemble',               'completed','content_accessed',25,240, 7 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120, 2 UNION ALL
  SELECT 'Farah Rejeb',     'khaled.rejeb@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Reconnaitre les emotions',     'completed','content_accessed',35,300,17 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Creer avec les couleurs',      'completed','activity_done',   45,600,13 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Sequence du matin',            'completed','activity_done',   40,420, 9 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Apprendre a dire bonjour',     'completed','content_accessed',25,180, 6 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Ecouter et repeter',           'completed','content_accessed',20,120, 3 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Jouer ensemble',               'completed','content_accessed',30,240, 1 UNION ALL
  SELECT 'Wassim Hammami',  'sonia.hammami@aidaa.com',    'Reconnaitre les emotions',     'completed','content_accessed',35,300, 0 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Autonomie au quotidien',       'completed','activity_done',   45,720,15 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Gestion du stress',            'completed','content_accessed',40,420,12 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Reconnaitre les emotions',     'completed','content_accessed',30,300, 9 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Sequence du matin',            'completed','activity_done',   35,420, 6 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Jouer ensemble',               'completed','content_accessed',25,240, 4 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Creer avec les couleurs',      'completed','activity_done',   40,600, 2 UNION ALL
  SELECT 'Nour Bouslama',   'adel.bouslama@aidaa.com',    'Autonomie au quotidien',       'completed','activity_done',   45,720, 0 UNION ALL
  -- Enfants de Dr. Karim Hamdi
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Gestion du stress',            'completed','content_accessed',45,420,21 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Autonomie au quotidien',       'completed','activity_done',   50,720,17 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Reconnaitre les emotions',     'completed','content_accessed',35,300,13 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Sequence du matin',            'completed','activity_done',   40,420, 9 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Jouer ensemble',               'completed','content_accessed',25,240, 5 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Gestion du stress',            'completed','content_accessed',45,420, 2 UNION ALL
  SELECT 'Malek Khalfallah','hajer.khalfallah@aidaa.com', 'Autonomie au quotidien',       'completed','activity_done',   50,720, 0 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Autonomie au quotidien',       'completed','activity_done',   40,720,20 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Gestion du stress',            'completed','content_accessed',40,420,16 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Reconnaitre les emotions',     'completed','content_accessed',30,300,12 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Jouer ensemble',               'completed','content_accessed',25,240, 8 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Sequence du matin',            'completed','activity_done',   35,420, 5 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Creer avec les couleurs',      'completed','activity_done',   40,600, 2 UNION ALL
  SELECT 'Islem Chaouch',   'walid.chaouch@aidaa.com',    'Autonomie au quotidien',       'completed','activity_done',   40,720, 0 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Gestion du stress',            'completed','content_accessed',50,420,19 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Autonomie au quotidien',       'completed','activity_done',   55,720,15 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Reconnaitre les emotions',     'completed','content_accessed',40,300,11 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Sequence du matin',            'completed','activity_done',   45,420, 7 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Gestion du stress',            'completed','content_accessed',50,420, 4 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Jouer ensemble',               'completed','content_accessed',30,240, 2 UNION ALL
  SELECT 'Cyrine Tlili',    'ines.tlili@aidaa.com',       'Autonomie au quotidien',       'completed','activity_done',   55,720, 0 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240,18 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',30,300,14 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Sequence du matin',            'completed','activity_done',   35,420,10 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Gestion du stress',            'completed','content_accessed',40,420, 7 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',15,120, 2 UNION ALL
  SELECT 'Rami Baccar',     'omar.baccar@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Gestion du stress',            'completed','content_accessed',45,420,17 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Autonomie au quotidien',       'completed','activity_done',   50,720,13 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Reconnaitre les emotions',     'completed','content_accessed',35,300, 9 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',25,240, 6 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Sequence du matin',            'completed','activity_done',   40,420, 3 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Creer avec les couleurs',      'completed','activity_done',   45,600, 1 UNION ALL
  SELECT 'Ghada Ouertani',  'salma.ouertani@aidaa.com',   'Autonomie au quotidien',       'completed','activity_done',   50,720, 0 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Gestion du stress',            'completed','content_accessed',50,420,16 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Autonomie au quotidien',       'completed','activity_done',   55,720,12 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Reconnaitre les emotions',     'completed','content_accessed',40,300, 8 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Sequence du matin',            'completed','activity_done',   45,420, 5 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Gestion du stress',            'completed','content_accessed',50,420, 3 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Jouer ensemble',               'completed','content_accessed',30,240, 1 UNION ALL
  SELECT 'Seif Boughanmi',  'fares.boughanmi@aidaa.com',  'Autonomie au quotidien',       'completed','activity_done',   55,720, 0 UNION ALL
  -- Enfants de Dr. Amina Chaabane
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Apprendre a dire bonjour',     'completed','content_accessed',20,180,23 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Reconnaitre les emotions',     'completed','content_accessed',30,300,19 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Sequence du matin',            'completed','activity_done',   35,420,15 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',25,240,11 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Ecouter et repeter',           'completed','content_accessed',15,120, 7 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Creer avec les couleurs',      'completed','activity_done',   40,600, 3 UNION ALL
  SELECT 'Lara Oueslati',   'nadya.oueslati@aidaa.com',   'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',30,240,21 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Sequence du matin',            'completed','activity_done',   40,420,17 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Reconnaitre les emotions',     'completed','content_accessed',35,300,13 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Creer avec les couleurs',      'completed','activity_done',   45,600, 9 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Apprendre a dire bonjour',     'completed','content_accessed',25,180, 6 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Ecouter et repeter',           'completed','content_accessed',20,120, 3 UNION ALL
  SELECT 'Imed Letaief',    'bassem.letaief@aidaa.com',   'Jouer ensemble',               'completed','content_accessed',30,240, 0 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180,20 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Ecouter et repeter',           'completed','content_accessed',15,120,16 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Marhba - Dire bonjour',        'completed','content_accessed',10,180,12 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Sequence du matin',            'completed','activity_done',   30,420, 8 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Reconnaitre les emotions',     'completed','content_accessed',25,300, 5 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Creer avec les couleurs',      'completed','activity_done',   35,600, 2 UNION ALL
  SELECT 'Malak Ayari',     'dorsaf.ayari@aidaa.com',     'Apprendre a dire bonjour',     'completed','content_accessed',20,180, 0 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Jouer ensemble',               'completed','content_accessed',25,240,19 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Sequence du matin',            'completed','activity_done',   35,420,15 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Les chiffres en arabe',        'completed','content_accessed',20,240,11 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Reconnaitre les emotions',     'completed','content_accessed',30,300, 7 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Ecouter et repeter',           'completed','content_accessed',15,120, 2 UNION ALL
  SELECT 'Skander Karray',  'mourad.karray@aidaa.com',    'Jouer ensemble',               'completed','content_accessed',25,240, 0 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Reconnaitre les emotions',     'completed','content_accessed',30,300,18 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Apprendre a dire bonjour',     'completed','content_accessed',20,180,14 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Sequence du matin',            'completed','activity_done',   35,420,10 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Jouer ensemble',               'completed','content_accessed',25,240, 7 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Creer avec les couleurs',      'completed','activity_done',   40,600, 4 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Ecouter et repeter',           'completed','content_accessed',15,120, 2 UNION ALL
  SELECT 'Alia Ghannouchi', 'hela.ghannouchi@aidaa.com',  'Reconnaitre les emotions',     'completed','content_accessed',30,300, 0 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Gestion du stress',            'completed','content_accessed',45,420,17 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Autonomie au quotidien',       'completed','activity_done',   50,720,13 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',35,300, 9 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Sequence du matin',            'completed','activity_done',   40,420, 6 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 3 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Gestion du stress',            'completed','content_accessed',45,420, 1 UNION ALL
  SELECT 'Chaima Labidi',   'zied.labidi@aidaa.com',      'Autonomie au quotidien',       'completed','activity_done',   50,720, 0 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240,22 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Reconnaitre les emotions',     'completed','content_accessed',30,300,18 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Sequence du matin',            'completed','activity_done',   35,420,14 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Apprendre a dire bonjour',     'completed','content_accessed',20,180,10 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Creer avec les couleurs',      'completed','activity_done',   40,600, 6 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Ecouter et repeter',           'completed','content_accessed',15,120, 3 UNION ALL
  SELECT 'Tarek Sfaxi',     'nadia.sfaxi@aidaa.com',      'Jouer ensemble',               'completed','content_accessed',25,240, 0
) v
JOIN children c  ON c.name   = v.cn
JOIN users    u  ON u.id     = c.parent_id AND u.email = v.pe
JOIN content  ct ON ct.title = v.ct;

-- ============================================================================
-- Notes professionnelles pour les nouveaux enfants
-- ============================================================================
INSERT INTO notes (professional_id, child_id, content, date)
SELECT pr.id, ch.id, v.msg, DATE_SUB(NOW(), INTERVAL v.da DAY)
FROM (
  -- Dr. Professional Test
  SELECT 'professional@aidaa.com' pe,'Adam Bouazizi'    cn,'Bonne concentration. Progres rapides sur la communication verbale. Score 25/50.'          msg,10 da UNION ALL
  SELECT 'professional@aidaa.com',   'Lina Jebali',        'Tres reactive aux exercices auditifs. Recommander plus de sessions ecoute-repetition.',    7 UNION ALL
  SELECT 'professional@aidaa.com',   'Hamza Zouari',       'Progres constants. Autonomie en hausse. Prochaine etape : interactions en groupe.',        5 UNION ALL
  SELECT 'professional@aidaa.com',   'Yasmine Maaref',     'Excellente participation. Score moyen 32/50 ce mois. Continuer le rythme actuel.',        3 UNION ALL
  SELECT 'professional@aidaa.com',   'Sami Ferchichi',     'Debut prometteur. Difficultees sur la sequence du matin, besoin de repetition.',          6 UNION ALL
  SELECT 'professional@aidaa.com',   'Dina Mhiri',         'Tres bons resultats sur la reconnaissance des emotions. Score 30/50. Bien progresse.',    4 UNION ALL
  -- Dr. Abderrahman Sbai
  SELECT 'abderrahman.sbai@aidaa.com','Mehdi Khelifi',     'Excellente evolution sociale. Participe activement aux jeux de groupe. Score 40/50.',     9 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Rym Sassi',         'Bonne progression emotionnelle. Identifie 4 emotions sur 6 correctement.',                7 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Karim Gharbi',      'Tres bon travail sur les chiffres en arabe. Bilingue en progres.',                        5 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Sara Belhaj',       'Progres notables sur la communication. Salue spontanement en 3 langues.',                 3 UNION ALL
  SELECT 'abderrahman.sbai@aidaa.com','Anas Haddad',       'Bilan positif. Score total 185 points. Pret pour activites niveau 2.',                    2 UNION ALL
  -- Dr. Fatima Mansour
  SELECT 'fatima.mansour@aidaa.com',  'Amir Dridi',        'Excellent niveau d autonomie. Sequence matin realisee 6 jours sur 7 independamment.',    11 UNION ALL
  SELECT 'fatima.mansour@aidaa.com',  'Ghofrane Chebbi',   'Tres bonne progression. Maitrise les activites niveau 1. Score moyen 33/50.',             8 UNION ALL
  SELECT 'fatima.mansour@aidaa.com',  'Ziad Nasri',        'Debuts encourageants. Quelques difficultes de concentration a surveiller.',               6 UNION ALL
  SELECT 'fatima.mansour@aidaa.com',  'Farah Rejeb',       'Tres bien investie. Famille tres impliquee. Score 35/50 ce mois.',                        4 UNION ALL
  SELECT 'fatima.mansour@aidaa.com',  'Wassim Hammami',    'Progres remarquables sur la creativite. Score 40/50 sur activites creatives.',            3 UNION ALL
  SELECT 'fatima.mansour@aidaa.com',  'Nour Bouslama',     'Niveau jeune, bonne maturite emotionnelle. Pret pour activites niveau 2.',                1 UNION ALL
  -- Dr. Karim Hamdi
  SELECT 'karim.hamdi@aidaa.com',     'Malek Khalfallah',  'Excellent travail sur la gestion du stress. Applique les techniques en autonomie.',      10 UNION ALL
  SELECT 'karim.hamdi@aidaa.com',     'Islem Chaouch',     'Bonne progression sur l autonomie. Score 78/100 en gestion emotionnelle.',               8 UNION ALL
  SELECT 'karim.hamdi@aidaa.com',     'Cyrine Tlili',      'Meilleure de son groupe. Score 82/100. Peut encadrer les plus jeunes dans les activites.',6 UNION ALL
  SELECT 'karim.hamdi@aidaa.com',     'Rami Baccar',       'Transition jeune-enfant bien geree. Score 75/100 en gestion du stress.',                  5 UNION ALL
  SELECT 'karim.hamdi@aidaa.com',     'Ghada Ouertani',    'Progres constants sur l autonomie. Objectif 80/100 pour le mois prochain.',               3 UNION ALL
  SELECT 'karim.hamdi@aidaa.com',     'Seif Boughanmi',    'Excellent niveau. Score 80/100. Recommande pour le groupe avance.',                       1 UNION ALL
  -- Dr. Amina Chaabane
  SELECT 'amina.chaabane@aidaa.com',  'Lara Oueslati',     'Tres bonne reactivite aux exercices. Score 35/50 en premiere seance. Prometteur.',       12 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Imed Letaief',      'Tres actif, bon potentiel. Manque un peu de concentration sur les longues sequences.',   10 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Malak Ayari',       'Progres rapides. Maitrise deja 3 langues de salutation. Excellent travail famille.',       8 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Skander Karray',    'Bonne base. Sequence matin acquise en 2 semaines. Score 35/50.',                          6 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Alia Ghannouchi',   'Tres bonne reconnaissance emotionnelle. Score 30/50. Continuer les jeux de groupe.',      4 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Chaima Labidi',     'Niveau jeune, gestion stress excellente. Prete pour groupe avance.',                      2 UNION ALL
  SELECT 'amina.chaabane@aidaa.com',  'Tarek Sfaxi',       'Progres reguliers. Score 30/50. Famille tres motivee et impliquee.',                      1
) v
JOIN users    pr ON pr.email = v.pe
JOIN children ch ON ch.name  = v.cn;

-- ============================================================================
SELECT 'SETUP TERMINE' AS statut;
SELECT CONCAT('Utilisateurs      : ', COUNT(*)) info FROM users;
SELECT CONCAT('Parents           : ', COUNT(*)) info FROM users WHERE role='parent';
SELECT CONCAT('Professionnels    : ', COUNT(*)) info FROM users WHERE role='professional';
SELECT CONCAT('Participants      : ', COUNT(*)) info FROM children;
SELECT CONCAT('Invitations       : ', COUNT(*)) info FROM professional_invitations;
SELECT CONCAT('Contenus          : ', COUNT(*)) info FROM content;
SELECT CONCAT('Activites logs    : ', COUNT(*)) info FROM activity_logs;
SELECT CONCAT('Messages          : ', COUNT(*)) info FROM messages;
SELECT CONCAT('Notes             : ', COUNT(*)) info FROM notes;
SELECT CONCAT('Jeux              : ', COUNT(*)) info FROM games;
SELECT CONCAT('AAC               : ', COUNT(*)) info FROM aac_symbols;
SELECT CONCAT('Sequences         : ', COUNT(*)) info FROM guided_sequences;
SELECT CONCAT('Badges            : ', COUNT(*)) info FROM badges;

-- ============================================================================
-- RECAPITULATIF COMPTES
-- ============================================================================
-- Admin           : admin@aidaa.com                 / admin123
-- Parent          : parent@aidaa.com                / parent123
-- Parent          : sarah.johnson@aidaa.com         / parent123
-- Parent          : mohamed.trabelsi@aidaa.com      / parent123
-- Parent          : leila.benali@aidaa.com          / parent123
-- Professionnel   : professional@aidaa.com          / professional123
-- Professionnel   : abderrahman.sbai@aidaa.com      / professional123
-- Professionnel   : fatima.mansour@aidaa.com        / professional123
-- Professionnel   : karim.hamdi@aidaa.com           / profession
