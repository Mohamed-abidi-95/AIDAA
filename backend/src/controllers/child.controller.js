// ============================================================================
// CHILD CONTROLLER
// ============================================================================
// Handles child management operations

const childModel = require('../models/child.model');
const { query }  = require('../config/db');

// ============================================================================
// Get all children for authenticated parent
// ============================================================================
// GET /child/mychildren
const getMyChildren = async (req, res) => {
  try {
    const parentId = req.user.id;

    const children = await childModel.getByParentId(parentId);

    res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      data: children,
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get children',
      error: error.message,
    });
  }
};

// ============================================================================
// Get all children (professional/admin)
// ============================================================================
// GET /child/all
// 🔒 Professionals: only children whose parent is linked via professional_invitations
// 🔒 Admin: all children
const getAllChildren = async (req, res) => {
  try {
    if (req.user.role === 'professional') {
      // Restrict to children of parents linked to this professional
      const children = await query(
        `SELECT c.* FROM children c
         JOIN professional_invitations pi ON pi.parent_id = c.parent_id
         WHERE pi.professional_id = ? AND pi.status != 'revoked'
         ORDER BY c.name ASC`,
        [req.user.id]
      );
      return res.status(200).json({
        success: true,
        message: 'Children retrieved successfully',
        data: children,
      });
    }

    // Admin: return all children
    const children = await childModel.getAll();

    res.status(200).json({
      success: true,
      message: 'All children retrieved successfully',
      data: children,
    });
  } catch (error) {
    console.error('Get all children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get children',
      error: error.message,
    });
  }
};

// ============================================================================
// Get child by ID
// ============================================================================
// GET /child/:id
const getChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await childModel.getById(id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check if parent owns this child
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Child retrieved successfully',
      data: child,
    });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child',
      error: error.message,
    });
  }
};

// ============================================================================
// Create new child
// ============================================================================
// POST /child
// Body: { name, age }
const createChild = async (req, res) => {
  try {
    const { name, age, participantCategory, participant_category } = req.body;
    const category = participantCategory || participant_category || 'enfant';
    const parentId = req.user.id;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Child name is required',
      });
    }

    if (!['adulte', 'jeune', 'enfant'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant category',
      });
    }

    const childId = await childModel.create(parentId, name, age, category);

    res.status(201).json({
      success: true,
      message: 'Child created successfully',
      data: { id: childId, parent_id: parentId, name, age, participant_category: category },
    });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create child',
      error: error.message,
    });
  }
};

// ============================================================================
// Update child information
// ============================================================================
// PUT /child/:id
// Body: { name, age }
const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, participantCategory, participant_category } = req.body;
    const category = participantCategory || participant_category || 'enfant';

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Child name is required',
      });
    }

    if (!['adulte', 'jeune', 'enfant'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant category',
      });
    }

    // Verify child exists and parent owns it
    const child = await childModel.getById(id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    if (child.parent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await childModel.update(id, name, age, category);

    res.status(200).json({
      success: true,
      message: 'Child updated successfully',
      data: { id, parent_id: child.parent_id, name, age, participant_category: category },
    });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update child',
      error: error.message,
    });
  }
};

// ============================================================================
// Delete child
// ============================================================================
// DELETE /child/:id
const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify child exists and parent owns it
    const child = await childModel.getById(id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    if (child.parent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await childModel.deleteChild(id);

    res.status(200).json({
      success: true,
      message: 'Child deleted successfully',
    });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete child',
      error: error.message,
    });
  }
};

module.exports = {
  getMyChildren,
  getAllChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
};
