
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { ICONS } from '../../constants';
import NewCampaignForm from './NewCampaignForm';
import CampaignDetailView from './CampaignDetailView';

// --- NEW, IMPROVED UI COMPONENTS --- //

const StatusBadgeComponent = ({ status }) => {
    const statusConfig = {
        "Active": {
            classes: "bg-green-100 text-green-800 border-green-200",
            icon: <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
        },
        "Completed": {
            classes: "bg-slate-100 text-slate-700 border-slate-200",
            icon: ICONS.checkCircle
        },
        "Pending Approval": {
            classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: ICONS.clock
        },
        "Draft": {
            classes: "bg-blue-100 text-blue-800 border-blue-200",
            icon: ICONS.edit
        },
        "Rejected": {
            classes: "bg-red-100 text-red-800 border-red-200",
            icon: ICONS.xCircle
        },
    };
    const config = statusConfig[status] || { classes: "bg-gray-100 text-gray-800", icon: ICONS.help };

    return (
        <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${config.classes}`}>
            {React.isValidElement(config.icon) ? React.cloneElement(config.icon, {className: "h-3 w-3 mr-1.5"}) : config.icon}
            {status || 'Unknown'}
        </span>
    );
};

const CampaignCard = ({ campaign, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transform transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100/80">
        <div className="p-5">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800 pr-4">{campaign.name}</h3>
                <StatusBadgeComponent status={campaign.status} />
            </div>
            <p className="text-sm text-gray-500 mb-5">by <span className="font-semibold text-gray-600">{campaign.brandName}</span></p>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-semibold uppercase">BUDGET</p>
                    <p className="text-xl font-bold text-slate-800">₹{campaign.budget?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 font-semibold uppercase">REELS</p>
                    <p className="text-xl font-bold text-slate-800">{campaign.reels?.length || 0}</p>
                </div>
            </div>
        </div>
        <div className="bg-gray-50 px-5 py-2 text-center">
            <p className="text-xs font-mono text-gray-400">ID: {campaign.id}</p>
        </div>
    </div>
);


// --- MAIN VIEW --- //
const CampaignManagerView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);
        const campaignsCollection = collection(firestore, 'campaigns');
        
        const unsubscribe = onSnapshot(campaignsCollection, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampaigns(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching campaigns in real-time: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateCampaign = () => {
        setShowNewCampaignForm(false);
    };

    const handleCancelNewCampaign = () => {
        setShowNewCampaignForm(false);
    };

    const filteredCampaigns = campaigns
        .filter(campaign =>
            campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
            return dateB - dateA;
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                 <div>
                    <h1 className="text-4xl font-extrabold text-gray-800">Campaigns</h1>
                    <p className="text-gray-500 mt-1">Monitor all active and pending campaigns.</p>
                </div>
                <button onClick={() => setShowNewCampaignForm(true)} className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <span className="mr-2">{ICONS.plus}</span> New Campaign
                </button>
            </div>

            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     {ICONS.search && React.cloneElement(ICONS.search, {className: "h-5 w-5 text-gray-400"})}
                </div>
                <input
                    type="text"
                    placeholder="Search campaigns by name, brand or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} onClick={() => setSelectedCampaign(campaign)} />
                ))}
            </div>

            {filteredCampaigns.length === 0 && !loading && (
                <div className="text-center py-20 col-span-full">
                     <div className="text-gray-300 mb-4 mx-auto w-20 h-20">
                        {ICONS.search && React.cloneElement(ICONS.search, { className: "w-full h-full"})}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Campaigns Found</h3>
                    <p className="text-gray-500">Your search for "{searchTerm}" did not return any results.</p>
                </div>
            )}

            {showNewCampaignForm && (
                <NewCampaignForm onCreateCampaign={handleCreateCampaign} onCancel={handleCancelNewCampaign} />
            )}

            {selectedCampaign && (
                <CampaignDetailView
                    campaignId={selectedCampaign.id}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}
        </div>
    );
};

export default CampaignManagerView;
