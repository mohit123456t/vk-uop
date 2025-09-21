import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { ICONS } from '../../constants';

const StatusBadge = ({ status }) => {
    const statusClasses = {
        "Pending": "bg-yellow-100 text-yellow-800",
        "Scheduled": "bg-blue-100 text-blue-800",
        "Live": "bg-green-100 text-green-800",
        "Failed": "bg-red-100 text-red-800",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const ReelManagerView = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReels = async () => {
            const querySnapshot = await getDocs(collection(firestore, 'reels'));
            const reelsData = [];
            querySnapshot.forEach(doc => {
                reelsData.push({ id: doc.id, ...doc.data() });
            });
            setReels(reelsData);
            setLoading(false);
        };
        fetchReels();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <p className="text-center mt-4 text-slate-600">Loading reels...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Reel Manager</h1>
            {reels.length === 0 ? (
                <div className="text-center text-slate-500">No reels found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2">Reel ID</th>
                                <th className="px-4 py-2">Campaign</th>
                                <th className="px-4 py-2">Uploader</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Uploaded At</th>
                                <th className="px-4 py-2">Views</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reels.map(reel => (
                                <tr key={reel.id} className="border-b hover:bg-slate-100">
                                    <td className="px-4 py-2 font-mono">{reel.id}</td>
                                    <td className="px-4 py-2">{reel.campaignName || 'N/A'}</td>
                                    <td className="px-4 py-2">{reel.uploaderName || 'Unassigned'}</td>
                                    <td className="px-4 py-2"><StatusBadge status={reel.status} /></td>
                                    <td className="px-4 py-2">{reel.uploadedAt ? new Date(reel.uploadedAt).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-2">{reel.views || 0}</td>
                                    <td className="px-4 py-2">
                                        {/* Future: Add actions like view details, reassign uploader, etc. */}
                                        <button className="text-blue-600 hover:underline text-sm">View</button>
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

export default ReelManagerView;
