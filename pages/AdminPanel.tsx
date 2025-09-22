import React, { useState } from 'react';
import { ICONS } from '../constants';
import StaffManagementView from '../components/adminpanel/StaffManagementView';
import ProfileView from '../components/adminpanel/ProfileView';

const AdminPanel = () => {
    const [activeView, setActiveView] = useState('staff');

    const navItems = [
        { id: 'staff', title: 'Staff Management', icon: ICONS.users },
        { id: 'profile', title: 'Profile', icon: ICONS.user },
        // ... other nav items
    ];

    const renderView = () => {
        switch (activeView) {
            case 'staff':
                return <StaffManagementView />;
            case 'profile':
                return <ProfileView />;
            default:
                return <StaffManagementView />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-slate-700">
                    Admin Panel
                </div>
                <nav className="flex-1 p-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a href="#"
                                   onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                                   className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${activeView === item.id ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                                    {React.cloneElement(item.icon, { className: 'h-6 w-6 mr-3' })}
                                    <span>{item.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPanel;
