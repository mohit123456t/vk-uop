
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, doc, getDoc, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Logo from './Logo';
import { ICONS } from '../constants'; 
import DashboardView from './brandpanel/DashboardView';
import CampaignsView from './brandpanel/CampaignsView';
import AnalyticsView from './brandpanel/AnalyticsView';
import BillingView from './brandpanel/BillingView';
import SupportView from './brandpanel/SupportView';
import ProfileView from './brandpanel/ProfileView';
import CommunicationView from './brandpanel/CommunicationView';
import CampaignDetailView from './brandpanel/CampaignDetailView';
import NewCampaignForm from './brandpanel/NewCampaignForm';
import OrderForm from './brandpanel/OrderForm';
import PricingView from './brandpanel/PricingView';
const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${!label ? 'justify-center' : ''}`}
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

    // Signup form fields
    const [signupData, setSignupData] = useState({
        name: '',
        brandName: '',
        brandId: '',
        phone: '',
        company: '',
        website: '',
        industry: '',
        budget: '',
        goals: ''
    });

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
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const brandId = await generateUniqueBrandId();
                const profileData = {
                    uid: user.uid,
                    email: user.email,
                    name: signupData.name,
                    brandName: signupData.brandName,
                    brandId: brandId,
                    phone: signupData.phone,
                    company: signupData.company,
                    website: signupData.website,
                    industry: signupData.industry,
                    budget: signupData.budget,
                    goals: signupData.goals,
                    role: 'brand',
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    isProfileComplete: true
                };
                const profileDoc = doc(db, `users/${user.uid}`); // Save profile directly under users/UID
                await setDoc(profileDoc, profileData);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    const generateUniqueBrandId = async () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return ((timestamp + random) % 9000 + 1000).toString();
    };

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
    const [profile, setProfile] = useState({});

    useEffect(() => {
        localStorage.setItem('brandActiveView', activeView);
    }, [activeView]);

    useEffect(() => {
        localStorage.setItem('brandSelectedCampaign', JSON.stringify(selectedCampaign));
    }, [selectedCampaign]);

    // *** THE BIG FIX Part 1: All data is now fetched from the correct root collections ***
    useEffect(() => {
        if (!user?.uid) {
            setProfile({});
            setCampaigns([]);
            setOrders([]);
            return;
        }

        // Real-time profile listener
        const profileUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setProfile(doc.data());
            } else {
                console.log('Profile document does not exist');
            }
        }, (error) => console.error('Error in profile listener:', error));

        // Real-time campaigns listener
        const campaignsQuery = query(collection(db, 'campaigns'), where('brandId', '==', user.uid));
        const campaignsUnsubscribe = onSnapshot(campaignsQuery, (snapshot) => {
            const campaignsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampaigns(campaignsList);
        }, (error) => console.error('Error in campaign listener:', error));

        // Real-time orders listener
        const ordersQuery = query(collection(db, 'orders'), where('brandId', '==', user.uid));
        const ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersList);
        }, (error) => console.error('Error in order listener:', error));
        
        return () => {
            profileUnsubscribe();
            campaignsUnsubscribe();
            ordersUnsubscribe();
        };
    }, [user?.uid]);

    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setActiveView('campaign_detail');
    };
    
    const handleBackToCampaigns = () => {
        setSelectedCampaign(null);
        setActiveView('campaigns');
    };

    // *** THE BIG FIX Part 2: Creating campaigns in the correct collection ***
    const handleCreateCampaign = async (newCampaign) => {
        if (user && user.uid) {
            try {
                const campaignsCol = collection(db, 'campaigns');
                await addDoc(campaignsCol, {
                    ...newCampaign,
                    brandId: user.uid,
                    brandName: profile.brandName || 'Unknown Brand',
                    createdAt: new Date().toISOString(),
                    status: 'Pending Approval',
                });
            } catch (err) {
                console.error('Error saving campaign:', err);
            }
        }
        setShowNewCampaignForm(false);
    };

    // *** THE BIG FIX Part 3: Updating campaigns in the correct collection ***
    const handleUpdateCampaign = async (updatedCampaign) => {
        if (user && user.uid && updatedCampaign.id) {
            try {
                const campaignDoc = doc(db, 'campaigns', updatedCampaign.id);
                await updateDoc(campaignDoc, updatedCampaign);
            } catch (err) {
                console.error('Error updating campaign:', err);
            }
        }
    };

    const handleCreateOrder = async (newOrder) => {
        if (user && user.uid) {
            try {
                const ordersCol = collection(db, 'orders');
                await addDoc(ordersCol, {
                    ...newOrder,
                    brandId: user.uid,
                });
            } catch (err) {
                console.error('Error saving order:', err);
            }
        }
        setShowOrderForm(false);
    };

    const handleUpdateProfile = async (updatedProfile) => {
        if (user && user.uid) {
            try {
                const profileDoc = doc(db, 'users', user.uid);
                await updateDoc(profileDoc, updatedProfile);
            } catch (err) {
                console.error('Error saving profile:', err);
            }
        }
    };

    // Other handlers...
    const handleCancelNewCampaign = () => setShowNewCampaignForm(false);
    const handleCreateOrderForCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setShowOrderForm(true);
    };
    const handleCancelOrder = () => setShowOrderForm(false);
    const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.layout },
        { id: 'campaigns', label: 'Campaigns', icon: ICONS.folder },
        { id: 'pricing', label: 'Pricing', icon: ICONS.money },
        { id: 'profile', label: 'Profile', icon: ICONS.userCircle },
        { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
        { id: 'billing', label: 'Billing', icon: ICONS.wallet },
    ];

    const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: ICONS.questionMark },
    ];

    const renderView = () => {
        // View rendering logic remains largely the same
        if (selectedCampaign && activeView === 'campaign_detail') {
            return <CampaignDetailView campaignId={selectedCampaign.id} onClose={handleBackToCampaigns} onCreateOrder={() => setShowOrderForm(true)} />;
        }
        switch (activeView) {
            case 'campaigns':
                return <CampaignsView campaigns={campaigns} onSelectCampaign={handleSelectCampaign} onNewCampaign={() => setShowNewCampaignForm(true)} onCreateOrder={handleCreateOrderForCampaign} />;
            case 'pricing': return <PricingView />;
            case 'analytics': return <AnalyticsView campaigns={campaigns} />;
            case 'billing': return <BillingView user={user} />;
            case 'support': return <SupportView user={user} campaigns={campaigns} />;
            case 'profile': return <ProfileView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} />;
            case 'dashboard':
            default:
                return <DashboardView campaigns={campaigns} profile={profile} onNewCampaign={() => setShowNewCampaignForm(true)} onNavigateToAnalytics={() => setActiveView('analytics')} onNavigateToCampaigns={() => setActiveView('campaigns')} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
             {/* Sidebar & Header JSX remains the same */}
             <aside className={`bg-white text-slate-700 flex flex-col no-scrollbar transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-200 flex-shrink-0">
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
                                onClick={() => { setActiveView(item.id); setSelectedCampaign(null); }}
                            />
                        </div>
                    ))}
                </nav>
            <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0">
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
                    onClick={handleLogout}
                    className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 mt-2 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
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
