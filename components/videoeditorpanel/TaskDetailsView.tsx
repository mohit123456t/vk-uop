import React from 'react';
import { ICONS } from '../../constants';

const TaskDetailsView = ({ onBack }) => {
    // Mock data for task details
    const taskDetails = {
        id: 'V015',
        campaign: 'Summer Glow',
        status: 'In-Progress',
        progress: 60,
        assigned: '2024-01-08',
        deadline: 'In 2 days',
        description: 'Edit makeup tutorial video with transitions and effects',
        requirements: [
            'Add smooth transitions between clips',
            'Include brand overlays and call-to-action',
            'Ensure HD quality (1080p minimum)',
            'Add background music and voiceover',
            'Review for any artifacts before submission'
        ],
        assets: [
            { name: 'Raw footage - Makeup Tutorial.mp4', size: '245 MB', uploaded: '2024-01-08' },
            { name: 'Brand Assets.zip', size: '15 MB', uploaded: '2024-01-08' },
            { name: 'Voiceover Script.pdf', size: '2 MB', uploaded: '2024-01-08' }
        ],
        comments: [
            { user: 'Admin', message: 'Please ensure the transitions are smooth and professional', time: '2024-01-08 10:30 AM' },
            { user: 'Priya', message: 'Working on the transitions now', time: '2024-01-08 11:15 AM' }
        ]
    };

    const StatusBadge = ({ status }) => {
        const statusClasses = {
            "Pending Footage": "bg-slate-200 text-slate-800",
            "In-Progress": "bg-blue-100 text-blue-800",
            "Submitted": "bg-yellow-100 text-yellow-800",
            "Approved": "bg-green-100 text-green-800",
        };
        return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-800 mb-2">
                        <span className="mr-2">{ICONS.arrowLeft}</span>
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Task Details</h1>
                    <p className="text-slate-600">Complete information about your assigned task</p>
                </div>
                <div className="text-right">
                    <StatusBadge status={taskDetails.status} />
                    <p className="text-sm text-slate-500 mt-1">Progress: {taskDetails.progress}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Task Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Task ID</p>
                                <p className="text-lg font-semibold text-slate-800">{taskDetails.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Campaign</p>
                                <p className="text-lg font-semibold text-slate-800">{taskDetails.campaign}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Assigned Date</p>
                                <p className="text-lg font-semibold text-slate-800">{taskDetails.assigned}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Deadline</p>
                                <p className={`text-lg font-semibold ${taskDetails.deadline === 'In 2 days' ? 'text-red-600' : 'text-slate-800'}`}>
                                    {taskDetails.deadline}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Task Description</h3>
                        <p className="text-slate-600 leading-relaxed">{taskDetails.description}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Requirements</h3>
                        <ul className="space-y-3">
                            {taskDetails.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1">{ICONS.checkCircle}</span>
                                    <span className="text-slate-600">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Available Assets</h3>
                        <div className="space-y-3">
                            {taskDetails.assets.map((asset, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-slate-400 mr-3">{ICONS.file}</span>
                                        <div>
                                            <p className="font-medium text-slate-800">{asset.name}</p>
                                            <p className="text-sm text-slate-500">{asset.size} • Uploaded {asset.uploaded}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-600 hover:text-slate-800">
                                        <span>{ICONS.download}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Progress Tracker</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Overall Progress</span>
                                    <span className="font-medium text-slate-800">{taskDetails.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div className="bg-slate-600 h-3 rounded-full" style={{ width: `${taskDetails.progress}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-600">Raw footage downloaded</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-600">Initial editing completed</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-600">Adding transitions</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-slate-300 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-600">Final review pending</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Comments & Updates</h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {taskDetails.comments.map((comment, index) => (
                                <div key={index} className="border-l-2 border-slate-200 pl-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-medium text-slate-800">{comment.user}</p>
                                        <p className="text-xs text-slate-500">{comment.time}</p>
                                    </div>
                                    <p className="text-sm text-slate-600">{comment.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <textarea
                                placeholder="Add a comment..."
                                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
                                rows={3}
                            ></textarea>
                            <button className="mt-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                Post Comment
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                <span className="mr-2">{ICONS.scissors}</span>
                                Open Editor
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="mr-2">{ICONS.upload}</span>
                                Submit for Review
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="mr-2">{ICONS.message}</span>
                                Request Extension
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsView;
