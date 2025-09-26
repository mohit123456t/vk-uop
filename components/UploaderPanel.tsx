import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // 👈 Added for animations
import Logo from './Logo';
import { ICONS } from '@/constants.tsx';
import authService from '../services/authService';

// Views
import DashboardView from './uploaderpanel/DashboardView';
import AssignedTasksView from './uploaderpanel/AssignedTasksView';
import AccountsView from './uploaderpanel/AccountsView';
import CommunicationView from './uploaderpanel/CommunicationView';
import EarningsView from './uploaderpanel/EarningsView';
import UserProfileView from './uploaderpanel/UserProfileView';

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

// 🖥️ Main Uploader Panel — WHITE GOD-MODE ACTIVATED
const UploaderPanel = () => {
    const navigate = useNavigate();

    // 💾 Persist active view in localStorage
    const [activeView, setActiveView] = useState(() => {
        const saved = localStorage.getItem('uploaderActiveView');
        return saved || 'dashboard';
    });

    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        localStorage.setItem('uploaderActiveView', activeView);
    }, [activeView]);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((currentAuthState) => {
            if (currentAuthState.isAuthenticated && currentAuthState.userProfile) {
                setUserProfile(currentAuthState.userProfile);
            }
        });

        return () => unsubscribe();
    }, []);

    // 🧭 Navigation Items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'assigned-tasks', label: 'Assigned Tasks', icon: ICONS.clipboard },
        { id: 'accounts', label: 'Accounts', icon: ICONS.users },
        { id: 'communication', label: 'Messages', icon: ICONS.message },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
    ];

    const secondaryNavItems = [
        { id: 'my-profile', label: 'My Profile', icon: ICONS.userCircle },
    ];

    // 🖼️ Render Active View
    const renderView = () => {
        switch (activeView) {
            case 'assigned-tasks':
                return <AssignedTasksView />;
            case 'accounts':
                return <AccountsView />;
            case 'communication':
                return <CommunicationView />;
            case 'earnings':
                return <EarningsView />;
            case 'my-profile':
                return <UserProfileView />;
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
                    <h1 className="text-xl font-bold text-slate-900 capitalize">Uploader Panel</h1>
                    <div className="font-semibold text-slate-700">{userProfile?.name || 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{renderView()}</main>
            </div>
        </div>
    );
};

export default UploaderPanel;