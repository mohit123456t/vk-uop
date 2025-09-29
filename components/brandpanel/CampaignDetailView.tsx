import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// StatusBadge — unchanged, but kept for reference
const StatusBadge = ({ status }) => {
    const statusInfo = {
        "Active": { text: "Active", classes: "bg-green-100 text-green-800" },
        "Completed": { text: "Completed", classes: "bg-slate-100 text-slate-800" },
        "Paused": { text: "Paused", classes: "bg-yellow-100 text-yellow-800" },
        "Pending Approval": { text: "Pending Approval", classes: "bg-orange-100 text-orange-800" },
        "Rejected": { text: "Rejected", classes: "bg-red-100 text-red-800" },
        "Draft": { text: "Draft", classes: "bg-blue-100 text-blue-800" },
    };
    const currentStatus = statusInfo[status] || { text: status, classes: "bg-gray-100 text-gray-800" };

    return (
        <span className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-full ${currentStatus.classes}`}>
            {currentStatus.text}
        </span>
    );
};

// Alert Components — unchanged
const RejectedAlert = ({ rejectionReason }) => (
    <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <div className="flex items-center">
            <div className="text-red-500 mr-3">❌</div>
            <div>
                <h4 className="font-bold text-red-800">Campaign Rejected</h4>
                <p className="text-red-700 text-sm">
                    {rejectionReason || "This campaign did not meet our guidelines and has been rejected by the admin."}
                </p>
            </div>
        </div>
    </div>
);

const PendingView = () => (
    <div className="p-4 mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
        <div className="flex items-center">
            <div className="text-orange-500 mr-3">⏰</div>
            <div>
                <h4 className="font-bold text-orange-800">Awaiting Approval</h4>
                <p className="text-orange-700 text-sm">
                    This campaign is currently under review by our team. You will be notified once it is approved.
                </p>
            </div>
        </div>
    </div>
);

// 🎯 NEW: Analytics Insights Card ("GAFF" interpreted as key insights/gaffes/observations)
const AnalyticsInsights = ({ totalReels, totalViews, totalReach, expectedReels }) => {
    const completionRate = expectedReels ? ((totalReels / expectedReels) * 100).toFixed(1) : 0;
    const avgViewsPerReel = totalReels ? (totalViews / totalReels).toFixed(0) : 0;

    return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                📊 Analytics Insights
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
                <li>✅ <strong>Completion Rate:</strong> {completionRate}% ({totalReels}/{expectedReels} reels)</li>
                <li>👁️ <strong>Avg. Views per Reel:</strong> {avgViewsPerReel}</li>
                <li>📈 <strong>Total Reach:</strong> {totalReach.toLocaleString()}</li>
                {totalViews > totalReach && (
                    <li className="text-amber-700">⚠️ Views exceed Reach — possible bot activity or repeated views</li>
                )}
                {completionRate < 50 && (
                    <li className="text-red-700">📉 Low completion rate — consider boosting creator incentives</li>
                )}
            </ul>
        </div>
    );
};

// Main Component
const CampaignDetailView = ({ campaignId, onClose, onCreateOrder }) => {
    const [campaign, setCampaign] = useState(null);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalReels, setTotalReels] = useState(0);
    const [totalViews, setTotalViews] = useState(0);
    const [totalReach, setTotalReach] = useState(0);

    // Mock data — replace with real analytics if available
    const engagementData = [
        { day: 'Day 1', engagement: 120 },
        { day: 'Day 2', engagement: 180 },
        { day: 'Day 3', engagement: 220 },
        { day: 'Day 4', engagement: 190 },
        { day: 'Day 5', engagement: 250 },
        { day: 'Day 6', engagement: 300 },
        { day: 'Day 7', engagement: 280 },
    ];

    useEffect(() => {
        if (!campaignId) {
            setLoading(false);
            return;
        }

        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const campaignRef = doc(db, 'campaigns', campaignId);
                const docSnap = await getDoc(campaignRef);
                if (docSnap.exists()) {
                    setCampaign({ id: docSnap.id, ...docSnap.data() });

                    const reelsQuery = query(collection(db, 'reels'), where('campaignId', '==', campaignId));
                    const reelsSnapshot = await getDocs(reelsQuery);
                    const reelsData = reelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setReels(reelsData);
                } else {
                    setCampaign(null);
                }
            } catch (error) {
                console.error("Error fetching campaign details:", error);
                alert("Could not load campaign details.");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId, onClose]);

    useEffect(() => {
        if (reels.length > 0) {
            const totalR = reels.length;
            const totalV = reels.reduce((sum, r) => sum + (r.views || 0), 0);
            const totalRch = reels.reduce((sum, r) => sum + (r.reach || 0), 0);
            setTotalReels(totalR);
            setTotalViews(totalV);
            setTotalReach(totalRch);
        }
    }, [reels]);

    if (loading) {
        return <div className="p-8 text-center">Loading campaign details...</div>;
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-xl font-semibold text-red-600">Campaign Not Found</h3>
                <p className="text-slate-500 mt-2">It might have been deleted or moved.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">{campaign.name}</h1>
                    <p className="text-slate-500 mt-1">Detailed performance & analytics</p>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                    ← Back
                </button>
            </div>

            {/* Status Banner */}
            <div className="mb-6 flex justify-center">
                <StatusBadge status={campaign.status} />
            </div>

            {/* Conditional Alerts */}
            {campaign.status === 'Rejected' && <RejectedAlert rejectionReason={campaign.rejectionReason} />}
            {campaign.status === 'Pending Approval' && <PendingView />}

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalReels}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Reels Uploaded</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Views</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">{totalReach.toLocaleString()}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Reach</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info + Description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Info Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">📋 Campaign Info</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <div><strong>Brand:</strong> {campaign.brandName}</div>
                            <div><strong>Budget:</strong> ₹{campaign.budget?.toLocaleString()}</div>
                            <div><strong>Target Reels:</strong> {campaign.expectedReels}</div>
                            <div><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">📝 Description</h3>
                        <p className="text-slate-700 leading-relaxed">
                            {campaign.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Analytics + Chart */}
                <div className="space-y-6">
                    {/* Analytics Insights */}
                    <AnalyticsInsights
                        totalReels={totalReels}
                        totalViews={totalViews}
                        totalReach={totalReach}
                        expectedReels={campaign.expectedReels}
                    />

                    {/* Engagement Chart */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">📈 Weekly Engagement</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={engagementData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="engagement" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
                >
                    Close
                </button>
                {campaign.status === 'Active' && (
                    <button
                        onClick={() => onCreateOrder(campaign)}
                        className="px-6 py-2.5 font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md flex items-center space-x-2 transition"
                    >
                        <span>+</span>
                        <span>Add New Order</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CampaignDetailView;