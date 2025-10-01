import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';
import ReelUploadView from './ReelUploadView';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';

const AssignedTaskCard = ({ campaign, onClick }) => {
    return (
        <motion.div
            onClick={() => onClick(campaign)}
            className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 hover:shadow-xl transition-all duration-300 cursor-pointer"
            whileHover={{ y: -5 }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{campaign.name}</h3>
                    <p className="text-sm text-slate-600">Brand: {campaign.brandName}</p>
                </div>
                <div className="text-slate-400 text-2xl">{ICONS.video}</div>
            </div>
            <div className="flex items-center justify-between mt-4">
                 <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700`}>
                    Status: {campaign.status}
                </div>
                <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    Upload Reel
                </button>
            </div>
        </motion.div>
    );
};

const AssignedTasksView = () => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [assignedCampaigns, setAssignedCampaigns] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated) {
                setUserProfile(state.userProfile);
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userProfile || !userProfile.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const campaignsRef = collection(db, 'campaigns');
        // FINAL FIX: The field name in Firestore is `assignedTo`, not `assignedUploader`.
        const q = query(
            campaignsRef, 
            where('assignedTo', '==', userProfile.uid), 
            where('status', '==', 'Assigned')
        );

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

    const handleBack = () => setSelectedCampaign(null);

    if (selectedCampaign) {
        return <ReelUploadView campaign={selectedCampaign} onBack={handleBack} />;
    }

    if (loading) {
        return (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Assigned Campaigns</h1>
                <p className="text-slate-500 mt-1">Here are the campaigns assigned to you for reel uploads.</p>
            </div>

            {assignedCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assignedCampaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <AssignedTaskCard
                                campaign={campaign}
                                onClick={setSelectedCampaign}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tasks Assigned</h3>
                    <p className="text-slate-600">You currently have no campaigns with the status 'Assigned'. Please check back later.</p>
                </div>
            )}

            <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-xl pt-0.5">{ICONS.bell}</div>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Upload Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Click on a campaign to view details and upload reels.</li>
                            <li>Only campaigns with the status 'Assigned' will appear here.</li>
                            <li>Track your earnings and performance in the dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AssignedTasksView;
