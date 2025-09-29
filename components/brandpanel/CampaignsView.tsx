import React from 'react';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';

// StatusBadge component (unchanged)
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full shadow-sm inline-block";
    const statusClasses = {
        "Active": "bg-gradient-to-r from-green-400 to-green-500 text-black",
        "Completed": "bg-gradient-to-r from-slate-400 to-slate-500 text-green",
        "Paused": "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow",
        "Rejected": "bg-gradient-to-r from-red-400 to-red-500 text-red", 
    };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-400 text-white'}`}>{status}</span>;
};

// CampaignCard Component — Reusable for each campaign
const CampaignCard = ({ campaign, onSelectCampaign, onCreateOrder }) => {
    const handleSelect = () => onSelectCampaign && onSelectCampaign(campaign);
    const handleCreateOrder = () => onCreateOrder && onCreateOrder(campaign);

    const engagementRate = campaign.engagementRate || '0.00%';
    const lastUpdated = campaign.lastUpdated || 'N/A';
    const reelsCount = campaign.reelsCount || 0;
    const views = (campaign.views || 0).toLocaleString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md border border-slate-200/80 p-6 hover:shadow-lg transition-shadow duration-300"
        >
            {/* Campaign Name & Status */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-500">Reels</div>
                    <div className="font-semibold text-slate-900">{reelsCount}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-500">Total Views</div>
                    <div className="font-semibold text-slate-900">{views}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-500">Engagement Rate</div>
                    <div className="font-semibold text-slate-900">{engagementRate}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg md:col-span-2 lg:col-span-1">
                    <div className="text-slate-500">Last Updated</div>
                    <div className="font-semibold text-slate-900">{lastUpdated}</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={handleSelect}
                    className="text-blue-600 font-medium hover:underline text-sm"
                >
                    View Details
                </button>
                <button
                    onClick={handleCreateOrder}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                    Add Order
                </button>
            </div>
        </motion.div>
    );
};

// Main CampaignsView Component — Card Layout
const CampaignsView = ({ campaigns = [], onSelectCampaign, onNewCampaign, onCreateOrder }) => {
    const handleNewCampaign = () => {
        if (onNewCampaign) {
            onNewCampaign();
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Your Campaigns</h1>
                <button
                    onClick={handleNewCampaign}
                    className="flex items-center bg-slate-900 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-800 transition-colors"
                >
                    <span className="mr-2">{ICONS.plus}</span>
                    New Campaign
                </button>
            </div>

            {/* No Campaigns Message */}
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-12 text-center">
                    <p className="text-slate-500 text-lg">No campaigns found.</p>
                    <button
                        onClick={handleNewCampaign}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                        Create your first campaign
                    </button>
                </div>
            ) : (
                /* Campaign Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <CampaignCard
                            key={`${campaign.id}-${index}`}
                            campaign={campaign}
                            onSelectCampaign={onSelectCampaign}
                            onCreateOrder={onCreateOrder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignsView;
