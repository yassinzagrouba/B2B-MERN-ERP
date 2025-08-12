// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis plusieurs sources
    let token = null;
    
    // 1. Depuis l'en-tête Authorization (Bearer token)
    if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }
    
    // 2. Depuis les cookies (accessToken en priorité, puis token pour compatibilité)
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token; // Backward compatibility
    }
    
    // 3. Depuis le body de la requête (pour certains cas)
    else if (req.body && req.body.accessToken) {
      token = req.body.accessToken;
    }
    else if (req.body && req.body.token) {
      token = req.body.token; // Backward compatibility
    }
    
    // 4. Depuis les query parameters
    else if (req.query && req.query.accessToken) {
      token = req.query.accessToken;
    }
    else if (req.query && req.query.token) {
      token = req.query.token; // Backward compatibility
    }
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Accès refusé. Token manquant.',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expiré. Utilisez le refresh token.',
          code: 'TOKEN_EXPIRED',
          shouldRefresh: true
        });
      }
      throw error;
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    req.user = user; // Ajouter les infos utilisateur à la requête
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Token invalide.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Accès refusé. Privilèges administrateur requis.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
