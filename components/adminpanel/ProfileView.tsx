
import React, { useState, useEffect } from 'react';
import authService, { UserProfile } from '../../services/authService';

const ProfileView = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            setUserProfile(state.userProfile);
            setLoading(state.isLoading);
        });
        return () => unsubscribe();
    }, []);

    const formatRole = (role: string | undefined) => {
        if (!role) return '';
        return role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    const getAdminId = (uid: string | undefined) => {
        if (!uid) return '';
        return `AD${uid.slice(-4)}`.toUpperCase();
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
                        {userProfile.name?.charAt(0).toUpperCase() || 'U'}
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
                    <h2 className="text-2xl font-bold text-gray-700 mb-6">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Admin ID</p>
                            <p className="text-slate-800 font-mono text-2xl font-bold tracking-wider">{getAdminId(userProfile.uid)}</p>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">User ID</p>
                            <p className="text-slate-800 font-mono text-sm break-all">{userProfile.uid}</p>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Member Since</p>
                            <p className="text-slate-800 text-lg">{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                         <div className="bg-slate-50 p-6 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Last Login</p>
                            <p className="text-slate-800 text-lg">{new Date(userProfile.lastLoginAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
