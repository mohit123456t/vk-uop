import React, { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService, { AuthState } from '../services/authService';

interface PrivateRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((newAuthState) => {
      setAuthState(newAuthState);
    });

    return () => unsubscribe();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authState.isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  if (requiredRole && authState.userProfile) {
    const userRole = authState.userProfile.role;
    if (userRole === requiredRole || userRole === 'super_admin') {
      return children;
    }
    return <Navigate to="/portal" replace />;
  }

  return children;
};

export default PrivateRoute;
