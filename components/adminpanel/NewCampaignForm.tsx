import React, { useState } from 'react';
import { ICONS } from '../../constants';
import { collection, addDoc } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';

const NewCampaignForm = ({ onCreateCampaign, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        brandName: '',
        description: '',
        budget: '',
        expectedReels: '',
        deadline: '',
        teamLead: '',
        priority: 'Medium',
        category: 'Product Promotion',
        assignedUploader: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newCampaign = {
                name: formData.name,
                brandName: formData.brandName,
                description: formData.description,
                budget: parseFloat(formData.budget),
                expectedReels: parseInt(formData.expectedReels),
                deadline: formData.deadline,
                teamLead: formData.teamLead,
                priority: formData.priority,
                category: formData.category,
                assignedUploader: formData.assignedUploader,
                status: 'Pending Approval',
                progress: 0,
                reels: 0,
                views: 0,
                roi: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
            onCreateCampaign({ id: docRef.id, ...newCampaign });
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Error creating campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Create New Campaign</h2>
                        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                            {ICONS.x}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Campaign Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter campaign name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Campaign Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Describe the campaign objectives and requirements"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Budget (₹) *
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
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
                                name="expectedReels"
                                value={formData.expectedReels}
                                onChange={handleChange}
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
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Team Lead
                            </label>
                            <input
                                type="text"
                                name="teamLead"
                                value={formData.teamLead}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Assign team lead"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Assigned Uploader
                            </label>
                            <input
                                type="text"
                                name="assignedUploader"
                                value={formData.assignedUploader}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Assign uploader"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="Product Promotion">Product Promotion</option>
                                <option value="Brand Awareness">Brand Awareness</option>
                                <option value="Seasonal Campaign">Seasonal Campaign</option>
                                <option value="Event Promotion">Event Promotion</option>
                                <option value="Service Promotion">Service Promotion</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCampaignForm;
