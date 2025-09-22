import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '@/constants';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import authService, { UserProfile } from '../services/authService';
import ProfileView from './thumbnailmakerpanel/ProfileView';
import EarningsView from './thumbnailmakerpanel/EarningsView';
import CommunicationView from './thumbnailmakerpanel/CommunicationView';

const NavItem = ({ icon, label, active, onClick, ...props }) => (
    <button
        {...props}
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
            active
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
        }`}
    >
        <span className="mr-3 transition-transform duration-200 group-hover:scale-110">{icon}</span>
        <span className="relative">
            {label}
            {active && (
                <span className="absolute -left-2 top-0 w-1 h-full bg-white rounded-full animate-pulse"></span>
            )}
        </span>
    </button>
);

const Card = ({ children, className = '', delay = 0 }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-slate-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 animate-fadeIn ${className}`} style={{animationDelay: `${delay}ms`}}>
        <div className="animate-slideUp">
            {children}
        </div>
    </div>
);

const ThumbnailMakerPanel = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTask, setSelectedTask] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'my-tasks', label: 'My Tasks', icon: ICONS.clipboard },
        { id: 'communication', label: 'Communication', icon: ICONS.message },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
        { id: 'profile', label: 'Profile', icon: ICONS.users },
    ];

    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await authService.signOutUser();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out:", error);
            alert('Logout failed. Please try again.');
        }
    };

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                 if (authState.userProfile.isActive === false) {
                    authService.signOutUser();
                    navigate('/login');
                    alert('Your account has been deactivated. Please contact an administrator.');
                } else if (authState.userProfile.role === 'thumbnail_maker') {
                    setUserProfile(authState.userProfile);
                    fetchTasks(authState.userProfile.email);
                } else {
                    // If the user is not a thumbnail maker, log them out and redirect
                    authService.signOutUser();
                    navigate('/login');
                    alert('Access denied. Please login with the correct account.');
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchTasks = async (userEmail: string) => {
        try {
            setLoading(true);
            const tasksQuery = query(
                collection(db, 'thumbnail_tasks'),
                where('assignedTo', '==', userEmail),
                orderBy('deadline', 'asc')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const pending = tasksData.filter((task: any) => task.status !== 'completed');
            const completed = tasksData.filter((task: any) => task.status === 'completed');
            setPendingTasks(pending);
            setCompletedTasks(completed);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTask = (task) => {
        setSelectedTaskDetails(task);
        setShowTaskModal(true);
    };

    const handleDownloadAsset = (asset) => {
        alert(`Downloading ${asset.name}`);
    };

    const handleSubmitTask = (taskId) => {
        alert(`Task ${taskId} submitted successfully!`);
        setShowTaskModal(false);
    };

    const renderView = () => {
        switch (activeView) {
            case 'communication':
                return <CommunicationView />;
            case 'my-tasks':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center"><span className="mr-2 animate-bounce">📋</span>My Tasks</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-8">Loading tasks...</div>
                        ) : [...pendingTasks, ...completedTasks].length === 0 ? (
                            <div className="text-center py-12">No tasks assigned yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...pendingTasks, ...completedTasks].map((task: any, index: number) => (
                                    <div key={task.id}>
                                        <Card className="card-glow" delay={index * 100}>
                                          <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-800">{task.name}</h4>
                                                    <p className="text-sm text-slate-500">{task.campaignName}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                                            </div>
                                            <div className="mt-4">
                                                <button onClick={() => handleViewTask(task)} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                                    View Task
                                                </button>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            case 'dashboard':
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center"><span className="mr-2 animate-bounce">📊</span>Dashboard Overview</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <h3 className="text-lg font-semibold text-slate-800">Pending Tasks</h3>
                                <p className="text-3xl font-bold text-indigo-600">{pendingTasks.length}</p>
                            </Card>
                            <Card>
                                <h3 className="text-lg font-semibold text-slate-800">Completed Tasks</h3>
                                <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
                            </Card>
                            <Card>
                                <h3 className="text-lg font-semibold text-slate-800">Total Earnings</h3>
                                <p className="text-3xl font-bold text-amber-600">₹... </p>
                            </Card>
                            <Card>
                                <h3 className="text-lg font-semibold text-slate-800">Your Rating</h3>
                                <p className="text-3xl font-bold text-blue-600">.../5</p>
                            </Card>
                        </div>
                    </div>
                );
        }
    };

    const TaskDetailsModal = ({ task, isOpen, onClose }) => {
        if (!isOpen || !task) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slideUp">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-xl font-bold text-slate-800">{task.name}</h3>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {/* ... modal content ... */}
                    </div>
                    <div className="p-4 border-t flex justify-end">
                        <button onClick={onClose} className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg mr-2">Cancel</button>
                        <button onClick={() => handleSubmitTask(task.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg" disabled={!uploadedFile}>Submit Task</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 font-sans text-slate-800 animate-fadeIn">
            <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col no-scrollbar">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0"><Logo /></div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} active={activeView === item.id} onClick={() => setActiveView(item.id)} />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
            <TaskDetailsModal task={selectedTaskDetails} isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} />
        </div>
    );
};

export default ThumbnailMakerPanel;
