// ============================================================================
// DATABASE CONFIGURATION - db.js
// ============================================================================
// MySQL2 connection pool with async query helper
// Provides: pool and query(sql, params) async function
// Supports: connection pooling, error handling, environment configuration

// Import mysql2/promise for promise-based connection handling
const mysql = require('mysql2/promise');
// Load environment variables from .env file
require('dotenv').config();

// ============================================================================
// CREATE CONNECTION POOL
// ============================================================================
// Initialize MySQL connection pool with environment variables
// Pool settings: 10 max connections, automatic keep-alive, query queueing
const pool = mysql.createPool({
  // Database host (default: localhost)
  host: process.env.DB_HOST || 'localhost',
  // Database port (default: 3306)
  port: process.env.DB_PORT || 3306,
  // Database user (default: root)
  user: process.env.DB_USER || 'root',
  // Database password (default: empty string)
  password: process.env.DB_PASSWORD || '',
  // Database name (default: aidaa_db)
  database: process.env.DB_DATABASE || 'aidaa_db',
  // Wait for available connection or queue
  waitForConnections: true,
  // Maximum number of concurrent connections
  connectionLimit: 10,
  // Queue limit for waiting connections (0 = unlimited)
  queueLimit: 0,
  // Enable TCP keep-alive to prevent connection timeout
  enableKeepAlive: true,
});

// ============================================================================
// ASYNC QUERY WRAPPER FUNCTION
// ============================================================================
// Executes SQL queries with proper connection pooling and error handling
// Parameters: sql (string), values (array of parameters for prepared statement)
// Returns: Promise that resolves to query results
// Throws: Error object if query fails
const query = async (sql, values = []) => {
  // Try-catch block for error handling
  try {
    // Get connection from pool (waits if none available)
    const connection = await pool.getConnection();
    // Try to execute the query with this connection
    try {
      // Execute prepared statement: [0] = rows, [1] = fields
      const [results] = await connection.execute(sql, values);
      // Return the results array (SELECT returns rows, INSERT returns insertId, etc.)
      return results;
    } finally {
      // Always release connection back to pool for reuse
      connection.release();
    }
  } catch (error) {
    // Log error to console for debugging
    console.error('Database Query Error:', error);
    // Re-throw error for caller to handle
    throw error;
  }
};

// ============================================================================
// EXPORT MODULE
// ============================================================================
// Export pool (for direct access if needed) and query function (primary usage)
module.exports = {
  // MySQL connection pool instance
  pool,
  // Async wrapper function for executing queries
  query,
};
