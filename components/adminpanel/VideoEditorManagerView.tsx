import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const VideoEditorManagerView = () => {
    const [videoEditors, setVideoEditors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideoEditors = async () => {
            const querySnapshot = await getDocs(collection(db, 'videoEditors'));
            const data = [];
            querySnapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setVideoEditors(data);
            setLoading(false);
        };
        fetchVideoEditors();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading video editors...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Video Editor Manager</h1>
                <p className="text-slate-600">Manage and monitor video editor performance and assignments</p>
            </div>

            {videoEditors.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Video Editors Found</h3>
                    <p className="text-slate-500">Add video editors to start managing their activities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoEditors.map(editor => (
                        <div key={editor.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-red-600 font-semibold text-sm">
                                            {editor.name?.charAt(0)?.toUpperCase() || 'V'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{editor.name || 'Unnamed Video Editor'}</h3>
                                        <p className="text-sm text-slate-500">ID: {editor.id.slice(-6)}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    editor.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    editor.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {editor.status || 'Active'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{editor.assignedCampaigns || 0}</div>
                                    <div className="text-xs text-slate-500">Assigned Campaigns</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{editor.videosEdited || 0}</div>
                                    <div className="text-xs text-slate-500">Videos Edited</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{editor.pending || 0}</div>
                                    <div className="text-xs text-slate-500">Pending</div>
                                </div>
                            </div>

                            <div className="text-sm text-slate-600 mb-4">
                                <strong>Last Activity:</strong> {editor.lastActivity ? new Date(editor.lastActivity).toLocaleString() : 'Never'}
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    View Details
                                </button>
                                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                                    Assign Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VideoEditorManagerView;
