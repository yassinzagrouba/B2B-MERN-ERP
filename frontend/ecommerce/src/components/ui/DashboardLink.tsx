 import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

interface DashboardLinkProps {
  className?: string;
}

/**
 * Component that provides a link to the dashboard for admin users.
 * This helps connect the ecommerce frontend with the admin dashboard.
 */
const DashboardLink: React.FC<DashboardLinkProps> = ({ className }) => {
  const { user } = useAppSelector((state) => state.user);
  const [dashboardUrl, setDashboardUrl] = useState<string>('');
  
  useEffect(() => {
    // Set the dashboard URL based on environment or use default
    // For TypeScript with Vite, we need to handle environment variables differently
    const dashboardBaseUrl = (import.meta as any).env?.VITE_DASHBOARD_URL || 'http://localhost:3003';
    setDashboardUrl(dashboardBaseUrl);
  }, []);
  
  // Only show the dashboard link for admin users
  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <a 
      href={dashboardUrl} 
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center space-x-1 text-primary-600 hover:text-primary-800 font-medium ${className || ''}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 0v12h12V3H4z" 
          clipRule="evenodd" 
        />
        <path 
          fillRule="evenodd" 
          d="M4 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm1 0v8h10V4H5z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>Admin Dashboard</span>
    </a>
  );
};

export default DashboardLink;
