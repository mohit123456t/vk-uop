import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../../constants';
import FinanceView from './FinanceView';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

const StatCard = ({ title, value, change, icon, color }) => (
    <div className={`p-6 rounded-2xl shadow-xl text-white ${color} hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">{title}</h3>
            <div className="text-3xl opacity-80">{icon}</div>
        </div>
        <p className="text-4xl font-bold mb-2">{value}</p>
        <p className="text-sm opacity-90 flex items-center">{change}</p>
    </div>
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
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch campaigns data
            const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
            const campaigns = campaignsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch users data
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch brands data
            const brandsSnapshot = await getDocs(collection(db, 'brands'));
            const brands = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate stats
            const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active').length;
            const pendingCampaigns = campaigns.filter((c: any) => c.status === 'Pending Approval').length;
            const totalRevenue = campaigns.reduce((sum, c: any) => sum + (c.budget || 0), 0);
            const totalViews = campaigns.reduce((sum, c: any) => sum + (c.totalViews || 0), 0);

            // Generate revenue data for chart (last 6 months)
            const monthlyRevenue = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthName = date.toLocaleString('default', { month: 'short' });
                const monthRevenue = campaigns
                    .filter((c: any) => {
                        const campaignDate = c.createdAt ? new Date(c.createdAt) : null;
                        return campaignDate && campaignDate.getMonth() === date.getMonth() && campaignDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, c: any) => sum + (c.budget || 0), 0);

                monthlyRevenue.push({
                    name: monthName,
                    revenue: monthRevenue,
                    expenses: monthRevenue * 0.3 // Assuming 30% expenses
                });
            }

            setDashboardData({
                totalRevenue,
                netProfit: totalRevenue * 0.7, // Assuming 70% profit margin
                activeCampaigns,
                totalTeamMembers: users.length,
                totalViews,
                pendingApprovals: pendingCampaigns,
                accountIssues: 0 // This would need to be calculated based on actual issues
            });

            setRevenueData(monthlyRevenue);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Dashboard Overview</h1>
                    <p className="text-slate-600">Welcome back! Here's what's happening with your campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFinance(prev => !prev)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {showFinance ? 'Hide Finance' : 'Show Finance'}
                    </button>
                </div>
            </div>

            {!showFinance ? (
                <React.Fragment>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Total Revenue" value={`₹${dashboardData.totalRevenue.toLocaleString()}`} change={<span className="text-green-300 mr-1">{ICONS.trendingUp} +12%</span>} icon={ICONS.currencyRupee} color="bg-gradient-to-r from-green-500 to-emerald-600" />
                            <StatCard title="Net Profit" value={`₹${dashboardData.netProfit.toLocaleString()}`} change={<span className="text-green-300 mr-1">{ICONS.trendingUp} +8%</span>} icon={ICONS.chart} color="bg-gradient-to-r from-blue-500 to-cyan-600" />
                            <StatCard title="Active Campaigns" value={dashboardData.activeCampaigns.toString()} change={`${dashboardData.pendingApprovals} pending approval`} icon={ICONS.folder} color="bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <StatCard title="Total Team Members" value={dashboardData.totalTeamMembers.toString()} change="All active" icon={ICONS.usersGroup} color="bg-gradient-to-r from-yellow-500 to-orange-600" />
                            <StatCard title="Total Views Generated" value={dashboardData.totalViews.toLocaleString()} change={`${dashboardData.totalViews > 0 ? Math.floor(dashboardData.totalViews * 0.1) : 0} this week`} icon={ICONS.rocket} color="bg-gradient-to-r from-pink-500 to-rose-600" />
                            <StatCard title="Pending Approvals" value={dashboardData.pendingApprovals.toString()} change="Require attention" icon={ICONS.clipboard} color="bg-gradient-to-r from-orange-500 to-red-600" />
                            <StatCard title="Account Issues" value={dashboardData.accountIssues.toString()} change="None" icon={ICONS.xCircle} color="bg-gradient-to-r from-red-500 to-pink-600" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Revenue Analytics</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData.length > 0 ? revenueData : [
                                        { name: 'Jan', revenue: 0, expenses: 0 },
                                        { name: 'Feb', revenue: 0, expenses: 0 },
                                        { name: 'Mar', revenue: 0, expenses: 0 },
                                        { name: 'Apr', revenue: 0, expenses: 0 },
                                        { name: 'May', revenue: 0, expenses: 0 },
                                        { name: 'Jun', revenue: 0, expenses: 0 },
                                    ]}>
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
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                                <h3 className="font-bold text-xl mb-6 text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Quick Actions</h3>
                                <div className="space-y-4">
                                    <button onClick={() => onViewChange('campaigns')} className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                        Create New Campaign
                                    </button>
                                    <button onClick={() => setShowFinance(true)} className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                        View Reports
                                    </button>
                                    <button onClick={() => onViewChange('users')} className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                                        Manage Users
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : (
                <FinanceView />
            )}
        </div>
    );
};

export default DashboardView;

