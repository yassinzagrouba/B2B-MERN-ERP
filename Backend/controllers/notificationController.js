const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Get notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get the user ID from the authenticated request
    const userId = new ObjectId(req.user.id);

    // Find notifications for this user
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate user info for these notifications
    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        // Only fetch user information if the notification has a relatedId and refers to a User
        if (notification.relatedId && notification.onModel === 'User') {
          try {
            const user = await User.findById(notification.relatedId).lean();
            
            if (user) {
              return {
                ...notification,
                userName: user.name,
                userImage: user.profileImage || `/images/user/user-0${Math.floor(Math.random() * 5) + 1}.jpg`, // Default image if none
                userStatus: user.isActive ? 'online' : 'offline'
              };
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
        
        // Default values if no user is found or there's an error
        return {
          ...notification,
          userName: 'System',
          userImage: '/images/user/user-01.jpg',
          userStatus: 'online'
        };
      })
    );

    // Get total count for pagination
    const totalNotifications = await Notification.countDocuments({ userId });

    res.status(200).json({
      notifications: populatedNotifications,
      pagination: {
        total: totalNotifications,
        page,
        limit,
        pages: Math.ceil(totalNotifications / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the notification belongs to the authenticated user
    const notification = await Notification.findOne({ 
      _id: id, 
      userId: req.user.id 
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or you do not have permission' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read', notificationId: id });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Create a notification (internal function, not exposed as API)
exports.createNotification = async (userId, content, type = 'alert', relatedId = null, onModel = null) => {
  try {
    const notification = new Notification({
      userId,
      content,
      type,
      relatedId,
      onModel
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the notification belongs to the authenticated user or user is admin
    const notification = await Notification.findOne({ 
      _id: id,
      userId: req.user.id
    });
    
    if (!notification && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Notification not found or you do not have permission' });
    }
    
    await Notification.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Notification deleted', notificationId: id });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id,
      isRead: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread notifications count', error: error.message });
  }
};

// Seed notifications for testing (development only)
exports.seedNotifications = async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'This endpoint is only available in development mode' });
    }
    
    const userId = req.user.id;
    const types = ['project', 'message', 'alert', 'order'];
    const contents = [
      'has requested access to your project',
      'sent you a message',
      'mentioned you in a comment',
      'has placed an order',
      'has updated their profile',
      'has shared a document with you'
    ];
    
    // Get some random users as related users
    const users = await User.find({ _id: { $ne: userId } }).limit(5).lean();
    
    // Create 10 random notifications
    const notifications = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)] || null;
      const notification = new Notification({
        userId,
        content: contents[Math.floor(Math.random() * contents.length)],
        type: types[Math.floor(Math.random() * types.length)],
        isRead: Math.random() > 0.7, // 30% chance to be read
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 3600000), // Random time within last 10 hours
        relatedId: randomUser?._id,
        onModel: randomUser ? 'User' : null
      });
      
      notifications.push(notification);
    }
    
    await Notification.insertMany(notifications);
    
    res.status(200).json({ 
      message: `${notifications.length} test notifications created`,
      notifications
    });
  } catch (error) {
    console.error('Error seeding notifications:', error);
    res.status(500).json({ message: 'Failed to seed notifications', error: error.message });
  }
};
