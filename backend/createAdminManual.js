const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecté');

    // Supprimer la collection Admin pour repartir de zéro
    try {
      await mongoose.connection.db.collection('admins').drop();
      console.log('Collection admins supprimée');
    } catch (error) {
      console.log('La collection admins n\'existe pas ou ne peut pas être supprimée');
    }

    // Créer un nouvel administrateur directement avec Mongoose
    const adminData = {
      username: 'gouskir',
      password: await bcrypt.hash('admin123', 10), // Hacher le mot de passe manuellement
      email: 'gouskir.mohamed@ensabm.ma',
      nom: 'Gouskir',
      prenom: 'Mohamed',
      role: 'admin'
    };

    // Insérer l'administrateur directement dans la collection
    const result = await mongoose.connection.db.collection('admins').insertOne(adminData);
    
    console.log('Administrateur créé avec succès!');
    console.log('ID:', result.insertedId);
    console.log('Nom d\'utilisateur:', adminData.username);
    console.log('Mot de passe (haché):', adminData.password);
    console.log('Email:', adminData.email);
    console.log('Nom:', adminData.nom);
    console.log('Prénom:', adminData.prenom);
    console.log('Rôle:', adminData.role);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  }
}

createAdmin();
