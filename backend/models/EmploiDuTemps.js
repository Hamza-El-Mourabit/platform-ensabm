const mongoose = require('mongoose');

const emploiDuTempsSchema = new mongoose.Schema({
  filiere: {
    type: String,
    required: true,
    trim: true,
    enum: ['iacs', 'aa', 'g2er', 'tdi', 'tous'] // Ajouter l'option 'tous' pour les emplois concernant toutes les filières
  },
  annee: {
    type: String,
    required: true,
    trim: true,
    enum: ['1', '2', '3', 'tous'] // Ajouter l'option 'tous' pour les emplois concernant toutes les années
  },
  semaine: {
    type: Number,
    default: 1, // Par défaut, semaine 1
    min: 1,
    max: 52 // Maximum 52 semaines dans une année
  },
  estPersonnalise: {
    type: Boolean,
    default: false
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: function() { return this.estPersonnalise; }
  },
  // Le champ etudiants devient optionnel - utilisé uniquement pour des cas spécifiques
  etudiants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  titre: {
    type: String,
    trim: true,
    required: function() { return this.estPersonnalise; }
  },
  description: {
    type: String,
    trim: true
  },
  // Champ pour indiquer si l'emploi est pour toute la filière ou pour des étudiants spécifiques
  pourTouteFiliere: {
    type: Boolean,
    default: true,
    required: true // Rendre ce champ obligatoire
  },
  emplois: [
    {
      jour: {
        type: String,
        required: true,
        enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
      },
      creneaux: [
        {
          module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            required: true
          },
          debut: {
            type: String,
            required: true
          },
          fin: {
            type: String,
            required: true
          },
          salle: {
            type: String,
            required: true
          },
          professeur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Professor',
            required: true
          }
        }
      ]
    }
  ]
}, {
  timestamps: true
});

const EmploiDuTemps = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);

module.exports = EmploiDuTemps;