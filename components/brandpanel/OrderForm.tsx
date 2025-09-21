import React, { useState } from 'react';
import { ICONS } from '../../constants';

const OrderForm = ({ campaign, onCreateOrder, onCancel }) => {
    const [formData, setFormData] = useState({
        type: '',
        quantity: '',
        budget: '',
        deadline: '',
        notes: ''
    });
    const [errors, setErrors] = useState({
        type: '',
        quantity: '',
        budget: '',
        deadline: ''
    });

    const orderTypes = [
        'Reels Creation',
        'Video Editing',
        'Thumbnail Design',
        'Script Writing',
        'Content Strategy',
        'Social Media Management'
    ];

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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.type) newErrors.type = 'Order type is required';
        if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
        if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = 'Valid budget is required';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        const deadlineDate = new Date(formData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate <= today) newErrors.deadline = 'Deadline must be in the future';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const newOrder = {
            id: `O${Date.now()}`,
            campaignId: campaign.id,
            type: formData.type,
            quantity: parseInt(formData.quantity),
            budget: parseFloat(formData.budget),
            deadline: formData.deadline,
            status: 'Pending',
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        onCreateOrder(newOrder);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Create New Order
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
                    <p className="text-slate-600 mt-2">Campaign: {campaign.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Order Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Order Type *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="">Select order type</option>
                            {orderTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter quantity"
                            min="1"
                        />
                        {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Budget (₹) *
                        </label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter budget amount"
                            min="0"
                            step="0.01"
                        />
                        {errors.budget && <p className="text-red-600 text-sm mt-1">{errors.budget}</p>}
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Deadline *
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errors.deadline && <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Any specific requirements or instructions..."
                        />
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
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;
