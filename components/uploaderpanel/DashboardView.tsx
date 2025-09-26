import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400">{icon}</div>
        </div>
    </div>
);

const DashboardView = () => {
    const [stats, setStats] = useState({
        pendingReels: 0,
        assignedCampaigns: 0,
        urgentReels: 0,
        instagramAccounts: 0
    });
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setUserProfile(authState.userProfile);
                fetchDashboardData(authState.userProfile.email);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchDashboardData = async (userEmail: string) => {
        try {
            // Fetch upload tasks assigned to current user
            const tasksQuery = query(
                collection(db, 'upload_tasks'),
                where('assignedTo', '==', userEmail),
                orderBy('createdAt', 'desc')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch campaigns assigned to current user
            const campaignsQuery = query(
                collection(db, 'campaigns'),
                where('assignedUploader', '==', userEmail),
                orderBy('createdAt', 'desc')
            );
            const campaignsSnapshot = await getDocs(campaignsQuery);
            const campaignsData = campaignsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate statistics
            const pendingReels = tasksData.filter((task: any) => task.status !== 'completed').length;
            const assignedCampaigns = campaignsData.length;
            const urgentReels = tasksData.filter((task: any) =>
                task.priority === 'high' || task.priority === 'urgent'
            ).length;

            // Get today's date for urgent tasks
            const today = new Date().toISOString().split('T')[0];
            const todayUrgent = tasksData.filter((task: any) =>
                (task.priority === 'high' || task.priority === 'urgent') &&
                task.deadline && task.deadline.startsWith(today)
            ).length;

            setStats({
                pendingReels,
                assignedCampaigns,
                urgentReels: todayUrgent,
                instagramAccounts: 2 // This would come from user profile
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Welcome, {userProfile?.name || 'User'}
                </h1>
                <p className="text-slate-600">Here's your comprehensive task overview and performance details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Reels" value={stats.pendingReels.toString()} subtitle="Awaiting upload" icon={ICONS.clipboard} />
                <StatCard title="Assigned Campaigns" value={stats.assignedCampaigns.toString()} subtitle="Active campaigns" icon={ICONS.checkCircle} />
                <StatCard title="Urgent Reels" value={stats.urgentReels.toString()} subtitle="High priority" icon={ICONS.bell} />
                <StatCard title="Instagram Accounts" value={stats.instagramAccounts.toString()} subtitle="Connected accounts" icon={ICONS.instagram} />
            </div>
        </div>
    );
};

export default DashboardView;
