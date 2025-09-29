import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StaffManagementView from './StaffManagementView';
import ReelsUploadedPage from './ReelsUploadedPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminFinance from './SuperAdminFinance';
import UploaderManagerView from './UploaderManagerView';
import ScriptWriterManagerView from './ScriptWriterManagerView';
import ThumbnailMakerManagerView from './ThumbnailMakerManagerView';
import VideoEditorManagerView from './VideoEditorManagerView';
import { ICONS } from '../../constants';
import authService from '../../services/authService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

// 🧩 NavItem Component
const NavItem = ({ icon, label, active, onClick, index }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            active
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
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

// 🖥️ Main Super Admin Panel
const SuperAdminPanel = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
            setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubCampaigns(); unsubUsers(); };
    }, []);

    useEffect(() => {
        if (!campaigns || !users) return;

        // --- REVENUE CALCULATION ---
        const totalCampaignEarnings = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);

        // --- EXPENSE CALCULATION (STAFF SALARIES) ---
        const staffRoles = ['video_editor', 'script_writer', 'thumbnail_maker', 'uploader'];
        const totalExpenses = users
            .filter(u => staffRoles.includes(u.role))
            .reduce((sum, u) => sum + Number(u.salary || 0), 0);

        // --- PROFIT CALCULATION ---
        const netProfit = totalCampaignEarnings - totalExpenses;

        // --- DASHBOARD DATA ---
        const brands = users.filter(u => u.role === 'brand');
        const activeCampaigns = campaigns.filter(c => c.status === 'Active');
        const brandsWithLiveCampaigns = new Set(activeCampaigns.map(c => c.brandId)).size;

        const computedDashboardData = {
            totalBrands: brands.length,
            brandsWithLiveCampaigns,
            brandsWithoutCampaigns: brands.length - brandsWithLiveCampaigns,
            totalActiveCampaigns: activeCampaigns.length,
            liveCampaigns: campaigns.filter(c => c.status === 'Live').length,
            pendingCampaigns: campaigns.filter(c => c.status === 'Pending Approval').length,
            totalCampaignEarnings,
            campaignEarnings: campaigns.slice(0, 5).map(c => ({ name: c.name || 'Unnamed', earnings: Number(c.budget || 0) }))
        };

        // --- FINANCE DATA ---
        const computedFinanceData = {
            totalRevenue: totalCampaignEarnings,
            totalExpenses,
            netProfit,
            // You can add more detailed finance data here later
        };

        setDashboardData(computedDashboardData);
        setFinanceData(computedFinanceData);
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
            return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
        }
        switch (activeView) {
            case 'dashboard': return <SuperAdminDashboard data={dashboardData} />;
            case 'staff_management': return <StaffManagementView />;
            case 'uploader_manager': return <UploaderManagerView />;
            case 'script_writer_manager': return <ScriptWriterManagerView />;
            case 'thumbnail_maker_manager': return <ThumbnailMakerManagerView />;
            case 'video_editor_manager': return <VideoEditorManagerView />;
            case 'reels_uploaded': return <ReelsUploadedPage />;
            case 'finance': return <SuperAdminFinance data={financeData} />;
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
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            <aside className="fixed left-0 top-0 h-full w-64 bg-white text-slate-800 flex flex-col z-50 shadow-xl border-r border-slate-200">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
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
                <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
                    <motion.button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </motion.button>
                </div>
            </aside>
            <main className="flex-1 ml-64 overflow-y-auto p-8 min-h-screen bg-slate-50">
                {renderView()}
            </main>
        </div>
    );
};

export default SuperAdminPanel;
