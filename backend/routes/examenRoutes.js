const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllExamens,
  getExamensByFiliereAnnee,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen,
  synchronizeAllExams,
  cleanupPlanningExams,
  removeOrphanExams,
  compareExams,
  forceResync
} = require('../controllers/examenController');

// Route pour récupérer tous les examens (pour l'admin)
router.get('/all', protect, admin, getAllExamens);

// Routes pour les étudiants et les admins
router.get('/:filiere/:annee', protect, getExamensByFiliereAnnee);
router.get('/:id', protect, getExamenById);

// Routes protégées pour les admins uniquement
router.post('/', protect, admin, createExamen);
router.put('/:id', protect, admin, updateExamen);
router.delete('/:id', protect, admin, deleteExamen);

// Route pour synchroniser tous les examens avec les plannings
router.post('/sync-all', protect, admin, synchronizeAllExams);

// Route pour nettoyer les plannings d'examens (supprimer les doublons)
router.post('/cleanup-plannings', protect, admin, cleanupPlanningExams);

// Route pour supprimer les examens orphelins
router.post('/remove-orphans', protect, admin, removeOrphanExams);

// Route pour comparer les examens entre les collections
router.get('/compare', protect, admin, compareExams);

// Route pour forcer une resynchronisation complète
router.post('/force-resync', protect, admin, forceResync);

module.exports = router;
