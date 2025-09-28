import React, { useState } from 'react';

// This is the definitive fix. The form no longer creates its own faulty ID.
// It now passes a clean data object to the parent, which then gets a real ID from Firebase.
const NewCampaignForm = ({ onCreateCampaign, onCancel, brandId }) => {
    const [campaignData, setCampaignData] = useState({
        name: '',
        description: '',
        budget: '',
        expectedReels: '',
        deadline: '',
        objective: 'Brand Awareness', // Default objective
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!campaignData.name || !campaignData.budget || !campaignData.deadline) {
            setError('Campaign Name, Budget, and Deadline are required.');
            return;
        }

        // The form now sends only the raw data. The parent (`BrandPanel.tsx`)
        // will add brandId, status, and let Firebase generate the true ID.
        const newCampaign = {
            ...campaignData,
            budget: parseFloat(campaignData.budget) || 0,
            expectedReels: parseInt(campaignData.expectedReels, 10) || 0,
        };
        
        onCreateCampaign(newCampaign);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-900">Create New Campaign</h2>
                    </div>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                        
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-2">Campaign Name</label>
                            <input type="text" name="name" id="name" value={campaignData.name} onChange={handleChange} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Summer Fashion Launch" />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-2">Description</label>
                            <textarea name="description" id="description" value={campaignData.description} onChange={handleChange} rows={4} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Briefly describe the campaign goals and content requirements."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="budget" className="block text-sm font-semibold text-slate-800 mb-2">Total Budget (INR)</label>
                                <input type="number" name="budget" id="budget" value={campaignData.budget} onChange={handleChange} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 50000" />
                            </div>
                             <div>
                                <label htmlFor="expectedReels" className="block text-sm font-semibold text-slate-800 mb-2">Number of Reels</label>
                                <input type="number" name="expectedReels" id="expectedReels" value={campaignData.expectedReels} onChange={handleChange} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 10" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-semibold text-slate-800 mb-2">Deadline</label>
                                <input type="date" name="deadline" id="deadline" value={campaignData.deadline} onChange={handleChange} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="objective" className="block text-sm font-semibold text-slate-800 mb-2">Primary Objective</label>
                                <select name="objective" id="objective" value={campaignData.objective} onChange={handleChange} className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option>Brand Awareness</option>
                                    <option>Lead Generation</option>
                                    <option>Sales & Conversions</option>
                                    <option>Engagement</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-4 rounded-b-xl">
                        <button type="button" onClick={onCancel} className="px-8 py-3 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all">Create Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCampaignForm;
