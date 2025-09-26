import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import DashboardView from './scriptwriterpanel/DashboardView';
import TasksView from './scriptwriterpanel/TasksView';
import PaymentsView from './scriptwriterpanel/PaymentsView';
import ProfileView from './scriptwriterpanel/ProfileView';
import CollaborationView from './scriptwriterpanel/CollaborationView';
import { ICONS } from '../constants';

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${!label ? 'justify-center' : ''}`}
        aria-label={label || 'Sidebar item'}
        tabIndex={0}
    >
        <span className="mr-3">{icon}</span>
        {label ? <span>{label}</span> : null}
    </button>
);

const ScriptWriterPanel = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [activeView, setActiveView] = useState(() => localStorage.getItem('scriptWriterActiveView') || 'dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                if (state.userProfile.role === 'script_writer') {
                    setUserProfile(state.userProfile);
                }
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        localStorage.setItem('scriptWriterActiveView', activeView);
    }, [activeView]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView userProfile={userProfile} />;
            case 'tasks':
                return <TasksView userProfile={userProfile} />;
            case 'payments':
                return <PaymentsView userProfile={userProfile} />;
            case 'profile':
                return <ProfileView userProfile={userProfile} />;
            case 'collaboration':
                return <CollaborationView userProfile={userProfile} />;
            default:
                return <DashboardView userProfile={userProfile} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white">
            <aside className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col flex-shrink-0`}>
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className={`font-bold text-lg ${sidebarCollapsed ? 'hidden' : 'block'}`}>Script Writer</h2>
                        <button
                            onClick={() => setSidebarCollapsed(p => !p)}
                            className="text-slate-400 hover:text-white p-1"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? ICONS.menu : ICONS.x}
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        icon={ICONS.chart}
                        label="Dashboard"
                        active={activeView === 'dashboard'}
                        onClick={() => setActiveView('dashboard')}
                    />
                    <NavItem
                        icon={ICONS.clipboard}
                        label="Tasks"
                        active={activeView === 'tasks'}
                        onClick={() => setActiveView('tasks')}
                    />
                    <NavItem
                        icon={ICONS.money}
                        label="Payments"
                        active={activeView === 'payments'}
                        onClick={() => setActiveView('payments')}
                    />
                    <NavItem
                        icon={ICONS.users}
                        label="Profile"
                        active={activeView === 'profile'}
                        onClick={() => setActiveView('profile')}
                    />
                    <NavItem
                        icon={ICONS.message}
                        label="Collaboration"
                        active={activeView === 'collaboration'}
                        onClick={() => setActiveView('collaboration')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace('_', ' ')}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-600">
                            {userProfile?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</div>
            </main>
        </div>
    );
};

export default ScriptWriterPanel;
