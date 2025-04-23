const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getStatistics,
  getStudentStatistics
} = require('../controllers/statisticsController');

// Routes protégées
router.get('/', protect, getStatistics);
router.get('/student', protect, getStudentStatistics);

module.exports = router;
