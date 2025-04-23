const mongoose = require('mongoose');
const Formation = require('./models/Formation');
require('dotenv').config();

// Données d'exemple pour les formations
const formationsData = [
  {
    title: "User Experience Design",
    description: "Au-delà de l'épreuve : un pas vers votre carrière. Apprenez à concevoir des interfaces utilisateur intuitives et attrayantes.",
    imageUrl: "/src/loginaccueil/assets/istockphoto-1192947841-170667a.png",
    category: "Design",
    duration: "3 mois",
    instructor: "Prof. Sarah Johnson",
    date: new Date("2023-06-15")
  },
  {
    title: "Computer Science",
    description: "Au cœur de l'innovation et du savoir : les événements de l'ENSA Beni Mellal. Explorez les fondements de l'informatique et développez vos compétences en programmation.",
    imageUrl: "/src/loginaccueil/assets/istockphoto-1396019181-170667a.png",
    category: "Informatique",
    duration: "6 mois",
    instructor: "Dr. Michael Chen",
    date: new Date("2023-07-20")
  },
  {
    title: "Business Management",
    description: "Votre guide vers une semaine productive. Acquérez les compétences essentielles pour gérer efficacement une entreprise dans un environnement concurrentiel.",
    imageUrl: "/src/loginaccueil/assets/istockphoto-1226452601-170667a.png",
    category: "Gestion",
    duration: "4 mois",
    instructor: "Mme. Sophia Martinez",
    date: new Date("2023-08-10")
  }
];

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');
    
    try {
      // Supprimer les formations existantes (optionnel)
      await Formation.deleteMany({});
      console.log('Anciennes formations supprimées');
      
      // Insérer les nouvelles formations
      const insertedFormations = await Formation.insertMany(formationsData);
      console.log(`${insertedFormations.length} formations insérées avec succès!`);
      console.log('Formations insérées:');
      insertedFormations.forEach(formation => {
        console.log(`- ${formation.title} (ID: ${formation._id})`);
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'insertion des formations:', error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
      console.log('Connexion MongoDB fermée');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
