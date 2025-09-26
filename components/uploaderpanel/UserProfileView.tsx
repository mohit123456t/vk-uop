import React, { useState, useEffect } from 'react';
import authService, { UserProfile } from '../../services/authService';

const UserProfileView = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes to keep the profile synced
        const unsubscribe = authService.onAuthStateChange((state) => {
            setUserProfile(state.userProfile);
            setLoading(state.isLoading);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    const formatRole = (role: string | undefined) => {
        if (!role) return '';
        return role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-slate-900"></div>
                <p className="text-center mt-6 text-xl font-semibold text-slate-700">Loading Profile...</p>
            </div>
        );
    }

    if (!userProfile) {
        return <p className="text-center text-red-500 text-xl p-8">Could not load user profile. Please try logging in again.</p>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-4xl font-bold">
                        {userProfile.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800">{userProfile.name}</h1>
                        <p className="text-xl text-gray-500">{userProfile.email}</p>
                        <p className="text-lg text-indigo-600 font-semibold mt-1 bg-indigo-100 px-3 py-1 rounded-full inline-block">
                            {formatRole(userProfile.role)}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Account Details</h2>
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">User ID</p>
                            <p className="text-slate-800 font-mono text-sm">#{userProfile.uid.substring(0, 6)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Member Since</p>
                            <p className="text-slate-800">{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Last Login</p>
                            <p className="text-slate-800">{new Date(userProfile.lastLoginAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
