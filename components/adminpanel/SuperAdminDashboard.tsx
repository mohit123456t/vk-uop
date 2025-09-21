import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../../constants';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className={`p-3 rounded-full ${colorClass.bg}`}>
      {React.cloneElement(icon, { className: `h-6 w-6 ${colorClass.text}` })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const SuperAdminDashboard = ({ data }) => {
  const dashboardData = {
    totalBrands: data?.totalBrands || 0,
    brandsWithLiveCampaigns: data?.brandsWithLiveCampaigns || 0,
    brandsWithoutCampaigns: data?.brandsWithoutCampaigns || 0,
    totalActiveCampaigns: data?.totalActiveCampaigns || 0,
    liveCampaigns: data?.liveCampaigns || 0,
    pendingCampaigns: data?.pendingCampaigns || 0,
    totalCampaignEarnings: data?.totalCampaignEarnings || 0,
    totalStaff: data?.totalStaff || 0,
    totalEditors: data?.totalEditors || 0,
    totalScriptWriters: data?.totalScriptWriters || 0,
    totalUploaders: data?.totalUploaders || 0,
    totalThumbnailMakers: data?.totalThumbnailMakers || 0,
    campaignEarnings: data?.campaignEarnings || [],
  };

  const stats = [
    { title: "Total Brands", value: dashboardData.totalBrands, icon: ICONS.briefcase, color: { bg: 'bg-blue-100', text: 'text-blue-600' } },
    { title: "Live Campaigns", value: dashboardData.brandsWithLiveCampaigns, icon: ICONS.broadcast, color: { bg: 'bg-green-100', text: 'text-green-600' } },
    { title: "No Campaigns", value: dashboardData.brandsWithoutCampaigns, icon: ICONS.userX, color: { bg: 'bg-yellow-100', text: 'text-yellow-600' } },
    { title: "Active Campaigns", value: dashboardData.totalActiveCampaigns, icon: ICONS.rocket, color: { bg: 'bg-indigo-100', text: 'text-indigo-600' } },
    { title: "Live Now", value: dashboardData.liveCampaigns, icon: ICONS.playCircle, color: { bg: 'bg-teal-100', text: 'text-teal-600' } },
    { title: "Pending", value: dashboardData.pendingCampaigns, icon: ICONS.clock, color: { bg: 'bg-orange-100', text: 'text-orange-600' } },
    { title: "Total Earnings", value: `₹${dashboardData.totalCampaignEarnings.toLocaleString()}`, icon: ICONS.money, color: { bg: 'bg-purple-100', text: 'text-purple-600' } },
    { title: "Total Staff", value: dashboardData.totalStaff, icon: ICONS.users, color: { bg: 'bg-slate-100', text: 'text-slate-600' } },
    { title: "Editors", value: dashboardData.totalEditors, icon: ICONS.edit, color: { bg: 'bg-sky-100', text: 'text-sky-600' } },
    { title: "Script Writers", value: dashboardData.totalScriptWriters, icon: ICONS.fileText, color: { bg: 'bg-pink-100', text: 'text-pink-600' } },
    { title: "Uploaders", value: dashboardData.totalUploaders, icon: ICONS.uploadCloud, color: { bg: 'bg-lime-100', text: 'text-lime-600' } },
    { title: "Thumbnail Makers", value: dashboardData.totalThumbnailMakers, icon: ICONS.image, color: { bg: 'bg-amber-100', text: 'text-amber-600' } },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-700">Campaign Wise Earnings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.campaignEarnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="earnings" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
