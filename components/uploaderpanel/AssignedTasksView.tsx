import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';
import ReelUploadView from './ReelUploadView';
import { ICONS } from '../../constants';

const AssignedTaskCard = ({ campaign, onClick }) => {
    return (
        <div
            onClick={() => onClick(campaign)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{campaign.name}</h3>
                    <p className="text-sm text-slate-600">Brand: {campaign.brandName}</p>
                </div>
                <div className="text-slate-400">{ICONS.video}</div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Upload Reel
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Details
                </button>
            </div>
        </div>
    );
};

const AssignedTasksView = () => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [assignedCampaigns, setAssignedCampaigns] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                setUserProfile(state.userProfile);
            } else {
                setUserProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userProfile) return;

        setLoading(true);
        const campaignsRef = collection(db, 'campaigns');
        const q = query(campaignsRef, where('assignedUploader', '==', userProfile.uid), where('status', '==', 'Active'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedCampaigns = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssignedCampaigns(fetchedCampaigns);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching assigned campaigns:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleCampaignClick = (campaign) => {
        setSelectedCampaign(campaign);
    };

    const handleBack = () => {
        setSelectedCampaign(null);
    };

    if (selectedCampaign) {
        // Assuming ReelUploadView can be adapted or a new detail view is used
        return <ReelUploadView campaign={selectedCampaign} onBack={handleBack} />;
    }

    if (loading) {
        return <div className="text-center p-8">Loading tasks...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Assigned Campaigns</h1>
                <p className="text-slate-600">Here are the campaigns assigned to you for reel uploads.</p>
            </div>

            {assignedCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assignedCampaigns.map(campaign => (
                        <AssignedTaskCard
                            key={campaign.id}
                            campaign={campaign}
                            onClick={handleCampaignClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tasks Assigned</h3>
                    <p className="text-slate-600">You currently have no campaigns assigned for reel uploads.</p>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600">{ICONS.bell}</div>
                    <div>
                        <h3 className="font-medium text-blue-900 mb-1">Upload Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Click on a campaign to view details and upload reels.</li>
                            <li>• Follow the campaign guidelines for each upload.</li>
                            <li>• Track your earnings and performance in the dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedTasksView;
