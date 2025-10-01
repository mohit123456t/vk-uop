import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';
import { ICONS } from '../../constants';
import { motion } from 'framer-motion';

// THEME UPDATE: StatCard को ग्लास थीम के लिए स्टाइल किया गया है
const StatCard = ({ title, value, icon }) => (
    <motion.div 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-600 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
            </div>
            <div className="text-slate-500 text-2xl p-2 rounded-lg bg-white/50">{icon}</div>
        </div>
    </motion.div>
);

const EarningsView = () => {
    const [earnings, setEarnings] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state जोड़ा गया

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
            setLoading(true);
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
            setLoading(false);
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
    <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Earnings & Payments</h1>
            <p className="text-slate-500 mt-1">Track your payments and performance bonuses.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Earned" value={`₹${totalEarned.toLocaleString()}`} icon={ICONS.currencyRupee} />
            <StatCard title="This Month's Earnings" value={`₹${thisMonthEarnings.toLocaleString()}`} icon={ICONS.chart} />
            <StatCard title="Next Payout Date" value="30 Sep" icon={ICONS.wallet} />
        </div>

        {/* THEME UPDATE: पेमेंट हिस्ट्री टेबल को ग्लास पैनल बनाया गया है */}
        <motion.div 
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <h3 className="font-bold text-lg p-6 text-slate-800 border-b border-slate-300/50">Payout History</h3>
            
            {loading ? (
                <div className="p-12 text-center text-slate-700">Loading history...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Payout ID</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                            {earnings.map(payout => (
                                <tr key={payout.id} className="hover:bg-white/30 transition-colors">
                                    <td className="px-6 py-4">{payout.date}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-800">{payout.id}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">₹{payout.amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-green-700 bg-green-500/10 px-2.5 py-1 rounded-full">{payout.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="font-medium text-indigo-600 hover:underline">View Statement</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {earnings.length === 0 && !loading && (
                <div className="p-12 text-center text-slate-500">No payout history found.</div>
            )}
        </motion.div>
    </motion.div>
    );
};

export default EarningsView;