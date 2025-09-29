import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';
import NewCampaignForm from './NewCampaignForm';
import CampaignDetailView from './CampaignDetailView';
import { motion, AnimatePresence } from 'framer-motion';

// THEME UPDATE: StatusBadge को थीम के हिसाब से स्टाइल किया गया है
const StatusBadgeComponent = ({ status }) => {
    const statusClasses = {
        "Active": "bg-green-500/10 text-green-700 font-semibold",
        "Completed": "bg-slate-500/10 text-slate-600 font-semibold",
        "Pending Approval": "bg-yellow-500/10 text-yellow-700 font-semibold",
        "Draft": "bg-sky-500/10 text-sky-700 font-semibold",
        "Rejected": "bg-red-500/10 text-red-700 font-semibold",
    };
    return <span className={`text-xs px-2.5 py-1 rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const CampaignManagerView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [brandNames, setBrandNames] = useState({});
    const fetchedBrandsRef = useRef(new Set());
    
    // ... (Your data fetching logic remains unchanged)
    useEffect(() => {
        const fetchBrandNames = async () => {
            const uniqueBrandIds = [...new Set(campaigns.map(c => c.brandId).filter(id => typeof id === 'string'))];
            const newNames = {};
            for (const id of uniqueBrandIds) {
                if (!fetchedBrandsRef.current.has(id)) {
                    fetchedBrandsRef.current.add(id);
                    const userDoc = await getDoc(doc(db, 'users', id));
                    if (userDoc.exists()) {
                        newNames[id] = userDoc.data().brandName || 'Unknown Brand';
                    }
                }
            }
            if (Object.keys(newNames).length > 0) {
                setBrandNames(prev => ({ ...prev, ...newNames }));
            }
        };
        if (campaigns.length > 0) fetchBrandNames();
    }, [campaigns]);

    useEffect(() => {
        setLoading(true);
        const campaignsCollection = collection(db, 'campaigns');
        const q = filter !== 'All' ? query(campaignsCollection, where('status', '==', filter)) : campaignsCollection;
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [filter]);


    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Using AnimatePresence to handle modal animations
    return (
        <div className="space-y-6">
            <AnimatePresence>
                {selectedCampaign && <CampaignDetailView campaignId={selectedCampaign.id} onClose={() => setSelectedCampaign(null)} />}
                {showNewCampaignForm && <NewCampaignForm onCreateCampaign={() => setShowNewCampaignForm(false)} onCancel={() => setShowNewCampaignForm(false)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Campaign Manager</h1>
                    {/* THEME UPDATE: "New Campaign" बटन को थीम के हिसाब से स्टाइल किया गया है */}
                    <motion.button 
                        onClick={() => setShowNewCampaignForm(true)} 
                        className="flex items-center bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-lg shadow-indigo-500/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="mr-2">{ICONS.plus}</span> New Campaign
                    </motion.button>
                </div>
            </motion.div>

            {/* THEME UPDATE: फ़िल्टर और सर्च बार को ग्लास पैनल में डाला गया है */}
            <motion.div 
                className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <input
                    type="text"
                    placeholder="Search by campaign name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500"
                />
                <select onChange={(e) => setFilter(e.target.value)} value={filter} className="px-4 py-2.5 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Pending Approval</option>
                    <option>Completed</option>
                    <option>Rejected</option>
                    <option>Draft</option>
                </select>
            </motion.div>

            {loading ? <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div> : (
                // THEME UPDATE: टेबल को ग्लास पैनल में डाला गया है
                <motion.div 
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <table className="min-w-full">
                        <thead className="border-b border-slate-300/70">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Brand</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Budget</th>
                                <th scope="col" className="relative px-6 py-4"><span className="sr-only">View</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                            {filteredCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-white/30 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{campaign.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{brandNames[campaign.brandId] || campaign.brandName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadgeComponent status={campaign.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₹{campaign.budget?.toLocaleString() || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedCampaign(campaign)} className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-500/10 rounded-full hover:bg-indigo-500/20">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
};

export default CampaignManagerView;