import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getInstagramAccounts, postToInstagram } from '../../services/instagramService';
// Correctly import the functions from the youtubeService
import { getConnectedYoutubeChannels, postToYoutube } from '../../services/youtubeService'; 

const ReelUploadView = ({ campaign, onBack }) => {
    const [isPosting, setIsPosting] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');

    const isUploadAllowed = campaign && campaign.status === 'Assigned';
    const inputStyle = "w-full px-4 py-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow placeholder:text-slate-500";

    const fetchAccounts = async () => {
        try {
            // Fetch from both services
            const instagramAccounts = await getInstagramAccounts();
            const youtubeChannels = await getConnectedYoutubeChannels(); // Correct function name

            const allAccounts = [
                ...instagramAccounts.map(acc => ({ ...acc, id: acc.id, name: `@${acc.username}`, platform: 'instagram' })),
                // Correctly access the channel title from the Firestore document structure
                ...youtubeChannels.map(ch => ({ ...ch, id: ch.id, name: ch.title, platform: 'youtube' }))
            ];

            setAccounts(allAccounts);
            if (allAccounts.length > 0) {
                setSelectedAccount(allAccounts[0].id);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert("Error fetching accounts: " + error.message);
        }
    };

    useEffect(() => {
        if (isUploadAllowed) {
            setCaption(`Reel for campaign: ${campaign.name}`);
            fetchAccounts();
        }
    }, [isUploadAllowed, campaign.name]);

    const handlePost = async () => {
        if (!isUploadAllowed || !videoUrl || !selectedAccount) {
            alert('Please select an account, enter a caption, and provide a valid video URL.');
            return;
        }

        const accountToPost = accounts.find(acc => acc.id === selectedAccount);
        if (!accountToPost) {
            alert('Selected account not found.');
            return;
        }

        setIsPosting(true);
        try {
            if (accountToPost.platform === 'instagram') {
                await postToInstagram(selectedAccount, videoUrl, caption);
            } else if (accountToPost.platform === 'youtube') {
                // Call the new "smart" function that handles URL-to-File conversion
                await postToYoutube(selectedAccount, caption, videoUrl);
            }
            alert(`Reel successfully posted to ${accountToPost.name} on ${accountToPost.platform}!`)
            setVideoUrl('');
        } catch (error) {
            // The specific error from the service (e.g., download failed, upload failed) will be shown
            alert(`Post failed: ${error.message}`);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center bg-white/50 backdrop-blur-xl text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-white/80 shadow-lg shadow-slate-200/80 border border-slate-300/50 transition">
                    <span className="mr-2">←</span> Back
                </button>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tighter">Post Reel for {campaign.name}</h1>
            </div>

            {!isUploadAllowed ? (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Posting Not Allowed</h3>
                    <p>This campaign must be in 'Assigned' status to post.</p>
                </div>
            ) : (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg p-6 space-y-5">
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Social Media Account</label>
                        <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className={inputStyle} disabled={isPosting || accounts.length === 0}>
                            {accounts.length === 0 ? (
                                <option>No accounts connected. Go to Account Management.</option>
                            ) : (
                                accounts.map(acc => 
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)})
                                    </option>)
                            )}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="caption" className="block text-sm font-medium text-slate-700 mb-2">Caption / Title</label>
                        <input type="text" id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Your amazing caption or title..." className={inputStyle} disabled={isPosting}/>
                    </div>

                    <div>
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-700 mb-2">Public Video URL</label>
                        <input type="text" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://your-server.com/video.mp4" className={inputStyle} disabled={isPosting}/>
                    </div>
                    
                    <hr className="border-t border-slate-300/60 my-2" />

                    <button onClick={handlePost} disabled={isPosting || !videoUrl || !selectedAccount || !caption} className="w-full bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 text-lg">
                        {isPosting ? 'Posting Reel...' : 'Post to Selected Account'}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default ReelUploadView;