import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Logo';
import { ICONS } from '@/constants.tsx';
import authService from '../../services/authService';

// Views
import ApiKeyManagementView from './ApiKeyManagementView';
import DashboardView from './DashboardView';
import AssignedTasksView from './AssignedTasksView';
import AccountsView from './AccountsView';
import CommunicationView from './CommunicationView';
import EarningsView from './EarningsView';
import UserProfileView from './UserProfileView';

// THEME UPDATE: NavItem को ग्लास थीम के लिए स्टाइल किया गया है
const NavItem = ({ icon, label, active, onClick, ...props }) => (
    <motion.button
        {...props}
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-white/40 text-indigo-700 font-semibold'
                : 'text-slate-700 hover:bg-white/20'
        }`}
        whileHover={{ x: active ? 0 : 5 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className={`mr-3 transition-colors ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {label}
    </motion.button>
);

const UploaderPanel = () => {
    const navigate = useNavigate();

    const [activeView, setActiveView] = useState(() => localStorage.getItem('uploaderActiveView') || 'dashboard');
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

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'assigned-tasks', label: 'Assigned Tasks', icon: ICONS.clipboard },
        { id: 'accounts', label: 'Accounts', icon: ICONS.users },
        { id: 'communication', label: 'Messages', icon: ICONS.message },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
        { id: 'api-keys', label: 'API Keys', icon: ICONS.shieldCheck },
    ];
    const secondaryNavItems = [ { id: 'my-profile', label: 'My Profile', icon: ICONS.userCircle } ];

    const renderView = () => {
        switch (activeView) {
            case 'assigned-tasks': return <AssignedTasksView />;
            case 'accounts': return <AccountsView />;
            case 'communication': return <CommunicationView />;
            case 'earnings': return <EarningsView />;
            case 'my-profile': return <UserProfileView />;
            case 'api-keys': return <ApiKeyManagementView />;
            case 'dashboard':
            default: return <DashboardView />;
        }
    };

    return (
        // THEME UPDATE: पूरे पैनल को "iOS Wallpaper" बैकग्राउंड दिया गया है
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
            {/* THEME UPDATE: साइडबार को ग्लास पैनल बनाया गया है */}
            <aside className="w-64 flex-shrink-0 bg-white/40 backdrop-blur-xl text-slate-800 flex flex-col no-scrollbar shadow-2xl border-r border-slate-300/70">
                <div className="h-16 flex items-center px-6 border-b border-slate-300/70 flex-shrink-0">
                    <Logo />
                </div>
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
                <div className="px-4 py-4 border-t border-slate-300/70 flex-shrink-0 space-y-3">
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
                    <motion.button
                        onClick={() => navigate('/')}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all"
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </motion.button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* THEME UPDATE: हेडर को ग्लास स्टाइल दिया गया है */}
                <header className="h-16 bg-white/60 backdrop-blur-lg border-b border-slate-300/70 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">Uploader Panel</h1>
                    <div className="font-semibold text-slate-700">{userProfile?.name || 'User'}</div>
                </header>
                {/* THEME UPDATE: मेन एरिया से बैकग्राउंड हटाया गया है ताकि वॉलपेपर दिखे */}
                <main className="flex-1 overflow-y-auto p-8">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default UploaderPanel;