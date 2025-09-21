import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { ICONS } from '../../constants';

const CampaignApprovalView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        budget: '',
        expectedReels: '',
        deadline: '',
        assignedEditor: '',
        assignedScriptWriter: '',
        assignedUploader: ''
    });

    useEffect(() => {
        const fetchPendingCampaigns = async () => {
            const q = query(collection(firestore, 'campaigns'), where('status', '==', 'Pending Approval'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
            setCampaigns(data);
            setLoading(false);
        };
        fetchPendingCampaigns();
    }, []);

    const handleApprove = async (campaignId) => {
        const campaignRef = doc(firestore, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            status: 'Active',
            approvedAt: new Date().toISOString()
        });
        // Remove from local state
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    };

    const handleReject = async (campaignId) => {
        const campaignRef = doc(firestore, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            status: 'Rejected'
        });
        // Remove from local state
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    };

    const handleEdit = (campaign) => {
        setEditingCampaign(campaign);
        setEditForm({
            name: campaign.name || '',
            description: campaign.description || '',
            budget: campaign.budget || '',
            expectedReels: campaign.expectedReels || '',
            deadline: campaign.deadline || '',
            assignedEditor: campaign.assignedEditor || '',
            assignedScriptWriter: campaign.assignedScriptWriter || '',
            assignedUploader: campaign.assignedUploader || ''
        });
    };

    const handleSaveEdit = async () => {
        const campaignRef = doc(firestore, 'campaigns', editingCampaign.id);
        await updateDoc(campaignRef, {
            name: editForm.name,
            description: editForm.description,
            budget: parseInt(editForm.budget),
            expectedReels: parseInt(editForm.expectedReels),
            deadline: editForm.deadline,
            assignedEditor: editForm.assignedEditor,
            assignedScriptWriter: editForm.assignedScriptWriter,
            assignedUploader: editForm.assignedUploader,
            updatedAt: new Date().toISOString()
        });

        // Update local state
        setCampaigns(prev => prev.map(c =>
            c.id === editingCampaign.id
                ? { ...c, ...editForm, budget: parseInt(editForm.budget), expectedReels: parseInt(editForm.expectedReels), assignedUploader: editForm.assignedUploader }
                : c
        ));

        setEditingCampaign(null);
    };

    const handleCancelEdit = () => {
        setEditingCampaign(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Campaign Approval</h1>
                <div className="text-sm text-slate-600">
                    {campaigns.length} pending campaigns
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <span className="text-4xl">{ICONS.checkCircle}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Approvals</h3>
                    <p className="text-slate-600">All campaigns have been reviewed.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                                    <p className="text-sm text-slate-600">{campaign.brandName}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(campaign)}
                                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <span className="mr-2">✏️</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleApprove(campaign.id)}
                                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <span className="mr-2">{ICONS.check}</span>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(campaign.id)}
                                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <span className="mr-2">{ICONS.x}</span>
                                        Reject
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Budget</label>
                                    <p className="text-lg font-semibold text-green-600">₹{campaign.budget?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Expected Reels</label>
                                    <p className="text-lg font-semibold text-slate-900">{campaign.expectedReels}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Deadline</label>
                                    <p className="text-lg font-semibold text-slate-900">{new Date(campaign.deadline).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{campaign.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Assigned Editor</label>
                                    <p className="text-slate-900">{campaign.assignedEditor || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Assigned Script Writer</label>
                                    <p className="text-slate-900">{campaign.assignedScriptWriter || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Assigned Uploader</label>
                                    <p className="text-slate-900">{campaign.assignedUploader || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Call Count</label>
                                    <p className="text-slate-900">{campaign.callCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900">Edit Campaign</h2>
                                <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                                    {ICONS.x}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter campaign name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Budget (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.budget}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter budget amount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Expected Reels *
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.expectedReels}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, expectedReels: e.target.value }))}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Number of reels needed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Deadline *
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.deadline}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Assigned Editor
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.assignedEditor}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, assignedEditor: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Assign editor"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Assigned Script Writer
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.assignedScriptWriter}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, assignedScriptWriter: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Assign script writer"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Assigned Uploader
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.assignedUploader}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, assignedUploader: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Assign uploader"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Campaign Description *
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Describe the campaign objectives and requirements"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignApprovalView;
