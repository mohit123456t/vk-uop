import ProfileView from './adminpanel/ProfileView';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';

import DashboardView from './adminpanel/DashboardView';
import CampaignManagerView from './adminpanel/CampaignManagerView';
import CampaignApprovalView from './adminpanel/CampaignApprovalView';
import UserManagementView from './adminpanel/UserManagementView';
import FinanceView from './adminpanel/FinanceView';
import CommunicationView from './adminpanel/CommunicationView';

const NavItem = ({ icon, label, active, onClick, index }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-white/40 text-indigo-700 font-semibold'
                : 'text-slate-700 hover:bg-white/20'
        }`}
        whileHover={{ x: active ? 0 : 5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 + index * 0.07, type: "spring", stiffness: 150, damping: 20 }}
    >
        <span className={`mr-3 ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {label}
    </motion.button>
);

const AdminPanel = ({ onNavigate }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'profile', label: 'Profile', icon: ICONS.userCircle },
        { id: 'campaigns', label: 'Campaigns', icon: ICONS.folder },
        { id: 'campaign-approval', label: 'Campaign Approval', icon: ICONS.checkCircle },
        { id: 'users', label: 'User Management', icon: ICONS.usersGroup },
        { id: 'finance', label: 'Finance', icon: ICONS.wallet },
        { id: 'communication', label: 'Communication', icon: ICONS.bell },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    const renderView = () => {
        switch (activeView) {
            case 'profile': return <ProfileView />;
            case 'campaigns': return <CampaignManagerView />;
            case 'campaign-approval': return <CampaignApprovalView />;
            case 'users': return <UserManagementView />;
            case 'finance': return <FinanceView />;
            case 'communication': return <CommunicationView />;
            case 'dashboard':
            default:
                return <DashboardView onViewChange={setActiveView} />;
        }
    };

    return (
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
            <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed left-0 top-0 h-full w-64 bg-white/40 backdrop-blur-xl text-slate-800 flex flex-col z-50 shadow-2xl border-r border-slate-300/70"
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-300/70 flex-shrink-0">
                    <Logo />
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <NavItem
                            key={item.id}
                            index={index}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                        />
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-slate-300/70 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <motion.span className="mr-3" whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} >
                            {ICONS.logout}
                        </motion.span>
                        Logout
                    </motion.button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="h-16 bg-white/60 backdrop-blur-lg border-b border-slate-300/70 flex items-center justify-between px-8 flex-shrink-0 shadow-sm"
                >
                    <motion.h1
                        key={activeView}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl font-bold text-slate-800 capitalize"
                    >
                        {activeView.replace('-', ' ')}
                    </motion.h1>
                    <div className="flex items-center space-x-3">
                         <div className="relative flex items-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute"></div>
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="font-semibold text-sm text-slate-700">Super Admin</div>
                    </div>
                </motion.header>

                <main className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="p-8"
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
