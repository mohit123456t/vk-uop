
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
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
                // Fetch and set user profile data after login
                const userProfile = await checkUserProfile();
                if (userProfile) {
                    setProfile(userProfile); // Set profile data in state
                    if (userProfile.name && userProfile.brandName) {
                        // Profile is complete, go to dashboard
                        setActiveView('dashboard');
                    } else {
                        // Profile is incomplete, go to settings to complete profile
                        setActiveView('settings');
                    }
                } else {
                    // No profile found, go to settings
                    setActiveView('settings');
                }
            } else {
                // Comprehensive signup process
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Generate unique 4-digit brand ID
                const brandId = await generateUniqueBrandId();

                // Create complete profile data
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

                // Save profile to Firestore
                const profileDoc = doc(db, `users/${user.uid}/profile/main`);
                await setDoc(profileDoc, profileData);

                // Set profile data in state immediately after signup
                setProfile(profileData);

                // Set active view to dashboard since profile is now complete
                setActiveView('dashboard');
            }
            // Clear any selected campaign
            setSelectedCampaign(null);
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
        // For now, generate a simple 4-digit ID
        // In production, you might want to implement a more robust uniqueness check
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const brandId = ((timestamp + random) % 9000 + 1000).toString(); // 4-digit number

        return brandId;
    };

    const checkUserProfile = async () => {
        if (!user?.uid) return null;
        try {
            const profileDoc = doc(db, `users/${user.uid}/profile/main`);
            const profileSnap = await getDoc(profileDoc);
            if (profileSnap.exists()) {
                return profileSnap.data();
            }
            return null;
        } catch (err) {
            console.error('Error checking user profile:', err);
            return null;
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
                    console.log('Fetching user data for:', user.uid);

                    // Profile - First priority
                    const profileDoc = doc(db, `users/${user.uid}/profile/main`);
                    const profileSnap = await getDoc(profileDoc);
                    if (profileSnap.exists()) {
                        const profileData = profileSnap.data();
                        console.log('Profile data fetched:', profileData);
                        setProfile(profileData);
                    } else {
                        console.log('No profile found for user:', user.uid);
                    }

                    // Campaigns
                    const campaignsCol = collection(db, `users/${user.uid}/campaigns`);
                    const campaignsSnap = await getDocs(campaignsCol);
                    const campaignsList = campaignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log('Campaigns fetched:', campaignsList.length);
                    setCampaigns(campaignsList);

                    // Orders
                    const ordersCol = collection(db, `users/${user.uid}/orders`);
                    const ordersSnap = await getDocs(ordersCol);
                    const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log('Orders fetched:', ordersList.length);
                    setOrders(ordersList);

                } catch (err) {
                    console.error('Error fetching user data:', err);
                }
            } else {
                console.log('No user found, clearing data');
                setProfile({});
                setCampaigns([]);
                setOrders([]);
            }
        };
        fetchData();
    }, [user?.uid]); // Only depend on user.uid

    // Real-time profile listener
    useEffect(() => {
        if (user && user.uid) {
            console.log('Setting up real-time profile listener for:', user.uid);
            const profileDoc = doc(db, `users/${user.uid}/profile/main`);
            const unsubscribe = onSnapshot(profileDoc, (doc) => {
                if (doc.exists()) {
                    const profileData = doc.data();
                    console.log('Real-time profile update:', profileData);
                    setProfile(profileData);
                } else {
                    console.log('Profile document does not exist');
                }
            }, (error) => {
                console.error('Error in profile listener:', error);
            });
            return () => {
                console.log('Unsubscribing profile listener');
                unsubscribe();
            };
        }
    }, [user?.uid]);

    // Real-time campaigns listener
    useEffect(() => {
        if (user && user.uid) {
            const campaignsCol = collection(db, `users/${user.uid}/campaigns`);
            const unsubscribe = onSnapshot(campaignsCol, (snapshot) => {
                const campaignsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCampaigns(campaignsList);
            });
            return () => unsubscribe();
        }
    }, [user]);

    // Real-time orders listener
    useEffect(() => {
        if (user && user.uid) {
            const ordersCol = collection(db, `users/${user.uid}/orders`);
            const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
                const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(ordersList);
            });
            return () => unsubscribe();
        }
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
                // Save to user's campaigns subcollection
                const userCampaignsCol = collection(db, `users/${user.uid}/campaigns`);
                const userDocRef = await addDoc(userCampaignsCol, newCampaign);

                // Also save to global campaigns collection for admin visibility
                const globalCampaignsCol = collection(db, 'campaigns');
                const globalCampaignData = {
                    ...newCampaign,
                    brandId: user.uid,
                    brandName: profile.brandName || 'Unknown Brand',
                    createdAt: new Date().toISOString(),
                };
                await addDoc(globalCampaignsCol, globalCampaignData);

                setCampaigns(prev => [...prev, { ...newCampaign, id: userDocRef.id }]);
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
        { id: 'profile', label: 'Profile', icon: ICONS.userCircle },
        { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
        { id: 'billing', label: 'Billing', icon: ICONS.wallet },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const secondaryNavItems = [
        { id: 'support', label: 'Support', icon: ICONS.questionMark },
    ];

    const renderView = () => {
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
            case 'profile':
                return <ProfileView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} />;
            case 'dashboard':
            default:
                return <DashboardView
                    campaigns={campaigns}
                    profile={profile}
                    onNewCampaign={() => setShowNewCampaignForm(true)}
                    onNavigateToAnalytics={() => setActiveView('analytics')}
                    onNavigateToCampaigns={() => setActiveView('campaigns')}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
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
                                onClick={() => {
                                    setActiveView(item.id);
                                    setSelectedCampaign(null);
                                }}
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
