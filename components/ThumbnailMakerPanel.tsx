import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '@/constants.tsx';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import authService from '../services/authService';

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
    const [userProfile, setUserProfile] = useState<any>(null);

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

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setUserProfile(authState.userProfile);
                fetchTasks(authState.userProfile.email);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchTasks = async (userEmail: string) => {
        try {
            setLoading(true);

            // Fetch thumbnail tasks assigned to current user
            const tasksQuery = query(
                collection(db, 'thumbnail_tasks'),
                where('assignedTo', '==', userEmail),
                orderBy('deadline', 'asc')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasksData = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Separate pending and completed tasks
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTask || !uploadedFile) {
            alert('Please select a task and upload a file.');
            return;
        }
        // Here you can handle the submission, e.g., upload to server
        console.log('Submitting thumbnail for task:', selectedTask, 'File:', uploadedFile);
        alert('Thumbnail submitted successfully!');
        setSelectedTask('');
        setUploadedFile(null);
    };

    const handleViewTask = (task) => {
        setSelectedTaskDetails(task);
        setShowTaskModal(true);
    };

    const handleDownloadAsset = (asset) => {
        // Simulate download
        alert(`Downloading ${asset.name}`);
    };

    const handleSubmitTask = (taskId) => {
        // Handle task submission
        alert(`Task ${taskId} submitted successfully!`);
        setShowTaskModal(false);
    };

    const renderView = () => {
        switch (activeView) {
            case 'communication':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="mr-2 animate-bounce">💬</span>
                                Communication Hub
                            </h2>
                        </div>

                        {/* Communication Channels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="text-center card-glow" delay={100}>
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">👨‍💼</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Admin</h3>
                                <p className="text-sm text-gray-600 mb-4">System administrator and support</p>
                                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    Start Chat
                                </button>
                            </Card>

                            <Card className="text-center card-glow" delay={200}>
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🏢</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Brand</h3>
                                <p className="text-sm text-gray-600 mb-4">Brand managers and clients</p>
                                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    Start Chat
                                </button>
                            </Card>

                            <Card className="text-center card-glow" delay={300}>
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🎬</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Video Editor</h3>
                                <p className="text-sm text-gray-600 mb-4">Video editing team</p>
                                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    Start Chat
                                </button>
                                <p className="text-sm text-gray-600 mb-4">Content writing team</p>
                                <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    Start Chat
                                </button>
                            </Card>
                        </div>

                        {/* Recent Conversations */}
                        <Card>
                            <h3 className="font-bold text-lg mb-4">Recent Conversations</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-sm">👨‍💼</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Admin Support</p>
                                            <p className="text-sm text-gray-600">Last message: 2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
                                        <button className="text-blue-600 hover:text-blue-800">Continue</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-sm">🏢</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Brand Manager - Summer Sale</p>
                                            <p className="text-sm text-gray-600">Last message: 1 day ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Away</span>
                                        <button className="text-blue-600 hover:text-blue-800">Continue</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-sm">🎬</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Video Editor Team</p>
                                            <p className="text-sm text-gray-600">Last message: 3 days ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Offline</span>
                                        <button className="text-blue-600 hover:text-blue-800">Continue</button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-l-4 border-blue-500">
                            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">📞</span>
                                        <div>
                                            <p className="font-medium">Schedule Meeting</p>
                                            <p className="text-sm text-gray-600">Book a call with any team member</p>
                                        </div>
                                    </div>
                                </button>
                                <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">📋</span>
                                        <div>
                                            <p className="font-medium">Share Project</p>
                                            <p className="text-sm text-gray-600">Share your work with the team</p>
                                        </div>
                                    </div>
                                </button>
                                <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">🆘</span>
                                        <div>
                                            <p className="font-medium">Get Help</p>
                                            <p className="text-sm text-gray-600">Contact support for assistance</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </Card>
                    </div>
                );
            case 'my-tasks':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="mr-2 animate-bounce">📋</span>
                                My Tasks
                            </h2>
                        </div>

                        {/* Simple Task Cards */}
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="text-slate-400 mb-4">
                                    <span className="text-4xl">⏳</span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Tasks...</h3>
                                <p className="text-slate-600">Please wait while we fetch your tasks</p>
                            </div>
                        ) : [...pendingTasks, ...completedTasks].length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-slate-400 mb-4">
                                    <span className="text-4xl">📋</span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
                                <p className="text-slate-600">No tasks available at the moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...pendingTasks, ...completedTasks].map((task: any, index: number) => (
                                    <div key={task.id}>
                                        <Card className="card-glow" delay={index * 100}>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800">{task.id || task.reelId}</h3>
                                                        <p className="text-sm text-gray-600">{task.campaignName || task.campaign}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Deadline:</span>
                                                        <span className="text-sm font-medium text-red-600">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Payment:</span>
                                                        <span className="text-sm font-medium text-gray-800">{task.payment || '₹0'}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleViewTask(task)}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 btn-hover-effect font-medium"
                                                >
                                                    View Details
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
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="mr-2 animate-bounce">💰</span>
                                Your Earnings
                            </h2>
                        </div>

                        {/* Monthly Earnings Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="text-center card-glow" delay={100}>
                                <h3 className="font-bold text-lg mb-2">Total Earnings</h3>
                                <p className="text-3xl font-bold text-green-600">₹850.00</p>
                                <p className="text-sm text-gray-600">This month</p>
                            </Card>
                            <Card className="text-center card-glow" delay={200}>
                                <h3 className="font-bold text-lg mb-2">Monthly Salary</h3>
                                <p className="text-3xl font-bold text-blue-600">₹2,500.00</p>
                                <p className="text-sm text-gray-600">Base salary</p>
                            </Card>
                            <Card className="text-center card-glow" delay={300}>
                                <h3 className="font-bold text-lg mb-2">Total This Month</h3>
                                <p className="text-3xl font-bold text-purple-600">₹3,350.00</p>
                                <p className="text-sm text-gray-600">Salary + Earnings</p>
                            </Card>
                        </div>



                        {/* Cash Out Section */}
                        <Card className="border-l-4 border-green-500">
                            <h3 className="font-bold text-lg mb-4">Cash Out</h3>
                            <p className="text-gray-600 mb-4">Withdraw your earnings to your bank account</p>
                            <div className="flex space-x-3">
                                <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    Cash Out Now
                                </button>
                                <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300">
                                    View History
                                </button>
                            </div>
                        </Card>
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="mr-2 animate-bounce">👤</span>
                                My Profile
                            </h2>
                        </div>

                        {/* Profile Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="text-center card-glow" delay={100}>
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-white">{profile.name.charAt(0)}</span>
                                </div>
                                <h3 className="font-bold text-lg">{profile.name}</h3>
                                <p className="text-sm text-gray-600">Thumbnail Maker</p>
                            </Card>
                            <Card className="text-center card-glow" delay={200}>
                                <h3 className="font-bold text-lg mb-2">Skills</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {profile.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                            <Card className="text-center card-glow" delay={300}>
                                <h3 className="font-bold text-lg mb-2">Status</h3>
                                <div className="flex items-center justify-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        profile.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {profile.active ? '🟢 Active' : '🔴 Inactive'}
                                    </span>
                                </div>
                            </Card>
                        </div>

                        {/* Basic Profile Information */}
                        <Card>
                            <h3 className="font-bold text-lg mb-4">Profile Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <p className="text-lg text-gray-900">vikas.g@example.com</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                        <p className="text-lg font-mono text-gray-900">TM-2024-001</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <p className="text-lg font-semibold text-indigo-600">Thumbnail Maker</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            profile.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {profile.active ? '🟢 Active' : '🔴 Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                                        <p className="text-lg text-gray-900">January 2024</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Account Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <h3 className="font-bold text-lg mb-4">Account Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member Since</span>
                                        <span className="font-medium">January 2024</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Tasks</span>
                                        <span className="font-medium">4</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Success Rate</span>
                                        <span className="font-medium text-green-600">100%</span>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <span className="font-medium">📊 View Performance</span>
                                        <p className="text-xs text-gray-500">Check your work statistics</p>
                                    </button>
                                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <span className="font-medium">💳 Payment Settings</span>
                                        <p className="text-xs text-gray-500">Manage payment methods</p>
                                    </button>
                                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <span className="font-medium">🆘 Help & Support</span>
                                        <p className="text-xs text-gray-500">Get help and contact support</p>
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <span className="mr-2 animate-bounce">📊</span>
                                Dashboard Overview
                            </h2>
                            <div className="flex space-x-3">
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-medium">
                                    🔄 Refresh Tasks
                                </button>
                            </div>
                        </div>

                        {/* Task Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="text-center card-glow" delay={100}>
                                <div className="text-2xl font-bold text-blue-600 animate-pulse">{pendingTasks.length + completedTasks.length}</div>
                                <div className="text-sm text-gray-600">Total Tasks</div>
                            </Card>
                            <Card className="text-center card-glow" delay={200}>
                                <div className="text-2xl font-bold text-orange-600 animate-bounce">{pendingTasks.length}</div>
                                <div className="text-sm text-gray-600">Pending Tasks</div>
                            </Card>
                            <Card className="text-center card-glow" delay={300}>
                                <div className="text-2xl font-bold text-green-600 animate-pulse">{completedTasks.length}</div>
                                <div className="text-sm text-gray-600">Completed Tasks</div>
                            </Card>
                            <Card className="text-center card-glow" delay={400}>
                                <div className="text-2xl font-bold text-purple-600 animate-pulse">{pendingTasks.filter(t => t.deadline === '2024-01-15').length}</div>
                                <div className="text-sm text-gray-600">Today Assigned</div>
                            </Card>
                        </div>


                    </div>
                );
        }
    };

    // Task Details Modal Component
    const TaskDetailsModal = ({ task, isOpen, onClose }) => {
        if (!isOpen || !task) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">{task.reelId}</h2>
                                <p className="text-indigo-100">{task.campaign}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Task Description */}
                        <Card className="border-l-4 border-indigo-500">
                            <h3 className="font-bold text-lg mb-3 flex items-center">
                                <span className="mr-2">📝</span>
                                Task Description
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{task.description}</p>
                        </Card>

                        {/* Task Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <h4 className="font-semibold text-gray-800 mb-2">Deadline</h4>
                                <p className="text-lg font-bold text-red-600">{task.deadline}</p>
                            </Card>
                            <Card>
                                <h4 className="font-semibold text-gray-800 mb-2">Status</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {task.status}
                                </span>
                            </Card>
                        </div>

                        {/* Requirements */}
                        <Card>
                            <h3 className="font-bold text-lg mb-3 flex items-center">
                                <span className="mr-2">✅</span>
                                Requirements
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {task.requirements.map((req, index) => (
                                    <div key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                        <span className="text-gray-700">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Assets Section */}
                        <Card>
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <span className="mr-2">📁</span>
                                Assets ({task.assets.length})
                            </h3>
                            <div className="space-y-3">
                                {task.assets.map((asset, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                                {asset.type === 'image' && <span>🖼️</span>}
                                                {asset.type === 'video' && <span>🎥</span>}
                                                {asset.type === 'document' && <span>📄</span>}
                                                {asset.type === 'design' && <span>🎨</span>}
                                                {asset.type === 'archive' && <span>📦</span>}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{asset.name}</p>
                                                <p className="text-sm text-gray-500">{asset.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadAsset(asset)}
                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 btn-hover-effect"
                                        >
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Submission Form */}
                        {task.status !== 'Completed' && (
                            <Card className="border-l-4 border-green-500">
                                <h3 className="font-bold text-lg mb-4 flex items-center">
                                    <span className="mr-2">🚀</span>
                                    Submit Your Work
                                </h3>
                                <form onSubmit={(e) => { e.preventDefault(); handleSubmitTask(task.reelId); }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Your Thumbnail
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Or Provide Work URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="https://example.com/your-work"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Provide a link to your work if uploaded elsewhere</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Comments (Optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Add any comments about your submission..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 btn-hover-effect font-medium shadow-lg"
                                    >
                                        Submit Task
                                    </button>
                                </form>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 font-sans text-slate-800 animate-fadeIn">
            <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col no-scrollbar">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
                    <Logo />
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} active={activeView === item.id} onClick={() => setActiveView(item.id)} />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
                    <button onClick={() => navigate('/')} className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">Thumbnail Maker Panel</h1>
                    <div className="font-semibold">Vikas G.</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
            </div>

            {/* Task Details Modal */}
            <TaskDetailsModal
                task={selectedTaskDetails}
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
            />
        </div>
    );
};

export default ThumbnailMakerPanel;
