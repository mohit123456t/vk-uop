import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { getInstagramAccounts, connectInstagramAccount, disconnectInstagramAccount } from '../../services/instagramService';
// Correct the import to use the actual exported function name
import { getConnectedYoutubeChannels, addYouTubeAccount, disconnectYouTubeAccount } from '../../services/youtubeService';
import { getManualAccounts, disconnectManualAccount } from '../../services/manualAccountService';

const AccountCard = ({ platform, username, followers, onDisconnect, accountId }) => {
    const platformIcons = { instagram: '📷', youtube: '📺', manual: '✍️' };
    const platformColors = {
        instagram: 'bg-gradient-to-r from-purple-500 to-pink-600',
        youtube: 'bg-red-600',
        manual: 'bg-slate-500'
    };

    return (
        <motion.div
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className={`w-12 h-12 ${platformColors[platform]} rounded-full flex items-center justify-center text-white text-2xl mr-4`}>
                        {platformIcons[platform]}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 capitalize">{platform}</h3>
                        <p className="text-sm text-slate-600">@{username}</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700">
                    Connected
                </div>
            </div>

            {followers !== undefined && (
                <div className="mb-4">
                    <p className="text-sm text-slate-600">Followers: <span className="font-semibold text-slate-800">{followers.toLocaleString()}</span></p>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={() => onDisconnect(platform, accountId)} className="flex-1 bg-red-600/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                    Disconnect
                </button>
                <button onClick={() => alert(`Settings for ${username} not implemented.`)} className="px-4 py-2.5 bg-slate-500/10 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-500/20 transition-colors">
                    Settings
                </button>
            </div>
        </motion.div>
    );
};

const AccountsView = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [youTubeChannelId, setYouTubeChannelId] = useState('');

    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const [instagram, youtube, manual] = await Promise.all([
                getInstagramAccounts(),
                getConnectedYoutubeChannels(), // Use the correct function here
                getManualAccounts()
            ]);

            const allAccounts = [
                ...instagram.map(acc => ({ ...acc, platform: 'instagram', username: acc.username, followers: acc.followers })),
                // The data structure from Firestore (via getConnectedYoutubeChannels) is already correct
                ...youtube.map(acc => ({ ...acc, platform: 'youtube', username: acc.title, followers: acc.subscribers })),
                ...manual.map(acc => ({ ...acc, platform: 'manual', username: acc.name, followers: acc.followerCount }))
            ];
            setAccounts(allAccounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert('Error fetching accounts: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAccounts();
    }, []);

    const handleInstagramConnect = async () => {
        setConnecting(true);
        try {
            const resultMessage = await connectInstagramAccount();
            alert(resultMessage);
            await fetchAllAccounts(); // Refresh accounts list
        } catch (error) {
            console.error('Instagram Connection Error:', error);
            alert('Failed to connect Instagram: ' + error.message);
        } finally {
            setConnecting(false);
        }
    };
    
    const handleYouTubeConnect = async () => {
        if (!youTubeChannelId.trim()) {
            alert('Please enter a YouTube Channel ID');
            return;
        }
        setConnecting(true);
        try {
            await addYouTubeAccount(youTubeChannelId);
            alert('YouTube account connected successfully!');
            setIsYouTubeModalOpen(false);
            setYouTubeChannelId('');
            await fetchAllAccounts();
        } catch (error) {
            alert('Error adding YouTube account: ' + error.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async (platform, accountId) => {
        const confirmDisconnect = window.confirm(`Are you sure you want to disconnect this ${platform} account?`);
        if (!confirmDisconnect) return;

        try {
            if (platform === 'instagram') {
                await disconnectInstagramAccount(accountId);
            } else if (platform === 'youtube') {
                await disconnectYouTubeAccount(accountId);
            } else if (platform === 'manual') {
                await disconnectManualAccount(accountId);
            } else {
                alert(`${platform} disconnect not implemented yet`);
                return;
            }
            alert(`${platform} account disconnected successfully!`);
            await fetchAllAccounts();
        } catch (error) {
            alert(`Error disconnecting ${platform} account: ` + error.message);
        }
    };

    const totalInstagramFollowers = accounts
        .filter(acc => acc.platform === 'instagram')
        .reduce((sum, acc) => sum + (acc.followers || 0), 0);

    return (
        <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Account Management</h1>
                <p className="text-slate-500 mt-1">Manage your social media accounts for content uploading</p>
            </div>

            <div className="bg-purple-500/10 backdrop-blur-xl text-slate-800 p-6 rounded-2xl border border-purple-500/20">
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-purple-900">Instagram Total Reach</h3>
                        <p className="text-purple-800">Combined followers across all connected accounts</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-purple-900">{totalInstagramFollowers.toLocaleString()}</div>
                        <div className="text-purple-800">Total Followers</div>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Connect New Accounts</h3>
                <p className="text-sm text-slate-600 mb-4">Connect your social accounts automatically via login.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleInstagramConnect}
                        disabled={connecting}
                        className="flex items-center justify-center p-4 bg-white/50 border border-slate-300/70 rounded-xl hover:bg-white/80 hover:border-purple-400 transition-all text-center group shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-3xl mr-3 transition-transform group-hover:scale-110">📷</span>
                        <div>
                            <h4 className="font-semibold text-purple-800">Connect Instagram</h4>
                            <p className="text-sm text-purple-700">Via Facebook Login</p>
                        </div>
                    </button>
                     <button 
                        onClick={() => setIsYouTubeModalOpen(true)}
                        className="flex items-center justify-center p-4 bg-white/50 border border-slate-300/70 rounded-xl hover:bg-white/80 hover:border-red-400 transition-all text-center group shadow-md hover:shadow-lg"
                    >
                        <span className="text-3xl mr-3 transition-transform group-hover:scale-110">📺</span>
                        <div>
                            <h4 className="font-semibold text-red-800">Add YouTube</h4>
                            <p className="text-sm text-red-700">By Channel ID</p>
                        </div>
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tighter mb-4">Connected Accounts</h2>
                {loading ? (
                    <p className="text-slate-500">Loading accounts...</p>
                ) : accounts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {accounts.map((account) => (
                                <AccountCard
                                    key={account.id}
                                    platform={account.platform}
                                    username={account.username}
                                    followers={account.followers}
                                    onDisconnect={handleDisconnect}
                                    accountId={account.id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 p-12 text-center text-slate-500">
                        No accounts have been added yet. Use the options above to connect one.
                    </div>
                )}
            </div>
            
            {/* YouTube Connect Modal */}
            <AnimatePresence>
                {isYouTubeModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-2xl p-6 w-full max-w-md"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Add YouTube Channel</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">YouTube Channel ID</label>
                                <input
                                    type="text"
                                    value={youTubeChannelId}
                                    onChange={(e) => setYouTubeChannelId(e.target.value)}
                                    placeholder="Enter YouTube Channel ID (e.g., UC...)"
                                    className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsYouTubeModalOpen(false)}
                                    className="px-4 py-2 bg-slate-500/10 text-slate-700 rounded-lg font-medium hover:bg-slate-500/20 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleYouTubeConnect}
                                    disabled={connecting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {connecting ? 'Adding...' : 'Add Channel'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AccountsView;
