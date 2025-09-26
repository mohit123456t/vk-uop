import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const CollaborationView = ({ userProfile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeChat, setActiveChat] = useState('general');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (userProfile?.email) {
            fetchMessages();
            setupRealtimeListener();
        }
    }, [userProfile, activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const messagesQuery = query(
                collection(db, 'team_messages'),
                where('channel', '==', activeChat),
                orderBy('timestamp', 'asc')
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const messagesData = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messagesData);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    const setupRealtimeListener = () => {
        const messagesQuery = query(
            collection(db, 'team_messages'),
            where('channel', '==', activeChat),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(messagesQuery, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messagesData);
        });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userProfile?.email) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'team_messages'), {
                text: newMessage.trim(),
                sender: userProfile.email,
                senderName: userProfile.name || 'Script Writer',
                channel: activeChat,
                timestamp: serverTimestamp(),
                type: 'text'
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getChannelName = (channel) => {
        switch (channel) {
            case 'general': return 'General Chat';
            case 'script-feedback': return 'Script Feedback';
            case 'campaign-updates': return 'Campaign Updates';
            case 'admin': return 'Admin Support';
            default: return channel;
        }
    };

    const channels = [
        { id: 'general', name: 'General Chat', icon: '💬', color: 'bg-blue-100 text-blue-800' },
        { id: 'script-feedback', name: 'Script Feedback', icon: '📝', color: 'bg-green-100 text-green-800' },
        { id: 'campaign-updates', name: 'Campaign Updates', icon: '📢', color: 'bg-purple-100 text-purple-800' },
        { id: 'admin', name: 'Admin Support', icon: '👨‍💼', color: 'bg-orange-100 text-orange-800' },
    ];

    return (
        <div className="flex h-[85vh] bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Sidebar - Channels & Users */}
            <div className="w-1/3 border-r bg-slate-50">
                <div className="p-4 border-b bg-white">
                    <h3 className="font-bold text-slate-800 mb-2">Team Communication</h3>
                    <p className="text-xs text-slate-500">Real-time collaboration</p>
                </div>

                {/* Channels */}
                <div className="p-2">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 px-2">Channels</h4>
                    {channels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => setActiveChat(channel.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all mb-1 ${
                                activeChat === channel.id
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'hover:bg-white text-slate-700'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">{channel.icon}</span>
                                <div>
                                    <p className="text-sm font-medium">{channel.name}</p>
                                    <p className="text-xs opacity-75">
                                        {messages.filter(m => m.channel === channel.id).length} messages
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Online Users */}
                <div className="p-2 border-t">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 px-2">Online Now</h4>
                    <div className="space-y-2">
                        {[
                            { name: 'Admin', role: 'Administrator', status: 'online' },
                            { name: 'Priya M.', role: 'Video Editor', status: 'online' },
                            { name: 'Arjun K.', role: 'Thumbnail Maker', status: 'away' },
                            { name: 'Sneha R.', role: 'Content Manager', status: 'online' },
                        ].map(user => (
                            <div key={user.name} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                        user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="w-2/3 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <div>
                            <h3 className="font-bold text-slate-800">{getChannelName(activeChat)}</h3>
                            <p className="text-xs text-slate-500">
                                {messages.length} messages • {onlineUsers.length} online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            {ICONS.search}
                        </button>
                        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            {ICONS.ellipsis}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-slate-400 mb-4">
                                    <span className="text-4xl">💬</span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                                <p className="text-slate-600">Start the conversation in {getChannelName(activeChat)}</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwnMessage = message.sender === userProfile?.email;
                            const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;

                            return (
                                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                        {!isOwnMessage && showAvatar && (
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {message.senderName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                        {!isOwnMessage && !showAvatar && <div className="w-8"></div>}

                                        <div className={`rounded-lg p-3 shadow-sm ${
                                            isOwnMessage
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white border border-slate-200 text-slate-900'
                                        }`}>
                                            {!isOwnMessage && showAvatar && (
                                                <p className="text-xs font-semibold text-slate-600 mb-1">
                                                    {message.senderName}
                                                </p>
                                            )}
                                            <p className="text-sm leading-relaxed">{message.text}</p>
                                            <p className={`text-xs mt-1 ${
                                                isOwnMessage ? 'text-slate-300' : 'text-slate-500'
                                            }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${getChannelName(activeChat)}...`}
                                className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={sending}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                                title="Add emoji"
                            >
                                😊
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send</span>
                                    {ICONS.send}
                                </>
                            )}
                        </button>
                    </form>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>Press Enter to send • Shift+Enter for new line</span>
                        <span>💬 Real-time messaging powered by Firebase</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationView;
