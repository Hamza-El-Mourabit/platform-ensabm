const mongoose = require('mongoose');

const planningExamsSchema = new mongoose.Schema({
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
  examens: [{
    module: {
      type: String,
      required: true
    },
    date: {
      type: Date,
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
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('PlanningExams', planningExamsSchema); 