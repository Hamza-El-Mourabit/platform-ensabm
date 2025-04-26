// Contrôleur pour les filières
const Module = require('../models/Module');

// Récupérer toutes les filières disponibles
exports.getFilieres = async (req, res) => {
  try {
    // Liste des filières disponibles dans le système
    const filieres = [
      {
        code: 'iacs',
        nom: 'Intelligence Artificielle et CyberSécurité',
        description: 'Formation en intelligence artificielle, cybersécurité, développement logiciel et réseaux informatiques.'
      },
      {
        code: 'aa',
        nom: 'Agroalimentaire',
        description: 'Formation en sciences et technologies agroalimentaires, contrôle qualité et gestion de production alimentaire.'
      },
      {
        code: 'g2er',
        nom: 'Génie Électrique et Énergies Renouvelables',
        description: 'Formation en génie électrique, énergies renouvelables, efficacité énergétique et développement durable.'
      },
      {
        code: 'tdi',
        nom: 'Transformation Digitale Industrielle',
        description: 'Formation en digitalisation des processus industriels, industrie 4.0, IoT et systèmes d\'information.'
      }
    ];

    // Récupérer les statistiques pour chaque filière (nombre d'étudiants, de modules, etc.)
    const stats = {};

    // Récupérer le nombre de modules par filière
    const moduleStats = await Module.aggregate([
      {
        $match: { filiere: { $ne: 'tous' } }
      },
      {
        $group: {
          _id: '$filiere',
          count: { $sum: 1 }
        }
      }
    ]);

    // Organiser les statistiques par filière
    moduleStats.forEach(stat => {
      if (!stats[stat._id]) {
        stats[stat._id] = {};
      }
      stats[stat._id].modules = stat.count;
    });

    // Ajouter les statistiques aux filières
    const filieresWithStats = filieres.map(filiere => {
      return {
        ...filiere,
        stats: stats[filiere.code] || { modules: 0 }
      };
    });

    res.status(200).json(filieresWithStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des filières:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des filières', error: error.message });
  }
};
