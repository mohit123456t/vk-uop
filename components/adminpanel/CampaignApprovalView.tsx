import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignAssignmentView from './CampaignAssignmentView';

const CampaignApprovalView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'assign'

    useEffect(() => {
        setLoading(true);
        // FIX: The status should be 'Pending Approval' to match what the brand panel sets.
        const q = query(collection(db, 'campaigns'), where('status', '==', 'Pending Approval'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampaigns(data);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching campaigns:", err);
            setError('Failed to load campaigns. Check Firestore security rules and index configuration.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const campaignRef = doc(db, "campaigns", id);
            await updateDoc(campaignRef, { status: newStatus });
        } catch (e) {
            console.error("Error updating campaign status:", e);
            alert(`Failed to update status.`);
        }
    };
    
    const openAssignmentView = (campaign) => {
        setSelectedCampaign(campaign);
        setViewMode('assign');
    };

    const closeViews = () => {
        setSelectedCampaign(null);
        setViewMode('list');
    };

    if (loading) {
        return <div className="text-center p-6">Loading pending campaigns...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-1">
            <AnimatePresence>
                {viewMode === 'list' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <h2 className="text-2xl font-bold text-slate-800 mb-6">Campaign Approval Queue</h2>
                         {campaigns.length > 0 ? (
                            <div className="space-y-4">
                                {campaigns.map(campaign => (
                                    <motion.div 
                                        key={campaign.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/60 p-5 rounded-xl border border-white/40 shadow-sm flex items-center justify-between"
                                    >
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{campaign.name}</h3>
                                            <p className="text-sm text-slate-600">Budget: ₹{campaign.budget.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleUpdateStatus(campaign.id, 'Rejected')} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100/70 hover:bg-red-200/70 rounded-lg">Reject</button>
                                            <button onClick={() => handleUpdateStatus(campaign.id, 'Approved')} className="px-4 py-2 text-sm font-semibold text-green-600 bg-green-100/70 hover:bg-green-200/70 rounded-lg">Approve</button>
                                            <button onClick={() => openAssignmentView(campaign)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">Review & Assign</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-10">No pending campaigns to review.</p>
                        )}
                    </motion.div>
                )}

                {viewMode === 'assign' && selectedCampaign && (
                    <CampaignAssignmentView 
                        campaignId={selectedCampaign.id} 
                        onClose={closeViews} 
                    />
                )}

            </AnimatePresence>
        </div>
    );
};

export default CampaignApprovalView;
