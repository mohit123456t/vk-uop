import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { ICONS } from '../../constants';
import { db } from '../../services/firebase';
import authService from '../../services/authService';
import { motion } from 'framer-motion';

// --- TypeScript के लिए Type Definitions ---
interface UserProfile {
    uid: string;
    email: string;
    name?: string;
    connectedAccounts?: string[];
}
interface UploadTask { id: string; status: string; priority: string; deadline?: string; }
interface Campaign { id: string; }

// --- Components ---

// THEME UPDATE: StatCard को ग्लास थीम और स्केलेटन लोडिंग के साथ स्टाइल किया गया है
const StatCard = ({ title, value, icon, subtitle, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 h-32 animate-pulse">
                <div className="h-4 bg-slate-300/50 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-slate-300/50 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-300/50 rounded w-1/2"></div>
            </div>
        );
    }
    return (
        <motion.div 
            className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-600 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className="text-slate-500 text-2xl p-2 rounded-lg bg-white/50">{icon}</div>
            </div>
        </motion.div>
    );
};


const DashboardView = () => {
    // ... (All your logic and state remains untouched)
    const [stats, setStats] = useState({ pendingReels: 0, assignedCampaigns: 0, urgentReels: 0, instagramAccounts: 0 });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ... (All your functions and useEffects remain untouched)
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                const profile: UserProfile = authState.userProfile;
                setUserProfile(profile);
                fetchDashboardData(profile);
            } else {
                setLoading(false);
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchDashboardData = async (profile: UserProfile) => {
        setLoading(true);
        setError(null);
        try {
            const tasksQuery = query(collection(db, 'upload_tasks'), where('assignedTo', '==', profile.email));
            const campaignsQuery = query(collection(db, 'campaigns'), where('assignedUploader', '==', profile.email));
            const [tasksSnapshot, campaignsSnapshot] = await Promise.all([ getDocs(tasksQuery), getDocs(campaignsQuery) ]);
            const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UploadTask));
            const campaignsData = campaignsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
            const pendingReels = tasksData.filter(task => task.status !== 'completed').length;
            const today = new Date().toISOString().split('T')[0];
            const urgentReelsToday = tasksData.filter(task => (task.priority === 'high' || task.priority === 'urgent') && task.deadline?.startsWith(today)).length;
            const instagramAccounts = profile.connectedAccounts?.length || 0;
            setStats({ pendingReels, assignedCampaigns: campaignsData.length, urgentReels: urgentReelsToday, instagramAccounts });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    if (error) {
        return (
            <div className="text-center p-10 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700">
                <p className="font-semibold">An Error Occurred</p>
                <p className="mt-1">{error}</p>
            </div>
        );
    }

    return (
        <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tighter mb-1">
                    Welcome, {userProfile?.name || 'User'}
                </h1>
                <p className="text-slate-500">Here's your comprehensive task overview and performance details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Reels" value={stats.pendingReels.toString()} subtitle="Awaiting upload" icon={ICONS.clipboard} isLoading={loading} />
                <StatCard title="Assigned Campaigns" value={stats.assignedCampaigns.toString()} subtitle="Active campaigns" icon={ICONS.checkCircle} isLoading={loading} />
                <StatCard title="Urgent Reels" value={stats.urgentReels.toString()} subtitle="Due today" icon={ICONS.bell} isLoading={loading} />
                <StatCard title="Instagram Accounts" value={stats.instagramAccounts.toString()} subtitle="Connected accounts" icon={ICONS.instagram} isLoading={loading} />
            </div>
        </motion.div>
    );
};

export default DashboardView;