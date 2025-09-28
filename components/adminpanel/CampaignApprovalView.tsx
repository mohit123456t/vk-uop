import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const CampaignApprovalView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [staff, setStaff] = useState({ videoEditors: [], scriptWriters: [], thumbnailMakers: [], uploaders: [] });
    const [assignments, setAssignments] = useState({ editor: '', scriptWriter: '', thumbnailMaker: '', uploader: '' });
    const [processingId, setProcessingId] = useState(null);

    const fetchStaff = async () => {
        try {
            const staffData = { videoEditors: [], scriptWriters: [], thumbnailMakers: [], uploaders: [] };
            
            const usersSnapshot = await getDocs(collection(db, 'users'));
            usersSnapshot.forEach(doc => {
                const user = { id: doc.id, ...doc.data() };
                const userRoles = Array.isArray(user.role) ? user.role : [user.role];

                if (userRoles.includes('video_editor')) staffData.videoEditors.push(user);
                if (userRoles.includes('script_writer')) staffData.scriptWriters.push(user);
                if (userRoles.includes('thumbnail_maker')) staffData.thumbnailMakers.push(user);
                if (userRoles.includes('uploader')) staffData.uploaders.push(user);
            });

            setStaff(staffData);
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    };

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

        fetchStaff();
        return () => unsubscribe();
    }, []);

    const handleReject = async (campaignId) => {
        if (!campaignId) {
            alert("Error: Campaign ID is missing.");
            return;
        }
        if (!window.confirm('Are you sure you want to reject this campaign?')) return;
        
        setProcessingId(campaignId);
        try {
            const campaignRef = doc(db, 'campaigns', campaignId);
            await updateDoc(campaignRef, { status: 'Rejected' });
        } catch (error) {
            console.error(`Error rejecting campaign [${campaignId}]:`, error);
            alert(`Failed to reject campaign.`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAssignmentSubmit = async () => {
        if (!selectedCampaign) return;
        const campaignId = selectedCampaign.id;
        
        setProcessingId(campaignId);
        try {
            const campaignRef = doc(db, 'campaigns', campaignId);
            await updateDoc(campaignRef, {
                status: 'Active',
                approvedAt: new Date().toISOString(),
                assignedEditor: assignments.editor,
                assignedScriptWriter: assignments.scriptWriter,
                assignedThumbnailMaker: assignments.thumbnailMaker,
                assignedUploader: assignments.uploader
            });
            setSelectedCampaign(null);
        } catch (error) {
            console.error(`Error approving campaign [${campaignId}]:`, error);
            alert(`Failed to approve campaign.`);
        } finally {
            setProcessingId(null);
        }
    };

    const StaffDropdown = ({ name, label, staffList, value }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <select 
                name={name} 
                value={value} 
                onChange={(e) => setAssignments(prev => ({ ...prev, [name]: e.target.value }))} 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select {label}</option>
                {staffList.length > 0 ? (
                    staffList.map(member => (
                        <option key={member.id} value={member.id}>{member.name || 'Unnamed'}</option>
                    ))
                ) : (
                    <option value="" disabled>No staff found for this role</option>
                )}
            </select>
        </div>
    );

    if (loading) {
        return <div className="text-center p-8">Loading approvals...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Campaign Approval</h1>

            {campaigns.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Approvals</h3>
                    <p className="text-slate-600">All campaigns have been reviewed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(campaign => {
                        const isProcessing = processingId === campaign.id;
                        return (
                            <div key={campaign.id} className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col ${isProcessing ? 'opacity-50' : ''}`}>
                               <div className="p-6 flex-grow">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{campaign.name}</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span>Budget:</span><span className="font-bold text-green-600">₹{campaign.budget?.toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Expected Reels:</span><span>{campaign.expectedReels}</span></div>
                                        <div className="flex justify-between"><span>Deadline:</span><span>{new Date(campaign.deadline).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleReject(campaign.id)}
                                        disabled={isProcessing}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isProcessing ? 'Processing...' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => { setAssignments({ editor: '', scriptWriter: '', thumbnailMaker: '', uploader: '' }); setSelectedCampaign(campaign); }}
                                        disabled={isProcessing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        Approve & Assign
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-slate-900">Assign Staff for "{selectedCampaign.name}"</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <StaffDropdown name="editor" label="Video Editor" staffList={staff.videoEditors} value={assignments.editor} />
                            <StaffDropdown name="scriptWriter" label="Script Writer" staffList={staff.scriptWriters} value={assignments.scriptWriter} />
                            <StaffDropdown name="thumbnailMaker" label="Thumbnail Maker" staffList={staff.thumbnailMakers} value={assignments.thumbnailMaker} />
                            <StaffDropdown name="uploader" label="Uploader" staffList={staff.uploaders} value={assignments.uploader} />
                        </div>
                        <div className="p-6 bg-slate-50 flex justify-end space-x-4">
                            <button onClick={() => setSelectedCampaign(null)} className="px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleAssignmentSubmit} className="px-6 py-2.5 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg" disabled={processingId === selectedCampaign.id}>
                                {processingId === selectedCampaign.id ? 'Assigning...' : 'Submit Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignApprovalView;
