-- ============================================================================
-- MIGRATION : Ajout de la colonne specialite dans la table users
-- Description : Permet de stocker la spécialité des professionnels de santé
-- ============================================================================

USE aidaa_db;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS specialite VARCHAR(100) NULL DEFAULT NULL AFTER role;

-- Vérification :
-- SELECT id, name, email, role, specialite, status FROM users WHERE role = 'professional';

