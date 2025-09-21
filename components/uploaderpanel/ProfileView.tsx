
import React, { useState } from 'react';
import { ICONS } from '../../constants';

const ProfileView = () => {
    const [profile, setProfile] = useState({
        name: 'Anjali Sharma',
        email: 'anjali.sharma@example.com',
        phone: '+91 98765 43210',
        bio: 'Professional content creator specializing in beauty and lifestyle content. 3+ years of experience creating engaging reels and videos.',
        location: 'Mumbai, India',
        website: 'https://anjalibeauty.com',
        twoFactorEnabled: true,
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    });

    const [niches, setNiches] = useState([
        'Beauty', 'Fashion', 'Lifestyle', 'Makeup Tutorials', 'Product Reviews'
    ]);

    const [newNiche, setNewNiche] = useState('');

    const availableNiches = [
        'Beauty', 'Fashion', 'Lifestyle', 'Makeup Tutorials', 'Product Reviews',
        'Comedy', 'Tech', 'Gaming', 'Travel', 'Food', 'Fitness', 'Music',
        'Education', 'Entertainment', 'Business', 'Art', 'Photography'
    ];

    const handleSave = () => {
        // Handle save logic
        alert('Profile updated successfully!');
    };

    const handleAddNiche = () => {
        if (newNiche.trim() && !niches.includes(newNiche.trim())) {
            setNiches([...niches, newNiche.trim()]);
            setNewNiche('');
        }
    };

    const handleRemoveNiche = (nicheToRemove) => {
        setNiches(niches.filter(niche => niche !== nicheToRemove));
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
                <p className="text-slate-600">Manage your personal information and preferences.</p>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="flex items-center font-bold text-lg text-slate-800 mb-4">
                    <ICONS.users className="w-5 h-5 mr-2" />
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                        <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({...profile, location: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                    <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Account Security */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="flex items-center font-bold text-lg text-slate-800 mb-4">
                    <ICONS.lockClosed className="w-5 h-5 mr-2" />
                    Account Security
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                        <div>
                            <label htmlFor="2fa" className="font-medium text-sm">Two-Factor Authentication</label>
                            <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                        </div>
                        <input
                            type="checkbox"
                            id="2fa"
                            checked={profile.twoFactorEnabled}
                            onChange={(e) => setProfile({...profile, twoFactorEnabled: e.target.checked})}
                            className="toggle-checkbox"
                        />
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                        <div>
                            <label htmlFor="email-notif" className="font-medium text-sm">Email Notifications</label>
                            <p className="text-xs text-slate-500">Receive updates via email</p>
                        </div>
                        <input
                            type="checkbox"
                            id="email-notif"
                            checked={profile.notifications.email}
                            onChange={(e) => setProfile({...profile, notifications: {...profile.notifications, email: e.target.checked}})}
                            className="toggle-checkbox"
                        />
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                        <div>
                            <label htmlFor="push-notif" className="font-medium text-sm">Push Notifications</label>
                            <p className="text-xs text-slate-500">Receive push notifications in browser</p>
                        </div>
                        <input
                            type="checkbox"
                            id="push-notif"
                            checked={profile.notifications.push}
                            onChange={(e) => setProfile({...profile, notifications: {...profile.notifications, push: e.target.checked}})}
                            className="toggle-checkbox"
                        />
                    </div>
                </div>
            </div>

            {/* Content Niches */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="flex items-center font-bold text-lg text-slate-800 mb-4">
                    <ICONS.sparkles className="w-5 h-5 mr-2" />
                    Content Niches
                </h3>
                <p className="text-sm text-slate-500 mb-4">Select the content categories you specialize in</p>

                {/* Selected Niches */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Your Selected Niches:</h4>
                    <div className="flex flex-wrap gap-2">
                        {niches.map((niche, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                {niche}
                                <button
                                    onClick={() => handleRemoveNiche(niche)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Add New Niche */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newNiche}
                        onChange={(e) => setNewNiche(e.target.value)}
                        placeholder="Add a new niche..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNiche()}
                    />
                    <button
                        onClick={handleAddNiche}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add
                    </button>
                </div>

                {/* Available Niches */}
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Available Niches:</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableNiches.filter(niche => !niches.includes(niche)).map((niche, index) => (
                            <button
                                key={index}
                                onClick={() => setNiches([...niches, niche])}
                                className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                + {niche}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfileView;
