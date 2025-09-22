import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase'; // Make sure this path is correct
import { doc, getDoc } from 'firebase/firestore';
import * as authService from '../services/authService';

const RoleBasedPortalLogin: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() });
          } else {
            setError('No user profile found for this user.');
            authService.signOutUser();
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to fetch user profile.');
          authService.signOutUser();
        }
      } else {
        setUserProfile(null);
        // Optional: Redirect to login page if no user is logged in
        // navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userProfile && userProfile.role) {
      const role = userProfile.role;
      console.log('Redirecting user based on role:', role);
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'video-editor':
          navigate('/editor');
          break;
        case 'script-writer':
          navigate('/scriptwriter');
          break;
        case 'thumbnail-maker':
          navigate('/thumbnail');
          break;
        case 'uploader':
          navigate('/uploader');
          break;
        case 'super_admin':
          navigate('/super-admin');
          break;
        case 'brand':
          navigate('/brand');
          break;
        default:
          setError(`Your user role ('${role}') is not recognized.`);
          authService.signOutUser();
          break;
      }
    } else if (userProfile === null) {
      // User is not logged in, or profile is being fetched.
      // You might want to show a loading indicator here.
    } else if (userProfile && !userProfile.role) {
        setError('User profile does not have a role.');
        authService.signOutUser();
    }

  }, [userProfile, navigate]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // You can return a loading indicator here while userProfile is being fetched.
  return <div>Loading...</div>;
};

export default RoleBasedPortalLogin;
