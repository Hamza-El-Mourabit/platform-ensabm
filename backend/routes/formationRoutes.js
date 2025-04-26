const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getFormations,
  getFormationById,
  getLatestFormations,
  createFormation,
  updateFormation,
  deleteFormation,
  getStudentFormations,
  getStudentInscriptions,
  getFormationStudents,
  inscriptionFormation,
  desinscriptionFormation
} = require('../controllers/formationController');

// Routes publiques
router.get('/', getFormations);
router.get('/latest', getLatestFormations);

// Routes pour récupérer les formations d'un étudiant (protégées)
router.get('/etudiant', protect, getStudentFormations);
router.get('/etudiant/inscriptions', protect, getStudentInscriptions);

// Route pour récupérer une formation par ID
router.get('/:id', getFormationById);

// Routes pour l'inscription/désinscription (protégées)
router.post('/:id/inscription', protect, inscriptionFormation);
router.delete('/:id/inscription', protect, desinscriptionFormation);
router.delete('/:id/inscription/:studentId', protect, admin, desinscriptionFormation);

// Route pour récupérer les étudiants inscrits à une formation (admin seulement)
router.get('/:id/etudiants', protect, admin, getFormationStudents);

// Routes protégées par authentification admin
router.post('/', protect, admin, createFormation);
router.put('/:id', protect, admin, updateFormation);
router.delete('/:id', protect, admin, deleteFormation);

module.exports = router;
