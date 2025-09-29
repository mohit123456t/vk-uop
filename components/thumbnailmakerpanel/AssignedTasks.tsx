import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AssignedTasks = ({ userProfile, onTaskClick }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile?.email) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Real-time listener for tasks
        const tasksQuery = query(
            collection(db, 'thumbnail_tasks'),
            where('thumbnailMaker', '==', userProfile.email)
        );

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Ensure dates are correctly parsed
                assignedAt: doc.data().assignedAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            
            // Sort by assigned date, most recent first
            tasksData.sort((a, b) => (b.assignedAt?.getTime() || 0) - (a.assignedAt?.getTime() || 0));
            
            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching real-time tasks:", error);
            setTasks([]);
            setLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();

    }, [userProfile?.email]);

    const getStatusChipStyle = (status) => {
        switch (status) {
            case 'Pending':
            case 'Assigned':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Revision':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-lg p-6 border-b text-slate-800">All Assigned Tasks</h3>
            {loading ? (
                <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="p-6 text-center">
                    <p className="text-slate-600">No tasks have been assigned to you yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Video Title</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Assigned Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{task.videoTitle}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onTaskClick(task)} className="font-medium text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AssignedTasks;
