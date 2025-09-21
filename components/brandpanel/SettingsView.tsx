import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

const SettingsView = ({ user }) => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        brandName: '',
        address: '',
        mobileNumber: '',
        ownerName: '',
        lastUpdated: '',
    });
    const [newPassword, setNewPassword] = useState('');
    const [securityMsg, setSecurityMsg] = useState('');
    const handleChangePassword = async () => {
        setSecurityMsg('');
        if (!newPassword || newPassword.length < 6) {
            setSecurityMsg('Password must be at least 6 characters.');
            return;
        }
        try {
            if (user) {
                await user.updatePassword(newPassword);
                setSecurityMsg('Password changed successfully!');
                setNewPassword('');
            }
        } catch (err) {
            setSecurityMsg('Error changing password: ' + err.message);
        }
    };
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user && user.uid) {
                const profileDoc = doc(firestore, `users/${user.uid}/profile/main`);
                const profileSnap = await getDoc(profileDoc);
                if (profileSnap.exists()) {
                    setProfile({ ...profileSnap.data(), lastUpdated: profileSnap.data().lastUpdated || '' });
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        if (user && user.uid) {
            const profileDoc = doc(firestore, `users/${user.uid}/profile/main`);
            const updatedProfile = { ...profile, lastUpdated: new Date().toISOString() };
            await setDoc(profileDoc, updatedProfile);
            setProfile(updatedProfile);
            setMessage('Profile updated successfully!');
        }
        setLoading(false);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-lg">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Profile</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input name="name" value={profile.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input name="email" value={profile.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Brand Name</label>
                        <input name="brandName" value={profile.brandName} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input name="address" value={profile.address} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <input name="mobileNumber" value={profile.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Owner Name</label>
                        <input name="ownerName" value={profile.ownerName} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Updated</label>
                        <input name="lastUpdated" value={profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleString() : ''} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
                    </div>
                    {message && <p className="text-green-600 text-sm">{message}</p>}
                    <button type="button" onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 max-w-lg mt-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Security Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Change Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleChangePassword}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Change Password
                    </button>
                    {securityMsg && <p className="text-sm mt-2 text-red-600">{securityMsg}</p>}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
