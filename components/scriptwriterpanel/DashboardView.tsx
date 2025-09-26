import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

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

const DashboardView = ({ onEditTask = (task) => {}, userProfile }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
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
        if (userProfile) {
            fetchDashboardData(userProfile.email);
        }
    }, [userProfile]);

    const fetchDashboardData = async (userEmail: string) => {
        try {

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
                where('status', '==', 'Approved'),
                orderBy('updatedAt', 'desc'),
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
                task.updatedAt && task.updatedAt.startsWith(today)
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
                    if (!task.updatedAt) return false;
                    const taskDate = new Date(task.updatedAt);
                    return taskDate.getMonth() === date.getMonth() &&
                           taskDate.getFullYear() === date.getFullYear();
                }).length;

                performance.push({
                    name: month,
                    completed: monthCompleted,
                    assigned: 0
                });
            }
            setPerformanceData(performance);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set default values on error
            setTasks([]);
            setCompletedTasks([]);
            setPerformanceData([]);
            setStats({
                totalAssigned: 0,
                totalCompleted: 0,
                totalScripts: 0,
                approvalRate: 0,
                todayAssigned: 0,
                todayCompleted: 0,
                pendingTasks: 0
            });
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Recent Tasks</h3>
                    {tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-slate-400 mb-4">
                                <span className="text-4xl">📝</span>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">No tasks assigned yet</h4>
                            <p className="text-slate-600">Your assigned tasks will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.slice(0, 5).map((task: any) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{task.campaignName || task.id}</h4>
                                        <p className="text-sm text-slate-600">{task.brief || 'No brief available'}</p>
                                        <p className="text-xs text-slate-500">Status: {task.status || 'Pending'}</p>
                                    </div>
                                    <button
                                        onClick={() => onEditTask && onEditTask(task)}
                                        className="bg-slate-900 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Performance Overview</h3>
                    {performanceData.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-slate-400 mb-4">
                                <span className="text-4xl">📊</span>
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">No performance data</h4>
                            <p className="text-slate-600">Your performance metrics will appear here</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="completed" stroke="#1e293b" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Completed Scripts</h3>
                {completedTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">No completed scripts yet</h4>
                        <p className="text-slate-600">Your completed scripts will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedTasks.map((task: any) => (
                            <div key={task.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800">{task.campaignName || task.id}</h4>
                                <p className="text-sm text-green-600">{task.brief || 'No brief available'}</p>
                                <p className="text-xs text-green-500">Completed: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
