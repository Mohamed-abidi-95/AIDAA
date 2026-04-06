// ============================================================================
// ACTIVITY LOG CONTROLLER
// ============================================================================
// Handles activity tracking and progress logging

const activityLogModel = require('../models/activityLog.model');
const childModel = require('../models/child.model');

// ============================================================================
// Get activity logs for a child
// ============================================================================
// GET /activity-log/child/:childId
const getByChildId = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child exists and parent owns it
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check if parent owns this child (or user is professional/admin)
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const logs = await activityLogModel.getByChildId(childId);

    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: logs,
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity logs',
      error: error.message,
    });
  }
};

// ============================================================================
// Create new activity log
// ============================================================================
// POST /activity-log
// Body: { childId, contentId, status?, score?, duration_seconds?, action? }
const create = async (req, res) => {
  try {
    const {
      childId,
      contentId,
      status = 'started',
      score = 0,
      duration_seconds = 0,
      action,
    } = req.body;

    // Validate input
    if (!childId || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'childId and contentId are required',
      });
    }

    // Verify child exists and parent owns it
    const child = await childModel.getById(childId);
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

    // Validate status
    if (!['started', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "started" or "completed"',
      });
    }

    const resolvedAction = action || (status === 'completed' ? 'activity_completed' : 'activity_started');
    const logId = await activityLogModel.create(childId, contentId, score, duration_seconds, resolvedAction);

    // Keep status consistent when caller explicitly completes in one call
    if (status === 'completed') {
      await activityLogModel.updateStatus(logId, 'completed');
    }

    res.status(201).json({
      success: true,
      message: 'Activity log created successfully',
      data: {
        id: logId,
        child_id: childId,
        content_id: contentId,
        status,
        score,
        duration_seconds,
        action: resolvedAction,
      },
    });
  } catch (error) {
    console.error('Create activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity log',
      error: error.message,
    });
  }
};

// ============================================================================
// Update activity log status
// ============================================================================
// PUT /activity-log/:id
// Body: { status }
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['started', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (started or completed)',
      });
    }

    // Verify log exists
    const log = await activityLogModel.getById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found',
      });
    }

    // Verify permissions
    const child = await childModel.getById(log.child_id);
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await activityLogModel.updateStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Activity log status updated successfully',
      data: { id, status },
    });
  } catch (error) {
    console.error('Update activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity log',
      error: error.message,
    });
  }
};

// ============================================================================
// DELETE ACTIVITY LOG (ADMIN ONLY)
// ============================================================================
// DELETE /api/activity-log/:id
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    // Get activity log
    const log = await activityLogModel.getById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found',
      });
    }

    // Delete activity log
    await activityLogModel.deleteLog(id);

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity log',
      error: error.message,
    });
  }
};

module.exports = {
  getByChildId,
  create,
  updateStatus,
  deleteLog,
};
