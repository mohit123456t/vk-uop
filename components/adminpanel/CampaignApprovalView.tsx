import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignDetailView from './CampaignDetailView'; // नया इम्पोर्ट

const CampaignApprovalView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewCampaignId, setViewCampaignId] = useState(null); // बदला हुआ स्टेट
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'campaigns'), where('status', '==', 'Pending Approval'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(document => ({ ...document.data(), id: document.id }));
            setCampaigns(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching campaigns:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleReject = async (campaignId) => {
        if (!campaignId) return;
        if (!window.confirm('Are you sure you want to reject this campaign?')) return;
        setProcessingId(campaignId);
        try {
            await updateDoc(doc(db, 'campaigns', campaignId), { status: 'Rejected' });
        } catch (error) {
            console.error(`Error rejecting campaign [${campaignId}]:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Campaign Approval</h1>

            {campaigns.length === 0 ? (
                <motion.div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Approvals</h3>
                    <p className="text-slate-600">All campaigns have been reviewed.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => {
                        const isProcessing = processingId === campaign.id;
                        return (
                            <motion.div 
                                key={campaign.id} 
                                className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden flex flex-col ${isProcessing ? 'opacity-50' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                               <div className="p-6 flex-grow">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{campaign.name}</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-slate-700"><span>Budget:</span><span className="font-bold text-green-600">₹{campaign.budget?.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-slate-700"><span>Expected Reels:</span><span className="font-medium text-slate-800">{campaign.expectedReels}</span></div>
                                        <div className="flex justify-between text-slate-700"><span>Deadline:</span><span className="font-medium text-slate-800">{new Date(campaign.deadline).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleReject(campaign.id)}
                                        disabled={isProcessing}
                                        className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-500/10 rounded-lg hover:bg-red-500/20 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isProcessing ? 'Processing...' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => setViewCampaignId(campaign.id)} // बदला हुआ एक्शन
                                        disabled={isProcessing}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait shadow-lg shadow-indigo-500/20"
                                    >
                                        Review & Assign
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* बदला हुआ सेक्शन: CampaignDetailView का उपयोग */}
            <AnimatePresence>
                {viewCampaignId && (
                    <CampaignDetailView 
                        campaignId={viewCampaignId} 
                        onClose={() => setViewCampaignId(null)} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CampaignApprovalView;
