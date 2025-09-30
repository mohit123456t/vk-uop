import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { ICONS } from '@/constants.tsx';
import authService from '../../services/authService';
import DashboardView from './DashboardView';
import AssignedTasks from './AssignedTasks';
import TaskDetailView from './TaskDetailView';
import CommunicationView from './CommunicationView';
import EarningsView from './EarningsView';
import ProfileView from './ProfileView';

const NavItem = ({ icon, label, active, onClick, index, ...props }) => (
    <button
        {...props}
        onClick={onClick}
        className={`group relative flex items-center w-full text-left px-4 py-3 text-sm font-semibold rounded-lg 
                    transition-all duration-300 ease-in-out transform 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    opacity-0 animate-slideInLeft ${
            active
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
        }`}
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
        <span className={`mr-4 transition-all duration-300 transform ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-slate-600 group-hover:rotate-6'}`}>{icon}</span>
        <span className="flex-1">{label}</span>
        {active && (
             <span className="absolute right-0 h-6 w-1 bg-indigo-600 rounded-l-lg transition-all duration-300"></span>
        )}
    </button>
);


const ThumbnailMakerPanel = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTask, setSelectedTask] = useState(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'my-tasks', label: 'My Tasks', icon: ICONS.clipboard },
        { id: 'communication', label: 'Communication', icon: ICONS.message },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
        { id: 'profile', label: 'Profile', icon: ICONS.users },
    ];

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((currentAuthState) => {
            if (currentAuthState.isAuthenticated && currentAuthState.userProfile) {
                setUserProfile(currentAuthState.userProfile);
            } else {
                setUserProfile(null);
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleBack = () => {
        setSelectedTask(null);
    };

    const renderView = () => {
        if (selectedTask) {
            return <TaskDetailView task={selectedTask} onBack={handleBack} userProfile={userProfile} />;
        }

        switch (activeView) {
            case 'dashboard':
                return <DashboardView userProfile={userProfile} onTaskClick={handleTaskClick} />;
            case 'my-tasks':
                return <AssignedTasks userProfile={userProfile} onTaskClick={handleTaskClick} />;
            case 'communication':
                return <CommunicationView />;
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            default:
                return <DashboardView userProfile={userProfile} onTaskClick={handleTaskClick} />;
        }
    };
    
    const getHeaderText = () => {
        if(selectedTask) {
            return "Task Details";
        }
        const activeItem = navItems.find(item => item.id === activeView);
        return activeItem ? activeItem.label : 'Dashboard';
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col no-scrollbar">
                <div className="h-20 flex items-center px-6 flex-shrink-0">
                    <Logo />
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <NavItem 
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id && !selectedTask} 
                            onClick={() => {setSelectedTask(null); setActiveView(item.id);}}
                            index={index}
                        />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0">
                    <button onClick={() => authService.logout()} className="group flex items-center w-full text-left px-4 py-3 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        <span className="mr-3 text-slate-400 group-hover:text-slate-600">{ICONS.logout}</span>
                        Logout
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{getHeaderText()}</h1>
                    <div className="font-semibold">{userProfile?.name || 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="animate-fadeIn" key={activeView + (selectedTask ? selectedTask.id : '')}>
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThumbnailMakerPanel;