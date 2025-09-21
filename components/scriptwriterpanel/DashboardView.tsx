import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon, subtitle = null, extra = null }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-600 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                {extra && <p className="text-xs text-slate-500 mt-1">{extra}</p>}
            </div>
            <div className="text-slate-500">{icon}</div>
        </div>
    </div>
);

const DashboardView = ({ onEditTask }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalAssigned: 0,
        totalCompleted: 0,
        totalScripts: 0,
        approvalRate: 0,
        todayAssigned: 0,
        todayCompleted: 0,
        pendingTasks: 0
    });

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

            // Fetch script tasks assigned to current user
            const tasksQuery = query(
                collection(db, 'script_tasks'),
                where('assignedTo', '==', userEmail),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasksData);

            // Fetch completed scripts
            const completedQuery = query(
                collection(db, 'script_tasks'),
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
            setCompletedTasks(completedData);

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
                totalScripts: totalAssigned + totalCompleted,
                approvalRate,
                todayAssigned,
                todayCompleted,
                pendingTasks: totalAssigned - totalCompleted
            });

            // Generate performance data for the last 6 months
            const performance = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const monthCompleted = completedData.filter((task: any) => {
                    if (!task.completedAt) return false;
                    const taskDate = new Date(task.completedAt);
                    return taskDate.getMonth() === date.getMonth() &&
                           taskDate.getFullYear() === date.getFullYear();
                }).length;

                performance.push({
                    month,
                    scripts: monthCompleted
                });
            }
            setPerformanceData(performance);

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
                <p className="text-slate-600">Here's your comprehensive script writing dashboard with task details and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatCard title="Total Scripts Assigned" value={stats.totalAssigned.toString()} subtitle="Since joining" icon={ICONS.clipboard} />
                <StatCard title="Scripts Completed" value={stats.totalCompleted.toString()} subtitle={`${stats.approvalRate}% completion rate`} icon={ICONS.checkCircle} />
                <StatCard title="Scripts Written" value={stats.totalScripts.toString()} subtitle="Since joining" icon={ICONS.pencilSquare} />
                <StatCard title="Avg. Approval Rate" value={`${stats.approvalRate}%`} subtitle="Excellent performance" icon={ICONS.trendingUp} />
                <StatCard title="Scripts Assigned Today" value={todayAssigned.toString()} icon={ICONS.clipboard} />
                <StatCard title="Scripts Completed Today" value={todayCompleted.toString()} icon={ICONS.checkCircle} />
                <StatCard title="Pending Scripts" value={pendingTasks.toString()} icon={ICONS.bell} />
            </div>
        </div>
    );
};

export default DashboardView;
