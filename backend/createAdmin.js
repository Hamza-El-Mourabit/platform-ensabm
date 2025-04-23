const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

// Données de l'administrateur personnalisé
const adminData = {
  username: 'gouskir',
  password: 'admin123',
  email: 'gouskir.mohamed@ensabm.ma',
  nom: 'Gouskir',
  prenom: 'Mohamed',
  role: 'admin'
};

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté');

    try {
      // Vérifier si l'admin existe déjà
      const adminExists = await Admin.findOne({ username: adminData.username });

      if (adminExists) {
        console.log('Un administrateur avec ce nom d\'utilisateur existe déjà.');
        console.log('ID:', adminExists._id);
        console.log('Nom d\'utilisateur:', adminExists.username);
        console.log('Email:', adminExists.email);
      } else {
        // Créer un nouvel admin
        const admin = new Admin(adminData);
        await admin.save();

        console.log('Administrateur créé avec succès!');
        console.log('ID:', admin._id);
        console.log('Nom d\'utilisateur:', admin.username);
        console.log('Email:', admin.email);
        console.log('Mot de passe:', adminData.password);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
    } finally {
      // Fermer la connexion
      mongoose.connection.close();
      console.log('Connexion MongoDB fermée');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
