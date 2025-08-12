const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Test route without authentication
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working!' });
});

// Public routes for testing (remove in production)
router.get('/public', userController.getAllUsers);
router.get('/public/:id', userController.getUserById);
router.put('/public/:id', userController.updateUser);
router.delete('/public/:id', userController.deleteUser);

// Special route to make a user admin (for testing only)
router.patch('/make-admin/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User promoted to admin', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Apply authentication middleware to protected routes
router.use(verifyToken);
router.use(isAdmin);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
