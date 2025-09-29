import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ICONS } from '../../constants';
import authService from '../../services/authService';
import { formatNumber } from '../../utils/format';
import { motion } from 'framer-motion';

// THEME UPDATE: StatCard को वापस "iOS Frosted Glass" (लाइट थीम) में बदला गया है
const StatCard = ({ title, value, icon, color, size = 'normal' }) => (
  <motion.div
    className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 
    ${size === 'large' ? 'p-6 text-base md:col-span-2' : 'p-4 text-sm'}`}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <div className={`text-xl p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-2xl'} text-slate-900 tracking-tight`}>
      {value}
    </p>
  </motion.div>
);

const SuperAdminDashboard = ({ data }) => {
  const [userCounts, setUserCounts] = useState({ brands: 0 });

  useEffect(() => {
    const fetchUserCounts = async () => {
        const brands = await authService.getUsersByRole('brand');
        setUserCounts({ brands: brands.length });
    };
    fetchUserCounts();
  }, []);

  const dashboardData = data || {};

  // Helper to safely format numbers, defaulting to 0
  const safeFormat = (value) => formatNumber(value || 0);

  return (
    // THEME UPDATE: डार्क बैकग्राउंड हटाया गया
    <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      <div className="text-left">
        {/* THEME UPDATE: टेक्स्ट का रंग वापस डार्क किया गया */}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Super Admin Dashboard</h1>
        <p className="text-md text-slate-500 mt-1">Comprehensive overview of all platform activities.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* THEME UPDATE: आइकॉन के रंग लाइट थीम के हिसाब से बदले गए */}
        <StatCard
          title="Total Brands" value={safeFormat(userCounts.brands)}
          icon={ICONS.briefcase} color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Campaigns" value={safeFormat(dashboardData.totalActiveCampaigns)}
          icon={ICONS.playCircle} color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Live Campaigns" value={safeFormat(dashboardData.liveCampaigns)}
          icon={ICONS.rocket} color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Pending Campaigns" value={safeFormat(dashboardData.pendingCampaigns)}
          icon={ICONS.clock} color="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Brands with Live Campaigns" value={safeFormat(dashboardData.brandsWithLiveCampaigns)}
          icon={ICONS.checkCircle} color="bg-teal-100 text-teal-600" size="large"
        />
        <StatCard
          title="Brands without Campaigns" value={safeFormat(dashboardData.brandsWithoutCampaigns)}
          icon={ICONS.users} color="bg-yellow-100 text-yellow-600" size="large"
        />
      </div>
      
      <div className="grid grid-cols-1">
        <StatCard
          title="Total Campaign Earnings" value={`₹${safeFormat(dashboardData.totalCampaignEarnings)}`}
          icon={ICONS.currencyRupee} color="bg-pink-100 text-pink-600" size="large"
        />
      </div>

      <motion.div 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-bold text-xl mb-6 text-slate-800">Campaign Earnings Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.campaignEarnings || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickFormatter={(value) => formatNumber(value)}
                tickLine={false} axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₹${formatNumber(value)}`, 'Earnings']}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)', 
                    borderRadius: '12px',
                 }}
              />
              <Bar dataKey="earnings" fill="#4f46e5" name="Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuperAdminDashboard;