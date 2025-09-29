import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion } from 'framer-motion';

// THEME UPDATE: Status के रंगों को थीम के हिसाब से स्टाइल किया गया है
const statusColors = {
    Completed: 'bg-green-500/10 text-green-700 font-semibold',
    Pending: 'bg-yellow-500/10 text-yellow-700 font-semibold',
    Failed: 'bg-red-500/10 text-red-700 font-semibold',
};

const FinanceView = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state जोड़ा गया

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                // ध्यान दें: Firestore में पाथ 'admin/payments' नहीं, बल्कि 'admin' collection में 'payments' document हो सकता है।
                // अगर यह एक subcollection है तो पाथ `admin/${adminDocId}/payments` होगा।
                // मैं इसे 'payments' collection मानकर चल रहा हूँ।
                const querySnapshot = await getDocs(collection(db, 'payments'));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPayments(data);
            } catch (error) {
                console.error("Error fetching payments:", error);
            }
            setLoading(false);
        };
        fetchPayments();
    }, []);

    return (
        // THEME UPDATE: पूरे कंपोनेंट को एक ग्लास पैनल में डाला गया है
        <motion.div 
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-2xl font-bold text-slate-800 tracking-tighter mb-6">Payment Tracking</h2>
            
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                        {/* THEME UPDATE: टेबल हेडर को थीम के हिसाब से स्टाइल किया गया है */}
                        <thead className="border-b border-slate-300/50">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Brand Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount (₹)</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/50">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-white/30 transition-colors duration-200">
                                    <td className="px-4 py-3 font-medium text-slate-800">{payment.brandName}</td>
                                    <td className="px-4 py-3">{payment.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3">{payment.date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${statusColors[payment.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {payments.length === 0 && !loading && (
                <div className="p-12 text-center text-slate-500">
                    No payment records found.
                </div>
            )}
        </motion.div>
    );
};

export default FinanceView;