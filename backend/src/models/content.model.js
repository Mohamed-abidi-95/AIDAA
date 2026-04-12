// ============================================================================
// CONTENT MODEL
// ============================================================================
// Plain async functions for content database operations

const { query } = require('../config/db');

// ============================================================================
// Get all content with optional filters
// ============================================================================
const getAll = async (filters = {}) => {
  let sql = 'SELECT * FROM content WHERE 1=1';
  const params = [];

  // Filter by type (video or activity)
  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  // Filter by category
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  // Filter by age group
  if (filters.age_group) {
    sql += ' AND age_group = ?';
    params.push(filters.age_group);
  }

  // Filter by level
  if (filters.level) {
    sql += ' AND level = ?';
    params.push(filters.level);
  }

  // Filter by participant_category (show exact match OR 'tous')
  if (filters.participant_category) {
    sql += ' AND (participant_category = ? OR participant_category = "tous")';
    params.push(filters.participant_category);
  }

  sql += ' ORDER BY created_at DESC';

  return await query(sql, params);
};

// ============================================================================
// Get content by ID
// ============================================================================
const getById = async (contentId) => {
  const results = await query(
    'SELECT * FROM content WHERE id = ?',
    [contentId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Create new content
// ============================================================================
const create = async (title, type, category, age_group, level, url, description) => {
  const results = await query(
    'INSERT INTO content (title, type, category, age_group, level, url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, type, category, age_group, level, url, description]
  );
  return results.insertId;
};

// ============================================================================
// Create new content with ALL fields (including new ones)
// ============================================================================
const createWithAllFields = async (
  title,
  type,
  category,
  category_color,
  emoji,
  duration,
  steps,
  minutes,
  emoji_color,
  age_group,
  level,
  url,
  description,
  participant_category = 'enfant'
) => {
  const results = await query(
    `INSERT INTO content (
      title, type, category, category_color, emoji, duration,
      steps, minutes, emoji_color, age_group, level, url, description, participant_category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      type,
      category,
      category_color || '#f97316',
      emoji || '',
      duration || null,
      steps || null,
      minutes || null,
      emoji_color || null,
      age_group || '4-6',
      level || 1,
      url,
      description || '',
      ['enfant', 'jeune', 'adulte'].includes(participant_category) ? participant_category : 'enfant',
    ]
  );
  return results.insertId;
};

// ============================================================================
// Update content
// ============================================================================
const update = async (contentId, title, type, category, age_group, level, url, description) => {
  const results = await query(
    'UPDATE content SET title = ?, type = ?, category = ?, age_group = ?, level = ?, url = ?, description = ? WHERE id = ?',
    [title, type, category, age_group, level, url, description, contentId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Update content with ALL fields (including new ones)
// ============================================================================
const updateWithAllFields = async (
  contentId,
  title,
  type,
  category,
  category_color,
  emoji,
  duration,
  steps,
  minutes,
  emoji_color,
  age_group,
  level,
  description,
  participant_category = 'enfant'
) => {
  const results = await query(
    `UPDATE content SET
      title = ?, type = ?, category = ?, category_color = ?, emoji = ?,
      duration = ?, steps = ?, minutes = ?, emoji_color = ?,
      age_group = ?, level = ?, description = ?, participant_category = ?
    WHERE id = ?`,
    [
      title,
      type,
      category,
      category_color || '#f97316',
      emoji || '',
      duration || null,
      steps || null,
      minutes || null,
      emoji_color || null,
      age_group || '4-6',
      level || 1,
      description || '',
      ['enfant', 'jeune', 'adulte'].includes(participant_category) ? participant_category : 'enfant',
      contentId,
    ]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete content
// ============================================================================
const deleteContent = async (contentId) => {
  const results = await query(
    'DELETE FROM content WHERE id = ?',
    [contentId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// FORMAT CONTENT RESPONSE
// ============================================================================
// Format content data based on type for the new interface
const formatContent = (content) => {
  if (!content) return null;

  if (content.type === 'video') {
    return {
      id: content.id,
      emoji: content.emoji || '📹',
      title: content.title,
      category: content.category || 'Général',
      categoryColor: content.category_color || '#f97316',
      duration: content.duration || '5 min',
      url: content.url,
      description: content.description,
      type: content.type,
    };
  } else if (content.type === 'activity') {
    return {
      id: content.id,
      emoji: content.emoji || '🎯',
      emojiColor: content.emoji_color || '#d1fae5',
      title: content.title,
      steps: content.steps || 5,
      minutes: content.minutes || 15,
      url: content.url,
      description: content.description,
      type: content.type,
    };
  } else if (content.type === 'audio') {
    return {
      id: content.id,
      emoji: content.emoji || '🎵',
      title: content.title,
      category: content.category || 'Général',
      url: content.url,
      description: content.description,
      type: content.type,
    };
  }

  return content;
};

module.exports = {
  getAll,
  getById,
  create,
  createWithAllFields,
  update,
  updateWithAllFields,
  deleteContent,
  formatContent,
};
