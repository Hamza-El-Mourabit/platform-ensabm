const EmploiDuTemps = require('../models/EmploiDuTemps');

// @desc    Get emploi du temps by filiere and annee
// @route   GET /api/emplois-du-temps/:filiere/:annee
// @access  Private
const getEmploiDuTemps = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    const apogee = req.query.apogee; // Récupérer le numéro apogée de l'étudiant s'il est fourni

    console.log(`Recherche d'emploi du temps pour filière: ${filiere}, année: ${annee}, apogée: ${apogee || 'non fourni'}`);

    // Vérifier d'abord s'il existe un emploi du temps personnalisé pour cette filière et année
    // qui est marqué comme étant pour toute la filière
    const emploiPersonnaliseQuery = {
      estPersonnalise: true,
      pourTouteFiliere: true,
      $or: [
        {
          filiere: { $regex: new RegExp(`^${filiere}$`, 'i') },
          annee: annee
        },
        {
          filiere: 'tous',
          annee: annee
        },
        {
          filiere: { $regex: new RegExp(`^${filiere}$`, 'i') },
          annee: 'tous'
        }
      ]
    };

    console.log('Recherche d\'emploi personnalisé avec la requête:', JSON.stringify(emploiPersonnaliseQuery, null, 2));

    const emploiPersonnalise = await EmploiDuTemps.findOne(emploiPersonnaliseQuery)
      .populate([
        {
          path: 'emplois.creneaux.professeur',
          select: 'nom prenom specialite'
        },
        {
          path: 'emplois.creneaux.module',
          select: 'code nom'
        }
      ])
      .sort({ createdAt: -1 }); // Prendre le plus récent

    if (emploiPersonnalise) {
      console.log(`Emploi du temps personnalisé trouvé pour filière: ${filiere}, année: ${annee}`);
      console.log(`ID: ${emploiPersonnalise._id}, Titre: ${emploiPersonnalise.titre}`);

      // Transformer l'emploi personnalisé au format attendu par le frontend
      const formattedEmploi = {
        _id: emploiPersonnalise._id,
        filiere: emploiPersonnalise.filiere,
        annee: emploiPersonnalise.annee,
        titre: emploiPersonnalise.titre,
        description: emploiPersonnalise.description,
        emplois: emploiPersonnalise.emplois,
        estPersonnalise: true
      };

      return res.json(formattedEmploi);
    }

    // Si aucun emploi personnalisé n'est trouvé, chercher l'emploi standard
    console.log(`Aucun emploi personnalisé trouvé, recherche d'emploi standard pour filière: ${filiere}, année: ${annee}`);

    const emploiDuTemps = await EmploiDuTemps.findOne({
      filiere: { $regex: new RegExp(`^${filiere}$`, 'i') },
      annee: annee,
      estPersonnalise: { $ne: true } // Exclure les emplois personnalisés
    })
    .populate([
      {
        path: 'emplois.creneaux.professeur',
        select: 'nom prenom specialite'
      },
      {
        path: 'emplois.creneaux.module',
        select: 'code nom'
      }
    ]);

    if (!emploiDuTemps) {
      console.log(`Aucun emploi du temps trouvé pour filière: ${filiere}, année: ${annee}`);
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    console.log(`Emploi du temps standard trouvé pour filière: ${filiere}, année: ${annee}`);
    console.log(`ID: ${emploiDuTemps._id}`);

    res.json(emploiDuTemps);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new emploi du temps
// @route   POST /api/emplois-du-temps
// @access  Private (Admin only)
const createEmploiDuTemps = async (req, res) => {
  try {
    const { filiere, annee, emplois } = req.body;

    console.log(`Tentative de création d'un emploi du temps pour filière: ${filiere}, année: ${annee}`);

    // Vérifier si l'emploi du temps existe déjà
    const emploiDuTempsExists = await EmploiDuTemps.findOne({
      filiere: { $regex: new RegExp(`^${filiere}$`, 'i') },
      annee,
      estPersonnalise: { $ne: true } // Exclure les emplois personnalisés
    });

    if (emploiDuTempsExists) {
      console.log(`Un emploi du temps existe déjà pour filière: ${filiere}, année: ${annee}`);
      return res.status(400).json({ message: 'Emploi du temps déjà existant' });
    }

    const emploiDuTemps = await EmploiDuTemps.create({
      filiere,
      annee,
      emplois
    });

    console.log(`Emploi du temps créé avec succès pour filière: ${filiere}, année: ${annee}, ID: ${emploiDuTemps._id}`);
    res.status(201).json(emploiDuTemps);
  } catch (error) {
    console.error('Erreur lors de la création de l\'emploi du temps:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update emploi du temps
// @route   PUT /api/emplois-du-temps/:id
// @access  Private (Admin only)
const updateEmploiDuTemps = async (req, res) => {
  try {
    const { id } = req.params;
    const { emplois } = req.body;

    const emploiDuTemps = await EmploiDuTemps.findById(id);

    if (!emploiDuTemps) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    emploiDuTemps.emplois = emplois;
    await emploiDuTemps.save();

    res.json(emploiDuTemps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmploiDuTemps,
  createEmploiDuTemps,
  updateEmploiDuTemps
};