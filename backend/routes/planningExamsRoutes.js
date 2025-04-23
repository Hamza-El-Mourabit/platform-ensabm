const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPlanningExams,
  createPlanningExams,
  updatePlanningExams,
  deletePlanningExams
} = require('../controllers/planningExamsController');

// Routes protégées par authentification
router.get('/:filiere/:annee', protect, getPlanningExams);
router.post('/', protect, createPlanningExams);
router.put('/:filiere/:annee', protect, updatePlanningExams);
router.delete('/:filiere/:annee', protect, deletePlanningExams);

module.exports = router; 