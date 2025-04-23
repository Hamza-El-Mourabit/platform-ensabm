const Formation = require('../models/Formation');

// Récupérer toutes les formations
exports.getFormations = async (req, res) => {
  try {
    const formations = await Formation.find().sort({ date: -1 }); // Tri par date décroissante
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des formations', error: error.message });
  }
};

// Récupérer les dernières formations (limité à un certain nombre)
exports.getLatestFormations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3; // Par défaut, limite à 3 formations
    const formations = await Formation.find().sort({ date: -1 }).limit(limit);
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des dernières formations', error: error.message });
  }
};

// Créer une nouvelle formation
exports.createFormation = async (req, res) => {
  try {
    const newFormation = new Formation(req.body);
    const savedFormation = await newFormation.save();
    res.status(201).json(savedFormation);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la formation', error: error.message });
  }
};

// Mettre à jour une formation
exports.updateFormation = async (req, res) => {
  try {
    const updatedFormation = await Formation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedFormation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    res.status(200).json(updatedFormation);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la formation', error: error.message });
  }
};

// Supprimer une formation
exports.deleteFormation = async (req, res) => {
  try {
    const deletedFormation = await Formation.findByIdAndDelete(req.params.id);
    
    if (!deletedFormation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    res.status(200).json({ message: 'Formation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la formation', error: error.message });
  }
};
