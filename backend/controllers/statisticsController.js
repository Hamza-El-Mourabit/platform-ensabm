const Student = require('../models/Student');
const EmploiDuTemps = require('../models/EmploiDuTemps');
const Projet = require('../models/Projet');
const PlanningExams = require('../models/PlanningExams');
const Evenement = require('../models/Evenement');

// @desc    Obtenir les statistiques générales
// @route   GET /api/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    // Statistiques des étudiants
    const totalEtudiants = await Student.countDocuments();
    
    // Étudiants par filière
    const etudiantsParFiliere = await Student.aggregate([
      { $group: { _id: "$filiere", count: { $sum: 1 } } }
    ]);
    
    // Étudiants par année
    const etudiantsParAnnee = await Student.aggregate([
      { $group: { _id: "$annee", count: { $sum: 1 } } }
    ]);
    
    // Statistiques des emplois du temps
    const totalEmplois = await EmploiDuTemps.countDocuments();
    const emploisPersonnalises = await EmploiDuTemps.countDocuments({ estPersonnalise: true });
    
    // Statistiques des projets
    const projets = await Projet.find();
    let totalProjets = 0;
    let projetsParStatut = {};
    
    projets.forEach(projet => {
      if (projet.projets && Array.isArray(projet.projets)) {
        totalProjets += projet.projets.length;
        
        projet.projets.forEach(p => {
          if (!projetsParStatut[p.statut]) {
            projetsParStatut[p.statut] = 0;
          }
          projetsParStatut[p.statut]++;
        });
      }
    });
    
    // Statistiques des examens
    const planningExams = await PlanningExams.find();
    let totalExamens = 0;
    let prochains = 0;
    let passes = 0;
    
    const today = new Date();
    
    planningExams.forEach(planning => {
      if (planning.examens && Array.isArray(planning.examens)) {
        totalExamens += planning.examens.length;
        
        planning.examens.forEach(examen => {
          const examDate = new Date(examen.date);
          if (examDate > today) {
            prochains++;
          } else {
            passes++;
          }
        });
      }
    });
    
    // Formater les données pour la réponse
    const etudiantsParFiliereFormatted = {};
    etudiantsParFiliere.forEach(item => {
      etudiantsParFiliereFormatted[item._id] = item.count;
    });
    
    const etudiantsParAnneeFormatted = {};
    etudiantsParAnnee.forEach(item => {
      etudiantsParAnneeFormatted[item._id] = item.count;
    });
    
    // Construire l'objet de réponse
    const statistics = {
      etudiants: {
        total: totalEtudiants,
        parFiliere: etudiantsParFiliereFormatted,
        parAnnee: etudiantsParAnneeFormatted
      },
      emplois: {
        total: totalEmplois,
        personnalises: emploisPersonnalises
      },
      projets: {
        total: totalProjets,
        parStatut: projetsParStatut
      },
      examens: {
        total: totalExamens,
        prochains,
        passes
      }
    };
    
    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les statistiques pour un étudiant spécifique
// @route   GET /api/statistics/student
// @access  Private
const getStudentStatistics = async (req, res) => {
  try {
    const studentId = req.student._id;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Récupérer les emplois du temps personnalisés de l'étudiant
    const emploisPersonnalises = await EmploiDuTemps.find({
      estPersonnalise: true,
      $or: [
        { etudiants: studentId },
        {
          pourTouteFiliere: true,
          filiere: { $in: [student.filiere, 'tous'] },
          annee: { $in: [student.annee, 'tous'] }
        }
      ]
    }).countDocuments();
    
    // Récupérer les projets de la filière et année de l'étudiant
    const projets = await Projet.findOne({ filiere: student.filiere, annee: student.annee });
    let projetsCount = 0;
    let projetsParStatut = {};
    
    if (projets && projets.projets) {
      projetsCount = projets.projets.length;
      
      projets.projets.forEach(projet => {
        if (!projetsParStatut[projet.statut]) {
          projetsParStatut[projet.statut] = 0;
        }
        projetsParStatut[projet.statut]++;
      });
    }
    
    // Récupérer les examens de la filière et année de l'étudiant
    const planningExams = await PlanningExams.findOne({ filiere: student.filiere, annee: student.annee });
    let prochains = 0;
    let passes = 0;
    
    const today = new Date();
    
    if (planningExams && planningExams.examens) {
      planningExams.examens.forEach(examen => {
        const examDate = new Date(examen.date);
        if (examDate > today) {
          prochains++;
        } else {
          passes++;
        }
      });
    }
    
    // Récupérer les événements de la filière et année de l'étudiant
    const evenements = await Evenement.findOne({ filiere: student.filiere, annee: student.annee });
    let evenementsCount = 0;
    
    if (evenements && evenements.evenements) {
      evenementsCount = evenements.evenements.length;
    }
    
    // Construire l'objet de réponse
    const statistics = {
      emplois: {
        personnalises: emploisPersonnalises
      },
      projets: {
        total: projetsCount,
        parStatut: projetsParStatut
      },
      examens: {
        prochains,
        passes
      },
      evenements: {
        total: evenementsCount
      }
    };
    
    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'étudiant:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatistics,
  getStudentStatistics
};
