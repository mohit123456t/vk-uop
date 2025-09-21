import React, { useState } from 'react';
import { ICONS } from '../../constants';

const NewCampaignForm = ({ onCreateCampaign, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetAudience: '',
        budget: '',
        startDate: '',
        endDate: ''
    });
    const [campaignImage, setCampaignImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({
        name: '',
        description: '',
        image: '',
        startDate: '',
        endDate: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCampaignImage(file);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!campaignImage) newErrors.image = 'Campaign image is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = 'End date must be after start date';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setUploading(true);
        try {
            // Simulate image upload
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newCampaign = {
                id: `C${Date.now()}`,
                name: formData.name,
                description: formData.description,
                status: 'Active',
                reelsCount: 0,
                views: 0,
                targetAudience: formData.targetAudience,
                budget: formData.budget,
                startDate: formData.startDate,
                endDate: formData.endDate,
                imageUrl: URL.createObjectURL(campaignImage),
                reels: []
            };

            onCreateCampaign(newCampaign);
        } catch (error) {
            console.error('Error creating campaign:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Create New Campaign
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Campaign Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Campaign Image *
                        </label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            {campaignImage ? (
                                <div className="space-y-4">
                                    <img
                                        src={URL.createObjectURL(campaignImage)}
                                        alt="Campaign preview"
                                        className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCampaignImage(null)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-4xl text-slate-400 mb-2">{ICONS.photo}</div>
                                    <p className="text-slate-600 mb-2">Click to upload campaign image</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="campaign-image"
                                    />
                                    <label
                                        htmlFor="campaign-image"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block"
                                    >
                                        Choose Image
                                    </label>
                                </div>
                            )}
                        </div>
                        {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                    </div>

                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Campaign Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter campaign name"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Describe your campaign goals, target audience, and key messages"
                        />
                        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Target Audience
                        </label>
                        <input
                            type="text"
                            name="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g., Young adults 18-35, Families, Professionals"
                        />
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Budget (₹)
                        </label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter campaign budget"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                End Date *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Creating Campaign...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCampaignForm;
