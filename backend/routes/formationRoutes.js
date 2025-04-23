const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFormations,
  getLatestFormations,
  createFormation,
  updateFormation,
  deleteFormation
} = require('../controllers/formationController');

// Routes publiques
router.get('/', getFormations);
router.get('/latest', getLatestFormations);

// Routes protégées par authentification
router.post('/', protect, createFormation);
router.put('/:id', protect, updateFormation);
router.delete('/:id', protect, deleteFormation);

module.exports = router;
