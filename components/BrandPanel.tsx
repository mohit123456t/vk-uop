import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore as db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import authService, { UserProfile } from '../services/authService';
import Logo from './Logo';
import { ICONS } from '../constants';

import DashboardView from './brandpanel/DashboardView';
import CampaignsView from './brandpanel/CampaignsView';
import AnalyticsView from './brandpanel/AnalyticsView';
import BillingView from './brandpanel/BillingView';
import SupportView from './brandpanel/SupportView';
import SettingsView from './brandpanel/SettingsView';
import CampaignDetailView from './brandpanel/CampaignDetailView';
import NewCampaignForm from './brandpanel/NewCampaignForm';
import OrderForm from './brandpanel/OrderForm';
import PricingView from './brandpanel/PricingView';

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

const BrandPanel = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeView, setActiveView] = useState(() => localStorage.getItem('brandActiveView') || 'dashboard');
    const [selectedCampaign, setSelectedCampaign] = useState(() => {
        const saved = localStorage.getItem('brandSelectedCampaign');
        return saved ? JSON.parse(saved) : null;
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                if (state.userProfile.role === 'brand') {
                    setUserProfile(state.userProfile);
                } else {
                    // If logged in but not a brand, redirect to a generic page or show an error
                    navigate('/role-login'); // Or a dedicated 'unauthorized' page
                }
            } else if (!state.isLoading) {
                // Only navigate if not loading and not authenticated
                navigate('/role-login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem('brandActiveView', activeView);
    }, [activeView]);

    useEffect(() => {
        localStorage.setItem('brandSelectedCampaign', JSON.stringify(selectedCampaign));
    }, [selectedCampaign]);

    useEffect(() => {
        const fetchData = async () => {
            if (userProfile?.uid) {
                try {
                    const campaignsCol = collection(db, `users/${userProfile.uid}/campaigns`);
                    const campaignsSnap = await getDocs(campaignsCol);
                    setCampaigns(campaignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                    const ordersCol = collection(db, `users/${userProfile.uid}/orders`);
                    const ordersSnap = await getDocs(ordersCol);
                    setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (err) {
                    console.error('Error fetching user data:', err);
                }
            }
        };
        fetchData();
    }, [userProfile]);

    const handleUpdateProfile = async (updatedProfileData) => {
        if (userProfile?.uid) {
            try {
                const userDocRef = doc(db, `users`, userProfile.uid);
                await updateDoc(userDocRef, updatedProfileData);
                setUserProfile(prev => prev ? { ...prev, ...updatedProfileData } : null);
            } catch (err) {
                console.error('Error saving profile:', err);
                throw err; 
            }
        }
    };

    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setActiveView('campaign_detail');
    };
    
    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setActiveView('campaigns');
    };

    const handleCreateCampaign = async (newCampaign) => {
        if (userProfile?.uid) {
            const campaignsCol = collection(db, `users/${userProfile.uid}/campaigns`);
            const docRef = await addDoc(campaignsCol, newCampaign);
            setCampaigns(prev => [...prev, { ...newCampaign, id: docRef.id }]);
        }
        setShowNewCampaignForm(false);
    };

    const handleUpdateCampaign = async (updatedCampaign) => {
        if (userProfile?.uid && updatedCampaign.id) {
            const campaignDoc = doc(db, `users/${userProfile.uid}/campaigns/${updatedCampaign.id}`);
            await setDoc(campaignDoc, updatedCampaign);
            setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
            setSelectedCampaign(updatedCampaign);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'campaigns', label: 'Campaigns', icon: ICONS.folder },
        { id: 'pricing', label: 'Pricing', icon: ICONS.money },
        { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
        { id: 'billing', label: 'Billing', icon: ICONS.wallet },
    ];

    const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: ICONS.questionMark },
        { id: 'settings', label: 'Settings', icon: ICONS.settings },
    ];

    const renderView = () => {
        if (!userProfile) return <div className="flex items-center justify-center h-full">Loading...</div>;

        if (selectedCampaign && activeView === 'campaign_detail') {
            return <CampaignDetailView
                campaign={selectedCampaign}
                onBack={handleBackToCampaigns}
                onUpdateCampaign={handleUpdateCampaign}
                onCreateOrder={() => setShowOrderForm(true)}
            />;
        }
        
        switch (activeView) {
            case 'campaigns':
                return <CampaignsView campaigns={campaigns} onSelectCampaign={handleSelectCampaign} onNewCampaign={() => setShowNewCampaignForm(true)} />; 
            case 'pricing':
                return <PricingView />;
            case 'analytics':
                return <AnalyticsView campaigns={campaigns} />;
            case 'billing':
                return <BillingView user={userProfile} />;
            case 'support':
                return <SupportView user={userProfile} campaigns={campaigns} />;
            case 'settings':
                return <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />;
            case 'dashboard':
            default:
                return <DashboardView
                    campaigns={campaigns}
                    onNewCampaign={() => setShowNewCampaignForm(true)}
                    onNavigateToAnalytics={() => setActiveView('analytics')}
                    onNavigateToCampaigns={() => setActiveView('campaigns')}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
            <aside className={`bg-slate-900 text-slate-300 flex flex-col no-scrollbar transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
                    <div className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        <Logo />
                    </div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={sidebarCollapsed ? '' : item.label}
                            active={activeView === item.id}
                            onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                        />
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
                    {secondaryNavItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={sidebarCollapsed ? '' : item.label}
                            active={activeView === item.id}
                            onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                        />
                    ))}
                    <button
                        onClick={() => authService.signOutUser()}
                        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white mt-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="mr-3">{ICONS.logout}</span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarCollapsed(p => !p)}
                            className="text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? ICONS.menu : ICONS.x}
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace('_', ' ')}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-slate-500 hover:text-slate-900">{ICONS.bell}</button>
                         <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-600">
                           {userProfile?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</div>
            </main>
            {showNewCampaignForm && (
                <NewCampaignForm
                    onCreateCampaign={handleCreateCampaign}
                    onCancel={() => setShowNewCampaignForm(false)}
                />
            )}
            {showOrderForm && selectedCampaign && (
                <OrderForm
                    campaign={selectedCampaign}
                    onCreateOrder={async (order) => {
                        if (userProfile?.uid) {
                            const ordersCol = collection(db, `users/${userProfile.uid}/orders`);
                            await addDoc(ordersCol, order);
                            setShowOrderForm(false);
                        }
                    }}
                    onCancel={() => setShowOrderForm(false)}
                />
            )}
        </div>
    );
};

export default BrandPanel;
