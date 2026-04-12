// ============================================================================
// TELECONSULTATION CONTROLLER
// ============================================================================
// Handles virtual consultation scheduling and management

const teleconsultModel = require('../models/teleconsult.model');
const userModel        = require('../models/user.model');
const { query }        = require('../config/db');

// ============================================================================
// Get all teleconsultations for authenticated user
// ============================================================================
// GET /teleconsult/my
const getMyConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const consultations = await teleconsultModel.getByUserId(userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: consultations,
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations',
      error: error.message,
    });
  }
};

// ============================================================================
// Get consultation by ID
// ============================================================================
// GET /teleconsult/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await teleconsultModel.getById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Check permissions
    if (
      consultation.parent_id !== req.user.id &&
      consultation.professional_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation retrieved successfully',
      data: consultation,
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation',
      error: error.message,
    });
  }
};

// ============================================================================
// Create new consultation
// ============================================================================
// POST /teleconsult
// Body: { parentId, professionalId, date_time, meeting_link, notes }
// Note: Parent can only create for themselves
const create = async (req, res) => {
  try {
    const { parentId, professionalId, date_time, meeting_link, notes } = req.body;

    // Validate input
    if (!parentId || !professionalId || !date_time) {
      return res.status(400).json({
        success: false,
        message: 'parentId, professionalId, and date_time are required',
      });
    }

    // Verify both users exist
    const parent = await userModel.findById(parentId);
    const professional = await userModel.findById(professionalId);

    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({
        success: false,
        message: 'Parent not found',
      });
    }

    if (!professional || professional.role !== 'professional') {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // Check permissions: parent can only create for themselves
    if (req.user.role === 'parent' && req.user.id !== parentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // 🔒 Verify the professional is linked to the parent via professional_invitations
    if (req.user.role !== 'admin') {
      const linkRows = await query(
        `SELECT 1 FROM professional_invitations
         WHERE parent_id = ? AND professional_id = ? AND status != 'revoked'`,
        [parentId, professionalId]
      );
      if (linkRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Ce professionnel n\'est pas lié à ce parent',
        });
      }
    }

    const consultationId = await teleconsultModel.create(
      parentId,
      professionalId,
      date_time,
      meeting_link,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: {
        id: consultationId,
        parent_id: parentId,
        professional_id: professionalId,
        date_time,
        meeting_link,
        notes,
      },
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation',
      error: error.message,
    });
  }
};

// ============================================================================
// Update consultation
// ============================================================================
// PUT /teleconsult/:id
// Body: { date_time, meeting_link, notes }
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_time, meeting_link, notes } = req.body;

    // Validate input
    if (!date_time) {
      return res.status(400).json({
        success: false,
        message: 'date_time is required',
      });
    }

    // Verify consultation exists
    const consultation = await teleconsultModel.getById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Check permissions
    if (
      consultation.parent_id !== req.user.id &&
      consultation.professional_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await teleconsultModel.update(id, date_time, meeting_link, notes);

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: {
        id,
        date_time,
        meeting_link,
        notes,
      },
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation',
      error: error.message,
    });
  }
};

// ============================================================================
// Delete consultation
// ============================================================================
// DELETE /teleconsult/:id
const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify consultation exists
    const consultation = await teleconsultModel.getById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Check permissions
    if (
      consultation.parent_id !== req.user.id &&
      consultation.professional_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await teleconsultModel.deleteConsultation(id);

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully',
    });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consultation',
      error: error.message,
    });
  }
};

module.exports = {
  getMyConsultations,
  getById,
  create,
  update,
  deleteConsultation,
};
