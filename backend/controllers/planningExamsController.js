const PlanningExams = require('../models/PlanningExams');

// Récupérer le planning des examens
exports.getPlanningExams = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const planning = await PlanningExams.findOne({ filiere, annee });
    
    if (!planning) {
      return res.status(404).json({ message: 'Planning non trouvé' });
    }
    
    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouveau planning
exports.createPlanningExams = async (req, res) => {
  try {
    const planning = new PlanningExams(req.body);
    const savedPlanning = await planning.save();
    res.status(201).json(savedPlanning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un planning
exports.updatePlanningExams = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const planning = await PlanningExams.findOneAndUpdate(
      { filiere, annee },
      req.body,
      { new: true }
    );
    
    if (!planning) {
      return res.status(404).json({ message: 'Planning non trouvé' });
    }
    
    res.json(planning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un planning
exports.deletePlanningExams = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const planning = await PlanningExams.findOneAndDelete({ filiere, annee });
    
    if (!planning) {
      return res.status(404).json({ message: 'Planning non trouvé' });
    }
    
    res.json({ message: 'Planning supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 