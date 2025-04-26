const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllEvenements,
  getEvenementsByFiliereAnnee,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement
} = require('../controllers/evenementController');

// Route pour récupérer tous les événements (pour l'admin)
router.get('/all', protect, admin, getAllEvenements);

// Routes pour les étudiants et les admins
router.get('/:filiere/:annee', protect, getEvenementsByFiliereAnnee);
router.get('/:id', protect, getEvenementById);

// Routes protégées pour les admins uniquement
router.post('/', protect, admin, createEvenement);
router.put('/:id', protect, admin, updateEvenement);
router.delete('/:id', protect, admin, deleteEvenement);

module.exports = router;