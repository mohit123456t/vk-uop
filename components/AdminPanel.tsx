import ProfileView from './adminpanel/ProfileView';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';

import DashboardView from './adminpanel/DashboardView';
import CampaignManagerView from './adminpanel/CampaignManagerView';
import ReelsUploadedPage from './adminpanel/ReelsUploadedPage';
import StaffManagementView from './adminpanel/StaffManagementView';
import UserManagementView from './adminpanel/UserManagementView';
import FinanceView from './adminpanel/FinanceView';

import CommunicationView from './adminpanel/CommunicationView';
import CampaignApprovalView from './adminpanel/CampaignApprovalView';

// ... (same imports)

const NavItem = ({ icon, label, active, onClick, index }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-black hover:bg-slate-50 hover:text-blue-600'
        }`}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.07, type: "tween", ease: "easeOut" }}
    >
        <span className={`mr-3 ${active ? 'text-blue-600' : ''}`}>{icon}</span>
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
            {/* Sticky Sidebar */}
            <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed left-0 top-0 h-full w-64 bg-white text-slate-800 flex flex-col z-50 shadow-xl border-r border-slate-200"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="h-16 flex items-center px-6 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
                >
                    <Logo />
                </motion.div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <AnimatePresence>
                        {navItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                            >
                                <NavItem
                                    icon={item.icon}
                                    label={item.label}
                                    active={activeView === item.id}
                                    onClick={() => setActiveView(item.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </nav>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="px-4 py-6 border-t border-slate-200 flex-shrink-0"
                >
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 mt-4 transition-all duration-200 hover:shadow-sm"
                    >
                        <motion.span
                            className="mr-3"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            {ICONS.logout}
                        </motion.span>
                        Logout
                    </motion.button>
                </motion.div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 flex items-center justify-between px-8 flex-shrink-0 shadow-sm"
                >
                    <motion.h1
                        key={activeView}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent capitalize"
                    >
                        {activeView.replace('-', ' ')}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        className="flex items-center space-x-3"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 bg-green-500 rounded-full"
                        ></motion.div>
                        <div className="font-semibold text-sm text-slate-700">Super Admin</div>
                    </motion.div>
                </motion.header>
                <motion.main
                    key={activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </motion.main>
            </div>
        </div>
    );
};

export default AdminPanel;