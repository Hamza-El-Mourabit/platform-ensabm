const mongoose = require('mongoose');

const competenceSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  programmation: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  mathematiques: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  communication: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  travailEquipe: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  resolutionProblemes: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  gestionProjet: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Créer un index unique pour s'assurer qu'un étudiant n'a qu'un seul enregistrement de compétences
competenceSchema.index({ etudiant: 1 }, { unique: true });

const Competence = mongoose.model('Competence', competenceSchema);

module.exports = Competence;
