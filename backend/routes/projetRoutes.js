const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProjets,
  getAllProjets,
  createProjet,
  updateProjet,
  deleteProjet
} = require('../controllers/projetController');

// Route pour récupérer tous les projets (pour l'admin)
router.get('/all', protect, admin, getAllProjets);

// Routes protégées par authentification
router.get('/:filiere/:annee', protect, getProjets);
router.post('/', protect, admin, createProjet);
router.put('/:filiere/:annee', protect, admin, updateProjet);
router.delete('/:filiere/:annee', protect, admin, deleteProjet);

module.exports = router;