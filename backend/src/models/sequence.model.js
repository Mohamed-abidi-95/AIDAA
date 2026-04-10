// ============================================================================
// SEQUENCE MODEL — Module B: Séquences guidées
// ============================================================================

const { query } = require('../config/db');

// Get all sequences, optionally filtered by participant_category
const getAll = async (category = null) => {
  let sql = 'SELECT * FROM guided_sequences WHERE 1=1';
  const params = [];
  if (category) {
    sql += ' AND (participant_category = ? OR participant_category = "tous")';
    params.push(category);
  }
  sql += ' ORDER BY created_at DESC';
  return await query(sql, params);
};

// Get one sequence by id
const getById = async (id) => {
  const results = await query('SELECT * FROM guided_sequences WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
};

// Get all steps for a sequence
const getSteps = async (sequenceId) => {
  return await query(
    'SELECT * FROM sequence_steps WHERE sequence_id = ? ORDER BY step_number ASC',
    [sequenceId]
  );
};

module.exports = { getAll, getById, getSteps };

