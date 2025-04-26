const Student = require('../models/Student');
const EmploiDuTemps = require('../models/EmploiDuTemps');
const Projet = require('../models/Projet');
const PlanningExams = require('../models/PlanningExams');
const Evenement = require('../models/Evenement');
const Professor = require('../models/Professor');
const Module = require('../models/Module');
const Competence = require('../models/Competence');

// @desc    Obtenir les statistiques générales
// @route   GET /api/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    console.log('Récupération des statistiques générales');

    // Définir la date d'aujourd'hui (utilisée dans plusieurs calculs)
    const today = new Date();

    // Récupérer l'étudiant connecté
    const studentId = req.user.id;
    console.log('ID de l\'étudiant:', studentId);

    const student = await Student.findById(studentId);
    console.log('Étudiant trouvé:', student ? 'Oui' : 'Non');

    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // Statistiques des étudiants
    const totalEtudiants = await Student.countDocuments();

    // Étudiants par filière (avec normalisation de la casse)
    const etudiantsParFiliere = await Student.aggregate([
      // Convertir la filière en minuscules pour normaliser la casse
      { $addFields: { filiere_lower: { $toLower: "$filiere" } } },
      // Grouper par la filière normalisée
      { $group: { _id: "$filiere_lower", count: { $sum: 1 } } }
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
    let projetsASoumettreCetteSemaine = 0;
    let prochainProjet = null;

    // Calculer la date de fin de la semaine en cours
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    projets.forEach(projet => {
      if (projet.projets && Array.isArray(projet.projets)) {
        totalProjets += projet.projets.length;

        projet.projets.forEach(p => {
          // Compter par statut
          if (!projetsParStatut[p.statut]) {
            projetsParStatut[p.statut] = 0;
          }
          projetsParStatut[p.statut]++;

          // Vérifier si le projet doit être soumis cette semaine
          if (p.dateLimite && p.statut !== 'termine') {
            const dateLimite = new Date(p.dateLimite);
            if (dateLimite <= endOfWeek && dateLimite >= today) {
              projetsASoumettreCetteSemaine++;

              // Trouver le prochain projet à soumettre
              if (!prochainProjet || dateLimite < new Date(prochainProjet.dateLimite)) {
                prochainProjet = p;
              }
            }
          }
        });
      }
    });

    // Statistiques des examens
    const planningExams = await PlanningExams.find();
    let totalExamens = 0;
    let prochains = 0;
    let passes = 0;
    let prochainExamen = null;
    let joursJusquAuProchainExamen = null;

    planningExams.forEach(planning => {
      if (planning.examens && Array.isArray(planning.examens)) {
        totalExamens += planning.examens.length;

        planning.examens.forEach(examen => {
          const examDate = new Date(examen.date);
          if (examDate > today) {
            prochains++;

            // Trouver le prochain examen (le plus proche dans le temps)
            if (!prochainExamen || examDate < new Date(prochainExamen.date)) {
              prochainExamen = examen;

              // Calculer le nombre de jours jusqu'au prochain examen
              const diffTime = Math.abs(examDate - today);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              joursJusquAuProchainExamen = diffDays;
            }
          } else {
            passes++;
          }
        });
      }
    });

    // Statistiques des événements
    const evenements = await Evenement.find({
      $or: [
        // Événements spécifiques à cette filière et année
        { filiere: student.filiere.toLowerCase(), annee: student.annee },
        // Événements pour toutes les filières mais cette année spécifique
        { filiere: 'tous', annee: student.annee },
        // Événements pour cette filière spécifique mais toutes les années
        { filiere: student.filiere.toLowerCase(), annee: 'tous' },
        // Événements pour toutes les filières et toutes les années
        { filiere: 'tous', annee: 'tous' }
      ]
    });

    console.log('Événements trouvés:', evenements);

    let totalEvenements = evenements.length;
    let evenementsAVenir = 0;
    let prochainEvenement = null;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    evenements.forEach(evenement => {
      const dateDebut = new Date(evenement.dateDebut);

      if (dateDebut > today) {
        evenementsAVenir++;

        // Trouver le prochain événement
        if (!prochainEvenement || dateDebut < new Date(prochainEvenement.dateDebut)) {
          prochainEvenement = evenement;
        }
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

    // Récupérer les données réelles de compétences depuis la base de données
    console.log('Récupération des compétences pour l\'étudiant:', req.user.id);

    // Rechercher les compétences de l'étudiant connecté
    let competencesData = await Competence.findOne({ etudiant: req.user.id });

    // Si aucun enregistrement n'existe, créer un enregistrement par défaut
    if (!competencesData) {
      console.log('Aucun enregistrement de compétences trouvé, création d\'un enregistrement par défaut');

      // Définir des valeurs par défaut en fonction de la filière
      let defaultValues = {
        programmation: 50,
        mathematiques: 50,
        communication: 50,
        travailEquipe: 50,
        resolutionProblemes: 50,
        gestionProjet: 50
      };

      // Récupérer la filière de l'étudiant
      const studentFiliere = student.filiere.toLowerCase();

      // Ajuster les valeurs par défaut en fonction de la filière
      switch(studentFiliere) {
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
      competencesData = new Competence({
        etudiant: req.user.id,
        ...defaultValues
      });

      await competencesData.save();
      console.log('Nouvel enregistrement de compétences créé:', competencesData);
    }

    // Extraire les données de compétences
    const competences = {
      programmation: competencesData.programmation,
      mathematiques: competencesData.mathematiques,
      communication: competencesData.communication,
      travailEquipe: competencesData.travailEquipe,
      resolutionProblemes: competencesData.resolutionProblemes,
      gestionProjet: competencesData.gestionProjet
    };

    // Récupérer les activités récentes
    // Dans une implémentation réelle, ces données proviendraient d'une collection d'activités
    // Pour l'instant, nous générons des activités simulées
    const activitesRecentes = [
      {
        type: 'emploi',
        titre: 'Nouvel emploi du temps personnalisé',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        icon: 'calendar-plus'
      },
      {
        type: 'projet',
        titre: 'Nouveau projet ajouté: Développement Web',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        icon: 'tasks'
      },
      {
        type: 'examen',
        titre: 'Planning des examens mis à jour',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        icon: 'file-alt'
      },
      {
        type: 'formation',
        titre: 'Nouvelle formation disponible: Intelligence Artificielle',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        icon: 'graduation-cap'
      }
    ];

    // Si nous avons un prochain événement, l'ajouter aux activités récentes
    if (prochainEvenement) {
      activitesRecentes.unshift({
        type: 'evenement',
        titre: `Nouvel événement ajouté: ${prochainEvenement.titre || 'Événement'}`,
        date: new Date(prochainEvenement.dateDebut || Date.now()),
        icon: 'calendar-day'
      });
    }

    // Trier les activités par date (de la plus récente à la plus ancienne)
    activitesRecentes.sort((a, b) => b.date - a.date);

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
        parStatut: projetsParStatut,
        aSoumettreCetteSemaine: projetsASoumettreCetteSemaine,
        prochain: prochainProjet
      },
      examens: {
        total: totalExamens,
        prochains,
        passes,
        prochain: prochainExamen,
        joursJusquAuProchainExamen
      },
      evenements: {
        total: totalEvenements,
        aVenir: evenementsAVenir,
        prochain: prochainEvenement
      },
      competences,
      activitesRecentes
    };

    console.log('Statistiques générées avec succès:', JSON.stringify(statistics, null, 2));
    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    console.error('Stack trace:', error.stack);

    // Envoyer une réponse d'erreur plus détaillée
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
      details: 'Une erreur est survenue lors de la récupération des statistiques. Veuillez réessayer plus tard.'
    });
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

    // Définir la date d'aujourd'hui
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
    const evenements = await Evenement.find({
      $or: [
        // Événements spécifiques à cette filière et année
        { filiere: student.filiere.toLowerCase(), annee: student.annee },
        // Événements pour toutes les filières mais cette année spécifique
        { filiere: 'tous', annee: student.annee },
        // Événements pour cette filière spécifique mais toutes les années
        { filiere: student.filiere.toLowerCase(), annee: 'tous' },
        // Événements pour toutes les filières et toutes les années
        { filiere: 'tous', annee: 'tous' }
      ]
    });

    console.log('Événements trouvés pour l\'étudiant:', evenements);

    let evenementsCount = evenements.length;
    let evenementsAVenir = 0;
    let prochainEvenement = null;

    // Calculer le nombre d'événements à venir
    // Utiliser la variable today déjà définie plus haut

    evenements.forEach(evenement => {
      const dateDebut = new Date(evenement.dateDebut);
      if (dateDebut > today) {
        evenementsAVenir++;

        // Trouver le prochain événement
        if (!prochainEvenement || dateDebut < new Date(prochainEvenement.dateDebut)) {
          prochainEvenement = evenement;
        }
      }
    });

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
        total: evenementsCount,
        aVenir: evenementsAVenir,
        prochain: prochainEvenement
      }
    };

    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'étudiant:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les statistiques pour la page d'accueil
// @route   GET /api/statistics/home
// @access  Public
const getHomeStatistics = async (req, res) => {
  try {
    // Nombre total d'étudiants
    const totalStudents = await Student.countDocuments();

    // Nombre de filières (distinctes)
    const filieres = await Student.distinct('filiere');
    const totalFilieres = filieres.length;

    // Nombre de professeurs
    const totalProfessors = await Professor.countDocuments();

    // Nombre de modules
    const totalModules = await Module.countDocuments();

    // Construire l'objet de réponse
    const statistics = {
      students: totalStudents,
      filieres: totalFilieres,
      professors: totalProfessors,
      modules: totalModules
    };

    res.json(statistics);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de la page d\'accueil:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatistics,
  getStudentStatistics,
  getHomeStatistics
};
