import axios from 'axios';

// Set the base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios to include credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Type definitions
export interface Notification {
  _id: string;
  userId: string;
  content: string;
  type: 'project' | 'message' | 'alert' | 'order';
  isRead: boolean;
  relatedId?: string;
  onModel?: string;
  createdAt: Date;
  userName?: string;
  userImage?: string;
  userStatus?: 'online' | 'offline' | 'error';
}

export interface PaginatedResponse<T> {
  notifications: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Fallback to mock data if API fails
const fallbackNotifications: Notification[] = [
  {
    _id: "1",
    userId: "2",
    userName: "Terry Franci",
    userImage: "/images/user/user-02.jpg",
    content: "requests permission to change Project - Nganter App",
    type: "project",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    userStatus: "online"
  },
  {
    _id: "2",
    userId: "3",
    userName: "Alena Franci",
    userImage: "/images/user/user-03.jpg",
    content: "requests permission to change Project - Nganter App",
    type: "project",
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 60000), // 8 minutes ago
    userStatus: "online"
  },
  {
    _id: "3",
    userId: "4",
    userName: "Jocelyn Kenter",
    userImage: "/images/user/user-04.jpg",
    content: "requests permission to change Project - Nganter App",
    type: "project",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    userStatus: "online"
  },
  {
    _id: "4",
    userId: "5",
    userName: "Brandon Philips",
    userImage: "/images/user/user-05.jpg",
    content: "requests permission to change Project - Nganter App",
    type: "project",
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
    userStatus: "error"
  }
];

/**
 * Service for handling notification-related API calls
 */
export const notificationService = {
  /**
   * Get notifications for the current user
   */
  getNotifications: async (page = 1, limit = 10): Promise<Notification[]> => {
    try {
      const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=${limit}`);
      return response.data.notifications;
    } catch (error) {
      console.error('Error fetching notifications, using fallback data:', error);
      // Use fallback data in case of error
      return fallbackNotifications;
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Handle error gracefully - update UI optimistically
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Handle error gracefully
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      // Count unread notifications from fallback data
      return fallbackNotifications.filter(n => !n.isRead).length;
    }
  },

  /**
   * Seed test notifications (development only)
   */
  seedTestNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await axios.post(`${API_URL}/notifications/seed`);
      return response.data.notifications;
    } catch (error) {
      console.error('Error seeding test notifications:', error);
      return [];
    }
  },

  /**
   * Format time relative to now (e.g., "5 min ago", "2 hrs ago")
   */
  formatTimeAgo: (timestamp: Date): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const secondsDiff = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (secondsDiff < 60) {
      return 'Just now';
    }
    
    const minutesDiff = Math.floor(secondsDiff / 60);
    if (minutesDiff < 60) {
      return `${minutesDiff} min${minutesDiff === 1 ? '' : 's'} ago`;
    }
    
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) {
      return `${hoursDiff} hr${hoursDiff === 1 ? '' : 's'} ago`;
    }
    
    const daysDiff = Math.floor(hoursDiff / 24);
    if (daysDiff < 7) {
      return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`;
    }
    
    // For older notifications, show the actual date
    return date.toLocaleDateString();
  }
};
