import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import authService from '../../services/authService';

// Types
interface Payout {
    id: string;
    date: string;
    amount: number;
    status: string;
    reels: number;
    // Optional: link to task/campaign if available
    taskId?: string;
    campaign?: string;
}

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

// Simulate opening chat (you can replace this with real navigation/state update)
const openChatForTask = (taskId?: string, payoutId?: string) => {
    if (taskId) {
        alert(`Opening chat for Task: ${taskId}`);
        // In real app: navigate('/communication', { state: { selectedTaskId: taskId } })
    } else {
        alert(`Starting NEW chat about Payout: ${payoutId}\nParticipants: Editor, Admin, Finance`);
        // In real app: dispatch(createNewChat({ reference: payoutId, participants: [...] }))
    }
};

const EarningsView = () => {
    const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);
    const [userProfile, setUserProfile] = useState(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
                const earningsRef = collection(db, 'video_editor_earnings');
                const q = query(earningsRef, where('userId', '==', userProfile.uid));
                const querySnapshot = await getDocs(q);
                const fetchedEarnings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Payout[];
                setPayoutHistory(fetchedEarnings);
            } catch (error) {
                console.error('Error fetching earnings:', error);
            }
        };

        fetchEarnings();
    }, [userProfile]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                <p className="text-slate-600">Track your payments and chat instantly about any issues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Earned" value={`₹${payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`} icon={ICONS.currencyRupee} />
                <StatCard title="This Month (Pending)" value={`₹${payoutHistory.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`} icon={ICONS.chart} />
                <StatCard title="Avg. Per Reel" value={`₹${payoutHistory.length > 0 ? (payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0) / payoutHistory.reduce((sum, p) => sum + (p.reels || 0), 0)).toFixed(0) : 0}`} icon={ICONS.scissors} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <h3 className="font-bold text-lg p-6 text-slate-800 flex items-center">
                    Payout History
                    <span className="ml-2 text-sm font-normal text-slate-500">
                        Click any row to discuss with team
                    </span>
                </h3>
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Reels Edited</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payoutHistory.map(payout => (
                            <tr
                                key={payout.id}
                                className={`bg-white border-b hover:bg-blue-50 transition-colors cursor-pointer ${
                                    hoveredRow === payout.id ? 'bg-blue-50' : ''
                                }`}
                                onMouseEnter={() => setHoveredRow(payout.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                                onClick={() => openChatForTask(payout.taskId, payout.id)}
                            >
                                <td className="px-6 py-4 font-medium">{payout.date}</td>
                                <td className="px-6 py-4">
                                    {payout.reels} reel{payout.reels !== 1 && 's'}
                                    {payout.campaign && (
                                        <div className="text-xs text-slate-500 mt-1">for "{payout.campaign}"</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-semibold">₹{payout.amount?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                            payout.status === 'Paid'
                                                ? 'bg-green-100 text-green-800'
                                                : payout.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-slate-100 text-slate-800'
                                        }`}
                                    >
                                        {payout.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent row click
                                            openChatForTask(payout.taskId, payout.id);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center space-x-1"
                                    >
                                        <span>💬</span>
                                        <span>Chat</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State Suggestion */}
                {payoutHistory.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No payout history yet. Complete tasks to start earning!
                    </div>
                )}
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-4">
                    <div className="text-blue-600 text-2xl">💡</div>
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Need Help With Payments?</h4>
                        <p className="text-slate-600 text-sm mb-3">
                            Click “Chat” next to any payout to instantly connect with Admin or Finance Team.
                        </p>
                        <button
                            onClick={() => openChatForTask(undefined, 'GENERAL')}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            💬 Start General Payment Inquiry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsView;