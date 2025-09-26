import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

const roles = [
    { id: 'admin', label: 'Admin', color: 'from-blue-500 to-blue-600' },
    { id: 'video_editor', label: 'Video Editor', color: 'from-green-500 to-green-600' },
    { id: 'script_writer', label: 'Script Writer', color: 'from-purple-500 to-purple-600' },
];

const SupportView = ({ user, campaigns }) => {
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedRole, setSelectedRole] = useState('admin');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.uid || !selectedCampaign) {
                setMessages([]);
                return;
            }

            setIsLoading(true);
            try {
                const chatCol = collection(db, `users/${user.uid}/campaigns/${selectedCampaign}/supportChats`);
                const q = query(chatCol, orderBy('timestamp'));
                const chatSnap = await getDocs(q);
                const filtered = chatSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(msg => msg.role === selectedRole);
                setMessages(filtered);
            } catch (error) {
                console.error("Failed to load messages", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [user, selectedCampaign, selectedRole]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedCampaign || !selectedRole) return;

        const chatCol = collection(db, `users/${user.uid}/campaigns/${selectedCampaign}/supportChats`);
        const msgObj = {
            sender: user.email,
            message: newMessage,
            role: selectedRole,
            timestamp: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(chatCol, msgObj);
            setMessages(prev => [...prev, { id: docRef.id, ...msgObj }]);
            setNewMessage('');
        } catch (error) {
            alert("Failed to send message. Please try again.");
        }
    };

    const selectedRoleColor = roles.find(r => r.id === selectedRole)?.color || 'from-gray-500 to-gray-600';

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Support Center
                </h1>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">We’re here to help you 24/7</p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 flex-1 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                
                {/* Contact Info Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-slate-200/50">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Need Immediate Help?</h3>
                    <p className="text-slate-600 text-sm">
                        Email us at{' '}
                        <a href="mailto:support@viewzkart.com" className="font-medium text-blue-600 hover:underline transition">
                            support@viewzkart.com
                        </a>{' '}
                        or chat below for campaign-specific support.
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col">
                    
                    {/* Campaign Select */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Select Campaign</label>
                        <div className="relative">
                            <select
                                value={selectedCampaign}
                                onChange={e => setSelectedCampaign(e.target.value)}
                                className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            >
                                <option value="">-- Choose a Campaign --</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id} className="py-2">
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Role Select */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Select Role</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                        selectedRole === role.id
                                            ? `bg-gradient-to-r ${role.color} text-white shadow-md`
                                            : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 min-h-0">
                        <div className="h-64 sm:h-80 bg-slate-50 rounded-xl p-4 overflow-y-auto border border-slate-200/50 relative">
                            
                            {isLoading ? (
                                <div className="flex flex-col space-y-3 py-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-start space-x-3 animate-pulse">
                                            <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-300 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <p className="text-center">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex ${msg.sender === user.email ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm transition-transform ${
                                                    msg.sender === user.email
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-200 rounded-tl-none'
                                                }`}
                                            >
                                                <p className="font-medium">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${
                                                    msg.sender === user.email ? 'text-blue-100' : 'text-slate-400'
                                                }`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="pt-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                disabled={!selectedCampaign}
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed transition"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || !selectedCampaign}
                                className={`px-6 py-3 rounded-xl font-medium text-white transition-all transform active:scale-95 ${
                                    !newMessage.trim() || !selectedCampaign
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : `bg-gradient-to-r ${selectedRoleColor} shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        {!selectedCampaign && (
                            <p className="text-xs text-orange-500 mt-2 animate-pulse">
                                ⚠️ Please select a campaign to start chatting.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportView;