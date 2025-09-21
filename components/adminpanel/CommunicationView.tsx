
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore as db, storage } from '../../services/firebase';

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
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                } as Message));
                setMessages(messagesData);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            let contentToSend = newMessage;

            if (messageType !== 'text' && fileToUpload) {
                // Upload file to Firebase Storage
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
                return <video controls className="max-w-xs max-h-48"><source src={message.content} /></video>;
            case 'photo':
                return <img src={message.content} alt="Shared photo" className="max-w-xs max-h-48" />;
            case 'document':
                return <a href={message.content} className="text-blue-600 underline">Download Document</a>;
            default:
                return <p>{message.content}</p>;
        }
    };

    const channels = [...new Set(messages.map(m => m.channel || 'general'))];
    const filteredMessages = selectedChannel
        ? messages.filter(m => m.channel === selectedChannel)
        : messages;

    if (loading) {
        return <div className="text-center py-8">Loading messages...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="w-1/3 border-r">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-slate-800">Channels</h3>
                </div>
                <div className="p-2 space-y-1">
                    {channels.map(channel => (
                        <div
                            key={channel}
                            className={`p-2 rounded-lg cursor-pointer ${selectedChannel === channel ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
                            onClick={() => setSelectedChannel(channel)}
                        >
                            <p className="font-semibold text-sm">#{channel}</p>
                            <p className="text-xs text-slate-500 truncate">
                                {messages.find(m => m.channel === channel)?.content || 'No messages'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-slate-800">{selectedChannel ? `#${selectedChannel}` : 'All Messages'}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                    {filteredMessages.map(message => (
                        <div key={message.id} className="flex items-start space-x-3 hover:bg-slate-50/50 p-3 rounded-lg transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {message.sender[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-slate-800">{message.sender}</span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                        {message.timestamp.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                                    {renderMessageContent(message)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <select
                                value={messageType}
                                onChange={(e) => setMessageType(e.target.value as any)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value="text">Text</option>
                                <option value="video">Video</option>
                                <option value="photo">Photo</option>
                                <option value="document">Document</option>
                            </select>
                            {messageType !== 'text' && (
                                <input
                                    type="file"
                                    accept={messageType === 'video' ? 'video/*' : messageType === 'photo' ? 'image/*' : '.zip,.pdf,.doc,.docx'}
                                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            )}
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={messageType === 'text' ? "Type your message..." : "Add a caption..."}
                                className="flex-1 border border-gray-300 rounded px-3 py-1"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                                disabled={messageType !== 'text' && !fileToUpload}
                            >
                                Send
                            </button>
                        </div>
                        {fileToUpload && (
                            <div className="text-sm text-gray-600">
                                Selected file: {fileToUpload.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationView;
