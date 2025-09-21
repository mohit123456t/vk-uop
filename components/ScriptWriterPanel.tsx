import React, { useState } from 'react';
import DashboardView from './scriptwriterpanel/DashboardView';
import TasksView from './scriptwriterpanel/TasksView';
import CollaborationView from './scriptwriterpanel/CollaborationView';
import AIAssistanceView from './scriptwriterpanel/AIAssistanceView';
import ContentSubmissionView from './scriptwriterpanel/ContentSubmissionView';
import PaymentsView from './scriptwriterpanel/PaymentsView';
import ProfileView from './scriptwriterpanel/ProfileView';
import { ICONS } from '../constants';

const NavItem = ({ icon, label, active, onClick, ...props }) => (
    <button {...props} onClick={onClick} className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);

const ScriptWriterPanel = () => {
    const [activeView, setActiveView] = useState('dashboard');

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'tasks', label: 'My Tasks', icon: ICONS.clipboard },
        { id: 'collaboration', label: 'Collaboration', icon: ICONS.users },
        { id: 'payments', label: 'Payments', icon: ICONS.currencyRupee },
        { id: 'performance', label: 'Performance', icon: ICONS.trendingUp },
    ];

    const secondaryNavItems = [
        { id: 'profile', label: 'Profile', icon: ICONS.userCircle },
    ];

    const renderView = () => {
        switch (activeView) {
            case 'tasks':
                return <TasksView />;
            case 'content_submission':
                return <ContentSubmissionView />;
            case 'collaboration':
                return <CollaborationView />;
            case 'payments':
                return <PaymentsView />;
            case 'performance':
                return <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Performance Tracking</h3>
                    <p className="text-slate-600">Performance metrics will be displayed here.</p>
                </div>;
            case 'profile':
                return <ProfileView />;
            case 'dashboard':
            default:
                return <DashboardView onEditTask={() => setActiveView('tasks')} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
            <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col no-scrollbar">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
                    <div className="text-white font-bold text-lg">Script Writer Panel</div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} active={activeView === item.id} onClick={() => setActiveView(item.id)} />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
                    {secondaryNavItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} active={activeView === item.id} onClick={() => setActiveView(item.id)} />
                    ))}
                    <button onClick={() => window.location.href = '/'} className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white mt-2">
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace('_', ' ')}</h1>
                    <div className="font-semibold">Rahul K.</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
            </div>
        </div>
    );
};

export default ScriptWriterPanel;
