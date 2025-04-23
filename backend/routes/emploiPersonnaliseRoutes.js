const express = require('express');
const router = express.Router();
const {
  createEmploiPersonnalise,
  getEmploisPersonnalises,
  getEmploiPersonnaliseById,
  updateEmploiPersonnalise,
  deleteEmploiPersonnalise,
  getEmploisPersonnalisesEtudiant
} = require('../controllers/emploiPersonnaliseController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes accessibles uniquement par les admins
router.post('/', protect, admin, createEmploiPersonnalise);
router.get('/', protect, admin, getEmploisPersonnalises);
router.put('/:id', protect, admin, updateEmploiPersonnalise);
router.delete('/:id', protect, admin, deleteEmploiPersonnalise);

// Routes accessibles par les étudiants et les admins
router.get('/etudiant/:id', protect, getEmploisPersonnalisesEtudiant);
router.get('/etudiant', protect, getEmploisPersonnalisesEtudiant); // Pour l'étudiant connecté
router.get('/:id', protect, getEmploiPersonnaliseById);

module.exports = router;
