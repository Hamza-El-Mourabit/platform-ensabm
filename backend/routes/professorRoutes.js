const express = require('express');
const router = express.Router();
const {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor
} = require('../controllers/professorController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes protégées par authentification admin
router.route('/')
  .get(protect, admin, getProfessors)
  .post(protect, admin, createProfessor);

// Route pour récupérer la liste des professeurs pour le formulaire de création d'emploi du temps
// Cette route est accessible à tous les utilisateurs authentifiés
router.route('/list').get(protect, getProfessors);

router.route('/:id')
  .get(protect, admin, getProfessorById)
  .put(protect, admin, updateProfessor)
  .delete(protect, admin, deleteProfessor);

module.exports = router;
