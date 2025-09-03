const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get notifications for the authenticated user
router.get('/', notificationController.getUserNotifications);

// Mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Seed notifications for testing (development only)
router.post('/seed', notificationController.seedNotifications);

module.exports = router;
