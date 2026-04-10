-- ============================================================================
-- MIGRATION: Modules B (Séquences), C (AAC), D (Gamification + Badges)
-- ============================================================================
-- Run ONCE to create all missing tables and fix schema

-- ==== Fix: Allow NULL content_id in activity_logs for game/sequence sessions ====
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE activity_logs MODIFY COLUMN content_id INT DEFAULT NULL;
SET FOREIGN_KEY_CHECKS = 1;

-- ==== Add participant_category to content table ====
ALTER TABLE content
  ADD COLUMN IF NOT EXISTS participant_category
    ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous';

UPDATE content SET participant_category = 'tous' WHERE participant_category IS NULL OR participant_category = '';

-- ============================================================================
-- MODULE B: GUIDED SEQUENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS guided_sequences (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(200) NOT NULL,
  description          TEXT,
  emoji                VARCHAR(10)  DEFAULT '📋',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  duration_minutes     INT          DEFAULT 15,
  difficulty           ENUM('facile','moyen','difficile') DEFAULT 'facile',
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sequence_steps (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  sequence_id      INT NOT NULL,
  step_number      INT NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  emoji            VARCHAR(10) DEFAULT '▶️',
  duration_seconds INT         DEFAULT 60,
  FOREIGN KEY (sequence_id) REFERENCES guided_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample sequences (idempotent via ON DUPLICATE KEY on title)
INSERT INTO guided_sequences (title, description, emoji, participant_category, duration_minutes, difficulty) VALUES
('Routine du matin',              'Apprendre la routine du matin étape par étape',           '🌅', 'enfant', 10, 'facile'),
('Lavage des mains',              'Comment bien se laver les mains',                          '🧼', 'tous',   5,  'facile'),
('Préparation repas simple',      'Préparer un sandwich ou une collation',                    '🥪', 'jeune',  20, 'moyen'),
('Prise des transports',          'Utiliser les transports en commun de façon autonome',      '🚌', 'adulte', 30, 'moyen'),
('Gestion des émotions',          'Reconnaitre et exprimer ses émotions',                     '😊', 'tous',   15, 'facile')
ON DUPLICATE KEY UPDATE id = id;

-- Steps — inserted only if table is empty (safe multi-run)
INSERT INTO sequence_steps (sequence_id, step_number, title, description, emoji, duration_seconds)
SELECT s.id, v.step_number, v.title, v.description, v.emoji, v.duration_seconds
FROM guided_sequences s
JOIN (
  SELECT 'Routine du matin' AS seq_title, 1 AS step_number, 'Se réveiller',       'Ouvrir les yeux et s étirer',          '☀️',  30  UNION ALL
  SELECT 'Routine du matin', 2, 'Se lever',           'Mettre les pieds par terre',            '🛏️', 30  UNION ALL
  SELECT 'Routine du matin', 3, 'Se laver le visage', 'Aller à la salle de bain',              '🚿', 120 UNION ALL
  SELECT 'Routine du matin', 4, 'S habiller',         'Choisir et mettre ses vêtements',       '👕', 180 UNION ALL
  SELECT 'Routine du matin', 5, 'Petit déjeuner',     'Manger et boire',                       '🥛', 600 UNION ALL
  SELECT 'Lavage des mains', 1, 'Ouvrir le robinet',  'Tourner le robinet',                    '🚰', 10  UNION ALL
  SELECT 'Lavage des mains', 2, 'Mouiller les mains', 'Mettre les mains sous l eau',           '💧', 10  UNION ALL
  SELECT 'Lavage des mains', 3, 'Savonner',           'Prendre du savon et frotter',           '🧴', 20  UNION ALL
  SELECT 'Lavage des mains', 4, 'Rincer',             'Enlever tout le savon',                 '💧', 15  UNION ALL
  SELECT 'Lavage des mains', 5, 'Sécher',             'Utiliser une serviette propre',         '🧻', 10  UNION ALL
  SELECT 'Gestion des émotions', 1, 'Identifier',     'Comment est-ce que je me sens ?',       '🤔', 30  UNION ALL
  SELECT 'Gestion des émotions', 2, 'Respirer',       'Prendre 3 grandes inspirations',        '💨', 30  UNION ALL
  SELECT 'Gestion des émotions', 3, 'Exprimer',       'Dire ce que l on ressent',              '💬', 60  UNION ALL
  SELECT 'Gestion des émotions', 4, 'Chercher solution','Que puis-je faire ?',                 '💡', 60  UNION ALL
  SELECT 'Gestion des émotions', 5, 'Demander aide',  'Parler à quelqu un de confiance',       '🤝', 30
) v ON s.title = v.seq_title
WHERE NOT EXISTS (SELECT 1 FROM sequence_steps ss WHERE ss.sequence_id = s.id);

-- ============================================================================
-- MODULE C: AAC SYMBOLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS aac_symbols (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  label                VARCHAR(100) NOT NULL,
  emoji                VARCHAR(10)  NOT NULL,
  category             VARCHAR(50)  NOT NULL DEFAULT 'Général',
  participant_category ENUM('enfant','jeune','adulte','tous') NOT NULL DEFAULT 'tous',
  color                VARCHAR(20)  DEFAULT '#3b82f6',
  sort_order           INT          DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO aac_symbols (label, emoji, category, participant_category, color, sort_order) VALUES
-- Besoins
('J ai faim',                '🍽️','Besoins','tous',   '#ef4444', 1),
('J ai soif',                '💧','Besoins','tous',   '#3b82f6', 2),
('Je veux dormir',           '😴','Besoins','tous',   '#8b5cf6', 3),
('J ai mal',                 '🤕','Besoins','tous',   '#f97316', 4),
('Toilettes',                '🚻','Besoins','tous',   '#6b7280', 5),
('J ai froid',               '🥶','Besoins','tous',   '#60a5fa', 6),
('J ai chaud',               '🥵','Besoins','tous',   '#f87171', 7),
('Je veux jouer',            '🎮','Besoins','tous',   '#10b981', 8),
('Je veux de l aide',        '🙋','Besoins','tous',   '#f59e0b', 9),
-- Émotions
('Je suis heureux',          '😊','Émotions','tous',  '#f59e0b', 1),
('Je suis triste',           '😢','Émotions','tous',  '#60a5fa', 2),
('Je suis en colère',        '😠','Émotions','tous',  '#ef4444', 3),
('J ai peur',                '😨','Émotions','tous',  '#8b5cf6', 4),
('Je suis fatigué',          '😴','Émotions','tous',  '#94a3b8', 5),
('Je suis calme',            '😌','Émotions','tous',  '#34d399', 6),
('J aime ca',                '❤️','Émotions','tous',  '#f43f5e', 7),
('Je ne veux pas',           '🙅','Émotions','tous',  '#f97316', 8),
-- Actions
('Arrêter',                  '✋','Actions', 'tous',  '#ef4444', 1),
('Venir',                    '👋','Actions', 'tous',  '#3b82f6', 2),
('Aider',                    '🤝','Actions', 'tous',  '#10b981', 3),
('Montrer',                  '👉','Actions', 'tous',  '#f59e0b', 4),
('Donner',                   '🎁','Actions', 'tous',  '#8b5cf6', 5),
('Attendre',                 '⏳','Actions', 'tous',  '#6b7280', 6),
('Recommencer',              '🔄','Actions', 'tous',  '#06b6d4', 7),
-- Aliments
('Eau',                      '💧','Aliments','tous',  '#3b82f6', 1),
('Pain',                     '🍞','Aliments','tous',  '#f59e0b', 2),
('Fruit',                    '🍎','Aliments','tous',  '#ef4444', 3),
('Légumes',                  '🥦','Aliments','tous',  '#10b981', 4),
('Lait',                     '🥛','Aliments','enfant','#e2e8f0', 5),
('Gâteau',                   '🎂','Aliments','enfant','#ec4899', 6)
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- MODULE D: BADGES & GAMIFICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  emoji           VARCHAR(10)  NOT NULL DEFAULT '🏅',
  condition_type  ENUM('activities','points','games') NOT NULL,
  condition_value INT          NOT NULL DEFAULT 1,
  color           VARCHAR(20)  DEFAULT '#f59e0b',
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS child_badges (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  child_id  INT NOT NULL,
  badge_id  INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id)   ON DELETE CASCADE,
  UNIQUE KEY unique_badge (child_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO badges (name, description, emoji, condition_type, condition_value, color) VALUES
('Premier pas',    'Première activité réalisée !',     '🌟', 'activities', 1,   '#f59e0b'),
('Explorateur',    '5 activités complétées',           '🧭', 'activities', 5,   '#3b82f6'),
('Étoile montante','10 activités complétées',          '⭐', 'activities', 10,  '#8b5cf6'),
('Champion',       '50 points gagnés',                 '🏆', 'points',     50,  '#ef4444'),
('Super joueur',   '100 points gagnés',                '💎', 'points',     100, '#06b6d4'),
('Grand champion', '250 points gagnés',                '👑', 'points',     250, '#f97316')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

