import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getYouTubeAPIKey, setYouTubeAPIKey, getYouTubeAccessToken, setYouTubeAccessToken } from '../../services/youtubeService';

const ApiKeyManagementView = () => {
    const [youtubeApiKey, setYoutubeApiKey] = useState('');
    const [youtubeAccessToken, setYoutubeAccessToken] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const ytApiKey = await getYouTubeAPIKey();
                const ytAccessToken = await getYouTubeAccessToken();
                setYoutubeApiKey(ytApiKey || '');
                setYoutubeAccessToken(ytAccessToken || '');
            } catch (error) {
                console.error("Error fetching API keys:", error);
                alert("Could not load API settings. Please try reloading the page.");
            }
            setLoading(false);
        };
        fetchKeys();
    }, []);

    const handleSaveYouTube = async () => {
        try {
            await setYouTubeAPIKey(youtubeApiKey);
            await setYouTubeAccessToken(youtubeAccessToken);
            alert('YouTube API settings saved!');
        } catch (error) {
            console.error("Error saving YouTube settings:", error);
            alert(`Error saving YouTube settings: ${error.message}`);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">API Key Management</h1>
                <p className="text-slate-500 mt-1">Manage your API keys and access tokens for social media platforms</p>
            </div>

            {/* YouTube Section */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl mr-4">📺</div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">YouTube API Settings</h2>
                        <p className="text-slate-600">Configure your YouTube API key and access token</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">YouTube API Key</label>
                        <input
                            type="password"
                            value={youtubeApiKey}
                            onChange={(e) => setYoutubeApiKey(e.target.value)}
                            placeholder="Enter your YouTube API Key"
                            className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">YouTube Access Token</label>
                        <input
                            type="password"
                            value={youtubeAccessToken}
                            onChange={(e) => setYoutubeAccessToken(e.target.value)}
                            placeholder="Enter your YouTube Access Token"
                            className="w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSaveYouTube}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                    >
                        Save YouTube Settings
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ApiKeyManagementView;
