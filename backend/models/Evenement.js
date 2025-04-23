const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
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
  evenements: [{
    titre: {
      type: String,
      required: true
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
    lieu: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['conference', 'seminaire', 'workshop', 'autre']
    },
    description: String,
    organisateur: String,
    participants: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Evenement', evenementSchema); 