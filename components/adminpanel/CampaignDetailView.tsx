import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const CampaignDetailView = ({ campaignId, onClose }) => {
    const [campaign, setCampaign] = useState(null);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availableStaff, setAvailableStaff] = useState({});
    const [assignedStaff, setAssignedStaff] = useState([]);

    const resetData = () => {
        setCampaign(null);
        setReels([]);
        setLoading(true);
    };

    useEffect(() => {
        if (campaignId) {
            resetData();
            const fetchCampaignDetails = async () => {
                // Fetch campaign data
                const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
                if (campaignDoc.exists()) {
                    const campaignData: any = { id: campaignDoc.id, ...campaignDoc.data() };
                    setCampaign(campaignData);
                    setAssignedStaff(campaignData.assignedStaff || []);
                }

                // Fetch reels for this campaign
                const q = query(collection(db, 'reels'), where('campaignId', '==', campaignId));
                const querySnapshot = await getDocs(q);
                const reelsData = [];
                querySnapshot.forEach(doc => reelsData.push({ id: doc.id, ...doc.data() }));
                setReels(reelsData);

                // Fetch available staff
                const roles = ['video_editor', 'uploader', 'script_writer', 'thumbnail_maker'];
                const staff = {};
                for (const role of roles) {
                    const staffQuery = query(collection(db, 'users'), where('role', '==', role));
                    const staffSnapshot = await getDocs(staffQuery);
                    staff[role] = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
                setAvailableStaff(staff);

                setLoading(false);
            };

            fetchCampaignDetails();
        } else {
            resetData();
        }

        return () => {
            resetData();
        };
    }, [campaignId]);

    const handleAssignStaff = (role, userId) => {
        setAssignedStaff(prev => {
            const existing = prev.find(a => a.role === role);
            if (existing) {
                return prev.map(a => a.role === role ? { ...a, userId } : a);
            } else {
                return [...prev, { role, userId }];
            }
        });
    };


    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                    <p className="text-center mt-4 text-slate-600">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <p className="text-center text-slate-600">Campaign not found</p>
                    <button onClick={() => { resetData(); onClose(); }} className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
                    <button onClick={() => { resetData(); onClose(); }} className="text-slate-400 hover:text-slate-600">
                        {ICONS.x}
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Campaign Details */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{campaign.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">ID</label>
                                <p className="text-lg font-semibold text-slate-900">{campaign.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Status</label>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    campaign.status === 'Completed' ? 'bg-slate-100 text-slate-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Budget</label>
                                <p className="text-lg font-semibold text-green-600">₹{campaign.budget?.toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Total Views</label>
                                <p className="text-lg font-semibold text-slate-900">{campaign.totalViews || 0}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Engagement</label>
                                <p className="text-lg font-semibold text-slate-900">{campaign.engagement || '0%'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Eng. Rate</label>
                                <p className="text-lg font-semibold text-slate-900">{campaign.engagementRate || '0%'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Reels Count</label>
                                <p className="text-lg font-semibold text-slate-900">{reels.length}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Avg Views/Reel</label>
                                <p className="text-lg font-semibold text-slate-900">{reels.length > 0 ? Math.round((campaign.totalViews || 0) / reels.length) : 0}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Last Updated</label>
                                <p className="text-lg font-semibold text-slate-900">{campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                📊 View Analytics
                            </button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                🛒 Create Order
                            </button>
                        </div>
                    </div>

                    {/* Reels/Videos Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Reels/Videos ({reels.length})</h3>
                        {reels.length === 0 ? (
                            <div className="bg-slate-50 p-8 rounded-lg text-center">
                                <div className="text-slate-400 mb-2">
                                    <span className="text-3xl">{ICONS.video}</span>
                                </div>
                                <p className="text-slate-600">No reels uploaded yet for this campaign</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reels.map(reel => (
                                    <div key={reel.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                                            <span className="text-slate-400">{ICONS.video}</span>
                                        </div>
                                        <h4 className="font-medium text-slate-900 mb-2">{reel.title || `Reel ${reel.id.slice(-4)}`}</h4>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>Status: <span className="font-medium">{reel.status || 'Draft'}</span></p>
                                            <p>Views: <span className="font-medium">{reel.views || 0}</span></p>
                                            <p>Uploaded: <span className="font-medium">{reel.uploadedAt ? new Date(reel.uploadedAt).toLocaleDateString() : 'N/A'}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailView;
