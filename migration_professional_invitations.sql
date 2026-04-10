-- ============================================================================
-- MIGRATION : Table professional_invitations
-- Description : Suivi des invitations parent → professionnel
-- ============================================================================

USE aidaa_db;

CREATE TABLE IF NOT EXISTS professional_invitations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  parent_id       INT NOT NULL,
  professional_id INT NOT NULL,
  status          ENUM('pending', 'active', 'revoked') NOT NULL DEFAULT 'pending',
  invited_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id)       REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (parent_id, professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_prof_inv_parent ON professional_invitations(parent_id);
CREATE INDEX idx_prof_inv_prof   ON professional_invitations(professional_id);

