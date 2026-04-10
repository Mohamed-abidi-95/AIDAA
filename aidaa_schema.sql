-- ============================================================================
-- AIDAA PROJECT - COMPLETE MYSQL SCHEMA
-- ============================================================================
-- Database: aidaa_db
-- Description: Complete schema for AIDAA platform with users, children, 
--              content management, activity logging, notes, and teleconsultations
-- ============================================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS aidaa_db;
USE aidaa_db;

-- ============================================================================
-- TABLE 1: USERS
-- ============================================================================
-- Description: Stores all users (admins, parents, professionals)
-- ============================================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  role ENUM('admin','parent','professional') NOT NULL DEFAULT 'parent',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: CHILDREN
-- ============================================================================
-- Description: Stores children records linked to parent users
-- ============================================================================
CREATE TABLE children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT,
  participant_category ENUM('enfant','jeune','adulte') NOT NULL DEFAULT 'enfant',
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: CONTENT
-- ============================================================================
-- Description: Stores educational and activity content (videos, activities)
-- ============================================================================
CREATE TABLE content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type ENUM('video','activity') NOT NULL,
  category VARCHAR(100),
  age_group VARCHAR(50),
  level INT DEFAULT 1,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: ACTIVITY_LOGS
-- ============================================================================
-- Description: Tracks children's activity progress with content
-- ============================================================================
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  content_id INT NOT NULL,
  status ENUM('started','completed') DEFAULT 'started',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: NOTES
-- ============================================================================
-- Description: Professional notes about children's progress and observations
-- ============================================================================
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professional_id INT NOT NULL,
  child_id INT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: TELECONSULTATIONS
-- ============================================================================
-- Description: Stores teleconsultation meetings between parents and professionals
-- ============================================================================
CREATE TABLE teleconsultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  professional_id INT NOT NULL,
  date_time DATETIME NOT NULL,
  meeting_link VARCHAR(500),
  notes TEXT,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (professional_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE INDEXES ON FOREIGN KEY COLUMNS
-- ============================================================================

-- Indexes for children table
CREATE INDEX idx_children_parent_id ON children(parent_id);

-- Indexes for activity_logs table
CREATE INDEX idx_activity_logs_child_id ON activity_logs(child_id);
CREATE INDEX idx_activity_logs_content_id ON activity_logs(content_id);

-- Indexes for notes table
CREATE INDEX idx_notes_professional_id ON notes(professional_id);
CREATE INDEX idx_notes_child_id ON notes(child_id);

-- Indexes for teleconsultations table
CREATE INDEX idx_teleconsultations_parent_id ON teleconsultations(parent_id);
CREATE INDEX idx_teleconsultations_professional_id ON teleconsultations(professional_id);

-- ============================================================================
-- SAMPLE DATA - USERS
-- ============================================================================

-- Admin user (password: admin123 - bcrypt hash)
INSERT INTO users (name, email, password, role, is_active) 
VALUES ('Admin User', 'admin@aidaa.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DRcT36', 'admin', 1);

-- Parent users (password: NULL - will be set on first login)
INSERT INTO users (name, email, password, role, is_active) 
VALUES ('Sarah Johnson', 'sarah.johnson@example.com', NULL, 'parent', 1);

INSERT INTO users (name, email, password, role, is_active) 
VALUES ('Michael Smith', 'michael.smith@example.com', NULL, 'parent', 1);

-- Professional user (password: NULL - will be set on first login)
INSERT INTO users (name, email, password, role, is_active) 
VALUES ('Dr. Emily Brown', 'emily.brown@aidaa.com', NULL, 'professional', 1);

-- ============================================================================
-- SAMPLE DATA - CHILDREN
-- ============================================================================

-- Children for parent #2 (Sarah Johnson)
INSERT INTO children (parent_id, name, age) 
VALUES (2, 'Emma Johnson', 5);

INSERT INTO children (parent_id, name, age) 
VALUES (2, 'Lucas Johnson', 7);

-- ============================================================================
-- SAMPLE DATA - CONTENT
-- ============================================================================

INSERT INTO content (title, type, category, age_group, level, url, description) 
VALUES ('Alphabet Learning', 'video', 'Language', '4-6', 1, 'https://example.com/alphabet', 'Introduction to English alphabet with pronunciation');

INSERT INTO content (title, type, category, age_group, level, url, description) 
VALUES ('Time Management Activity', 'activity', 'Life Skills', '6-8', 2, 'https://example.com/time-activity', 'Interactive activity to teach children about time');

INSERT INTO content (title, type, category, age_group, level, url, description) 
VALUES ('Math Basics - Numbers 1-10', 'video', 'Mathematics', '4-6', 1, 'https://example.com/math-1-10', 'Learn numbers and basic counting');

INSERT INTO content (title, type, category, age_group, level, url, description) 
VALUES ('Social Skills Training', 'activity', 'Social Development', '5-8', 2, 'https://example.com/social-skills', 'Activity to develop communication and sharing skills');

INSERT INTO content (title, type, category, age_group, level, url, description) 
VALUES ('Science Explorer - Plants', 'video', 'Science', '6-8', 2, 'https://example.com/science-plants', 'Explore the life cycle of plants through interactive video');

-- ============================================================================
-- SAMPLE DATA - ACTIVITY LOGS
-- ============================================================================

INSERT INTO activity_logs (child_id, content_id, status, date) 
VALUES (1, 1, 'completed', NOW());

INSERT INTO activity_logs (child_id, content_id, status, date) 
VALUES (1, 3, 'started', NOW());

INSERT INTO activity_logs (child_id, content_id, status, date) 
VALUES (2, 2, 'completed', NOW());

-- ============================================================================
-- SAMPLE DATA - NOTES
-- ============================================================================

INSERT INTO notes (professional_id, child_id, content, date) 
VALUES (4, 1, 'Emma shows excellent progress in alphabet recognition. Recommend continuing with Level 2 content.', NOW());

-- ============================================================================
-- SAMPLE DATA - TELECONSULTATIONS
-- ============================================================================

INSERT INTO teleconsultations (parent_id, professional_id, date_time, meeting_link, notes) 
VALUES (2, 4, '2026-04-15 10:00:00', 'https://meet.example.com/session/abc123', 'Initial consultation to discuss Emma\'s learning plan');

-- ============================================================================
-- END OF SCHEMA - AIDAA PROJECT
-- ============================================================================
