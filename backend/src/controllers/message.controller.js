// ============================================================================
// MESSAGE CONTROLLER
// ============================================================================
// Handles messaging between parents and professionals

const messageModel = require('../models/message.model');
const childModel = require('../models/child.model');

// ============================================================================
// GET MESSAGES FOR A CHILD (PARENT/DOCTOR CONVERSATION)
// ============================================================================
// GET /message/child/:childId
const getByChildId = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    // Verify child exists
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check permissions: parent owns child or user is professional/admin
    if (child.parent_id !== userId && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const messages = await messageModel.getByChildId(childId, userId);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message,
    });
  }
};

// ============================================================================
// GET CONVERSATION BETWEEN TWO USERS
// ============================================================================
// GET /message/conversation/:childId/:otherUserId
const getConversation = async (req, res) => {
  try {
    const { childId, otherUserId } = req.params;
    const userId = req.user.id;

    // Verify child exists
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check permissions
    if (child.parent_id !== userId && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const messages = await messageModel.getConversation(childId, userId, parseInt(otherUserId));

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message,
    });
  }
};

// ============================================================================
// SEND MESSAGE
// ============================================================================
// POST /message
// Body: { childId, receiverId, content }
const create = async (req, res) => {
  try {
    const { childId, receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!childId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'childId, receiverId, and content are required',
      });
    }

    // Verify child exists
    const child = await childModel.getById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Check permissions: parent owns child or user is professional/admin
    if (child.parent_id !== senderId && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Create message
    const messageId = await messageModel.create(childId, senderId, receiverId, content);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: messageId,
        child_id: childId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      },
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// ============================================================================
// UPDATE MESSAGE
// ============================================================================
// PUT /api/message/:id
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Get message
    const message = await messageModel.getById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check permission (only sender can edit)
    if (message.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update message
    await messageModel.update(id, content);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: {
        id,
        content,
      },
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message,
    });
  }
};

// ============================================================================
// DELETE MESSAGE
// ============================================================================
// DELETE /api/message/:id
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get message
    const message = await messageModel.getById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check permission (only sender or admin can delete)
    if (message.sender_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Delete message
    await messageModel.deleteMessage(id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};

module.exports = {
  getByChildId,
  getConversation,
  create,
  updateMessage,
  deleteMessage,
};

