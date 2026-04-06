// ============================================================================
// MESSAGE MODEL
// ============================================================================
// Plain async functions for message database operations

const { query } = require('../config/db');

// ============================================================================
// GET ALL MESSAGES FOR A CONVERSATION
// ============================================================================
// Between parent/doctor and a specific child
const getByChildId = async (childId, userId) => {
  return await query(
    `SELECT m.*, 
            u_sender.name as sender_name, u_sender.role as sender_role,
            u_receiver.name as receiver_name, u_receiver.role as receiver_role
     FROM messages m
     JOIN users u_sender ON m.sender_id = u_sender.id
     JOIN users u_receiver ON m.receiver_id = u_receiver.id
     WHERE m.child_id = ? 
     AND (m.sender_id = ? OR m.receiver_id = ?)
     ORDER BY m.created_at ASC`,
    [childId, userId, userId]
  );
};

// ============================================================================
// GET MESSAGES BETWEEN TWO USERS FOR A CHILD
// ============================================================================
const getConversation = async (childId, userId1, userId2) => {
  return await query(
    `SELECT m.*, 
            u_sender.name as sender_name, u_sender.role as sender_role
     FROM messages m
     JOIN users u_sender ON m.sender_id = u_sender.id
     WHERE m.child_id = ? 
     AND ((m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?))
     ORDER BY m.created_at ASC`,
    [childId, userId1, userId2, userId2, userId1]
  );
};

// ============================================================================
// CREATE NEW MESSAGE
// ============================================================================
const create = async (childId, senderId, receiverId, content) => {
  const results = await query(
    'INSERT INTO messages (child_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
    [childId, senderId, receiverId, content]
  );
  return results.insertId;
};

// ============================================================================
// GET MESSAGE BY ID
// ============================================================================
const getById = async (messageId) => {
  const results = await query(
    'SELECT * FROM messages WHERE id = ?',
    [messageId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// UPDATE MESSAGE
// ============================================================================
const update = async (messageId, content) => {
  const results = await query(
    'UPDATE messages SET content = ? WHERE id = ?',
    [content, messageId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// DELETE MESSAGE
// ============================================================================
const deleteMessage = async (messageId) => {
  const results = await query(
    'DELETE FROM messages WHERE id = ?',
    [messageId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  getByChildId,
  getConversation,
  create,
  getById,
  update,
  deleteMessage,
};

