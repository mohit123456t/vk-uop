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

const NavItem = (props) => {
    const { icon, label, active, onClick } = props;
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-md'
            }`}
        >
            <motion.span
                className="mr-3"
                animate={{ rotate: active ? 360 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {icon}
            </motion.span>
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                {label}
            </motion.span>
        </motion.button>
    );
};

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
            navigate('/'); // Navigate to landing page after logout
        } catch (error) {
            console.error('Logout error:', error);
            // Force navigate even if logout fails
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
                className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-300 flex flex-col z-50 shadow-2xl"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="h-16 flex items-center px-6 border-b border-slate-700/50 flex-shrink-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                >
                    <Logo />
                </motion.div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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
                    className="px-4 py-6 border-t border-slate-700/50 flex-shrink-0"
                >
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-300 mt-4 transition-all duration-200 hover:shadow-md"
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

            {/* Main Content Area - Adjusted for fixed sidebar */}
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
