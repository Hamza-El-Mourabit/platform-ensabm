const EmploiDuTemps = require('../models/EmploiDuTemps');
const Student = require('../models/Student');

// @desc    Créer un emploi du temps personnalisé
// @route   POST /api/emplois-personnalises
// @access  Private (Admin only)
const createEmploiPersonnalise = async (req, res) => {
  try {
    const { titre, description, filiere, annee, etudiants, emplois, pourTouteFiliere } = req.body;

    console.log('Création d\'un emploi personnalisé avec les données suivantes:', {
      titre,
      filiere,
      annee,
      pourTouteFiliere,
      nombreEtudiants: etudiants ? etudiants.length : 0
    });

    // Si l'emploi n'est pas pour toute la filière et que des étudiants spécifiques sont sélectionnés
    if (!pourTouteFiliere && etudiants && etudiants.length > 0) {
      const existingStudents = await Student.find({ _id: { $in: etudiants } });
      if (existingStudents.length !== etudiants.length) {
        return res.status(400).json({ message: 'Certains étudiants n\'existent pas' });
      }
    }

    // Déterminer si l'emploi est pour toute la filière
    // Assurez-vous que pourTouteFiliere est un booléen
    const isPourTouteFiliere = pourTouteFiliere === true || pourTouteFiliere === 'true';

    console.log('Valeur de pourTouteFiliere:', pourTouteFiliere);
    console.log('Valeur convertie isPourTouteFiliere:', isPourTouteFiliere);

    // Créer l'emploi du temps personnalisé
    const emploiData = {
      titre,
      description,
      filiere,
      annee,
      estPersonnalise: true,
      creePar: req.admin._id,
      etudiants: isPourTouteFiliere ? [] : (etudiants || []),
      emplois,
      pourTouteFiliere: isPourTouteFiliere
    };

    console.log('Données de l\'emploi à créer:', JSON.stringify(emploiData, null, 2));

    const emploiPersonnalise = await EmploiDuTemps.create(emploiData);

    console.log('Emploi personnalisé créé avec succès:', {
      id: emploiPersonnalise._id,
      titre: emploiPersonnalise.titre,
      pourTouteFiliere: emploiPersonnalise.pourTouteFiliere
    });

    res.status(201).json(emploiPersonnalise);
  } catch (error) {
    console.error('Erreur lors de la création de l\'emploi personnalisé:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les emplois du temps personnalisés
// @route   GET /api/emplois-personnalises
// @access  Private (Admin only)
const getEmploisPersonnalises = async (req, res) => {
  try {
    const emploisPersonnalises = await EmploiDuTemps.find({ estPersonnalise: true })
      .populate('creePar', 'nom prenom')
      .populate('etudiants', 'nom prenom')
      .populate('emplois.creneaux.professeur', 'nom prenom specialite')
      .populate('emplois.creneaux.module', 'code nom');

    res.json(emploisPersonnalises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un emploi du temps personnalisé par ID
// @route   GET /api/emplois-personnalises/:id
// @access  Private
const getEmploiPersonnaliseById = async (req, res) => {
  try {
    const emploiPersonnalise = await EmploiDuTemps.findById(req.params.id)
      .populate('creePar', 'nom prenom')
      .populate('etudiants', 'nom prenom')
      .populate('emplois.creneaux.professeur', 'nom prenom specialite')
      .populate('emplois.creneaux.module', 'code nom');

    if (!emploiPersonnalise) {
      return res.status(404).json({ message: 'Emploi du temps personnalisé non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à voir cet emploi du temps
    if (!req.isAdmin) {
      const studentId = req.student._id;
      const isAuthorized = emploiPersonnalise.etudiants.some(etudiant =>
        etudiant._id.toString() === studentId.toString()
      );

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Non autorisé à accéder à cet emploi du temps' });
      }
    }

    res.json(emploiPersonnalise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un emploi du temps personnalisé
// @route   PUT /api/emplois-personnalises/:id
// @access  Private (Admin only)
const updateEmploiPersonnalise = async (req, res) => {
  try {
    const { titre, description, filiere, annee, etudiants, emplois } = req.body;

    const emploiPersonnalise = await EmploiDuTemps.findById(req.params.id);

    if (!emploiPersonnalise) {
      return res.status(404).json({ message: 'Emploi du temps personnalisé non trouvé' });
    }

    // Vérifier si les étudiants existent
    if (etudiants && etudiants.length > 0) {
      const existingStudents = await Student.find({ _id: { $in: etudiants } });
      if (existingStudents.length !== etudiants.length) {
        return res.status(400).json({ message: 'Certains étudiants n\'existent pas' });
      }
    }

    // Mettre à jour l'emploi du temps
    emploiPersonnalise.titre = titre || emploiPersonnalise.titre;
    emploiPersonnalise.description = description || emploiPersonnalise.description;
    emploiPersonnalise.filiere = filiere || emploiPersonnalise.filiere;
    emploiPersonnalise.annee = annee || emploiPersonnalise.annee;
    emploiPersonnalise.etudiants = etudiants || emploiPersonnalise.etudiants;
    emploiPersonnalise.emplois = emplois || emploiPersonnalise.emplois;

    const updatedEmploiPersonnalise = await emploiPersonnalise.save();

    res.json(updatedEmploiPersonnalise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un emploi du temps personnalisé
// @route   DELETE /api/emplois-personnalises/:id
// @access  Private (Admin only)
const deleteEmploiPersonnalise = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Tentative de suppression de l'emploi du temps avec ID: ${id}`);

    // Vérifier si l'emploi du temps existe
    const emploiDuTemps = await EmploiDuTemps.findById(id);

    if (!emploiDuTemps) {
      console.log(`Emploi du temps avec ID ${id} non trouvé`);
      return res.status(404).json({ message: 'Emploi du temps personnalisé non trouvé' });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer cet emploi du temps
    // (si c'est un admin, il est autorisé)
    if (req.admin) {
      console.log(`Admin ${req.admin._id} autorisé à supprimer l'emploi du temps`);
    } else {
      console.log(`Utilisateur non autorisé à supprimer l'emploi du temps`);
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Supprimer l'emploi du temps
    const result = await EmploiDuTemps.deleteOne({ _id: id });
    console.log(`Résultat de la suppression:`, result);

    if (result.deletedCount === 0) {
      console.log(`Échec de la suppression de l'emploi du temps avec ID ${id}`);
      return res.status(500).json({ message: 'Échec de la suppression' });
    }

    console.log(`Emploi du temps avec ID ${id} supprimé avec succès`);
    res.json({ message: 'Emploi du temps personnalisé supprimé avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'emploi du temps:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les emplois du temps personnalisés d'un étudiant
// @route   GET /api/emplois-personnalises/etudiant/:id
// @access  Private
const getEmploisPersonnalisesEtudiant = async (req, res) => {
  try {
    const studentId = req.params.id || req.student._id;
    console.log('Récupération des emplois pour l\'\u00e9tudiant ID:', studentId);

    // Récupérer les informations de l'étudiant pour connaître sa filière et son année
    const student = await Student.findById(studentId);

    if (!student) {
      console.log('Étudiant non trouvé avec ID:', studentId);
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    console.log('Informations étudiant:', {
      id: student._id,
      nom: student.nom,
      prenom: student.prenom,
      filiere: student.filiere,
      annee: student.annee
    });

    // Construire la requête pour trouver les emplois du temps qui correspondent à cet étudiant
    const query = {
      estPersonnalise: true,
      $or: [
        // Emplois spécifiquement assignés à cet étudiant
        { etudiants: studentId },

        // Emplois pour toute la filière de l'étudiant
        {
          pourTouteFiliere: true,
          $or: [
            { filiere: { $regex: new RegExp(`^${student.filiere}$`, 'i') } },
            { filiere: 'tous' }
          ],
          $or: [
            { annee: student.annee },
            { annee: 'tous' }
          ]
        }
      ]
    };

    console.log('Requête de recherche:', JSON.stringify(query, null, 2));

    // Vérifier tous les emplois du temps personnalisés pour déboguer
    const allEmplois = await EmploiDuTemps.find({ estPersonnalise: true });
    console.log('Nombre total d\'emplois personnalisés:', allEmplois.length);

    // Afficher les détails de chaque emploi pour déboguer
    allEmplois.forEach((emploi, index) => {
      console.log(`Emploi #${index + 1}:`, {
        id: emploi._id,
        titre: emploi.titre,
        filiere: emploi.filiere,
        annee: emploi.annee,
        pourTouteFiliere: emploi.pourTouteFiliere,
        etudiants: emploi.etudiants
      });
    });

    // Recherche manuelle pour déboguer
    const emploisPersonnalises = [];

    for (const emploi of allEmplois) {
      // Vérifier si l'emploi est spécifiquement assigné à cet étudiant
      const isAssignedToStudent = emploi.etudiants.some(
        etudiantId => etudiantId.toString() === studentId.toString()
      );

      // Vérifier si l'emploi est pour toute la filière de l'étudiant
      const isForStudentFiliere =
        emploi.pourTouteFiliere &&
        (emploi.filiere.toLowerCase() === student.filiere.toLowerCase() || emploi.filiere === 'tous') &&
        (emploi.annee === student.annee || emploi.annee === 'tous');

      if (isAssignedToStudent || isForStudentFiliere) {
        emploisPersonnalises.push(emploi);
        console.log(`Emploi #${emploi._id} ajouté pour l'étudiant:`, {
          titre: emploi.titre,
          filiere: emploi.filiere,
          annee: emploi.annee,
          pourTouteFiliere: emploi.pourTouteFiliere,
          isAssignedToStudent,
          isForStudentFiliere
        });
      }
    }

    // Peupler les références
    await EmploiDuTemps.populate(emploisPersonnalises, [
      {
        path: 'creePar',
        select: 'nom prenom'
      },
      {
        path: 'emplois.creneaux.professeur',
        select: 'nom prenom specialite'
      },
      {
        path: 'emplois.creneaux.module',
        select: 'code nom'
      }
    ]);

    // Trier par date de création décroissante
    emploisPersonnalises.sort((a, b) => b.createdAt - a.createdAt);

    console.log('Nombre d\'emplois trouvés pour cet étudiant:', emploisPersonnalises.length);

    res.json(emploisPersonnalises);
  } catch (error) {
    console.error('Erreur lors de la récupération des emplois:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmploiPersonnalise,
  getEmploisPersonnalises,
  getEmploiPersonnaliseById,
  updateEmploiPersonnalise,
  deleteEmploiPersonnalise,
  getEmploisPersonnalisesEtudiant
};
