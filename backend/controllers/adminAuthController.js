const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @desc    Authentifier un admin et générer un token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'admin existe
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Vérifier si le mot de passe est correct
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Renvoyer les informations de l'admin et le token
    res.json({
      _id: admin._id,
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enregistrer un nouvel admin
// @route   POST /api/admin/register
// @access  Private (Super Admin only)
const registerAdmin = async (req, res) => {
  try {
    const { username, password, email, nom, prenom } = req.body;

    // Vérifier si l'admin existe déjà
    const adminExists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (adminExists) {
      return res.status(400).json({ message: 'Cet administrateur existe déjà' });
    }

    // Créer un nouvel admin
    const admin = await Admin.create({
      username,
      password,
      email,
      nom,
      prenom
    });

    if (admin) {
      // Générer un token JWT
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(201).json({
        _id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        token
      });
    } else {
      res.status(400).json({ message: 'Données administrateur invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir le profil de l'admin connecté
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
  getAdminProfile
};
