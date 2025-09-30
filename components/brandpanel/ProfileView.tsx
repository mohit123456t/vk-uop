import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';

const EditableField = ({ label, name, value, onChange, type = "text", editable = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            readOnly={!editable}
            className={`w-full px-3 py-2 bg-white/60 border border-slate-300/70 rounded-lg shadow-sm transition-all ${editable ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-slate-100/70 cursor-not-allowed'}`}
        />
    </div>
);

const ProfileView = ({ user, profile: initialProfile, onUpdateProfile }) => {
    const [profile, setProfile] = useState(initialProfile || {});
    const [securityMsg, setSecurityMsg] = useState('');
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (securityMsg) {
            const timer = setTimeout(() => setSecurityMsg(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [securityMsg]);

    useEffect(() => {
        if (user && initialProfile) {
            let brandIdToSet = initialProfile.brandId;
            let needsUpdate = false;

            // If brandId doesn't exist, create it.
            if (!brandIdToSet) {
                brandIdToSet = `BRND${user.uid.slice(-4).toUpperCase()}`;
                needsUpdate = true;
            }

            const mergedProfile = {
                name: '',
                brandName: '',
                ownerName: '',
                phone: '',
                address: '',
                lastUpdated: '',
                ...initialProfile,
                brandId: brandIdToSet, // Set the new or existing brandId
                email: user.email || initialProfile.email,
            };
            setProfile(mergedProfile);

            // If we created a new ID, save it back to the database.
            if (needsUpdate) {
                onUpdateProfile({ ...mergedProfile, brandId: brandIdToSet });
            }
        }
    }, [user, initialProfile, onUpdateProfile]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onUpdateProfile(profile);
        setEditMode(false);
        setSecurityMsg({ type: 'success', text: 'Profile updated successfully!' });
    };

    const handleCancel = () => {
        setProfile(initialProfile);
        setEditMode(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Brand Profile</h1>
                {!editMode ? (
                    <button 
                        onClick={() => setEditMode(true)}
                        className="flex items-center bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-900 transition-colors shadow-sm"
                    >
                        {ICONS.edit} <span className="ml-2">Edit Profile</span>
                    </button>
                ) : (
                    <div className="flex items-center space-x-3">
                        <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">{ICONS.save} <span className="ml-2">Save</span></button>
                        <button onClick={handleCancel} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-300 transition-colors">Cancel</button>
                    </div>
                )}
            </div>

            {securityMsg && (
                <div className={`p-4 rounded-lg text-sm ${securityMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {securityMsg.text}
                </div>
            )}

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300/70 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h2 className="text-xl font-semibold text-slate-800 col-span-full border-b border-slate-300/70 pb-3">Brand Information</h2>
                    <EditableField label="Brand Name" name="brandName" value={profile.brandName} onChange={handleChange} editable={editMode} />
                    <EditableField label="Brand ID" name="brandId" value={profile.brandId} onChange={handleChange} editable={false} />
                    <EditableField label="Contact Email" name="email" value={profile.email} onChange={handleChange} editable={false} />
                    <EditableField label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} editable={editMode} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-6">
                     <h2 className="text-xl font-semibold text-slate-800 col-span-full border-b border-slate-300/70 pb-3">Owner Details</h2>
                    <EditableField label="Owner Name" name="ownerName" value={profile.ownerName} onChange={handleChange} editable={editMode} />
                    <EditableField label="Company Address" name="address" value={profile.address} onChange={handleChange} editable={editMode} />
                </div>
            </div>

            <div className="text-sm text-slate-500 text-center">
                Last updated: {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleString() : 'Never'}
            </div>
        </div>
    );
};

export default ProfileView;
