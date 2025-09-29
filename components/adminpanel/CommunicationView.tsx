import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';

interface Message {
    id: string;
    sender: string;
    content: string;
    type: 'text' | 'video' | 'photo' | 'document';
    timestamp: Date;
    brandName?: string;
    channel?: string;
}

const CommunicationView = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState<'text' | 'video' | 'photo' | 'document'>('text');
    const [loading, setLoading] = useState(true);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'messages'), orderBy('timestamp', 'desc')),
            (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id, // FIX: Ensure the unique Firestore ID overwrites any other ID property
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                } as Message));
                setMessages(messagesData);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim() && !fileToUpload) return;

        try {
            let contentToSend = newMessage;

            if (messageType !== 'text' && fileToUpload) {
                const storageRef = ref(storage, `messages/${fileToUpload.name}_${Date.now()}`);
                await uploadBytes(storageRef, fileToUpload);
                contentToSend = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'messages'), {
                sender: 'Admin',
                content: contentToSend,
                type: messageType,
                timestamp: new Date(),
                channel: selectedChannel || 'general'
            });
            setNewMessage('');
            setFileToUpload(null);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessageContent = (message: Message) => {
        switch (message.type) {
            case 'video':
                return <video controls className="max-w-xs max-h-48 rounded-lg"><source src={message.content} /></video>;
            case 'photo':
                return <img src={message.content} alt="Shared content" className="max-w-xs max-h-48 rounded-lg" />;
            case 'document':
                return <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Download Document</a>;
            default:
                return <p className="text-slate-800 whitespace-pre-wrap">{message.content}</p>;
        }
    };

    const channels = [...new Set(messages.map(m => m.channel || 'general'))];
    const filteredMessages = selectedChannel
        ? messages.filter(m => m.channel === selectedChannel)
        : messages;

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden">
            {/* Channels List */}
            <div className="w-1/3 border-r border-slate-300/70 bg-white/30 flex flex-col">
                <div className="p-4 border-b border-slate-300/70 flex-shrink-0">
                    <h3 className="font-bold text-slate-800 text-lg">Channels</h3>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto flex-grow">
                    {channels.map(channel => (
                        <div
                            key={channel}
                            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedChannel === channel ? 'bg-indigo-500/10 text-indigo-700' : 'hover:bg-white/50'}`}
                            onClick={() => setSelectedChannel(channel)}
                        >
                            <p className="font-semibold text-sm">#{channel}</p>
                            <p className="text-xs text-slate-500 truncate">
                                {messages.find(m => m.channel === channel)?.content || 'No recent messages'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message Area */}
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b border-slate-300/70 flex-shrink-0">
                    <h3 className="font-bold text-slate-800 text-lg">{selectedChannel ? `#${selectedChannel}` : 'All Messages'}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
                    {filteredMessages.map(message => (
                        <div key={message.id} className={`flex items-start space-x-3 p-1 rounded-lg transition-colors ${message.sender === 'Admin' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${message.sender === 'Admin' ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                {message.sender[0].toUpperCase()}
                            </div>
                            <div className={`flex-1 min-w-0 ${message.sender === 'Admin' ? 'text-right' : ''}`}>
                                <div className={`flex items-center space-x-2 mb-1 ${message.sender === 'Admin' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <span className="font-semibold text-slate-800 text-sm">{message.sender}</span>
                                    <span className="text-xs text-slate-500">
                                        {message.timestamp.toLocaleString()}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-2xl inline-block max-w-md ${message.sender === 'Admin' ? 'bg-indigo-100 text-indigo-900' : 'bg-white border border-slate-200/80'}`}>
                                    {renderMessageContent(message)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-300/70 bg-white/40">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={messageType === 'text' ? "Type a message..." : "Add a caption..."}
                                className="flex-1 px-4 py-2.5 bg-white/50 border border-slate-300/70 text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150 placeholder:text-slate-500"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <select
                                value={messageType}
                                onChange={(e) => setMessageType(e.target.value as any)}
                                className="px-3 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="text">📄 Text</option>
                                <option value="photo">🖼️ Photo</option>
                                <option value="video">🎬 Video</option>
                                <option value="document">📎 Doc</option>
                            </select>
                             <button
                                onClick={sendMessage}
                                className="px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:bg-slate-400 disabled:shadow-none"
                                disabled={(messageType === 'text' && !newMessage.trim()) || (messageType !== 'text' && !fileToUpload)}
                            >
                                Send
                            </button>
                        </div>
                        {messageType !== 'text' && (
                            <div className="flex items-center text-sm">
                                <label htmlFor="file-upload" className="cursor-pointer text-indigo-600 hover:underline">
                                    {fileToUpload ? `Selected: ${fileToUpload.name}` : 'Choose a file...'}
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept={messageType === 'video' ? 'video/*' : messageType === 'photo' ? 'image/*' : '.zip,.pdf,.doc,.docx'}
                                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationView;