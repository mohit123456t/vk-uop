import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';

// Helper component: Corrected the syntax error in the ternary operator.
const AssignmentDropdown = ({ label, value, onChange, users, role }) => (
    <div className="bg-white/80 p-5 rounded-2xl border-2 border-slate-200/90 shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:border-indigo-300">
        <label htmlFor={`${role}-select`} className="block mb-2.5 text-base font-bold text-slate-800 tracking-tight">{label}</label>
        <select 
            id={`${role}-select`} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full p-3 bg-white rounded-xl border-2 border-slate-300/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-slate-900 font-medium"
        >
            <option value="">-- Not Assigned --</option>
            {users.length > 0 ? (
                users.map(user => <option key={user.id} value={user.id} className="font-medium">{user.name} ({user.email})</option>)
            ) : (
                <option disabled>No users found with role: '{role}'</option>
            )}
        </select>
    </div>
);

const CampaignAssignmentView = ({ campaignId, onClose }) => {
    const [campaign, setCampaign] = useState(null);
    const [users, setUsers] = useState({ uploaders: [], videoEditors: [], scriptWriters: [], thumbnailMakers: [] });
    const [selections, setSelections] = useState({ uploader: '', videoEditor: '', scriptWriter: '', thumbnailMaker: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCampaignAndUsers = async () => {
            try {
                setLoading(true);
                setError('');

                const campaignRef = doc(db, "campaigns", campaignId);
                const usersCollection = collection(db, "users");

                const [campaignSnap, usersSnapshot] = await Promise.all([
                    getDoc(campaignRef),
                    getDocs(usersCollection)
                ]);

                if (!campaignSnap.exists()) throw new Error("Campaign not found");

                const campaignData = { id: campaignSnap.id, ...campaignSnap.data() };
                setCampaign(campaignData);
                setSelections({
                    uploader: campaignData.assignedTo || '',
                    videoEditor: campaignData.assignedVideoEditor || '',
                    scriptWriter: campaignData.assignedScriptWriter || '',
                    thumbnailMaker: campaignData.assignedThumbnailMaker || '',
                });

                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                setUsers({
                    uploaders: usersList.filter(u => u.role === 'uploader'),
                    videoEditors: usersList.filter(u => u.role === 'video-editor'),
                    scriptWriters: usersList.filter(u => u.role === 'script-writer'),
                    thumbnailMakers: usersList.filter(u => u.role === 'thumbnail-maker'),
                });

            } catch (err) {
                console.error(err);
                setError(`Failed to load data. ${err.message}. Check user roles in Firestore.`);
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) fetchCampaignAndUsers();
    }, [campaignId]);

    const handleAssign = async () => {
        const assignedRoles = {
            status: 'Assigned',
            assignedTo: selections.uploader,
            assignedVideoEditor: selections.videoEditor,
            assignedScriptWriter: selections.scriptWriter,
            assignedThumbnailMaker: selections.thumbnailMaker,
        };
        try {
            const campaignRef = doc(db, "campaigns", campaignId);
            await updateDoc(campaignRef, assignedRoles);
            alert("Campaign assignments have been updated!");
            onClose();
        } catch (e) {
            console.error("Error assigning campaign:", e);
            alert("Failed to assign campaign.");
        }
    };
    
    const handleSelectionChange = (role, value) => {
        setSelections(prev => ({ ...prev, [role]: value }));
    };

    if (loading || error) return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
             {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
             ) : (
                <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-sm">
                    <h3 className="text-xl font-bold text-red-600">An Error Occurred</h3>
                    <p className="text-slate-600 mt-2 text-sm">{error}</p>
                    <button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-200 rounded-lg text-slate-800 font-semibold hover:bg-slate-300">Close</button>
                </div>
             )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="bg-slate-200/80 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
                <header className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-slate-900/10 bg-slate-200/70 backdrop-blur-lg flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assign Roles: <span className='text-indigo-600'>{campaign?.name}</span></h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-600 hover:bg-slate-900/10 hover:text-slate-800 transition-colors">{ICONS.x}</button>
                </header>

                <main className="overflow-y-auto flex-1 p-6 md:p-8">
                     <div className="space-y-6 max-w-lg mx-auto">
                        <AssignmentDropdown label="Uploader" value={selections.uploader} onChange={val => handleSelectionChange('uploader', val)} users={users.uploaders} role="uploader" />
                        <AssignmentDropdown label="Video Editor" value={selections.videoEditor} onChange={val => handleSelectionChange('videoEditor', val)} users={users.videoEditors} role="video-editor" />
                        <AssignmentDropdown label="Script Writer" value={selections.scriptWriter} onChange={val => handleSelectionChange('scriptWriter', val)} users={users.scriptWriters} role="script-writer" />
                        <AssignmentDropdown label="Thumbnail Maker" value={selections.thumbnailMaker} onChange={val => handleSelectionChange('thumbnailMaker', val)} users={users.thumbnailMakers} role="thumbnail-maker" />
                    </div>
                </main>

                <footer className="sticky bottom-0 z-10 flex justify-end p-5 border-t border-slate-900/10 bg-slate-200/70 backdrop-blur-lg flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-900/10 transition-colors mr-3">Cancel</button>
                    <button onClick={handleAssign} className="px-7 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5">
                        Save Assignments
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default CampaignAssignmentView;
