import React, { useState } from 'react';
import { useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'video_editor', label: 'Video Editor' },
    { id: 'script_writer', label: 'Script Writer' },
];

const SupportView = ({ user, campaigns }) => {
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedRole, setSelectedRole] = useState('admin');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            if (user && user.uid && selectedCampaign) {
                const chatCol = collection(db, `users/${user.uid}/campaigns/${selectedCampaign}/supportChats`);
                const chatSnap = await getDocs(chatCol);
                // Filter messages by selectedRole
                setMessages(chatSnap.docs.map(doc => doc.data()).filter(msg => msg.role === selectedRole));
            } else {
                setMessages([]);
            }
        };
        fetchMessages();
    }, [user, selectedCampaign, selectedRole]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedCampaign || !selectedRole) return;
        const chatCol = collection(db, `users/${user.uid}/campaigns/${selectedCampaign}/supportChats`);
        const msgObj = {
            sender: user.email,
            message: newMessage,
            role: selectedRole,
            timestamp: new Date().toISOString(),
        };
        await addDoc(chatCol, msgObj);
        setMessages(prev => [...prev, msgObj]);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Support Center</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex-1 overflow-auto">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Contact Us</h3>
                <p className="text-slate-600 mb-6">For any questions or support, please email us at <a href="mailto:support@viewzkart.com" className="text-slate-800 font-medium hover:underline">support@viewzkart.com</a>.</p>

                {/* Campaign select */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Campaign</label>
                    <select
                        value={selectedCampaign}
                        onChange={e => setSelectedCampaign(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                        <option value="">-- Select Campaign --</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Role select */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Role</label>
                    <select
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                    </select>
                </div>

                {/* Chat messages */}
                <div className="mb-4 h-64 overflow-y-auto border rounded p-4 bg-slate-50">
                    {messages.length === 0 ? (
                        <p className="text-slate-500">No messages yet.</p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className="mb-2">
                                <span className="font-semibold text-blue-700">{msg.sender}:</span> <span>{msg.message}</span>
                                <span className="text-xs text-slate-400 ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Message input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !selectedCampaign}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportView;
