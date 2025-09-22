
import React, { useState, useEffect } from 'react';
import { ICONS } from '@/constants';
import authService from '../../services/authService';

const ProfileView = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authState) => {
      if (authState.isAuthenticated && authState.userProfile) {
        setUserProfile(authState.userProfile);
        setLoading(false);
      } else {
        setError('Could not load user profile. Please log in again.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const ToggleSwitch = ({ enabled, setEnabled }) => (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={enabled} onChange={() => setEnabled(!enabled)} />
        <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
         <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">User profile not found.</p>
        </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-full animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Profile</h1>
          <p className="text-lg text-gray-500">Manage your portfolio, skills, and account security.</p>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-200/80">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{userProfile.name}</h2>
              <p className="text-md text-gray-500">ID: {userProfile.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
            <div className="flex items-center">
              <ICONS.mail className="w-6 h-6 text-gray-400 mr-4" />
              <span className="text-gray-700">{userProfile.email}</span>
            </div>
            <div className="flex items-center">
              <ICONS.phone className="w-6 h-6 text-gray-400 mr-4" />
              <span className="text-gray-700">Not provided</span>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200/80">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Settings</h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-700">Notifications</h4>
                <p className="text-sm text-gray-500">Enable or disable email and in-app notifications.</p>
              </div>
              <ToggleSwitch enabled={isNotificationsEnabled} setEnabled={setIsNotificationsEnabled} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-700">Dark Mode</h4>
                <p className="text-sm text-gray-500">Switch between light and dark themes.</p>
              </div>
              <ToggleSwitch enabled={isDarkModeEnabled} setEnabled={setIsDarkModeEnabled} />
            </div>
          </div>
        </div>
        
        {/* Save Changes Button */}
        <div className="mt-12 text-right">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
