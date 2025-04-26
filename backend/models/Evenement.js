const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  lieu: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Conférence', 'Atelier', 'Séminaire', 'Compétition', 'Autre']
  },
  organisateur: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  filiere: {
    type: String,
    required: true,
    enum: ['iacs', 'aa', 'g2er', 'tdi', 'tous']
  },
  annee: {
    type: String,
    required: true,
    enum: ['1', '2', '3', 'tous']
  },
  pourTouteFiliere: {
    type: Boolean,
    default: true
  },
  etudiants: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evenement', evenementSchema);