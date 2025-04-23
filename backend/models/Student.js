const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  cin: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  apogee: {
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
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  filiere: {
    type: String,
    required: true,
    trim: true
  },
  annee: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.isNew; // Le mot de passe est requis uniquement lors de la création
    }
  }
}, {
  timestamps: true
});

// Méthode pour comparer les mots de passe
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;