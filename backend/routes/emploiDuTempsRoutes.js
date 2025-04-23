const express = require('express');
const router = express.Router();
const { 
  getEmploiDuTemps, 
  createEmploiDuTemps, 
  updateEmploiDuTemps 
} = require('../controllers/emploiDuTempsController');
const { protect } = require('../middleware/authMiddleware');

// Routes protégées
router.get('/:filiere/:annee', protect, getEmploiDuTemps);
router.post('/', protect, createEmploiDuTemps);
router.put('/:id', protect, updateEmploiDuTemps);

module.exports = router; 