import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const ProfileView = ({ userProfile }) => {
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        phone: userProfile?.mobileNumber || '',
        address: userProfile?.address || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage('');

        try {
            if (userProfile?.uid) {
                await updateDoc(doc(db, 'users', userProfile.uid), {
                    name: formData.name,
                    email: formData.email,
                    mobileNumber: formData.phone,
                    address: formData.address
                });
                setSaveMessage('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveMessage('Error updating profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
                <p className="text-slate-600">Manage your portfolio, skills, and account security.</p>
            </div>

            {saveMessage && (
                <div className={`p-4 rounded-lg ${saveMessage.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {saveMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <span className="mr-2">{ICONS.userCircle}</span>
                        Name
                    </h3>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter your name"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <span className="mr-2">{ICONS.mail}</span>
                        Email
                    </h3>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <span className="mr-2">{ICONS.phone}</span>
                        Phone
                    </h3>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter your phone number"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 md:col-span-2 lg:col-span-3">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <span className="mr-2">{ICONS.layout}</span>
                        Address
                    </h3>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter your address"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Account Info</h3>
                    <div className="space-y-2">
                        <div className="text-sm text-slate-600">
                            <span className="font-medium">Role:</span> Script Writer
                        </div>
                        <div className="text-sm text-slate-600">
                            <span className="font-medium">ID:</span> {userProfile?.uid?.substring(0, 8) || 'N/A'}
                        </div>
                        <div className="text-sm text-slate-600">
                            <span className="font-medium">Joined:</span> {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex items-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">{ICONS.check}</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileView;
