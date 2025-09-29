import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const CampaignDetailView = ({ campaignId, onClose }) => {
    const [campaign, setCampaign] = useState(null);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [availableStaff, setAvailableStaff] = useState({ video_editor: [], uploader: [], script_writer: [], thumbnail_maker: [] });
    const [assignedStaff, setAssignedStaff] = useState([]);
    const [initialAssignedStaff, setInitialAssignedStaff] = useState([]);

    const staffRoles = ['video_editor', 'uploader', 'script_writer', 'thumbnail_maker'];

    const fetchCampaignDetails = useCallback(async () => {
        if (!campaignId) return;
        setLoading(true);
        try {
            const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
            if (campaignDoc.exists()) {
                const campaignData = { id: campaignDoc.id, ...campaignDoc.data() };
                setCampaign(campaignData);
                const currentAssignments = campaignData.assignedStaff || [];
                setAssignedStaff(currentAssignments);
                setInitialAssignedStaff(currentAssignments);
            }

            const reelsQuery = query(collection(db, 'reels'), where('campaignId', '==', campaignId));
            const reelsSnapshot = await getDocs(reelsQuery);
            setReels(reelsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

            const staffPromises = staffRoles.map(role => 
                getDocs(query(collection(db, 'users'), where('role', '==', role)))
            );
            const staffSnapshots = await Promise.all(staffPromises);
            const staffData = staffRoles.reduce((acc, role, index) => {
                acc[role] = staffSnapshots[index].docs.map(d => ({ id: d.id, name: d.data().name, email: d.data().email }));
                return acc;
            }, {});
            setAvailableStaff(staffData);

        } catch (error) {
            console.error("Error fetching campaign details:", error);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetchCampaignDetails();
    }, [fetchCampaignDetails]);

    const handleAssignStaff = (role, email) => {
        setAssignedStaff(prev => {
            const newAssignments = prev.filter(a => a.role !== role);
            if (email) {
                newAssignments.push({ role, email });
            }
            return newAssignments;
        });
    };

    const handleSaveAssignments = async () => {
        if (!campaign) return;
        setIsSaving(true);
        try {
            const campaignRef = doc(db, 'campaigns', campaignId);
            const batch = writeBatch(db);

            batch.update(campaignRef, { assignedStaff: assignedStaff, updatedAt: serverTimestamp() });

            const newAssignments = assignedStaff.filter(current => 
                !initialAssignedStaff.some(initial => initial.role === current.role && initial.email === current.email)
            );

            const roleToCollectionMap = {
                'video_editor': 'video_edit_tasks',
                'thumbnail_maker': 'thumbnail_tasks',
                'script_writer': 'script_tasks',
                'uploader': 'uploader_tasks'
            };

            for (const assignment of newAssignments) {
                const taskCollectionName = roleToCollectionMap[assignment.role];
                if (taskCollectionName) {
                    const taskRef = doc(collection(db, taskCollectionName));
                    const taskData = {
                        campaignId: campaignId,
                        campaignName: campaign.name,
                        brandName: campaign.brandName,
                        videoTitle: `Work for campaign: ${campaign.name}`,
                        assignedTo: assignment.email, 
                        status: 'Assigned',
                        assignedAt: serverTimestamp(),
                        createdAt: serverTimestamp(),
                        // Add a role-specific field to make querying easier
                        [assignment.role]: assignment.email
                    };
                    batch.set(taskRef, taskData);
                }
            }

            await batch.commit();
            setInitialAssignedStaff(assignedStaff);
            alert("Assignments saved successfully!");
        } catch (error) {
            console.error("Error saving assignments:", error);
            alert("Failed to save assignments. See console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!campaign) return <div className="p-8 text-center">Campaign not found.</div>;
    
    const isChanged = JSON.stringify(assignedStaff) !== JSON.stringify(initialAssignedStaff);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
                        <p className="text-sm text-slate-500">Campaign Details & Staff Assignment</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200">{ICONS.x}</button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Assign Staff</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {staffRoles.map(role => (
                                <div key={role}>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">{role.replace('_', ' ')}</label>
                                    <select
                                        value={assignedStaff.find(a => a.role === role)?.email || ''}
                                        onChange={e => handleAssignStaff(role, e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    >
                                        <option value="">Not Assigned</option>
                                        {availableStaff[role] && availableStaff[role].map(staff => (
                                            <option key={staff.id} value={staff.email}>{staff.name} ({staff.email})</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <button 
                                onClick={handleSaveAssignments} 
                                disabled={!isChanged || isSaving}
                                className={`px-8 py-3 font-semibold text-white rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    isChanged && !isSaving ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 shadow-lg' : 'bg-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isSaving ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailView;
