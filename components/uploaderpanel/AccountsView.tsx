import React, { useState } from 'react';
import { ICONS } from '../../constants';

const AccountCard = ({ platform, username, followers, isConnected, onConnect, onDisconnect }) => {
    const platformIcons = {
        instagram: '📷',
        facebook: '📘',
        youtube: '📺',
        twitter: '🐦'
    };

    const platformColors = {
        instagram: 'bg-gradient-to-r from-purple-500 to-pink-600',
        facebook: 'bg-gradient-to-r from-blue-600 to-blue-800',
        youtube: 'bg-gradient-to-r from-red-500 to-red-700',
        twitter: 'bg-gradient-to-r from-blue-400 to-blue-600'
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className={`w-12 h-12 ${platformColors[platform]} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                        {platformIcons[platform]}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 capitalize">{platform}</h3>
                        <p className="text-sm text-slate-600">@{username}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {isConnected && followers && (
                <div className="mb-4">
                    <p className="text-sm text-slate-600">Followers: <span className="font-semibold text-slate-800">{followers.toLocaleString()}</span></p>
                </div>
            )}

            <div className="flex gap-3">
                {!isConnected ? (
                    <button
                        onClick={() => onConnect(platform)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Connect Account
                    </button>
                ) : (
                    <button
                        onClick={() => onDisconnect(platform)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        Disconnect
                    </button>
                )}
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Settings
                </button>
            </div>
        </div>
    );
};

const AccountsView = () => {
    const [accounts, setAccounts] = useState([
        {
            platform: 'instagram',
            username: 'anjali_beauty',
            followers: 125000,
            isConnected: true
        },
        {
            platform: 'instagram',
            username: 'anjali_makeup',
            followers: 89000,
            isConnected: true
        },
        {
            platform: 'facebook',
            username: 'anjali.beauty.official',
            followers: 45000,
            isConnected: false
        },
        {
            platform: 'youtube',
            username: 'Anjali Beauty Tips',
            followers: 250000,
            isConnected: true
        },
        {
            platform: 'twitter',
            username: 'anjali_beauty',
            followers: 15000,
            isConnected: false
        }
    ]);

    const handleConnect = (platform) => {
        // Simulate connecting account
        setAccounts(accounts.map(account =>
            account.platform === platform && !account.isConnected
                ? { ...account, isConnected: true }
                : account
        ));
        alert(`${platform} account connected successfully!`);
    };

    const handleDisconnect = (platform) => {
        // Simulate disconnecting account
        setAccounts(accounts.map(account =>
            account.platform === platform && account.isConnected
                ? { ...account, isConnected: false }
                : account
        ));
        alert(`${platform} account disconnected successfully!`);
    };

    // Calculate stats
    const instagramAccounts = accounts.filter(acc => acc.platform === 'instagram' && acc.isConnected);
    const totalInstagramFollowers = instagramAccounts.reduce((sum, acc) => sum + acc.followers, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Account Management</h1>
                <p className="text-slate-600">Manage your social media accounts for content uploading</p>
            </div>

            {/* Account Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 text-center">
                    <div className="text-2xl font-bold text-purple-600">{instagramAccounts.length}</div>
                    <div className="text-sm text-slate-600">Instagram Accounts</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 text-center">
                    <div className="text-2xl font-bold text-blue-600">{accounts.filter(acc => acc.platform === 'facebook' && acc.isConnected).length}</div>
                    <div className="text-sm text-slate-600">Facebook Accounts</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 text-center">
                    <div className="text-2xl font-bold text-red-600">{accounts.filter(acc => acc.platform === 'youtube' && acc.isConnected).length}</div>
                    <div className="text-sm text-slate-600">YouTube Channels</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 text-center">
                    <div className="text-2xl font-bold text-blue-400">{accounts.filter(acc => acc.platform === 'twitter' && acc.isConnected).length}</div>
                    <div className="text-sm text-slate-600">Twitter Accounts</div>
                </div>
            </div>

            {/* Instagram Followers Summary */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Instagram Total Reach</h3>
                        <p className="text-purple-100">Combined followers across all connected accounts</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{totalInstagramFollowers.toLocaleString()}</div>
                        <div className="text-purple-100">Total Followers</div>
                    </div>
                </div>
            </div>

            {/* Account Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {accounts.map((account, index) => (
                    <AccountCard
                        key={index}
                        platform={account.platform}
                        username={account.username}
                        followers={account.followers}
                        isConnected={account.isConnected}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                    />
                ))}
            </div>

            {/* Add New Account */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Add New Account</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-sm font-medium text-purple-600">Add Instagram</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                        <div className="text-2xl mb-2">📘</div>
                        <div className="text-sm font-medium text-blue-600">Add Facebook</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center">
                        <div className="text-2xl mb-2">📺</div>
                        <div className="text-sm font-medium text-red-600">Add YouTube</div>
                    </button>
                    <button className="p-4 border-2 border-dashed border-blue-400 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center">
                        <div className="text-2xl mb-2">🐦</div>
                        <div className="text-sm font-medium text-blue-600">Add Twitter</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountsView;
