const Competence = require('../models/Competence');
const Student = require('../models/Student');

// @desc    Obtenir les compétences d'un étudiant
// @route   GET /api/competences
// @access  Private (étudiant)
exports.getCompetences = async (req, res) => {
  try {
    console.log('Récupération des compétences pour l\'étudiant:', req.user.id);
    
    // Rechercher les compétences de l'étudiant connecté
    let competences = await Competence.findOne({ etudiant: req.user.id });
    
    // Si aucun enregistrement n'existe, créer un enregistrement par défaut
    if (!competences) {
      console.log('Aucun enregistrement de compétences trouvé, création d\'un enregistrement par défaut');
      
      // Récupérer les informations de l'étudiant pour définir des valeurs par défaut basées sur sa filière
      const student = await Student.findById(req.user.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }
      
      // Définir des valeurs par défaut en fonction de la filière
      let defaultValues = {
        programmation: 50,
        mathematiques: 50,
        communication: 50,
        travailEquipe: 50,
        resolutionProblemes: 50,
        gestionProjet: 50
      };
      
      // Ajuster les valeurs par défaut en fonction de la filière
      switch(student.filiere.toLowerCase()) {
        case 'iacs':
          defaultValues = {
            programmation: 60,
            mathematiques: 55,
            communication: 50,
            travailEquipe: 50,
            resolutionProblemes: 55,
            gestionProjet: 50
          };
          break;
        case 'aa':
          defaultValues = {
            programmation: 50,
            mathematiques: 60,
            communication: 50,
            travailEquipe: 50,
            resolutionProblemes: 55,
            gestionProjet: 50
          };
          break;
        case 'g2er':
          defaultValues = {
            programmation: 50,
            mathematiques: 55,
            communication: 50,
            travailEquipe: 60,
            resolutionProblemes: 55,
            gestionProjet: 50
          };
          break;
        case 'tdi':
          defaultValues = {
            programmation: 60,
            mathematiques: 50,
            communication: 55,
            travailEquipe: 55,
            resolutionProblemes: 50,
            gestionProjet: 55
          };
          break;
      }
      
      // Créer un nouvel enregistrement de compétences
      competences = new Competence({
        etudiant: req.user.id,
        ...defaultValues
      });
      
      await competences.save();
      console.log('Nouvel enregistrement de compétences créé:', competences);
    }
    
    res.json(competences);
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour les compétences d'un étudiant (admin seulement)
// @route   PUT /api/competences/:id
// @access  Private (admin)
exports.updateCompetences = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Mise à jour des compétences pour l\'étudiant:', id);
    
    // Vérifier si l'étudiant existe
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Extraire les données de compétences de la requête
    const {
      programmation,
      mathematiques,
      communication,
      travailEquipe,
      resolutionProblemes,
      gestionProjet
    } = req.body;
    
    // Valider les données
    const competencesData = {};
    if (programmation !== undefined) competencesData.programmation = Math.min(100, Math.max(0, programmation));
    if (mathematiques !== undefined) competencesData.mathematiques = Math.min(100, Math.max(0, mathematiques));
    if (communication !== undefined) competencesData.communication = Math.min(100, Math.max(0, communication));
    if (travailEquipe !== undefined) competencesData.travailEquipe = Math.min(100, Math.max(0, travailEquipe));
    if (resolutionProblemes !== undefined) competencesData.resolutionProblemes = Math.min(100, Math.max(0, resolutionProblemes));
    if (gestionProjet !== undefined) competencesData.gestionProjet = Math.min(100, Math.max(0, gestionProjet));
    
    // Mettre à jour la date de dernière mise à jour
    competencesData.derniereMiseAJour = Date.now();
    
    // Rechercher et mettre à jour les compétences (ou créer si elles n'existent pas)
    let competences = await Competence.findOneAndUpdate(
      { etudiant: id },
      { $set: competencesData },
      { new: true, upsert: true, runValidators: true }
    );
    
    console.log('Compétences mises à jour:', competences);
    res.json(competences);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des compétences:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les compétences d'un étudiant spécifique (admin seulement)
// @route   GET /api/competences/:id
// @access  Private (admin)
exports.getCompetencesById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Récupération des compétences pour l\'étudiant (par admin):', id);
    
    // Vérifier si l'étudiant existe
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Rechercher les compétences de l'étudiant
    let competences = await Competence.findOne({ etudiant: id });
    
    // Si aucun enregistrement n'existe, renvoyer un objet vide
    if (!competences) {
      return res.json({
        etudiant: id,
        programmation: 0,
        mathematiques: 0,
        communication: 0,
        travailEquipe: 0,
        resolutionProblemes: 0,
        gestionProjet: 0
      });
    }
    
    res.json(competences);
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les compétences de tous les étudiants (admin seulement)
// @route   GET /api/competences/all
// @access  Private (admin)
exports.getAllCompetences = async (req, res) => {
  try {
    console.log('Récupération des compétences de tous les étudiants');
    
    // Récupérer toutes les compétences avec les informations des étudiants
    const competences = await Competence.find().populate('etudiant', 'nom prenom filiere annee');
    
    res.json(competences);
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les compétences:', error);
    res.status(500).json({ message: error.message });
  }
};
