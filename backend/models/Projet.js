const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  filiere: {
    type: String,
    required: true,
    enum: ['iacs', 'aa', 'g2er', 'tdi']
  },
  annee: {
    type: String,
    required: true,
    enum: ['1', '2', '3']
  },
  projets: [{
    nom: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    deadline: {
      type: Date,
      required: true
    },
    statut: {
      type: String,
      required: true,
      enum: ['À faire', 'En cours', 'Terminé', 'Prévu']
    },
    module: {
      type: String,
      required: false
    },
    professeur: {
      type: String,
      required: false
    }
  }]
}, {
  timestamps: true
});

// Middleware pour convertir les ObjectId en chaînes de caractères avant la sauvegarde
projetSchema.pre('save', function(next) {
  if (this.projets && this.projets.length > 0) {
    this.projets = this.projets.map(projet => {
      if (projet.module && typeof projet.module === 'object' && projet.module._id) {
        projet.module = projet.module._id.toString();
      }
      if (projet.professeur && typeof projet.professeur === 'object' && projet.professeur._id) {
        projet.professeur = projet.professeur._id.toString();
      }
      return projet;
    });
  }
  next();
});

module.exports = mongoose.model('Projet', projetSchema);