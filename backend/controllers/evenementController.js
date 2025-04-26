const Evenement = require('../models/Evenement');

// Récupérer tous les événements
exports.getAllEvenements = async (req, res) => {
  try {
    console.log('Récupération de tous les événements');
    const evenements = await Evenement.find({});
    console.log(`${evenements.length} événements trouvés`);
    console.log('Événements:', JSON.stringify(evenements));
    res.json(evenements);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les événements par filière et année
exports.getEvenementsByFiliereAnnee = async (req, res) => {
  try {
    const { filiere, annee } = req.params;
    console.log('Recherche d\'événements pour:', { filiere, annee });

    // Normaliser la filière en minuscules
    const filiereNormalisee = filiere.toLowerCase();

    // Construire la requête pour trouver les événements
    const query = {
      $or: [
        // Événements spécifiques à cette filière et année
        { filiere: filiereNormalisee, annee },
        // Événements pour toutes les filières mais cette année spécifique
        { filiere: 'tous', annee },
        // Événements pour cette filière spécifique mais toutes les années
        { filiere: filiereNormalisee, annee: 'tous' },
        // Événements pour toutes les filières et toutes les années
        { filiere: 'tous', annee: 'tous' },
        // Événements avec pourTouteFiliere=true (pour compatibilité)
        { pourTouteFiliere: true, annee },
        { pourTouteFiliere: true, annee: 'tous' }
      ]
    };

    console.log('Requête de recherche d\'événements:', JSON.stringify(query));

    // Vérifier tous les événements dans la base de données pour le débogage
    const allEvents = await Evenement.find({});
    console.log(`Nombre total d'événements dans la base de données: ${allEvents.length}`);
    console.log('Tous les événements:', JSON.stringify(allEvents.map(e => ({
      id: e._id,
      titre: e.titre,
      filiere: e.filiere,
      annee: e.annee
    }))));

    // Trouver les événements pour cette filière et année
    const evenements = await Evenement.find(query);

    console.log(`Nombre d'événements trouvés pour ${filiereNormalisee}/${annee}: ${evenements.length}`);
    if (evenements.length > 0) {
      console.log('Événements trouvés:', JSON.stringify(evenements.map(e => ({
        id: e._id,
        titre: e.titre,
        filiere: e.filiere,
        annee: e.annee
      }))));
    }

    if (evenements.length === 0) {
      return res.status(404).json({ message: 'Aucun événement trouvé pour cette filière et année' });
    }

    res.json(evenements);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un événement par ID
exports.getEvenementById = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);

    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json(evenement);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel événement
exports.createEvenement = async (req, res) => {
  try {
    console.log('Données reçues pour création d\'événement:', req.body);

    // Normaliser la filière en minuscules et s'assurer que pourTouteFiliere est correctement défini
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase(),
      // Si filiere est 'tous', s'assurer que pourTouteFiliere est true
      pourTouteFiliere: req.body.filiere.toLowerCase() === 'tous' ? true : req.body.pourTouteFiliere
    };

    console.log('Données formatées:', formattedData);

    const evenement = new Evenement(formattedData);
    const savedEvenement = await evenement.save();
    console.log('Événement créé avec succès:', savedEvenement);
    res.status(201).json(savedEvenement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un événement
exports.updateEvenement = async (req, res) => {
  try {
    console.log('Données reçues pour mise à jour d\'événement:', req.body);

    // Normaliser la filière en minuscules et s'assurer que pourTouteFiliere est correctement défini
    const formattedData = {
      ...req.body,
      filiere: req.body.filiere.toLowerCase(),
      // Si filiere est 'tous', s'assurer que pourTouteFiliere est true
      pourTouteFiliere: req.body.filiere.toLowerCase() === 'tous' ? true : req.body.pourTouteFiliere
    };

    console.log('Données formatées:', formattedData);

    const evenement = await Evenement.findByIdAndUpdate(
      req.params.id,
      formattedData,
      { new: true, runValidators: true }
    );

    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    console.log('Événement mis à jour avec succès:', evenement);
    res.json(evenement);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un événement
exports.deleteEvenement = async (req, res) => {
  try {
    console.log('Suppression de l\'événement:', req.params.id);

    const evenement = await Evenement.findByIdAndDelete(req.params.id);

    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    console.log('Événement supprimé avec succès');
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: error.message });
  }
};