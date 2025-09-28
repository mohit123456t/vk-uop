import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';

const TaskDetailView = ({ task, onBack, userProfile }) => {
    const [currentTask, setCurrentTask] = useState(task);
    const [status, setStatus] = useState(task.status);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // If you need to fetch latest task details, you can do it here.
        // For now, we work with the passed task prop.
        setCurrentTask(task);
        setStatus(task.status);
    }, [task]);

    const handleUpdateTask = async () => {
        if (!currentTask?.id) return;
        setLoading(true);
        setError('');
        try {
            const taskRef = doc(db, 'thumbnail_tasks', currentTask.id);
            const updateData:any = {
                status: status,
                lastUpdatedAt: serverTimestamp(),
            };

            await updateDoc(taskRef, updateData);

            // Optionally, add a history record or a note
            if (notes) {
                // Logic to add notes/history if collection exists
            }
            
            // Refresh task data locally
            const updatedTaskDoc = await getDoc(taskRef);
            if (updatedTaskDoc.exists()) {
                setCurrentTask({ id: updatedTaskDoc.id, ...updatedTaskDoc.data() });
            }

        } catch (err) {
            console.error("Error updating task:", err);
            setError('Failed to update the task. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFileUpload = () => {
        // Placeholder for file upload logic
        alert("File upload functionality to be implemented.");
    }

    if (!currentTask) {
        return <div className="p-6">No task selected. Go back to the dashboard to select a task.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-4">
                {ICONS.arrowLeft} 
                <span className="ml-2">Back to Dashboard</span>
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{currentTask.videoTitle}</h1>
                    <p className="text-slate-500 mt-1">Task ID: {currentTask.id}</p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800`}>
                    {currentTask.status}
                </span>
            </div>

            <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800 mb-2">Task Details</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{currentTask.description || 'No description provided.'}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-slate-800 mb-2">Update Status</h3>
                         <select 
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Revision">Needs Revision</option>
                        </select>
                    </div>
                    <div>
                         <h3 className="font-semibold text-lg text-slate-800 mb-2">Add a Note</h3>
                         <textarea 
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            placeholder='Add a comment or update for the team...'
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleUpdateTask}
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                         <button 
                            onClick={handleFileUpload}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                        >
                            Upload Thumbnail
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Task Info</h3>
                    <div className="text-sm">
                        <p className="font-medium text-slate-500">Assigned On</p>
                        <p className="text-slate-900 font-semibold">{currentTask.assignedAt ? new Date(currentTask.assignedAt.toMillis()).toLocaleString() : 'N/A'}</p>
                    </div>
                     <div className="text-sm">
                        <p className="font-medium text-slate-500">Last Updated</p>
                        <p className="text-slate-900 font-semibold">{currentTask.lastUpdatedAt ? new Date(currentTask.lastUpdatedAt.toMillis()).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailView;
