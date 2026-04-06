-- ============================================================================
-- DATABASE UPDATES FOR AIDAA APPLICATION
-- ============================================================================
-- Execute this script to update the database with new fields and tables

-- ============================================================================
-- ALTER activity_logs TABLE
-- ============================================================================
-- Add fields to track score, duration, and action type
ALTER TABLE activity_logs
ADD COLUMN action VARCHAR(50) DEFAULT 'content_accessed' AFTER status,
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN duration_seconds INT DEFAULT 0;

-- Create index on score and duration for analytics
CREATE INDEX idx_activity_logs_score ON activity_logs(score);
CREATE INDEX idx_activity_logs_duration ON activity_logs(duration_seconds);

-- ============================================================================
-- CREATE messages TABLE
-- ============================================================================
-- For messaging between parents and professionals
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(receiver_id) REFERENCES users(id),
  INDEX idx_messages_child_id (child_id),
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_receiver_id (receiver_id),
  INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE games TABLE (OPTIONAL - For tracking available games)
-- ============================================================================
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50),  -- 'color_match', 'memory', 'sound_recognition'
  thumbnail_url VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_games_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT SAMPLE GAMES
-- ============================================================================
INSERT INTO games (title, description, type, instructions) VALUES
('Color Match', 'Click the correct color button that matches the word', 'color_match', 'Read the color name displayed and click the matching color button.'),
('Memory Game', 'Match pairs of cards in this memory matching game', 'memory', 'Click on cards to reveal them, find matching pairs.'),
('Sound Recognition', 'Hear a sound and select the correct image', 'sound_recognition', 'Listen to the sound played and click the matching image.')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================================
-- VERIFY UPDATES
-- ============================================================================
-- Run these SELECT statements to verify updates were successful:
-- SELECT * FROM activity_logs LIMIT 1;  -- Should show new columns: action, score, duration_seconds
-- SELECT * FROM messages LIMIT 1;  -- Should exist now
-- SELECT * FROM games;  -- Should show 3 sample games

