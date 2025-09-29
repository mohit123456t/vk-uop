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
import { formatNumber } from '../../utils/format'; // 👈 Import the magic formatter

// 🧩 StatCard Component — Now with number formatting!
const StatCard = ({ title, value, icon, color, size = 'normal' }) => (
  <div
    className={`rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-105 
    ${size === 'large' ? 'p-6 text-base md:col-span-2' : 'p-4 text-sm'}
    bg-white border-slate-200`}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <div className={`text-xl p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-xl'} text-slate-900`}>
      {value} 
    </p>
  </div>
);

// 🖥️ Main Dashboard — With Formatted Numbers
const SuperAdminDashboard = ({ data }) => {
  const [userCounts, setUserCounts] = useState({
    video_editor: 0,
    script_writer: 0,
    thumbnail_maker: 0,
    uploader: 0,
    totalStaff: 0,
    brands: 0,
  });

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const [editors, writers, makers, uploaders, brands] = await Promise.all([
          authService.getUsersByRole('video_editor'),
          authService.getUsersByRole('script_writer'),
          authService.getUsersByRole('thumbnail_maker'),
          authService.getUsersByRole('uploader'),
          authService.getUsersByRole('brand'),
        ]);
        
        setUserCounts({
          video_editor: editors.length,
          script_writer: writers.length,
          thumbnail_maker: makers.length,
          uploader: uploaders.length,
          totalStaff: editors.length + writers.length + makers.length + uploaders.length,
          brands: brands.length,
        });
      } catch (error) {
        console.error("Failed to fetch user counts:", error);
      }
    };

    fetchUserCounts();
  }, []);

  const dashboardData = data || {
    brandsWithLiveCampaigns: 0,
    brandsWithoutCampaigns: 0,
    totalActiveCampaigns: 0,
    liveCampaigns: 0,
    pendingCampaigns: 0,
    totalCampaignEarnings: 0,
    campaignEarnings: [],
  };

  return (
    <div className="space-y-8">
      {/* ... Header ... */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-600 text-base">Comprehensive overview of all platform activities.</p>
      </div>

      {/* 📊 Primary Stats Cards — WITH FORMATTING */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Brands"
          value={formatNumber(userCounts.brands)}
          icon={ICONS.briefcase}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Campaigns"
          value={formatNumber(dashboardData.totalActiveCampaigns)}
          icon={ICONS.playCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Live Campaigns"
          value={formatNumber(dashboardData.liveCampaigns)}
          icon={ICONS.rocket}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Pending Campaigns"
          value={formatNumber(dashboardData.pendingCampaigns)}
          icon={ICONS.clock}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* ... Secondary & Staff Stats with formatting ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Brands with Live Campaigns"
          value={formatNumber(dashboardData.brandsWithLiveCampaigns)}
          icon={ICONS.checkCircle}
          color="bg-teal-100 text-teal-600"
          size="large"
        />
        <StatCard
          title="Brands without Campaigns"
          value={formatNumber(dashboardData.brandsWithoutCampaigns)}
          icon={ICONS.users}
          color="bg-yellow-100 text-yellow-600"
          size="large"
        />
      </div>
      
      {/* 💰 Earnings Overview — WITH FORMATTING */}
      <div className="grid grid-cols-1">
        <StatCard
          title="Total Campaign Earnings"
          value={`₹${formatNumber(dashboardData.totalCampaignEarnings)}`}
          icon={ICONS.currencyRupee}
          color="bg-pink-100 text-pink-600"
          size="large"
        />
      </div>

      {/* ... other components ... */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-xl mb-4 text-slate-900">Campaign Earnings Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.campaignEarnings}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickFormatter={(value) => formatNumber(value)} // Format Y-axis
              />
              <Tooltip
                formatter={(value) => [`₹${formatNumber(value)}`, 'Earnings']} // Format tooltip
                contentStyle={{ /* ...styles... */ }}
              />
              <Bar dataKey="earnings" fill="#6366f1" name="Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
