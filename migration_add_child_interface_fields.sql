-- ============================================================================
-- MIGRATION: ADD COLUMNS FOR NEW CHILD INTERFACE
-- ============================================================================
-- Date: 2026-04-05
-- Purpose: Add fields needed for the new Child Dashboard prototype

USE aidaa_db;

-- ============================================================================
-- ALTER TABLE CONTENT - ADD MISSING COLUMNS
-- ============================================================================

ALTER TABLE content
ADD COLUMN emoji VARCHAR(10) DEFAULT NULL COMMENT 'Emoji for content card',
ADD COLUMN duration VARCHAR(20) DEFAULT NULL COMMENT 'Duration for videos (e.g. "3 min")',
ADD COLUMN steps INT DEFAULT NULL COMMENT 'Number of steps for activities',
ADD COLUMN minutes INT DEFAULT NULL COMMENT 'Duration in minutes for activities',
ADD COLUMN emoji_color VARCHAR(20) DEFAULT NULL COMMENT 'Background color for activity emoji (e.g. #d1fae5)',
ADD COLUMN category_color VARCHAR(20) DEFAULT '#f97316' COMMENT 'Color for category badge';

-- ============================================================================
-- INSERT SAMPLE DATA FOR VIDEOS
-- ============================================================================

INSERT INTO content (title, type, category, category_color, emoji, duration, url, description, age_group, level)
VALUES
(
  'Apprendre à dire bonjour',
  'video',
  'Communication',
  '#f97316',
  '🗣️',
  '3 min',
  'https://example.com/video1.mp4',
  'Apprenez à dire bonjour poliment et avec des gestes amicaux',
  '4-6',
  1
),
(
  'Reconnaître les émotions',
  'video',
  'Émotions',
  '#f97316',
  '😊',
  '5 min',
  'https://example.com/video2.mp4',
  'Identifiez les différentes émotions: joie, tristesse, colère, peur',
  '4-6',
  1
),
(
  'Jouer ensemble c\'est amusant',
  'video',
  'Social',
  '#f97316',
  '🧩',
  '4 min',
  'https://example.com/video3.mp4',
  'Les bénéfices du jeu social et comment jouer avec les autres',
  '4-6',
  1
),
(
  'Préparer mon petit-déjeuner',
  'video',
  'Autonomie',
  '#f97316',
  '🍎',
  '6 min',
  'https://example.com/video4.mp4',
  'Étapes pour préparer un petit-déjeuner sain et équilibré',
  '4-6',
  1
);

-- ============================================================================
-- INSERT SAMPLE DATA FOR ACTIVITIES
-- ============================================================================

INSERT INTO content (title, type, emoji, emoji_color, steps, minutes, url, description, age_group, level)
VALUES
(
  'Séquence du matin',
  'activity',
  '🌱',
  '#d1fae5',
  5,
  15,
  'https://example.com/activity1',
  'Routine matinale structurée avec étapes visuelles',
  '4-6',
  1
),
(
  'Créer avec les couleurs',
  'activity',
  '🎨',
  '#fce7f3',
  8,
  20,
  'https://example.com/activity2',
  'Activité créative et sensorielle avec différentes couleurs',
  '4-6',
  1
),
(
  'Écouter et répéter',
  'activity',
  '🎵',
  '#e0f2fe',
  6,
  10,
  'https://example.com/activity3',
  'Jeu d\'écoute et prononciation pour développer le langage',
  '4-6',
  1
);

-- ============================================================================
-- VERIFY CHANGES
-- ============================================================================

SELECT '✅ Migration completed!' as status;
SELECT COUNT(*) as 'Total content items', type, COUNT(type) as count FROM content GROUP BY type;
SELECT * FROM content WHERE type='video' LIMIT 1;
SELECT * FROM content WHERE type='activity' LIMIT 1;

-- ============================================================================
-- END MIGRATION
-- ============================================================================

