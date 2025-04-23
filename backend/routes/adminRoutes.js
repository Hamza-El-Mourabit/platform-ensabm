const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  registerAdmin,
  getAdminProfile
} = require('../controllers/adminAuthController');
const {
  getEtudiants,
  getEtudiantById,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/login', loginAdmin);

// Routes protégées pour l'administration
router.post('/register', protect, admin, registerAdmin); // Seul un admin peut créer un autre admin
router.get('/profile', protect, admin, getAdminProfile);

// Routes protégées pour la gestion des étudiants
router.get('/etudiants', protect, admin, getEtudiants);
router.post('/etudiants', protect, admin, createEtudiant);
router.get('/etudiants/:id', protect, admin, getEtudiantById);
router.put('/etudiants/:id', protect, admin, updateEtudiant);
router.delete('/etudiants/:id', protect, admin, deleteEtudiant);

module.exports = router;
