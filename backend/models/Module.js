const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filiere: {
    type: String,
    required: true,
    trim: true,
    enum: ['iacs', 'aa', 'g2er', 'tdi', 'tous'] // Ajouter l'option 'tous' pour les modules communs
  },
  annee: {
    type: String,
    required: true,
    trim: true,
    enum: ['1', '2', '3', 'tous'] // Ajouter l'option 'tous' pour les modules communs
  },
  professeurs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  }]
}, {
  timestamps: true
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
