import React from 'react';
import { ICONS } from '../../constants';

// StatusBadge component (original simple version)
const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold mr-2 px-3 py-1 rounded-full shadow-sm";
    const statusClasses = {
        "Active": "bg-gradient-to-r from-green-400 to-green-500 text-white",
        "Completed": "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
        "Paused": "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
        // Adding Rejected so the old hardcoded data doesn't crash
        "Rejected": "bg-gradient-to-r from-red-400 to-red-500 text-white", 
    };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-400 text-white'}`}>{status}</span>;
};

// CampaignsView component - Restored to its original "dumb" state.
// It only displays the data it is given via props.
const CampaignsView = ({ campaigns = [], onSelectCampaign, onNewCampaign, onCreateOrder }) => {
    const handleSelectCampaign = (campaign) => {
        if (onSelectCampaign) {
            onSelectCampaign(campaign);
        }
    };

    const handleNewCampaign = () => {
        if (onNewCampaign) {
            onNewCampaign();
        }
    };

    const handleCreateOrder = (campaign) => {
        if (onCreateOrder) {
            onCreateOrder(campaign);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Your Campaigns</h1>
                <button onClick={handleNewCampaign} className="flex items-center bg-slate-900 text-white font-semibold py-2 px-4 rounded-lg text-sm">
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
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-slate-500">
                                    <p>No campaigns found.</p>
                                </td>
                            </tr>
                        ) : (
                            campaigns.map(campaign => {
                                const engagementRate = campaign.engagementRate || '0.00%';
                                const lastUpdated = campaign.lastUpdated || 'N/A';
                                return (
                                    <tr key={campaign.id} className="bg-white border-b hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{campaign.name}</th>
                                        <td className="px-6 py-4"><StatusBadge status={campaign.status} /></td>
                                        <td className="px-6 py-4">{campaign.reelsCount || 0}</td>
                                        <td className="px-6 py-4">{(campaign.views || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">{engagementRate}</td>
                                        <td className="px-6 py-4">{lastUpdated}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleSelectCampaign(campaign)} className="font-medium text-blue-600 hover:underline">View Details</button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleCreateOrder(campaign)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Add Order</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CampaignsView;
