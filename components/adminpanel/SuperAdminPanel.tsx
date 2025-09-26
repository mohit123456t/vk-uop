import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // 👈 Added for animations
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

// 🧩 NavItem Component — White Theme, Elegant Hover & Active States
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

// 🖥️ Main Super Admin Panel — WHITE GOD-MODE ACTIVATED
const SuperAdminPanel = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [brands, setBrands] = useState([]);
    const navigate = useNavigate();

    // Real-time listeners for campaigns, users, brands
    useEffect(() => {
        const unsubscribeCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
            const campaignsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCampaigns(campaignsData);
        });

        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });

        const unsubscribeBrands = onSnapshot(collection(db, 'brands'), (snapshot) => {
            const brandsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBrands(brandsData);
        });

        return () => {
            unsubscribeCampaigns();
            unsubscribeUsers();
            unsubscribeBrands();
        };
    }, []);

    // Compute dashboardData and financeData from real-time data
    useEffect(() => {
        if (campaigns.length >= 0 || users.length >= 0 || brands.length >= 0) {
            // Compute dashboard data
            const totalBrands = brands.length;
            const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active');
            const liveCampaigns = campaigns.filter((c: any) => c.status === 'Live').length;
            const pendingCampaigns = campaigns.filter((c: any) => c.status === 'Pending Approval').length;
            const totalActiveCampaigns = activeCampaigns.length;
            const totalCampaignEarnings = campaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0);

            // Brands with live campaigns
            const brandsWithLiveCampaigns = new Set(activeCampaigns.map((c: any) => c.brandId)).size;
            const brandsWithoutCampaigns = totalBrands - brandsWithLiveCampaigns;

            // Staff counts from users (assuming users have role field)
            const totalStaff = users.length;
            const totalEditors = users.filter((u: any) => u.role === 'videoeditor').length;
            const totalScriptWriters = users.filter((u: any) => u.role === 'scriptwriter').length;
            const totalUploaders = users.filter((u: any) => u.role === 'uploader').length;
            const totalThumbnailMakers = users.filter((u: any) => u.role === 'thumbnailmaker').length;

            // Campaign earnings data (simplified)
            const campaignEarnings = campaigns.slice(0, 5).map((c: any) => ({
                name: c.name || 'Unnamed',
                earnings: c.budget || 0
            }));

            const computedDashboardData = {
                totalBrands,
                brandsWithLiveCampaigns,
                brandsWithoutCampaigns,
                totalActiveCampaigns,
                liveCampaigns,
                pendingCampaigns,
                totalCampaignEarnings,
                totalStaff,
                totalEditors,
                totalScriptWriters,
                totalUploaders,
                totalThumbnailMakers,
                campaignEarnings
            };

            // Compute finance data
            const totalEarnings = totalCampaignEarnings;
            const totalSpent = totalEarnings * 0.3; // Assume 30% spent
            const pendingPayments = pendingCampaigns * 1000; // Placeholder
            const completedPayments = totalEarnings - pendingPayments;
            const monthlyRevenue = totalEarnings / 12;
            const yearlyRevenue = totalEarnings;

            const computedFinanceData = {
                totalEarnings,
                totalSpent,
                pendingPayments,
                completedPayments,
                monthlyRevenue,
                yearlyRevenue
            };

            setDashboardData(computedDashboardData);
            setFinanceData(computedFinanceData);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [campaigns, users, brands]);

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
            return (
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    <p className="text-lg text-slate-600 font-medium">Loading Super Admin Dashboard...</p>
                </div>
            );
        }

        switch (activeView) {
            case 'dashboard':
                return <SuperAdminDashboard data={dashboardData} />;
            case 'staff_management':
                return <StaffManagementView />;
            case 'uploader_manager':
                return <UploaderManagerView />;
            case 'script_writer_manager':
                return <ScriptWriterManagerView />;
            case 'thumbnail_maker_manager':
                return <ThumbnailMakerManagerView />;
            case 'video_editor_manager':
                return <VideoEditorManagerView />;
            case 'reels_uploaded':
                return <ReelsUploadedPage />;
            case 'finance':
                return <SuperAdminFinance data={financeData} />;
            default:
                return <SuperAdminDashboard data={dashboardData} />;
        }
    };

    // 🧭 Navigation Items
    const superAdminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'staff_management', label: 'Staff Management', icon: ICONS.usersGroup },
        { id: 'uploader_manager', label: 'Uploader Manager', icon: ICONS.upload },
        { id: 'script_writer_manager', label: 'Script Writer Manager', icon: ICONS.pencilSquare },
        { id: 'thumbnail_maker_manager', label: 'Thumbnail Maker Manager', icon: ICONS.photo },
        { id: 'video_editor_manager', label: 'Video Editor Manager', icon: ICONS.video },
        { id: 'reels_uploaded', label: 'Reels Uploaded', icon: ICONS.upload },
        { id: 'finance', label: 'Finance', icon: ICONS.currencyRupee },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* 👈 WHITE GOD-MODE SIDEBAR */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white text-slate-800 flex flex-col z-50 shadow-xl border-r border-slate-200">
                {/* 🔷 Logo Placeholder (Optional) */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
                    <h2 className="font-bold text-lg text-slate-800">Super Admin</h2>
                </div>

                {/* 🧭 Primary Navigation */}
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

                {/* 🚪 Logout Button — Classy Red Accent */}
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

            {/* ➡️ Main Content Area — Adjusted for fixed sidebar */}
            <main className="flex-1 ml-64 overflow-y-auto p-8 min-h-screen bg-slate-50">
                {renderView()}
            </main>
        </div>
    );
};

export default SuperAdminPanel;