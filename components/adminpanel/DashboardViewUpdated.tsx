import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../../constants';
import FinanceView from './FinanceView';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { collection, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const StatCard = ({ title, value, change, icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className={`p-6 rounded-2xl shadow-xl text-white ${color} hover:shadow-2xl transition-all duration-300 border border-white/20 cursor-pointer`}
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">{title}</h3>
            <motion.div
                className="text-3xl opacity-80"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.3 }}
            >
                {icon}
            </motion.div>
        </div>
        <p className="text-4xl font-bold mb-2">{value}</p>
        <p className="text-sm opacity-90 flex items-center">{change}</p>
    </motion.div>
);

const DashboardView = ({ onViewChange }) => {
    const navigate = useNavigate();
    const [showFinance, setShowFinance] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        netProfit: 0,
        activeCampaigns: 0,
        totalTeamMembers: 0,
        totalViews: 0,
        pendingApprovals: 0,
        accountIssues: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch campaigns data
                const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
                const campaigns = campaignsSnapshot.docs.map(doc => doc.data());

                // Fetch brands data
                const brandsSnapshot = await getDocs(collection(db, 'brands'));
                const brands = brandsSnapshot.docs.map(doc => doc.data());

                // Fetch users data
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const users = usersSnapshot.docs.map(doc => doc.data());

                // Calculate metrics
                const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
                const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
                const totalTeamMembers = users.length;
                const totalViews = campaigns.reduce((sum, campaign) => sum + (campaign.totalViews || 0), 0);
                const pendingApprovals = campaigns.filter(c => c.status === 'Pending Approval').length;

                setDashboardData({
                    totalRevenue: `₹${totalRevenue.toLocaleString()}`,
                    netProfit: `₹${Math.floor(totalRevenue * 0.15).toLocaleString()}`,
                    activeCampaigns,
                    totalTeamMembers,
                    totalViews: totalViews.toLocaleString(),
                    pendingApprovals,
                    accountIssues: 0
                });

                // Generate revenue data for chart
                const monthlyRevenue = [
                    { name: 'Jan', revenue: Math.floor(totalRevenue * 0.12), expenses: Math.floor(totalRevenue * 0.08) },
                    { name: 'Feb', revenue: Math.floor(totalRevenue * 0.15), expenses: Math.floor(totalRevenue * 0.10) },
                    { name: 'Mar', revenue: Math.floor(totalRevenue * 0.18), expenses: Math.floor(totalRevenue * 0.12) },
                    { name: 'Apr', revenue: Math.floor(totalRevenue * 0.20), expenses: Math.floor(totalRevenue * 0.14) },
                    { name: 'May', revenue: Math.floor(totalRevenue * 0.22), expenses: Math.floor(totalRevenue * 0.15) },
                    { name: 'Jun', revenue: Math.floor(totalRevenue * 0.25), expenses: Math.floor(totalRevenue * 0.16) },
                    { name: 'Jul', revenue: Math.floor(totalRevenue * 0.28), expenses: Math.floor(totalRevenue * 0.18) },
                ];

                setRevenueData(monthlyRevenue);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                ></motion.div>
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Dashboard Overview</h1>
                    <p className="text-slate-600">Welcome back! Here's what's happening with your campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFinance(prev => !prev)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {showFinance ? 'Hide Finance' : 'Show Finance'}
                    </motion.button>
                </div>
            </motion.div>

            {!showFinance ? (
                <React.Fragment>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value={dashboardData.totalRevenue}
                            change={<span className="text-green-300 mr-1">{ICONS.trendingUp} 15%</span>}
                            icon={ICONS.currencyRupee}
                            color="bg-gradient-to-r from-green-500 to-emerald-600"
                            delay={0.1}
                        />
                        <StatCard
                            title="Net Profit"
                            value={dashboardData.netProfit}
                            change={<span className="text-green-300 mr-1">{ICONS.trendingUp} 12%</span>}
                            icon={ICONS.chart}
                            color="bg-gradient-to-r from-blue-500 to-cyan-600"
                            delay={0.2}
                        />
                        <StatCard
                            title="Active Campaigns"
                            value={dashboardData.activeCampaigns}
                            change={`${dashboardData.pendingApprovals} pending approval`}
                            icon={ICONS.folder}
                            color="bg-gradient-to-r from-indigo-500 to-purple-600"
                            delay={0.3}
                        />
                        <StatCard
                            title="Total Team Members"
                            value={dashboardData.totalTeamMembers}
                            change="2 on trial"
                            icon={ICONS.usersGroup}
                            color="bg-gradient-to-r from-yellow-500 to-orange-600"
                            delay={0.4}
                        />
                        <StatCard
                            title="Total Views Generated"
                            value={dashboardData.totalViews}
                            change="1.2K this week"
                            icon={ICONS.rocket}
                            color="bg-gradient-to-r from-pink-500 to-rose-600"
                            delay={0.5}
                        />
                        <StatCard
                            title="Pending Approvals"
                            value={dashboardData.pendingApprovals}
                            change="None"
                            icon={ICONS.clipboard}
                            color="bg-gradient-to-r from-orange-500 to-red-600"
                            delay={0.6}
                        />
                        <StatCard
                            title="Account Issues"
                            value={dashboardData.accountIssues}
                            change="None"
                            icon={ICONS.xCircle}
                            color="bg-gradient-to-r from-red-500 to-pink-600"
                            delay={0.7}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="lg:col-span-2 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                        >
                            <h3 className="font-bold text-xl mb-6 text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Revenue Analytics</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                                <h3 className="font-bold text-xl mb-6 text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Quick Actions</h3>
                                <div className="space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onViewChange('campaigns')}
                                        className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Create New Campaign
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowFinance(true)}
                                        className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        View Reports
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onViewChange('users')}
                                        className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Manage Users
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </React.Fragment>
            ) : (
                <FinanceView />
            )}
        </div>
    );
};

export default DashboardView;
