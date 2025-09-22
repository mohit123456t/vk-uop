
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ICONS } from '../constants';
import DashboardView from './videoeditorpanel/DashboardView';
import AnalyticsView from './videoeditorpanel/AnalyticsView';
import EarningsView from './videoeditorpanel/EarningsView';
import ProfileView from './videoeditorpanel/ProfileView';
import CommunicationView from './videoeditorpanel/CommunicationView';
import AssignedTasks from './videoeditorpanel/AssignedTasks';
import authService from '../services/authService';

const NavItem = ({ icon, label, active, onClick, ...props }) => (
    <button {...props} onClick={onClick} className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);

const VideoEditorPanel = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                setUserProfile(authState.userProfile);
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'assigned_tasks', label: 'Assigned Tasks', icon: ICONS.clipboard },
        { id: 'communication', label: 'Communication', icon: ICONS.message },
        { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
        { id: 'earnings', label: 'Earnings', icon: ICONS.currencyRupee },
    ];

    const secondaryNavItems = [
        { id: 'profile', label: 'Profile & Settings', icon: ICONS.userCircle },
    ];

    const renderView = () => {
        switch (activeView) {
            case 'assigned_tasks':
                return <AssignedTasks />;
            case 'communication':
                return <CommunicationView />;
            case 'analytics':
                return <AnalyticsView />;
            case 'earnings':
                return <EarningsView />;
            case 'profile':
                return <ProfileView />;
            case 'dashboard':
            default:
                return <DashboardView />;
        }
    };

    const getHeaderText = () => {
        const currentItem = [...navItems, ...secondaryNavItems].find(item => item.id === activeView);
        return currentItem ? currentItem.label : 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
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
                     {secondaryNavItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} active={activeView === item.id} onClick={() => setActiveView(item.id)} />
                    ))}
                    <button onClick={() => navigate('/')} className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white mt-2">
                        <span className="mr-3">{ICONS.logout}</span>
                        Logout
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 capitalize">{getHeaderText()}</h1>
                    <div className="font-semibold">{userProfile ? userProfile.name : 'User'}</div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
            </div>
        </div>
    );
};

export default VideoEditorPanel;
