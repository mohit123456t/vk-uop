import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // 👈 Added for animations
import { ICONS } from '../../constants';
import FinanceView from './FinanceView';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

// 🧩 StatCard Component — White Theme with Colored Accents
const StatCard = ({ title, value, change, icon, color, size = 'normal' }) => (
  <motion.div
    className={`p-6 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-white ${
      size === 'large' ? 'md:col-span-2' : ''
    }`}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
    <p className="text-sm text-slate-600 flex items-center">{change}</p>
  </motion.div>
);

// 🖥️ Main Dashboard — WHITE GOD MODE ACTIVATED
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
    accountIssues: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for campaigns
    const unsubscribeCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const campaignsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCampaigns(campaignsData);
    });

    // Real-time listener for users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });

    // Real-time listener for brands
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

  // Compute dashboard data when campaigns or users change
  useEffect(() => {
    if (campaigns.length > 0 || users.length > 0) {
      const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active').length;
      const pendingCampaigns = campaigns.filter((c: any) => c.status === 'Pending Approval').length;
      const totalRevenue = campaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0);
      const totalViews = campaigns.reduce((sum: number, c: any) => sum + (c.totalViews || 0), 0);

      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const monthRevenue = campaigns
          .filter((c: any) => {
            const campaignDate = c.createdAt ? new Date(c.createdAt) : null;
            return (
              campaignDate &&
              campaignDate.getMonth() === date.getMonth() &&
              campaignDate.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum: number, c: any) => sum + (c.budget || 0), 0);

        monthlyRevenue.push({
          name: monthName,
          revenue: monthRevenue,
          expenses: monthRevenue * 0.3,
        });
      }

      setDashboardData({
        totalRevenue,
        netProfit: totalRevenue * 0.7,
        activeCampaigns,
        totalTeamMembers: users.length,
        totalViews,
        pendingApprovals: pendingCampaigns,
        accountIssues: 0,
      });

      setRevenueData(monthlyRevenue);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [campaigns, users]);



  const handleLogout = () => {
    navigate('/');
  };

  // 💡 Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* 👑 Header Section */}
      <motion.div
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-600">Welcome back! Here's what's happening with your campaigns.</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <button
            onClick={() => setShowFinance((prev) => !prev)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
          >
            {showFinance ? 'Hide Finance' : 'Show Finance'}
          </button>
        </motion.div>
      </motion.div>

      {!showFinance ? (
        <React.Fragment>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* 📊 Stats Cards Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <StatCard
                  title="Total Revenue"
                  value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
                  change={
                    <span className="text-green-600 flex items-center">
                      <span className="mr-1">{ICONS.trendingUp}</span> +12%
                    </span>
                  }
                  icon={ICONS.currencyRupee}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Net Profit"
                  value={`₹${Math.round(dashboardData.netProfit).toLocaleString()}`}
                  change={
                    <span className="text-green-600 flex items-center">
                      <span className="mr-1">{ICONS.trendingUp}</span> +8%
                    </span>
                  }
                  icon={ICONS.money}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="Active Campaigns"
                  value={dashboardData.activeCampaigns.toString()}
                  change={`${dashboardData.pendingApprovals} pending approval`}
                  icon={ICONS.playCircle}
                  color="bg-purple-100 text-purple-600"
                />
                <StatCard
                  title="Total Team Members"
                  value={dashboardData.totalTeamMembers.toString()}
                  change="All active"
                  icon={ICONS.users}
                  color="bg-orange-100 text-orange-600"
                />

                {/* Large Cards */}
                <StatCard
                  title="Total Views Generated"
                  value={dashboardData.totalViews.toLocaleString()}
                  change={`${Math.floor(dashboardData.totalViews * 0.1)} this week`}
                  icon={ICONS.rocket}
                  color="bg-pink-100 text-pink-600"
                  size="large"
                />
                <StatCard
                  title="Pending Approvals"
                  value={dashboardData.pendingApprovals.toString()}
                  change="Require attention"
                  icon={ICONS.checkCircle}
                  color="bg-red-100 text-red-600"
                  size="large"
                />
              </motion.div>

              {/* 📈 Main Content Grid */}
              <motion.div
                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {/* Chart Section */}
                <motion.div
                  className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                >
                  <h3 className="font-bold text-xl mb-6 text-slate-900">Revenue Analytics</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          revenueData.length > 0
                            ? revenueData
                            : [
                                { name: 'Jan', revenue: 0, expenses: 0 },
                                { name: 'Feb', revenue: 0, expenses: 0 },
                                { name: 'Mar', revenue: 0, expenses: 0 },
                                { name: 'Apr', revenue: 0, expenses: 0 },
                                { name: 'May', revenue: 0, expenses: 0 },
                                { name: 'Jun', revenue: 0, expenses: 0 },
                              ]
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            fontSize: '13px',
                          }}
                          itemStyle={{ color: '#334155' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Brand Data Section */}
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                >
                  <h3 className="font-bold text-xl mb-6 text-slate-900">Brand Overview</h3>
                  <div className="space-y-4">
                    {brands.length > 0 ? (
                      brands.slice(0, 5).map((brand, index) => (
                        <motion.div
                          key={brand.id}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800">{brand.name || 'Unknown Brand'}</h4>
                          <p className="text-sm text-slate-600">Status: {brand.status || 'N/A'}</p>
                          <p className="text-sm text-slate-600">Campaigns: {brand.campaigns || 0}</p>
                          <p className="text-sm text-slate-600">Total Spend: {brand.totalSpend || '₹0'}</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-slate-600">No brands available.</p>
                    )}
                    <motion.button
                      onClick={() => onViewChange('brands')}
                      className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View All Brands
                    </motion.button>
                  </div>
                </motion.div>

                {/* Quick Actions Sidebar */}
                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
                    variants={itemVariants}
                  >
                    <h3 className="font-bold text-xl mb-6 text-slate-900">Quick Actions</h3>
                    <div className="space-y-3">
                      <motion.button
                        onClick={() => onViewChange('campaigns')}
                        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                        whileHover={{ scale: 1.03, backgroundColor: "#2563eb" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{ICONS.edit}</span>
                          Create New Campaign
                        </div>
                      </motion.button>
                      <motion.button
                        onClick={() => setShowFinance(true)}
                        className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                        whileHover={{ scale: 1.03, backgroundColor: "#059669" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{ICONS.barChart}</span>
                          View Reports
                        </div>
                      </motion.button>
                      <motion.button
                        onClick={() => onViewChange('users')}
                        className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                        whileHover={{ scale: 1.03, backgroundColor: "#c2410c" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{ICONS.users}</span>
                          Manage Users
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* System Status Card */}
                  <motion.div
                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
                    variants={itemVariants}
                  >
                    <h4 className="font-bold text-lg mb-4 text-slate-900">System Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Server Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-600 font-medium">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Database</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">Connected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Last Updated</span>
                        <span className="text-slate-900 font-medium">Just now</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </React.Fragment>
      ) : (
        <FinanceView />
      )}
    </div>
  );
};

export default DashboardView;