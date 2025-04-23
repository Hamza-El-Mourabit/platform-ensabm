const Evenement = require('../models/Evenement');

// @desc    Get evenements by filiere and annee
// @route   GET /api/evenements/:filiere/:annee
// @access  Private
const getEvenements = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const evenements = await Evenement.findOne({ filiere, annee });
    
    if (!evenements) {
      return res.status(404).json({ message: 'Aucun événement trouvé' });
    }
    
    res.json(evenements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update evenements
// @route   PUT /api/evenements/:filiere/:annee
// @access  Private
const updateEvenements = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const evenements = await Evenement.findOneAndUpdate(
      { filiere, annee },
      req.body,
      { new: true }
    );
    
    if (!evenements) {
      return res.status(404).json({ message: 'Aucun événement trouvé' });
    }
    
    res.json(evenements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete evenements
// @route   DELETE /api/evenements/:filiere/:annee
// @access  Private
const deleteEvenements = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const evenements = await Evenement.findOneAndDelete({ filiere, annee });
    
    if (!evenements) {
      return res.status(404).json({ message: 'Aucun événement trouvé' });
    }
    
    res.json({ message: 'Événements supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create evenement
// @route   POST /api/evenements
// @access  Private
const createEvenement = async (req, res) => {
  try {
    const { filiere, annee, evenements } = req.body;
    
    const evenement = new Evenement({
      filiere,
      annee,
      evenements
    });

    await evenement.save();
    res.status(201).json(evenement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvenements,
  updateEvenements,
  deleteEvenements,
  createEvenement
}; 