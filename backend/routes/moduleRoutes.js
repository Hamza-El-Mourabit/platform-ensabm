const express = require('express');
const router = express.Router();
const {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getModulesByFiliereAndAnnee,
  getModulesByProfessor,
  getModulesList
} = require('../controllers/moduleController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes protégées par authentification admin
router.route('/')
  .get(protect, admin, getModules)
  .post(protect, admin, createModule);

router.route('/:id')
  .get(protect, admin, getModuleById)
  .put(protect, admin, updateModule)
  .delete(protect, admin, deleteModule);

// Route pour récupérer les modules par filière et année
router.route('/filiere/:filiere/annee/:annee')
  .get(protect, getModulesByFiliereAndAnnee);

// Route pour récupérer les modules par professeur
router.route('/professeur/:id')
  .get(protect, getModulesByProfessor);

// Route pour récupérer la liste des modules pour le formulaire de création d'emploi du temps
router.route('/list')
  .get(protect, getModulesList);

module.exports = router;
