const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Login student
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { cin, apogee } = req.body;

    // Vérifier si l'étudiant existe
    const student = await Student.findOne({ cin });
    if (!student) {
      return res.status(401).json({ message: 'CIN ou numéro apogée incorrect' });
    }

    // Vérifier le numéro apogée
    if (student.apogee !== apogee) {
      return res.status(401).json({ message: 'CIN ou numéro apogée incorrect' });
    }

    // Créer le token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      _id: student._id,
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      filiere: student.filiere,
      annee: student.annee,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { cin, apogee, nom, prenom, email, filiere, annee } = req.body;

    // Vérifier si l'étudiant existe déjà
    const studentExists = await Student.findOne({ $or: [{ cin }, { apogee }, { email }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Étudiant déjà enregistré' });
    }

    // Créer l'étudiant
    const student = await Student.create({
      cin,
      apogee,
      nom,
      prenom,
      email,
      filiere,
      annee
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        filiere: student.filiere,
        annee: student.annee
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register
}; 