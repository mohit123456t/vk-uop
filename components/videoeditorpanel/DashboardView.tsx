import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon, subtitle = '', extra = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                {extra && <p className="text-xs text-slate-500 mt-1">{extra}</p>}
            </div>
            <div className="text-slate-400">{icon}</div>
        </div>
    </div>
);

const DashboardView = () => {
    const [stats, setStats] = useState({
        totalAssigned: 0,
        totalCompleted: 0,
        totalEdited: 0,
        approvalRate: 0,
        todayAssigned: 0,
        todayCompleted: 0,
        pendingTasks: 0
    });
    const [loading, setLoading] = useState(true);
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
            setLoading(true);

            // Fetch video editing tasks assigned to current user
            const tasksQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch completed tasks
            const completedQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail),
                where('status', '==', 'completed'),
                orderBy('completedAt', 'desc'),
                limit(5)
            );
            const completedSnapshot = await getDocs(completedQuery);
            const completedData = completedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate statistics
            const totalAssigned = tasksData.length;
            const totalCompleted = completedData.length;
            const approvalRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

            // Get today's date
            const today = new Date().toISOString().split('T')[0];
            const todayAssigned = tasksData.filter((task: any) =>
                task.createdAt && task.createdAt.startsWith(today)
            ).length;
            const todayCompleted = completedData.filter((task: any) =>
                task.completedAt && task.completedAt.startsWith(today)
            ).length;

            setStats({
                totalAssigned,
                totalCompleted,
                totalEdited: totalAssigned + totalCompleted,
                approvalRate,
                todayAssigned,
                todayCompleted,
                pendingTasks: totalAssigned - totalCompleted
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Additional stats for today and pending
    const todayAssigned = stats.todayAssigned;
    const todayCompleted = stats.todayCompleted;
    const pendingTasks = stats.pendingTasks;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Welcome, {userProfile?.name || 'User'}
                </h1>
                <p className="text-slate-600">Here's your comprehensive editing dashboard with task details and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatCard title="Total Tasks Assigned" value={stats.totalAssigned.toString()} subtitle="Since joining" icon={ICONS.clipboard} />
                <StatCard title="Tasks Completed" value={stats.totalCompleted.toString()} subtitle={`${stats.approvalRate}% completion rate`} icon={ICONS.checkCircle} />
                <StatCard title="Videos Edited" value={stats.totalEdited.toString()} subtitle="Since joining" icon={ICONS.scissors} />
                <StatCard title="Avg. Approval Rate" value={`${stats.approvalRate}%`} subtitle="Excellent performance" icon={ICONS.trendingUp} />
                <StatCard title="Tasks Assigned Today" value={todayAssigned.toString()} icon={ICONS.clipboard} />
                <StatCard title="Tasks Completed Today" value={todayCompleted.toString()} icon={ICONS.checkCircle} />
                <StatCard title="Pending Tasks" value={pendingTasks.toString()} icon={ICONS.bell} />
            </div>
        </div>
    );
};

export default DashboardView;
