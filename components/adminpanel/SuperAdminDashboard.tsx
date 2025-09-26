import React from 'react';
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

// 🧩 StatCard Component — White Theme with Colored Accents
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

// 🖥️ Main Dashboard — WHITE GOD MODE ACTIVATED
const SuperAdminDashboard = ({ data }) => {
  const dashboardData = data || {
    totalBrands: 0,
    brandsWithLiveCampaigns: 0,
    brandsWithoutCampaigns: 0,
    totalActiveCampaigns: 0,
    liveCampaigns: 0,
    pendingCampaigns: 0,
    totalCampaignEarnings: 0,
    totalStaff: 0,
    totalEditors: 0,
    totalScriptWriters: 0,
    totalUploaders: 0,
    totalThumbnailMakers: 0,
    campaignEarnings: [],
  };

  return (
    <div className="space-y-8">
      {/* 👑 Header Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-600 text-base">
          Comprehensive overview of all platform activities and performance metrics.
        </p>
      </div>

      {/* 📊 Primary Stats Cards — Gradient Icons on White */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Brands"
          value={dashboardData.totalBrands.toString()}
          icon={ICONS.briefcase}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Campaigns"
          value={dashboardData.totalActiveCampaigns.toString()}
          icon={ICONS.playCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Live Campaigns"
          value={dashboardData.liveCampaigns.toString()}
          icon={ICONS.rocket}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Pending Campaigns"
          value={dashboardData.pendingCampaigns.toString()}
          icon={ICONS.clock}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* 📈 Secondary Stats — Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Brands with Live Campaigns"
          value={dashboardData.brandsWithLiveCampaigns.toString()}
          icon={ICONS.checkCircle}
          color="bg-teal-100 text-teal-600"
          size="large"
        />
        <StatCard
          title="Brands without Campaigns"
          value={dashboardData.brandsWithoutCampaigns.toString()}
          icon={ICONS.users}
          color="bg-yellow-100 text-yellow-600"
          size="large"
        />
      </div>

      {/* 👥 Staff & Team */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={dashboardData.totalStaff.toString()}
          icon={ICONS.usersGroup}
          color="bg-gray-100 text-gray-600"
        />
        <StatCard
          title="Video Editors"
          value={dashboardData.totalEditors.toString()}
          icon={ICONS.video}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Script Writers"
          value={dashboardData.totalScriptWriters.toString()}
          icon={ICONS.pencilSquare}
          color="bg-pink-100 text-pink-600"
        />
        <StatCard
          title="Uploaders"
          value={dashboardData.totalUploaders.toString()}
          icon={ICONS.upload}
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* 🖼️ Thumbnail Makers */}
      <div className="grid grid-cols-1">
        <StatCard
          title="Thumbnail Makers"
          value={dashboardData.totalThumbnailMakers.toString()}
          icon={ICONS.photo}
          color="bg-orange-100 text-orange-600"
          size="large"
        />
      </div>

      {/* 💰 Earnings Overview */}
      <div className="grid grid-cols-1">
        <StatCard
          title="Total Campaign Earnings"
          value={`₹${dashboardData.totalCampaignEarnings.toLocaleString()}`}
          icon={ICONS.currencyRupee}
          color="bg-pink-100 text-pink-600"
          size="large"
        />
      </div>

      {/* 📉 Chart Section — Clean White Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
        <h3 className="font-bold text-xl mb-4 text-slate-900">Campaign Earnings Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                dashboardData.campaignEarnings.length > 0
                  ? dashboardData.campaignEarnings
                  : [
                      { name: 'Campaign A', earnings: 0 },
                      { name: 'Campaign B', earnings: 0 },
                      { name: 'Campaign C', earnings: 0 },
                      { name: 'Campaign D', earnings: 0 },
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
              <Bar dataKey="earnings" fill="#6366f1" name="Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 Quick Stats Summary — Triple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Overview */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
          <h4 className="font-bold text-lg mb-4 text-slate-900">Platform Overview</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Users</span>
              <span className="font-bold text-slate-900">
                {dashboardData.totalStaff + dashboardData.totalBrands}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active Projects</span>
              <span className="font-bold text-green-600">{dashboardData.liveCampaigns}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Success Rate</span>
              <span className="font-bold text-blue-600">
                {dashboardData.totalActiveCampaigns > 0
                  ? Math.round((dashboardData.liveCampaigns / dashboardData.totalActiveCampaigns) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
          <h4 className="font-bold text-lg mb-4 text-slate-900">Team Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Content Creators</span>
              <span className="font-bold text-purple-600">
                {dashboardData.totalScriptWriters + dashboardData.totalThumbnailMakers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Technical Team</span>
              <span className="font-bold text-indigo-600">
                {dashboardData.totalEditors + dashboardData.totalUploaders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Efficiency</span>
              <span className="font-bold text-green-600">98%</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
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
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;