import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ICONS } from '../../constants';

const Card = ({ title, value, change = null, icon, subtitle = null }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400 text-2xl">{icon}</div>
        </div>
        {change && <p className="text-xs text-slate-500 mt-2">{change}</p>}
    </div>
);

Card.defaultProps = {
    change: null,
    subtitle: null,
};

const DashboardView = ({ campaigns, onNewCampaign, onNavigateToAnalytics, onNavigateToCampaigns }) => {
    // Calculate metrics from campaigns data
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
    const pendingCampaigns = campaigns.filter(c => c.status === 'Paused' || c.status === 'Pending').length;

    const totalViews = campaigns.reduce((sum, campaign) => sum + campaign.views, 0);
    const totalReels = campaigns.reduce((sum, campaign) => sum + campaign.reelsCount, 0);
    const uploadedReels = campaigns.reduce((sum, campaign) => sum + campaign.reels.filter(r => r.status === 'Live').length, 0);
    const pendingReels = totalReels - uploadedReels;

    const totalLikes = campaigns.reduce((sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + reel.likes, 0), 0);
    const totalComments = campaigns.reduce((sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.comments || 0), 0), 0);
    const totalShares = campaigns.reduce((sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.shares || 0), 0), 0);
    const totalSaves = campaigns.reduce((sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.saves || 0), 0), 0);

    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews * 100).toFixed(1) : 0;

    // Mock promised views (this would come from campaign goals)
    const promisedViews = totalCampaigns * 50000; // Assuming 50k per campaign
    const viewsProgress = promisedViews > 0 ? (totalViews / promisedViews * 100).toFixed(1) : 0;

    // Performance data (mock daily/weekly data)
    const performanceData = [
        { period: 'Mon', views: 12000, engagement: 480 },
        { period: 'Tue', views: 15000, engagement: 600 },
        { period: 'Wed', views: 18000, engagement: 720 },
        { period: 'Thu', views: 14000, engagement: 560 },
        { period: 'Fri', views: 22000, engagement: 880 },
        { period: 'Sat', views: 25000, engagement: 1000 },
        { period: 'Sun', views: 20000, engagement: 800 },
    ];

    const engagementBreakdown = [
        { name: 'Likes', value: totalLikes, color: '#10b981' },
        { name: 'Comments', value: totalComments, color: '#3b82f6' },
        { name: 'Shares', value: totalShares, color: '#f59e0b' },
        { name: 'Saves', value: totalSaves, color: '#ef4444' },
    ];

    const campaignStatusData = [
        { name: 'Active', value: activeCampaigns, color: '#10b981' },
        { name: 'Completed', value: completedCampaigns, color: '#3b82f6' },
        { name: 'Pending', value: pendingCampaigns, color: '#f59e0b' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Campaign Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your marketing campaigns and performance</p>
                </div>
            </div>

            {/* Campaign Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                    title="Total Campaigns"
                    value={totalCampaigns}
                    subtitle={`${activeCampaigns} Active, ${completedCampaigns} Completed`}
                    icon={ICONS.folder}
                />
                <Card
                    title="Views Generated"
                    value={totalViews.toLocaleString()}
                    subtitle={`${viewsProgress}% of promised views`}
                    icon={ICONS.eye}
                    change={`Promised: ${promisedViews.toLocaleString()}`}
                />
                <Card
                    title="Engagement Rate"
                    value={`${engagementRate}%`}
                    subtitle={`${(totalLikes + totalComments + totalShares + totalSaves).toLocaleString()} total engagements`}
                    icon={ICONS.sparkles}
                />
                <Card
                    title="Reel Upload Progress"
                    value={`${uploadedReels}/${totalReels}`}
                    subtitle={`${pendingReels} pending uploads`}
                    icon={ICONS.upload}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mb-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={onNewCampaign}
                        className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all hover:scale-105"
                    >
                        <span className="text-2xl text-blue-600 mb-2">{ICONS.plus}</span>
                        <span className="text-sm font-medium text-slate-700">New Campaign</span>
                    </button>
                    <button
                        onClick={onNavigateToCampaigns}
                        className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all hover:scale-105"
                    >
                        <span className="text-2xl text-green-600 mb-2">{ICONS.upload}</span>
                        <span className="text-sm font-medium text-slate-700">Upload Reel</span>
                    </button>
                    <button
                        onClick={onNavigateToAnalytics}
                        className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all hover:scale-105"
                    >
                        <span className="text-2xl text-purple-600 mb-2">{ICONS.chart}</span>
                        <span className="text-sm font-medium text-slate-700">View Analytics</span>
                    </button>
                    <button
                        onClick={() => onNavigateToCampaigns && onNavigateToCampaigns('order')}
                        className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-all hover:scale-105"
                    >
                        <span className="text-2xl text-orange-600 mb-2">🛒</span>
                        <span className="text-sm font-medium text-slate-700">Create Order</span>
                    </button>
                </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mb-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Engagement Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{totalLikes.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Likes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{totalComments.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Comments</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{totalShares.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Shares</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{totalSaves.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Saves</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Performance Growth (Weekly)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Views" />
                                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Engagement Breakdown</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={engagementBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {engagementBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Campaign Status Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Campaign Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {campaignStatusData.map((status, index) => (
                        <div key={index} className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-2">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray={`${(status.value / totalCampaigns) * 100}, 100`}
                                        className="text-slate-200"
                                    />
                                    <path
                                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray={`${(status.value / totalCampaigns) * 100}, 100`}
                                        className={`${status.color} text-opacity-75`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-slate-700">{status.value}</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600">{status.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
