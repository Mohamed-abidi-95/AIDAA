// ============================================================================
// USER MODEL - user.model.js
// ============================================================================
// Data access layer for users table
// Functions: findByEmail, findById, createUser, setUserPassword, updateUser,
//            getAllUsers, setActiveStatus
// All functions are async and return promises

// Import query function from database config
const { query } = require('../config/db');

// ============================================================================
// FIND USER BY EMAIL
// ============================================================================
// Function: findByEmail(email)
// Purpose: Retrieve user record by email address
// Parameters: email (string) - user's email
// Returns: Promise<object|null> - user object or null if not found
// Usage: Used in login to find user credentials
const findByEmail = async (email) => {
  // Execute SELECT query to find user by email (UNIQUE constraint)
  const results = await query(
    // SQL prepared statement with ? placeholder for parameterized query
    'SELECT * FROM users WHERE email = ?',
    // Parameter array: [email] - prevents SQL injection
    [email]
  );
  // Return first user if found, otherwise return null
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// FIND USER BY ID
// ============================================================================
// Function: findById(id)
// Purpose: Retrieve user record by primary key
// Parameters: id (number) - user's ID
// Returns: Promise<object|null> - user object or null if not found
// Usage: Used to fetch user details by ID
const findById = async (id) => {
  // Execute SELECT query to find user by ID (PRIMARY KEY)
  const results = await query(
    // SQL prepared statement with ? placeholder
    'SELECT * FROM users WHERE id = ?',
    // Parameter array: [id]
    [id]
  );
  // Return first user if found, otherwise return null
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// CREATE USER (Legacy - with NULL password)
// ============================================================================
// Function: createUser(name, email, role)
// Purpose: Insert new user into database with NULL password (for first-time setup)
// Parameters: 
//   - name (string) - user's full name (max 100 chars)
//   - email (string) - user's email (max 150 chars, UNIQUE constraint)
//   - role (string) - user role: 'admin', 'parent', or 'professional'
// Returns: Promise<number> - new user's ID (insertId)
// Notes: password is intentionally NULL (set later via setUserPassword)
//        is_active defaults to 1 (true)
// Usage: Admin creates new parent accounts for first-time password setup
const createUser = async (name, email, role = 'parent') => {
  // Execute INSERT query to create new user
  const results = await query(
    // SQL prepared statement with ? placeholders for all parameters
    'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, NULL, ?, 1)',
    // Parameter array: [name, email, role]
    // Note: password is NULL, is_active is 1 (hardcoded)
    [name, email, role]
  );
  // Return the auto-generated ID of newly inserted user
  return results.insertId;
};

// ============================================================================
// CREATE USER WITH PASSWORD
// ============================================================================
// Function: createUserWithPassword({ name, email, hashedPassword, role })
// Purpose: Insert new user into database with hashed password (complete account setup)
// Parameters: 
//   - name (string) - user's full name (max 100 chars)
//   - email (string) - user's email (max 150 chars, UNIQUE constraint)
//   - hashedPassword (string) - bcrypt hashed password (already hashed by caller)
//   - role (string) - user role: 'admin', 'parent', or 'professional'
// Returns: Promise<object> - newly created user object (WITHOUT password for security)
// Notes: is_active defaults to 1 (true) - user is active immediately
// Usage: Admin creates accounts with password set immediately (professionals, admins)
//        Or user creates account via registration with password
const createUserWithPassword = async ({ name, email, hashedPassword, role }) => {
  try {
    // Execute INSERT query to create new user with hashed password
    const results = await query(
      // SQL prepared statement with ? placeholders for all parameters
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
      // Parameter array: [name, email, hashedPassword, role]
      // Note: is_active is 1 (user is active by default)
      [name, email, hashedPassword, role]
    );

    // Get the auto-generated user ID
    const userId = results.insertId;

    // Return newly created user object WITHOUT password for security
    // Never return password hash to client
    return {
      id: userId,
      name,
      email,
      role,
      is_active: 1,
    };
  } catch (error) {
    console.error('[user.model] Error in createUserWithPassword:', error);
    throw error;
  }
};

// ============================================================================
// SET USER PASSWORD
// ============================================================================
// Function: setUserPassword(id, hashedPassword)
// Purpose: Update user password (hashed with bcrypt)
// Parameters:
//   - id (number) - user's ID
//   - hashedPassword (string) - bcrypt hashed password (already hashed by caller)
// Returns: Promise<boolean> - true if update successful, false if no rows affected
// Usage: Called after bcrypt hashing in auth controller during first login
const setUserPassword = async (id, hashedPassword) => {
  // Execute UPDATE query to set hashed password
  const results = await query(
    // SQL prepared statement updating password column
    'UPDATE users SET password = ? WHERE id = ?',
    // Parameter array: [hashedPassword, id]
    [hashedPassword, id]
  );
  // Return true if at least one row was updated, false otherwise
  return results.affectedRows > 0;
};

// ============================================================================
// UPDATE USER
// ============================================================================
// Function: updateUser(id, data)
// Purpose: Update user information (name, email, or other fields)
// Parameters:
//   - id (number) - user's ID
//   - data (object) - keys are column names, values are new data
//     Example: { name: 'New Name', email: 'newemail@example.com' }
// Returns: Promise<boolean> - true if update successful, false if no rows affected
// Usage: Update user profile, email, or other details
const updateUser = async (id, data) => {
  // Build SET clause dynamically from data object keys
  // Example: { name: 'John', email: 'john@example.com' } → "name = ?, email = ?"
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  
  // Build values array from data object values in same order as fields
  const values = Object.values(data);
  
  // Add user ID as last parameter for WHERE clause
  values.push(id);
  
  // Execute UPDATE query with dynamic SET clause
  const results = await query(
    // SQL prepared statement with dynamic field updates
    `UPDATE users SET ${fields} WHERE id = ?`,
    // Parameter array: [...values from data, id]
    values
  );
  
  // Return true if at least one row was updated, false otherwise
  return results.affectedRows > 0;
};

// ============================================================================
// GET ALL USERS
// ============================================================================
// Function: getAllUsers(filters = {})
// Purpose: Retrieve all users from database with optional filters
// Parameters:
//   - filters (object) - optional filters for role and is_active
//     Example: { role: 'admin', is_active: true }
// Returns: Promise<array> - array of user objects
// Usage: Admin dashboard, user management, statistics
const getAllUsers = async (filters = {}) => {
  let sql = 'SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1';
  const params = [];

  if (filters.role) {
    sql += ' AND role = ?';
    params.push(filters.role);
  }

  if (filters.is_active !== undefined) {
    sql += ' AND is_active = ?';
    params.push(filters.is_active);
  }

  sql += ' ORDER BY created_at DESC';
  return await query(sql, params);
};

// ============================================================================
// SET ACTIVE STATUS
// ============================================================================
// Function: setActiveStatus(id, is_active)
// Purpose: Activate or deactivate user account
// Parameters:
//   - id (number) - user's ID
//   - is_active (boolean) - true to activate, false to deactivate
// Returns: Promise<boolean> - true if update successful, false if no rows affected
// Usage: Admin can disable/enable user accounts
const setActiveStatus = async (id, is_active) => {
  // Execute UPDATE query to set is_active flag
  const results = await query(
    // SQL prepared statement updating is_active column
    // Note: Convert boolean to 1/0 for MySQL TINYINT(1)
    'UPDATE users SET is_active = ? WHERE id = ?',
    // Parameter array: [1 or 0 (converted from boolean), id]
    [is_active ? 1 : 0, id]
  );
  // Return true if at least one row was updated, false otherwise
  return results.affectedRows > 0;
};

// ============================================================================
// DELETE USER (SOFT DELETE)
// ============================================================================
// Function: deleteUser(id)
// Purpose: Soft delete user by setting is_active = 0
// Parameters:
//   - id (number) - user's ID
// Returns: Promise<boolean> - true if update successful
// Usage: Deactivate user account (data remains but account is inactive)
const deleteUser = async (id) => {
  // Execute UPDATE query to set is_active = 0 (soft delete)
  const results = await query(
    // SQL prepared statement setting is_active to 0
    'UPDATE users SET is_active = 0 WHERE id = ?',
    // Parameter array: [id]
    [id]
  );
  // Return true if at least one row was updated, false otherwise
  return results.affectedRows > 0;
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export all user model functions
module.exports = {
  // Find user by email (used in login)
  findByEmail,
  // Find user by ID
  findById,
  // Create new user with NULL password (legacy, for first-time setup)
  createUser,
  // Create new user with hashed password (for complete account creation)
  createUserWithPassword,
  // Set/update user password
  setUserPassword,
  // Update user data
  updateUser,
  // Get all users
  getAllUsers,
  // Enable/disable user account
  setActiveStatus,
  // Delete user (soft delete)
  deleteUser,
};
