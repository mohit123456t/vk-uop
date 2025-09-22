import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import Loader from './Loader';

interface PrivateRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userProfile } = authService.useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

export default PrivateRoute;
