import React, { useState } from 'react';

const ChatMessage = ({ message, isOwn, sender, timestamp, avatar }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start max-w-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isOwn && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                    {avatar}
                </div>
            )}
            <div className={`rounded-lg px-4 py-2 ${isOwn ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>
                {!isOwn && <p className="text-xs text-slate-500 mb-1">{sender}</p>}
                <p className="text-sm">{message}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                    {timestamp}
                </p>
            </div>
            {isOwn && (
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold ml-2">
                    U
                </div>
            )}
        </div>
    </div>
);

const ContactCard = ({ name, role, avatar, isOnline, lastSeen, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100 mb-2"
    >
        <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {avatar}
            </div>
            {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
        </div>
        <div className="ml-3 flex-1">
            <p className="font-medium text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
        </div>
        <div className="text-xs text-slate-400">
            {isOnline ? 'Online' : lastSeen}
        </div>
    </div>
);

const CommunicationView = () => {
    const [activeChat, setActiveChat] = useState('admin');
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState({
        admin: [
            { id: 1, message: 'Hi Anjali! How are your uploads going?', sender: 'Admin', timestamp: '10:30 AM', isOwn: false },
            { id: 2, message: 'Great! I\'ve uploaded 5 reels today for the Summer Glow campaign.', sender: 'You', timestamp: '10:32 AM', isOwn: true },
            { id: 3, message: 'Excellent work! The quality looks amazing. Keep it up!', sender: 'Admin', timestamp: '10:35 AM', isOwn: false },
        ],
        videoEditor: [
            { id: 1, message: 'Hey Anjali, I edited your latest reel. Ready for review!', sender: 'Video Editor', timestamp: '2:15 PM', isOwn: false },
            { id: 2, message: 'Thanks! I\'ll check it out right away.', sender: 'You', timestamp: '2:18 PM', isOwn: true },
        ],
        brand: [
            { id: 1, message: 'Hi Anjali! Love your content. Interested in collaboration?', sender: 'Brand Manager', timestamp: '9:45 AM', isOwn: false },
            { id: 2, message: 'Hi! I\'d love to discuss collaboration opportunities.', sender: 'You', timestamp: '9:50 AM', isOwn: true },
        ]
    });

    const contacts = [
        { id: 'admin', name: 'Admin Support', role: 'Administrator', avatar: 'A', isOnline: true, lastSeen: 'Online' },
        { id: 'videoEditor', name: 'Rajesh Kumar', role: 'Video Editor', avatar: 'R', isOnline: true, lastSeen: 'Online' },
        { id: 'brand', name: 'Sarah Johnson', role: 'Brand Manager', avatar: 'S', isOnline: false, lastSeen: '2h ago' },
    ];

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const newMsg = {
                id: messages[activeChat].length + 1,
                message: newMessage,
                sender: 'You',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true
            };
            setMessages({
                ...messages,
                [activeChat]: [...messages[activeChat], newMsg]
            });
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-full flex">
            {/* Contacts Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Messages</h2>
                    <p className="text-sm text-slate-600">Chat with your team</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {contacts.map((contact) => (
                        <ContactCard
                            name={contact.name}
                            role={contact.role}
                            avatar={contact.avatar}
                            isOnline={contact.isOnline}
                            lastSeen={contact.lastSeen}
                            onClick={() => setActiveChat(contact.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {/* Chat Header */}
                <div className="bg-white p-4 border-b border-slate-200 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {contacts.find(c => c.id === activeChat)?.avatar}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">
                            {contacts.find(c => c.id === activeChat)?.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {contacts.find(c => c.id === activeChat)?.role}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <div className={`w-3 h-3 rounded-full ${contacts.find(c => c.id === activeChat)?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages[activeChat]?.map((msg) => (
                        <ChatMessage
                            message={msg.message}
                            isOwn={msg.isOwn}
                            sender={msg.sender}
                            timestamp={msg.timestamp}
                            avatar={msg.isOwn ? 'U' : contacts.find(c => c.id === activeChat)?.avatar}
                        />
                    ))}
                </div>

                {/* Message Input */}
                <div className="bg-white p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationView;
