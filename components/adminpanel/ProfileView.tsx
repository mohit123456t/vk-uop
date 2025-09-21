import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore as db, auth } from '../../services/firebase';
import { ICONS } from '../../constants';

const ProfileView = () => {
    const [profile, setProfile] = useState({
        id: '',
        name: '',
        email: '',
        profilePicture: '',
        role: 'Super Admin',
        joinDate: '',
        phone: '',
        department: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const profileDoc = await getDoc(doc(db, 'adminProfiles', user.uid));
                if (profileDoc.exists()) {
                    setProfile({ ...profileDoc.data(), id: user.uid });
                } else {
                    // Create default profile
                    const defaultProfile = {
                        id: user.uid,
                        name: user.displayName || 'Super Admin',
                        email: user.email || '',
                        profilePicture: user.photoURL || '',
                        role: 'Super Admin',
                        joinDate: new Date().toISOString().split('T')[0],
                        phone: '',
                        department: 'Administration'
                    };
                    await updateDoc(doc(db, 'adminProfiles', user.uid), defaultProfile);
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
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(db, 'adminProfiles', user.uid), profile);
                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Admin Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture & Basic Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-1/2 transform translate-x-16 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                                    <span className="text-sm">{ICONS.camera}</span>
                                </button>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{profile.name}</h2>
                        <p className="text-slate-600 mb-4">{profile.role}</p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                <span className="text-blue-600 mr-3">{ICONS.mail}</span>
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <span className="text-green-600 mr-3">{ICONS.phone}</span>
                                <div>
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <p className="text-sm font-medium text-slate-900">{profile.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                                <span className="text-orange-600 mr-3">{ICONS.calendar}</span>
                                <div>
                                    <p className="text-xs text-slate-500">Join Date</p>
                                    <p className="text-sm font-medium text-slate-900">{profile.joinDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.department}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Profile ID</label>
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-500 font-mono text-sm">{profile.id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.role}</p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Save Changes
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
