const Examen = require('../models/Examen');
const PlanningExams = require('../models/PlanningExams');

// Récupérer tous les examens
exports.getAllExamens = async (req, res) => {
  try {
    console.log('Récupération de tous les examens');
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés`);
    console.log('Examens:', JSON.stringify(examens));
    res.json(examens);
  } catch (error) {
    console.error('Erreur lors de la récupération des examens:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les examens par filière et année
exports.getExamensByFiliereAnnee = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    console.log('Recherche d\'examens pour:', { filiere, annee });

    // Normaliser la filière en minuscules
    const filiereNormalisee = filiere.toLowerCase();

    // Trouver les examens pour cette filière et année
    const examens = await Examen.find({
      $or: [
        // Examens spécifiques à cette filière et année
        { filiere: filiereNormalisee, annee },
        // Examens pour toutes les filières mais cette année spécifique
        { filiere: 'tous', annee },
        // Examens pour cette filière spécifique mais toutes les années
        { filiere: filiereNormalisee, annee: 'tous' },
        // Examens pour toutes les filières et toutes les années
        { filiere: 'tous', annee: 'tous' }
      ]
    });

    if (examens.length === 0) {
      return res.status(404).json({ message: 'Aucun examen trouvé pour cette filière et année' });
    }

    res.json(examens);
  } catch (error) {
    console.error('Erreur lors de la récupération des examens:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un examen par ID
exports.getExamenById = async (req, res) => {
  try {
    const examen = await Examen.findById(req.params.id);

    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    res.json(examen);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'examen:', error);
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour synchroniser les examens avec la collection PlanningExams
const synchronizeExamsWithPlanning = async (examen) => {
  try {
    console.log('Synchronisation de l\'examen avec le planning:', examen);

    // Vérifier que l'examen a tous les champs requis
    if (!examen || !examen.date) {
      throw new Error('Examen invalide ou incomplet');
    }

    // Normaliser la filière en minuscules
    if (examen.filiere) {
      examen.filiere = examen.filiere.toLowerCase();
    }

    // Supprimer l'examen existant de tous les plannings avant de le synchroniser
    // Cela évite d'avoir des doublons lorsqu'on passe de "pour tous" à "pour étudiants spécifiques"
    console.log('Suppression de l\'examen existant de tous les plannings avant synchronisation');
    await removeExamFromPlanning(examen);

    // Vérifier si l'examen est pour des étudiants spécifiques
    if (!examen.pourTouteFiliere && Array.isArray(examen.etudiants) && examen.etudiants.length > 0) {
      console.log(`Examen pour des étudiants spécifiques (${examen.etudiants.length} étudiants)`);

      // Récupérer les informations des étudiants pour déterminer leurs filières et années
      const Student = require('../models/Student');
      const etudiantsIds = examen.etudiants.map(id => id.toString());

      console.log('IDs des étudiants:', etudiantsIds);

      try {
        const etudiants = await Student.find({ _id: { $in: etudiantsIds } });
        console.log(`${etudiants.length} étudiants trouvés sur ${etudiantsIds.length}`);

        // Créer un Map pour regrouper les étudiants par filière et année
        const etudiantsParFiliereAnnee = new Map();

        for (const etudiant of etudiants) {
          const key = `${etudiant.filiere.toLowerCase()}-${etudiant.annee}`;
          if (!etudiantsParFiliereAnnee.has(key)) {
            etudiantsParFiliereAnnee.set(key, []);
          }
          etudiantsParFiliereAnnee.get(key).push(etudiant._id.toString());
        }

        console.log('Étudiants regroupés par filière/année:',
          Array.from(etudiantsParFiliereAnnee.entries()).map(([key, ids]) => `${key}: ${ids.length} étudiants`));

        // Pour chaque groupe d'étudiants, mettre à jour le planning correspondant
        for (const [key, etudiantIds] of etudiantsParFiliereAnnee.entries()) {
          const [filiere, annee] = key.split('-');
          console.log(`Mise à jour du planning pour ${filiere}/${annee} avec ${etudiantIds.length} étudiants spécifiques`);

          // Créer une copie de l'examen avec seulement les étudiants de cette filière/année
          const examenPourGroupe = {
            ...examen,
            etudiants: etudiantIds,
            // Forcer la filière et l'année pour ce groupe spécifique
            filiere: filiere,
            annee: annee
          };

          await updatePlanningForFiliereAnnee(filiere, annee, examenPourGroupe, true); // true = étudiants spécifiques
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des étudiants:', err);
        throw new Error('Impossible de récupérer les informations des étudiants');
      }
    }
    // Si l'examen est pour tous les étudiants d'une filière/année
    else if (examen.filiere === 'tous' || examen.annee === 'tous') {
      // Déterminer les filières à mettre à jour
      const filieres = examen.filiere === 'tous'
        ? ['iacs', 'aa', 'g2er', 'tdi']
        : [examen.filiere];

      // Déterminer les années à mettre à jour
      const annees = examen.annee === 'tous'
        ? ['1', '2', '3']
        : [examen.annee];

      console.log(`Examen pour plusieurs filières/années: ${filieres.join(', ')} / ${annees.join(', ')}`);

      // Mettre à jour tous les plannings concernés
      for (const filiere of filieres) {
        for (const annee of annees) {
          await updatePlanningForFiliereAnnee(filiere, annee, examen, false); // false = tous les étudiants
        }
      }
    } else {
      // Cas simple: mettre à jour le planning pour une filière et une année spécifiques
      console.log(`Examen pour une filière/année spécifique: ${examen.filiere}/${examen.annee}`);
      await updatePlanningForFiliereAnnee(examen.filiere, examen.annee, examen, false); // false = tous les étudiants
    }

    console.log('Synchronisation terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la synchronisation des examens:', error);
    throw error; // Propager l'erreur pour que la fonction appelante puisse la gérer
  }
};

// Fonction pour mettre à jour le planning d'une filière et année spécifiques
const updatePlanningForFiliereAnnee = async (filiere, annee, examen, etudiantsSpecifiques = false) => {
  try {
    console.log(`Mise à jour du planning pour ${filiere} - ${annee} avec l'examen:`, examen.titre || examen._id);
    console.log(`Mode étudiants spécifiques: ${etudiantsSpecifiques}`);

    // Chercher le planning existant ou en créer un nouveau
    let planning = await PlanningExams.findOne({ filiere, annee });

    if (!planning) {
      console.log(`Aucun planning trouvé pour ${filiere} - ${annee}, création d'un nouveau planning`);
      // Créer un nouveau planning s'il n'existe pas
      planning = new PlanningExams({
        filiere,
        annee,
        examens: []
      });
    }

    // Récupérer les informations complètes du module et du professeur
    let moduleInfo = examen.module;
    let professeurInfo = examen.professeur;

    // Si module et professeur sont des IDs, récupérer leurs noms
    if (examen.module && examen.module.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.module)) {
      try {
        const Module = require('../models/Module');
        const moduleDoc = await Module.findById(examen.module);
        if (moduleDoc) {
          moduleInfo = `${moduleDoc.code} - ${moduleDoc.nom}`;
        } else {
          console.log(`Module avec ID ${examen.module} non trouvé, utilisation de l'ID comme nom`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du module:', err);
      }
    }

    if (examen.professeur && examen.professeur.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.professeur)) {
      try {
        const Professor = require('../models/Professor');
        const professorDoc = await Professor.findById(examen.professeur);
        if (professorDoc) {
          professeurInfo = `${professorDoc.nom} ${professorDoc.prenom}`;
        } else {
          console.log(`Professeur avec ID ${examen.professeur} non trouvé, utilisation de l'ID comme nom`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du professeur:', err);
      }
    }

    // Vérifier que les champs requis sont présents
    if (!examen.heureDebut || !examen.heureFin) {
      console.error('Champs heureDebut ou heureFin manquants dans l\'examen:', examen);
      // Utiliser des valeurs par défaut si nécessaire
      examen.heureDebut = examen.heureDebut || '08:00';
      examen.heureFin = examen.heureFin || '10:00';
    }

    // Convertir l'examen au format attendu par PlanningExams
    const examForPlanning = {
      examId: examen._id.toString(), // Ajouter l'ID de l'examen original pour faciliter la mise à jour
      module: moduleInfo,
      date: examen.date,
      debut: examen.heureDebut,
      fin: examen.heureFin,
      salle: examen.salle || 'À déterminer',
      professeur: professeurInfo,
      titre: examen.titre || moduleInfo, // Ajouter le titre pour plus d'informations
      pourEtudiantsSpecifiques: etudiantsSpecifiques, // Indiquer si l'examen est pour des étudiants spécifiques
      etudiants: etudiantsSpecifiques ? examen.etudiants : [] // Ajouter la liste des étudiants si spécifiques
    };

    console.log('Examen formaté pour le planning:', examForPlanning);

    // Vérifier si cet examen existe déjà dans le planning (en cas de mise à jour)
    // Première tentative: recherche par ID d'examen
    let existingExamIndex = planning.examens.findIndex(
      e => e.examId && e.examId === examen._id.toString()
    );

    // Si l'ID n'est pas trouvé, essayer de trouver par module et date
    if (existingExamIndex === -1) {
      console.log('Examen non trouvé par ID, recherche par module et date');
      existingExamIndex = planning.examens.findIndex(
        e => e.module === examForPlanning.module &&
             new Date(e.date).toISOString().split('T')[0] === new Date(examForPlanning.date).toISOString().split('T')[0]
      );
    }

    if (existingExamIndex >= 0) {
      console.log('Examen existant trouvé, mise à jour');

      // Si l'examen existant est pour tous les étudiants et que le nouvel examen est pour des étudiants spécifiques,
      // ou vice versa, nous devons gérer ce cas spécial
      const existingExam = planning.examens[existingExamIndex];
      const existingIsSpecific = existingExam.pourEtudiantsSpecifiques === true;

      if (existingIsSpecific !== etudiantsSpecifiques) {
        console.log(`Changement de mode: ${existingIsSpecific ? 'spécifique -> tous' : 'tous -> spécifique'}`);

        if (etudiantsSpecifiques) {
          // Si le nouvel examen est pour des étudiants spécifiques, mais l'ancien était pour tous,
          // nous devons supprimer l'ancien et ajouter le nouveau
          console.log('Suppression de l\'examen pour tous et ajout de l\'examen pour étudiants spécifiques');
          planning.examens.splice(existingExamIndex, 1);
          planning.examens.push(examForPlanning);
        } else {
          // Si le nouvel examen est pour tous, mais l'ancien était pour des étudiants spécifiques,
          // nous remplaçons simplement l'ancien
          console.log('Remplacement de l\'examen pour étudiants spécifiques par un examen pour tous');
          planning.examens[existingExamIndex] = examForPlanning;
        }
      } else {
        // Même mode, simple mise à jour
        planning.examens[existingExamIndex] = examForPlanning;
      }
    } else {
      console.log('Ajout d\'un nouvel examen au planning');
      // Ajouter le nouvel examen
      planning.examens.push(examForPlanning);
    }

    // Sauvegarder le planning mis à jour
    const savedPlanning = await planning.save();
    console.log(`Planning mis à jour pour ${filiere} - ${annee}:`, savedPlanning.examens.length, 'examens');
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du planning pour ${filiere} - ${annee}:`, error);
  }
};

// Créer un nouvel examen
exports.createExamen = async (req, res) => {
  try {
    console.log('Données reçues pour création d\'examen:', req.body);

    // Normaliser la filière en minuscules
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase()
    };

    console.log('Données formatées:', formattedData);

    const examen = new Examen(formattedData);
    const savedExamen = await examen.save();
    console.log('Examen créé avec succès:', savedExamen);

    // Synchroniser avec le planning des examens
    await synchronizeExamsWithPlanning(savedExamen);

    res.status(201).json(savedExamen);
  } catch (error) {
    console.error('Erreur lors de la création de l\'examen:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un examen
exports.updateExamen = async (req, res) => {
  try {
    console.log('Données reçues pour mise à jour d\'examen:', req.body);

    // Normaliser la filière en minuscules
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase()
    };

    console.log('Données formatées:', formattedData);

    const examen = await Examen.findByIdAndUpdate(
      req.params.id,
      formattedData,
      { new: true, runValidators: true }
    );

    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    console.log('Examen mis à jour avec succès:', examen);

    // Synchroniser avec le planning des examens
    await synchronizeExamsWithPlanning(examen);

    res.json(examen);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'examen:', error);
    res.status(400).json({ message: error.message });
  }
};

// Fonction pour supprimer un examen du planning
const removeExamFromPlanning = async (examen) => {
  try {
    console.log('Suppression de l\'examen du planning:', examen);

    // Récupérer tous les plannings existants
    const plannings = await PlanningExams.find({});
    console.log(`Recherche de l'examen dans ${plannings.length} plannings`);

    // Pour chaque planning, supprimer l'examen s'il existe
    for (const planning of plannings) {
      await removeExamFromPlanningForFiliereAnnee(planning.filiere, planning.annee, examen);
    }

    console.log('Suppression terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'examen du planning:', error);
  }
};

// Fonction pour supprimer un examen du planning d'une filière et année spécifiques
const removeExamFromPlanningForFiliereAnnee = async (filiere, annee, examen) => {
  try {
    console.log(`Suppression de l'examen du planning pour ${filiere} - ${annee}`);

    // Chercher le planning existant
    const planning = await PlanningExams.findOne({ filiere, annee });

    if (!planning) {
      console.log(`Aucun planning trouvé pour ${filiere} - ${annee}`);
      return;
    }

    // Récupérer les informations complètes du module
    let moduleInfo = examen.module;

    // Si module est un ID, récupérer son nom
    if (examen.module && examen.module.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.module)) {
      try {
        const Module = require('../models/Module');
        const moduleDoc = await Module.findById(examen.module);
        if (moduleDoc) {
          moduleInfo = `${moduleDoc.code} - ${moduleDoc.nom}`;
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du module:', err);
      }
    }

    console.log(`Recherche de l'examen avec module ${moduleInfo} et date ${examen.date}`);

    // Filtrer les examens pour supprimer celui qui correspond
    const originalLength = planning.examens.length;

    // D'abord, essayer de supprimer par ID
    let newExamens = planning.examens.filter(e => {
      return !(e.examId && e.examId === examen._id.toString());
    });

    // Si aucun examen n'a été supprimé (même nombre d'examens), essayer par module et date
    if (newExamens.length === originalLength) {
      console.log('Aucun examen trouvé par ID, recherche par module et date');
      newExamens = planning.examens.filter(e => {
        // Vérifier si la date et le module correspondent
        const sameDate = new Date(e.date).toISOString().split('T')[0] === new Date(examen.date).toISOString().split('T')[0];
        const sameModule = e.module === moduleInfo;

        // Si la date et le module correspondent, supprimer l'examen
        if (sameDate && sameModule) {
          console.log(`Examen trouvé par date et module dans le planning ${filiere}/${annee}`);
          return false;
        }
        return true;
      });
    }

    planning.examens = newExamens;

    // Vérifier si un examen a été supprimé
    if (originalLength === planning.examens.length) {
      console.log(`Aucun examen correspondant trouvé dans le planning pour ${filiere} - ${annee}`);
    } else {
      // Sauvegarder le planning mis à jour
      await planning.save();
      console.log(`Examen supprimé du planning pour ${filiere} - ${annee}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'examen du planning pour ${filiere} - ${annee}:`, error);
  }
};

// Supprimer un examen
exports.deleteExamen = async (req, res) => {
  try {
    console.log('Suppression de l\'examen:', req.params.id);

    // Récupérer l'examen avant de le supprimer pour pouvoir le retirer du planning
    const examen = await Examen.findById(req.params.id);

    if (!examen) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    // Supprimer l'examen du planning
    await removeExamFromPlanning(examen);

    // Supprimer l'examen de la collection Examen
    await Examen.findByIdAndDelete(req.params.id);

    console.log('Examen supprimé avec succès');
    res.json({ message: 'Examen supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'examen:', error);
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour nettoyer les plannings d'examens (supprimer les doublons)
const cleanupPlanningExams = async () => {
  try {
    console.log('Nettoyage des plannings d\'examens (suppression des doublons)...');

    // Récupérer tous les plannings
    const plannings = await PlanningExams.find({});
    console.log(`${plannings.length} plannings trouvés`);

    let totalDuplicatesRemoved = 0;

    // Pour chaque planning
    for (const planning of plannings) {
      console.log(`Analyse du planning ${planning.filiere}/${planning.annee} avec ${planning.examens.length} examens`);

      // Créer un Map pour stocker les examens uniques
      const uniqueExams = new Map();

      // Trier les examens par date pour traiter d'abord les plus récents
      const sortedExams = [...planning.examens].sort((a, b) => {
        // Si l'un des examens a un examId et l'autre non, privilégier celui avec un examId
        if (a.examId && !b.examId) return -1;
        if (!a.examId && b.examId) return 1;

        // Sinon, trier par date (du plus récent au plus ancien)
        return new Date(b.date) - new Date(a.date);
      });

      // Pour chaque examen dans le planning (trié)
      for (const exam of sortedExams) {
        // Créer une clé unique basée sur le module et la date
        const examDate = new Date(exam.date).toISOString().split('T')[0];
        const key = `${exam.module}-${examDate}`;

        // Si l'examen a un ID, vérifier s'il existe déjà
        if (exam.examId) {
          // Si un examen avec cet ID existe déjà, le remplacer seulement si le nouvel examen est plus récent
          if (uniqueExams.has(exam.examId)) {
            console.log(`Examen avec ID ${exam.examId} déjà présent, ignoré`);
            continue;
          }
          uniqueExams.set(exam.examId, exam);
        }
        // Sinon, vérifier par module et date
        else if (uniqueExams.has(key)) {
          console.log(`Examen ${key} déjà présent, ignoré`);
          continue;
        } else {
          uniqueExams.set(key, exam);
        }
      }

      // Compter les doublons supprimés
      const duplicatesRemoved = planning.examens.length - uniqueExams.size;
      totalDuplicatesRemoved += duplicatesRemoved;

      // Si des doublons ont été trouvés, mettre à jour le planning
      if (duplicatesRemoved > 0) {
        console.log(`${duplicatesRemoved} doublons trouvés dans le planning ${planning.filiere}/${planning.annee}`);

        // Mettre à jour le planning avec les examens uniques
        planning.examens = Array.from(uniqueExams.values());
        await planning.save();
        console.log(`Planning ${planning.filiere}/${planning.annee} mis à jour avec ${planning.examens.length} examens uniques`);

        // Afficher les examens restants pour débogage
        planning.examens.forEach((exam, index) => {
          console.log(`Examen ${index + 1}: ${exam.module} - ${new Date(exam.date).toISOString().split('T')[0]} - ID: ${exam.examId || 'Aucun'}`);
        });
      }
    }

    console.log(`Nettoyage terminé: ${totalDuplicatesRemoved} doublons supprimés au total`);
    return totalDuplicatesRemoved;
  } catch (error) {
    console.error('Erreur lors du nettoyage des plannings d\'examens:', error);
    throw error;
  }
};

// Nettoyer les plannings d'examens (supprimer les doublons)
exports.cleanupPlanningExams = async (req, res) => {
  try {
    console.log('Nettoyage des plannings d\'examens (API)...');
    const duplicatesRemoved = await cleanupPlanningExams();

    res.json({
      message: `Nettoyage terminé: ${duplicatesRemoved} doublons supprimés`,
      details: {
        duplicatesRemoved
      }
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des plannings d\'examens:', error);
    res.status(500).json({ message: error.message });
  }
};

// Comparer les examens entre les collections Examen et PlanningExams
exports.compareExams = async (req, res) => {
  try {
    console.log('Comparaison des examens entre les collections...');

    // Récupérer tous les examens de la collection Examen
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés dans la collection Examen`);

    // Récupérer tous les plannings
    const plannings = await PlanningExams.find({});
    console.log(`${plannings.length} plannings trouvés`);

    // Compter le nombre total d'examens dans tous les plannings
    let totalPlanningExams = 0;
    const planningExamsByFiliere = {};

    for (const planning of plannings) {
      totalPlanningExams += planning.examens.length;

      // Regrouper les examens par filière et année
      const key = `${planning.filiere}/${planning.annee}`;
      planningExamsByFiliere[key] = planning.examens.length;
    }

    console.log(`${totalPlanningExams} examens trouvés dans tous les plannings`);

    // Compter les examens par filière dans la collection Examen
    const examensByFiliere = {};

    for (const examen of examens) {
      const filiere = examen.filiere;
      const annee = examen.annee;

      // Si l'examen est pour "tous", le compter pour toutes les filières et années
      if (filiere === 'tous' || annee === 'tous') {
        const filieres = filiere === 'tous' ? ['iacs', 'aa', 'g2er', 'tdi'] : [filiere];
        const annees = annee === 'tous' ? ['1', '2', '3'] : [annee];

        for (const f of filieres) {
          for (const a of annees) {
            const key = `${f}/${a}`;
            examensByFiliere[key] = (examensByFiliere[key] || 0) + 1;
          }
        }
      } else {
        const key = `${filiere}/${annee}`;
        examensByFiliere[key] = (examensByFiliere[key] || 0) + 1;
      }
    }

    // Comparer les nombres d'examens
    const comparison = {};
    const allKeys = new Set([...Object.keys(planningExamsByFiliere), ...Object.keys(examensByFiliere)]);

    for (const key of allKeys) {
      comparison[key] = {
        examen: examensByFiliere[key] || 0,
        planning: planningExamsByFiliere[key] || 0,
        difference: (planningExamsByFiliere[key] || 0) - (examensByFiliere[key] || 0)
      };
    }

    console.log('Comparaison terminée');
    res.json({
      message: 'Comparaison des examens terminée',
      details: {
        totalExamens: examens.length,
        totalPlanningExams,
        difference: totalPlanningExams - examens.length,
        comparison
      }
    });
  } catch (error) {
    console.error('Erreur lors de la comparaison des examens:', error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer les examens orphelins (qui n'ont pas de correspondance dans la collection Examen)
exports.removeOrphanExams = async (req, res) => {
  try {
    console.log('Suppression des examens orphelins...');

    // Récupérer tous les examens de la collection Examen
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés dans la collection Examen`);

    // Créer un ensemble d'IDs d'examens valides
    const validExamIds = new Set(examens.map(exam => exam._id.toString()));

    // Récupérer tous les plannings
    const plannings = await PlanningExams.find({});
    console.log(`${plannings.length} plannings trouvés`);

    let totalOrphansRemoved = 0;
    let specificExamRemoved = false;

    // Pour chaque planning
    for (const planning of plannings) {
      const originalLength = planning.examens.length;

      // Filtrer les examens pour ne garder que ceux qui ont un ID valide ou qui correspondent à un examen existant
      planning.examens = planning.examens.filter(exam => {
        // Si l'examen a un ID et que cet ID est valide, le garder
        if (exam.examId && validExamIds.has(exam.examId)) {
          return true;
        }

        // Vérifier si c'est l'examen "Gestion de projet" spécifique à supprimer
        const isGestionProjet = exam.module && exam.module.toLowerCase().includes('gestion de projet');
        if (isGestionProjet) {
          console.log(`Examen "Gestion de projet" trouvé dans le planning ${planning.filiere}/${planning.annee}`);
          specificExamRemoved = true;
          return false; // Supprimer cet examen
        }

        // Pour les examens sans ID, vérifier s'ils correspondent à un examen existant
        const matchingExam = examens.find(e => {
          // Comparer le module et la date
          const examDate = new Date(exam.date).toISOString().split('T')[0];
          const eDate = new Date(e.date).toISOString().split('T')[0];

          return (
            (e.module === exam.module || e.titre === exam.module) &&
            examDate === eDate
          );
        });

        return matchingExam !== undefined;
      });

      // Compter les orphelins supprimés
      const orphansRemoved = originalLength - planning.examens.length;
      totalOrphansRemoved += orphansRemoved;

      // Si des orphelins ont été trouvés, mettre à jour le planning
      if (orphansRemoved > 0) {
        console.log(`${orphansRemoved} orphelins trouvés dans le planning ${planning.filiere}/${planning.annee}`);
        await planning.save();
        console.log(`Planning ${planning.filiere}/${planning.annee} mis à jour avec ${planning.examens.length} examens valides`);
      }
    }

    console.log(`Suppression terminée: ${totalOrphansRemoved} orphelins supprimés au total`);
    res.json({
      message: `Suppression terminée: ${totalOrphansRemoved} orphelins supprimés`,
      details: {
        totalOrphansRemoved,
        specificExamRemoved
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des examens orphelins:', error);
    res.status(500).json({ message: error.message });
  }
};

// Synchroniser tous les examens existants avec les plannings
exports.synchronizeAllExams = async (req, res) => {
  try {
    console.log('Début de la synchronisation de tous les examens');

    // Supprimer tous les plannings existants pour repartir de zéro
    console.log('Suppression de tous les plannings existants...');
    const deleteResult = await PlanningExams.deleteMany({});
    console.log(`${deleteResult.deletedCount} plannings ont été supprimés`);

    // Récupérer tous les examens
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés à synchroniser`);

    if (examens.length === 0) {
      console.log('Aucun examen trouvé à synchroniser');
      return res.json({
        message: 'Aucun examen trouvé à synchroniser',
        details: {
          total: 0,
          success: 0,
          errors: 0
        }
      });
    }

    // Créer un planning vide pour chaque combinaison filière/année
    const filieres = ['iacs', 'aa', 'g2er', 'tdi'];
    const annees = ['1', '2', '3'];

    console.log('Création de plannings vides pour toutes les combinaisons filière/année');
    for (const filiere of filieres) {
      for (const annee of annees) {
        const planning = new PlanningExams({
          filiere,
          annee,
          examens: []
        });
        await planning.save();
        console.log(`Planning vide créé pour ${filiere}/${annee}`);
      }
    }

    // Synchroniser chaque examen
    let successCount = 0;
    let errorCount = 0;
    let detailedResults = [];

    for (const examen of examens) {
      try {
        console.log(`Synchronisation de l'examen: ${examen.titre || examen._id}`);
        await synchronizeExamsWithPlanning(examen);
        successCount++;
        detailedResults.push({
          id: examen._id,
          titre: examen.titre,
          filiere: examen.filiere,
          annee: examen.annee,
          status: 'success'
        });
      } catch (err) {
        console.error(`Erreur lors de la synchronisation de l'examen ${examen._id}:`, err);
        errorCount++;
        detailedResults.push({
          id: examen._id,
          titre: examen.titre,
          filiere: examen.filiere,
          annee: examen.annee,
          status: 'error',
          error: err.message
        });
      }
    }

    // Nettoyer les plannings pour supprimer les doublons potentiels
    console.log('Nettoyage des plannings pour supprimer les doublons...');
    const duplicatesRemoved = await cleanupPlanningExams();

    // Vérifier que les plannings ont bien été créés
    const plannings = await PlanningExams.find({});
    console.log(`${plannings.length} plannings trouvés après synchronisation`);

    for (const planning of plannings) {
      console.log(`Planning ${planning.filiere}/${planning.annee}: ${planning.examens.length} examens`);
    }

    console.log(`Synchronisation terminée: ${successCount} examens synchronisés avec succès, ${errorCount} erreurs, ${duplicatesRemoved} doublons supprimés`);
    res.json({
      message: 'Tous les examens ont été synchronisés avec les plannings',
      details: {
        total: examens.length,
        success: successCount,
        errors: errorCount,
        duplicatesRemoved: duplicatesRemoved,
        plannings: plannings.length,
        results: detailedResults
      }
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation de tous les examens:', error);
    res.status(500).json({ message: error.message });
  }
};

// Forcer une resynchronisation complète (supprimer tous les plannings et recréer)
exports.forceResync = async (req, res) => {
  try {
    console.log('Début de la resynchronisation forcée');

    // 1. Supprimer tous les plannings existants
    console.log('Suppression de tous les plannings existants...');
    const deleteResult = await PlanningExams.deleteMany({});
    console.log(`${deleteResult.deletedCount} plannings ont été supprimés`);

    // 2. Récupérer tous les examens
    const examens = await Examen.find({});
    console.log(`${examens.length} examens trouvés à synchroniser`);

    if (examens.length === 0) {
      console.log('Aucun examen trouvé à synchroniser');
      return res.json({
        message: 'Aucun examen trouvé à synchroniser',
        details: {
          total: 0,
          success: 0,
          errors: 0
        }
      });
    }

    // 3. Créer un planning vide pour chaque combinaison filière/année
    const filieres = ['iacs', 'aa', 'g2er', 'tdi'];
    const annees = ['1', '2', '3'];

    console.log('Création de plannings vides pour toutes les combinaisons filière/année');
    for (const filiere of filieres) {
      for (const annee of annees) {
        const planning = new PlanningExams({
          filiere,
          annee,
          examens: []
        });
        await planning.save();
        console.log(`Planning vide créé pour ${filiere}/${annee}`);
      }
    }

    // 4. Créer directement les examens dans les plannings (sans passer par synchronizeExamsWithPlanning)
    console.log('Création directe des examens dans les plannings...');

    // Récupérer tous les plannings
    const plannings = await PlanningExams.find({});
    const planningsMap = new Map();

    // Créer un Map pour accéder facilement aux plannings par filière/année
    for (const planning of plannings) {
      planningsMap.set(`${planning.filiere}-${planning.annee}`, planning);
    }

    // Pour chaque examen, l'ajouter directement aux plannings correspondants
    for (const examen of examens) {
      try {
        // Récupérer les informations complètes du module et du professeur
        let moduleInfo = examen.module;
        let professeurInfo = examen.professeur;

        // Si module et professeur sont des IDs, récupérer leurs noms
        if (examen.module && examen.module.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.module)) {
          try {
            const Module = require('../models/Module');
            const moduleDoc = await Module.findById(examen.module);
            if (moduleDoc) {
              moduleInfo = `${moduleDoc.code} - ${moduleDoc.nom}`;
            }
          } catch (err) {
            console.error('Erreur lors de la récupération du module:', err);
          }
        }

        if (examen.professeur && examen.professeur.length === 24 && /^[0-9a-fA-F]{24}$/.test(examen.professeur)) {
          try {
            const Professor = require('../models/Professor');
            const professorDoc = await Professor.findById(examen.professeur);
            if (professorDoc) {
              professeurInfo = `${professorDoc.nom} ${professorDoc.prenom}`;
            }
          } catch (err) {
            console.error('Erreur lors de la récupération du professeur:', err);
          }
        }

        // Créer l'objet examen pour le planning
        const examForPlanning = {
          examId: examen._id.toString(),
          module: moduleInfo,
          date: examen.date,
          debut: examen.heureDebut,
          fin: examen.heureFin,
          salle: examen.salle || 'À déterminer',
          professeur: professeurInfo
        };

        // Déterminer les filières et années concernées
        const filieres = examen.filiere === 'tous' ? ['iacs', 'aa', 'g2er', 'tdi'] : [examen.filiere];
        const annees = examen.annee === 'tous' ? ['1', '2', '3'] : [examen.annee];

        // Ajouter l'examen à chaque planning concerné
        for (const filiere of filieres) {
          for (const annee of annees) {
            const key = `${filiere}-${annee}`;
            const planning = planningsMap.get(key);

            if (planning) {
              planning.examens.push(examForPlanning);
              console.log(`Examen ajouté au planning ${filiere}/${annee}`);
            } else {
              console.error(`Planning ${filiere}/${annee} non trouvé`);
            }
          }
        }
      } catch (err) {
        console.error(`Erreur lors de l'ajout de l'examen ${examen._id}:`, err);
      }
    }

    // 5. Sauvegarder tous les plannings
    console.log('Sauvegarde de tous les plannings...');
    for (const planning of plannings) {
      await planning.save();
      console.log(`Planning ${planning.filiere}/${planning.annee} sauvegardé avec ${planning.examens.length} examens`);
    }

    // 6. Nettoyer les plannings pour supprimer les doublons potentiels
    console.log('Nettoyage des plannings pour supprimer les doublons...');
    const duplicatesRemoved = await cleanupPlanningExams();

    // 7. Vérifier les résultats
    const updatedPlannings = await PlanningExams.find({});
    let totalExams = 0;

    for (const planning of updatedPlannings) {
      totalExams += planning.examens.length;
      console.log(`Planning ${planning.filiere}/${planning.annee}: ${planning.examens.length} examens`);
    }

    console.log(`Resynchronisation forcée terminée: ${totalExams} examens ajoutés, ${duplicatesRemoved} doublons supprimés`);
    res.json({
      message: 'Resynchronisation forcée terminée avec succès',
      details: {
        total: examens.length,
        totalExams,
        duplicatesRemoved,
        plannings: updatedPlannings.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la resynchronisation forcée:', error);
    res.status(500).json({ message: error.message });
  }
};
