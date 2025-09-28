import React, { useState, useEffect } from 'react';
import authService, { UserProfile } from '../../services/authService';

const ThumbnailMakerManagerView = () => {
    const [thumbnailMakers, setThumbnailMakers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaker, setSelectedMaker] = useState<UserProfile | null>(null);
    const [isAssignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
    const [selectedUserForTask, setSelectedUserForTask] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchThumbnailMakers = async () => {
            setLoading(true);
            try {
                const makers = await authService.getUsersByRole('thumbnail_maker');
                setThumbnailMakers(makers);
            } catch (error) {
                console.error("Failed to fetch thumbnail makers:", error);
            }
            setLoading(false);
        };
        fetchThumbnailMakers();
    }, []);

    const handleViewProfile = (maker: UserProfile) => {
        setSelectedMaker(maker);
    };

    const handleCloseProfile = () => {
        setSelectedMaker(null);
    };

    const handleOpenAssignTaskModal = (user: UserProfile) => {
        setSelectedUserForTask(user);
        setAssignTaskModalOpen(true);
    };

    const handleCloseAssignTaskModal = () => {
        setAssignTaskModalOpen(false);
        setSelectedUserForTask(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900"></div>
                <p className="text-center mt-4 text-lg font-semibold text-slate-700">Loading thumbnail makers...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Thumbnail Maker Manager</h1>
                <p className="text-slate-600">Manage and monitor thumbnail maker performance and assignments</p>
            </div>

            {thumbnailMakers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m5 5v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14-4l-3-3m-7 0l-3 3"></path></svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Thumbnail Makers Found</h3>
                    <p className="text-slate-500">Add thumbnail makers to start managing their activities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbnailMakers.map(maker => (
                        <div key={maker.uid} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-orange-600 font-semibold text-sm">
                                            {maker.name?.charAt(0)?.toUpperCase() || 'T'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{maker.name || 'Unnamed Thumbnail Maker'}</h3>
                                        <p className="text-sm text-slate-500">ID: {maker.uid.slice(-6)}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${maker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {maker.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{maker.assignedTasks || 0}</div>
                                    <div className="text-xs text-slate-500">Assigned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{maker.pendingTasks || 0}</div>
                                    <div className="text-xs text-slate-500">Pending</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{maker.completedTasks || 0}</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                            </div>

                            <div className="text-sm text-slate-600 mb-4">
                                <strong>Last Activity:</strong> {maker.lastLoginAt ? new Date(maker.lastLoginAt).toLocaleString() : 'Never'}
                            </div>

                            <div className="flex space-x-2">
                                <button onClick={() => handleViewProfile(maker)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    View Details
                                </button>
                                <button onClick={() => handleOpenAssignTaskModal(maker)} className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                                    Assign Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMaker && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-50 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transform transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4 border-2 border-white shadow-md">
                                    <span className="text-orange-600 font-bold text-2xl">
                                        {selectedMaker.name?.charAt(0)?.toUpperCase() || 'T'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">{selectedMaker.name}'s Profile</h2>
                                    <p className="text-slate-600">{selectedMaker.role}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseProfile} className="text-slate-500 hover:text-slate-800">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
                                <p className="text-sm font-medium text-slate-500">Assigned Tasks</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{selectedMaker.assignedTasks || 0}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
                                <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-1">{selectedMaker.pendingTasks || 0}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80">
                                <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{selectedMaker.completedTasks || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">User Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-medium text-slate-600">Email:</span>
                                    <span className="text-slate-800 font-mono">{selectedMaker.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-slate-600">Status:</span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedMaker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedMaker.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-slate-600">Last Login:</span>
                                    <span className="text-slate-800">{selectedMaker.lastLoginAt ? new Date(selectedMaker.lastLoginAt).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAssignTaskModalOpen && selectedUserForTask && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Assign Task to {selectedUserForTask.name}</h2>
                        <div className="text-slate-600">
                            <p>Here you will be able to assign a new task from a list of available campaigns or create a new one.</p>
                            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
                                <h4 className="font-bold text-slate-700">Coming Soon!</h4>
                                <p className="text-sm mt-1">The task assignment module is currently under development. Stay tuned!</p>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={handleCloseAssignTaskModal} className="w-auto bg-slate-800 text-white py-2 px-4 rounded-lg hover:bg-slate-900 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThumbnailMakerManagerView;
