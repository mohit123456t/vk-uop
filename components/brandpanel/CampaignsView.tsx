import React from 'react';
import { ICONS } from '../../constants';

const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold mr-2 px-3 py-1 rounded-full shadow-sm";
    const statusClasses = {
        "Active": "bg-gradient-to-r from-green-400 to-green-500 text-white",
        "Completed": "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
        "Paused": "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || ''}`}>{status}</span>;
};

const CampaignCard = ({ campaign, onSelectCampaign, onCreateOrder }) => {
    const totalEngagement = campaign.reels.reduce((sum, reel) => sum + reel.likes, 0);
    const avgViews = campaign.reels.length > 0 ? Math.round(campaign.views / campaign.reels.length) : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{campaign.views.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Total Views</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{totalEngagement.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Engagement</p>
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <div className="text-sm text-slate-600">
                    <span className="font-medium">{campaign.reelsCount}</span> Reels •
                    <span className="font-medium ml-1">{avgViews.toLocaleString()}</span> Avg Views
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onSelectCampaign(campaign)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => onCreateOrder(campaign)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Create Order
                    </button>
                </div>
            </div>
        </div>
    );
};

const CampaignsView = ({ campaigns, onSelectCampaign, onNewCampaign, onCreateOrder }) => (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Your Campaigns</h1>
            <button onClick={onNewCampaign} className="flex items-center bg-slate-900 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                <span className="mr-2">{ICONS.plus}</span>
                New Campaign
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Campaign Name</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Reels</th>
                        <th scope="col" className="px-6 py-3">Total Views</th>
                        <th scope="col" className="px-6 py-3">Engagement Rate</th>
                        <th scope="col" className="px-6 py-3">Last Updated</th>
                        <th scope="col" className="px-6 py-3"></th>
                        <th scope="col" className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map(campaign => {
                        const totalLikes = campaign.reels.reduce((sum, reel) => sum + reel.likes, 0);
                        const engagementRate = campaign.views > 0 ? ((totalLikes / campaign.views) * 100).toFixed(2) : '0.00';
                        const lastUpdated = campaign.reels.length > 0 ? new Date(Math.max(...campaign.reels.map(r => new Date(r.uploadedAt)))).toLocaleDateString() : 'N/A';
                        return (
                            <tr key={campaign.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{campaign.name}</th>
                                <td className="px-6 py-4"><StatusBadge status={campaign.status} /></td>
                                <td className="px-6 py-4">{campaign.reelsCount}</td>
                                <td className="px-6 py-4">{campaign.views.toLocaleString()}</td>
                                <td className="px-6 py-4">{engagementRate}%</td>
                                <td className="px-6 py-4">{lastUpdated}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onSelectCampaign(campaign)} className="font-medium text-slate-600 hover:underline">View Details</button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onCreateOrder(campaign)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Add Order</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

export default CampaignsView;
