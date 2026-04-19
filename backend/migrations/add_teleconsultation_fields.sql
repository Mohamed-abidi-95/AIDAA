-- ============================================================================
-- Migration: Téléconsultation — ajout status, room_id, reminder_sent
-- Date: 2026-04-19
-- Exécuter une seule fois dans phpMyAdmin ou via MySQL CLI
-- ============================================================================

USE aidaa_db;

-- 1. Ajouter la colonne status
ALTER TABLE teleconsultations
ADD COLUMN IF NOT EXISTS status ENUM('scheduled','in_progress','completed','cancelled')
  NOT NULL DEFAULT 'scheduled' AFTER notes;

-- 2. Ajouter room_id unique (UUID-like)
ALTER TABLE teleconsultations
ADD COLUMN IF NOT EXISTS room_id VARCHAR(120) NULL AFTER status;

-- 3. Ajouter reminder_sent (pour éviter les doublons de rappels)
ALTER TABLE teleconsultations
ADD COLUMN IF NOT EXISTS reminder_sent TINYINT NOT NULL DEFAULT 0 AFTER room_id;

-- 4. Index pour les recherches rapides par room_id
CREATE INDEX IF NOT EXISTS idx_teleconsult_room_id ON teleconsultations(room_id);

-- 5. Générer des room_ids pour les lignes existantes
UPDATE teleconsultations
SET room_id = CONCAT('room-', LOWER(HEX(RANDOM_BYTES(8))), '-', id)
WHERE room_id IS NULL;

-- 6. Marquer les séances dont la date est passée comme "completed"
UPDATE teleconsultations
SET status = 'completed'
WHERE date_time < NOW() AND status = 'scheduled';

-- 7. Mettre à jour les meeting_links basés sur le room_id (si non définis)
UPDATE teleconsultations
SET meeting_link = CONCAT('https://meet.jit.si/', room_id)
WHERE meeting_link IS NULL OR meeting_link = '';

COMMIT;
SELECT 'Migration teleconsultations OK' AS result,
       COUNT(*) AS total_rows,
       SUM(status = 'scheduled') AS scheduled,
       SUM(status = 'completed') AS completed
FROM teleconsultations;

