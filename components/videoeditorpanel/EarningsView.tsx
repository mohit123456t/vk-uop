
import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import authService from '../../services/authService';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <div className="text-slate-400 p-2 bg-slate-100 rounded-lg">{icon}</div>
        </div>
    </div>
);

const EarningsView = () => {
    const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, avgPerReel: 0 });
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((authState) => {
            if (authState.isAuthenticated && authState.userProfile) {
                fetchEarningsData(authState.userProfile.email);
            } else {
                setLoading(false);
                setError('User not authenticated.');
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchEarningsData = async (userEmail) => {
        setLoading(true);
        try {
            // Fetch approved tasks to calculate earnings
            const tasksQuery = query(
                collection(db, 'video_edit_tasks'),
                where('assignedTo', '==', userEmail),
                where('status', '==', 'Approved')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const approvedTasks = tasksSnapshot.docs.map(doc => doc.data());

            const totalEarned = approvedTasks.reduce((acc, task) => acc + (task.payment || 0), 0);
            const avgPerReel = approvedTasks.length > 0 ? totalEarned / approvedTasks.length : 0;

            // Calculate this month's earnings (from approved tasks)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonthEarned = approvedTasks
                .filter(task => {
                    const completedDate = new Date(task.completedAt);
                    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
                })
                .reduce((acc, task) => acc + (task.payment || 0), 0);

            setEarnings({
                total: totalEarned,
                thisMonth: thisMonthEarned,
                avgPerReel: avgPerReel
            });
            
            // Fetch payout history (assuming a structure)
            const payoutQuery = query(
                collection(db, 'payouts'), 
                where('userEmail', '==', userEmail)
            );
            const payoutSnapshot = await getDocs(payoutQuery);
            const history = payoutSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setPayoutHistory(history);

        } catch (err) {
            console.error("Error fetching earnings data: ", err);
            setError('Failed to fetch earnings data.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div className="text-center p-10">Loading earnings...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
                <p className="text-slate-600">Track your payments for video editing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Earned" value={`₹${earnings.total.toFixed(2)}`} icon={ICONS.currencyRupee} />
                <StatCard title="This Month" value={`₹${earnings.thisMonth.toFixed(2)}`} icon={ICONS.calendar} />
                <StatCard title="Avg. Per Reel" value={`₹${earnings.avgPerReel.toFixed(2)}`} icon={ICONS.chart} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <h3 className="font-bold text-lg p-6 text-slate-800">Payout History</h3>
                {payoutHistory.length === 0 ? (
                    <p className="text-center text-slate-500 pb-6">No payout history found.</p>
                ) : (
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutHistory.map(payout => (
                                <tr key={payout.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(payout.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold">₹{payout.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${payout.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EarningsView;
