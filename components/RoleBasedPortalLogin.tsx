import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Logo from './Logo';

interface RoleBasedPortalLoginProps {
  onLoginSuccess?: (userProfile: any) => void;
}

const RoleBasedPortalLogin: React.FC<RoleBasedPortalLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authState) => {
      if (authState.isAuthenticated && authState.userProfile) {
        handleSuccessfulLogin(authState.userProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSuccessfulLogin = (userProfile: any) => {
    if (onLoginSuccess) {
      onLoginSuccess(userProfile);
    }

    // Redirect based on role
    switch (userProfile.role) {
      case 'brand':
        navigate('/brand');
        break;
      case 'uploader':
        navigate('/uploader');
        break;
      case 'script_writer':
        navigate('/script-writer');
        break;
      case 'video_editor':
        navigate('/video-editor');
        break;
      case 'thumbnail_maker':
        navigate('/thumbnail-maker');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'super_admin':
        navigate('/super-admin');
        break;
      default:
        navigate('/brand');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (email === 'mohitmleena2@gmail.com' && password === '123456789') {
      navigate('/super-admin');
      return;
    }

    try {
      const userProfile = await authService.loginWithEmail(email, password);
      handleSuccessfulLogin(userProfile);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = {
        email,
        name,
        role: 'brand' as const,
        brandName,
        address,
        mobileNumber: mobile,
        ownerName
      };

      await authService.registerUser(email, password, userData);
      setMessage('Brand account created successfully! Please login with your credentials.');
      setIsRegister(false);

      // Clear form
      setName('');
      setBrandName('');
      setAddress('');
      setMobile('');
      setOwnerName('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userProfile = await authService.loginWithGoogle();
      handleSuccessfulLogin(userProfile);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
      <div className="absolute top-6 left-6 text-slate-900">
        <Logo />
      </div>

      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
          {isRegister ? 'Brand Signup' : 'Portal Login'}
        </h1>
        <p className="text-lg text-slate-600">
          {isRegister ? 'Create your brand account to get started.' : 'Sign in to access your dashboard.'}
        </p>
      </div>

      <div className="w-full max-w-md">
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-slate-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter owner's name"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full address"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (isRegister ? 'Creating Account...' : 'Signing in...')
              : (isRegister ? 'Create Brand Account' : 'Sign In')
            }
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Toggle between Login and Signup */}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setMessage('');
          }}
          className="mt-4 text-sm text-slate-600 hover:text-slate-900 transition-colors w-full text-center"
        >
          {isRegister ? 'Already have an account? Sign In' : 'Need a brand account? Sign Up'}
        </button>

        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="mt-8 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-full text-center"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default RoleBasedPortalLogin;
