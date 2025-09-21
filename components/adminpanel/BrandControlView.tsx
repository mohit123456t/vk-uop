
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Brand {
    id: string;
    name: string;
    status: string;
    campaigns: number;
    totalSpend: string;
}

const BrandControlView = ({ onViewBrand }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
            const brandsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Brand));
            setBrands(brandsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading brands...</div>;
    }

    return (
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Brand Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Active Campaigns</th>
                            <th className="px-6 py-3">Total Spend</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map(b => (
                            <tr key={b.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                                <td className="px-6 py-4">{b.status}</td>
                                <td className="px-6 py-4">{b.campaigns}</td>
                                <td className="px-6 py-4">{b.totalSpend}</td>
                                <td className="px-6 py-4 space-x-2">
                                     {b.status === 'Pending Verification' && (
                                        <button className="text-xs font-medium text-green-600 hover:underline">Verify</button>
                                    )}
                                    <button onClick={() => onViewBrand(b)} className="text-xs font-medium text-blue-600 hover:underline">View Details</button>
                                    <button className="text-xs font-medium text-slate-600 hover:underline">View Invoices</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BrandControlView;
