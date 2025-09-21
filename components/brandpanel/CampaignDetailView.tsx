import React, { useState } from 'react';
import { ICONS } from '../../constants';
import UploadPanel from './UploadPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const CampaignDetailView = ({ campaign, onBack, onUpload, onUpdateCampaign, onCreateOrder }) => {
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState(campaign.description || '');

    const totalViews = campaign.reels.reduce((sum, reel) => sum + reel.views, 0);
    const totalLikes = campaign.reels.reduce((sum, reel) => sum + reel.likes, 0);
    const avgViews = campaign.reels.length > 0 ? Math.round(totalViews / campaign.reels.length) : 0;

    const chartData = campaign.reels.map(reel => ({
        name: reel.id,
        views: reel.views,
        likes: reel.likes,
    }));

    const pieData = [
        { name: 'Views', value: totalViews, color: '#3b82f6' },
        { name: 'Engagement', value: totalLikes, color: '#10b981' },
    ];

    const handleEditClick = () => {
        setIsEditingDescription(true);
    };

    const handleCancelClick = () => {
        setEditedDescription(campaign.description || '');
        setIsEditingDescription(false);
    };

    const handleSaveClick = () => {
        onUpdateCampaign({ ...campaign, description: editedDescription });
        setIsEditingDescription(false);
    };

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors">
                {ICONS.arrowLeft}
                <span className="ml-2">Back to Campaigns</span>
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{campaign.name}</h1>
                <p className="text-slate-500">Campaign ID: {campaign.id}</p>
                {!isEditingDescription ? (
                    campaign.description && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-slate-700">Campaign Description</h4>
                                <button onClick={handleEditClick} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                    Edit
                                </button>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{campaign.description}</p>
                        </div>
                    )
                ) : (
                    <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Edit Campaign Description</h4>
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <div className="mt-2 flex space-x-2">
                            <button
                                onClick={handleSaveClick}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:border-slate-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Views</p>
                            <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                        <div className="text-4xl opacity-80">{ICONS.chart}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Likes</p>
                            <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                        </div>
                        <div className="text-4xl opacity-80">{ICONS.sparkles}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Reels Count</p>
                            <p className="text-2xl font-bold">{campaign.reelsCount}</p>
                        </div>
                        <div className="text-4xl opacity-80">{ICONS.photo}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Avg Views/Reel</p>
                            <p className="text-2xl font-bold">{avgViews.toLocaleString()}</p>
                        </div>
                        <div className="text-4xl opacity-80">{ICONS.chart}</div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <UploadPanel onUpload={(file) => onUpload(file, campaign)} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Reel Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="views" fill="#3b82f6" />
                                <Bar dataKey="likes" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Views vs Engagement</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Detailed Reel Metrics</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-gradient-to-r from-slate-50 to-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Reel ID</th>
                                <th scope="col" className="px-6 py-3">Views</th>
                                <th scope="col" className="px-6 py-3">Likes</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Uploaded At</th>
                                <th scope="col" className="px-6 py-3">Engagement Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaign.reels.map(reel => {
                                const engagementRate = reel.views > 0 ? ((reel.likes / reel.views) * 100).toFixed(2) : 0;
                                const uploadedDate = new Date(reel.uploadedAt).toLocaleDateString();
                                return (
                                    <tr key={reel.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{reel.id}</th>
                                        <td className="px-6 py-4 font-semibold text-blue-600">{reel.views.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-semibold text-green-600">{reel.likes.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                                reel.status === 'Live' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {reel.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{uploadedDate}</td>
                                        <td className="px-6 py-4 font-semibold text-purple-600">{engagementRate}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailView;
