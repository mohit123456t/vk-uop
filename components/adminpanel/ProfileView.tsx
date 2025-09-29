import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

// Format UID for admin panels (ADM + 3 digits)
const formatAdminUID = (uid) => {
    if (uid && uid.length > 3) {
        const last3 = uid.slice(-3);
        const num = parseInt(last3, 16) % 1000;
        return `ADM${num.toString().padStart(3, '0')}`;
    }
    return 'ADM001';
};

const ProfileView = () => {
    const [profile, setProfile] = useState({
        id: '',
        name: '',
        email: '',
        profilePicture: '',
        role: 'Super Admin',
        joinDate: '',
        phone: '',
        department: 'Administration'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const userProfile = authService.getCurrentUserProfile();

            if (userProfile) {
                setProfile({
                    id: userProfile.uid,
                    name: userProfile.name || 'Super Admin',
                    email: userProfile.email || '',
                    profilePicture: currentUser?.photoURL || '',
                    role: userProfile.role || 'Super Admin',
                    joinDate: userProfile.createdAt 
                        ? new Date(userProfile.createdAt).toISOString().split('T')[0] 
                        : new Date().toISOString().split('T')[0],
                    phone: userProfile.mobileNumber || '',
                    department: 'Administration'
                });
            } else if (currentUser) {
                const profileDoc = await getDoc(doc(db, 'adminProfiles', currentUser.uid));
                if (profileDoc.exists()) {
                    setProfile({ ...profileDoc.data(), id: currentUser.uid });
                } else {
                    const defaultProfile = {
                        id: currentUser.uid,
                        name: currentUser.displayName || 'Super Admin',
                        email: currentUser.email || '',
                        profilePicture: currentUser.photoURL || '',
                        role: 'Super Admin',
                        joinDate: new Date().toISOString().split('T')[0],
                        phone: '',
                        department: 'Administration'
                    };
                    await updateDoc(doc(db, 'adminProfiles', currentUser.uid), defaultProfile);
                    setProfile(defaultProfile);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) return;

            // Update in auth service (main users collection)
            await authService.updateUserProfile(currentUser.uid, {
                name: profile.name,
                email: profile.email,
                mobileNumber: profile.phone
            });

            // Update backup adminProfiles collection
            await updateDoc(doc(db, 'adminProfiles', currentUser.uid), {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                department: profile.department
            });

            setIsEditing(false);
            alert('✅ Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('❌ Failed to update profile: ' + error.message);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Reset to original on cancel? Optional enhancement.
            fetchProfile();
        }
        setIsEditing(!isEditing);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    My Profile
                </h1>
                <button
                    onClick={toggleEdit}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md ${
                        isEditing
                            ? 'bg-slate-500 hover:bg-slate-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                        <div className="text-center mb-6">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
                                    {profile.profilePicture ? (
                                        <img
                                            src={profile.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                {isEditing && (
                                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-700 transition">
                                        📷
                                    </button>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mt-4">{profile.name}</h2>
                            <p className="text-blue-600 font-medium">{profile.role}</p>
                            <p className="text-slate-500 text-sm mt-1">ID: {formatAdminUID(profile.id)}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                                <span className="text-blue-600 mr-3">📧</span>
                                <div className="text-left">
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="font-medium text-slate-800">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-green-50 rounded-xl">
                                <span className="text-green-600 mr-3">📱</span>
                                <div className="text-left">
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <p className="font-medium text-slate-800">{profile.phone || '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-orange-50 rounded-xl">
                                <span className="text-orange-600 mr-3">📅</span>
                                <div className="text-left">
                                    <p className="text-xs text-slate-500">Member Since</p>
                                    <p className="font-medium text-slate-800">{profile.joinDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                                        {profile.name}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter your email"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                                        {profile.email}
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                                        {profile.phone || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter department"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                                        {profile.department}
                                    </div>
                                )}
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                                    {profile.role}
                                </div>
                            </div>

                            {/* Admin ID (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Admin ID</label>
                                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-500 font-mono text-sm">
                                    {formatAdminUID(profile.id)}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow transition-transform transform hover:scale-[1.02]"
                                >
                                    💾 Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;