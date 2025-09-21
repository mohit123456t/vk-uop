import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const UploaderManagerView = () => {
    const [uploaders, setUploaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUploaders = async () => {
            const querySnapshot = await getDocs(collection(db, 'uploaders'));
            const uploadersData = [];
            querySnapshot.forEach(doc => {
                uploadersData.push({ id: doc.id, ...doc.data() });
            });
            setUploaders(uploadersData);
            setLoading(false);
        };
        fetchUploaders();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading uploaders...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Uploader Manager</h1>
                <p className="text-slate-600">Manage and monitor uploader performance and assignments</p>
            </div>

            {uploaders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Uploaders Found</h3>
                    <p className="text-slate-500">Add uploaders to start managing their activities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploaders.map(uploader => (
                        <div key={uploader.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {uploader.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{uploader.name || 'Unnamed Uploader'}</h3>
                                        <p className="text-sm text-slate-500">ID: {uploader.id.slice(-6)}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    uploader.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    uploader.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {uploader.status || 'Active'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{uploader.accounts || 0}</div>
                                    <div className="text-xs text-slate-500">Linked Accounts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{uploader.completed || 0}</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{uploader.pending || 0}</div>
                                    <div className="text-xs text-slate-500">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{uploader.failed || 0}</div>
                                    <div className="text-xs text-slate-500">Failed</div>
                                </div>
                            </div>

                            <div className="text-sm text-slate-600 mb-4">
                                <strong>Last Activity:</strong> {uploader.lastActivity ? new Date(uploader.lastActivity).toLocaleString() : 'Never'}
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

export default UploaderManagerView;
