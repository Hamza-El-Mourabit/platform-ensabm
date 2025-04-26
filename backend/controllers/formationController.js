const Formation = require('../models/Formation');
const Student = require('../models/Student');

// Récupérer toutes les formations
exports.getFormations = async (req, res) => {
  try {
    const formations = await Formation.find()
      .sort({ date: -1 }); // Tri par date décroissante

    // Ajouter des informations sur la durée et le statut pour chaque formation
    const formationsAvecDuree = formations.map(formation => {
      const formationObj = formation.toObject({ virtuals: true });

      // Ajouter la durée formatée
      if (formation.dateDebut && formation.dateFin) {
        formationObj.dureeFormatee = formation.formatDuree();

        // Ajouter le statut de la formation
        if (formation.estEnCours()) {
          formationObj.statut = 'En cours';
        } else if (formation.estTerminee()) {
          formationObj.statut = 'Terminée';
        } else if (formation.estAVenir()) {
          formationObj.statut = 'À venir';
        }
      } else {
        // Utiliser la durée existante si les dates ne sont pas définies
        formationObj.dureeFormatee = formation.duration || 'Durée non spécifiée';
        formationObj.statut = 'Non défini';
      }

      return formationObj;
    });

    res.status(200).json(formationsAvecDuree);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des formations', error: error.message });
  }
};

// Récupérer une formation par son ID
exports.getFormationById = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    res.status(200).json(formation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la formation', error: error.message });
  }
};

// Récupérer les formations d'un étudiant
exports.getStudentFormations = async (req, res) => {
  try {
    console.log('Récupération des formations pour l\'étudiant ID:', req.user.id);

    // Récupérer l'étudiant à partir de son ID (disponible via le middleware d'authentification)
    const student = await Student.findById(req.user.id);

    if (!student) {
      console.log('Étudiant non trouvé avec ID:', req.user.id);
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    console.log('Étudiant trouvé:', student.nom, student.prenom, 'Filière:', student.filiere);

    // Récupérer toutes les formations disponibles pour l'étudiant
    const formationsWithDetails = await Formation.find({
      $or: [
        { filiere: student.filiere.toLowerCase() },
        { filiere: 'tous' }
      ]
    })
    .sort({ date: -1 });

    console.log(`${formationsWithDetails.length} formations trouvées pour la filière ${student.filiere} ou 'tous'`);

    // Convertir les documents Mongoose en objets JavaScript et ajouter l'indicateur d'inscription
    const formationsWithModules = await Promise.all(formationsWithDetails.map(async (formation) => {
      const formationObj = formation.toObject({ virtuals: true });

      // Vérifier si l'étudiant est inscrit à cette formation
      const isInscrit = formation.etudiants && formation.etudiants.some(id => id.toString() === student._id.toString());
      formationObj.isInscrit = isInscrit;

      console.log(`Formation: ${formation.title}, Inscrit: ${isInscrit}`);

      // Ajouter la durée formatée
      if (formation.dateDebut && formation.dateFin) {
        formationObj.dureeFormatee = formation.formatDuree();

        // Ajouter le statut de la formation
        if (formation.estEnCours()) {
          formationObj.statut = 'En cours';
        } else if (formation.estTerminee()) {
          formationObj.statut = 'Terminée';
        } else if (formation.estAVenir()) {
          formationObj.statut = 'À venir';
        }

        // Calculer le pourcentage de progression
        const now = new Date();
        if (now < formation.dateDebut) {
          formationObj.progression = 0;
        } else if (now > formation.dateFin) {
          formationObj.progression = 100;
        } else {
          const totalDuration = formation.dateFin - formation.dateDebut;
          const elapsed = now - formation.dateDebut;
          formationObj.progression = Math.round((elapsed / totalDuration) * 100);
        }
      } else {
        // Utiliser la durée existante si les dates ne sont pas définies
        formationObj.dureeFormatee = formation.duration || 'Durée non spécifiée';
        formationObj.statut = 'Non défini';
        formationObj.progression = 0;
      }

      return formationObj;
    }));

    console.log('Formations avec détails envoyées au client');
    res.status(200).json(formationsWithModules);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations de l\'étudiant:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations', error: error.message });
  }
};

