import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../../constants';

const ShareMediaModal = ({ isOpen, onClose, onShare }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleShare = () => {
        if (selectedFiles.length > 0) {
            onShare(selectedFiles, caption);
            setSelectedFiles([]);
            setCaption('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Share Media</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Photos/Videos
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="text-sm text-slate-600">
                            {selectedFiles.length} file(s) selected
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Caption (Optional)
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={selectedFiles.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    const handleSubmit = () => {
        if (subject.trim() && description.trim()) {
            onSubmit({ subject, description, priority });
            setSubject('');
            setDescription('');
            setPriority('medium');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Report Issue</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief description of the issue"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed description of the issue..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!subject.trim() || !description.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const CommunicationView = () => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Mock tasks for communication
    const tasks = [
        {
            id: 'V015',
            campaign: 'Summer Glow',
            brand: 'Beauty Corp',
            status: 'In-Progress',
            participants: ['Brand Manager', 'Script Writer', 'Video Editor']
        },
        {
            id: 'V014',
            campaign: 'Monsoon Sale',
            brand: 'Fashion Hub',
            status: 'Pending Footage',
            participants: ['Brand Manager', 'Script Writer']
        },
        {
            id: 'V012',
            campaign: 'Summer Glow',
            brand: 'Beauty Corp',
            status: 'Submitted',
            participants: ['Brand Manager', 'Video Editor']
        }
    ];

    // Mock messages for selected task
    const mockMessages = {
        'V015': [
            { id: 1, sender: 'Brand Manager', message: 'Please make sure the intro is exactly 5 seconds', timestamp: '2024-01-15 10:30 AM', type: 'brand' },
            { id: 2, sender: 'Video Editor', message: 'Got it, I\'ll adjust the timing', timestamp: '2024-01-15 10:35 AM', type: 'editor' },
            { id: 3, sender: 'Script Writer', message: 'The voiceover script has been updated with the new product names', timestamp: '2024-01-15 11:00 AM', type: 'writer' },
            { id: 4, sender: 'Video Editor', message: 'Thanks! I\'ll incorporate the changes', timestamp: '2024-01-15 11:15 AM', type: 'editor' }
        ],
        'V014': [
            { id: 1, sender: 'Brand Manager', message: 'Raw footage will be uploaded by tomorrow', timestamp: '2024-01-14 2:30 PM', type: 'brand' },
            { id: 2, sender: 'Script Writer', message: 'I\'ve prepared the script outline for the monsoon campaign', timestamp: '2024-01-14 3:00 PM', type: 'writer' }
        ]
    };

    useEffect(() => {
        if (selectedTask) {
            setMessages(mockMessages[selectedTask.id] || []);
        }
    }, [selectedTask]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!message.trim() || !selectedTask) return;

        const newMessage = {
            id: messages.length + 1,
            sender: 'Video Editor',
            message: message,
            timestamp: new Date().toLocaleString(),
            type: 'editor'
        };

        setMessages([...messages, newMessage]);
        setMessage('');
    };

    const handleShareMedia = (files, caption) => {
        // In a real app, you would upload the files and get URLs
        const newMessage = {
            id: messages.length + 1,
            sender: 'Video Editor',
            message: caption || 'Shared media files',
            timestamp: new Date().toLocaleString(),
            type: 'editor',
            media: files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size
            }))
        };

        setMessages([...messages, newMessage]);
    };

    const handleSubmitReport = (reportData) => {
        const newMessage = {
            id: messages.length + 1,
            sender: 'Video Editor',
            message: `📋 Report Submitted: ${reportData.subject}\nPriority: ${reportData.priority}\n${reportData.description}`,
            timestamp: new Date().toLocaleString(),
            type: 'editor',
            isReport: true
        };

        setMessages([...messages, newMessage]);
    };

    const getMessageStyle = (type) => {
        switch (type) {
            case 'brand':
                return 'bg-blue-50 border-blue-200';
            case 'writer':
                return 'bg-green-50 border-green-200';
            case 'editor':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    const getSenderIcon = (type) => {
        switch (type) {
            case 'brand':
                return '🏢';
            case 'writer':
                return '✍️';
            case 'editor':
                return '🎬';
            default:
                return '👤';
        }
    };

    return (
        <div className="h-full flex">
            {/* Tasks List */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Communication</h2>
                    <p className="text-sm text-slate-600">Chat about your tasks</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                                selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900">{task.id}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">{task.campaign}</p>
                            <p className="text-xs text-slate-500">{task.brand}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-xs text-slate-500 mr-2">Participants:</span>
                                <div className="flex -space-x-1">
                                    {task.participants.slice(0, 3).map((participant, index) => (
                                        <div
                                            key={index}
                                            className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs border border-white"
                                            title={participant}
                                        >
                                            {participant.charAt(0)}
                                        </div>
                                    ))}
                                    {task.participants.length > 3 && (
                                        <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-xs border border-white">
                                            +{task.participants.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedTask ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {selectedTask.id} - {selectedTask.campaign}
                                    </h3>
                                    <p className="text-sm text-slate-600">{selectedTask.brand}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {selectedTask.participants.map((participant, index) => (
                                        <div key={index} className="flex items-center space-x-1 text-sm text-slate-600">
                                            <span>{getSenderIcon(
                                                participant === 'Brand Manager' ? 'brand' :
                                                participant === 'Script Writer' ? 'writer' : 'editor'
                                            )}</span>
                                            <span>{participant}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.type === 'editor' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg border ${getMessageStyle(msg.type)}`}>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium">{getSenderIcon(msg.type)} {msg.sender}</span>
                                            <span className="text-xs text-slate-500">{msg.timestamp}</span>
                                        </div>
                                        <div className="text-sm text-slate-800">
                                            {msg.isReport ? (
                                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                                    <p className="whitespace-pre-line">{msg.message}</p>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-line">{msg.message}</p>
                                            )}
                                            {msg.media && msg.media.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-slate-600 font-medium">📎 Attachments:</p>
                                                    {msg.media.map((file, index) => (
                                                        <div key={index} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                            {file.type.startsWith('image/') ? '🖼️' : '🎥'} {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-slate-200 p-4">
                            <div className="space-y-3">
                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                    >
                                        {ICONS.photo} <span>Share Media</span>
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                    >
                                        {ICONS.paperclip} <span>Report Issue</span>
                                    </button>
                                </div>

                                {/* Message Input */}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {ICONS.message} Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Task to Start Communication</h3>
                            <p className="text-slate-600">Choose a task from the list to chat with the brand, script writer, and other team members.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ShareMediaModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShareMedia}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleSubmitReport}
            />
        </div>
    );
};

export default CommunicationView;
