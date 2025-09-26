import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsView = ({ campaigns = [] }) => {
    const chartData = campaigns.map(campaign => ({
        name: campaign.name,
        views: campaign.views || 0,
        reelsCount: campaign.reelsCount || 0,
        engagement: campaign.reels ? campaign.reels.reduce((sum, reel) => sum + (reel.likes || 0), 0) : 0,
    }));

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Campaign Analytics</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mb-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Performance Comparison</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="views" fill="#0f172a" />
                            <Bar dataKey="engagement" fill="#64748b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Detailed Campaign Metrics</h3>
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Campaign Name</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Total Views</th>
                            <th scope="col" className="px-6 py-3">Reels Uploaded</th>
                            <th scope="col" className="px-6 py-3">Total Engagement</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl mb-2">📈</span>
                                        <p>No campaign data available</p>
                                        <p className="text-sm">Create campaigns to see analytics</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            campaigns.map(campaign => {
                                const totalLikes = campaign.reels ? campaign.reels.reduce((sum, reel) => sum + (reel.likes || 0), 0) : 0;
                                const totalComments = campaign.reels ? campaign.reels.reduce((sum, reel) => sum + (reel.comments || 0), 0) : 0;
                                const totalShares = campaign.reels ? campaign.reels.reduce((sum, reel) => sum + (reel.shares || 0), 0) : 0;
                                const totalSaves = campaign.reels ? campaign.reels.reduce((sum, reel) => sum + (reel.saves || 0), 0) : 0;
                                const totalEngagement = totalLikes + totalComments + totalShares + totalSaves;
                                const lastUpdated = campaign.reels && campaign.reels.length > 0 ?
                                    new Date(Math.max(...campaign.reels.map(r => new Date(r.uploadedAt || Date.now())))).toLocaleDateString() : 'N/A';
                                return (
                                    <tr key={campaign.id} className="bg-white border-b">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{campaign.name}</th>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                                campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                campaign.status === 'Completed' ? 'bg-slate-200 text-slate-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{(campaign.views || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">{campaign.reelsCount || 0}</td>
                                        <td className="px-6 py-4">{totalEngagement.toLocaleString()}</td>
                                        <td className="px-6 py-4">{lastUpdated}</td>
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

export default AnalyticsView;
