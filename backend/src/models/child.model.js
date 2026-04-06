// ============================================================================
// CHILD MODEL
// ============================================================================
// Plain async functions for children database operations

const { query } = require('../config/db');

// ============================================================================
// Get all children for a parent
// ============================================================================
const getByParentId = async (parentId) => {
  return await query(
    'SELECT * FROM children WHERE parent_id = ? ORDER BY name ASC',
    [parentId]
  );
};

// ============================================================================
// Get child by ID
// ============================================================================
const getById = async (childId) => {
  const results = await query(
    'SELECT * FROM children WHERE id = ?',
    [childId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Create new child
// ============================================================================
const create = async (parentId, name, age) => {
  const results = await query(
    'INSERT INTO children (parent_id, name, age) VALUES (?, ?, ?)',
    [parentId, name, age]
  );
  return results.insertId;
};

// ============================================================================
// Update child information
// ============================================================================
const update = async (childId, name, age) => {
  const results = await query(
    'UPDATE children SET name = ?, age = ? WHERE id = ?',
    [name, age, childId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete child
// ============================================================================
const deleteChild = async (childId) => {
  const results = await query(
    'DELETE FROM children WHERE id = ?',
    [childId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Get all children
// ============================================================================
const getAll = async () => {
  return await query(
    'SELECT * FROM children ORDER BY name ASC',
    []
  );
};

module.exports = {
  getByParentId,
  getById,
  getAll,
  create,
  update,
  deleteChild,
};
