import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsView = ({ campaigns }) => {
    const chartData = campaigns.map(campaign => ({
        name: campaign.name,
        views: campaign.views,
        reelsCount: campaign.reelsCount,
        engagement: campaign.reels.reduce((sum, reel) => sum + reel.likes, 0),
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
                        {campaigns.map(campaign => {
                            const totalEngagement = campaign.reels.reduce((sum, reel) => sum + reel.likes, 0);
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
                                    <td className="px-6 py-4">{campaign.views.toLocaleString()}</td>
                                    <td className="px-6 py-4">{campaign.reelsCount}</td>
                                    <td className="px-6 py-4">{totalEngagement.toLocaleString()}</td>
                                    <td className="px-6 py-4">{new Date().toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsView;
