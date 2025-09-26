
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <div className="text-slate-400">{icon}</div>
        </div>
    </div>
);

const EarningsView = () => {
    const [earnings, setEarnings] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.userProfile) {
                setUserProfile(state.userProfile);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userProfile) return;

        const fetchEarnings = async () => {
            try {
                const earningsRef = collection(db, 'uploader_earnings');
                const q = query(earningsRef, where('userId', '==', userProfile.uid));
                const querySnapshot = await getDocs(q);
                const fetchedEarnings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEarnings(fetchedEarnings);
            } catch (error) {
                console.error('Error fetching earnings:', error);
            }
        };

        fetchEarnings();
    }, [userProfile]);

    const totalEarned = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    const thisMonthEarnings = earnings.filter(e => {
        const date = new Date(e.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
    <div className="space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings & Payments</h1>
            <p className="text-slate-600">Track your payments and performance bonuses.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Earned" value={`₹${totalEarned.toLocaleString()}`} icon={ICONS.currencyRupee} />
            <StatCard title="This Month's Earnings" value={`₹${thisMonthEarnings.toLocaleString()}`} icon={ICONS.chart} />
            <StatCard title="Next Payout Date" value="Aug 30" icon={ICONS.wallet} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <h3 className="font-bold text-lg p-6 text-slate-800">Payout History</h3>
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Payout ID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                         <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {earnings.map(payout => (
                        <tr key={payout.id} className="bg-white border-b">
                            <td className="px-6 py-4">{payout.date}</td>
                            <td className="px-6 py-4 font-medium">{payout.id}</td>
                            <td className="px-6 py-4 font-semibold">₹{payout.amount?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-green-600">{payout.status}</td>
                            <td className="px-6 py-4 text-right"><button className="font-medium text-slate-600 hover:underline">View Statement</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

export default EarningsView;
