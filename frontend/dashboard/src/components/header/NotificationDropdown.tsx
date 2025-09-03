import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { notificationService, Notification } from "../../services/notificationService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications and update notification dot
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get notifications and unread count in parallel
      const [notificationsData, unreadCount] = await Promise.all([
        notificationService.getNotifications(1, 5), // Just get first 5 for dropdown
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setNotifying(unreadCount > 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const pollingInterval = setInterval(() => {
      if (!isOpen) { // Only poll when dropdown is closed
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(pollingInterval);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Handle notification click - mark as read and open dropdown
  const handleClick = () => {
    toggleDropdown();
    
    // Don't mark all as read automatically - let user decide
    // This is better UX - user might want to read the notifications first
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state optimistically
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
      
      // Check if we should still show the notification dot
      const hasUnread = notifications.some(n => n._id !== id && !n.isRead);
      setNotifying(hasUnread);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 z-50"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await notificationService.markAllAsRead();
                  const data = await notificationService.getNotifications(1, 5);
                  setNotifications(data);
                  setNotifying(false);
                } catch (error) {
                  console.error('Failed to mark all as read:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Mark all as read"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await notificationService.getNotifications(1, 5);
                  setNotifications(data);
                  // Check if there are any unread notifications
                  const unreadCount = await notificationService.getUnreadCount();
                  setNotifying(unreadCount > 0);
                } catch (error) {
                  console.error('Failed to refresh notifications:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Refresh notifications"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 4V9H9M20 20V15H15M20 9L16.0001 5.00003C14.5999 3.57339 12.7299 2.72547 10.7488 2.6231C8.76762 2.52073 6.81734 3.17393 5.29168 4.47636C3.76602 5.77879 2.78547 7.63082 2.52779 9.64805C2.27012 11.6653 2.75317 13.7182 3.87868 15.4246C5.00419 17.131 6.69356 18.3522 8.64621 18.8862C10.5988 19.4202 12.6879 19.2336 14.5 18.364C16.3121 17.4945 17.7428 15.997 18.5 14.1585" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Close"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-20">
              <p className="text-gray-500 dark:text-gray-400">Failed to load notifications</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <li key={notification._id}>
                <DropdownItem
                  onItemClick={() => {
                    closeDropdown();
                    handleMarkAsRead(notification._id);
                  }}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    <img
                      width={40}
                      height={40}
                      src={notification.userImage || `/images/user/user-0${Math.floor(Math.random() * 5) + 1}.jpg`}
                      alt={notification.userName || 'User'}
                      className="w-full overflow-hidden rounded-full"
                    />
                    <span className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${
                      notification.userStatus === 'online' ? 'bg-success-500' : 'bg-error-500'
                    } dark:border-gray-900`}></span>
                  </span>

                  <span className="block">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400 space-x-1">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notification.userName || 'System'}
                      </span>
                      <span>{notification.content}</span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{notification.type === 'project' ? 'Project' : notification.type === 'message' ? 'Message' : notification.type === 'order' ? 'Order' : 'Alert'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{notificationService.formatTimeAgo(notification.createdAt)}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-500">
              <p>No notifications</p>
            </li>
          )}
        </ul>
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={closeDropdown}
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
