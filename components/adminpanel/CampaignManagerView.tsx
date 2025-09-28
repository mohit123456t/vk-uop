import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ICONS } from '../../constants';
import NewCampaignForm from './NewCampaignForm';
import CampaignDetailView from './CampaignDetailView';

const StatusBadgeComponent = ({ status }) => {
    const statusClasses = {
        "Active": "bg-green-100 text-green-800",
        "Completed": "bg-slate-200 text-slate-800",
        "Pending Approval": "bg-yellow-100 text-yellow-800",
        "Draft": "bg-blue-100 text-blue-800",
        "Rejected": "bg-red-100 text-red-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const CampaignManagerView = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        setLoading(true);
        let q = collection(db, 'campaigns');
        if (filter !== 'All') {
            q = query(q, where('status', '==', filter));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampaigns(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching campaigns:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [filter]);

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCampaign) {
        return <CampaignDetailView campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
    }

    if (showNewCampaignForm) {
        return <NewCampaignForm onBack={() => setShowNewCampaignForm(false)} />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Campaign Manager</h1>
                <button onClick={() => setShowNewCampaignForm(true)} className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl text-sm hover:from-blue-600 hover:to-purple-700 shadow-lg">
                    <span className="mr-2">{ICONS.plus}</span> New Campaign
                </button>
            </div>

            <div className="flex items-center justify-between gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by campaign name, ID, or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                />
                <select onChange={(e) => setFilter(e.target.value)} value={filter} className="px-4 py-3 border border-slate-300 rounded-lg">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {loading ? <div className="text-center p-8">Loading campaigns...</div> : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredCampaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{campaign.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{campaign.brandName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadgeComponent status={campaign.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₹{campaign.budget?.toLocaleString() || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedCampaign(campaign)} className="text-blue-600 hover:text-blue-800">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CampaignManagerView;
