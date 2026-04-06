-- ============================================================================
-- INSERT PARENT TEST USER FOR AIDAA
-- ============================================================================

USE aidaa_db;

-- Insert parent user (password: parent123 - hashed with bcryptjs)
-- bcryptjs hash for "parent123"
INSERT INTO users (name, email, password, role, is_active)
VALUES (
  'Parent Test',
  'parent@aidaa.com',
  '$2a$12$rZjzKsF.wQg0V5zQz7lfH.2JGvKQHQrQsqGZqP7Jc9kQqM0HvLQvC',
  'parent',
  1
) ON DUPLICATE KEY UPDATE id=id;

-- Insert test child for parent
INSERT INTO children (parent_id, name, age)
SELECT id, 'Test Child 1', 5
FROM users
WHERE email = 'parent@aidaa.com'
LIMIT 1;

-- Verify insertion
SELECT 'Parent User Created:' as status;
SELECT id, name, email, role FROM users WHERE email = 'parent@aidaa.com';

SELECT 'Child Created:' as status;
SELECT c.id, c.name, c.age, u.email as parent_email
FROM children c
JOIN users u ON c.parent_id = u.id
WHERE u.email = 'parent@aidaa.com';

-- ============================================================================
-- LOGIN CREDENTIALS
-- ============================================================================
-- Email: parent@aidaa.com
-- Password: parent123
-- Role: parent
-- ============================================================================

