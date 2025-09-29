// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');
const { sendEmail } = require('../config/nodemailer');
require('dotenv').config();

const router = express.Router();

// Helper function to generate tokens
const generateTokens = (userId, userRole) => {
  const accessToken = jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // 30 days instead of 7 days
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register-admin
// @desc    Inscrire un nouvel administrateur (pour le dashboard)
router.post('/register-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur admin
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin' // Force admin role
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'Administrateur créé avec succès',
      isAdmin: true
    });
  } catch (err) {
    console.error('Erreur inscription admin :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

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

    // Déterminer si la requête vient du dashboard
    const isDashboard = req.get('X-Source') === 'dashboard' || 
                        req.get('Referer')?.includes('/dashboard') ||
                        req.body.source === 'dashboard';
    
    // Créer un nouvel utilisateur (admin par défaut si depuis le dashboard)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: isDashboard ? 'admin' : (role || 'user') // Auto-assign admin role if from dashboard
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
    
    // Clean up any expired refresh tokens
    await cleanupExpiredTokens(user._id);

    // Set tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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
        accessTokenExpires: '30 days',
        refreshTokenExpires: '30 days'
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

// Helper function to clean up expired refresh tokens
const cleanupExpiredTokens = async (userId) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await User.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: { createdAt: { $lt: thirtyDaysAgo } } } }
    );
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

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
    
    // Clean up any expired refresh tokens
    await cleanupExpiredTokens(user._id);

    // Set new tokens as cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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

// @route   POST /api/auth/forgot-password
// @desc    Request password reset, send email with token
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Forgot password request received:');
    console.log('Request body:', req.body);
    console.log('Headers:', req.headers);
    
    const { email } = req.body;

    if (!email) {
      console.log('Email is missing in request');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    console.log('Processing forgot password for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, we still return a success message even if the email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration on user model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create frontend reset URL based on environment
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`Using frontend base URL: ${frontendBaseUrl}`);
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;

    // Create email content for password reset
    const mailOptions = {
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        This link will expire in 1 hour.\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the button below, or copy the link into your browser to complete the process:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p style="margin-top: 30px;"><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>The token is: ${resetToken}</p>
        </div>
      `
    };

    // Force using Gmail for password reset emails (even in dev mode)
    // This ensures password resets actually reach the user
    const previousEmailSetting = process.env.USE_REAL_EMAIL;
    process.env.USE_REAL_EMAIL = 'true';
    process.env.FORCE_GMAIL = 'true';
    
    // Send email using our centralized email service
    console.log(`Attempting to send password reset email to: ${email}`);
    const emailResult = await sendEmail(mailOptions);
    
    // Add reset token to response in development mode only
    const response = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };
    
    // Include helpful debug information in development environment
    if (process.env.NODE_ENV !== 'production') {
      response.token = resetToken;
      response.note = emailResult.success ? 
        'Real email was sent. Check your inbox.' : 
        'Email sending failed. See server logs for details.';
        
      if (emailResult.previewUrl) {
        response.previewUrl = emailResult.previewUrl;
      }
      
      if (!emailResult.success && emailResult.error) {
        response.emailError = emailResult.error;
      }
    }
    
    // Always log the token during development for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }
    
    // Restore previous setting
    process.env.USE_REAL_EMAIL = previousEmailSetting;
    process.env.FORCE_GMAIL = 'false';
    
    return res.json(response);
    
    // Check email sending result
    if (emailResult.success) {
      console.log(`Email sent successfully${emailResult.fallback ? ' (using fallback)' : ''}`);
    } else if (emailResult.error) {
      console.error(`Failed to send email: ${emailResult.error.message}`);
      // If there was a specific error with Gmail auth, provide guidance
      if (emailResult.error.code === 'EAUTH') {
        console.error('\nGmail authentication failed. Please ensure:');
        console.error('1. You\'re using an App Password, not a regular password');
        console.error('2. You\'ve followed the setup steps in EMAIL_SETUP_GUIDE.md');
      }
    }
    
    // Response configuration
    let responseData = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    // Add additional debug info in development mode
    if (process.env.NODE_ENV !== 'production') {
      if (emailResult.previewUrl) {
        responseData = {
          ...responseData,
          token: resetToken,
          previewUrl: emailResult.previewUrl,
          note: 'This is a test email. Click the preview URL to see the email content.'
        };
      } else if (emailResult.success) {
        responseData = {
          ...responseData,
          token: resetToken,
          note: emailResult.fallback 
            ? 'Email sent using fallback service. Check the preview URL.' 
            : 'Real email was sent. Check your inbox.'
        };
      } else {
        responseData = {
          ...responseData,
          token: resetToken,
          emailError: `Failed to send email: ${emailResult.error?.message || 'Unknown error'}`,
          note: 'You can still use the token for testing. See EMAIL_SETUP_GUIDE.md for setup instructions.'
        };
      }
    }

    // Return response
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password'
    });
  }
});

module.exports = router;
