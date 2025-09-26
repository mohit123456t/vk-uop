import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { ICONS } from '../../constants';

// Animated Counter Component
const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{displayValue.toLocaleString()}</span>;
};

// Enhanced Card Component with Gradient & Animation
const Card = ({ title, value, change = null, icon, subtitle = null, delay = 0 }) => (
    <div 
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        style={{ animation: `fadeInUp 0.6s ease-out ${delay}ms both` }}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                    {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                </p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="text-slate-400 text-xl sm:text-2xl p-2 rounded-lg bg-slate-50">{icon}</div>
        </div>
        {change && <p className="text-xs text-slate-500 mt-2">{change}</p>}
    </div>
);

Card.defaultProps = {
    change: null,
    subtitle: null,
};

const DashboardView = ({ campaigns, profile, onNewCampaign, onNavigateToAnalytics, onNavigateToCampaigns }) => {
    // Metrics calculations with edge case handling
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter((c) => c.status === 'Completed').length;
    const pendingCampaigns = campaigns.filter((c) => c.status === 'Paused' || c.status === 'Pending').length;

    const totalViews = campaigns.reduce((sum, campaign) => sum + (campaign.views || 0), 0);
    const totalReels = campaigns.reduce((sum, campaign) => sum + (campaign.reelsCount || 0), 0);
    const uploadedReels = campaigns.reduce(
        (sum, campaign) => sum + campaign.reels.filter((r) => r.status === 'Live').length,
        0,
    );
    const pendingReels = totalReels - uploadedReels;

    const totalLikes = campaigns.reduce(
        (sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.likes || 0), 0),
        0,
    );
    const totalComments = campaigns.reduce(
        (sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.comments || 0), 0),
        0,
    );
    const totalShares = campaigns.reduce(
        (sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.shares || 0), 0),
        0,
    );
    const totalSaves = campaigns.reduce(
        (sum, campaign) => sum + campaign.reels.reduce((rSum, reel) => rSum + (reel.saves || 0), 0),
        0,
    );

    const engagementRate =
        totalViews > 0 ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews * 100).toFixed(1) : 0;
    const promisedViews = totalCampaigns * 50000;
    const viewsProgress = promisedViews > 0 ? (totalViews / promisedViews * 100).toFixed(1) : 0;

    const engagementBreakdown = [
        { name: 'Likes', value: totalLikes, color: '#10b981' },
        { name: 'Comments', value: totalComments, color: '#3b82f6' },
        { name: 'Shares', value: totalShares, color: '#f59e0b' },
        { name: 'Saves', value: totalSaves, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    const campaignStatusData = [
        { name: 'Active', value: activeCampaigns, color: 'text-green-600', bgColor: 'from-green-500 to-green-600' },
        { name: 'Completed', value: completedCampaigns, color: 'text-blue-600', bgColor: 'from-blue-500 to-blue-600' },
        { name: 'Pending', value: pendingCampaigns, color: 'text-yellow-600', bgColor: 'from-yellow-500 to-yellow-600' },
    ];

    const performanceData = [
        { period: 'Mon', views: 12000, engagement: 480 },
        { period: 'Tue', views: 15000, engagement: 600 },
        { period: 'Wed', views: 18000, engagement: 720 },
        { period: 'Thu', views: 14000, engagement: 560 },
        { period: 'Fri', views: 22000, engagement: 880 },
        { period: 'Sat', views: 25000, engagement: 1000 },
        { period: 'Sun', views: 20000, engagement: 800 },
    ];

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="font-medium text-slate-800">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Campaign Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">Real-time insights for your marketing success</p>
                    {/* Welcome Message */}
                    {profile && profile.name && (
                        <p className="text-sm text-green-600 mt-1">
                            👋 Welcome back, {profile.name}! Ready to create amazing campaigns?
                        </p>
                    )}
                </div>
                {/* Profile Info */}
                {profile && profile.name && (
                    <div className="mt-4 sm:mt-0 bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{profile.name}</p>
                                <p className="text-sm text-slate-500">{profile.brandName || 'Brand'}</p>
                                {profile.brandId && (
                                    <p className="text-xs text-blue-600 font-mono">ID: {profile.brandId}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign Overview Cards */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card
                        title="Total Campaigns"
                        value={totalCampaigns}
                        subtitle={`${activeCampaigns} Active`}
                        icon={ICONS.folder}
                        delay={100}
                    />
                    <Card
                        title="Views Generated"
                        value={totalViews}
                        subtitle={`${viewsProgress}% goal`}
                        icon={ICONS.eye}
                        delay={200}
                    />
                    <Card
                        title="Engagement Rate"
                        value={`${engagementRate}%`}
                        subtitle={`${(totalLikes + totalComments + totalShares + totalSaves).toLocaleString()} eng.`}
                        icon={ICONS.sparkles}
                        delay={300}
                    />
                    <Card
                        title="Reel Upload"
                        value={`${uploadedReels}/${totalReels}`}
                        subtitle={`${pendingReels} left`}
                        icon={ICONS.upload}
                        delay={400}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80 mb-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'New Campaign', icon: ICONS.plus, color: 'from-blue-500 to-blue-600', onClick: onNewCampaign },
                        { label: 'Upload Reel', icon: ICONS.upload, color: 'from-green-500 to-green-600', onClick: onNavigateToCampaigns },
                        { label: 'View Analytics', icon: ICONS.chart, color: 'from-purple-500 to-purple-600', onClick: onNavigateToAnalytics },
                        { label: 'Create Order', icon: '🛒', color: 'from-orange-500 to-orange-600', onClick: () => onNavigateToCampaigns && onNavigateToCampaigns('order') },
                    ].map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl active:scale-95 transition-all transform`}
                            style={{ animation: `fadeInUp 0.5s ease-out ${500 + idx * 100}ms both` }}
                        >
                            <span className="text-2xl mb-2">{action.icon}</span>
                            <span className="text-xs font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80 mb-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">📊 Engagement Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Likes', value: totalLikes, color: 'text-green-600' },
                        { label: 'Comments', value: totalComments, color: 'text-blue-600' },
                        { label: 'Shares', value: totalShares, color: 'text-yellow-600' },
                        { label: 'Saves', value: totalSaves, color: 'text-red-600' },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors" style={{ animation: `fadeIn 0.5s ease-out ${700 + idx * 100}ms both` }}>
                            <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                                <AnimatedNumber value={stat.value} />
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">📈 Performance Growth</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="period" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                                <Area type="monotone" dataKey="engagement" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">🍩 Engagement Breakdown</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={engagementBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
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
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">🎯 Campaign Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {campaignStatusData.map((status, index) => (
                        <div key={index} className="text-center" style={{ animation: `fadeInUp 0.6s ease-out ${900 + index * 150}ms both` }}>
                            <div className="relative w-28 h-28 mx-auto mb-3">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${status.bgColor} opacity-20`}></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800">
                                        <AnimatedNumber value={status.value} />
                                    </span>
                                </div>
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${(status.value / Math.max(totalCampaigns, 1)) * 283}, 283`}
                                        className={`${status.color.replace('text-', 'text-')} text-opacity-80`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
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