import React, { useState, useEffect } from 'react';
import authService, { UserProfile } from '../../services/authService';
import { motion } from 'framer-motion';

const UserProfileView = () => {
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
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // THEME UPDATE: नया और बेहतर "स्केलेटन" लोडिंग स्टाइल
    if (loading) {
        return (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-8 max-w-4xl mx-auto animate-pulse">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-slate-300/50 rounded-full"></div>
                    <div>
                        <div className="h-10 bg-slate-300/50 rounded w-64 mb-2"></div>
                        <div className="h-6 bg-slate-300/50 rounded w-80"></div>
                    </div>
                </div>
                <div className="border-t border-slate-300/50 pt-8">
                    <div className="h-8 bg-slate-300/50 rounded w-48 mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-16 bg-slate-300/50 p-4 rounded-lg"></div>
                        <div className="h-16 bg-slate-300/50 p-4 rounded-lg"></div>
                        <div className="h-16 bg-slate-300/50 p-4 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return <p className="text-center text-red-500 text-xl p-8">Could not load user profile. Please try logging in again.</p>;
    }

    return (
        // THEME UPDATE: बैकग्राउंड हटाया गया और एनिमेशन रैपर जोड़ा गया
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* THEME UPDATE: मुख्य कार्ड को ग्लास पैनल बनाया गया है */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/80 border border-slate-300/70 p-8 max-w-4xl mx-auto">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-4xl font-bold border-4 border-white shadow-md">
                        {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tighter">{userProfile.name}</h1>
                        <p className="text-xl text-slate-500">{userProfile.email}</p>
                        <p className="text-sm text-indigo-600 font-semibold mt-2 bg-indigo-100 px-3 py-1 rounded-full inline-block">
                            {formatRole(userProfile.role)}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-300/50 pt-8">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">Account Details</h2>
                    <div className="space-y-4">
                        {/* THEME UPDATE: डिटेल आइटम्स को ग्लास स्टाइल दिया गया है */}
                        <div className="bg-white/30 border border-slate-300/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">User ID</p>
                            <p className="text-slate-800 font-mono text-sm">#{userProfile.uid.substring(0, 8)}</p>
                        </div>
                        <div className="bg-white/30 border border-slate-300/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Member Since</p>
                            <p className="text-slate-800">{new Date(userProfile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="bg-white/30 border border-slate-300/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 font-medium">Last Login</p>
                            <p className="text-slate-800">{new Date(userProfile.lastLoginAt).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserProfileView;