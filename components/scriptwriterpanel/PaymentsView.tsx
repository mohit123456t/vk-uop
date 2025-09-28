import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Removed orderBy
import { db } from '../../services/firebase';

const PaymentsView = ({ userProfile }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        thisMonth: 0,
        bonus: 0,
        total: 0
    });

    useEffect(() => {
        if (userProfile?.email) {
            fetchPayments();
        }
    }, [userProfile]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const paymentsQuery = query(
                collection(db, 'payments'),
                where('scriptWriterEmail', '==', userProfile?.email)
                // orderBy('date', 'desc') // <-- This was causing the index error
            );
            const paymentsSnapshot = await getDocs(paymentsQuery);
            let paymentsData = paymentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort the data on the client-side instead of in the query
            paymentsData.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA; // For descending order
            });

            setPayments(paymentsData);

            // Calculate stats
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();

            const thisMonthPayments = paymentsData.filter((p: any) => {
                const paymentDate = new Date(p.date);
                return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
            });

            const totalThisMonth = thisMonthPayments.reduce((sum, p: any) => sum + (p.amount || 0), 0);
            const totalBonus = paymentsData.reduce((sum, p: any) => sum + (p.bonus || 0), 0);
            const totalEarned = paymentsData.reduce((sum, p: any) => sum + (p.amount || 0), 0);

            setStats({
                thisMonth: totalThisMonth,
                bonus: totalBonus,
                total: totalEarned
            });
        } catch (error) {
            console.error('Error fetching payments:', error);
            setPayments([]); // Set empty array on error
            setStats({
                thisMonth: 0,
                bonus: 0,
                total: 0
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                <p className="text-slate-600">Track your payments and bonuses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Earnings This Month</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Performance Bonus</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.bonus.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                    <p className="text-sm font-medium text-slate-500">Total Earned</p>
                    <p className="text-3xl font-bold text-slate-800">₹{stats.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg p-6 border-b text-slate-800">Payment History</h3>
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                            <p className="mt-2 text-slate-600">Loading payments...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-slate-600">No payments found</p>
                        </div>
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
                                {payments.map((p: any) => (
                                    <tr key={p.id} className="border-b">
                                        <td className="px-6 py-4">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold">₹{p.amount?.toLocaleString() || 0}</td>
                                        <td className="px-6 py-4 text-green-600">{p.status || 'Paid'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsView;
