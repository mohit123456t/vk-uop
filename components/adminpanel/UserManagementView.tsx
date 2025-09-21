
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import BrandControlView from './BrandControlView';

const AddUserForm = ({ onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        brandName: '',
        role: 'brand' // default role
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'users'), formData);
            onUserAdded();
            onClose();
        } catch (error) {
            console.error('Error adding user:', error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                    <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="flex space-x-2">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                </div>
            </form>
        </div>
    );
};

const BrandDetailView = ({ brand, onBack }) => {
    // For now, show basic brand details. Can expand later with campaigns, payments, etc.
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">← Back to Brands</button>
            <h2 className="text-2xl font-bold mb-4">{brand.name} Details</h2>
            <div className="grid grid-cols-2 gap-4">
                <div><strong>Status:</strong> {brand.status}</div>
                <div><strong>Active Campaigns:</strong> {brand.campaigns}</div>
                <div><strong>Total Spend:</strong> {brand.totalSpend}</div>
                <div><strong>ID:</strong> {brand.id}</div>
            </div>
            {/* Add more details like campaigns, payments, etc. later */}
        </div>
    );
};

const UserManagementView = () => {
    const [view, setView] = useState('list'); // 'list', 'addUser', 'brandDetail'
    const [selectedBrand, setSelectedBrand] = useState(null);

    const handleAddUser = () => setView('addUser');
    const handleCloseForm = () => setView('list');
    const handleUserAdded = () => {
        // Refresh brands or users if needed
        setView('list');
    };
    const handleViewBrand = (brand) => {
        setSelectedBrand(brand);
        setView('brandDetail');
    };
    const handleBackToList = () => setView('list');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                {view === 'list' && (
                    <button onClick={handleAddUser} className="text-sm font-medium p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700">
                        Add New User
                    </button>
                )}
            </div>

            <div>
                {view === 'addUser' && <AddUserForm onClose={handleCloseForm} onUserAdded={handleUserAdded} />}
                {view === 'brandDetail' && <BrandDetailView brand={selectedBrand} onBack={handleBackToList} />}
                {view === 'list' && <BrandControlView onViewBrand={handleViewBrand} />}
            </div>
        </div>
    );
};

export default UserManagementView;
