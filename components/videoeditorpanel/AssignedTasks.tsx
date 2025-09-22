
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { firestore as db, storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import authService from '../../services/authService';

const StatusBadge = ({ status }) => {
    const statusClasses = {
        "Pending": "bg-gray-200 text-gray-800",
        "In-Progress": "bg-blue-100 text-blue-800",
        "Submitted": "bg-yellow-100 text-yellow-800",
        "Approved": "bg-green-100 text-green-800",
        "Completed": "bg-green-100 text-green-800",
        "Needs-Revision": "bg-red-100 text-red-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status] || 'bg-gray-200'}`}>{status}</span>;
};

const TaskDetailsModal = ({ task, isOpen, onClose, onTaskUpdate }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !task) return null;

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!videoUrl && !uploadedFile) {
            setError('Please provide either a video URL or upload a file.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            let submissionUrl = videoUrl;
            if (uploadedFile) {
                const fileRef = ref(storage, `submissions/${task.id}/${uploadedFile.name}`);
                const snapshot = await uploadBytes(fileRef, uploadedFile);
                submissionUrl = await getDownloadURL(snapshot.ref);
            }

            const taskDocRef = doc(db, 'video_edit_tasks', task.id);
            await updateDoc(taskDocRef, {
                status: 'Submitted',
                submissionUrl: submissionUrl,
                submittedAt: new Date().toISOString(),
            });
            
            onTaskUpdate(task.id, { 
                status: 'Submitted', 
                submissionUrl: submissionUrl,
                submittedAt: new Date().toISOString(),
            });
            alert('Video submitted successfully!');
            onClose();
        } catch (err) {
            console.error("Submission error: ", err);
            setError('Failed to submit video. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{task.reelId}</h2>
                            <p className="text-slate-500">{task.campaignName}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <label className="text-sm text-slate-500">Status</label>
                            <p><StatusBadge status={task.status} /></p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <label className="text-sm text-slate-500">Deadline</label>
                            <p className="font-semibold text-red-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{task.instructions || 'No instructions provided.'}</p>
                    </div>

                    {task.assets && task.assets.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Assets</h3>
                            <div className="space-y-2">
                                {task.assets.map((asset, index) => (
                                    <a href={asset.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <ICONS.link className="w-5 h-5 text-blue-500" />
                                        <span className="text-blue-600 font-medium truncate">{asset.name || 'Downloadable Asset'}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {(task.status === 'In-Progress' || task.status === 'Needs-Revision') && (
                        <div className="pt-4 border-t">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Submit Your Work</h3>
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Video URL</label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://example.com/video.mp4"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="text-center my-2 text-sm text-slate-500">OR</div>
                                <div>
                                     <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                                    <input
                                        type="file"
                                        accept="video/*,image/*"
                                        onChange={handleFileUpload}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    {uploadedFile && <span className="text-sm text-slate-600 mt-2 block">Selected: {uploadedFile.name}</span>}
                                </div>

                                <div className="text-right pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors font-medium"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Task'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                fetchTasks(authState.userProfile.email);
            } else {
                setLoading(false);
                setError('User not authenticated.');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchTasks = async (userEmail) => {
        setLoading(true);
        try {
            const q = query(collection(db, 'video_edit_tasks'), where('assignedTo', '==', userEmail));
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (err) {
            console.error("Error fetching tasks: ", err);
            setError('Failed to fetch tasks.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleTaskUpdate = (taskId, updatedData) => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId ? { ...task, ...updatedData } : task
        ));
    };

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    if (loading) return <div className="text-center p-10">Loading tasks...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <TaskDetailsModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onTaskUpdate={handleTaskUpdate}
            />
            <div className="p-6 space-y-6 animate-fadeIn">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-1">Assigned Tasks</h2>
                    <p className="text-slate-600">Manage and track all your assigned video editing tasks.</p>
                </div>

                {tasks.length === 0 ? (
                     <div className="text-center py-12">
                        <div className="text-slate-400 mb-4"><ICONS.clipboard className="h-12 w-12 mx-auto" /></div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tasks Found</h3>
                        <p className="text-slate-600">You have no assigned tasks at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-slate-200/80 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-md font-bold text-slate-800 truncate pr-4">{task.reelId}</h3>
                                    <StatusBadge status={task.status} />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-slate-500">Campaign: {task.campaignName}</p>
                                        <p className="text-sm text-slate-500">Deadline: <span className="font-medium text-red-500">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span></p>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(task)}
                                        className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        View & Submit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AssignedTasks;
