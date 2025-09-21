import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const mockTasks = [];

const StatusBadge = ({ status }) => {
    const statusClasses = {
        "Pending": "bg-slate-200 text-slate-800",
        "In Progress": "bg-blue-100 text-blue-800",
        "Needs Revision": "bg-yellow-100 text-yellow-800",
        "Approved": "bg-green-100 text-green-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const ScriptEditorModal = ({ task, onClose }) => {
    const [scriptContent, setScriptContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setScriptContent(task.scriptContent || '');
        }
    }, [task]);

    const handleSaveDraft = async () => {
        if (!task) return;

        setSaving(true);
        try {
            const taskRef = doc(db, 'script_tasks', task.id);
            await updateDoc(taskRef, {
                scriptContent: scriptContent,
                status: 'In Progress',
                updatedAt: new Date().toISOString()
            });
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Error saving draft. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!task || !scriptContent.trim()) {
            alert('Please write a script before submitting.');
            return;
        }

        setSaving(true);
        try {
            const taskRef = doc(db, 'script_tasks', task.id);
            await updateDoc(taskRef, {
                scriptContent: scriptContent,
                status: 'Pending Review',
                submittedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            alert('Script submitted for review successfully!');
            onClose();
        } catch (error) {
            console.error('Error submitting script:', error);
            alert('Error submitting script. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!task) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Script Editor: {task.id}</h2>
                    <button onClick={onClose} disabled={saving}>{ICONS.xCircle}</button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/3 p-6 border-r overflow-y-auto space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Brand Brief</h3>
                            <p className="text-sm text-slate-600">{task.brief || task.description || 'No brief available'}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Tone of Voice</h3>
                            <p className="text-sm text-slate-600">{task.tone || 'Professional'}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Keywords/Hashtags</h3>
                            <div className="flex flex-wrap gap-1">
                                {(task.keywords || task.keywordsString || '').split(', ').map((k: string) =>
                                    k.trim() ? <span key={k} className="bg-slate-200 text-xs px-2 py-0.5 rounded">{k}</span> : null
                                )}
                            </div>
                        </div>
                        {task.comments && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h3 className="font-bold text-yellow-800 mb-2">Revision Comments</h3>
                                <p className="text-sm text-yellow-700">{task.comments}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Deadline</h3>
                            <p className="text-sm text-slate-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                        </div>
                    </div>
                    <div className="w-2/3 p-6 flex flex-col">
                        <textarea
                            placeholder="Start writing your viral script here..."
                            className="w-full flex-1 p-4 border rounded-md resize-none"
                            value={scriptContent}
                            onChange={(e) => setScriptContent(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleSubmitForReview}
                        disabled={saving || !scriptContent.trim()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                    >
                        {saving ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TasksView = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const filters = ['All', 'Pending', 'In Progress', 'Needs Revision', 'Approved'];

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const tasksQuery = query(
                collection(db, 'script_tasks'),
                where('assignedTo', '==', 'rahul.k@example.com'), // Replace with actual user email
                orderBy('deadline', 'asc')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = activeFilter === 'All' ? tasks : tasks.filter((t: any) => t.status === activeFilter);
    
    const handleOpenModal = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
            <div className="p-4 border-b">
                 <h3 className="font-bold text-lg text-slate-800 mb-2">Script Library & Tasks</h3>
                 <div className="flex space-x-1">
                    {filters.map(filter => (
                        <button key={filter} onClick={() => setActiveFilter(filter)} 
                            className={`px-3 py-1 text-sm font-medium rounded-md ${activeFilter === filter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {filter}
                        </button>
                    ))}
                 </div>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Tasks...</h3>
                        <p className="text-slate-600">Please wait while we fetch your tasks</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
                        <p className="text-slate-600">No tasks match your current filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task: any) => (
                            <div key={task.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800">{task.id}</h4>
                                    <StatusBadge status={task.status} />
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{task.campaignName || task.campaign}</p>
                                <p className="text-xs text-slate-500 mb-2">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                                <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && <ScriptEditorModal task={selectedTask} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default TasksView;
