import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { authService } from '../../services/authService';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;
