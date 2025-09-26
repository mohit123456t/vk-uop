 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../services/firebase';
import { saveDataToFirestore } from '../services/saveDataToFirestore';
import { ICONS } from '../constants';
import Logo from './Logo';

const PortalLogin: React.FC = () => {
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
  const [user, setUser] = useState<any>(null);
  const [isRegister, setIsRegister] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Redirect logged-in user directly to brand panel
        console.log('User logged in:', user.email);
        navigate('/brand');
      } else {
        console.log('No user logged in');
        // If no user, stay on login/registration page
        if (window.location.pathname !== '/portal') {
          navigate('/portal');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to Firestore FIRST
      try {
        console.log('Saving user to Firestore:', {
          uid: user.uid,
          email: user.email,
          name: name,
          address: address,
          mobileNumber: mobile,
          ownerName: ownerName,
          brandName: brandName,
        });
        await saveDataToFirestore('users', {
          uid: user.uid,
          email: user.email,
          name: name,
          address: address,
          mobileNumber: mobile,
          ownerName: ownerName,
          brandName: brandName,
        });
      } catch (firestoreError) {
        console.error('Error writing user data to Firestore:', firestoreError);
        setError('Failed to save user data to Firestore. Please try again.');
      }

      // Add additional user info to Realtime Database
      await set(ref(database, 'users/' + user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        address: address,
        mobileNumber: mobile,
        ownerName: ownerName,
        brandName: brandName,
      }).catch((dbError) => {
        console.error('Error writing user data to Realtime Database:', dbError);
        setError('Failed to save user data. Please try again.');
      });

      // Sign out after registration so user can login manually
      await signOut(auth);
      setIsRegister(false);
      setMessage('Registration successful! Please login with your credentials.');
      navigate('/portal'); // Redirect explicitly to login page after sign out
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
      <div className="absolute top-6 left-6 text-slate-900">
        <Logo />
      </div>
      {user ? (
        <>
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
              Welcome
            </h1>
            <p className="text-lg text-slate-600">You are being redirected to your Brand Panel.</p>
            <p className="text-sm text-slate-500 mt-2">Logged in as {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
              {isRegister ? 'Register' : 'Login'}
            </h1>
            <p className="text-lg text-slate-600">{isRegister ? 'Create a new account to access the portal.' : 'Enter your credentials to access the portal.'}</p>
          </div>
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            {isRegister && (
              <>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="brandName" className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 mb-2">Owner Name</label>
                  <input
                    type="text"
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </>
            )}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded hover:bg-slate-700 transition"
            >
              {loading ? (isRegister ? 'Registering...' : 'Signing in...') : (isRegister ? 'Register' : 'Sign In')}
            </button>
            <div className="mt-4 text-center">
              <span className="text-sm text-slate-600">or</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition mt-4"
            >
              {loading ? 'Signing in...' : 'Sign In with Google'}
            </button>
          </form>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 text-sm text-slate-600 hover:text-slate-900"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </>
      )}
      <button onClick={() => navigate('/')} className="mt-12 text-sm font-medium text-slate-600 hover:text-slate-900 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          &larr; Back to Home
      </button>
    </div>
  );
};

export default PortalLogin;
