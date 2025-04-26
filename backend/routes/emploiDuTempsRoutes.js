const express = require('express');
const router = express.Router();
const {
  getEmploiDuTemps,
  createEmploiDuTemps,
  updateEmploiDuTemps,
  getSemainesDisponibles
} = require('../controllers/emploiDuTempsController');
const { protect } = require('../middleware/authMiddleware');

// Routes protégées
router.get('/:filiere/:annee', protect, getEmploiDuTemps);
router.get('/:filiere/:annee/semaines', protect, getSemainesDisponibles);
router.post('/', protect, createEmploiDuTemps);
router.put('/:id', protect, updateEmploiDuTemps);

module.exports = router;