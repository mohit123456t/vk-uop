import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

// एनिमेशन वेरिएंट्स
const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, y: 0, scale: 1, 
      transition: { type: 'spring', stiffness: 100, damping: 14 } 
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
};

// 🧩 StatCard Component — iOS स्टाइल फ्रॉस्टेड ग्लास
const StatCard = ({ title, value, change, icon, color, size = 'normal' }) => (
  <motion.div
    // THEME UPDATE: iOS स्टाइल ग्लास इफ़ेक्ट
    className={`bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 ${
      size === 'large' ? 'md:col-span-2' : ''
    }`}
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-md font-semibold text-slate-700">{title}</h3>
      <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{value}</p> 
    <p className="text-sm text-slate-500 flex items-center">{change}</p>
  </motion.div>
);

// 🖥️ Main Dashboard — iOS फ्रॉस्टेड ग्लास थीम
const DashboardView = ({ onViewChange }) => {
  const navigate = useNavigate();
  const [showFinance, setShowFinance] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0, netProfit: 0, activeCampaigns: 0, totalTeamMembers: 0,
    totalViews: 0, pendingApprovals: 0, accountIssues: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (useEffect हुक्स में कोई बदलाव नहीं)
  useEffect(() => {
    const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubBrands = onSnapshot(collection(db, 'brands'), (snapshot) => setBrands(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => { unsubCampaigns(); unsubUsers(); unsubBrands(); };
  }, []);

  useEffect(() => {
    if ((campaigns && campaigns.length > 0) || (users && users.length > 0)) {
        const activeCampaigns = campaigns?.filter((c) => c.status === 'Active').length || 0;
        const pendingCampaigns = campaigns?.filter((c) => c.status === 'Pending Approval').length || 0;
        const totalRevenue = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
        const totalViews = campaigns?.reduce((sum, c) => sum + (c.totalViews || 0), 0) || 0;
        const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          const monthName = date.toLocaleString('default', { month: 'short' });
          const monthRevenue = campaigns?.filter(c => {
            const campaignDate = c.createdAt ? new Date(c.createdAt) : null;
            return campaignDate && campaignDate.getMonth() === date.getMonth() && campaignDate.getFullYear() === date.getFullYear();
          })?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
          return { name: monthName, revenue: monthRevenue, expenses: monthRevenue * 0.3 };
        });
        setDashboardData({
          totalRevenue, netProfit: totalRevenue * 0.7, activeCampaigns,
          totalTeamMembers: users.length, totalViews, pendingApprovals: pendingCampaigns,
          accountIssues: 0,
        });
        setRevenueData(monthlyRevenue);
    }
    setLoading(false);
  }, [campaigns, users]);

  return (
    // THEME UPDATE: iOS जैसा वॉलपेपर स्टाइल बैकग्राउंड
    <div className="min-h-screen p-4 md:p-8 font-sans bg-slate-200 bg-gradient-to-br from-white/30 via-transparent to-transparent">
      {/* 👑 Header Section */}
      <motion.div
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Dashboard</h1>
          <p className="text-md text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <motion.button
          onClick={() => setShowFinance((prev) => !prev)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 font-semibold"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {showFinance ? 'Back to Dashboard' : 'View Finance Details'}
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {showFinance ? (
          <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FinanceView />
          </motion.div>
        ) : (
          <motion.div key="dashboard">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
                {/* 📊 Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   <StatCard
                    title="Total Revenue" value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
                    change={<span className="text-green-600 flex items-center gap-1 font-medium">{ICONS.trendingUp} +12%</span>}
                    icon={ICONS.currencyRupee} color={{bg: "bg-green-100", text: "text-green-600"}}
                  />
                  <StatCard
                    title="Net Profit" value={`₹${Math.round(dashboardData.netProfit).toLocaleString()}`}
                    change={<span className="text-green-600 flex items-center gap-1 font-medium">{ICONS.trendingUp} +8%</span>}
                    icon={ICONS.money} color={{bg: "bg-blue-100", text: "text-blue-600"}}
                  />
                  <StatCard
                    title="Active Campaigns" value={dashboardData.activeCampaigns.toString()}
                    change={`${dashboardData.pendingApprovals} pending`} icon={ICONS.playCircle}
                    color={{bg: "bg-purple-100", text: "text-purple-600"}}
                  />
                  <StatCard
                    title="Team Members" value={dashboardData.totalTeamMembers.toString()}
                    change="All active" icon={ICONS.users}
                    color={{bg: "bg-orange-100", text: "text-orange-600"}}
                  />
                  <StatCard
                    title="Total Views" value={dashboardData.totalViews.toLocaleString()}
                    change="Across all campaigns" icon={ICONS.rocket}
                    color={{bg: "bg-pink-100", text: "text-pink-600"}} size="large"
                  />
                  <StatCard
                    title="Pending Approvals" value={dashboardData.pendingApprovals.toString()}
                    change="Action required" icon={ICONS.checkCircle}
                    color={{bg: "bg-yellow-100", text: "text-yellow-600"}} size="large"
                  />
                </div>

                {/* 📈 Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <motion.div className="xl:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" variants={itemVariants}>
                    <h3 className="font-bold text-xl mb-6 text-slate-800">Revenue Analytics</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)', 
                                borderRadius: '12px',
                                fontFamily: 'Inter'
                             }}
                          />
                          <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '14px' }}/>
                          <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80" variants={itemVariants}>
                    <h3 className="font-bold text-xl mb-6 text-slate-800">Recent Brands</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                       {brands.length > 0 ? brands.slice(0, 5).map((brand, index) => (
                        <motion.div
                          key={brand.id}
                          className="p-4 bg-white/30 rounded-lg border border-slate-300/50 hover:bg-white/70 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-slate-800">{brand.name || 'Unknown Brand'}</h4>
                          <p className="text-sm text-slate-500">Status: {brand.status || 'N/A'}</p>
                        </motion.div>
                      )) : <p className="text-slate-500">No brands available.</p>}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;