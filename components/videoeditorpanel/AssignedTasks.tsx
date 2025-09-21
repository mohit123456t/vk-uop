import React, { useState } from 'react';
import { ICONS } from '../../constants';

const tasks = [
    {
        id: 'V015',
        campaign: 'Summer Glow',
        deadline: 'In 2 days',
        status: 'In-Progress',
        details: 'Edit makeup tutorial video with transitions and effects. Add engaging intro, smooth transitions between product demos, and call-to-action overlay.',
        assigned: '2024-01-08',
        progress: 60,
        daysToComplete: 2,
        assets: ['/img/makeup-tutorial-raw.mp4', '/img/product-shots.jpg'],
        instructions: 'Complete editing and upload final video to submission portal.'
    },
    {
        id: 'V014',
        campaign: 'Monsoon Sale',
        deadline: 'In 4 days',
        status: 'Pending Footage',
        details: 'Waiting for raw footage from uploader. Once received, create promotional video highlighting monsoon sale products.',
        assigned: '2024-01-06',
        progress: 0,
        daysToComplete: 4,
        assets: [],
        instructions: 'Wait for footage, then edit and submit completed video.'
    },
    {
        id: 'V012',
        campaign: 'Summer Glow',
        deadline: 'Yesterday',
        status: 'Submitted',
        details: 'Beauty product demo video edited and submitted for approval.',
        assigned: '2024-01-05',
        progress: 100,
        daysToComplete: 3,
        assets: ['/img/beauty-demo-final.mp4'],
        instructions: 'Video submitted, awaiting approval feedback.'
    },
    {
        id: 'V011',
        campaign: 'Old Campaign',
        deadline: '2 days ago',
        status: 'Approved',
        details: 'Product showcase video with voiceover completed successfully.',
        assigned: '2024-01-03',
        progress: 100,
        daysToComplete: 5,
        assets: ['/img/product-showcase-approved.mp4'],
        instructions: 'Task completed and approved.'
    },
];

const StatusBadge = ({ status }) => {
    const statusClasses = {
        "Pending Footage": "bg-slate-200 text-slate-800",
        "In-Progress": "bg-blue-100 text-blue-800",
        "Submitted": "bg-yellow-100 text-yellow-800",
        "Approved": "bg-green-100 text-green-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const TaskDetailsPage = ({ task, isOpen, onClose }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !task) return null;

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleSubmit = () => {
        if (!videoUrl && !uploadedFile) {
            alert('Please provide either a video URL or upload a file');
            return;
        }
        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Video submitted successfully!');
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="min-h-screen">
                <div className="bg-slate-50 border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{task.id} - {task.campaign}</h1>
                                <p className="text-slate-600 mt-1">Task Details & Information</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Task Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Status:</span>
                                <StatusBadge status={task.status} />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600">Deadline:</span>
                                <p className={`font-semibold mt-1 text-lg ${task.deadline === 'In 2 days' ? 'text-red-600' : 'text-slate-800'}`}>
                                    {task.deadline}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600">Days to Complete:</span>
                                <p className={`font-semibold mt-1 text-lg ${task.daysToComplete <= 2 ? 'text-red-600' : 'text-slate-800'}`}>
                                    {task.daysToComplete} days
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600">Assigned Date:</span>
                                <p className="text-slate-800 mt-1 text-lg">{task.assigned}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Task Description</h3>
                        <p className="text-slate-700 leading-relaxed text-lg">{task.details}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Instructions</h3>
                        <p className="text-slate-700 leading-relaxed text-lg">{task.instructions}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Video Assets</h3>
                        {task.assets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {task.assets.map((asset, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <span className="text-slate-500 text-xl">
                                                {asset.includes('.mp4') ? '🎥' : '📷'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-slate-800">{asset.split('/').pop()}</p>
                                            <p className="text-sm text-slate-500">
                                                {asset.includes('.mp4') ? 'Video File' : 'Image File'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic text-lg">No assets available yet</p>
                        )}
                    </div>

                    {task.status === 'In-Progress' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Upload Completed Video</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Video URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://example.com/video.mp4"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Or Upload Video File
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
                                        >
                                            {ICONS.upload} Choose File
                                        </label>
                                        {uploadedFile && (
                                            <span className="text-sm text-slate-600">
                                                {uploadedFile.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || (!videoUrl && !uploadedFile)}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Video'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-lg font-medium"
                            >
                                ← Back to Tasks
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssignedTasks = () => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <>
            <TaskDetailsPage
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Assigned Tasks</h2>
                    <p className="text-slate-600">Manage and track all your assigned video editing tasks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-white rounded-lg shadow-sm border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-slate-900">{task.id}</h3>
                                <StatusBadge status={task.status} />
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-slate-500">Deadline:</span>
                                    <p className={`text-sm font-semibold ${task.deadline === 'In 2 days' ? 'text-red-600' : 'text-slate-800'}`}>
                                        {task.deadline}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleViewDetails(task)}
                                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AssignedTasks;
