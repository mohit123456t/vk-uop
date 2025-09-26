import React, { useState } from 'react';
import { ICONS } from '../../constants';

// StatusBadge component - Enhanced
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full shadow-sm";
    const statusClasses = {
        "Active": "bg-gradient-to-r from-green-400 to-green-500 text-white animate-pulse",
        "Completed": "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
        "Paused": "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
        "Pending": "bg-gradient-to-r from-orange-400 to-orange-500 text-white",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses["Pending"]}`}>{status}</span>;
};

// CampaignCard component - Fully Enhanced
const CampaignCard = ({ campaign, onSelectCampaign, onCreateOrder }) => {
    const totalLikes = campaign.reels.reduce((sum, reel) => sum + (reel.likes || 0), 0);
    const totalComments = campaign.reels.reduce((sum, reel) => sum + (reel.comments || 0), 0);
    const totalShares = campaign.reels.reduce((sum, reel) => sum + (reel.shares || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgViews = campaign.reels.length > 0 ? Math.round(campaign.views / campaign.reels.length) : 0;
    const engagementRate = campaign.views > 0 ? ((totalEngagement / campaign.views) * 100).toFixed(1) : 0;

    // Get latest upload date
    const lastUpdated = campaign.reels.length > 0 
        ? new Date(Math.max(...campaign.reels.map(r => new Date(r.uploadedAt)))).toLocaleDateString()
        : 'Never';

    return (
        <div 
            className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            style={{ animation: 'fadeInUp 0.5s ease-out' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {campaign.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">ID: <span className="font-mono">{campaign.id}</span></p>
                </div>
                <StatusBadge status={campaign.status} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {campaign.views.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Total Views</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        {totalEngagement.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Engagement</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                        {engagementRate}%
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Eng. Rate</p>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Reels Count:</span>
                    <span className="font-semibold text-slate-800">{campaign.reelsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg Views/Reel:</span>
                    <span className="font-semibold text-slate-800">{avgViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-semibold text-slate-800">{lastUpdated}</span>
                </div>
            </div>

            {/* Action Buttons - SEXY BUTTONS JO TUM CHAHE HO! */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                    onClick={() => onSelectCampaign(campaign)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transform transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                    📊 View Analytics
                </button>
                <button
                    onClick={() => onCreateOrder(campaign)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transform transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                    🛒 Create Order
                </button>
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState = ({ onNewCampaign }) => (
    <div className="text-center py-16 bg-gradient-to-b from-slate-50 to-white rounded-2xl">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No campaigns yet</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">Create your first campaign to start tracking performance and managing your marketing efforts.</p>
        <button
            onClick={onNewCampaign}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transform transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
        >
            🚀 Create New Campaign
        </button>
    </div>
);

// CampaignsView component - FULLY CARD BASED!
const CampaignsView = () => {
    const [campaigns, setCampaigns] = useState([
        {
            id: "CMP-001",
            name: "Summer Sale Blitz",
            status: "Active",
            reels: [
                { id: "R-001", likes: 1500, comments: 89, shares: 45, views: 25000, uploadedAt: "2024-06-01T12:00:00.000Z", status: "Live" },
                { id: "R-002", likes: 2800, comments: 156, shares: 89, views: 42000, uploadedAt: "2024-06-05T12:00:00.000Z", status: "Live" },
                { id: "R-003", likes: 3200, comments: 203, shares: 124, views: 58000, uploadedAt: "2024-06-10T12:00:00.000Z", status: "Live" }
            ],
            reelsCount: 3,
            views: 125000
        },
        {
            id: "CMP-002",
            name: "Back to School",
            status: "Completed",
            reels: [
                { id: "R-004", likes: 800, comments: 45, shares: 23, views: 15000, uploadedAt: "2024-05-15T12:00:00.000Z", status: "Live" },
                { id: "R-005", likes: 1200, comments: 67, shares: 34, views: 22000, uploadedAt: "2024-05-20T12:00:00.000Z", status: "Live" }
            ],
            reelsCount: 2,
            views: 37000
        },
        {
            id: "CMP-003",
            name: "Holiday Special",
            status: "Paused",
            reels: [
                { id: "R-006", likes: 500, comments: 23, shares: 12, views: 8000, uploadedAt: "2024-07-01T12:00:00.000Z", status: "Processing" }
            ],
            reelsCount: 1,
            views: 8000
        }
    ]);

    const handleSelectCampaign = (campaign) => {
        console.log("Campaign selected:", campaign);
        // Navigate to campaign detail view
    };

    const handleNewCampaign = () => {
        console.log("New campaign created");
        // Show create campaign modal/form
    };

    const handleCreateOrder = (campaign) => {
        console.log("Order created for campaign:", campaign);
        // Navigate to order creation page
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Your Campaigns
                    </h1>
                    <p className="text-slate-500">Manage and track all your marketing campaigns</p>
                </div>
                <button 
                    onClick={handleNewCampaign} 
                    className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transform transition-all duration-200 shadow-lg hover:shadow-xl flex items-center text-sm"
                >
                    <span className="mr-2 text-lg">{ICONS.plus}</span>
                    New Campaign
                </button>
            </div>

            {/* Campaign Cards Grid */}
            {campaigns.length === 0 ? (
                <EmptyState onNewCampaign={handleNewCampaign} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <div key={campaign.id} style={{ animationDelay: `${index * 100}ms` }}>
                            <CampaignCard 
                                campaign={campaign} 
                                onSelectCampaign={handleSelectCampaign} 
                                onCreateOrder={handleCreateOrder} 
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Summary Card */}
            {campaigns.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Campaign Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                            <p className="text-2xl font-bold">{campaigns.length}</p>
                            <p className="text-sm opacity-90">Total Campaigns</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                            <p className="text-2xl font-bold">
                                {campaigns.reduce((sum, c) => sum + c.reelsCount, 0)}
                            </p>
                            <p className="text-sm opacity-90">Total Reels</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                            <p className="text-2xl font-bold">
                                {campaigns.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
                            </p>
                            <p className="text-sm opacity-90">Total Views</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
                            <p className="text-2xl font-bold">
                                {campaigns.filter(c => c.status === 'Active').length}
                            </p>
                            <p className="text-sm opacity-90">Active Campaigns</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsView;