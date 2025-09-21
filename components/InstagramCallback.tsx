import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleInstagramCallback } from '../services/instagramService';

const InstagramCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');

    if (code) {
      handleInstagramCallback(code).then(() => {
        navigate('/uploader-panel/profile'); // Redirect to profile or appropriate page after successful connection
      }).catch((error) => {
        console.error('Instagram OAuth callback error:', error);
        navigate('/uploader-panel/profile'); // Redirect even on error, optionally show error message
      });
    } else {
      navigate('/uploader-panel/profile'); // Redirect if no code present
    }
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Connecting your Instagram account...</p>
    </div>
  );
};

export default InstagramCallback;
