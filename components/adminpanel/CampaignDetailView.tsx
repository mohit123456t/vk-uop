import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

// Helper components
const InfoPill = ({ icon, label, value }) => (
    <div className="bg-white/40 border border-slate-300/50 rounded-lg p-3 flex items-start">
        <span className="text-lg text-indigo-600 mr-3">{icon}</span>
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
        </div>
    </div>
);

const StaffDisplay = ({ role, assignedStaff }) => {
    const assignment = assignedStaff.find(a => a.role === role);
    const staffName = assignment ? (assignment.name || assignment.email) : 'Not Assigned';
    return (
        <div className="bg-white/40 border border-slate-300/50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600 capitalize">{role.replace('_', ' ')}</p>
            <p className="font-semibold text-slate-900 mt-1">{staffName}</p>
            {assignment && <p className="text-xs text-slate-500">{assignment.email}</p>}
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            isActive
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-indigo-500 hover:border-slate-300'
        }`}
    >
        {label}
    </button>
);

const CampaignDetailView = ({ campaignId, onClose }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assignedStaff, setAssignedStaff] = useState([]);
    const [workItems, setWorkItems] = useState({ scripts: [], videos: [], thumbnails: [], uploads: [] });
    const [activeTab, setActiveTab] = useState('scripts');

    const staffRoles = ['video_editor', 'uploader', 'script_writer', 'thumbnail_maker'];

    const fetchCampaignDetails = useCallback(async () => {
        if (!campaignId) return;
        setLoading(true);
        try {
            const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
            if (!campaignDoc.exists()) throw new Error("Campaign not found");
            
            const campaignData = { id: campaignDoc.id, ...campaignDoc.data() };
            setCampaign(campaignData);

            // Fetch assigned staff details
            const assignments = campaignData.assignedStaff || [];
            const staffEmails = assignments.map(a => a.email).filter(Boolean);
            let staffData = {};
            if (staffEmails.length > 0) {
                const usersQuery = query(collection(db, 'users'), where('email', 'in', staffEmails));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => { staffData[doc.data().email] = doc.data().name; });
            }
            setAssignedStaff(assignments.map(a => ({ ...a, name: staffData[a.email] || 'Unknown' })));

            // Fetch all related work items
            const [scriptsSnap, videosSnap, thumbnailsSnap, uploadsSnap] = await Promise.all([
                getDocs(query(collection(db, 'script_tasks'), where('campaignId', '==', campaignId))),
                getDocs(query(collection(db, 'video_edit_tasks'), where('campaignId', '==', campaignId))),
                getDocs(query(collection(db, 'thumbnail_tasks'), where('campaignId', '==', campaignId))),
                getDocs(query(collection(db, 'reels'), where('campaignId', '==', campaignId)))
            ]);

            setWorkItems({
                scripts: scriptsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                videos: videosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                thumbnails: thumbnailsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                uploads: uploadsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            });

        } catch (error) {
            console.error("Error fetching campaign details:", error);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => { fetchCampaignDetails(); }, [fetchCampaignDetails]);

    if (loading) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
    if (!campaign) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"><div className="bg-white/50 p-8 rounded-2xl text-slate-800">Campaign not found.</div></div>;

    const renderContent = () => {
        const items = workItems[activeTab];
        if (!items || items.length === 0) {
            return <div className="text-center py-10 text-slate-500">No items found for this category.</div>;
        }

        switch(activeTab) {
            case 'scripts':
                return items.map(item => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                        <p className="font-semibold text-slate-800">{item.videoTitle || 'Script'}</p>
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{item.scriptContent}</p>
                    </div>
                ));
            case 'videos':
                 return items.map(item => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                        <p className="font-semibold text-slate-800">{item.videoTitle || 'Edited Video'}</p>
                        <a href={item.downloadURL} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View/Download Video</a>
                    </div>
                ));
            case 'thumbnails':
                 return items.map(item => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50 flex items-center gap-4">
                        <img src={item.thumbnailURL} alt="Thumbnail" className="w-24 h-24 object-cover rounded-md" />
                        <div>
                             <p className="font-semibold text-slate-800">{item.videoTitle || 'Thumbnail'}</p>
                             <a href={item.thumbnailURL} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Full Size</a>
                        </div>
                    </div>
                ));
            case 'uploads':
                return items.map(item => (
                    <div key={item.id} className="p-4 bg-white/40 rounded-lg border border-slate-300/50">
                         <p className="font-semibold text-slate-800">{item.title}</p>
                         <p className="text-sm text-slate-500">Uploaded on: {new Date(item.publishedAt?.toDate()).toLocaleDateString()}</p>
                         {/* Add more reel details if needed */}
                    </div>
                ));
            default: return null;
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border border-slate-300/70"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
                <div className="p-6 border-b border-slate-300/70 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
                        <p className="text-sm text-slate-500">Campaign Details & Work Progress</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-500/10 transition-colors">{ICONS.x}</button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Campaign Brief Section */}
                    <div className="bg-white/30 border border-slate-300/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Campaign Brief</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <InfoPill icon={ICONS.briefcase} label="Brand Name" value={campaign.brandName} />
                            <InfoPill icon={ICONS.money} label="Budget" value={`₹${campaign.budget?.toLocaleString()}`} />
                            <InfoPill icon={ICONS.video} label="Expected Reels" value={campaign.expectedReels} />
                            <InfoPill icon={ICONS.calendar} label="Deadline" value={new Date(campaign.deadline).toLocaleDateString()} />
                        </div>
                        <div>
                             <p className="text-sm font-medium text-slate-600 mb-1.5">Description</p>
                             <p className="text-slate-700 bg-white/30 p-3 rounded-lg border border-slate-300/50 whitespace-pre-wrap">{campaign.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    {/* Assigned Staff Section */}
                     <div className="bg-white/30 border border-slate-300/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Assigned Staff</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {staffRoles.map(role => <StaffDisplay key={role} role={role} assignedStaff={assignedStaff} />)}
                        </div>
                    </div>

                    {/* Work Progress Section */}
                    <div className="bg-white/30 border border-slate-300/50 rounded-xl">
                        <div className="px-6 pt-4">
                            <h3 className="text-xl font-bold text-slate-800">Work Progress</h3>
                            <div className="border-b border-slate-300/70 mt-2">
                                <TabButton label={`Scripts (${workItems.scripts.length})`} isActive={activeTab === 'scripts'} onClick={() => setActiveTab('scripts')} />
                                <TabButton label={`Edited Videos (${workItems.videos.length})`} isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
                                <TabButton label={`Thumbnails (${workItems.thumbnails.length})`} isActive={activeTab === 'thumbnails'} onClick={() => setActiveTab('thumbnails')} />
                                <TabButton label={`Uploaded Reels (${workItems.uploads.length})`} isActive={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                           <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                           </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CampaignDetailView;
