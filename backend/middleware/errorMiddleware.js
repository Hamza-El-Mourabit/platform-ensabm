// Middleware pour gérer les erreurs 404 (Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware pour gérer les erreurs générales
const errorHandler = (err, req, res, next) => {
  // Si le statut est 200 mais qu'il y a une erreur, on le change en 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error('Erreur détectée:', err.message);
  console.error('Stack trace:', err.stack);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { notFound, errorHandler };
