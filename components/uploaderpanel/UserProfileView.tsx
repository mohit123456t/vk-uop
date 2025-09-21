import React from 'react';
import { ICONS } from '../../constants';

const UserProfileView = () => {
    // Mock user data - in real app this would come from props or context
    const userProfile = {
        name: 'Anjali Sharma',
        email: 'anjali.sharma@example.com',
        joinDate: 'January 15, 2024',
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
        role: 'Content Creator',
        totalUploads: 245,
        totalViews: '2.5M',
        accountStatus: 'Active'
    };

    const stats = [
        {
            label: 'Total Uploads',
            value: userProfile.totalUploads,
            icon: ICONS.video,
            color: 'text-blue-600'
        },
        {
            label: 'Total Views',
            value: userProfile.totalViews,
            icon: ICONS.eye,
            color: 'text-green-600'
        },
        {
            label: 'Account Status',
            value: userProfile.accountStatus,
            icon: ICONS.checkCircle,
            color: 'text-green-600'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">My Profile</h1>
                <p className="text-slate-600">View your account information and statistics</p>
            </div>

            {/* Profile Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900">{userProfile.name}</h2>
                        <p className="text-slate-600">{userProfile.role}</p>
                        <div className="flex items-center mt-2 text-sm text-slate-500">
                            📅 Joined {userProfile.joinDate}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="flex items-center font-bold text-lg text-slate-800 mb-4">
                    <ICONS.userCircle className="w-5 h-5 mr-2" />
                    Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{userProfile.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{userProfile.email}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{userProfile.phone}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{userProfile.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 text-center">
                        <div className={`text-3xl mb-2 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-sm text-slate-600">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Account Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Account Overview</h3>
                        <p className="text-blue-100">Your content creation journey summary</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{userProfile.totalUploads}</div>
                        <div className="text-blue-100">Total Reels</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-sm font-medium text-slate-700">View Analytics</div>
                    </button>
                    <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center">
                        <div className="text-2xl mb-2">⚙️</div>
                        <div className="text-sm font-medium text-slate-700">Settings</div>
                    </button>
                    <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="text-sm font-medium text-slate-700">Earnings</div>
                    </button>
                    <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="text-sm font-medium text-slate-700">Assigned Tasks</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
