import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ProfileView = ({ user, profile: initialProfile, onUpdateProfile }) => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        brandName: '',
        brandId: '',
        ownerName: '',
        phone: '',
        address: '',
        lastUpdated: '',
    });
    const [newPassword, setNewPassword] = useState('');
    const [securityMsg, setSecurityMsg] = useState('');
    const [securityMsgType, setSecurityMsgType] = useState('error'); // 'success' | 'error'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success'); // 'success' | 'error'

    // Auto-hide messages after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (securityMsg) {
            const timer = setTimeout(() => setSecurityMsg(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [securityMsg]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) return;
            try {
                setLoading(true);

                const firestoreDoc = doc(db, `users/${user.uid}/profile/main`);
                const firestoreSnap = await getDoc(firestoreDoc);
                const firestoreData = firestoreSnap.exists() ? firestoreSnap.data() : {};

                // Merge initialProfile with Firestore data
                const mergedProfile = {
                    ...firestoreData,
                    ...initialProfile,
                };

                // Ensure essential fields are set
                const profileWithBrandId = {
                    name: mergedProfile.name || '',
                    email: mergedProfile.email || user?.email || '',
                    brandName: mergedProfile.brandName || '',
                    brandId: mergedProfile.brandId || firestoreData.brandId || Math.floor(1000 + Math.random() * 9000).toString(),
                    ownerName: mergedProfile.ownerName || '',
                    phone: mergedProfile.phone || '',
                    address: mergedProfile.address || '',
                    lastUpdated: mergedProfile.lastUpdated || firestoreData.lastUpdated || '',
                };

                console.log('Using merged profile data:', profileWithBrandId);
                setProfile(profileWithBrandId);
                setLoading(false);
                return;
            } catch (err) {
                setMessage('Failed to load profile.');
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, initialProfile]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        // Validate brand ID
        if (profile.brandId && (profile.brandId.length !== 4 || !/^\d{4}$/.test(profile.brandId))) {
            setMessage('❌ Brand ID must be exactly 4 digits');
            setMessageType('error');
            setLoading(false);
            return;
        }

        try {
            if (!user?.uid) throw new Error("User not authenticated");
            const updatedProfile = { ...profile, lastUpdated: new Date().toISOString() };
            if (onUpdateProfile) {
                await onUpdateProfile(updatedProfile);
            }
            setMessage('✅ Profile updated successfully!');
            setMessageType('success');
        } catch (err) {
            setMessage(`❌ Error: ${err.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setSecurityMsg('');
        if (!newPassword || newPassword.length < 6) {
            setSecurityMsg('⚠️ Password must be at least 6 characters.');
            setSecurityMsgType('error');
            return;
        }
        try {
            if (!user) throw new Error("No user found");
            await user.updatePassword(newPassword);
            setSecurityMsg('✅ Password changed successfully!');
            setSecurityMsgType('success');
            setNewPassword('');
        } catch (err) {
            setSecurityMsg(`❌ Error: ${err.message}`);
            setSecurityMsgType('error');
        }
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6">
            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Profile Settings
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Manage your profile and security preferences</p>

                {/* Welcome Message for New Users */}
                {profile.name && profile.email && profile.brandId && (
                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-green-400">✅</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800 font-medium">
                                    Welcome to ReelPay!
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Your profile is complete. Your Brand ID is: <span className="font-mono font-bold">{profile.brandId}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Section */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-slate-200/60 mb-8 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl ml-3 text-slate-800">👤 Profile Settings</h3>
                    </div>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-10 bg-slate-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form className="space-y-5">
                            {[
                                { label: "Email Address", name: "email", type: "email", disabled: true },
                                { label: "Full Name", name: "name", type: "text" },
                                { label: "Brand Name", name: "brandName", type: "text", disabled: true },
                                { label: "Brand ID (4 digits)", name: "brandId", type: "text", placeholder: "Auto-generated", disabled: true },
                                { label: "Owner Name", name: "ownerName", type: "text" },
                                { label: "Mobile Number", name: "phone", type: "tel" },
                                { label: "Address", name: "address", type: "textarea" },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={profile[field.name] || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
                                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={profile[field.name] || ''}
                                            onChange={handleChange}
                                            disabled={field.disabled}
                                            className={`w-full px-4 py-3 border rounded-xl outline-none transition placeholder:text-slate-400 ${
                                                field.disabled
                                                    ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed'
                                                    : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Last Updated
                                </label>
                                <input
                                    name="lastUpdated"
                                    value={profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleString() : 'Never'}
                                    disabled
                                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            {message && (
                                <div className={`p-3 rounded-xl text-sm font-medium ${
                                    messageType === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transform transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : '💾 Save Profile'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Security Section */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-slate-200/60 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl ml-3 text-slate-800">🔒 Security Settings</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Change Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleChangePassword}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 active:scale-95 transform transition-all shadow-lg hover:shadow-xl"
                        >
                            🔄 Change Password
                        </button>

                        {securityMsg && (
                            <div className={`p-3 rounded-xl text-sm font-medium ${
                                securityMsgType === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {securityMsg}
                            </div>
                        )}

                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
                            <p className="text-sm text-yellow-800 font-medium">
                                ⚠️ For security, avoid using simple passwords. Use a mix of letters, numbers, and symbols.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
