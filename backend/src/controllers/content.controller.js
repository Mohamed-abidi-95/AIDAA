// ============================================================================
// CONTENT CONTROLLER
// ============================================================================
// Handles educational content management

const contentModel = require('../models/content.model');

// ============================================================================
// Get all content with optional filters
// ============================================================================
// GET /content
// Query params: type, category, age_group, level
const getAll = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      age_group: req.query.age_group,
      level: req.query.level,
      participant_category: req.query.participant_category,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    let content = await contentModel.getAll(filters);

    // Format content based on type for new interface
    content = content.map(item => contentModel.formatContent(item));

    res.status(200).json({
      success: true,
      message: 'Content retrieved successfully',
      data: content,
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message,
    });
  }
};

// ============================================================================
// Get content by ID
// ============================================================================
// GET /content/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await contentModel.getById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Content retrieved successfully',
      data: content,
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message,
    });
  }
};

// ============================================================================
// Create new content (admin only)
// ============================================================================
// POST /content
// Body: { title, type, category, age_group, level, url, description }
const create = async (req, res) => {
  try {
    const { title, type, category, age_group, level, url, description } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required',
      });
    }

    // Validate type enum
    if (!['video', 'activity'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "video" or "activity"',
      });
    }

    const contentId = await contentModel.create(
      title,
      type,
      category,
      age_group,
      level,
      url,
      description
    );

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: {
        id: contentId,
        title,
        type,
        category,
        age_group,
        level,
        url,
        description,
      },
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message,
    });
  }
};

// ============================================================================
// Update content (admin only)
// ============================================================================
// PUT /content/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
      participant_category,
    } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required',
      });
    }

    // Check if content exists
    const content = await contentModel.getById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    await contentModel.updateWithAllFields(
      id,
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
      participant_category || content.participant_category || 'enfant'
    );

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: {
        id,
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
        participant_category: participant_category || content.participant_category || 'enfant',
      },
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message,
    });
  }
};

// ============================================================================
// Delete content (admin only)
// ============================================================================
// DELETE /content/:id
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if content exists
    const content = await contentModel.getById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    await contentModel.deleteContent(id);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message,
    });
  }
};
// ============================================================================
// UPLOAD CONTENT FILE (VIDEO, AUDIO, IMAGE)
// ============================================================================
// POST /content/upload
// Admin only - Upload media file for content
const uploadContent = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const {
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
      participant_category,
    } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required',
      });
    }

    // Validate type enum
    if (!['video', 'activity', 'audio'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be "video", "audio", or "activity"',
      });
    }

    // Build file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create content with all fields including new ones
    const contentId = await contentModel.createWithAllFields(
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
      fileUrl,
      description,
      participant_category || 'enfant'
    );

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: {
        id: contentId,
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
        url: fileUrl,
        description,
        participant_category: participant_category || 'enfant',
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Upload content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload content',
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteContent,
  uploadContent,
};
