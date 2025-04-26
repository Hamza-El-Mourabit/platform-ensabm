const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getCompetences,
  updateCompetences,
  getCompetencesById,
  getAllCompetences
} = require('../controllers/competenceController');

// Route pour l'étudiant connecté
router.get('/', protect, getCompetences);

// Routes pour l'administration
router.get('/all', protect, admin, getAllCompetences);
router.get('/:id', protect, admin, getCompetencesById);
router.put('/:id', protect, admin, updateCompetences);

module.exports = router;
