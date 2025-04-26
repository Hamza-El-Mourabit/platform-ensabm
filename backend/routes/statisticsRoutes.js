const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getStatistics,
  getStudentStatistics,
  getHomeStatistics
} = require('../controllers/statisticsController');

// Route publique pour la page d'accueil
router.get('/home', getHomeStatistics);

// Routes protégées
router.get('/', protect, getStatistics);
router.get('/student', protect, getStudentStatistics);

module.exports = router;
