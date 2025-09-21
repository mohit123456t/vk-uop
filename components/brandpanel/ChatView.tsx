import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../../constants';

const ChatView = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Admin', message: 'Welcome to the brand chat system!', timestamp: new Date(), isAdmin: true },
        { id: 2, sender: 'Creator 1', message: 'Hello! Ready to discuss the campaign.', timestamp: new Date(Date.now() - 300000), isAdmin: false },
        { id: 3, sender: 'Creator 2', message: 'Looking forward to the collaboration!', timestamp: new Date(Date.now() - 600000), isAdmin: false },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedCreator, setSelectedCreator] = useState('all');
    const messagesEndRef = useRef(null);

    const creators = [
        { id: 'all', name: 'All Creators', avatar: '👥' },
        { id: 'creator1', name: 'Sarah Johnson', avatar: '👩‍💼', online: true },
        { id: 'creator2', name: 'Mike Chen', avatar: '👨‍🎨', online: false },
        { id: 'creator3', name: 'Emma Davis', avatar: '👩‍🎤', online: true },
        { id: 'creator4', name: 'Alex Rodriguez', avatar: '👨‍💻', online: true },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: messages.length + 1,
                sender: 'Admin',
                message: newMessage,
                timestamp: new Date(),
                isAdmin: true
            };
            setMessages([...messages, message]);
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
        <div className="h-full flex bg-slate-50">
            {/* Creators Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Creators</h2>
                    <p className="text-sm text-slate-600">Connected content creators</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {creators.map(creator => (
                        <button
                            key={creator.id}
                            onClick={() => setSelectedCreator(creator.id)}
                            className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                                selectedCreator === creator.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <span className="text-2xl">{creator.avatar}</span>
                                    {creator.online && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{creator.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {creator.online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white border-b border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                                {creators.find(c => c.id === selectedCreator)?.avatar || '👥'}
                            </span>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    {creators.find(c => c.id === selectedCreator)?.name || 'All Creators'}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {selectedCreator === 'all' ? `${creators.filter(c => c.online).length} online` : 'Direct message'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                {ICONS.phone}
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                {ICONS.video}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.isAdmin
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-800'
                            }`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${
                                    msg.isAdmin ? 'text-blue-100' : 'text-slate-500'
                                }`}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-slate-200 p-4">
                    <div className="flex items-end space-x-3">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            {ICONS.photo}
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            {ICONS.paperclip}
                        </button>
                        <div className="flex-1">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                rows={1}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {ICONS.arrowRight}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
