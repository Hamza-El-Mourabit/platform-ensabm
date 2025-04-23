const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// @desc    Récupérer tous les étudiants
// @route   GET /api/admin/etudiants
// @access  Private (Admin only)
const getEtudiants = async (req, res) => {
  try {
    const etudiants = await Student.find().select('-__v');
    res.json(etudiants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un étudiant par ID
// @route   GET /api/admin/etudiants/:id
// @access  Private (Admin only)
const getEtudiantById = async (req, res) => {
  try {
    const etudiant = await Student.findById(req.params.id).select('-__v');

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json(etudiant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour un étudiant
// @route   PUT /api/admin/etudiants/:id
// @access  Private (Admin only)
const updateEtudiant = async (req, res) => {
  try {
    const { cin, apogee, nom, prenom, email, password, filiere, annee } = req.body;

    const etudiant = await Student.findById(req.params.id);

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre étudiant
    if (email && email !== etudiant.email) {
      const emailExists = await Student.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Vérifier si le CIN est déjà utilisé par un autre étudiant
    if (cin && cin !== etudiant.cin) {
      const cinExists = await Student.findOne({ cin, _id: { $ne: req.params.id } });
      if (cinExists) {
        return res.status(400).json({ message: 'Ce CIN est déjà utilisé' });
      }
    }

    // Vérifier si le numéro apogée est déjà utilisé par un autre étudiant
    if (apogee && apogee !== etudiant.apogee) {
      const apogeeExists = await Student.findOne({ apogee, _id: { $ne: req.params.id } });
      if (apogeeExists) {
        return res.status(400).json({ message: 'Ce numéro apogée est déjà utilisé' });
      }
    }

    // Mettre à jour l'étudiant
    etudiant.cin = cin || etudiant.cin;
    etudiant.apogee = apogee || etudiant.apogee;
    etudiant.nom = nom || etudiant.nom;
    etudiant.prenom = prenom || etudiant.prenom;
    etudiant.email = email || etudiant.email;
    etudiant.filiere = filiere || etudiant.filiere;
    etudiant.annee = annee || etudiant.annee;

    // Mettre à jour le mot de passe uniquement s'il est fourni
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      etudiant.password = await bcrypt.hash(password, salt);
    }

    const updatedEtudiant = await etudiant.save();

    // Ne pas renvoyer le mot de passe dans la réponse
    const etudiantResponse = {
      _id: updatedEtudiant._id,
      cin: updatedEtudiant.cin,
      apogee: updatedEtudiant.apogee,
      nom: updatedEtudiant.nom,
      prenom: updatedEtudiant.prenom,
      email: updatedEtudiant.email,
      filiere: updatedEtudiant.filiere,
      annee: updatedEtudiant.annee
    };

    res.json(etudiantResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'\u00e9tudiant:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer un nouvel étudiant
// @route   POST /api/admin/etudiants
// @access  Private (Admin only)
const createEtudiant = async (req, res) => {
  try {
    const { cin, apogee, nom, prenom, email, password, filiere, annee } = req.body;

    // Vérifier si l'étudiant existe déjà
    const etudiantExists = await Student.findOne({ $or: [{ cin }, { apogee }, { email }] });
    if (etudiantExists) {
      return res.status(400).json({ message: 'Étudiant déjà enregistré (CIN, Apogée ou Email déjà utilisé)' });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'étudiant
    const etudiant = await Student.create({
      cin,
      apogee,
      nom,
      prenom,
      email,
      password: hashedPassword,
      filiere,
      annee
    });

    if (etudiant) {
      // Ne pas renvoyer le mot de passe dans la réponse
      const etudiantResponse = {
        _id: etudiant._id,
        cin: etudiant.cin,
        apogee: etudiant.apogee,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        filiere: etudiant.filiere,
        annee: etudiant.annee
      };

      res.status(201).json(etudiantResponse);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un étudiant
// @route   DELETE /api/admin/etudiants/:id
// @access  Private (Admin only)
const deleteEtudiant = async (req, res) => {
  try {
    const etudiant = await Student.findById(req.params.id);

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    await etudiant.deleteOne(); // Utiliser deleteOne() au lieu de remove() qui est déprécié

    res.json({ message: 'Étudiant supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEtudiants,
  getEtudiantById,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant
};
