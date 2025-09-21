
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, doc, getDoc } from 'firebase/firestore';
import { firestore as db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Logo from './Logo';
import { ICONS } from '../constants';

import DashboardView from './brandpanel/DashboardView';
import CampaignsView from './brandpanel/CampaignsView';
// import ContentSubmissionView from './brandpanel/ContentSubmissionView';
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
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            setActiveView('campaigns');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    const [activeView, setActiveView] = useState(() => {
        const saved = localStorage.getItem('brandActiveView');
        return saved || 'dashboard';
    });
    const [selectedCampaign, setSelectedCampaign] = useState(() => {
        const saved = localStorage.getItem('brandSelectedCampaign');
        return saved ? JSON.parse(saved) : null;
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState({});

    useEffect(() => {
        localStorage.setItem('brandActiveView', activeView);
    }, [activeView]);

    useEffect(() => {
        localStorage.setItem('brandSelectedCampaign', JSON.stringify(selectedCampaign));
    }, [selectedCampaign]);


    // Firestore se campaigns, orders, profile fetch karo jab user login ho
    useEffect(() => {
        const fetchData = async () => {
            if (user && user.uid) {
                try {
                    // Campaigns
                    const campaignsCol = collection(db, `users/${user.uid}/campaigns`);
                    const campaignsSnap = await getDocs(campaignsCol);
                    const campaignsList = campaignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCampaigns(campaignsList);

                    // Orders
                    const ordersCol = collection(db, `users/${user.uid}/orders`);
                    const ordersSnap = await getDocs(ordersCol);
                    const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setOrders(ordersList);

                    // Profile
                    const profileDoc = doc(db, `users/${user.uid}/profile/main`);
                    const profileSnap = await getDoc(profileDoc);
                    if (profileSnap.exists()) {
                        setProfile(profileSnap.data());
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                }
            }
        };
        fetchData();
    }, [user]);



    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setActiveView('campaign_detail');
    };
    
    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setActiveView('campaigns');
    };

    const handleUpload = (file, campaign) => {
        const newReel = {
            id: `R${Date.now()}`,
            views: 0,
            likes: 0,
            status: 'Uploaded',
            uploadedAt: new Date().toISOString()
        };
        const updatedCampaign = {
            ...campaign,
            reels: [...campaign.reels, newReel],
            reelsCount: campaign.reelsCount + 1
        };
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c));
        if (selectedCampaign && selectedCampaign.id === campaign.id) {
            setSelectedCampaign(updatedCampaign);
        }
    };

    // Naya campaign Firestore me save karo
    const handleCreateCampaign = async (newCampaign) => {
        if (user && user.uid) {
            try {
                const campaignsCol = collection(db, `users/${user.uid}/campaigns`);
                const docRef = await addDoc(campaignsCol, newCampaign);
                setCampaigns(prev => [...prev, { ...newCampaign, id: docRef.id }]);
            } catch (err) {
                console.error('Error saving campaign:', err);
            }
        }
        setShowNewCampaignForm(false);
    };

    const handleCancelNewCampaign = () => {
        setShowNewCampaignForm(false);
    };

    // Campaign update Firestore me bhi karo
    const handleUpdateCampaign = async (updatedCampaign) => {
        if (user && user.uid && updatedCampaign.id) {
            try {
                const campaignDoc = doc(db, `users/${user.uid}/campaigns/${updatedCampaign.id}`);
                await setDoc(campaignDoc, updatedCampaign);
            } catch (err) {
                console.error('Error updating campaign:', err);
            }
        }
        setCampaigns(prev => prev.map(campaign =>
            campaign.id === updatedCampaign.id ? updatedCampaign : campaign
        ));
        setSelectedCampaign(updatedCampaign);
    };

    // Naya order Firestore me save karo
    const handleCreateOrder = async (newOrder) => {
        if (user && user.uid) {
            try {
                const ordersCol = collection(db, `users/${user.uid}/orders`);
                const docRef = await addDoc(ordersCol, newOrder);
                setOrders(prev => [...prev, { ...newOrder, id: docRef.id }]);
            } catch (err) {
                console.error('Error saving order:', err);
            }
        }
        setShowOrderForm(false);
    };

    // Profile update Firestore me save karo
    const handleUpdateProfile = async (updatedProfile) => {
        if (user && user.uid) {
            try {
                const profileDoc = doc(db, `users/${user.uid}/profile/main`);
                await setDoc(profileDoc, updatedProfile);
                setProfile(updatedProfile);
            } catch (err) {
                console.error('Error saving profile:', err);
            }
        }
    };

    const handleCreateOrderForCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setShowOrderForm(true);
    };

    const handleCancelOrder = () => {
        setShowOrderForm(false);
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'campaigns', label: 'Campaigns', icon: ICONS.folder },
        { id: 'pricing', label: 'Pricing', icon: ICONS.money },

        { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
        { id: 'billing', label: 'Billing', icon: ICONS.wallet },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: ICONS.questionMark },
        { id: 'settings', label: 'Settings', icon: ICONS.settings },
    ];

    const renderView = () => {
        if (activeView === 'login') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-slate-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <div className="text-center mb-6">
                            <Logo />
                            <h2 className="text-2xl font-bold text-slate-900 mt-4">{isLogin ? 'Login' : 'Register'}</h2>
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAuth}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-600 hover:underline"
                            >
                                {isLogin ? 'Need to register?' : 'Already have an account?'}
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className="text-slate-600 hover:underline"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedCampaign && activeView === 'campaign_detail') {
            return <CampaignDetailView
                campaign={selectedCampaign}
                onBack={handleBackToCampaigns}
                onUpload={handleUpload}
                onUpdateCampaign={handleUpdateCampaign}
                onCreateOrder={() => setShowOrderForm(true)}
            />;
        }
        
        switch (activeView) {
            case 'campaigns':
                return <CampaignsView campaigns={campaigns} onSelectCampaign={handleSelectCampaign} onNewCampaign={() => setShowNewCampaignForm(true)} onCreateOrder={handleCreateOrderForCampaign} />;
            case 'pricing':
                return <PricingView />;
            // case 'content_submission':
            //     return <ContentSubmissionView />;
            case 'analytics':
                return <AnalyticsView campaigns={campaigns} />;
            case 'billing':
                return <BillingView user={user} />;
            case 'support':
                return <SupportView user={user} campaigns={campaigns} />;
            case 'settings':
                return <SettingsView user={user} />;
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
                        <div key={item.id}>
                            <NavItem
                                icon={item.icon}
                                label={sidebarCollapsed ? '' : item.label}
                                active={activeView === item.id}
                                onClick={() => {
                                    setActiveView(item.id);
                                    setSelectedCampaign(null);
                                }}
                            />
                        </div>
                    ))}
                </nav>
            <div className="px-4 py-4 border-t border-slate-800 flex-shrink-0">
                 {secondaryNavItems.map(item => (
                    <div key={item.id}>
                        <NavItem
                            icon={item.icon}
                            label={sidebarCollapsed ? '' : item.label}
                            active={activeView === item.id}
                            onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                        />
                    </div>
                ))}
                <button
                    onClick={() => signOut(auth)}
                    className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white mt-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                    <span className="mr-3">{ICONS.logout}</span>
                    {!sidebarCollapsed && <span>Logout</span>}
                </button>
            </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleSidebar}
                            className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
                            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? ICONS.menu : ICONS.x}
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView.replace('_', ' ')}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-slate-500 hover:text-slate-900">{ICONS.bell}</button>
                        <button className="text-slate-500 hover:text-slate-900">{ICONS.userCircle}</button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-100 p-8">{renderView()}</main>
            </div>
            {showNewCampaignForm && (
                <NewCampaignForm
                    onCreateCampaign={handleCreateCampaign}
                    onCancel={handleCancelNewCampaign}
                />
            )}
            {showOrderForm && selectedCampaign && (
                <OrderForm
                    campaign={selectedCampaign}
                    onCreateOrder={handleCreateOrder}
                    onCancel={handleCancelOrder}
                />
            )}
        </div>
    );
};

export default BrandPanel;
