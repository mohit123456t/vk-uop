import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { ICONS } from '@/constants.tsx';
import authService from '../services/authService';
import DashboardView from './videoeditorpanel/DashboardView';
import ContentSubmissionView from './videoeditorpanel/ContentSubmissionView';
import EarningsView from './videoeditorpanel/EarningsView';
import ProfileView from './videoeditorpanel/ProfileView';
import CommunicationView from './videoeditorpanel/CommunicationView';
import AssignedTasks from './videoeditorpanel/AssignedTasks';

// 🧩 NavItem Component — White Theme, Elegant Hover & Active States
const NavItem = ({ icon, label, active, onClick, ...props }) => (
    <motion.button
        {...props}
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
        }`}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className={`mr-3 ${active ? 'text-blue-600' : ''}`}>{icon}</span>
        {label}
    </motion.button>
);

// 🖥️ Main Panel — WHITE SIDEBAR GOD MODE ACTIVATED 😎
const VideoEditorPanel = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                setUserProfile(state.userProfile);
            }
        });

        return () => unsubscribe();
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'assigned_tasks', label: 'Assigned Tasks', icon: ICONS.clipboard },
        { id: 'communication', label: 'Communication', icon: ICONS.message },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
    ];

    const secondaryNavItems = [
        { id: 'profile', label: 'Profile', icon: ICONS.userCircle },
    ];

    const renderView = () => {
        switch (activeView) {
            case 'assigned_tasks':
                return <AssignedTasks />;
            case 'communication':
                return <CommunicationView />;
            case 'content_submission':
                return <ContentSubmissionView />;
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView />;
            case 'dashboard':
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* 👈 WHITE GOD-MODE SIDEBAR */}
            <aside className="w-64 flex-shrink-0 bg-white text-slate-800 flex flex-col no-scrollbar shadow-lg border-r border-slate-200">
                {/* 🔷 Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
                    <Logo />
                </div>

                {/* 🧭 Primary Navigation — Animated Entry */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.07, type: "tween", ease: "easeOut" }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        </motion.div>
                    ))}
                </nav>

                {/* 🛠️ Secondary Nav + Logout */}
                <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0 space-y-3">
                    {secondaryNavItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navItems.length + index) * 0.07, type: "tween", ease: "easeOut" }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        </motion.div>
                    ))}

                    {/* 🚪 Logout — Classy Red Accent */}
                    <motion.button
                        onClick={() => navigate('/')}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </motion.button>
                </div>
            </aside>

            {/* ➡️ Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">Video Editor Panel</h1>
                    <div className="font-semibold text-slate-700">{userProfile?.name || 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{renderView()}</main>
            </div>
        </div>
    );
};

export default VideoEditorPanel;