// Récupérer uniquement les formations auxquelles l'étudiant est inscrit
exports.getStudentInscriptions = async (req, res) => {
  try {
    console.log('Récupération des inscriptions pour l\'étudiant ID:', req.user.id);

    // Récupérer l'étudiant à partir de son ID (disponible via le middleware d'authentification)
    const student = await Student.findById(req.user.id);

    if (!student) {
      console.log('Étudiant non trouvé avec ID:', req.user.id);
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    console.log('Étudiant trouvé:', student.nom, student.prenom);

    // Récupérer uniquement les formations où l'étudiant est explicitement inscrit
    // Utiliser $elemMatch pour s'assurer que l'étudiant est bien dans le tableau etudiants
    const formationsInscrites = await Formation.find({
      etudiants: { $in: [student._id] }
    })
    .sort({ date: -1 });

    console.log(`${formationsInscrites.length} formations trouvées où l'étudiant est inscrit`);

    // Afficher les IDs des formations trouvées pour le débogage
    console.log('IDs des formations inscrites:', formationsInscrites.map(f => f._id));

    // Convertir les documents Mongoose en objets JavaScript et ajouter l'indicateur d'inscription
    const formationsWithModules = formationsInscrites.map(formation => {
      const formationObj = formation.toObject({ virtuals: true });

      // L'étudiant est inscrit à toutes ces formations par définition
      formationObj.isInscrit = true;

      console.log(`Formation inscrite: ${formation.title}, ID: ${formation._id}`);

      // Vérifier si l'étudiant est bien dans le tableau etudiants
      const etudiants = formation.etudiants || [];
      const estInscrit = etudiants.some(id => id.toString() === student._id.toString());
      console.log(`Vérification d'inscription pour ${formation.title}: ${estInscrit}`);

      // Ajouter la durée formatée
      if (formation.dateDebut && formation.dateFin) {
        formationObj.dureeFormatee = formation.formatDuree();

        // Ajouter le statut de la formation
        if (formation.estEnCours()) {
          formationObj.statut = 'En cours';
        } else if (formation.estTerminee()) {
          formationObj.statut = 'Terminée';
        } else if (formation.estAVenir()) {
          formationObj.statut = 'À venir';
        }

        // Calculer le pourcentage de progression
        const now = new Date();
        if (now < formation.dateDebut) {
          formationObj.progression = 0;
        } else if (now > formation.dateFin) {
          formationObj.progression = 100;
        } else {
          const totalDuration = formation.dateFin - formation.dateDebut;
          const elapsed = now - formation.dateDebut;
          formationObj.progression = Math.round((elapsed / totalDuration) * 100);
        }
      } else {
        // Utiliser la durée existante si les dates ne sont pas définies
        formationObj.dureeFormatee = formation.duration || 'Durée non spécifiée';
        formationObj.statut = 'Non défini';
        formationObj.progression = 0;
      }

      return formationObj;
    });

    console.log('Formations inscrites envoyées au client:', formationsWithModules.length);
    res.status(200).json(formationsWithModules);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations inscrites:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations inscrites', error: error.message });
  }
};

// Récupérer les étudiants inscrits à une formation
exports.getFormationStudents = async (req, res) => {
  try {
    console.log('Récupération des étudiants inscrits à la formation ID:', req.params.id);

    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      console.log('Formation non trouvée avec ID:', req.params.id);
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    console.log('Formation trouvée:', formation.title);
    console.log('Étudiants inscrits (IDs):', formation.etudiants);

    // Si la formation n'a pas d'étudiants inscrits, retourner un tableau vide
    if (!formation.etudiants || formation.etudiants.length === 0) {
      console.log('Aucun étudiant inscrit à cette formation');
      return res.status(200).json([]);
    }

    // Récupérer les informations des étudiants inscrits
    const students = await Student.find({
      _id: { $in: formation.etudiants }
    }).select('nom prenom apogee filiere annee email');

    console.log(`${students.length} étudiants trouvés:`, students.map(s => `${s.nom} ${s.prenom} (${s.apogee})`));

    res.status(200).json(students);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants inscrits:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des étudiants', error: error.message });
  }
};

// Inscrire un étudiant à une formation
exports.inscriptionFormation = async (req, res) => {
  try {
    console.log('Inscription demandée pour la formation:', req.params.id);
    console.log('Utilisateur connecté:', req.user.id);

    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      console.log('Formation non trouvée');
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    const studentId = req.user.id; // ID de l'étudiant connecté
    console.log('ID de l\'étudiant à inscrire:', studentId);

    // Afficher les étudiants actuellement inscrits
    console.log('Étudiants inscrits avant inscription:', formation.etudiants);

    // Vérifier si l'étudiant est déjà inscrit en utilisant toString() pour comparer les ObjectId
    const isDejaInscrit = formation.etudiants && formation.etudiants.some(id => id.toString() === studentId.toString());

    if (isDejaInscrit) {
      console.log('Étudiant déjà inscrit à cette formation');
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette formation' });
    }

    // Ajouter l'étudiant à la liste des inscrits
    if (!formation.etudiants) {
      formation.etudiants = [];
    }

    formation.etudiants.push(studentId);
    console.log('Étudiants inscrits après inscription:', formation.etudiants);

    // Mettre à jour le nombre d'étudiants
    formation.students = formation.etudiants.length;

    await formation.save();
    console.log('Formation mise à jour avec succès');

    // Retourner plus d'informations pour aider le frontend à mettre à jour son état
    res.status(200).json({
      message: 'Inscription réussie',
      formation: {
        _id: formation._id,
        title: formation.title,
        isInscrit: true,
        students: formation.students
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la formation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

// Désinscrire un étudiant d'une formation
exports.desinscriptionFormation = async (req, res) => {
  try {
    console.log('Désinscription demandée pour la formation:', req.params.id);
    console.log('Utilisateur connecté:', req.user.id);
    console.log('Paramètre studentId:', req.params.studentId);

    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      console.log('Formation non trouvée');
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // L'ID de l'étudiant à désinscrire (soit l'étudiant connecté, soit un étudiant spécifié par l'admin)
    const studentId = req.params.studentId || req.user.id;
    console.log('ID de l\'étudiant à désinscrire:', studentId);

    // Vérifier si l'utilisateur est un admin ou l'étudiant lui-même
    if (req.params.studentId && !req.user.isAdmin) {
      console.log('Non autorisé à désinscrire un autre étudiant');
      return res.status(403).json({ message: 'Non autorisé à désinscrire un autre étudiant' });
    }

    // Afficher les étudiants actuellement inscrits
    console.log('Étudiants inscrits avant désinscription:', formation.etudiants);

    // Vérifier si l'étudiant est inscrit en utilisant toString() pour comparer les ObjectId
    const isInscrit = formation.etudiants && formation.etudiants.some(id => id.toString() === studentId.toString());

    if (!isInscrit) {
      console.log('Étudiant non inscrit à cette formation');
      return res.status(400).json({ message: 'Étudiant non inscrit à cette formation' });
    }

    // Retirer l'étudiant de la liste des inscrits
    formation.etudiants = formation.etudiants.filter(id => id.toString() !== studentId.toString());
    console.log('Étudiants inscrits après désinscription:', formation.etudiants);

    // Mettre à jour le nombre d'étudiants
    formation.students = formation.etudiants.length;

    await formation.save();
    console.log('Formation mise à jour avec succès');

    // Retourner plus d'informations pour aider le frontend à mettre à jour son état
    res.status(200).json({
      message: 'Désinscription réussie',
      formation: {
        _id: formation._id,
        title: formation.title,
        isInscrit: false,
        students: formation.students
      }
    });
  } catch (error) {
    console.error('Erreur lors de la désinscription de la formation:', error);
    res.status(500).json({ message: 'Erreur lors de la désinscription', error: error.message });
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
    console.log('Données reçues pour la création de formation:', req.body);

    // Vérifier que les dates sont valides
    if (!req.body.dateDebut || !req.body.dateFin) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
    }

    // Normaliser les dates pour éviter les problèmes de fuseau horaire
    if (req.body.dateDebut) {
      const dateDebut = new Date(req.body.dateDebut);
      // Réinitialiser l'heure à midi pour éviter les problèmes de fuseau horaire
      dateDebut.setHours(12, 0, 0, 0);
      req.body.dateDebut = dateDebut;
    }

    if (req.body.dateFin) {
      const dateFin = new Date(req.body.dateFin);
      // Réinitialiser l'heure à midi pour éviter les problèmes de fuseau horaire
      dateFin.setHours(12, 0, 0, 0);
      req.body.dateFin = dateFin;
    }

    // Créer une nouvelle formation sans le champ students (il sera calculé automatiquement)
    const formationData = { ...req.body };
    delete formationData.students; // Supprimer le champ students s'il est présent

    // Gérer l'URL de l'image
    if (!formationData.imageUrl || formationData.imageUrl.trim() === '') {
      console.log('Aucune imageUrl fournie, utilisation de l\'image par défaut');
      // Laisser le modèle utiliser la valeur par défaut
      delete formationData.imageUrl;
    } else {
      console.log('ImageUrl fournie:', formationData.imageUrl);
    }

    // Initialiser le tableau d'étudiants s'il n'existe pas
    if (!formationData.etudiants) {
      formationData.etudiants = [];
    }

    // Créer la formation
    const newFormation = new Formation(formationData);

    // Mettre à jour le nombre d'étudiants en fonction du tableau etudiants
    newFormation.students = newFormation.etudiants.length;

    const savedFormation = await newFormation.save();
    console.log('Formation créée avec succès:', savedFormation);
    res.status(201).json(savedFormation);
  } catch (error) {
    console.error('Erreur détaillée lors de la création de la formation:', error);

    // Vérifier s'il s'agit d'une erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = {};

      // Extraire les messages d'erreur pour chaque champ
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: 'Erreur de validation des données',
        validationErrors
      });
    }

    res.status(400).json({ message: 'Erreur lors de la création de la formation', error: error.message });
  }
};

// Mettre à jour une formation
exports.updateFormation = async (req, res) => {
  try {
    console.log('Données reçues pour la mise à jour de formation:', req.body);

    // Vérifier que les dates sont valides
    if (!req.body.dateDebut || !req.body.dateFin) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
    }

    // Normaliser les dates pour éviter les problèmes de fuseau horaire
    if (req.body.dateDebut) {
      const dateDebut = new Date(req.body.dateDebut);
      // Réinitialiser l'heure à midi pour éviter les problèmes de fuseau horaire
      dateDebut.setHours(12, 0, 0, 0);
      req.body.dateDebut = dateDebut;
    }

    if (req.body.dateFin) {
      const dateFin = new Date(req.body.dateFin);
      // Réinitialiser l'heure à midi pour éviter les problèmes de fuseau horaire
      dateFin.setHours(12, 0, 0, 0);
      req.body.dateFin = dateFin;
    }

    // Récupérer la formation existante
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // Créer un objet avec les données à mettre à jour
    const updateData = { ...req.body };
    delete updateData.students; // Supprimer le champ students s'il est présent

    // Si aucune imageUrl n'est fournie, conserver l'ancienne
    if (!updateData.imageUrl || updateData.imageUrl.trim() === '') {
      console.log('Aucune imageUrl fournie, conservation de l\'ancienne:', formation.imageUrl);
      updateData.imageUrl = formation.imageUrl;
    } else {
      console.log('Nouvelle imageUrl fournie:', updateData.imageUrl);
    }

    // Conserver le nombre actuel d'étudiants inscrits
    updateData.students = formation.etudiants ? formation.etudiants.length : 0;

    // Mettre à jour la formation
    const updatedFormation = await Formation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Formation mise à jour avec succès:', updatedFormation);
    res.status(200).json(updatedFormation);
  } catch (error) {
    console.error('Erreur détaillée lors de la mise à jour de la formation:', error);

    // Vérifier s'il s'agit d'une erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = {};

      // Extraire les messages d'erreur pour chaque champ
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: 'Erreur de validation des données',
        validationErrors
      });
    }

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
