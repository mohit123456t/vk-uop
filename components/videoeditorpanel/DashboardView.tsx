import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../../constants';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';
import { isSameDay, parseISO } from 'date-fns';

// 👤 Define User Profile Type
interface UserProfile {
    name: string;
    email: string;
    // Add other fields if needed
}

// 🎬 Define Video Task Type
interface VideoTask {
    id: string;
    assignedTo: string;
    status?: 'pending' | 'completed' | 'rejected';
    createdAt?: string; // ISO string
    completedAt?: string; // ISO string
    // Add other task fields as needed
}

// 📊 StatCard Component (Reusable)
const StatCard = ({
    title,
    value,
    icon,
    subtitle = '',
    extra = '',
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtitle?: string;
    extra?: string;
}) => (
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

// 🖥️ Main Dashboard Component
const DashboardView = () => {
    const [stats, setStats] = useState({
        totalAssigned: 0,
        totalCompleted: 0,
        totalEdited: 0,
        approvalRate: 0,
        todayAssigned: 0,
        todayCompleted: 0,
        pendingTasks: 0,
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // 📅 Helper to check if date is today
    const isToday = (dateString?: string): boolean => {
        if (!dateString) return false;
        try {
            return isSameDay(parseISO(dateString), new Date());
        } catch {
            return false;
        }
    };

    // 🔄 Fetch Dashboard Data
    const fetchDashboardData = async (userEmail: string) => {
        try {
            // 🔍 Fetch ALL tasks assigned to user (no limit for totals!)
            const allTasksQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail)
            );
            const allTasksSnapshot = await getDocs(allTasksQuery);
            const allTasks = allTasksSnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as VideoTask
            );

            // ✅ Fetch ONLY completed tasks (no limit for accurate count)
            const completedQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail),
                where('status', '==', 'completed')
            );
            const completedSnapshot = await getDocs(completedQuery);
            const completedTasks = completedSnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as VideoTask
            );

            // 📊 Calculate Stats
            const totalAssigned = allTasks.length;
            const totalCompleted = completedTasks.length;
            const approvalRate =
                totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

            const todayAssigned = allTasks.filter((task) =>
                isToday(task.createdAt)
            ).length;
            const todayCompleted = completedTasks.filter((task) =>
                isToday(task.completedAt)
            ).length;

            setStats({
                totalAssigned,
                totalCompleted,
                totalEdited: totalAssigned + totalCompleted, // or just totalAssigned if "edited" means same as assigned
                approvalRate,
                todayAssigned,
                todayCompleted,
                pendingTasks: totalAssigned - totalCompleted,
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    // 👤 Listen to Auth State
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setUserProfile(authState.userProfile);
                fetchDashboardData(authState.userProfile.email);
            } else {
                setUserProfile(null);
                setStats({
                    totalAssigned: 0,
                    totalCompleted: 0,
                    totalEdited: 0,
                    approvalRate: 0,
                    todayAssigned: 0,
                    todayCompleted: 0,
                    pendingTasks: 0,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // 💡 Optional: Memoize stats if needed later
    const memoizedStats = useMemo(() => stats, [stats]);

    // ✅ Render Dashboard
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Welcome, {userProfile?.name || 'User'}
                </h1>
                <p className="text-slate-600">
                    Here's your comprehensive editing dashboard with task details and performance metrics.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatCard
                    title="Total Tasks Assigned"
                    value={memoizedStats.totalAssigned.toString()}
                    subtitle="Since joining"
                    icon={ICONS.clipboard}
                />
                <StatCard
                    title="Tasks Completed"
                    value={memoizedStats.totalCompleted.toString()}
                    subtitle={`${memoizedStats.approvalRate}% completion rate`}
                    icon={ICONS.checkCircle}
                />
                <StatCard
                    title="Videos Edited"
                    value={memoizedStats.totalEdited.toString()}
                    subtitle="Since joining"
                    icon={ICONS.scissors}
                />

                <StatCard
                    title="Tasks Assigned Today"
                    value={memoizedStats.todayAssigned.toString()}
                    icon={ICONS.clipboard}
                />
                <StatCard
                    title="Tasks Completed Today"
                    value={memoizedStats.todayCompleted.toString()}
                    icon={ICONS.checkCircle}
                />
                <StatCard
                    title="Pending Tasks"
                    value={memoizedStats.pendingTasks.toString()}
                    icon={ICONS.bell}
                />
            </div>
        </div>
    );
};

export default DashboardView;