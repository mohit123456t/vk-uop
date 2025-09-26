
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';
import NewCampaignForm from './NewCampaignForm';
import CampaignDetailView from './CampaignDetailView';

const StatusBadgeComponent = ({ status }) => {
    const statusClasses = {
        "Active": "bg-green-100 text-green-800",
        "Completed": "bg-slate-200 text-slate-800",
        "Pending Approval": "bg-yellow-100 text-yellow-800",
        "Draft": "bg-blue-100 text-blue-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const CampaignManagerView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
            const data = [];
            snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
            setCampaigns(data);
        });
        return () => unsubscribe();
    }, []);

    const handleCreateCampaign = (newCampaign) => {
        setCampaigns(prev => [...prev, newCampaign]);
        setShowNewCampaignForm(false);
    };

    const handleCancelNewCampaign = () => {
        setShowNewCampaignForm(false);
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Campaign Manager</h1>
                <button onClick={() => setShowNewCampaignForm(true)} className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span className="mr-2">{ICONS.plus}</span> New Campaign
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by campaign name, ID, or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
            </div>

            {/* Campaign Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
                    <div key={campaign.id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">{campaign.name}</h3>
                                <p className="text-sm text-slate-600">{campaign.brandName}</p>
                            </div>
                            <StatusBadgeComponent status={campaign.status} />
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Reels</span>
                                <span className="font-bold text-slate-900">{campaign.reels || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Total Views</span>
                                <span className="font-bold text-slate-900">{campaign.totalViews || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Campaign ID</span>
                                <span className="text-xs font-mono text-slate-500">{campaign.id}</span>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            {campaign.status === 'Pending Approval' && (
                                <>
                                    <button
                                        onClick={() => setSelectedCampaign(campaign)}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Review & Assign
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateDoc(doc(db, 'campaigns', campaign.id), { status: 'Rejected' });
                                            } catch (error) {
                                                console.error('Error rejecting campaign:', error);
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {campaign.status !== 'Pending Approval' && (
                                <button
                                    onClick={() => setSelectedCampaign(campaign)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredCampaigns.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                        <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns found</h3>
                    <p className="text-slate-600">Try adjusting your search terms</p>
                </div>
            )}

            {showNewCampaignForm && (
                <NewCampaignForm onCreateCampaign={handleCreateCampaign} onCancel={handleCancelNewCampaign} />
            )}

            {selectedCampaign && (
                <CampaignDetailView
                    campaignId={selectedCampaign.id}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}
        </div>
    );
};

export default CampaignManagerView;
