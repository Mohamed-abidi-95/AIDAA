// ============================================================================
// MESSAGE ROUTES
// ============================================================================
// Routes for messaging between parents and professionals

const express = require('express');
const messageController = require('../controllers/message.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

// ============================================================================
// All message routes require authentication
// ============================================================================
router.use(auth);

// ============================================================================
// GET /message/unread-count
// ============================================================================
// Get count of unread messages for the authenticated user
router.get('/unread-count', messageController.getUnreadCount);

// ============================================================================
// GET /message/child/:childId
// ============================================================================
// Get all messages for a child (parent can only see their own children)
router.get('/child/:childId', messageController.getByChildId);

// ============================================================================
// GET /message/conversation/:childId/:otherUserId
// ============================================================================
// Get conversation between current user and another user for a child
router.get('/conversation/:childId/:otherUserId', messageController.getConversation);

// ============================================================================
// POST /message
// ============================================================================
// Send a new message
// Body: { childId, receiverId, content }
router.post('/', messageController.create);

// ============================================================================
// PUT /message/:id
// ============================================================================
// Update message (sender only)
router.put('/:id', messageController.updateMessage);

// ============================================================================
// DELETE /message/:id
// ============================================================================
// Delete message (sender or admin)
router.delete('/:id', messageController.deleteMessage);

module.exports = router;

