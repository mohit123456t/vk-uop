
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../../constants';
import {
    collection,
    query,
    where,
    onSnapshot,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService, { UserProfile } from '../../services/authService';
import { isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface VideoTask { id: string; assignedTo: string; status?: string; createdAt?: string; completedAt?: string; }

const StatCard = ({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle?: string; }) => (
    <motion.div
        className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80"
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400 text-2xl">{icon}</div>
        </div>
    </motion.div>
);

const DashboardView = () => {
    const [tasks, setTasks] = useState<VideoTask[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Effect 1: Manages authentication state. It's clean and has one job.
    useEffect(() => {
        const authUnsubscribe = authService.onAuthStateChange(state => {
            setUserProfile(state.isAuthenticated ? state.userProfile : null);
            // Loading is considered done when auth state is resolved.
            setIsLoading(state.isLoading);
        });
        return () => authUnsubscribe();
    }, []);

    // Effect 2: Manages real-time data fetching. Now depends on the stable `userProfile.email`.
    useEffect(() => {
        const userEmail = userProfile?.email;

        if (!userEmail) {
            setTasks([]); // Clear tasks if user logs out.
            return; // Stop here if there's no email.
        }

        // Set up the real-time listener for tasks.
        const tasksQuery = query(collection(db, 'video_edit_tasks'), where('assignedTo', '==', userEmail));
        
        const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoTask));
            setTasks(allTasks);
        }, (error) => {
            console.error("Error fetching real-time tasks:", error);
        });

        // This cleanup function runs ONLY when `userEmail` changes (i.e., login/logout).
        return () => tasksUnsubscribe();

    }, [userProfile?.email]); // ✅ THE FIX: Depend on the primitive and stable email string.

    const isToday = (dateString?: string): boolean => {
        if (!dateString) return false;
        try { return isSameDay(parseISO(dateString), new Date()); } catch { return false; }
    };

    // Calculate stats based on the real-time `tasks` state.
    const stats = useMemo(() => {
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const totalAssigned = tasks.length;
        const totalCompleted = completedTasks.length;
        const approvalRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
        const todayAssigned = tasks.filter(task => isToday(task.createdAt)).length;
        const todayCompleted = completedTasks.filter(task => isToday(task.completedAt)).length;

        return {
            pendingTasks: totalAssigned - totalCompleted,
            totalCompleted,
            approvalRate,
            todayAssigned,
            todayCompleted,
        };
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <span className="text-4xl">⏳</span>
                    <h3 className="text-lg font-semibold mt-4">Loading Dashboard...</h3>
                </div>
            </div>
        );
    }

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

    return (
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Welcome, {userProfile?.name || 'Editor'}</h1>
                <p className="text-slate-500 mt-1">Your real-time editing dashboard is ready.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Pending Tasks" value={stats.pendingTasks.toString()} icon={ICONS.bell} />
                <StatCard title="Tasks Completed" value={stats.totalCompleted.toString()} subtitle={`${stats.approvalRate}% completion rate`} icon={ICONS.checkCircle} />
                <StatCard title="Assigned Today" value={stats.todayAssigned.toString()} icon={ICONS.clipboard} />
                <StatCard title="Completed Today" value={stats.todayCompleted.toString()} icon={ICONS.checkCircle} />
            </div>
        </motion.div>
    );
};

export default DashboardView;
