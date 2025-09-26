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

  if (!authState.isAuthenticated) {
    return <Navigate to="/role-login" replace />;
  }

  if (requiredRole && authState.userProfile && authState.userProfile.role !== requiredRole) {
    // Special case for Super Admin
    if (authState.userProfile.role === 'super_admin' && requiredRole === 'super_admin') {
      return children;
    }
    return <Navigate to="/role-login" replace />;
  }

  return children;
};

export default PrivateRoute;
