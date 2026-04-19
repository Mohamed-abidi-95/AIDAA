// ============================================================================
// TELECONSULTATION MODEL
// ============================================================================
// Plain async functions for teleconsultation database operations

const { query } = require('../config/db');
const crypto = require('crypto');

// Génère un room_id unique et court pour Jitsi
const generateRoomId = () => {
  const uuid = crypto.randomBytes(8).toString('hex');
  return `aidaa-${uuid}`;
};

// ============================================================================
// Get all teleconsultations for a user (parent or professional)
// ============================================================================
const getByUserId = async (userId, userRole, statusFilter = null) => {
  let sql;
  let params = [userId];

  if (userRole === 'parent') {
    sql = `SELECT t.*, u.name as professional_name, u.email as professional_email
           FROM teleconsultations t
           JOIN users u ON t.professional_id = u.id
           WHERE t.parent_id = ?`;
  } else if (userRole === 'professional') {
    sql = `SELECT t.*, u.name as parent_name, u.email as parent_email
           FROM teleconsultations t
           JOIN users u ON t.parent_id = u.id
           WHERE t.professional_id = ?`;
  } else {
    return [];
  }

  if (statusFilter) {
    sql += ` AND t.status = ?`;
    params.push(statusFilter);
  }

  sql += ` ORDER BY t.date_time DESC`;
  return await query(sql, params);
};

// ============================================================================
// Create new teleconsultation with auto-generated room_id
// ============================================================================
const create = async (parentId, professionalId, date_time, meeting_link = null, notes = null) => {
  const roomId = generateRoomId();
  const jitsiLink = meeting_link || `https://meet.jit.si/${roomId}`;

  const results = await query(
    `INSERT INTO teleconsultations (parent_id, professional_id, date_time, meeting_link, notes, room_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
    [parentId, professionalId, date_time, jitsiLink, notes, roomId]
  );
  return { insertId: results.insertId, roomId, jitsiLink };
};

// ============================================================================
// Get teleconsultation by ID
// ============================================================================
const getById = async (consultationId) => {
  const results = await query(
    `SELECT t.*, p.name as parent_name, p.email as parent_email,
            pr.name as professional_name, pr.email as professional_email
     FROM teleconsultations t
     JOIN users p ON t.parent_id = p.id
     JOIN users pr ON t.professional_id = pr.id
     WHERE t.id = ?`,
    [consultationId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Get teleconsultation by room_id
// ============================================================================
const getByRoomId = async (roomId) => {
  const results = await query(
    `SELECT t.*, p.name as parent_name, p.email as parent_email,
            pr.name as professional_name, pr.email as professional_email
     FROM teleconsultations t
     JOIN users p ON t.parent_id = p.id
     JOIN users pr ON t.professional_id = pr.id
     WHERE t.room_id = ? LIMIT 1`,
    [roomId]
  );
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// Update status
// ============================================================================
const updateStatus = async (consultationId, newStatus) => {
  const valid = ['scheduled', 'in_progress', 'completed', 'cancelled'];
  if (!valid.includes(newStatus)) throw new Error(`Statut invalide: ${newStatus}`);
  const results = await query(
    'UPDATE teleconsultations SET status = ? WHERE id = ?',
    [newStatus, consultationId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Update teleconsultation fields
// ============================================================================
const update = async (consultationId, date_time, meeting_link, notes) => {
  const results = await query(
    'UPDATE teleconsultations SET date_time = ?, meeting_link = ?, notes = ? WHERE id = ?',
    [date_time, meeting_link, notes, consultationId]
  );
  return results.affectedRows > 0;
};

// ============================================================================
// Delete teleconsultation
// ============================================================================
const deleteConsultation = async (consultationId) => {
  const results = await query(
    'DELETE FROM teleconsultations WHERE id = ?',
    [consultationId]
  );
  return results.affectedRows > 0;
};

module.exports = {
  generateRoomId,
  getByUserId,
  create,
  getById,
  getByRoomId,
  updateStatus,
  update,
  deleteConsultation,
};
