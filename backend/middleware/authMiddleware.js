const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token contains role
      if (decoded.role === 'admin') {
        // Get admin from token
        req.admin = await Admin.findById(decoded.id).select('-password');
        req.isAdmin = true;
      } else {
        // Get student from token
        req.student = await Student.findById(decoded.id).select('-password');
        req.isAdmin = false;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier si l'utilisateur est un admin
const admin = (req, res, next) => {
  if (req.isAdmin && req.admin) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès réservé aux administrateurs' });
  }
};

module.exports = { protect, admin };