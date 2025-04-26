const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');
const path = require('path');

// Route pour uploader une image (accessible aux administrateurs et aux utilisateurs)
router.post('/image', protect, upload.single('image'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }

    // Construire l'URL de l'image
    // Utiliser une URL absolue pour le frontend
    const imageUrl = `http://localhost:5000/uploads/formations/${req.file.filename}`;

    // Retourner l'URL de l'image
    res.status(200).json({
      message: 'Image uploadée avec succès',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
  }
});

module.exports = router;
