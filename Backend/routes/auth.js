// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');
require('dotenv').config();

const router = express.Router();

// Helper function to generate tokens
const generateTokens = (userId, userRole) => {
  const accessToken = jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Inscrire un nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user' // Use provided role or default to 'user'
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    console.error('Erreur inscription :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Compare le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate access and refresh tokens
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug line
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token to database
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Retourner les tokens et les infos utiles
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      bearerToken: `Bearer ${accessToken}`, // Ready to copy-paste for manual use
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: `Connecté en tant que ${user.role}`,
      tokenInfo: {
        accessTokenExpires: '15 minutes',
        refreshTokenExpires: '7 days'
      },
      instructions: {
        automatic: "Tokens saved as cookies - automatic refresh when access token expires",
        manual: "For API testing tools, use the 'bearerToken' value in Authorization header"
      }
    });
  } catch (err) {
    console.error('Erreur login :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token manquant' 
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(403).json({ 
        success: false,
        message: 'Refresh token invalide' 
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      tokenObj => tokenObj.token !== refreshToken
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    // Set new tokens as cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      bearerToken: `Bearer ${accessToken}`,
      message: 'Tokens rafraîchis avec succès'
    });

  } catch (error) {
    console.error('Erreur refresh :', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors du rafraîchissement' 
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const user = req.user;
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur profile :', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération du profil' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (clear cookies and remove refresh tokens)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Remove refresh token from database
      await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Déconnecté avec succès'
    });
  } catch (error) {
    console.error('Erreur logout :', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la déconnexion' 
    });
  }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices (remove all refresh tokens)
router.post('/logout-all', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Find user and remove all refresh tokens
      const user = await User.findOne({
        'refreshTokens.token': refreshToken
      });

      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Déconnecté de tous les appareils'
    });
  } catch (error) {
    console.error('Erreur logout-all :', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la déconnexion' 
    });
  }
});

module.exports = router;

