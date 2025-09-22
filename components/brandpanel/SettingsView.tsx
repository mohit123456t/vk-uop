import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

const SettingsView = ({ userProfile, onUpdateProfile }) => {
    const [profile, setProfile] = useState(userProfile);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await onUpdateProfile(profile);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-2xl">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Profile Details</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="brandId" className="block text-sm font-medium text-slate-600 mb-1">
                                Brand ID
                            </label>
                            <input
                                id="brandId"
                                name="brandId"
                                type="text"
                                value={profile.brandId || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={profile.email || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={profile.name || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-slate-600 mb-1">
                                Owner Name
                            </label>
                            <input
                                id="ownerName"
                                name="ownerName"
                                type="text"
                                value={profile.ownerName || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-slate-600 mb-1">
                                Brand Name
                            </label>
                            <input
                                id="brandName"
                                name="brandName"
                                type="text"
                                value={profile.brandName || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-600 mb-1">
                                Mobile Number
                            </label>
                            <input
                                id="mobileNumber"
                                name="mobileNumber"
                                type="tel"
                                value={profile.mobileNumber || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={profile.address || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                         <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                    {message && <p className="text-green-600 text-sm mt-2 text-right">{message}</p>}
                    {error && <p className="text-red-600 text-sm mt-2 text-right">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default SettingsView;
