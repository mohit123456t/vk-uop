import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import authService from '../services/authService';
import Logo from './Logo';
import Loader from './Loader';

const RoleBasedPortalLogin: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, isLoading } = authService.useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // This effect handles the initial state. If the user is already authenticated
    // when they land here, the redirection logic below will handle them.
  }, [isAuthenticated, isLoading]);

  const handleSignIn = async (signInMethod: () => Promise<void>) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInMethod();
      // After a successful sign-in, the auth state will update, and this component
      // will re-render. The logic below will then handle the redirection.
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }
    handleSignIn(() => authService.signIn(email, password));
  };

  const handleGoogleSignIn = () => {
    handleSignIn(authService.signInWithGoogle);
  };

  // --- Core Logic --- //

  // 1. While auth state is loading, show a loader.
  if (isLoading) {
    return <Loader />;
  }

  // 2. If the user is authenticated, handle redirection.
  if (isAuthenticated) {
    // If the user profile is still loading, wait.
    if (!userProfile) {
      return <Loader />;
    }

    // Profile is loaded, now redirect based on role.
    switch (userProfile.role) {
        case 'admin': return <Navigate to="/admin" replace />;
        case 'brand': return <Navigate to="/brand" replace />;
        case 'thumbnail-maker': return <Navigate to="/thumbnail" replace />;
        case 'script-writer': return <Navigate to="/scriptwriter" replace />;
        case 'video-editor': return <Navigate to="/videoeditor" replace />;
        case 'uploader': return <Navigate to="/uploader" replace />;
        default:
            console.error(`Unknown user role: '${userProfile.role}'. Redirecting to landing.`);
            return <Navigate to="/" replace />;
    }
  }

  // 3. If the user is NOT authenticated, show the login form.
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-6">Sign in to your dashboard.</p>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
          
          <form onSubmit={handleEmailSignIn}>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="text-right my-4">
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot Password?
                </a>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-opacity duration-300 flex justify-center items-center"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-400">or</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-opacity duration-300 flex justify-center items-center"
          >
             {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div> : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedPortalLogin;
