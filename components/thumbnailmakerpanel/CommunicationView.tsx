import React from 'react';

const CommunicationView = () => {
    // Dummy data for messages
    const messages = [
        {
            id: 1,
            sender: 'Admin',
            timestamp: '2024-07-21 10:30 AM',
            content: 'Hi there! Just a reminder that the deadline for Campaign X thumbnails is this Friday.',
            isRead: false,
        },
        {
            id: 2,
            sender: 'Project Manager',
            timestamp: '2024-07-20 02:15 PM',
            content: 'Great work on the last batch of thumbnails. The client loved them!',
            isRead: true,
        },
        {
            id: 3,
            sender: 'Admin',
            timestamp: '2024-07-19 09:00 AM',
            content: 'Please check the new assets uploaded for the upcoming project.',
            isRead: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center"><span className="mr-2 animate-bounce">💬</span>Communication Hub</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Inbox</h3>
                </div>
                <div className="divide-y divide-slate-200">
                    {messages.map((message) => (
                        <div key={message.id} className={`p-4 ${!message.isRead ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-slate-800">{message.sender}</p>
                                <p className="text-xs text-slate-500">{message.timestamp}</p>
                            </div>
                            <p className={`text-sm ${!message.isRead ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                {message.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunicationView;
