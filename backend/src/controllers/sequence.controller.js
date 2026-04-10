// ============================================================================
// SEQUENCE CONTROLLER — Module B: Séquences guidées
// ============================================================================

const sequenceModel = require('../models/sequence.model');

// GET /api/sequences?category=enfant
const getAllSequences = async (req, res) => {
  try {
    const category = req.query.category || null;
    const sequences = await sequenceModel.getAll(category);
    res.json({ success: true, data: sequences });
  } catch (error) {
    console.error('getAllSequences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sequences/:id  → returns sequence + steps
const getSequenceWithSteps = async (req, res) => {
  try {
    const { id } = req.params;
    const sequence = await sequenceModel.getById(id);
    if (!sequence) {
      return res.status(404).json({ success: false, message: 'Séquence non trouvée' });
    }
    const steps = await sequenceModel.getSteps(id);
    res.json({ success: true, data: { ...sequence, steps } });
  } catch (error) {
    console.error('getSequenceWithSteps error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSequences, getSequenceWithSteps };

