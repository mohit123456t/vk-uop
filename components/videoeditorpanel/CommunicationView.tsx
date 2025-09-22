
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import authService from '../../services/authService';
import { ICONS } from '@/constants';

const CommunicationView = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const authUnsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setCurrentUser({ 
                    uid: authState.user.uid, 
                    name: authState.userProfile.name, 
                    email: authState.userProfile.email 
                });
            } else {
                setError('User not authenticated.');
                setLoading(false);
            }
        });

        return () => authUnsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'chats'), 
            // This query assumes a chat document structure where 'participants' is an array of emails
            where('participants', 'array-contains', currentUser.email),
            orderBy('timestamp', 'asc')
        );

        const chatUnsubscribe = onSnapshot(q, (querySnapshot) => {
            // For simplicity, we'll assume one chat room between editor and admin.
            // A more robust solution would handle multiple chat rooms.
            if (!querySnapshot.empty) {
                const chatDoc = querySnapshot.docs[0]; // Get the first chat room
                const messagesQuery = query(collection(db, `chats/${chatDoc.id}/messages`), orderBy('timestamp', 'asc'));

                const messagesUnsubscribe = onSnapshot(messagesQuery, (messagesSnapshot) => {
                    const msgs = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setMessages(msgs);
                    setLoading(false);
                }, (err) => {
                    console.error("Error fetching messages: ", err);
                    setError('Failed to fetch messages.');
                    setLoading(false);
                });
                return messagesUnsubscribe; // This will be the cleanup function
            } else {
                 setMessages([]); // No chat room found
                 setLoading(false);
            }
        }, (err) => {
            console.error("Error fetching chat room: ", err);
            setError('Failed to fetch chat room.');
            setLoading(false);
        });

        return () => chatUnsubscribe();

    }, [currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser) return;

        try {
             // Find the chat room again before sending a message
            const chatQuery = query(
                collection(db, 'chats'), 
                where('participants', 'array-contains', currentUser.email)
            );
            const chatSnapshot = await getDocs(chatQuery);

            if (!chatSnapshot.empty) {
                const chatDocId = chatSnapshot.docs[0].id;
                await addDoc(collection(db, `chats/${chatDocId}/messages`), {
                    text: newMessage,
                    senderId: currentUser.uid,
                    senderName: currentUser.name,
                    timestamp: serverTimestamp(),
                });
                setNewMessage('');
            } else {
                setError('No chat room available to send messages.');
            }
        } catch (err) {
            console.error("Error sending message: ", err);
            setError('Failed to send message.');
        }
    };

    if (loading) return <div className="text-center p-10">Loading chat...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-md border">
            <div className="p-4 border-b font-semibold text-slate-800">
                Admin Chat
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="text-sm font-bold">{msg.senderName}</p>
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp?.toDate().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-12">
                        <div className="text-slate-400 mb-4"><ICONS.message className="h-12 w-12 mx-auto" /></div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Messages Yet</h3>
                        <p className="text-slate-600">Start the conversation by sending a message.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 bg-slate-50">
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 w-full px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                       Send
                       <ICONS.send className="w-4 h-4 ml-2"/>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommunicationView;
