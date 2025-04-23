const mongoose = require('mongoose');
const EmploiDuTemps = require('./models/EmploiDuTemps');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');
    
    try {
      // Récupérer tous les emplois du temps
      const emplois = await EmploiDuTemps.find({});
      
      console.log('Nombre d\'emplois du temps trouvés:', emplois.length);
      
      // Afficher les détails de chaque emploi du temps
      emplois.forEach((emploi, index) => {
        console.log(`\n--- Emploi du temps #${index + 1} ---`);
        console.log('ID:', emploi._id);
        console.log('Filière:', emploi.filiere);
        console.log('Année:', emploi.annee);
        
        if (emploi.emplois && Array.isArray(emploi.emplois)) {
          console.log('Nombre de jours:', emploi.emplois.length);
          
          // Afficher les détails de chaque jour
          emploi.emplois.forEach(jour => {
            console.log(`\nJour: ${jour.jour}`);
            console.log('Nombre de créneaux:', jour.creneaux ? jour.creneaux.length : 0);
            
            if (jour.creneaux && jour.creneaux.length > 0) {
              // Afficher les détails du premier créneau
              const premierCreneau = jour.creneaux[0];
              console.log('Premier créneau:');
              console.log('  Module:', premierCreneau.module);
              console.log('  Horaire:', premierCreneau.debut, '-', premierCreneau.fin);
              console.log('  Salle:', premierCreneau.salle);
              console.log('  Professeur:', premierCreneau.professeur);
            }
          });
        } else {
          console.log('Structure emplois non trouvée ou invalide');
          console.log('Structure complète:', JSON.stringify(emploi, null, 2));
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
      console.log('\nConnexion MongoDB fermée');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
