// ============================================================================
// MESSAGE CONTROLLER
// ============================================================================
// Handles messaging between parents and professionals

const messageModel = require('../models/message.model');
const childModel   = require('../models/child.model');
const { query }    = require('../config/db');

// Helper: verify professional ↔ parent link
const verifyLink = async (professionalId, parentId) => {
  const rows = await query(
    `SELECT 1 FROM professional_invitations
     WHERE professional_id = ? AND parent_id = ? AND status != 'revoked'`,
    [professionalId, parentId]
  );
  return rows.length > 0;
};

// ============================================================================
// GET MESSAGES FOR A CHILD (PARENT/DOCTOR CONVERSATION)
// ============================================================================
// GET /message/child/:childId
const getByChildId = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    const child = await childModel.getById(childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    // Parent: must own child
    if (req.user.role === 'parent' && child.parent_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Professional: must be linked to child's parent 🔒
    if (req.user.role === 'professional') {
      const linked = await verifyLink(userId, child.parent_id);
      if (!linked) return res.status(403).json({ success: false, message: 'Accès refusé: vous n\'êtes pas lié au parent de cet enfant' });
    }

    const messages = await messageModel.getByChildId(childId, userId);
    res.status(200).json({ success: true, message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to get messages', error: error.message });
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

    const child = await childModel.getById(childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    // Parent: must own child
    if (req.user.role === 'parent' && child.parent_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Professional: must be linked to child's parent 🔒
    if (req.user.role === 'professional') {
      const linked = await verifyLink(userId, child.parent_id);
      if (!linked) return res.status(403).json({ success: false, message: 'Accès refusé: vous n\'êtes pas lié au parent de cet enfant' });
    }

    const messages = await messageModel.getConversation(childId, userId, parseInt(otherUserId));
    res.status(200).json({ success: true, message: 'Conversation retrieved successfully', data: messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversation', error: error.message });
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

    if (!childId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: 'childId, receiverId, and content are required' });
    }

    const child = await childModel.getById(childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    // Parent: must own child AND receiver must be their linked professional 🔒
    if (req.user.role === 'parent') {
      if (child.parent_id !== senderId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const linked = await verifyLink(parseInt(receiverId), senderId);
      if (!linked) {
        return res.status(403).json({ success: false, message: 'Destinataire non autorisé: ce professionnel n\'est pas lié à votre compte' });
      }
    }

    // Professional: must be linked to child's parent AND receiver must be that parent 🔒
    if (req.user.role === 'professional') {
      if (parseInt(receiverId) !== child.parent_id) {
        return res.status(403).json({ success: false, message: 'Destinataire invalide: le message doit être adressé au parent de cet enfant' });
      }
      const linked = await verifyLink(senderId, child.parent_id);
      if (!linked) {
        return res.status(403).json({ success: false, message: 'Accès refusé: ce parent ne fait pas partie de vos patients' });
      }
    }

    const messageId = await messageModel.create(childId, senderId, receiverId, content);
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { id: messageId, child_id: childId, sender_id: senderId, receiver_id: receiverId, content },
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// ============================================================================
// GET UNREAD MESSAGE COUNT
// ============================================================================
// GET /message/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const rows = await query(
      'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.status(200).json({ success: true, data: { count: Number(rows[0].count) } });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
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

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const message = await messageModel.getById(id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.sender_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await messageModel.update(id, content);
    res.status(200).json({ success: true, message: 'Message updated successfully', data: { id, content } });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ success: false, message: 'Failed to update message', error: error.message });
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

    const message = await messageModel.getById(id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.sender_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await messageModel.deleteMessage(id);
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message', error: error.message });
  }
};

module.exports = {
  getByChildId,
  getConversation,
  create,
  getUnreadCount,
  updateMessage,
  deleteMessage,
};
