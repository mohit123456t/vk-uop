import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StaffManagementView from './StaffManagementView';
import ReelsUploadedPage from './ReelsUploadedPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminFinance from './SuperAdminFinance';
import UploaderManagerView from './UploaderManagerView';
import ScriptWriterManagerView from './ScriptWriterManagerView';
import ThumbnailMakerManagerView from './ThumbnailMakerManagerView';
import VideoEditorManagerView from './VideoEditorManagerView';
import PricingManagement from './PricingManagement';
import { ICONS } from '../../constants';
import authService from '../../services/authService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

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
        transition={{ delay: 0.3 + index * 0.07 }}
    >
        <span className={`mr-3 ${active ? 'text-indigo-600' : 'text-slate-600'}`}>{icon}</span>
        {label}
    </motion.button>
);

const SuperAdminPanel = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => { unsubCampaigns(); unsubUsers(); };
    }, []);
    useEffect(() => {
        if (!campaigns || !users) return;
        const totalCampaignEarnings = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
        const staffRoles = ['video_editor', 'script_writer', 'thumbnail_maker', 'uploader'];
        const totalExpenses = users.filter(u => staffRoles.includes(u.role)).reduce((sum, u) => sum + Number(u.salary || 0), 0);
        setFinanceData({
            totalRevenue: totalCampaignEarnings,
            totalExpenses: totalExpenses,
        });
        setDashboardData({
             // ... other dashboard data
        });
        setIsLoading(false);
    }, [campaigns, users]);

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
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
        }
        switch (activeView) {
            case 'dashboard': return <SuperAdminDashboard data={dashboardData} />;
            case 'staff_management': return <StaffManagementView />;
            case 'uploader_manager': return <UploaderManagerView />;
            case 'script_writer_manager': return <ScriptWriterManagerView />;
            case 'thumbnail_maker_manager': return <ThumbnailMakerManagerView />;
            case 'video_editor_manager': return <VideoEditorManagerView />;
            case 'reels_uploaded': return <ReelsUploadedPage />;
            case 'finance': return <SuperAdminFinance data={financeData} onNavigate={setActiveView} />;
            case 'pricing_management': return <PricingManagement />;
            default: return <SuperAdminDashboard data={dashboardData} />;
        }
    };

    const superAdminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'finance', label: 'Finance', icon: ICONS.currencyRupee },
        { id: 'staff_management', label: 'Staff Management', icon: ICONS.usersGroup },
        { id: 'uploader_manager', label: 'Uploader Manager', icon: ICONS.upload },
        { id: 'script_writer_manager', label: 'Script Writer Manager', icon: ICONS.pencilSquare },
        { id: 'thumbnail_maker_manager', label: 'Thumbnail Maker Manager', icon: ICONS.photo },
        { id: 'video_editor_manager', label: 'Video Editor Manager', icon: ICONS.video },
        { id: 'reels_uploaded', label: 'Reels Uploaded', icon: ICONS.upload },
    ];

    return (
        <div className="flex h-screen font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
            <motion.aside 
                className="fixed left-0 top-0 h-full w-64 bg-white/40 backdrop-blur-xl flex flex-col z-50 shadow-2xl border-r border-slate-300/70"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-300/70 flex-shrink-0">
                    <h2 className="font-bold text-lg text-slate-800">Super Admin</h2>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {superAdminNavItems.map((item, index) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                            index={index}
                        />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-300/70 flex-shrink-0">
                    <motion.button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all"
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </motion.button>
                </div>
            </motion.aside>

            <main className="flex-1 ml-64 overflow-y-auto">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        className="p-8"
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
    );
};

export default SuperAdminPanel;