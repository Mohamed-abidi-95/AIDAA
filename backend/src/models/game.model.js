// ============================================================================
// GAME MODEL
// ============================================================================
// Database operations for games management

const { query } = require('../config/db');

// ============================================================================
// GET ALL GAMES
// ============================================================================
const getAll = async () => {
  return await query(
    'SELECT * FROM games ORDER BY created_at DESC'
  );
};

// ============================================================================
// GET GAME BY ID
// ============================================================================
const getById = async (gameId) => {
  const results = await query(
    'SELECT * FROM games WHERE id = ?',
    [gameId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET GAMES BY TYPE
// ============================================================================
const getByType = async (type) => {
  return await query(
    'SELECT * FROM games WHERE type = ? ORDER BY created_at DESC',
    [type]
  );
};

// ============================================================================
// CREATE GAME
// ============================================================================
const create = async (title, description, type, thumbnailUrl, instructions) => {
  const results = await query(
    'INSERT INTO games (title, description, type, thumbnail_url, instructions) VALUES (?, ?, ?, ?, ?)',
    [title, description, type, thumbnailUrl, instructions]
  );
  return results.insertId;
};

// ============================================================================
// UPDATE GAME
// ============================================================================
const update = async (gameId, title, description, type, thumbnailUrl, instructions) => {
  const results = await query(
    'UPDATE games SET title = ?, description = ?, type = ?, thumbnail_url = ?, instructions = ? WHERE id = ?',
    [title, description, type, thumbnailUrl, instructions, gameId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// DELETE GAME
// ============================================================================
const deleteGame = async (gameId) => {
  const results = await query(
    'DELETE FROM games WHERE id = ?',
    [gameId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByType,
  create,
  update,
  deleteGame,
};

