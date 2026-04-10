// ============================================================================
// AAC CONTROLLER — Module C: Communication alternative
// ============================================================================

const aacModel = require('../models/aac.model');

// GET /api/aac/symbols?category=Besoins&participant_category=enfant
const getSymbols = async (req, res) => {
  try {
    const { category, participant_category } = req.query;
    const symbols = await aacModel.getAllSymbols(category || null, participant_category || null);
    res.json({ success: true, data: symbols });
  } catch (error) {
    console.error('getSymbols error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/aac/categories
const getCategories = async (req, res) => {
  try {
    const rows = await aacModel.getCategories();
    const categories = rows.map((r) => r.category);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSymbols, getCategories };

