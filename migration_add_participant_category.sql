-- Add participant category to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS participant_category ENUM('enfant', 'jeune', 'adulte') NOT NULL DEFAULT 'enfant';

