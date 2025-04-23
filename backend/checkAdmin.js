const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');
    
    try {
      // Vérifier si des admins existent
      const admins = await Admin.find({});
      
      if (admins.length === 0) {
        console.log('Aucun administrateur trouvé dans la base de données.');
      } else {
        console.log(`${admins.length} administrateur(s) trouvé(s) dans la base de données:`);
        admins.forEach((admin, index) => {
          console.log(`\nAdmin ${index + 1}:`);
          console.log(`ID: ${admin._id}`);
          console.log(`Nom d'utilisateur: ${admin.username}`);
          console.log(`Nom: ${admin.nom}`);
          console.log(`Prénom: ${admin.prenom}`);
          console.log(`Email: ${admin.email}`);
          console.log(`Rôle: ${admin.role}`);
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des administrateurs:', error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
      console.log('Connexion MongoDB fermée');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
