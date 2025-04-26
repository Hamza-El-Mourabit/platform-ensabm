const PlanningExams = require('../models/PlanningExams');

// Récupérer le planning des examens
exports.getPlanningExams = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    console.log(`Récupération du planning des examens pour ${filiere}/${annee}`);

    // Récupérer l'ID de l'étudiant connecté
    let studentId = null;

    // Vérifier si req.user existe et contient un ID
    if (req.user && req.user.id) {
      studentId = req.user.id.toString();
      console.log(`Étudiant connecté: ${studentId}`);
    } else if (req.student && req.student._id) {
      // Fallback sur req.student si req.user n'existe pas
      studentId = req.student._id.toString();
      console.log(`Étudiant connecté (via req.student): ${studentId}`);
    } else {
      console.log('Aucun étudiant connecté identifié');
    }

    // Normaliser la filière en minuscules
    const filiereNormalisee = filiere.toLowerCase();

    const planning = await PlanningExams.findOne({ filiere: filiereNormalisee, annee });

    if (!planning) {
      console.log(`Aucun planning trouvé pour ${filiereNormalisee}/${annee}`);

      // Créer un planning vide plutôt que de retourner une erreur
      const emptyPlanning = {
        filiere: filiereNormalisee,
        annee,
        examens: []
      };

      console.log('Retour d\'un planning vide');
      return res.json(emptyPlanning);
    }

    console.log(`Planning trouvé pour ${filiereNormalisee}/${annee} avec ${planning.examens.length} examens`);

    // Si nous avons un ID d'étudiant, filtrer les examens
    let filteredExamens = planning.examens;

    if (studentId) {
      // Filtrer les examens pour ne renvoyer que ceux qui concernent l'étudiant connecté
      filteredExamens = planning.examens.filter(exam => {
        // Si l'examen est pour des étudiants spécifiques, vérifier si l'étudiant est dans la liste
        if (exam.pourEtudiantsSpecifiques === true && Array.isArray(exam.etudiants)) {
          console.log(`Examen spécifique trouvé: ${exam.module || exam.titre}, étudiants:`, exam.etudiants);
          const isIncluded = exam.etudiants.includes(studentId);
          console.log(`L'étudiant ${studentId} est-il inclus? ${isIncluded}`);
          return isIncluded;
        }
        // Sinon, l'examen est pour tous les étudiants de cette filière et année
        return true;
      });

      console.log(`Après filtrage: ${filteredExamens.length} examens concernent l'étudiant ${studentId}`);
    } else {
      console.log('Pas de filtrage des examens (aucun étudiant identifié)');
    }

    // Créer une copie du planning avec les examens filtrés
    const filteredPlanning = {
      ...planning.toObject(),
      examens: filteredExamens
    };

    res.json(filteredPlanning);
  } catch (error) {
    console.error('Erreur lors de la récupération du planning des examens:', error);
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