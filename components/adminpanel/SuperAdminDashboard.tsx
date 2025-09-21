import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Brands (Active)</h2>
          <p className="text-3xl font-bold text-blue-600">{dashboardData.totalBrands}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Brands with Live Campaigns</h2>
          <p className="text-3xl font-bold text-green-600">{dashboardData.brandsWithLiveCampaigns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Brands Registered (No Campaign)</h2>
          <p className="text-3xl font-bold text-yellow-600">{dashboardData.brandsWithoutCampaigns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Active Campaigns</h2>
          <p className="text-3xl font-bold text-indigo-600">{dashboardData.totalActiveCampaigns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Live Campaigns</h2>
          <p className="text-3xl font-bold text-green-600">{dashboardData.liveCampaigns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Pending Campaigns</h2>
          <p className="text-3xl font-bold text-orange-600">{dashboardData.pendingCampaigns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Campaign Earnings</h2>
          <p className="text-3xl font-bold text-purple-600">₹{dashboardData.totalCampaignEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Total Staff</h2>
          <p className="text-3xl font-bold text-slate-700">{dashboardData.totalStaff}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Editors</h2>
          <p className="text-3xl font-bold text-blue-500">{dashboardData.totalEditors}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Script Writers</h2>
          <p className="text-3xl font-bold text-pink-500">{dashboardData.totalScriptWriters}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Uploaders</h2>
          <p className="text-3xl font-bold text-green-500">{dashboardData.totalUploaders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-2">Thumbnail Makers</h2>
          <p className="text-3xl font-bold text-yellow-500">{dashboardData.totalThumbnailMakers}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Campaign Wise Earnings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.campaignEarnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="earnings" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
