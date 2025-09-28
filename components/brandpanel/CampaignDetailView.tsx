import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

// Enhanced StatusBadge to handle all states
const StatusBadge = ({ status }) => {
    const statusInfo = {
        "Active": { text: "Active", icon: ICONS.play, classes: "bg-green-100 text-green-800" },
        "Completed": { text: "Completed", icon: ICONS.check, classes: "bg-slate-100 text-slate-800" },
        "Paused": { text: "Paused", icon: ICONS.pause, classes: "bg-yellow-100 text-yellow-800" },
        "Pending Approval": { text: "Pending Approval", icon: ICONS.clock, classes: "bg-orange-100 text-orange-800" },
        "Rejected": { text: "Rejected", icon: ICONS.x, classes: "bg-red-100 text-red-800" },
        "Draft": { text: "Draft", icon: ICONS.pencil, classes: "bg-blue-100 text-blue-800" },
    };
    const currentStatus = statusInfo[status] || { text: status, icon: "", classes: "bg-gray-100 text-gray-800" };

    return (
        <span className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-full ${currentStatus.classes}`}>
            <span className="mr-2 text-lg">{currentStatus.icon}</span>
            {currentStatus.text}
        </span>
    );
};

// A specific alert component for rejected campaigns
const RejectedAlert = ({ rejectionReason }) => (
    <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <div className="flex items-center">
            <div className="text-red-500 mr-3">{ICONS.xCircle}</div>
            <div>
                <h4 className="font-bold text-red-800">Campaign Rejected</h4>
                <p className="text-red-700 text-sm">
                    {rejectionReason || "This campaign did not meet our guidelines and has been rejected by the admin."}
                </p>
            </div>
        </div>
    </div>
);

// View for when a campaign is pending
const PendingView = () => (
    <div className="p-4 mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
        <div className="flex items-center">
            <div className="text-orange-500 mr-3">{ICONS.clock}</div>
            <div>
                <h4 className="font-bold text-orange-800">Awaiting Approval</h4>
                <p className="text-orange-700 text-sm">
                    This campaign is currently under review by our team. You will be notified once it is approved.
                </p>
            </div>
        </div>
    </div>
);

const CampaignDetailView = ({ campaignId, onClose, onCreateOrder }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!campaignId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const campaignRef = doc(db, 'campaigns', campaignId);
        const unsubscribe = onSnapshot(campaignRef, (doc) => {
            if (doc.exists()) {
                setCampaign({ id: doc.id, ...doc.data() });
            } else {
                console.log("No such campaign!");
                setCampaign(null); // Handle case where campaign is deleted
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching campaign details:", error);
            alert("Could not load campaign details. The campaign may have been deleted.");
            setLoading(false);
            onClose();
        });

        return () => unsubscribe();
    }, [campaignId, onClose]);

    if (loading) {
        return <div className="p-8 text-center">Loading details...</div>;
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-xl font-semibold">Campaign Not Found</h3>
                <p className="text-slate-500">It might have been moved or deleted.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg">Close</button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
                        <p className="text-sm text-slate-500">Campaign Details</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">{ICONS.x}</button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 flex justify-center">
                        <StatusBadge status={campaign.status} />
                    </div>

                    {campaign.status === 'Rejected' && <RejectedAlert rejectionReason={campaign.rejectionReason} />}
                    {campaign.status === 'Pending Approval' && <PendingView />}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2">Key Information</h4>
                            <ul className="space-y-2 text-sm">
                                <li><strong>Brand:</strong> {campaign.brandName}</li>
                                <li><strong>Budget:</strong> ₹{campaign.budget?.toLocaleString()}</li>
                                <li><strong>Target Reels:</strong> {campaign.expectedReels}</li>
                                <li><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</li>
                            </ul>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2">Performance</h4>
                             <ul className="space-y-2 text-sm">
                                <li><strong>Total Views:</strong> {(campaign.totalViews || 0).toLocaleString()}</li>
                                {/* Add more performance metrics as needed */}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                            {campaign.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Footer with actions */}
                <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                        Close
                    </button>
                    {campaign.status === 'Active' && (
                         <button 
                            onClick={() => onCreateOrder(campaign)}
                            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-lg flex items-center"
                        >
                            <span className="mr-2">{ICONS.plus}</span>
                            Add New Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailView;
