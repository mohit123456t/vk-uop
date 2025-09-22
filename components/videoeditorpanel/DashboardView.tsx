
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon, subtitle = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400 p-2 bg-slate-100 rounded-lg">{icon}</div>
        </div>
    </div>
);

const DashboardView = () => {
    const [stats, setStats] = useState({
        totalAssigned: 0,
        totalCompleted: 0,
        pendingTasks: 0,
        completionRate: 0,
        todayAssigned: 0,
        todayCompleted: 0,
    });
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setUserProfile(authState.userProfile);
                fetchDashboardData(authState.userProfile.email);
            } else {
                setLoading(false);
                setError('User not authenticated.');
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchDashboardData = async (userEmail: string) => {
        setLoading(true);
        try {
            // Query for all tasks assigned to the user
            const allTasksQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail)
            );
            const allTasksSnapshot = await getDocs(allTasksQuery);
            const allTasksData = allTasksSnapshot.docs.map(doc => doc.data());

            // Filter for completed tasks from all tasks
            const completedTasksData = allTasksData.filter(task => task.status === 'completed');

            const totalAssigned = allTasksData.length;
            const totalCompleted = completedTasksData.length;
            const pendingTasks = totalAssigned - totalCompleted;
            const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

            // Get today's date string (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];
            
            const todayAssigned = allTasksData.filter((task: any) => 
                task.createdAt && typeof task.createdAt === 'string' && task.createdAt.startsWith(today)
            ).length;

            const todayCompleted = completedTasksData.filter((task: any) => 
                task.completedAt && typeof task.completedAt === 'string' && task.completedAt.startsWith(today)
            ).length;

            setStats({
                totalAssigned,
                totalCompleted,
                pendingTasks,
                completionRate,
                todayAssigned,
                todayCompleted,
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    Welcome, {userProfile?.name || 'Editor'}!
                </h1>
                <p className="text-slate-600">Here's your editing dashboard for today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Assigned" value={stats.totalAssigned.toString()} icon={ICONS.clipboard} />
                <StatCard title="Total Completed" value={stats.totalCompleted.toString()} subtitle={`${stats.completionRate}% completion rate`} icon={ICONS.checkCircle} />
                <StatCard title="Pending Tasks" value={stats.pendingTasks.toString()} icon={ICONS.bell} />
                <StatCard title="Assigned Today" value={stats.todayAssigned.toString()} icon={ICONS.calendar} />
                <StatCard title="Completed Today" value={stats.todayCompleted.toString()} icon={ICONS.check} />
            </div>

            {/* You can add recent activity or other components here */}
        </div>
    );
};

export default DashboardView;
