// ============================================================================
// ADMIN CONTROLLER
// ============================================================================
// Handles admin operations: user creation, listing, status management

const bcryptjs = require('bcryptjs');
const userModel = require('../models/user.model');

// ============================================================================
// Create parent user (admin only)
// ============================================================================
// POST /admin/create-parent
// Body: { name, email }
// Note: Password is NULL, parent sets it via setPassword endpoint
const createParent = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create parent with NULL password
    const userId = await userModel.createUser(name, email, 'parent');

    res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: {
        id: userId,
        name,
        email,
        role: 'parent',
        password: null,
      },
    });
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parent',
      error: error.message,
    });
  }
};

// ============================================================================
// Create professional user (admin only)
// ============================================================================
// POST /admin/create-professional
// Body: { name, email, password }
const createProfessional = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create professional with password already set
    const newUser = await userModel.createUserWithPassword({
      name,
      email,
      hashedPassword,
      role: 'professional',
    });

    res.status(201).json({
      success: true,
      message: 'Professional created successfully',
      data: {
        id: newUser.id,
        name,
        email,
        role: 'professional',
      },
    });
  } catch (error) {
    console.error('Create professional error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create professional',
      error: error.message,
    });
  }
};

// ============================================================================
// List all users with optional filters
// ============================================================================
// GET /admin/users
// Query params: role, is_active
const listUsers = async (req, res) => {
  try {
    const filters = {};

    if (req.query.role) {
      filters.role = req.query.role;
    }

    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === 'true' ? 1 : 0;
    }

    const users = await userModel.getAllUsers(filters);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list users',
      error: error.message,
    });
  }
};

// ============================================================================
// Toggle user active/inactive status
// ============================================================================
// PUT /admin/toggle-active/:id
// Body: { is_active }
const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validate input
    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_active is required',
      });
    }

    // Verify user exists
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && !is_active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account',
      });
    }

    await userModel.setActiveStatus(id, is_active);

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id,
        is_active,
      },
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message,
    });
  }
};

// ============================================================================
// Get dashboard statistics (admin only)
// ============================================================================
// GET /admin/stats
const getStats = async (req, res) => {
  try {
    const allUsers = await userModel.getAllUsers();
    const parents = allUsers.filter((u) => u.role === 'parent');
    const professionals = allUsers.filter((u) => u.role === 'professional');
    const admins = allUsers.filter((u) => u.role === 'admin');

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        total_users: allUsers.length,
        total_parents: parents.length,
        total_professionals: professionals.length,
        total_admins: admins.length,
        active_users: allUsers.filter((u) => u.is_active).length,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message,
    });
  }
};

module.exports = {
  createParent,
  createProfessional,
  listUsers,
  toggleUserActive,
  getStats,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  getNotificationCount,
  getAllRelations,
  getAllMessages,
  getAllNotes,
  deleteRelation,
};

// ============================================================================
// GET PENDING REGISTRATIONS
// ============================================================================
// GET /admin/pending-registrations
async function getPendingRegistrations(req, res) {
  try {
    const { query } = require('../config/db');
    const rows = await query(
      "SELECT id, name, email, role, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getPendingRegistrations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending registrations' });
  }
}

// ============================================================================
// APPROVE REGISTRATION
// ============================================================================
// POST /admin/approve-registration/:id
async function approveRegistration(req, res) {
  try {
    const { query } = require('../config/db');
    const { id } = req.params;
    await query("UPDATE users SET status = 'approved', is_active = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: 'Registration approved' });
  } catch (error) {
    console.error('approveRegistration error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve registration' });
  }
}

// ============================================================================
// REJECT REGISTRATION
// ============================================================================
// POST /admin/reject-registration/:id
async function rejectRegistration(req, res) {
  try {
    const { query } = require('../config/db');
    const { id } = req.params;
    await query("UPDATE users SET status = 'rejected', is_active = 0 WHERE id = ?", [id]);
    res.json({ success: true, message: 'Registration rejected' });
  } catch (error) {
    console.error('rejectRegistration error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject registration' });
  }
}

// ============================================================================
// GET NOTIFICATION COUNT (pending registrations count)
// ============================================================================
// GET /admin/notification-count
async function getNotificationCount(req, res) {
  try {
    const { query } = require('../config/db');
    const rows = await query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
    res.json({ success: true, data: { count: rows[0].count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get count' });
  }
}

// ============================================================================
// DELETE RELATION (admin)
// ============================================================================
// DELETE /admin/relations/:id
async function deleteRelation(req, res) {
  try {
    const { query } = require('../config/db');
    const { id } = req.params;
    const rows = await query('SELECT id FROM professional_invitations WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Relation introuvable.' });
    await query('DELETE FROM professional_invitations WHERE id = ?', [id]);
    res.json({ success: true, message: 'Relation supprimée définitivement.' });
  } catch (error) {
    console.error('deleteRelation error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
  }
}
// ============================================================================
// GET /admin/relations
async function getAllRelations(req, res) {
  try {
    const { query } = require('../config/db');
    const rows = await query(
      `SELECT pi.id, pi.status, pi.invited_at,
              p.name   AS parent_name,       p.email  AS parent_email,
              pro.name AS professional_name, pro.email AS professional_email
       FROM professional_invitations pi
       JOIN users p   ON pi.parent_id       = p.id
       JOIN users pro ON pi.professional_id = pro.id
       ORDER BY pi.invited_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getAllRelations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch relations' });
  }
}

// ============================================================================
// GET ALL MESSAGES
// ============================================================================
// GET /admin/messages
async function getAllMessages(req, res) {
  try {
    const { query } = require('../config/db');
    const rows = await query(
      `SELECT m.id, m.content, m.created_at, m.is_read,
              s.name AS sender_name,   s.role AS sender_role,
              r.name AS receiver_name, r.role AS receiver_role,
              c.name AS child_name
       FROM messages m
       JOIN users    s ON m.sender_id   = s.id
       JOIN users    r ON m.receiver_id = r.id
       JOIN children c ON m.child_id    = c.id
       ORDER BY m.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getAllMessages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
}

// ============================================================================
// GET ALL NOTES
// ============================================================================
// GET /admin/notes
async function getAllNotes(req, res) {
  try {
    const { query } = require('../config/db');
    const rows = await query(
      `SELECT n.id, n.content, n.date,
              u.name AS professional_name, u.email AS professional_email,
              c.name AS child_name
       FROM notes n
       JOIN users    u ON n.professional_id = u.id
       JOIN children c ON n.child_id        = c.id
       ORDER BY n.date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getAllNotes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
}

