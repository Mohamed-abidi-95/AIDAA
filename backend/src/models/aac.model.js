// ============================================================================
// AAC MODEL — Module C: Communication alternative
// ============================================================================

const { query } = require('../config/db');

// Get all AAC symbols, with optional filters
const getAllSymbols = async (category = null, participantCategory = null) => {
  let sql = 'SELECT * FROM aac_symbols WHERE 1=1';
  const params = [];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (participantCategory) {
    sql += ' AND (participant_category = ? OR participant_category = "tous")';
    params.push(participantCategory);
  }
  sql += ' ORDER BY sort_order ASC, label ASC';
  return await query(sql, params);
};

// Get distinct symbol categories
const getCategories = async () => {
  return await query('SELECT DISTINCT category FROM aac_symbols ORDER BY category ASC', []);
};

module.exports = { getAllSymbols, getCategories };

