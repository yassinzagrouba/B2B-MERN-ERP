import { useState, useEffect } from "react";
import { notificationService, Notification } from "../services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // For handling API errors
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications(page, limit);
      setNotifications(response);
      
      // Update pagination info (if API provides it)
      // Since we're using fallback data in case of API errors, this might not always be available
      if ('pagination' in response) {
        const paginationInfo = (response as any).pagination;
        setTotal(paginationInfo.total || 0);
        setTotalPages(paginationInfo.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when page or limit changes
  useEffect(() => {
    fetchNotifications();
  }, [page, limit]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // We'll use the formatTimeAgo method from our service

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">All Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <svg 
              width="16" 
              height="16" 
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
            Mark all as read
          </button>
          <button
            onClick={refreshNotifications}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <svg 
              width="16" 
              height="16" 
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
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <svg 
            className="w-16 h-16 text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          <p className="text-xl font-medium text-gray-500 dark:text-gray-400">No notifications</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-theme-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <li key={notification._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img 
                        src={notification.userImage || `/images/user/user-0${Math.floor(Math.random() * 5) + 1}.jpg`} 
                        alt={notification.userName || 'User'} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          notification.userStatus === 'online' ? 'bg-success-500' : 'bg-error-500'
                        }`}
                      ></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <span>{notification.userName || 'System'}</span>
                          <span className="font-normal text-gray-600 dark:text-gray-400"> {notification.content}</span>
                        </p>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{notification.type === 'project' ? 'Project' : notification.type === 'message' ? 'Message' : notification.type === 'order' ? 'Order' : 'Alert'}</span>
                          <span>•</span>
                          <span>{notificationService.formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Mark as read"
                        >
                          <svg 
                            width="16" 
                            height="16" 
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
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && notifications.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex-1 text-sm text-gray-700 dark:text-gray-400">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              } border border-gray-300 dark:border-gray-700`}
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show current page and nearby pages
                let pageToShow = page;
                if (page <= 3) {
                  pageToShow = i + 1;
                } else if (page >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = page - 2 + i;
                }
                
                if (pageToShow > 0 && pageToShow <= totalPages) {
                  return (
                    <button
                      key={pageToShow}
                      onClick={() => setPage(pageToShow)}
                      className={`px-3 py-1 rounded-md ${
                        pageToShow === page
                          ? "bg-brand-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      } border border-gray-300 dark:border-gray-700`}
                    >
                      {pageToShow}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              } border border-gray-300 dark:border-gray-700`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
