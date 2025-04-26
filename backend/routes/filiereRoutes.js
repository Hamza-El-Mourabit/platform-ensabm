const express = require('express');
const router = express.Router();
const { getFilieres } = require('../controllers/filiereController');

// Route publique pour récupérer toutes les filières
router.get('/', getFilieres);

module.exports = router;
