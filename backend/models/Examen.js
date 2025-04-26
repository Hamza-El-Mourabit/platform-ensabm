const mongoose = require('mongoose');

const examenSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  heureDebut: {
    type: String,
    required: true
  },
  heureFin: {
    type: String,
    required: true
  },
  salle: {
    type: String,
    required: true
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
  module: {
    type: String,
    required: true
  },
  professeur: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Contrôle Continu', 'Examen Final', 'Rattrapage']
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

module.exports = mongoose.model('Examen', examenSchema);
