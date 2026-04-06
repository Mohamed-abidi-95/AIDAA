// ============================================================================
// GAME CONTROLLER
// ============================================================================
// Handles game management operations

const gameModel = require('../models/game.model');

// ============================================================================
// GET ALL GAMES
// ============================================================================
// GET /api/games
const getAll = async (req, res) => {
  try {
    const games = await gameModel.getAll();

    res.status(200).json({
      success: true,
      message: 'Games retrieved successfully',
      data: games,
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get games',
      error: error.message,
    });
  }
};

// ============================================================================
// GET GAME BY ID
// ============================================================================
// GET /api/games/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await gameModel.getById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game retrieved successfully',
      data: game,
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game',
      error: error.message,
    });
  }
};

// ============================================================================
// GET GAMES BY TYPE
// ============================================================================
// GET /api/games/type/:type
const getByType = async (req, res) => {
  try {
    const { type } = req.params;

    const games = await gameModel.getByType(type);

    res.status(200).json({
      success: true,
      message: 'Games retrieved successfully',
      data: games,
    });
  } catch (error) {
    console.error('Get games by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get games',
      error: error.message,
    });
  }
};

// ============================================================================
// CREATE GAME (ADMIN ONLY)
// ============================================================================
// POST /api/games
// Body: { title, description, type, thumbnailUrl, instructions }
const create = async (req, res) => {
  try {
    const { title, description, type, thumbnailUrl, instructions } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required',
      });
    }

    // Validate type
    const validTypes = ['color_match', 'memory', 'sound_recognition'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`,
      });
    }

    const gameId = await gameModel.create(
      title,
      description || null,
      type,
      thumbnailUrl || null,
      instructions || null
    );

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: {
        id: gameId,
        title,
        description,
        type,
        thumbnailUrl,
        instructions,
      },
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create game',
      error: error.message,
    });
  }
};

// ============================================================================
// UPDATE GAME (ADMIN ONLY)
// ============================================================================
// PUT /api/games/:id
// Body: { title, description, type, thumbnailUrl, instructions }
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, thumbnailUrl, instructions } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required',
      });
    }

    // Validate type
    const validTypes = ['color_match', 'memory', 'sound_recognition'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Check if game exists
    const game = await gameModel.getById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    await gameModel.update(
      id,
      title,
      description || null,
      type,
      thumbnailUrl || null,
      instructions || null
    );

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      data: {
        id,
        title,
        description,
        type,
        thumbnailUrl,
        instructions,
      },
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update game',
      error: error.message,
    });
  }
};

// ============================================================================
// DELETE GAME (ADMIN ONLY)
// ============================================================================
// DELETE /api/games/:id
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if game exists
    const game = await gameModel.getById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    await gameModel.deleteGame(id);

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game',
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
  getById,
  getByType,
  create,
  update,
  deleteGame,
};

