const Projet = require('../models/Projet');

// Récupérer les projets par filière et année
exports.getProjets = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    console.log('Recherche de projets pour:', { filiere, annee });

    // Normaliser la filière en minuscules
    const filiereNormalisee = filiere.toLowerCase();

    const projets = await Projet.findOne({ filiere: filiereNormalisee, annee });
    console.log('Résultat de la recherche:', projets ? 'Projets trouvés' : 'Aucun projet trouvé');

    if (!projets) {
      return res.status(404).json({ message: 'Aucun projet trouvé pour cette filière et année' });
    }

    // Importer les modèles nécessaires
    const Module = require('../models/Module');
    const Professor = require('../models/Professor');

    // Créer une copie des projets pour ne pas modifier l'original
    const projetsWithNames = JSON.parse(JSON.stringify(projets));

    // Pour chaque projet, récupérer les noms des modules et des professeurs
    for (let i = 0; i < projetsWithNames.projets.length; i++) {
      const projet = projetsWithNames.projets[i];

      // Récupérer le nom du module
      if (projet.module && projet.module.length === 24 && /^[0-9a-fA-F]{24}$/.test(projet.module)) {
        try {
          const moduleDoc = await Module.findById(projet.module);
          if (moduleDoc) {
            projetsWithNames.projets[i].module = {
              _id: projet.module,
              nom: `${moduleDoc.code} - ${moduleDoc.nom}`
            };
          }
        } catch (err) {
          console.error('Erreur lors de la récupération du module:', err);
        }
      }

      // Récupérer le nom du professeur
      if (projet.professeur && projet.professeur.length === 24 && /^[0-9a-fA-F]{24}$/.test(projet.professeur)) {
        try {
          const professorDoc = await Professor.findById(projet.professeur);
          if (professorDoc) {
            projetsWithNames.projets[i].professeur = {
              _id: projet.professeur,
              nom: professorDoc.nom,
              prenom: professorDoc.prenom
            };
          }
        } catch (err) {
          console.error('Erreur lors de la récupération du professeur:', err);
        }
      }
    }

    console.log('Projets avec noms récupérés:', projetsWithNames.projets.length);
    res.json(projetsWithNames);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les projets
exports.getAllProjets = async (req, res) => {
  try {
    const projets = await Projet.find({});
    res.json(projets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouveau projet
exports.createProjet = async (req, res) => {
  try {
    console.log('Données reçues pour création de projet:', req.body);

    // Normaliser la filière en minuscules
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase()
    };

    console.log('Données formatées:', formattedData);

    // Vérifier si un projet existe déjà pour cette filière et année
    const existingProjet = await Projet.findOne({
      filiere: formattedData.filiere,
      annee: formattedData.annee
    });

    if (existingProjet) {
      return res.status(400).json({
        message: 'Un projet existe déjà pour cette filière et année. Utilisez la mise à jour à la place.'
      });
    }

    const projet = new Projet(formattedData);
    const savedProjet = await projet.save();
    console.log('Projet créé avec succès:', savedProjet);
    res.status(201).json(savedProjet);
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un projet
exports.updateProjet = async (req, res) => {
  try {
    let { filiere, annee } = req.params;
    console.log('Données reçues pour mise à jour de projet:', req.body);
    console.log('Paramètres bruts:', { filiere, annee });

    // Normaliser la filière en minuscules
    filiere = filiere.toLowerCase();

    // Normaliser les données du corps de la requête
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase()
    };

    console.log('Paramètres normalisés:', { filiere, annee });
    console.log('Données formatées:', formattedData);

    const projet = await Projet.findOneAndUpdate(
      { filiere, annee },
      formattedData,
      { new: true, runValidators: true }
    );

    if (!projet) {
      return res.status(404).json({ message: 'Projet non trouvé pour cette filière et année' });
    }

    console.log('Projet mis à jour avec succès:', projet);
    res.json(projet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un projet
exports.deleteProjet = async (req, res) => {
  try {
    let { filiere, annee } = req.params;
    console.log('Suppression du projet pour (paramètres bruts):', { filiere, annee });

    // Normaliser la filière en minuscules
    filiere = filiere.toLowerCase();
    console.log('Suppression du projet pour (paramètres normalisés):', { filiere, annee });

    const projet = await Projet.findOneAndDelete({ filiere, annee });

    if (!projet) {
      return res.status(404).json({ message: 'Projet non trouvé pour cette filière et année' });
    }

    console.log('Projet supprimé avec succès:', projet._id);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({ message: error.message });
  }
};