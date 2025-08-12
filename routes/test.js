/*// routes/test.js
const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Route protégée simple (utilisateur connecté)
router.get('/private', verifyToken, (req, res) => {
  res.json({
    message: `Bienvenue utilisateur connecté !`,
    user: req.user
  });
});

// Route réservée aux admins
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.json({
    message: 'Bienvenue, admin !',
    user: req.user
  });
});

module.exports = router;*/
