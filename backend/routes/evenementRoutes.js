const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getEvenements,
  updateEvenements,
  deleteEvenements
} = require('../controllers/evenementController');

// Routes protégées par authentification
router.get('/:filiere/:annee', protect, getEvenements);
router.put('/:filiere/:annee', protect, updateEvenements);
router.delete('/:filiere/:annee', protect, deleteEvenements);

module.exports = router; 